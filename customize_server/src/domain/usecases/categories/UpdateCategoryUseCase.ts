import { ICategoryRepository } from '../../repositories/ICategoryRepository';
import { IItemRepository } from '../../repositories/IItemRepository';
import { IImageStorage } from '../../services/IImageStorage';
import { Category, UpdateCategoryDTO } from '../../entities/Category';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';

export class UpdateCategoryUseCase {
  constructor(
    private categoryRepository: ICategoryRepository,
    private imageStorage: IImageStorage,
    private itemRepository: IItemRepository
  ) {}

  async execute(
    id: string,
    business_id: string | undefined, // Allow undefined for super admins
    categoryData: UpdateCategoryDTO,
    files?: { [fieldname: string]: Express.Multer.File[] }
  ): Promise<Category> {
    const existingCategory = await this.categoryRepository.findById(id, business_id);

    if (!existingCategory) {
      throw new NotFoundError('Category');
    }

    // Resolve robust business_id for update
    const targetBusinessId = business_id || existingCategory.business_id;

    // Check if name is being updated and if it already exists
    if (categoryData.name && categoryData.name !== existingCategory.name) {
      const nameExists = await this.categoryRepository.exists(categoryData.name, targetBusinessId);
      if (nameExists) {
        throw new ValidationError('Category name already exists for this business');
      }
    }

    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;
    let iconUrl: string | undefined;
    let iconPublicId: string | undefined;

    if (files && files['image'] && files['image'][0]) {
      // Delete old image if exists
      if (existingCategory.image_public_id) {
        // Fire and forget delete
        this.imageStorage
          .deleteImage(existingCategory.image_public_id)
          .catch((err) => console.error('Background delete failed for image:', err));
      }

      const uploadResult = await this.imageStorage.uploadImage(
        files['image'][0],
        `xrttech/categories/${targetBusinessId}`
      );
      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }

    if (files && files['icon'] && files['icon'][0]) {
      // Delete old icon if exists
      if (existingCategory.icon_public_id) {
        // Fire and forget delete
        this.imageStorage
          .deleteImage(existingCategory.icon_public_id)
          .catch((err) => console.error('Background delete failed for icon:', err));
      }

      const uploadResult = await this.imageStorage.uploadImage(
        files['icon'][0],
        `xrttech/categories/${targetBusinessId}/icons`
      );
      iconUrl = uploadResult.secure_url;
      iconPublicId = uploadResult.public_id;
    } else if ((categoryData as any).delete_icon) {
      // Explicit deletion requested
      if (existingCategory.icon_public_id) {
        this.imageStorage
          .deleteImage(existingCategory.icon_public_id)
          .catch((err) => console.error('Background delete failed for icon:', err));
      }
      // Set to null/empty to update DB
      iconUrl = '';
      iconPublicId = '';
    }

    const updatedLanguages = [...(existingCategory.translated_languages || [])];
    const currentLanguage = (categoryData as any).language;
    if (currentLanguage && !updatedLanguages.includes(currentLanguage)) {
      updatedLanguages.push(currentLanguage);
    }

    const finalCategoryData: any = {
      ...categoryData,
      ...(imageUrl && { image: imageUrl, image_public_id: imagePublicId }),
      ...(iconUrl !== undefined && { icon: iconUrl, icon_public_id: iconPublicId }),
      translated_languages: updatedLanguages,
    };

    if (categoryData.modifier_groups && categoryData.apply_modifier_groups_to_items) {
      try {
        await this.itemRepository.assignModifierGroupsToCategoryItems(
          id,
          categoryData.modifier_groups
        );
      } catch (err) {
        console.error(`Failed to apply modifier groups to items:`, err);
      }
    } else {
    }

    return await this.categoryRepository.update(id, targetBusinessId, finalCategoryData);
  }
}
