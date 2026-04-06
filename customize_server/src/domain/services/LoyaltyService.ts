import { ILoyaltyProgramRepository } from '../repositories/ILoyaltyProgramRepository';
import { ILoyaltyAccountRepository } from '../repositories/ILoyaltyAccountRepository';
import { ILoyaltyTransactionRepository } from '../repositories/ILoyaltyTransactionRepository';
import { UpsertLoyaltyProgramDTO, LoyaltyProgram } from '../entities/LoyaltyProgram';
import { LoyaltyAccount } from '../entities/LoyaltyAccount';
import { Order } from '../entities/Order';
import { CustomerModel } from '../../infrastructure/database/models/CustomerModel';
import { BusinessRepository } from '../../infrastructure/repositories/BusinessRepository';

export class LoyaltyService {
  private businessRepository = new BusinessRepository();
  private readonly minPhoneDigits = 7;

  constructor(
    private programRepo: ILoyaltyProgramRepository,
    private accountRepo: ILoyaltyAccountRepository,
    private transactionRepo: ILoyaltyTransactionRepository
  ) {}

  private normalizePhone(phone: string): string {
    if (!phone) return '';
    // Strip everything except digits
    return phone.replace(/\D/g, '');
  }

  private isValidPhone(phone: string): boolean {
    return this.normalizePhone(phone).length >= this.minPhoneDigits;
  }

  private isPlaceholderName(name?: string): boolean {
    const normalizedName = String(name || '').trim().toLowerCase();
    return !normalizedName || normalizedName === 'guest' || normalizedName === 'guest customer';
  }

