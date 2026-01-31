import { IItemRepository } from '../../repositories/IItemRepository';
import { IImageStorage } from '../../services/IImageStorage';
import { IItemSizeRepository } from '../../repositories/IItemSizeRepository';

export class DeleteItemUseCase {
  constructor(
    private itemRepository: IItemRepository,
    private imageStorage: IImageStorage,
    private itemSizeRepository: IItemSizeRepository
  ) {}

  async execute(id: string): Promise<void> {
    const item = await this.itemRepository.findById(id);
    if (!item) {
      throw new Error('Item not found');
    }

    // Global item sizes should NOT be deleted when an item is deleted
    // const sizes = await this.itemSizeRepository.findAll({ item_id: id });
    // for (const size of sizes) {
    //     await this.itemSizeRepository.delete(size.id, id);
    // }

    if (item.image_public_id) {
      await this.imageStorage.deleteImage(item.image_public_id);
    }

    await this.itemRepository.delete(id);
  }
}
