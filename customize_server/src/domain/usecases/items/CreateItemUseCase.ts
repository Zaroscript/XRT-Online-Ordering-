import { IItemRepository } from '../../repositories/IItemRepository';
import { IImageStorage } from '../../services/IImageStorage';
import { Item, CreateItemDTO } from '../../entities/Item';

export class CreateItemUseCase {
    constructor(
        private itemRepository: IItemRepository,
        private imageStorage: IImageStorage
    ) { }

    async execute(
        itemData: CreateItemDTO,
        files?: { [fieldname: string]: Express.Multer.File[] }
    ): Promise<Item> {
        let imageUrl: string | undefined;
        let imagePublicId: string | undefined;

        if (files && files['image'] && files['image'][0]) {
            const uploadResult = await this.imageStorage.uploadImage(
                files['image'][0],
                `xrttech/items/${itemData.business_id}`
            );
            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }

        const finalItemData: any = {
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
