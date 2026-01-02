import { ICategoryRepository } from '../../repositories/ICategoryRepository';
import { IImageStorage } from '../../services/IImageStorage';
import { NotFoundError } from '../../../shared/errors/AppError';

export class DeleteCategoryUseCase {
  constructor(
    private categoryRepository: ICategoryRepository,
    private imageStorage: IImageStorage
  ) { }

  async execute(id: string, business_id?: string): Promise<void> {
    const category = await this.categoryRepository.findById(id, business_id);

    if (!category) {
      throw new NotFoundError('Category');
    }

    const targetBusinessId = category.business_id;

    // Delete image if exists
    if (category.image_public_id) {
      try {
        await this.imageStorage.deleteImage(category.image_public_id);
      } catch (error) {
        console.error('Failed to delete image:', error);
        // Continue with category deletion even if image deletion fails
      }
    }

    // Delete icon if exists
    if (category.icon_public_id) {
      try {
        await this.imageStorage.deleteImage(category.icon_public_id);
      } catch (error) {
        console.error('Failed to delete icon:', error);
        // Continue with category deletion even if icon deletion fails
      }
    }

    await this.categoryRepository.delete(id, targetBusinessId);
  }
}

