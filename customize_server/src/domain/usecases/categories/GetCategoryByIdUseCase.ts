
import { ICategoryRepository } from '../../repositories/ICategoryRepository';
import { Category } from '../../entities/Category';
import { NotFoundError } from '../../../shared/errors/AppError';

export class GetCategoryByIdUseCase {
    constructor(private categoryRepository: ICategoryRepository) { }

    async execute(id: string, business_id?: string): Promise<Category> {
        const category = await this.categoryRepository.findById(id, business_id);

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        return category;
    }
}
