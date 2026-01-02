import {
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategoryFilters,
} from '../entities/Category';

export interface ICategoryRepository {
  create(categoryData: CreateCategoryDTO): Promise<Category>;
  findById(id: string, business_id?: string): Promise<Category | null>;
  findAll(filters: CategoryFilters): Promise<Category[]>;
  update(id: string, business_id: string, categoryData: UpdateCategoryDTO): Promise<Category>;
  delete(id: string, business_id: string): Promise<void>;
  exists(name: string, business_id: string): Promise<boolean>;
}

