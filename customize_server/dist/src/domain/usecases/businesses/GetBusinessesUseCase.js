"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBusinessesUseCase = void 0;
class GetBusinessesUseCase {
    constructor(businessRepository) {
        this.businessRepository = businessRepository;
    }
    async execute(ownerId) {
        return await this.businessRepository.findByOwner(ownerId);
    }
}
exports.GetBusinessesUseCase = GetBusinessesUseCase;
