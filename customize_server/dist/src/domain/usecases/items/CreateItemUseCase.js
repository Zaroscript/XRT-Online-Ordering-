"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateItemUseCase = void 0;
class CreateItemUseCase {
    constructor(itemRepository, imageStorage) {
        this.itemRepository = itemRepository;
        this.imageStorage = imageStorage;
    }
    async execute(itemData, files) {
        let imageUrl;
        let imagePublicId;
        if (files && files['image'] && files['image'][0]) {
            const uploadResult = await this.imageStorage.uploadImage(files['image'][0], `xrttech/items/${itemData.business_id}`);
            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }
        const finalItemData = {
            ...itemData,
            image: imageUrl || itemData.image,
            image_public_id: imagePublicId || itemData.image_public_id,
            sort_order: itemData.sort_order ?? 0,
            is_active: itemData.is_active ?? true,
            is_available: itemData.is_available ?? true,
            is_signature: itemData.is_signature ?? false,
        };
        return await this.itemRepository.create(finalItemData);
    }
}
exports.CreateItemUseCase = CreateItemUseCase;
