import mongoose, { Types } from 'mongoose';
import { CustomerModel } from '../../infrastructure/database/models/CustomerModel';
import { OrderModel } from '../../infrastructure/database/models/OrderModel';
import { TransactionModel } from '../../infrastructure/database/models/TransactionModel';
import { LoyaltyAccountModel } from '../../infrastructure/database/models/LoyaltyAccountModel';
import { LoyaltyTransactionModel } from '../../infrastructure/database/models/LoyaltyTransactionModel';
import { logger } from '../../shared/utils/logger';

type LightCustomer = {
  _id: Types.ObjectId;
  business_id: Types.ObjectId;
  name?: string;
  email?: string;
  phoneNumber?: string;
  rewards?: number;
  notes?: string;
  isActive?: boolean;
  opted_into_loyalty?: boolean;
  accepts_marketing_messages?: boolean;
  accepts_order_updates?: boolean;
  last_order_at?: Date | null;
  address?: any;
  created_at?: Date;
  updated_at?: Date;
};

export interface CustomerDedupeOptions {
  dryRun?: boolean;
}

export interface CustomerDedupeSummary {
  customersScanned: number;
  duplicateGroupsFound: number;
  groupsProcessed: number;
  duplicateCustomersAffected: number;
}

function normalizeDigits(phone: unknown): string {
  return String(phone || '').replace(/\D/g, '');
}

function normalizeForGrouping(phone: unknown): string {
  const digits = normalizeDigits(phone);
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1);
  }
  return digits;
}

function toStoredCanonicalPhone(phone: unknown): string {
  const digits = normalizeDigits(phone);
  if (!digits) return '';
  if (digits.length === 10) return `1${digits}`;
  return digits;
}

function isPlaceholderEmail(email?: string): boolean {
  if (!email) return true;
  const lower = email.toLowerCase();
  return lower.endsWith('@guest.local') || lower.endsWith('@placeholder.com');
}

function isGuestName(name?: string): boolean {
  if (!name) return true;
  return name.trim().toLowerCase() === 'guest';
}

function pickBestName(customers: LightCustomer[]): string | undefined {
  const named = customers
    .map((c) => c.name?.trim())
    .filter((name): name is string => Boolean(name && !isGuestName(name)));
  if (!named.length) {
    return customers.find((c) => c.name?.trim())?.name?.trim();
  }
  return named.sort((a, b) => b.length - a.length)[0];
}

function pickBestEmail(customers: LightCustomer[]): string | undefined {
  const withEmail = customers
    .filter((c) => c.email?.trim())
    .sort(
      (a, b) =>
        new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime(),
    );
  const real = withEmail.find((c) => !isPlaceholderEmail(c.email));
  return (real || withEmail[0])?.email?.trim().toLowerCase();
}

function pickBestAddress(customers: LightCustomer[]): any {
  const withAddress = customers.find((c) => c.address && Object.keys(c.address || {}).length);
  return withAddress?.address;
}

function uniqueJoinedNotes(customers: LightCustomer[]): string | undefined {
  const set = new Set(
    customers
      .map((c) => (c.notes || '').trim())
      .filter((n) => Boolean(n)),
  );
  if (!set.size) return undefined;
  return [...set].join('\n');
}

function selectPrimary(customers: LightCustomer[], orderCountMap: Map<string, number>): LightCustomer {
  return [...customers].sort((a, b) => {
    const ao = orderCountMap.get(String(a._id)) || 0;
    const bo = orderCountMap.get(String(b._id)) || 0;
    if (bo !== ao) return bo - ao;

    const al = new Date(a.last_order_at || 0).getTime();
    const bl = new Date(b.last_order_at || 0).getTime();
    if (bl !== al) return bl - al;

    const au = new Date(a.updated_at || 0).getTime();
    const bu = new Date(b.updated_at || 0).getTime();
    if (bu !== au) return bu - au;

    return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
  })[0];
}

async function getOrderCounts(customerIds: Types.ObjectId[]) {
  const rows = await OrderModel.aggregate([
    { $match: { customer_id: { $in: customerIds } } },
    { $group: { _id: '$customer_id', count: { $sum: 1 } } },
  ]);
  const map = new Map<string, number>();
  rows.forEach((r) => map.set(String(r._id), Number(r.count || 0)));
  return map;
}

