import { ICategoryRepository } from '../../repositories/ICategoryRepository';
import { IImageStorage } from '../../services/IImageStorage';
import { Category, CreateCategoryDTO } from '../../entities/Category';
import { ValidationError, ForbiddenError } from '../../../shared/errors/AppError';

export class CreateCategoryUseCase {
  constructor(
    private categoryRepository: ICategoryRepository,
    private imageStorage: IImageStorage
  ) { }

  async execute(
    categoryData: CreateCategoryDTO,
    files?: { [fieldname: string]: Express.Multer.File[] }
  ): Promise<Category> {
    const nameExists = await this.categoryRepository.exists(
      categoryData.name,
      categoryData.business_id
    );

    if (nameExists) {
      throw new ValidationError('Category name already exists for this business');
    }

    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;
    let iconUrl: string | undefined;
    let iconPublicId: string | undefined;

    if (files && files['image'] && files['image'][0]) {
      const uploadResult = await this.imageStorage.uploadImage(
        files['image'][0],
        `xrttech/categories/${categoryData.business_id}`
      );
      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }

    if (files && files['icon'] && files['icon'][0]) {
      const uploadResult = await this.imageStorage.uploadImage(
        files['icon'][0],
        `xrttech/categories/${categoryData.business_id}/icons`
      );
      iconUrl = uploadResult.secure_url;
      iconPublicId = uploadResult.public_id;
    }

    const finalCategoryData: any = {
      ...categoryData,
      image: imageUrl || categoryData.image,
      image_public_id: imagePublicId || categoryData.image_public_id,
      icon: iconUrl || categoryData.icon,
      icon_public_id: iconPublicId || categoryData.icon_public_id,
      translated_languages: (categoryData as any).language ? [(categoryData as any).language] : ['en'],
      sort_order: categoryData.sort_order ?? 0,
      is_active: categoryData.is_active ?? true,
    };

    return await this.categoryRepository.create(finalCategoryData);
  }
}

