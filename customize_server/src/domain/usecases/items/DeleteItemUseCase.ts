import { IItemRepository } from '../../repositories/IItemRepository';
import { IImageStorage } from '../../services/IImageStorage';

export class DeleteItemUseCase {
    constructor(
        private itemRepository: IItemRepository,
        private imageStorage: IImageStorage
    ) { }

    async execute(id: string, business_id: string): Promise<void> {
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
