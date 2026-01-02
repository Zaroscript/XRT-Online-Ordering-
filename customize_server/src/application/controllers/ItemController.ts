import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { GetItemUseCase } from '../../domain/usecases/items/GetItemUseCase';
import { CreateItemUseCase } from '../../domain/usecases/items/CreateItemUseCase';
import { GetItemsUseCase } from '../../domain/usecases/items/GetItemsUseCase';
import { UpdateItemUseCase } from '../../domain/usecases/items/UpdateItemUseCase';
import { DeleteItemUseCase } from '../../domain/usecases/items/DeleteItemUseCase';
import { ItemRepository } from '../../infrastructure/repositories/ItemRepository';
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

        this.createItemUseCase = new CreateItemUseCase(itemRepository, imageStorage);
        this.getItemsUseCase = new GetItemsUseCase(itemRepository);
        this.updateItemUseCase = new UpdateItemUseCase(itemRepository, imageStorage);
        this.deleteItemUseCase = new DeleteItemUseCase(itemRepository, imageStorage);
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
            sizes,
        } = req.body;
        const business_id = req.user?.business_id || req.body.business_id;

        if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
            throw new ValidationError('business_id is required');
        }

        if (!category_id) {
            throw new ValidationError('category_id is required');
        }

        // Parse sizes if it's a string (common in form data)
        let parsedSizes = undefined;
        if (sizes) {
            try {
                parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
            } catch (error) {
                throw new ValidationError('Invalid sizes format. Expected JSON array.');
            }
        }

        try {
            const item = await this.createItemUseCase.execute(
                {
                    business_id: business_id!,
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
                    is_sizeable: is_sizeable !== undefined ? (is_sizeable === 'true' || is_sizeable === true) : undefined,
                    is_customizable: is_customizable !== undefined ? (is_customizable === 'true' || is_customizable === true) : undefined,
                    sizes: parsedSizes,
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
            business_id: queryBusinessId,
        } = req.query;

        // For non-super-admins, filter by their business_id
        const business_id = req.user?.role === UserRole.SUPER_ADMIN
            ? (queryBusinessId as string)
            : (req.user?.business_id || queryBusinessId as string);

        if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
            throw new ValidationError('business_id is required');
        }

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

        if (business_id) {
            filters.business_id = business_id as string;
        }

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
            sizes,
        } = req.body;
        
        // Get business_id from user or request body
        let business_id = req.user?.business_id || req.body.business_id;
        
        // For SUPER_ADMIN, allow business_id from query or body, or try to get from existing item
        if (!business_id && req.user?.role === UserRole.SUPER_ADMIN) {
            business_id = req.query.business_id as string;
            // If still no business_id, we'll need to find the item first to get its business_id
            if (!business_id) {
                const existingItem = await this.getItemUseCase.execute(id, undefined);
                if (existingItem) {
                    business_id = existingItem.business_id;
                }
            }
        }

        if (!business_id) {
            throw new ValidationError('business_id is required');
        }

        // Parse sizes if it's a string (common in form data)
        let parsedSizes = undefined;
        if (sizes !== undefined) {
            try {
                parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
            } catch (error) {
                throw new ValidationError('Invalid sizes format. Expected JSON array.');
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
        if (parsedSizes !== undefined) updateData.sizes = parsedSizes;

        const item = await this.updateItemUseCase.execute(
            id,
            business_id,
            updateData,
            req.files as { [fieldname: string]: Express.Multer.File[] }
        );

        return sendSuccess(res, 'Item updated successfully', item);
    });

    getById = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        let business_id = req.user?.business_id || req.query.business_id;

        if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
            throw new ValidationError('business_id is required');
        }

        if (!business_id && req.user?.role === UserRole.SUPER_ADMIN) {
            business_id = undefined;
        }

        const item = await this.getItemUseCase.execute(id, business_id as string | undefined);

        return sendSuccess(res, 'Item retrieved successfully', item);
    });

    delete = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        let business_id = req.user?.business_id || req.query.business_id as string;

        // For SUPER_ADMIN, try to get business_id from existing item if not provided
        if (!business_id && req.user?.role === UserRole.SUPER_ADMIN) {
            const existingItem = await this.getItemUseCase.execute(id, undefined);
            if (existingItem) {
                business_id = existingItem.business_id;
            }
        }

        if (!business_id) {
            throw new ValidationError('business_id is required');
        }

        await this.deleteItemUseCase.execute(id, business_id);

        return sendSuccess(res, 'Item deleted successfully');
    });
}
