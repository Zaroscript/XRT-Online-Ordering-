"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCategoryUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class CreateCategoryUseCase {
    constructor(categoryRepository, imageStorage) {
        this.categoryRepository = categoryRepository;
        this.imageStorage = imageStorage;
    }
    async execute(categoryData, files) {
        const nameExists = await this.categoryRepository.exists(categoryData.name, categoryData.business_id);
        if (nameExists) {
            throw new AppError_1.ValidationError('Category name already exists for this business');
        }
        let imageUrl;
        let imagePublicId;
        let iconUrl;
        let iconPublicId;
        if (files && files['image'] && files['image'][0]) {
            const uploadResult = await this.imageStorage.uploadImage(files['image'][0], `xrttech/categories/${categoryData.business_id}`);
            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }
        if (files && files['icon'] && files['icon'][0]) {
            const uploadResult = await this.imageStorage.uploadImage(files['icon'][0], `xrttech/categories/${categoryData.business_id}/icons`);
            iconUrl = uploadResult.secure_url;
            iconPublicId = uploadResult.public_id;
        }
        const finalCategoryData = {
            ...categoryData,
            image: imageUrl || categoryData.image,
            image_public_id: imagePublicId || categoryData.image_public_id,
            icon: iconUrl || categoryData.icon,
            icon_public_id: iconPublicId || categoryData.icon_public_id,
            translated_languages: categoryData.language ? [categoryData.language] : ['en'],
            sort_order: categoryData.sort_order ?? 0,
            is_active: categoryData.is_active ?? true,
        };
        return await this.categoryRepository.create(finalCategoryData);
    }
}
exports.CreateCategoryUseCase = CreateCategoryUseCase;
