"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateItemUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class UpdateItemUseCase {
    constructor(itemRepository, imageStorage) {
        this.itemRepository = itemRepository;
        this.imageStorage = imageStorage;
    }
    async execute(id, business_id, itemData, files) {
        const existingItem = await this.itemRepository.findById(id, business_id);
        if (!existingItem) {
            throw new AppError_1.ValidationError('Item not found');
        }
        let imageUrl = existingItem.image;
        let imagePublicId = existingItem.image_public_id;
        if (files && files['image'] && files['image'][0]) {
            // Delete old image if exists
            if (existingItem.image_public_id) {
                await this.imageStorage.deleteImage(existingItem.image_public_id);
            }
            const uploadResult = await this.imageStorage.uploadImage(files['image'][0], `xrttech/items/${business_id}`);
            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }
        const updateData = {
            ...itemData,
            image: imageUrl,
            image_public_id: imagePublicId,
        };
        // Remove undefined fields
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
        return await this.itemRepository.update(id, business_id, updateData);
    }
}
exports.UpdateItemUseCase = UpdateItemUseCase;
