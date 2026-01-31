import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import {
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategoryFilters,
} from '../../domain/entities/Category';
import { CategoryModel, CategoryDocument } from '../database/models/CategoryModel';

export class CategoryRepository implements ICategoryRepository {
  private toDomain(document: CategoryDocument): Category {
    return {
      id: document._id.toString(),
      business_id: document.business_id,
      name: document.name,
      description: document.description,
      kitchen_section_id: document.kitchen_section_id,
      sort_order: document.sort_order,
      is_active: document.is_active,
      image: document.image,
      image_public_id: document.image_public_id,
      icon: document.icon,
      icon_public_id: document.icon_public_id,
      translated_languages: document.translated_languages,
      modifier_groups: document.modifier_groups
        ? document.modifier_groups.map((mg: any) => ({
            modifier_group_id:
              typeof mg.modifier_group_id === 'string'
                ? mg.modifier_group_id
                : (mg.modifier_group_id?._id || mg.modifier_group_id).toString(),
            display_order: mg.display_order || 0,
            modifier_overrides: mg.modifier_overrides
              ? mg.modifier_overrides.map((mo: any) => ({
                  modifier_id:
                    typeof mo.modifier_id === 'string'
                      ? mo.modifier_id
                      : (mo.modifier_id?._id || mo.modifier_id).toString(),
                  max_quantity: mo.max_quantity,
                  is_default: mo.is_default,
                  prices_by_size: mo.prices_by_size || undefined,
                  quantity_levels: mo.quantity_levels || undefined,
                }))
              : undefined,
          }))
        : [],
      created_at: document.created_at,
      updated_at: document.updated_at,
    };
  }

  async create(categoryData: CreateCategoryDTO): Promise<Category> {
    const categoryDoc = new CategoryModel(categoryData);
    await categoryDoc.save();
    return this.toDomain(categoryDoc);
  }

  async findById(id: string, business_id?: string): Promise<Category | null> {
    const query: any = { _id: id };
    if (business_id) {
      query.business_id = business_id;
    }
    const categoryDoc = await CategoryModel.findOne(query);
    return categoryDoc ? this.toDomain(categoryDoc) : null;
  }

  async findAll(filters: CategoryFilters): Promise<Category[]> {
    const query: any = {};

    // Only filter by business_id if provided (for super admins, this might be undefined)
    if (filters.business_id) {
      query.business_id = filters.business_id;
    }

    if (filters.is_active !== undefined) {
      query.is_active = filters.is_active;
    }

    if (filters.kitchen_section_id) {
      query.kitchen_section_id = filters.kitchen_section_id;
    }

    const categoryDocs = await CategoryModel.find(query).sort({ sort_order: 1 });
    return categoryDocs.map((doc) => this.toDomain(doc));
  }

  async update(
    id: string,
    business_id: string,
    categoryData: UpdateCategoryDTO
  ): Promise<Category> {
    const categoryDoc = await CategoryModel.findOneAndUpdate(
      { _id: id, business_id },
      categoryData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!categoryDoc) {
      throw new Error('Category not found');
    }

    return this.toDomain(categoryDoc);
  }

  async delete(id: string, business_id: string): Promise<void> {
    await CategoryModel.findOneAndDelete({ _id: id, business_id });
  }

  async exists(name: string, business_id: string): Promise<boolean> {
    const count = await CategoryModel.countDocuments({
      name,
      business_id,
    });
    return count > 0;
  }

  async updateSortOrder(items: { id: string; order: number }[]): Promise<void> {
    if (!items || items.length === 0) return;

    const operations = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { sort_order: item.order },
      },
    }));

    await CategoryModel.bulkWrite(operations);
  }
}
