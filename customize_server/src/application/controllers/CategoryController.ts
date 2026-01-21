import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { GetCategoryByIdUseCase } from '../../domain/usecases/categories/GetCategoryByIdUseCase';
import { CreateCategoryUseCase } from '../../domain/usecases/categories/CreateCategoryUseCase';
import { GetCategoriesUseCase } from '../../domain/usecases/categories/GetCategoriesUseCase';
import { UpdateCategoryUseCase } from '../../domain/usecases/categories/UpdateCategoryUseCase';
import { DeleteCategoryUseCase } from '../../domain/usecases/categories/DeleteCategoryUseCase';
import { CategoryRepository } from '../../infrastructure/repositories/CategoryRepository';
import { ItemRepository } from '../../infrastructure/repositories/ItemRepository';
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

  constructor() {
    const categoryRepository = new CategoryRepository();
    const itemRepository = new ItemRepository();
    const imageStorage = new CloudinaryStorage();

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
    const business_id = req.user?.business_id || req.body.business_id;

    if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
      throw new ValidationError('business_id is required');
    }

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
    const business_id = req.user?.business_id || req.query.business_id;

    // For super admins, allow getting all categories if no business_id is provided
    // For other users, business_id is required
    if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
      throw new ValidationError('business_id is required');
    }

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
    } = req.body;

    console.log('--- UPDATE CATEGORY REQUEST ---');
    console.log('Payload Body Keys:', Object.keys(req.body));
    console.log('Modifier Groups (Raw):', modifier_groups);
    // @ts-ignore
    console.log('Apply to Items Flag (Raw):', req.body.apply_modifier_groups_to_items);
    console.log('-------------------------------');

    const business_id = req.user?.business_id || req.body.business_id;

    if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
      throw new ValidationError('business_id is required');
    }

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

    return sendSuccess(res, 'Category updated successfully', category);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    let business_id = req.user?.business_id || req.query.business_id;

    // For super admins, if no business_id, they can get any category
    if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
      throw new ValidationError('business_id is required');
    }

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

    if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
      throw new ValidationError('business_id is required');
    }

    await this.deleteCategoryUseCase.execute(id, business_id as string);

    return sendSuccess(res, 'Category deleted successfully');
  });
}
