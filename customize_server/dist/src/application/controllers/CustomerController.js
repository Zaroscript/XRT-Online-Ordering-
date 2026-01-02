"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const CreateCustomerUseCase_1 = require("../../domain/usecases/customers/CreateCustomerUseCase");
const GetCustomersUseCase_1 = require("../../domain/usecases/customers/GetCustomersUseCase");
const GetCustomerUseCase_1 = require("../../domain/usecases/customers/GetCustomerUseCase");
const UpdateCustomerUseCase_1 = require("../../domain/usecases/customers/UpdateCustomerUseCase");
const DeleteCustomerUseCase_1 = require("../../domain/usecases/customers/DeleteCustomerUseCase");
const CustomerRepository_1 = require("../../infrastructure/repositories/CustomerRepository");
const response_1 = require("../../shared/utils/response");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const AppError_1 = require("../../shared/errors/AppError");
const roles_1 = require("../../shared/constants/roles");
class CustomerController {
    constructor() {
        this.create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { name, email, phoneNumber, rewards, notes, } = req.body;
            // Automatically get business_id from current user's business
            const business_id = req.user?.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            if (!name || !email || !phoneNumber) {
                throw new AppError_1.ValidationError('Name, email, and phone number are required');
            }
            try {
                const customer = await this.createCustomerUseCase.execute({
                    business_id: business_id,
                    name,
                    email,
                    phoneNumber,
                    rewards,
                    notes,
                });
                return (0, response_1.sendSuccess)(res, 'Customer created successfully', customer, 201);
            }
            catch (error) {
                console.error('❌ Error in CustomerController.create:', error);
                throw error;
            }
        });
        this.getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 10, orderBy = 'created_at', sortedBy = 'desc', search, role, isActive, business_id: queryBusinessId, } = req.query;
            // For non-super-admins, filter by their business_id
            const business_id = req.user?.role === roles_1.UserRole.SUPER_ADMIN
                ? queryBusinessId
                : (req.user?.business_id || queryBusinessId);
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            const filters = {
                page: Number(page),
                limit: Number(limit),
                orderBy: orderBy,
                sortedBy: sortedBy,
                search: search,
                isActive: isActive ? isActive === 'true' : undefined,
            };
            if (business_id) {
                filters.business_id = business_id;
            }
            const result = await this.getCustomersUseCase.execute(filters);
            return (0, response_1.sendSuccess)(res, 'Customers retrieved successfully', {
                customers: result.customers,
                paginatorInfo: {
                    total: result.total,
                    currentPage: result.page,
                    lastPage: result.totalPages,
                    perPage: result.limit,
                    count: result.customers.length,
                },
            });
        });
        this.getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            let business_id = req.user?.business_id || req.query.business_id;
            // For super admins, allow getting any customer if no business_id
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            if (!business_id && req.user?.role === roles_1.UserRole.SUPER_ADMIN) {
                business_id = undefined;
            }
            const customer = await this.getCustomerUseCase.execute(id, business_id);
            return (0, response_1.sendSuccess)(res, 'Customer retrieved successfully', customer);
        });
        this.update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { name, email, phoneNumber, rewards, notes, isActive, } = req.body;
            let business_id = req.user?.business_id || req.query.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            if (!business_id && req.user?.role === roles_1.UserRole.SUPER_ADMIN) {
                business_id = undefined;
            }
            try {
                const customer = await this.updateCustomerUseCase.execute(id, {
                    name,
                    email,
                    phoneNumber,
                    rewards,
                    notes,
                    isActive,
                }, business_id);
                return (0, response_1.sendSuccess)(res, 'Customer updated successfully', customer);
            }
            catch (error) {
                console.error('❌ Error in CustomerController.update:', error);
                throw error;
            }
        });
        this.delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            let business_id = req.user?.business_id || req.query.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            if (!business_id && req.user?.role === roles_1.UserRole.SUPER_ADMIN) {
                business_id = undefined;
            }
            await this.deleteCustomerUseCase.execute(id, business_id);
            return (0, response_1.sendSuccess)(res, 'Customer deleted successfully', null, 204);
        });
        const customerRepository = new CustomerRepository_1.CustomerRepository();
        this.createCustomerUseCase = new CreateCustomerUseCase_1.CreateCustomerUseCase(customerRepository);
        this.getCustomersUseCase = new GetCustomersUseCase_1.GetCustomersUseCase(customerRepository);
        this.getCustomerUseCase = new GetCustomerUseCase_1.GetCustomerUseCase(customerRepository);
        this.updateCustomerUseCase = new UpdateCustomerUseCase_1.UpdateCustomerUseCase(customerRepository);
        this.deleteCustomerUseCase = new DeleteCustomerUseCase_1.DeleteCustomerUseCase(customerRepository);
    }
}
exports.CustomerController = CustomerController;
