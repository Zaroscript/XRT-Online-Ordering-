"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemController = void 0;
const GetItemUseCase_1 = require("../../domain/usecases/items/GetItemUseCase");
const CreateItemUseCase_1 = require("../../domain/usecases/items/CreateItemUseCase");
const GetItemsUseCase_1 = require("../../domain/usecases/items/GetItemsUseCase");
const UpdateItemUseCase_1 = require("../../domain/usecases/items/UpdateItemUseCase");
const DeleteItemUseCase_1 = require("../../domain/usecases/items/DeleteItemUseCase");
const ItemRepository_1 = require("../../infrastructure/repositories/ItemRepository");
const CloudinaryStorage_1 = require("../../infrastructure/cloudinary/CloudinaryStorage");
const response_1 = require("../../shared/utils/response");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const AppError_1 = require("../../shared/errors/AppError");
const roles_1 = require("../../shared/constants/roles");
class ItemController {
    constructor() {
        this.create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { name, description, sort_order, is_active, base_price, category_id, image, image_public_id, is_available, is_signature, max_per_order, is_sizeable, is_customizable, sizes, } = req.body;
            const business_id = req.user?.business_id || req.body.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            if (!category_id) {
                throw new AppError_1.ValidationError('category_id is required');
            }
            // Parse sizes if it's a string (common in form data)
            let parsedSizes = undefined;
            if (sizes) {
                try {
                    parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
                }
                catch (error) {
                    throw new AppError_1.ValidationError('Invalid sizes format. Expected JSON array.');
                }
            }
            try {
                const item = await this.createItemUseCase.execute({
                    business_id: business_id,
                    name,
                    description,
                    sort_order: sort_order ? parseInt(sort_order) : 0,
                    is_active: is_active === 'true' || is_active === true,
                    base_price: base_price ? parseFloat(base_price) : 0,
                    category_id,
                    image,
                    image_public_id,
                    is_available: is_available === 'true' || is_available === true,
                    is_signature: is_signature === 'true' || is_signature === true,
                    max_per_order: max_per_order ? parseInt(max_per_order) : undefined,
                    is_sizeable: is_sizeable !== undefined ? (is_sizeable === 'true' || is_sizeable === true) : undefined,
                    is_customizable: is_customizable !== undefined ? (is_customizable === 'true' || is_customizable === true) : undefined,
                    sizes: parsedSizes,
                }, req.files);
                return (0, response_1.sendSuccess)(res, 'Item created successfully', item, 201);
            }
            catch (error) {
                console.error('❌ Error in ItemController.create:', error);
                throw error;
            }
        });
        this.getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 10, orderBy = 'created_at', sortedBy = 'desc', search, name, category_id, is_active, is_available, is_signature, business_id: queryBusinessId, } = req.query;
            // For non-super-admins, filter by their business_id
            const business_id = req.user?.role === roles_1.UserRole.SUPER_ADMIN
                ? queryBusinessId
                : (req.user?.business_id || queryBusinessId);
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            const filters = {
                page: Number(page),
                limit: Number(limit),
                orderBy: orderBy,
                sortedBy: sortedBy,
                search: (search || name),
                category_id: category_id,
                is_active: is_active ? is_active === 'true' : undefined,
                is_available: is_available ? is_available === 'true' : undefined,
                is_signature: is_signature ? is_signature === 'true' : undefined,
            };
            if (business_id) {
                filters.business_id = business_id;
            }
            const result = await this.getItemsUseCase.execute(filters);
            return (0, response_1.sendSuccess)(res, 'Items retrieved successfully', {
                items: result.items,
                paginatorInfo: {
                    total: result.total,
                    currentPage: result.page,
                    perPage: result.limit,
                    totalPages: result.totalPages,
                },
            });
        });
        this.update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { name, description, sort_order, is_active, base_price, category_id, image, image_public_id, is_available, is_signature, max_per_order, is_sizeable, is_customizable, sizes, } = req.body;
            // Get business_id from user or request body
            let business_id = req.user?.business_id || req.body.business_id;
            // For SUPER_ADMIN, allow business_id from query or body, or try to get from existing item
            if (!business_id && req.user?.role === roles_1.UserRole.SUPER_ADMIN) {
                business_id = req.query.business_id;
                // If still no business_id, we'll need to find the item first to get its business_id
                if (!business_id) {
                    const existingItem = await this.getItemUseCase.execute(id, undefined);
                    if (existingItem) {
                        business_id = existingItem.business_id;
                    }
                }
            }
            if (!business_id) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            // Parse sizes if it's a string (common in form data)
            let parsedSizes = undefined;
            if (sizes !== undefined) {
                try {
                    parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
                }
                catch (error) {
                    throw new AppError_1.ValidationError('Invalid sizes format. Expected JSON array.');
                }
            }
            // Build update data object, only including fields that are actually provided
            const updateData = {};
            if (name !== undefined)
                updateData.name = name;
            if (description !== undefined)
                updateData.description = description;
            if (sort_order !== undefined)
                updateData.sort_order = parseInt(sort_order);
            if (is_active !== undefined) {
                updateData.is_active = is_active === 'true' || is_active === true;
            }
            if (base_price !== undefined)
                updateData.base_price = parseFloat(base_price);
            if (category_id !== undefined)
                updateData.category_id = category_id;
            if (image !== undefined)
                updateData.image = image;
            if (image_public_id !== undefined)
                updateData.image_public_id = image_public_id;
            if (is_available !== undefined) {
                updateData.is_available = is_available === 'true' || is_available === true;
            }
            if (is_signature !== undefined) {
                updateData.is_signature = is_signature === 'true' || is_signature === true;
            }
            if (max_per_order !== undefined)
                updateData.max_per_order = parseInt(max_per_order);
            if (is_sizeable !== undefined) {
                updateData.is_sizeable = is_sizeable === 'true' || is_sizeable === true;
            }
            if (is_customizable !== undefined) {
                updateData.is_customizable = is_customizable === 'true' || is_customizable === true;
            }
            if (parsedSizes !== undefined)
                updateData.sizes = parsedSizes;
            const item = await this.updateItemUseCase.execute(id, business_id, updateData, req.files);
            return (0, response_1.sendSuccess)(res, 'Item updated successfully', item);
        });
        this.getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            let business_id = req.user?.business_id || req.query.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            if (!business_id && req.user?.role === roles_1.UserRole.SUPER_ADMIN) {
                business_id = undefined;
            }
            const item = await this.getItemUseCase.execute(id, business_id);
            return (0, response_1.sendSuccess)(res, 'Item retrieved successfully', item);
        });
        this.delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            let business_id = req.user?.business_id || req.query.business_id;
            // For SUPER_ADMIN, try to get business_id from existing item if not provided
            if (!business_id && req.user?.role === roles_1.UserRole.SUPER_ADMIN) {
                const existingItem = await this.getItemUseCase.execute(id, undefined);
                if (existingItem) {
                    business_id = existingItem.business_id;
                }
            }
            if (!business_id) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            await this.deleteItemUseCase.execute(id, business_id);
            return (0, response_1.sendSuccess)(res, 'Item deleted successfully');
        });
        const itemRepository = new ItemRepository_1.ItemRepository();
        const imageStorage = new CloudinaryStorage_1.CloudinaryStorage();
        this.createItemUseCase = new CreateItemUseCase_1.CreateItemUseCase(itemRepository, imageStorage);
        this.getItemsUseCase = new GetItemsUseCase_1.GetItemsUseCase(itemRepository);
        this.updateItemUseCase = new UpdateItemUseCase_1.UpdateItemUseCase(itemRepository, imageStorage);
        this.deleteItemUseCase = new DeleteItemUseCase_1.DeleteItemUseCase(itemRepository, imageStorage);
        this.getItemUseCase = new GetItemUseCase_1.GetItemUseCase(itemRepository);
    }
}
exports.ItemController = ItemController;
