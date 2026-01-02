"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteItemUseCase = void 0;
class DeleteItemUseCase {
    constructor(itemRepository, imageStorage) {
        this.itemRepository = itemRepository;
        this.imageStorage = imageStorage;
    }
    async execute(id, business_id) {
        const item = await this.itemRepository.findById(id, business_id);
        if (!item) {
            throw new Error('Item not found');
        }
        if (item.image_public_id) {
            await this.imageStorage.deleteImage(item.image_public_id);
        }
        await this.itemRepository.delete(id, business_id);
    }
}
exports.DeleteItemUseCase = DeleteItemUseCase;
