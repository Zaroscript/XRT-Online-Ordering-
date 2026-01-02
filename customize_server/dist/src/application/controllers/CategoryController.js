"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const GetCategoryByIdUseCase_1 = require("../../domain/usecases/categories/GetCategoryByIdUseCase");
const CreateCategoryUseCase_1 = require("../../domain/usecases/categories/CreateCategoryUseCase");
const GetCategoriesUseCase_1 = require("../../domain/usecases/categories/GetCategoriesUseCase");
const UpdateCategoryUseCase_1 = require("../../domain/usecases/categories/UpdateCategoryUseCase");
const DeleteCategoryUseCase_1 = require("../../domain/usecases/categories/DeleteCategoryUseCase");
const CategoryRepository_1 = require("../../infrastructure/repositories/CategoryRepository");
const CloudinaryStorage_1 = require("../../infrastructure/cloudinary/CloudinaryStorage");
const response_1 = require("../../shared/utils/response");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const AppError_1 = require("../../shared/errors/AppError");
const roles_1 = require("../../shared/constants/roles");
class CategoryController {
    constructor() {
        this.create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { name, description, details, kitchen_section_id, sort_order, is_active, image, image_public_id, icon, icon_public_id, language, } = req.body;
            const business_id = req.user?.business_id || req.body.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            try {
                const category = await this.createCategoryUseCase.execute({
                    business_id: business_id,
                    name,
                    description: description || details,
                    kitchen_section_id,
                    sort_order: sort_order ? parseInt(sort_order) : 0,
                    is_active: is_active === 'true' || is_active === true,
                    image,
                    image_public_id,
                    icon,
                    icon_public_id,
                    language,
                }, req.files);
                return (0, response_1.sendSuccess)(res, 'Category created successfully', category, 201);
            }
            catch (error) {
                console.error('❌ Error in CategoryController.create:', error);
                throw error;
            }
        });
        this.getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const business_id = req.user?.business_id || req.query.business_id;
            // For super admins, allow getting all categories if no business_id is provided
            // For other users, business_id is required
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            const filters = {
                is_active: req.query.is_active ? req.query.is_active === 'true' : undefined,
                kitchen_section_id: req.query.kitchen_section_id,
            };
            // Only add business_id filter if it's provided
            if (business_id) {
                filters.business_id = business_id;
            }
            const categories = await this.getCategoriesUseCase.execute(filters);
            return (0, response_1.sendSuccess)(res, 'Categories retrieved successfully', categories);
        });
        this.update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { name, description, details, kitchen_section_id, sort_order, is_active, image, image_public_id, icon, icon_public_id, language, } = req.body;
            const business_id = req.user?.business_id || req.body.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            const category = await this.updateCategoryUseCase.execute(id, business_id, {
                name,
                description: description || details,
                kitchen_section_id,
                sort_order: sort_order ? parseInt(sort_order) : 0,
                is_active: is_active === 'true' || is_active === true,
                image,
                image_public_id,
                icon,
                icon_public_id,
                language,
            }, req.files);
            return (0, response_1.sendSuccess)(res, 'Category updated successfully', category);
        });
        this.getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            let business_id = req.user?.business_id || req.query.business_id;
            // For super admins, if no business_id, they can get any category
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            if (!business_id && req.user?.role === roles_1.UserRole.SUPER_ADMIN) {
                business_id = undefined;
            }
            const category = await this.getCategoryByIdUseCase.execute(id, business_id);
            return (0, response_1.sendSuccess)(res, 'Category retrieved successfully', category);
        });
        this.delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const business_id = req.user?.business_id || req.query.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            await this.deleteCategoryUseCase.execute(id, business_id);
            return (0, response_1.sendSuccess)(res, 'Category deleted successfully');
        });
        const categoryRepository = new CategoryRepository_1.CategoryRepository();
        const imageStorage = new CloudinaryStorage_1.CloudinaryStorage();
        this.createCategoryUseCase = new CreateCategoryUseCase_1.CreateCategoryUseCase(categoryRepository, imageStorage);
        this.getCategoriesUseCase = new GetCategoriesUseCase_1.GetCategoriesUseCase(categoryRepository);
        this.updateCategoryUseCase = new UpdateCategoryUseCase_1.UpdateCategoryUseCase(categoryRepository, imageStorage);
        this.deleteCategoryUseCase = new DeleteCategoryUseCase_1.DeleteCategoryUseCase(categoryRepository, imageStorage);
        this.getCategoryByIdUseCase = new GetCategoryByIdUseCase_1.GetCategoryByIdUseCase(categoryRepository);
    }
}
exports.CategoryController = CategoryController;
