"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCategoriesUseCase = void 0;
class GetCategoriesUseCase {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async execute(filters) {
        return await this.categoryRepository.findAll(filters);
    }
}
exports.GetCategoriesUseCase = GetCategoriesUseCase;
