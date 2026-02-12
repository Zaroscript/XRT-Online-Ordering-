"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessController = void 0;
const GetOrCreateDefaultBusinessUseCase_1 = require("../../domain/usecases/businesses/GetOrCreateDefaultBusinessUseCase");
const UpdateBusinessUseCase_1 = require("../../domain/usecases/businesses/UpdateBusinessUseCase");
const BusinessRepository_1 = require("../../infrastructure/repositories/BusinessRepository");
const BusinessSettingsRepository_1 = require("../../infrastructure/repositories/BusinessSettingsRepository");
const response_1 = require("../../shared/utils/response");
const response_2 = require("../../shared/utils/response");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
/**
 * Single-tenant: one business only. No creating or deleting businesses.
 */
class BusinessController {
    constructor() {
        /** Single-tenant: creating additional businesses is disabled */
        this.createBusiness = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            return (0, response_2.sendError)(res, 'Single-tenant: only one business is allowed. Use the dashboard to update your store.', 403);
        });
        /** Single-tenant: deleting the only business is disabled */
        this.deleteBusiness = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            return (0, response_2.sendError)(res, 'Single-tenant: you cannot delete the only business.', 403);
        });
        /** Returns the single business; creates it with defaults if none exists (first-time setup) */
        this.getBusiness = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const business = await this.getOrCreateDefaultBusinessUseCase.execute(req.user.id);
            return (0, response_1.sendSuccess)(res, 'Business retrieved successfully', { business });
        });
        /** Updates the single business */
        this.updateBusiness = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            await this.getOrCreateDefaultBusinessUseCase.execute(req.user.id);
            const business = await this.updateBusinessUseCase.execute(req.body);
            return (0, response_1.sendSuccess)(res, 'Business updated successfully', { business });
        });
        const businessRepository = new BusinessRepository_1.BusinessRepository();
        const businessSettingsRepository = new BusinessSettingsRepository_1.BusinessSettingsRepository();
        this.getOrCreateDefaultBusinessUseCase = new GetOrCreateDefaultBusinessUseCase_1.GetOrCreateDefaultBusinessUseCase(businessRepository, businessSettingsRepository);
        this.updateBusinessUseCase = new UpdateBusinessUseCase_1.UpdateBusinessUseCase(businessRepository);
    }
}
exports.BusinessController = BusinessController;