  private getComparablePhoneVariants(phone: string): string[] {
    const normalizedPhone = this.normalizePhone(phone);
    if (!normalizedPhone) return [];

    const variants = new Set([normalizedPhone]);

    if (normalizedPhone.length === 11 && normalizedPhone.startsWith('1')) {
      variants.add(normalizedPhone.slice(1));
    }

    if (normalizedPhone.length === 10) {
      variants.add(`1${normalizedPhone}`);
    }

    return Array.from(variants);
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private buildFlexiblePhoneRegex(digits: string): RegExp | null {
    if (!digits) return null;
    return new RegExp(`^\\D*${digits.split('').map((digit) => this.escapeRegex(digit)).join('\\D*')}\\D*$`);
  }

  private phonesMatch(inputPhone: string, storedPhone: string): boolean {
    const inputVariants = new Set(this.getComparablePhoneVariants(inputPhone));
    const storedVariants = this.getComparablePhoneVariants(storedPhone);
    return storedVariants.some((variant) => inputVariants.has(variant));
  }

  private async findCustomerByPhone(business_id: string, phone: string) {
    const rawPhone = String(phone || '').trim();
    const comparableVariants = this.getComparablePhoneVariants(phone);
    const exactCandidates = Array.from(new Set([rawPhone, ...comparableVariants].filter(Boolean)));
    const regexCandidates = comparableVariants
      .map((variant) => this.buildFlexiblePhoneRegex(variant))
      .filter(Boolean) as RegExp[];

    if (exactCandidates.length === 0 && regexCandidates.length === 0) {
      return null;
    }

    const phoneQueries: Array<Record<string, unknown>> = [];

    if (exactCandidates.length > 0) {
      phoneQueries.push({ phoneNumber: { $in: exactCandidates } });
    }

    regexCandidates.forEach((regex) => {
      phoneQueries.push({ phoneNumber: regex });
    });

    const possibleCustomers = await CustomerModel.find({
      business_id,
      $or: phoneQueries,
    })
      .sort({ updated_at: -1, created_at: -1 })
      .limit(10);

    return (
      possibleCustomers.find((customer) => this.phonesMatch(rawPhone, customer.phoneNumber || '')) ||
      null
    );
  }

  private isPlaceholderEmail(email?: string): boolean {
    if (!email) return true;
    const lower = email.toLowerCase();
    return lower.endsWith('@guest.local') || lower.endsWith('@placeholder.com');
  }

  private buildPhoneCandidates(phone: string): { normalizedPhone: string; candidates: string[] } {
    const normalizedPhone = this.normalizePhone(phone);
    const rawPhone = String(phone || '').trim();
    const candidates = Array.from(new Set([normalizedPhone, rawPhone].filter(Boolean)));

    return { normalizedPhone, candidates };
  }

  private async getActiveBusinessId(): Promise<string> {
    const business = await this.businessRepository.findOne();

    if (!business?.id) {
      throw new Error('Store configuration error: business information not found. Please contact support.');
    }

    return business.id;
  }

  async getProgramSettings(): Promise<LoyaltyProgram | null> {
    return this.programRepo.get();
  }

  async upsertProgramSettings(data: UpsertLoyaltyProgramDTO): Promise<LoyaltyProgram> {
    return this.programRepo.upsert(data);
  }

  async joinLoyalty(data: { phone: string; name: string; email?: string }): Promise<LoyaltyAccount> {
    const normalizedPhone = this.normalizePhone(data.phone);
    if (!this.isValidPhone(normalizedPhone)) throw new Error('Valid phone number is required');

    const program = await this.getProgramSettings();
    if (!program?.is_active) {
      throw new Error('Loyalty program is not active');
    }

    const business_id = await this.getActiveBusinessId();
    const trimmedName = (data.name || '').trim();
    const normalizedEmail = (data.email || '').trim().toLowerCase();

    // Scope by the public storefront business so a matching phone from another tenant cannot be reused.
    let customer = await this.findCustomerByPhone(business_id, data.phone);

    if (!customer) {
      if (!trimmedName) throw new Error('Customer name is required for new loyalty members');

      customer = await CustomerModel.create({
        phoneNumber: normalizedPhone,
        name: trimmedName,
        email: normalizedEmail || `${normalizedPhone}@placeholder.com`,
        isActive: true,
        business_id,
        opted_into_loyalty: true,
      });
    } else {
      const updates: Record<string, unknown> = {};

      // Normalize legacy phone formatting after we have matched the customer.
      if (customer.phoneNumber !== normalizedPhone) {
        updates.phoneNumber = normalizedPhone;
      }

      if (trimmedName && this.isPlaceholderName(customer.name)) {
        updates.name = trimmedName;
      }

      if (normalizedEmail && this.isPlaceholderEmail(customer.email)) {
        updates.email = normalizedEmail;
      }

      if (!customer.opted_into_loyalty) {
        updates.opted_into_loyalty = true;
      }

      if (Object.keys(updates).length > 0) {
        const updatedCustomer = await CustomerModel.findOneAndUpdate(
          { _id: customer._id, business_id },
          { $set: updates },
          { new: true, runValidators: true }
        );

        if (!updatedCustomer) {
          throw new Error('Customer not found for loyalty update');
        }

        customer = updatedCustomer;
      }
    }

    // 2. Upsert Loyalty Account
    return this.accountRepo.upsertForCustomer(customer._id.toString());
  }

  async lookupPoints(phone: string): Promise<{
    isEnrolled: boolean;
    points_balance: number;
    max_redeemable_points: number;
    equivalent_discount_value: number;
    redeem_rate?: number;
    min_points_to_redeem?: number;
    earn_rate?: number;
    max_discount_percent?: number;
    is_active: boolean;
  }> {
    const normalizedPhone = this.normalizePhone(phone);
    const program = await this.getProgramSettings();
    const is_active = program?.is_active ?? false;
    const globalSettings = {
      is_active,
      redeem_rate: program?.redeem_rate_currency_per_point,
      min_points_to_redeem: program?.minimum_points_to_redeem,
      earn_rate: program?.earn_rate_points_per_currency,
      max_discount_percent: program?.max_discount_percent_per_order,
    };

    if (!normalizedPhone || normalizedPhone.length < this.minPhoneDigits) {
      return { isEnrolled: false, points_balance: 0, max_redeemable_points: 0, equivalent_discount_value: 0, ...globalSettings };
    }

    const business_id = await this.getActiveBusinessId();

    // 1. Find Customer for the active storefront business
    const customer = await this.findCustomerByPhone(business_id, phone);
    
    // Not enrolled if no customer OR not opted into loyalty
    if (!customer || !customer.opted_into_loyalty) {
      return { isEnrolled: false, points_balance: 0, max_redeemable_points: 0, equivalent_discount_value: 0, ...globalSettings };
    }

    // 2. Find Loyalty Account
    const account = await this.accountRepo.findByCustomerId(customer._id.toString());
    
    if (!account) {
      // Should not happen if opted_into_loyalty is true, but for safety:
      return { isEnrolled: true, points_balance: 0, max_redeemable_points: 0, equivalent_discount_value: 0, ...globalSettings };
    }

    if (!is_active) {
      return { isEnrolled: true, points_balance: account.points_balance, max_redeemable_points: 0, equivalent_discount_value: 0, ...globalSettings };
    }

    const max_redeemable_points = account.points_balance >= (program!.minimum_points_to_redeem || 0) ? account.points_balance : 0;
    const equivalent_discount_value = max_redeemable_points * (program!.redeem_rate_currency_per_point || 0);

    const result = {
      isEnrolled: true,
      points_balance: account.points_balance,
      max_redeemable_points,
      equivalent_discount_value,
      ...globalSettings
    };
    
    console.log(`[LoyaltyService] Lookup success for ${phone}: enrolled=${result.isEnrolled}, balance=${result.points_balance}`);
    return result;
  }

  calculateEarn(program: LoyaltyProgram, orderTotal: number): number {
    if (!program.is_active) return 0;
    return Math.floor(orderTotal * program.earn_rate_points_per_currency);
  }

  async earnPoints(customer_id: string, order: Order): Promise<void> {
    const program = await this.getProgramSettings();
    if (!program?.is_active) return;
    
    const account = await this.accountRepo.findByCustomerId(customer_id);
    if (!account) return;

    // 1. Make sure this order is completed
    if (order.status !== 'completed') {
      console.log(`[LoyaltyService] Order ${order.id} is not completed (status: ${order.status}). Skipping.`);
      return;
    }

    // 2. Make sure this order hasn't already earned points
    const existingEarn = await this.transactionRepo.findByOrderIdAndType(order.id, 'EARN');
    if (existingEarn) {
      console.log(`[LoyaltyService] Order ${order.id} already earned points. Skipping.`);
      return;
    }

    const pointsToEarn = this.calculateEarn(program, order.money.total_amount);
    if (pointsToEarn <= 0) return;

    // Create transaction
    await this.transactionRepo.create({
      loyalty_account_id: account.id,
      order_id: order.id,
      type: 'EARN',
      points_change: pointsToEarn,
      points_balance_after: account.points_balance + pointsToEarn,
      description: `Earned points from order #${order.order_number}`,
    });

    // Update account
    await this.accountRepo.updateBalance(account.id, pointsToEarn, {
      earned: pointsToEarn,
    });
  }

  async validateRedemption(customer_id: string, points_to_redeem: number): Promise<{ discount_value: number }> {
    if (points_to_redeem <= 0) return { discount_value: 0 };
    
    const program = await this.getProgramSettings();
    if (!program?.is_active) throw new Error('Loyalty program is not active');
    
    if (points_to_redeem < program.minimum_points_to_redeem) {
      throw new Error(`Minimum redemption is ${program.minimum_points_to_redeem} points`);
    }

    const account = await this.accountRepo.findByCustomerId(customer_id);
    if (!account) throw new Error('Loyalty account not found');
    if (account.points_balance < points_to_redeem) throw new Error('Insufficient points balance');

    const discount_value = points_to_redeem * program.redeem_rate_currency_per_point;
    return { discount_value };
  }

  async redeemPoints(loyalty_account_id: string, points_to_redeem: number, order_id?: string): Promise<{ discount_value: number }> {
    throw new Error('Use redeemPointsByCustomer instead');
  }

  async redeemPointsByCustomer(customer_id: string, points_to_redeem: number, order_id?: string): Promise<{ discount_value: number }> {
    if (points_to_redeem <= 0) return { discount_value: 0 };

    const program = await this.getProgramSettings();
    if (!program?.is_active) throw new Error('Loyalty program is not active');
    
    if (points_to_redeem < program.minimum_points_to_redeem) {
      throw new Error(`Minimum redemption is ${program.minimum_points_to_redeem} points`);
    }

    const account = await this.accountRepo.findByCustomerId(customer_id);
    if (!account) throw new Error('Loyalty account not found');
    if (account.points_balance < points_to_redeem) throw new Error('Insufficient points balance');

    const discount_value = points_to_redeem * program.redeem_rate_currency_per_point;

    // Create transaction
    await this.transactionRepo.create({
      loyalty_account_id: account.id,
      order_id: order_id, // can be passed if we know it, or updated later
      type: 'REDEEM',
      points_change: -points_to_redeem,
      points_balance_after: account.points_balance - points_to_redeem,
      description: order_id ? `Redeemed points for order` : `Redeemed points`,
    });

    // Update account
    await this.accountRepo.updateBalance(account.id, -points_to_redeem, {
      redeemed: points_to_redeem,
    });

    return { discount_value };
  }

  async refundPoints(customer_id: string, points_to_refund: number, order_id: string): Promise<void> {
    if (points_to_refund <= 0) return;
    const account = await this.accountRepo.findByCustomerId(customer_id);
    if (!account) return;

    await this.transactionRepo.create({
      loyalty_account_id: account.id,
      order_id: order_id,
      type: 'ADJUST',
      points_change: points_to_refund,
      points_balance_after: account.points_balance + points_to_refund,
      description: `Refunded points from cancelled order`,
    });

    await this.accountRepo.updateBalance(account.id, points_to_refund, {
      redeemed: -points_to_refund
    });
  }

  async clawbackEarnedPoints(customer_id: string, order: Order): Promise<void> {
    const program = await this.getProgramSettings();
    if (!program?.is_active) return;
    const pointsToEarn = this.calculateEarn(program, order.money.total_amount);
    if (pointsToEarn <= 0) return;

    const account = await this.accountRepo.findByCustomerId(customer_id);
    if (!account) return;

    await this.transactionRepo.create({
      loyalty_account_id: account.id,
      order_id: order.id,
      type: 'ADJUST',
      points_change: -pointsToEarn,
      points_balance_after: account.points_balance - pointsToEarn,
      description: `Clawback earned points from cancelled order #${order.order_number}`,
    });

    await this.accountRepo.updateBalance(account.id, -pointsToEarn, {
      earned: -pointsToEarn,
    });
  }
}
