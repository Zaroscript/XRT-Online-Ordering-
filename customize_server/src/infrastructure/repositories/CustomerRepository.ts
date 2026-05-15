import {
  ICustomerRepository,
  CustomerFilters,
  PaginatedCustomers,
} from '../../domain/repositories/ICustomerRepository';
import { Customer, CreateCustomerDTO, UpdateCustomerDTO } from '../../domain/entities/Customer';
import { CustomerModel, CustomerDocument } from '../database/models/CustomerModel';
import { LoyaltyAccountModel } from '../database/models/LoyaltyAccountModel';
import { NotFoundError } from '../../shared/errors/AppError';

export class CustomerRepository implements ICustomerRepository {
  private normalizePhone(phone: string): string {
    return String(phone || '').replace(/\D/g, '');
  }

  private buildPhoneCandidates(phoneNumber: string): string[] {
    const trimmed = String(phoneNumber || '').trim();
    const normalized = this.normalizePhone(trimmed);
    const candidates = new Set<string>();

    if (trimmed) candidates.add(trimmed);
    if (normalized) {
      candidates.add(normalized);
      candidates.add(`+${normalized}`);
      if (normalized.length === 10) {
        candidates.add(`1${normalized}`);
        candidates.add(`+1${normalized}`);
      }
      if (normalized.length === 11 && normalized.startsWith('1')) {
        const national = normalized.slice(1);
        candidates.add(national);
        candidates.add(`+${national}`);
      }
    }

    return [...candidates];
  }

  private toDomain(document: CustomerDocument): Customer {
    return {
      id: document._id.toString(),
      business_id: document.business_id
        ? typeof document.business_id === 'string'
          ? document.business_id
          : document.business_id.toString()
        : '',
      name: document.name,
      email: document.email,
      phoneNumber: document.phoneNumber,
      loyaltyPoints: document.rewards || 0,
      rewards: document.rewards || 0,
      notes: document.notes,
      isActive: document.isActive,
      opted_into_loyalty: document.opted_into_loyalty ?? false,
      accepts_marketing_messages: document.accepts_marketing_messages ?? true,
      accepts_order_updates: document.accepts_order_updates ?? true,
      last_order_at: document.last_order_at,
      address: document.address,
      created_at: document.created_at,
      updated_at: document.updated_at,
    };
  }

  private async getLoyaltyPointsMap(
    customerIds: string[],
  ): Promise<Map<string, number>> {
    if (!customerIds.length) return new Map<string, number>();

    const accounts = await LoyaltyAccountModel.find({
      customer_id: { $in: customerIds },
    })
      .select({ customer_id: 1, points_balance: 1 })
      .lean();

    const map = new Map<string, number>();
    for (const account of accounts as any[]) {
      const id = String(account?.customer_id || '');
      if (!id) continue;
      map.set(id, Number(account?.points_balance || 0));
    }
    return map;
  }

  async create(customerData: CreateCustomerDTO): Promise<Customer> {
    const customerDoc = new CustomerModel(customerData);
    await customerDoc.save();
    return this.toDomain(customerDoc);
  }

  async findById(id: string, business_id?: string): Promise<Customer | null> {
    const query: any = { _id: id };
    if (business_id) {
      query.business_id = business_id;
    }
    const customerDoc = await CustomerModel.findOne(query);
    if (!customerDoc) return null;
    const customer = this.toDomain(customerDoc);
    const loyaltyPointsMap = await this.getLoyaltyPointsMap([customer.id]);
    const loyaltyPoints = loyaltyPointsMap.get(customer.id) ?? 0;
    return {
      ...customer,
      loyaltyPoints,
      // keep legacy field aligned for older consumers
      rewards: loyaltyPoints,
    };
  }

