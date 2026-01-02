"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawController = void 0;
const GetWithdrawsUseCase_1 = require("../../domain/usecases/withdraws/GetWithdrawsUseCase");
const GetWithdrawUseCase_1 = require("../../domain/usecases/withdraws/GetWithdrawUseCase");
const CreateWithdrawUseCase_1 = require("../../domain/usecases/withdraws/CreateWithdrawUseCase");
const UpdateWithdrawUseCase_1 = require("../../domain/usecases/withdraws/UpdateWithdrawUseCase");
const ApproveWithdrawUseCase_1 = require("../../domain/usecases/withdraws/ApproveWithdrawUseCase");
const DeleteWithdrawUseCase_1 = require("../../domain/usecases/withdraws/DeleteWithdrawUseCase");
const WithdrawRepository_1 = require("../../infrastructure/repositories/WithdrawRepository");
const response_1 = require("../../shared/utils/response");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
class WithdrawController {
    constructor() {
        this.getAllWithdraws = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 10, orderBy = 'created_at', sortedBy = 'desc', search, business_id, status, } = req.query;
            // For non-super-admins, filter by their business_id
            const filterBusinessId = req.user?.role === 'SUPER_ADMIN'
                ? business_id
                : (req.user?.business_id || business_id);
            const result = await this.getWithdrawsUseCase.execute({
                page: Number(page),
                limit: Number(limit),
                orderBy: orderBy,
                sortedBy: sortedBy,
                search: search,
                business_id: filterBusinessId,
                status: status,
            });
            // Map withdraws to match frontend expectations
            const mappedWithdraws = result.withdraws.map((withdraw) => ({
                ...withdraw,
                shop_id: withdraw.business_id,
                shop: withdraw.business_id, // Populated business
            }));
            return (0, response_1.sendSuccess)(res, 'Withdraws retrieved successfully', {
                withdraws: mappedWithdraws,
                paginatorInfo: {
                    total: result.total,
                    currentPage: result.page,
                    lastPage: result.totalPages,
                    perPage: result.limit,
                    count: result.withdraws.length,
                },
            });
        });
        this.getWithdraw = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const withdraw = await this.getWithdrawUseCase.execute(req.params.id);
            return (0, response_1.sendSuccess)(res, 'Withdraw retrieved successfully', {
                withdraw: {
                    ...withdraw,
                    shop_id: withdraw.business_id,
                    shop: withdraw.business_id,
                },
            });
        });
        this.createWithdraw = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { amount, business_id, payment_method, details, note } = req.body;
            const createdBy = req.user?.id || '';
            // Use business_id from body or user's business_id
            const withdrawBusinessId = business_id || req.user?.business_id;
            if (!withdrawBusinessId) {
                throw new Error('business_id is required');
            }
            const withdraw = await this.createWithdrawUseCase.execute({
                amount,
                business_id: withdrawBusinessId,
                payment_method,
                details,
                note,
            }, createdBy);
            return (0, response_1.sendSuccess)(res, 'Withdraw created successfully', {
                withdraw: {
                    ...withdraw,
                    shop_id: withdraw.business_id,
                },
            }, 201);
        });
        this.updateWithdraw = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { payment_method, details, note } = req.body;
            const withdraw = await this.updateWithdrawUseCase.execute(id, {
                payment_method,
                details,
                note,
            });
            return (0, response_1.sendSuccess)(res, 'Withdraw updated successfully', {
                withdraw: {
                    ...withdraw,
                    shop_id: withdraw.business_id,
                },
            });
        });
        this.approveWithdraw = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { status, note } = req.body;
            const approvedBy = req.user?.id || '';
            const withdraw = await this.approveWithdrawUseCase.execute(id, { status, note }, approvedBy);
            return (0, response_1.sendSuccess)(res, 'Withdraw status updated successfully', {
                withdraw: {
                    ...withdraw,
                    shop_id: withdraw.business_id,
                },
            });
        });
        this.deleteWithdraw = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            await this.deleteWithdrawUseCase.execute(req.params.id);
            return (0, response_1.sendSuccess)(res, 'Withdraw deleted successfully');
        });
        const withdrawRepository = new WithdrawRepository_1.WithdrawRepository();
        this.getWithdrawsUseCase = new GetWithdrawsUseCase_1.GetWithdrawsUseCase(withdrawRepository);
        this.getWithdrawUseCase = new GetWithdrawUseCase_1.GetWithdrawUseCase(withdrawRepository);
        this.createWithdrawUseCase = new CreateWithdrawUseCase_1.CreateWithdrawUseCase(withdrawRepository);
        this.updateWithdrawUseCase = new UpdateWithdrawUseCase_1.UpdateWithdrawUseCase(withdrawRepository);
        this.approveWithdrawUseCase = new ApproveWithdrawUseCase_1.ApproveWithdrawUseCase(withdrawRepository);
        this.deleteWithdrawUseCase = new DeleteWithdrawUseCase_1.DeleteWithdrawUseCase(withdrawRepository);
    }
}
exports.WithdrawController = WithdrawController;
