"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessController = void 0;
const CreateBusinessUseCase_1 = require("../../domain/usecases/businesses/CreateBusinessUseCase");
const GetBusinessesUseCase_1 = require("../../domain/usecases/businesses/GetBusinessesUseCase");
const GetBusinessUseCase_1 = require("../../domain/usecases/businesses/GetBusinessUseCase");
const UpdateBusinessUseCase_1 = require("../../domain/usecases/businesses/UpdateBusinessUseCase");
const BusinessRepository_1 = require("../../infrastructure/repositories/BusinessRepository");
const BusinessSettingsRepository_1 = require("../../infrastructure/repositories/BusinessSettingsRepository");
const response_1 = require("../../shared/utils/response");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
class BusinessController {
    constructor() {
        this.createBusiness = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const business = await this.createBusinessUseCase.execute({
                ...req.body,
                owner: req.user.id,
            });
            return (0, response_1.sendSuccess)(res, 'Business created successfully', { business }, 201);
        });
        this.getBusinesses = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const businesses = await this.getBusinessesUseCase.execute(req.user.id);
            return (0, response_1.sendSuccess)(res, 'Businesses retrieved successfully', {
                businesses,
                results: businesses.length,
            });
        });
        this.getBusinessById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const business = await this.getBusinessUseCase.execute(req.params.id, req.user.id);
            return (0, response_1.sendSuccess)(res, 'Business retrieved successfully', { business });
        });
        this.updateBusiness = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const business = await this.updateBusinessUseCase.execute(req.params.id, req.user.id, req.body);
            return (0, response_1.sendSuccess)(res, 'Business updated successfully', { business });
        });
        const businessRepository = new BusinessRepository_1.BusinessRepository();
        const businessSettingsRepository = new BusinessSettingsRepository_1.BusinessSettingsRepository();
        this.createBusinessUseCase = new CreateBusinessUseCase_1.CreateBusinessUseCase(businessRepository, businessSettingsRepository);
        this.getBusinessesUseCase = new GetBusinessesUseCase_1.GetBusinessesUseCase(businessRepository);
        this.getBusinessUseCase = new GetBusinessUseCase_1.GetBusinessUseCase(businessRepository);
        this.updateBusinessUseCase = new UpdateBusinessUseCase_1.UpdateBusinessUseCase(businessRepository);
    }
}
exports.BusinessController = BusinessController;