  async findAll(filters: CustomerFilters): Promise<PaginatedCustomers> {
    const query: any = {};

    // Business filter (required for non-super-admins)
    if (filters.business_id) {
      query.business_id = filters.business_id;
    }

    // Active filter
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    // Search filter
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { phoneNumber: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    const orderBy = filters.orderBy || 'created_at';
    const sortedBy = filters.sortedBy || 'desc';

    const [customers, total] = await Promise.all([
      CustomerModel.find(query)
        .sort({ [orderBy]: sortedBy === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CustomerModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    const customerIds = customers.map((doc: any) => String(doc._id));
    const loyaltyPointsMap = await this.getLoyaltyPointsMap(customerIds);

    return {
      customers: customers.map((doc: any) => {
        const id = doc._id.toString();
        const loyaltyPoints = loyaltyPointsMap.get(id) ?? 0;
        return {
          id,
          business_id: doc.business_id
            ? typeof doc.business_id === 'string'
              ? doc.business_id
              : doc.business_id.toString()
            : '',
          name: doc.name,
          email: doc.email,
          phoneNumber: doc.phoneNumber,
          loyaltyPoints,
          // keep legacy field aligned for older consumers
          rewards: loyaltyPoints,
          notes: doc.notes,
          isActive: doc.isActive !== undefined ? doc.isActive : true,
          opted_into_loyalty: doc.opted_into_loyalty ?? false,
          accepts_marketing_messages: doc.accepts_marketing_messages ?? true,
          accepts_order_updates: doc.accepts_order_updates ?? true,
          last_order_at: doc.last_order_at,
          address: doc.address,
          created_at: doc.created_at,
          updated_at: doc.updated_at,
        };
      }),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async update(
    id: string,
    customerData: UpdateCustomerDTO,
    business_id?: string
  ): Promise<Customer> {
    const query: any = { _id: id };
    if (business_id) {
      query.business_id = business_id;
    }

    const customerDoc = await CustomerModel.findOneAndUpdate(
      query,
      { ...customerData },
      { new: true, runValidators: true }
    );

    if (!customerDoc) {
      throw new NotFoundError('Customer');
    }

    return this.toDomain(customerDoc);
  }

  async delete(id: string, business_id?: string): Promise<void> {
    const query: any = { _id: id };
    if (business_id) {
      query.business_id = business_id;
    }

    const result = await CustomerModel.deleteOne(query);

    if (result.deletedCount === 0) {
      throw new NotFoundError('Customer');
    }
  }

  async exists(email: string, business_id: string): Promise<boolean> {
    const count = await CustomerModel.countDocuments({ email: email.toLowerCase(), business_id });
    return count > 0;
  }

  async findByPhone(phoneNumber: string, business_id: string): Promise<Customer | null> {
    const normalizedTarget = this.normalizePhone(phoneNumber);
    const candidates = this.buildPhoneCandidates(phoneNumber);

    const directDoc = await CustomerModel.findOne({
      business_id,
      phoneNumber: { $in: candidates },
    }).sort({ updated_at: -1, created_at: -1 });

    if (directDoc) {
      return this.toDomain(directDoc);
    }

    if (!normalizedTarget) {
      return null;
    }

    // Fallback for legacy formatted numbers not exactly matching candidates.
    const legacyDocs = await CustomerModel.find({
      business_id,
      phoneNumber: { $exists: true, $ne: '' },
    })
      .sort({ updated_at: -1, created_at: -1 })
      .limit(2000);

    const matchedDoc =
      legacyDocs.find((doc) => {
        const normalizedStored = this.normalizePhone(doc.phoneNumber || '');
        if (!normalizedStored) return false;
        if (normalizedStored === normalizedTarget) return true;

        // Handle country-prefix variant for US/Canada (+1).
        if (
          normalizedStored.length === 11 &&
          normalizedStored.startsWith('1') &&
          normalizedStored.slice(1) === normalizedTarget
        ) {
          return true;
        }
        if (
          normalizedTarget.length === 11 &&
          normalizedTarget.startsWith('1') &&
          normalizedTarget.slice(1) === normalizedStored
        ) {
          return true;
        }
        return false;
      }) || null;

    return matchedDoc ? this.toDomain(matchedDoc) : null;
  }
}
