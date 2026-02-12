"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemController = void 0;
const GetItemUseCase_1 = require("../../domain/usecases/items/GetItemUseCase");
const CreateItemUseCase_1 = require("../../domain/usecases/items/CreateItemUseCase");
const GetItemsUseCase_1 = require("../../domain/usecases/items/GetItemsUseCase");
const UpdateItemUseCase_1 = require("../../domain/usecases/items/UpdateItemUseCase");
const DeleteItemUseCase_1 = require("../../domain/usecases/items/DeleteItemUseCase");
const ItemRepository_1 = require("../../infrastructure/repositories/ItemRepository");
const ItemSizeRepository_1 = require("../../infrastructure/repositories/ItemSizeRepository");
const CloudinaryStorage_1 = require("../../infrastructure/cloudinary/CloudinaryStorage");
const response_1 = require("../../shared/utils/response");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const AppError_1 = require("../../shared/errors/AppError");
class ItemController {
    constructor() {
        this.create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { name, description, sort_order, is_active, base_price, category_id, image, image_public_id, is_available, is_signature, max_per_order, is_sizeable, is_customizable, default_size_id, sizes, modifier_groups, } = req.body;
            if (!category_id) {
                throw new AppError_1.ValidationError('category_id is required');
            }
            // Parse modifier_groups if it's a string (common in form data)
            let parsedModifierGroups = undefined;
            if (modifier_groups) {
                try {
                    parsedModifierGroups =
                        typeof modifier_groups === 'string' ? JSON.parse(modifier_groups) : modifier_groups;
                }
                catch (error) {
                    throw new AppError_1.ValidationError('Invalid modifier_groups format. Expected JSON array.');
                }
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
                    is_sizeable: is_sizeable !== undefined ? is_sizeable === 'true' || is_sizeable === true : undefined,
                    is_customizable: is_customizable !== undefined
                        ? is_customizable === 'true' || is_customizable === true
                        : undefined,
                    default_size_id: default_size_id || undefined,
                    sizes: Array.isArray(parsedSizes) ? parsedSizes : undefined,
                    modifier_groups: parsedModifierGroups,
                }, req.files);
                return (0, response_1.sendSuccess)(res, 'Item created successfully', item, 201);
            }
            catch (error) {
                console.error('❌ Error in ItemController.create:', error);
                throw error;
            }
        });
        this.getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 10, orderBy = 'created_at', sortedBy = 'desc', search, name, category_id, is_active, is_available, is_signature, } = req.query;
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
            const { name, description, sort_order, is_active, base_price, category_id, image, image_public_id, is_available, is_signature, max_per_order, is_sizeable, is_customizable, default_size_id, modifier_groups, } = req.body;
            // Parse modifier_groups if it's a string (common in form data)
            let parsedModifierGroups = undefined;
            if (modifier_groups !== undefined) {
                try {
                    parsedModifierGroups =
                        typeof modifier_groups === 'string' ? JSON.parse(modifier_groups) : modifier_groups;
                }
                catch (error) {
                    throw new AppError_1.ValidationError('Invalid modifier_groups format. Expected JSON array.');
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
            if (default_size_id !== undefined)
                updateData.default_size_id = default_size_id || null;
            if (parsedModifierGroups !== undefined)
                updateData.modifier_groups = parsedModifierGroups;
            if (req.body.sizes !== undefined) {
                try {
                    const parsed = typeof req.body.sizes === 'string' ? JSON.parse(req.body.sizes) : req.body.sizes;
                    updateData.sizes = Array.isArray(parsed) ? parsed : undefined;
                }
                catch {
                    updateData.sizes = undefined;
                }
            }
            const item = await this.updateItemUseCase.execute(id, updateData, req.files);
            return (0, response_1.sendSuccess)(res, 'Item updated successfully', item);
        });
        this.getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const item = await this.getItemUseCase.execute(id);
            return (0, response_1.sendSuccess)(res, 'Item retrieved successfully', item);
        });
        this.delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await this.deleteItemUseCase.execute(id);
            return (0, response_1.sendSuccess)(res, 'Item deleted successfully');
        });
        this.updateSortOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { items } = req.body;
            if (!items || !Array.isArray(items)) {
                throw new AppError_1.ValidationError('items array is required');
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
            const repo = new ItemRepository_1.ItemRepository();
            await repo.updateSortOrder(items);
            return (0, response_1.sendSuccess)(res, 'Item sort order updated successfully');
        });
        this.exportItems = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const category_id = req.query.category_id;
            // Get all items without business filter for now since items are linked via category
            const filters = {
                page: 1,
                limit: 1000,
                orderBy: 'sort_order',
                sortedBy: 'asc',
                category_id,
            };
            const result = await this.getItemsUseCase.execute(filters);
            const items = result.items || [];
            // Helper to safely stringify values for CSV
            const safeString = (val) => `"${(val || '').toString().replace(/"/g, '""')}"`;
            // Helper to format sizes
            const formatSizes = (sizes) => {
                if (!sizes || !Array.isArray(sizes))
                    return '';
                return sizes
                    .map((s) => {
                    const name = s.size_id?.name || s.name || 'Unknown Size'; // Handle populated vs embedded
                    const price = s.price !== undefined ? `$${s.price}` : '';
                    const defaultLabel = s.is_default ? ' [Default]' : '';
                    return `${name} (${price})${defaultLabel}`;
                })
                    .join('; ');
            };
            // Helper to format modifier groups
            const formatModifierGroups = (groups) => {
                if (!groups || !Array.isArray(groups))
                    return '';
                return groups
                    .map((g) => {
                    const name = g.modifier_group?.name || 'Unknown Group';
                    const min = g.modifier_group?.min_select ?? 0;
                    const max = g.modifier_group?.max_select ?? 1;
                    return `${name} (Min:${min} Max:${max})`;
                })
                    .join('; ');
            };
            // Helper to get default size name
            const getDefaultSizeName = (item) => {
                if (!item.default_size_id || !Array.isArray(item.sizes))
                    return '';
                const defaultSize = item.sizes.find((s) => s.size_id === item.default_size_id);
                return defaultSize?.name || item.default_size_id || '';
            };
            // Convert to CSV
            const csvRows = [
                [
                    'name',
                    'description',
                    'base_price',
                    'is_active',
                    'is_available',
                    'is_signature',
                    'is_sizeable',
                    'is_customizable',
                    'sort_order',
                    'category_name',
                    'max_per_order',
                    'image',
                    'default_size_name',
                    'sizes',
                    'modifier_groups',
                ].join(','),
                ...items.map((item) => [
                    safeString(item.name),
                    safeString(item.description),
                    item.base_price || 0,
                    item.is_active,
                    item.is_available,
                    item.is_signature,
                    item.is_sizeable,
                    item.is_customizable,
                    item.sort_order,
                    safeString(item.category?.name),
                    item.max_per_order || '',
                    safeString(item.image),
                    safeString(getDefaultSizeName(item)), // Export name instead of ID
                    safeString(formatSizes(item.sizes)),
                    safeString(formatModifierGroups(item.modifier_groups)),
                ].join(',')),
            ];
            const csvContent = csvRows.join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="items-export.csv"`);
            res.send(csvContent);
        });
        const itemRepository = new ItemRepository_1.ItemRepository();
        const imageStorage = new CloudinaryStorage_1.CloudinaryStorage();
        const itemSizeRepository = new ItemSizeRepository_1.ItemSizeRepository();
        this.createItemUseCase = new CreateItemUseCase_1.CreateItemUseCase(itemRepository, imageStorage, itemSizeRepository);
        this.getItemsUseCase = new GetItemsUseCase_1.GetItemsUseCase(itemRepository);
        this.updateItemUseCase = new UpdateItemUseCase_1.UpdateItemUseCase(itemRepository, imageStorage, itemSizeRepository);
        this.deleteItemUseCase = new DeleteItemUseCase_1.DeleteItemUseCase(itemRepository, imageStorage, itemSizeRepository);
        this.getItemUseCase = new GetItemUseCase_1.GetItemUseCase(itemRepository);
    }
}
exports.ItemController = ItemController;
