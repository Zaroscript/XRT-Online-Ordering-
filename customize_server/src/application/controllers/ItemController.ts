import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { GetItemUseCase } from '../../domain/usecases/items/GetItemUseCase';
import { CreateItemUseCase } from '../../domain/usecases/items/CreateItemUseCase';
import { GetItemsUseCase } from '../../domain/usecases/items/GetItemsUseCase';
import { UpdateItemUseCase } from '../../domain/usecases/items/UpdateItemUseCase';
import { DeleteItemUseCase } from '../../domain/usecases/items/DeleteItemUseCase';
import { ItemRepository } from '../../infrastructure/repositories/ItemRepository';
import { ItemSizeRepository } from '../../infrastructure/repositories/ItemSizeRepository';
import { CloudinaryStorage } from '../../infrastructure/cloudinary/CloudinaryStorage';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ValidationError } from '../../shared/errors/AppError';
import { UserRole } from '../../shared/constants/roles';

export class ItemController {
  private createItemUseCase: CreateItemUseCase;
  private getItemsUseCase: GetItemsUseCase;
  private updateItemUseCase: UpdateItemUseCase;
  private deleteItemUseCase: DeleteItemUseCase;
  private getItemUseCase: GetItemUseCase;

  constructor() {
    const itemRepository = new ItemRepository();
    const imageStorage = new CloudinaryStorage();
    const itemSizeRepository = new ItemSizeRepository();

    this.createItemUseCase = new CreateItemUseCase(
      itemRepository,
      imageStorage,
      itemSizeRepository
    );
    this.getItemsUseCase = new GetItemsUseCase(itemRepository);
    this.updateItemUseCase = new UpdateItemUseCase(
      itemRepository,
      imageStorage,
      itemSizeRepository
    );
    this.deleteItemUseCase = new DeleteItemUseCase(
      itemRepository,
      imageStorage,
      itemSizeRepository
    );
    this.getItemUseCase = new GetItemUseCase(itemRepository);
  }

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      name,
      description,
      sort_order,
      is_active,
      base_price,
      category_id,
      image,
      image_public_id,
      is_available,
      is_signature,
      max_per_order,
      is_sizeable,
      is_customizable,
      default_size_id,
      modifier_groups,
    } = req.body;

    if (!category_id) {
      throw new ValidationError('category_id is required');
    }

    // Parse modifier_groups if it's a string (common in form data)
    let parsedModifierGroups = undefined;
    if (modifier_groups) {
      try {
        parsedModifierGroups =
          typeof modifier_groups === 'string' ? JSON.parse(modifier_groups) : modifier_groups;
      } catch (error) {
        throw new ValidationError('Invalid modifier_groups format. Expected JSON array.');
      }
    }

    try {
      const item = await this.createItemUseCase.execute(
        {
          name,
          description,
          sort_order: sort_order ? parseInt(sort_order as string) : 0,
          is_active: is_active === 'true' || is_active === true,
          base_price: base_price ? parseFloat(base_price as string) : 0,
          category_id,
          image,
          image_public_id,
          is_available: is_available === 'true' || is_available === true,
          is_signature: is_signature === 'true' || is_signature === true,
          max_per_order: max_per_order ? parseInt(max_per_order as string) : undefined,
          is_sizeable:
            is_sizeable !== undefined ? is_sizeable === 'true' || is_sizeable === true : undefined,
          is_customizable:
            is_customizable !== undefined
              ? is_customizable === 'true' || is_customizable === true
              : undefined,
          default_size_id: default_size_id || undefined,
          modifier_groups: parsedModifierGroups,
        },
        req.files as { [fieldname: string]: Express.Multer.File[] }
      );

      return sendSuccess(res, 'Item created successfully', item, 201);
    } catch (error: any) {
      console.error('❌ Error in ItemController.create:', error);
      throw error;
    }
  });

  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      sortedBy = 'desc',
      search,
      name,
      category_id,
      is_active,
      is_available,
      is_signature,
    } = req.query;

    const filters: any = {
      page: Number(page),
      limit: Number(limit),
      orderBy: orderBy as string,
      sortedBy: sortedBy as 'asc' | 'desc',
      search: (search || name) as string | undefined,
      category_id: category_id as string | undefined,
      is_active: is_active ? is_active === 'true' : undefined,
      is_available: is_available ? is_available === 'true' : undefined,
      is_signature: is_signature ? is_signature === 'true' : undefined,
    };

    const result = await this.getItemsUseCase.execute(filters);

    return sendSuccess(res, 'Items retrieved successfully', {
      items: result.items,
      paginatorInfo: {
        total: result.total,
        currentPage: result.page,
        perPage: result.limit,
        totalPages: result.totalPages,
      },
    });
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const {
      name,
      description,
      sort_order,
      is_active,
      base_price,
      category_id,
      image,
      image_public_id,
      is_available,
      is_signature,
      max_per_order,
      is_sizeable,
      is_customizable,
      default_size_id,
      modifier_groups,
    } = req.body;

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

    // Build update data object, only including fields that are actually provided
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (sort_order !== undefined) updateData.sort_order = parseInt(sort_order as string);
    if (is_active !== undefined) {
      updateData.is_active = is_active === 'true' || is_active === true;
    }
    if (base_price !== undefined) updateData.base_price = parseFloat(base_price as string);
    if (category_id !== undefined) updateData.category_id = category_id;
    if (image !== undefined) updateData.image = image;
    if (image_public_id !== undefined) updateData.image_public_id = image_public_id;
    if (is_available !== undefined) {
      updateData.is_available = is_available === 'true' || is_available === true;
    }
    if (is_signature !== undefined) {
      updateData.is_signature = is_signature === 'true' || is_signature === true;
    }
    if (max_per_order !== undefined) updateData.max_per_order = parseInt(max_per_order as string);
    if (is_sizeable !== undefined) {
      updateData.is_sizeable = is_sizeable === 'true' || is_sizeable === true;
    }
    if (is_customizable !== undefined) {
      updateData.is_customizable = is_customizable === 'true' || is_customizable === true;
    }
    if (default_size_id !== undefined) updateData.default_size_id = default_size_id || null;
    if (parsedModifierGroups !== undefined) updateData.modifier_groups = parsedModifierGroups;

    const item = await this.updateItemUseCase.execute(
      id,
      updateData,
      req.files as { [fieldname: string]: Express.Multer.File[] }
    );

    return sendSuccess(res, 'Item updated successfully', item);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const item = await this.getItemUseCase.execute(id);

    return sendSuccess(res, 'Item retrieved successfully', item);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    await this.deleteItemUseCase.execute(id);

    return sendSuccess(res, 'Item deleted successfully');
  });

  updateSortOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      throw new ValidationError('items array is required');
    }

    // We can reuse the same repo method directly or wrap it in a UseCase.
    // For simplicity and uniformity with the plan, let's use a repository method directly for now
    // or create the generic UseCase instance if we want to be strict.
    // Given the plan defined `UpdateSortOrderUseCase`, let's use it if we instantiate it,
    // OR just call the repository since it's a simple proxy.
    // Plan said: "Implement updateSortOrder use case in admin data layer" (Frontend)
    // Backend plan said: "Create UseCase to handle bulk update logic".

    // Let's create a local instance or just call repo for expediency as it's a simple pass-through.
    // Actually, let's stick to the pattern and use the repo directly here as the controller logic is minimal.
    const repo = new ItemRepository();
    await repo.updateSortOrder(items);

    return sendSuccess(res, 'Item sort order updated successfully');
  });
}
