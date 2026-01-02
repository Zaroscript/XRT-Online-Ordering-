"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBusinessUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class UpdateBusinessUseCase {
    constructor(businessRepository) {
        this.businessRepository = businessRepository;
    }
    async execute(id, ownerId, businessData) {
        const existingBusiness = await this.businessRepository.findById(id, ownerId);
        if (!existingBusiness) {
            throw new AppError_1.NotFoundError('Business');
        }
        return await this.businessRepository.update(id, ownerId, businessData);
    }
}
exports.UpdateBusinessUseCase = UpdateBusinessUseCase;
