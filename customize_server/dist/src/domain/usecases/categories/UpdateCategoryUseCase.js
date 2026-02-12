"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCategoryUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class UpdateCategoryUseCase {
    constructor(categoryRepository, imageStorage, itemRepository) {
        this.categoryRepository = categoryRepository;
        this.imageStorage = imageStorage;
        this.itemRepository = itemRepository;
    }
    async execute(id, business_id, // Allow undefined for super admins
    categoryData, files) {
        console.log(`[UpdateCategoryUseCase] Executing for ID: ${id}, Business ID: ${business_id || 'Any'}`);
        const existingCategory = await this.categoryRepository.findById(id, business_id);
        if (!existingCategory) {
            throw new AppError_1.NotFoundError('Category');
        }
        // Resolve robust business_id for update
        const targetBusinessId = business_id || existingCategory.business_id;
        // Check if name is being updated and if it already exists
        if (categoryData.name && categoryData.name !== existingCategory.name) {
            const nameExists = await this.categoryRepository.exists(categoryData.name, targetBusinessId);
            if (nameExists) {
                throw new AppError_1.ValidationError('Category name already exists for this business');
            }
        }
        let imageUrl;
        let imagePublicId;
        let iconUrl;
        let iconPublicId;
        if (files && files['image'] && files['image'][0]) {
            // Delete old image if exists
            if (existingCategory.image_public_id) {
                // Fire and forget delete
                console.log('[UpdateCategory] Triggering delete for old image:', existingCategory.image_public_id);
                this.imageStorage
                    .deleteImage(existingCategory.image_public_id)
                    .catch((err) => console.error('Background delete failed for image:', err));
            }
            console.log('[UpdateCategory] Uploading new image');
            const uploadResult = await this.imageStorage.uploadImage(files['image'][0], `xrttech/categories/${targetBusinessId}`);
            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }
        if (files && files['icon'] && files['icon'][0]) {
            // Delete old icon if exists
            if (existingCategory.icon_public_id) {
                // Fire and forget delete
                console.log('[UpdateCategory] Triggering delete for old icon:', existingCategory.icon_public_id);
                this.imageStorage
                    .deleteImage(existingCategory.icon_public_id)
                    .catch((err) => console.error('Background delete failed for icon:', err));
            }
            console.log('[UpdateCategory] Uploading new icon');
            const uploadResult = await this.imageStorage.uploadImage(files['icon'][0], `xrttech/categories/${targetBusinessId}/icons`);
            iconUrl = uploadResult.secure_url;
            iconPublicId = uploadResult.public_id;
        }
        else if (categoryData.delete_icon) {
            // Explicit deletion requested
            if (existingCategory.icon_public_id) {
                console.log('[UpdateCategory] Explicit delete requested for icon:', existingCategory.icon_public_id);
                this.imageStorage
                    .deleteImage(existingCategory.icon_public_id)
                    .catch((err) => console.error('Background delete failed for icon:', err));
            }
            // Set to null/empty to update DB
            iconUrl = '';
            iconPublicId = '';
        }
        const updatedLanguages = [...(existingCategory.translated_languages || [])];
        const currentLanguage = categoryData.language;
        if (currentLanguage && !updatedLanguages.includes(currentLanguage)) {
            updatedLanguages.push(currentLanguage);
        }
        const finalCategoryData = {
            ...categoryData,
            ...(imageUrl && { image: imageUrl, image_public_id: imagePublicId }),
            ...(iconUrl !== undefined && { icon: iconUrl, icon_public_id: iconPublicId }),
            translated_languages: updatedLanguages,
        };
        if (categoryData.modifier_groups && categoryData.apply_modifier_groups_to_items) {
            try {
                await this.itemRepository.assignModifierGroupsToCategoryItems(id, categoryData.modifier_groups);
            }
            catch (err) {
                console.error(`Failed to apply modifier groups to items:`, err);
            }
        }
        else {
        }
        return await this.categoryRepository.update(id, targetBusinessId, finalCategoryData);
    }
}
exports.UpdateCategoryUseCase = UpdateCategoryUseCase;
