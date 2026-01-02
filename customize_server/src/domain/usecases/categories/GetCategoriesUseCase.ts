import { ICategoryRepository } from '../../repositories/ICategoryRepository';
import { Category, CategoryFilters } from '../../entities/Category';

export class GetCategoriesUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(filters: CategoryFilters): Promise<Category[]> {
    return await this.categoryRepository.findAll(filters);
  }
}

