"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteCategoryUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class DeleteCategoryUseCase {
    constructor(categoryRepository, imageStorage) {
        this.categoryRepository = categoryRepository;
        this.imageStorage = imageStorage;
    }
    async execute(id, business_id) {
        const category = await this.categoryRepository.findById(id, business_id);
        if (!category) {
            throw new AppError_1.NotFoundError('Category');
        }
        const targetBusinessId = category.business_id;
        // Delete image if exists
        if (category.image_public_id) {
            try {
                await this.imageStorage.deleteImage(category.image_public_id);
            }
            catch (error) {
                console.error('Failed to delete image:', error);
                // Continue with category deletion even if image deletion fails
            }
        }
        // Delete icon if exists
        if (category.icon_public_id) {
            try {
                await this.imageStorage.deleteImage(category.icon_public_id);
            }
            catch (error) {
                console.error('Failed to delete icon:', error);
                // Continue with category deletion even if icon deletion fails
            }
        }
        await this.categoryRepository.delete(id, targetBusinessId);
    }
}
exports.DeleteCategoryUseCase = DeleteCategoryUseCase;
