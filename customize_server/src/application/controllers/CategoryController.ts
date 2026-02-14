import { Request, Response } from 'express';
import { parse } from 'csv-parse/sync';
import { AuthRequest } from '../middlewares/auth';
import { GetCategoryByIdUseCase } from '../../domain/usecases/categories/GetCategoryByIdUseCase';
import { CreateCategoryUseCase } from '../../domain/usecases/categories/CreateCategoryUseCase';
import { GetCategoriesUseCase } from '../../domain/usecases/categories/GetCategoriesUseCase';
import { UpdateCategoryUseCase } from '../../domain/usecases/categories/UpdateCategoryUseCase';
import { DeleteCategoryUseCase } from '../../domain/usecases/categories/DeleteCategoryUseCase';
import { CategoryRepository } from '../../infrastructure/repositories/CategoryRepository';
import { ItemRepository } from '../../infrastructure/repositories/ItemRepository';
import { KitchenSectionRepository } from '../../infrastructure/repositories/KitchenSectionRepository';
import { CloudinaryStorage } from '../../infrastructure/cloudinary/CloudinaryStorage';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ValidationError } from '../../shared/errors/AppError';
import { UserRole } from '../../shared/constants/roles';

export class CategoryController {
  private createCategoryUseCase: CreateCategoryUseCase;
  private getCategoriesUseCase: GetCategoriesUseCase;
  private updateCategoryUseCase: UpdateCategoryUseCase;
  private deleteCategoryUseCase: DeleteCategoryUseCase;
  private getCategoryByIdUseCase: GetCategoryByIdUseCase;
  private kitchenSectionRepository: KitchenSectionRepository;