async function mergeGroup(group: LightCustomer[], dryRun: boolean) {
  const customerIds = group.map((c) => c._id);
  const orderCountMap = await getOrderCounts(customerIds);
  const primary = selectPrimary(group, orderCountMap);
  const duplicates = group.filter((c) => String(c._id) !== String(primary._id));
  const duplicateIds = duplicates.map((d) => d._id);

  const mergedName = pickBestName(group);
  const mergedEmail = pickBestEmail(group);
  const mergedPhone =
    toStoredCanonicalPhone(primary.phoneNumber) ||
    toStoredCanonicalPhone(group[0].phoneNumber);
  const mergedNotes = uniqueJoinedNotes(group);
  const mergedAddress = pickBestAddress(group);
  const mergedRewards = group.reduce((sum, c) => sum + Number(c.rewards || 0), 0);
  const mergedLastOrder = group
    .map((c) => c.last_order_at)
    .filter((d): d is Date => Boolean(d))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const summary = {
    businessId: String(primary.business_id),
    normalizedPhone: normalizeForGrouping(primary.phoneNumber),
    primaryCustomerId: String(primary._id),
    duplicateCustomerIds: duplicateIds.map(String),
    duplicateCount: duplicates.length,
  };

  if (dryRun) {
    return summary;
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await OrderModel.updateMany(
        { customer_id: { $in: duplicateIds } },
        { $set: { customer_id: primary._id } },
        { session },
      );

      await TransactionModel.updateMany(
        { customer_id: { $in: duplicateIds } },
        { $set: { customer_id: primary._id } },
        { session },
      );

      const primaryAccount = await LoyaltyAccountModel.findOne(
        { customer_id: primary._id },
        null,
        { session },
      );
      const duplicateAccounts = await LoyaltyAccountModel.find(
        { customer_id: { $in: duplicateIds } },
        null,
        { session },
      );

      if (duplicateAccounts.length) {
        let targetAccount = primaryAccount;
        if (!targetAccount) {
          targetAccount = duplicateAccounts[0];
          targetAccount.customer_id = primary._id;
          await targetAccount.save({ session });
        }

        const toMerge = duplicateAccounts.filter(
          (acc) => String(acc._id) !== String(targetAccount!._id),
        );

        for (const account of toMerge) {
          await LoyaltyTransactionModel.updateMany(
            { loyalty_account_id: account._id },
            { $set: { loyalty_account_id: targetAccount!._id } },
            { session },
          );

          targetAccount!.points_balance += Number(account.points_balance || 0);
          targetAccount!.total_points_earned += Number(account.total_points_earned || 0);
          targetAccount!.total_points_redeemed += Number(account.total_points_redeemed || 0);

          await LoyaltyAccountModel.deleteOne({ _id: account._id }, { session });
        }

        await targetAccount.save({ session });
      }

      await CustomerModel.updateOne(
        { _id: primary._id },
        {
          $set: {
            ...(mergedName ? { name: mergedName } : {}),
            ...(mergedEmail ? { email: mergedEmail } : {}),
            ...(mergedPhone ? { phoneNumber: mergedPhone } : {}),
            ...(mergedNotes ? { notes: mergedNotes } : {}),
            ...(mergedAddress ? { address: mergedAddress } : {}),
            rewards: mergedRewards,
            isActive: group.some((c) => c.isActive !== false),
            opted_into_loyalty: group.some((c) => c.opted_into_loyalty),
            accepts_marketing_messages: group.some(
              (c) => c.accepts_marketing_messages !== false,
            ),
            accepts_order_updates: group.some((c) => c.accepts_order_updates !== false),
            ...(mergedLastOrder ? { last_order_at: mergedLastOrder } : {}),
          },
        },
        { session },
      );

      await CustomerModel.deleteMany({ _id: { $in: duplicateIds } }, { session });
    });
  } finally {
    await session.endSession();
  }

  return summary;
}

let jobTimer: NodeJS.Timeout | null = null;
let jobInProgress = false;

export async function runCustomerDedupe(
  options: CustomerDedupeOptions = {},
): Promise<CustomerDedupeSummary> {
  const dryRun = options.dryRun ?? true;

  const customers = (await CustomerModel.find(
    { phoneNumber: { $exists: true, $ne: '' } },
    {
      business_id: 1,
      name: 1,
      email: 1,
      phoneNumber: 1,
      rewards: 1,
      notes: 1,
      isActive: 1,
      opted_into_loyalty: 1,
      accepts_marketing_messages: 1,
      accepts_order_updates: 1,
      last_order_at: 1,
      address: 1,
      created_at: 1,
      updated_at: 1,
    },
  ).lean()) as unknown as LightCustomer[];

  const groups = new Map<string, LightCustomer[]>();
  for (const customer of customers) {
    const normalized = normalizeForGrouping(customer.phoneNumber);
    if (!normalized) continue;
    const key = `${String(customer.business_id)}:${normalized}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(customer);
  }

  const duplicateGroups = [...groups.values()].filter((group) => group.length > 1);
  let groupsProcessed = 0;
  let duplicateCustomersAffected = 0;

  for (const group of duplicateGroups) {
    const result = await mergeGroup(group, dryRun);
    groupsProcessed += 1;
    duplicateCustomersAffected += result.duplicateCount;
  }

  return {
    customersScanned: customers.length,
    duplicateGroupsFound: duplicateGroups.length,
    groupsProcessed,
    duplicateCustomersAffected,
  };
}

export function startCustomerDedupeJob(options: {
  enabled: boolean;
  intervalMinutes: number;
  runOnStart: boolean;
}) {
  if (!options.enabled) {
    logger.info('[CustomerDedupe] Periodic merge job is disabled');
    return;
  }

  const intervalMs = Math.max(5, options.intervalMinutes) * 60 * 1000;
  logger.info(
    `[CustomerDedupe] Periodic merge job enabled (every ${Math.max(
      5,
      options.intervalMinutes,
    )} minutes)`,
  );

  const runApply = async () => {
    if (jobInProgress) {
      logger.warn('[CustomerDedupe] Previous run still in progress, skipping this tick');
      return;
    }
    jobInProgress = true;
    try {
      const summary = await runCustomerDedupe({ dryRun: false });
      logger.info(
        `[CustomerDedupe] Run completed: scanned=${summary.customersScanned}, groups=${summary.duplicateGroupsFound}, merged=${summary.duplicateCustomersAffected}`,
      );
    } catch (error: any) {
      logger.error(`[CustomerDedupe] Run failed: ${error?.message || error}`);
    } finally {
      jobInProgress = false;
    }
  };

  if (options.runOnStart) {
    void runApply();
  }

  jobTimer = setInterval(() => {
    void runApply();
  }, intervalMs);
}

export function stopCustomerDedupeJob() {
  if (jobTimer) {
    clearInterval(jobTimer);
    jobTimer = null;
  }
}
