import { IItemRepository } from '../../repositories/IItemRepository';
import { IImageStorage } from '../../services/IImageStorage';
import { Item, UpdateItemDTO } from '../../entities/Item';
import { ValidationError } from '../../../shared/errors/AppError';

export class UpdateItemUseCase {
    constructor(
        private itemRepository: IItemRepository,
        private imageStorage: IImageStorage
    ) { }

    async execute(
        id: string,
        business_id: string,
        itemData: UpdateItemDTO,
        files?: { [fieldname: string]: Express.Multer.File[] }
    ): Promise<Item> {
        const existingItem = await this.itemRepository.findById(id, business_id);

        if (!existingItem) {
            throw new ValidationError('Item not found');
        }

        let imageUrl: string | undefined = existingItem.image;
        let imagePublicId: string | undefined = existingItem.image_public_id;

        if (files && files['image'] && files['image'][0]) {
            // Delete old image if exists
            if (existingItem.image_public_id) {
                await this.imageStorage.deleteImage(existingItem.image_public_id);
            }

            const uploadResult = await this.imageStorage.uploadImage(
                files['image'][0],
                `xrttech/items/${business_id}`
            );
            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }

        const updateData: any = {
            ...itemData,
            image: imageUrl,
            image_public_id: imagePublicId,
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(key =>
            updateData[key] === undefined && delete updateData[key]
        );

        return await this.itemRepository.update(id, business_id, updateData);
    }
}
