"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawRepository = void 0;
const WithdrawModel_1 = require("../database/models/WithdrawModel");
const AppError_1 = require("../../shared/errors/AppError");
class WithdrawRepository {
    toDomain(document) {
        return {
            id: document._id.toString(),
            amount: document.amount,
            status: document.status,
            business_id: document.business_id.toString(),
            payment_method: document.payment_method,
            details: document.details,
            note: document.note,
            approvedBy: document.approvedBy?.toString(),
            approvedAt: document.approvedAt,
            createdBy: document.createdBy.toString(),
            created_at: document.created_at,
            updated_at: document.updated_at,
        };
    }
    async create(withdrawData, createdBy) {
        const withdrawDoc = new WithdrawModel_1.WithdrawModel({
            ...withdrawData,
            createdBy,
        });
        await withdrawDoc.save();
        return this.toDomain(withdrawDoc);
    }
    async findById(id) {
        const withdrawDoc = await WithdrawModel_1.WithdrawModel.findById(id)
            .populate('business_id', 'name')
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email');
        return withdrawDoc ? this.toDomain(withdrawDoc) : null;
    }
    async findAll(filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;
        const orderBy = filters.orderBy || 'created_at';
        const sortedBy = filters.sortedBy === 'asc' ? 1 : -1;
        const query = {};
        if (filters.business_id) {
            query.business_id = filters.business_id;
        }
        if (filters.status) {
            query.status = filters.status;
        }
        // Search filter
        if (filters.search) {
            query.$or = [
                { payment_method: { $regex: filters.search, $options: 'i' } },
                { details: { $regex: filters.search, $options: 'i' } },
                { note: { $regex: filters.search, $options: 'i' } },
            ];
        }
        const [withdraws, total] = await Promise.all([
            WithdrawModel_1.WithdrawModel.find(query)
                .sort({ [orderBy]: sortedBy })
                .skip(skip)
                .limit(limit)
                .populate('business_id', 'name')
                .populate('createdBy', 'name email')
                .populate('approvedBy', 'name email'),
            WithdrawModel_1.WithdrawModel.countDocuments(query),
        ]);
        return {
            withdraws: withdraws.map((doc) => this.toDomain(doc)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async update(id, withdrawData) {
        const withdrawDoc = await WithdrawModel_1.WithdrawModel.findById(id);
        if (!withdrawDoc) {
            throw new AppError_1.NotFoundError('Withdraw not found');
        }
        Object.assign(withdrawDoc, withdrawData);
        // If status is being changed to approved/rejected, set approvedBy and approvedAt
        if (withdrawData.status && withdrawData.status !== withdrawDoc.status) {
            if (withdrawData.status === 'approved' || withdrawData.status === 'rejected') {
                withdrawDoc.approvedAt = new Date();
            }
        }
        await withdrawDoc.save();
        return this.toDomain(withdrawDoc);
    }
    async delete(id) {
        const withdrawDoc = await WithdrawModel_1.WithdrawModel.findById(id);
        if (!withdrawDoc) {
            throw new AppError_1.NotFoundError('Withdraw not found');
        }
        await WithdrawModel_1.WithdrawModel.findByIdAndDelete(id);
    }
}
exports.WithdrawRepository = WithdrawRepository;
