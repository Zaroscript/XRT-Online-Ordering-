"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCategoryByIdUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class GetCategoryByIdUseCase {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async execute(id, business_id) {
        const category = await this.categoryRepository.findById(id, business_id);
        if (!category) {
            throw new AppError_1.NotFoundError('Category not found');
        }
        return category;
    }
}
exports.GetCategoryByIdUseCase = GetCategoryByIdUseCase;
