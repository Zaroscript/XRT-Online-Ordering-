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
    async execute(id, business_id, categoryData, files) {
        const existingCategory = await this.categoryRepository.findById(id, business_id);
        if (!existingCategory) {
            throw new AppError_1.NotFoundError('Category');
        }
        // Check if name is being updated and if it already exists
        if (categoryData.name && categoryData.name !== existingCategory.name) {
            const nameExists = await this.categoryRepository.exists(categoryData.name, business_id);
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
                try {
                    await this.imageStorage.deleteImage(existingCategory.image_public_id);
                }
                catch (error) {
                    // Log but don't fail if deletion fails
                    console.error('Failed to delete old image:', error);
                }
            }
            const uploadResult = await this.imageStorage.uploadImage(files['image'][0], `xrttech/categories/${business_id}`);
            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }
        if (files && files['icon'] && files['icon'][0]) {
            // Delete old icon if exists
            if (existingCategory.icon_public_id) {
                try {
                    await this.imageStorage.deleteImage(existingCategory.icon_public_id);
                }
                catch (error) {
                    console.error('Failed to delete old icon:', error);
                }
            }
            const uploadResult = await this.imageStorage.uploadImage(files['icon'][0], `xrttech/categories/${business_id}/icons`);
            iconUrl = uploadResult.secure_url;
            iconPublicId = uploadResult.public_id;
        }
        const updatedLanguages = [...(existingCategory.translated_languages || [])];
        const currentLanguage = categoryData.language;
        if (currentLanguage && !updatedLanguages.includes(currentLanguage)) {
            updatedLanguages.push(currentLanguage);
        }
        const finalCategoryData = {
            ...categoryData,
            ...(imageUrl && { image: imageUrl, image_public_id: imagePublicId }),
            ...(iconUrl && { icon: iconUrl, icon_public_id: iconPublicId }),
            translated_languages: updatedLanguages,
        };
        console.log('Checking modifier propagation...');
        console.log('Has groups:', !!categoryData.modifier_groups);
        console.log('Flag value:', categoryData.apply_modifier_groups_to_items);
        if (categoryData.modifier_groups && categoryData.apply_modifier_groups_to_items) {
            console.log(`Applying modifier groups to items in category ${id}:`, categoryData.modifier_groups);
            try {
                await this.itemRepository.assignModifierGroupsToCategoryItems(id, business_id, categoryData.modifier_groups);
                console.log(`Successfully applied modifier groups to items in category ${id}`);
            }
            catch (err) {
                console.error(`Failed to apply modifier groups to items:`, err);
            }
        }
        else {
            console.log('Skipping modifier propagation. Reason:');
            if (!categoryData.modifier_groups)
                console.log('- No modifier groups in payload');
            if (!categoryData.apply_modifier_groups_to_items)
                console.log('- Flag apply_modifier_groups_to_items is false/undefined');
        }
        return await this.categoryRepository.update(id, business_id, finalCategoryData);
    }
}
exports.UpdateCategoryUseCase = UpdateCategoryUseCase;