  constructor() {
    const categoryRepository = new CategoryRepository();
    const itemRepository = new ItemRepository();
    const imageStorage = new CloudinaryStorage();
    this.kitchenSectionRepository = new KitchenSectionRepository();

    this.createCategoryUseCase = new CreateCategoryUseCase(categoryRepository, imageStorage);
    this.getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);
    this.updateCategoryUseCase = new UpdateCategoryUseCase(
      categoryRepository,
      imageStorage,
      itemRepository
    );
    this.deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepository, imageStorage);
    this.getCategoryByIdUseCase = new GetCategoryByIdUseCase(categoryRepository);
  }

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      name,
      description,
      details,
      kitchen_section_id,
      sort_order,
      is_active,
      image,
      image_public_id,
      icon,
      icon_public_id,
      language,
      modifier_groups,
    } = req.body;
    const business_id = req.user?.business_id || req.body.business_id || 'default';

    // if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
    //   throw new ValidationError('business_id is required');
    // }

    // Parse modifier_groups if it's a string (common in form data)
    let parsedModifierGroups = undefined;
    if (modifier_groups !== undefined) {
      try {
        parsedModifierGroups =
          typeof modifier_groups === 'string' ? JSON.parse(modifier_groups) : modifier_groups;
      } catch (error) {
        throw new ValidationError('Invalid modifier_groups format. Expected JSON array.');
      }
    }

    try {
      const category = await this.createCategoryUseCase.execute(
        {
          business_id: business_id!,
          name,
          description: description || details,
          kitchen_section_id,
          sort_order: sort_order ? parseInt(sort_order as string) : 0,
          is_active: is_active === 'true' || is_active === true,
          image,
          image_public_id,
          icon,
          icon_public_id,
          language,
          modifier_groups: parsedModifierGroups,
          apply_modifier_groups_to_items:
            req.body.apply_modifier_groups_to_items === 'true' ||
            req.body.apply_modifier_groups_to_items === true,
        },
        req.files as { [fieldname: string]: Express.Multer.File[] }
      );

      return sendSuccess(res, 'Category created successfully', category, 201);
    } catch (error: any) {
      console.error('❌ Error in CategoryController.create:', error);
      throw error;
    }
  });

  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const business_id = req.user?.business_id || req.query.business_id || 'default';

    // if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
    //   throw new ValidationError('business_id is required');
    // }

    const filters: any = {
      is_active: req.query.is_active ? req.query.is_active === 'true' : undefined,
      kitchen_section_id: req.query.kitchen_section_id as string | undefined,
    };

    // Only add business_id filter if it's provided
    if (business_id) {
      filters.business_id = business_id as string;
    }

    const categories = await this.getCategoriesUseCase.execute(filters);

    return sendSuccess(res, 'Categories retrieved successfully', categories);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const {
      name,
      description,
      details,
      kitchen_section_id,
      sort_order,
      is_active,
      image,
      image_public_id,
      icon,
      icon_public_id,
      language,
      modifier_groups,
      delete_icon, // Extract flag
    } = req.body;

    const business_id = req.user?.business_id || req.body.business_id || 'default';

    // if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
    //   throw new ValidationError('business_id is required');
    // }

    // Parse modifier_groups if it's a string (common in form data)
    let parsedModifierGroups = undefined;
    if (modifier_groups !== undefined) {
      try {
        parsedModifierGroups =
          typeof modifier_groups === 'string' ? JSON.parse(modifier_groups) : modifier_groups;
      } catch (error) {
        throw new ValidationError('Invalid modifier_groups format. Expected JSON array.');
      }
    }

    const category = await this.updateCategoryUseCase.execute(
      id,
      business_id!,
      {
        name,
        description: description || details,
        kitchen_section_id,
        ...(sort_order !== undefined && { sort_order: Number(sort_order) }),
        is_active: is_active === 'true' || is_active === true,
        image,
        image_public_id,
        icon,
        icon_public_id,
        language,
        modifier_groups: parsedModifierGroups,
        apply_modifier_groups_to_items:
          req.body.apply_modifier_groups_to_items === 'true' ||
          req.body.apply_modifier_groups_to_items === true,
        delete_icon: delete_icon === 'true' || delete_icon === true,
      },
      req.files as { [fieldname: string]: Express.Multer.File[] }
    );

    return sendSuccess(res, 'Category updated successfully', category);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    let business_id = req.user?.business_id || req.query.business_id;

    // For super admins, if no business_id, they can get any category
    // if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
    //   throw new ValidationError('business_id is required');
    // }

    if (!business_id && req.user?.role === UserRole.SUPER_ADMIN) {
      business_id = undefined;
    }

    const category = await this.getCategoryByIdUseCase.execute(
      id,
      business_id as string | undefined
    );

    return sendSuccess(res, 'Category retrieved successfully', category);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const business_id = req.user?.business_id || req.query.business_id;

    // if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
    //   throw new ValidationError('business_id is required');
    // }

    await this.deleteCategoryUseCase.execute(id, business_id as string);

    return sendSuccess(res, 'Category deleted successfully');
  });

  updateSortOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      throw new ValidationError('items array is required');
    }

    const repo = new CategoryRepository();
    await repo.updateSortOrder(items);

    return sendSuccess(res, 'Category sort order updated successfully');
  });

  exportCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
    const business_id = req.user?.business_id || req.query.business_id;

    // if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
    //   throw new ValidationError('business_id is required');
    // }

    const filters: any = {
      is_active: req.query.is_active ? req.query.is_active === 'true' : undefined,
      kitchen_section_id: req.query.kitchen_section_id as string | undefined,
    };

    if (business_id) {
      filters.business_id = business_id as string;
    }

    // Use default limit of 1000 for export to get all/most categories
    filters.limit = 1000;
    filters.page = 1;

    const result: any = await this.getCategoriesUseCase.execute(filters);
    const categories = result.data || result; // Handle both paginated and non-paginated responses

    // Helper to safely stringify values for CSV
    const safeString = (val: any) => `"${(val || '').toString().replace(/"/g, '""')}"`;

    // Basics-only export: name, description, sort_order, is_active, kitchen_section_name (no modifier_groups)
    const csvRows = [
      ['name', 'description', 'sort_order', 'is_active', 'kitchen_section_name'].join(','),
      ...categories.map((cat: any) =>
        [
          safeString(cat.name),
          safeString(cat.description),
          cat.sort_order ?? 0,
          cat.is_active ?? true,
          safeString(cat.kitchen_section_data?.name || ''),
        ].join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="categories-export.csv"`);
    res.send(csvContent);
  });

  importCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      throw new ValidationError('CSV file is required');
    }

    // Single-tenant: use default if not provided
    const business_id = req.user?.business_id || req.body.business_id || 'default';

    // if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
    //   throw new ValidationError('business_id is required');
    // }

    const csvContent = req.file.buffer.toString('utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[],
    };

    // Need to get all categories to check for existence/updates efficiently
    const existingResult: any = await this.getCategoriesUseCase.execute({
      business_id: business_id!,
      limit: 1000,
      page: 1,
    } as any);
    const existingCategories = existingResult.data || existingResult;

    for (const record of records as any[]) {
      try {
        if (!record.name) {
          results.errors.push(`Skipping record with missing name: ${JSON.stringify(record)}`);
          continue;
        }

        const categoryData: any = {
          business_id: business_id!,
          name: record.name,
          description: record.description,
          is_active:
            record.is_active === 'true' || record.is_active === true || record.is_active === '1',
          sort_order: parseInt(record.sort_order || '0'),
        };

        // Handle Kitchen Section lookup by name
        if (record.kitchen_section_name) {
          try {
            const section = await this.kitchenSectionRepository.findByName(
              record.kitchen_section_name,
              business_id!
            );
            if (section) {
              categoryData.kitchen_section_id = section.id;
            }
          } catch (err) {
            // Ignore lookup errors
          }
        }

        const existingCategory = existingCategories.find(
          (c: any) => c.name.toLowerCase() === record.name.toLowerCase()
        );

        if (existingCategory) {
          // Update
          await this.updateCategoryUseCase.execute(
            existingCategory.id,
            business_id!,
            categoryData,
            {} // No files for simpler import
          );
          results.updated++;
        } else {
          // Create
          await this.createCategoryUseCase.execute(
            categoryData,
            {} // No files
          );
          results.created++;
        }
      } catch (error: any) {
        results.errors.push(`Error processing ${record.name}: ${error.message}`);
      }
    }

    return sendSuccess(res, 'Import completed', results);
  });
}
