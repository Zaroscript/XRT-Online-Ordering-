"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerRepository = void 0;
const CustomerModel_1 = require("../database/models/CustomerModel");
const AppError_1 = require("../../shared/errors/AppError");
class CustomerRepository {
    toDomain(document) {
        return {
            id: document._id.toString(),
            business_id: document.business_id ? (typeof document.business_id === 'string' ? document.business_id : document.business_id.toString()) : '',
            name: document.name,
            email: document.email,
            phoneNumber: document.phoneNumber,
            rewards: document.rewards || 0,
            notes: document.notes,
            isActive: document.isActive,
            last_order_at: document.last_order_at,
            created_at: document.created_at,
            updated_at: document.updated_at,
        };
    }
    async create(customerData) {
        const customerDoc = new CustomerModel_1.CustomerModel(customerData);
        await customerDoc.save();
        return this.toDomain(customerDoc);
    }
    async findById(id, business_id) {
        const query = { _id: id };
        if (business_id) {
            query.business_id = business_id;
        }
        const customerDoc = await CustomerModel_1.CustomerModel.findOne(query);
        return customerDoc ? this.toDomain(customerDoc) : null;
    }
    async findAll(filters) {
        const query = {};
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
            CustomerModel_1.CustomerModel.find(query)
                .sort({ [orderBy]: sortedBy === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            CustomerModel_1.CustomerModel.countDocuments(query),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            customers: customers.map((doc) => ({
                id: doc._id.toString(),
                business_id: doc.business_id ? (typeof doc.business_id === 'string' ? doc.business_id : doc.business_id.toString()) : '',
                name: doc.name,
                email: doc.email,
                phoneNumber: doc.phoneNumber,
                rewards: doc.rewards || 0,
                notes: doc.notes,
                isActive: doc.isActive !== undefined ? doc.isActive : true,
                last_order_at: doc.last_order_at,
                created_at: doc.created_at,
                updated_at: doc.updated_at,
            })),
            total,
            page,
            limit,
            totalPages,
        };
    }
    async update(id, customerData, business_id) {
        const query = { _id: id };
        if (business_id) {
            query.business_id = business_id;
        }
        const customerDoc = await CustomerModel_1.CustomerModel.findOneAndUpdate(query, { ...customerData }, { new: true, runValidators: true });
        if (!customerDoc) {
            throw new AppError_1.NotFoundError('Customer');
        }
        return this.toDomain(customerDoc);
    }
    async delete(id, business_id) {
        const query = { _id: id };
        if (business_id) {
            query.business_id = business_id;
        }
        const result = await CustomerModel_1.CustomerModel.deleteOne(query);
        if (result.deletedCount === 0) {
            throw new AppError_1.NotFoundError('Customer');
        }
    }
    async exists(email, business_id) {
        const count = await CustomerModel_1.CustomerModel.countDocuments({ email: email.toLowerCase(), business_id });
        return count > 0;
    }
}
exports.CustomerRepository = CustomerRepository;
