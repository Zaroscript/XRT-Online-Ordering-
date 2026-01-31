import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { sendSuccess, sendError } from '../../shared/utils/response';
import { CreateItemSizeUseCase } from '../../domain/usecases/item-sizes/CreateItemSizeUseCase';
import { UpdateItemSizeUseCase } from '../../domain/usecases/item-sizes/UpdateItemSizeUseCase';
import { GetItemSizesUseCase } from '../../domain/usecases/item-sizes/GetItemSizesUseCase';
import { GetItemSizeUseCase } from '../../domain/usecases/item-sizes/GetItemSizeUseCase';
import { DeleteItemSizeUseCase } from '../../domain/usecases/item-sizes/DeleteItemSizeUseCase';
import { ItemSizeRepository } from '../../infrastructure/repositories/ItemSizeRepository';
import {
  CreateItemSizeDTO,
  UpdateItemSizeDTO,
  ItemSizeFilters,
} from '../../domain/entities/ItemSize';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ValidationError } from '../../shared/errors/AppError';
import { UserRole } from '../../shared/constants/roles';

export class ItemSizeController {
  private createItemSizeUseCase: CreateItemSizeUseCase;
  private updateItemSizeUseCase: UpdateItemSizeUseCase;
  private getItemSizesUseCase: GetItemSizesUseCase;
  private getItemSizeUseCase: GetItemSizeUseCase;
  private deleteItemSizeUseCase: DeleteItemSizeUseCase;

  constructor() {
    const itemSizeRepository = new ItemSizeRepository();

    this.createItemSizeUseCase = new CreateItemSizeUseCase(itemSizeRepository);
    this.updateItemSizeUseCase = new UpdateItemSizeUseCase(itemSizeRepository);
    this.getItemSizesUseCase = new GetItemSizesUseCase(itemSizeRepository);
    this.getItemSizeUseCase = new GetItemSizeUseCase(itemSizeRepository);
    this.deleteItemSizeUseCase = new DeleteItemSizeUseCase(itemSizeRepository);
  }

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const business_id = req.user?.business_id || req.body.business_id || req.body.restaurant_id;

    if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
      throw new ValidationError('restaurant_id is required');
    }

    const sizeData: CreateItemSizeDTO = {
      business_id: business_id,
      name: req.body.name,
      code: req.body.code,
      display_order: req.body.display_order,
      is_active: req.body.is_active,
    };

    const itemSize = await this.createItemSizeUseCase.execute(sizeData);

    return sendSuccess(res, 'Item size created successfully', itemSize, 201);
  });

  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const business_id = req.user?.business_id;

    const filters: ItemSizeFilters = {
      business_id: business_id,
      is_active: req.query.is_active ? req.query.is_active === 'true' : undefined,
    };

    const sizes = await this.getItemSizesUseCase.execute(filters);

    return sendSuccess(res, 'Item sizes retrieved successfully', sizes);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // TODO: Verify business ownership logic if strict
    // For now assuming ID lookup is enough or UseCase handles it
    const itemSize = await this.getItemSizeUseCase.execute(id);

    if (!itemSize) {
      return sendError(res, 'Item size not found', 404);
    }

    return sendSuccess(res, 'Item size retrieved successfully', itemSize);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const updateData: UpdateItemSizeDTO = {
      name: req.body.name,
      code: req.body.code,
      display_order: req.body.display_order,
      is_active: req.body.is_active,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof UpdateItemSizeDTO] === undefined) {
        delete updateData[key as keyof UpdateItemSizeDTO];
      }
    });

    const itemSize = await this.updateItemSizeUseCase.execute(id, updateData);

    return sendSuccess(res, 'Item size updated successfully', itemSize);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    await this.deleteItemSizeUseCase.execute(id);

    return sendSuccess(res, 'Item size deleted successfully', null, 200);
  });

  updateSortOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      throw new ValidationError('items array is required');
    }

    const repo = new ItemSizeRepository();
    await repo.updateSortOrder(items);

    return sendSuccess(res, 'Item size sort order updated successfully');
  });
}
