"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonialController = void 0;
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const TestimonialRepository_1 = require("../../infrastructure/repositories/TestimonialRepository");
const response_1 = require("../../shared/utils/response");
class TestimonialController {
    constructor() {
        this.create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const testimonial = await this.repository.create(req.body);
            return (0, response_1.sendSuccess)(res, 'Testimonial created successfully', testimonial);
        });
        this.update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const testimonial = await this.repository.update(id, req.body);
            return (0, response_1.sendSuccess)(res, 'Testimonial updated successfully', testimonial);
        });
        this.delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await this.repository.delete(id);
            return (0, response_1.sendSuccess)(res, 'Testimonial deleted successfully');
        });
        this.getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { active } = req.query;
            const query = {};
            if (active === 'true') {
                query.is_active = true;
            }
            const testimonials = await this.repository.findAll(query);
            return (0, response_1.sendSuccess)(res, 'Testimonials retrieved successfully', testimonials);
        });
        this.getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const testimonial = await this.repository.findById(id);
            if (!testimonial)
                return (0, response_1.sendError)(res, 'Testimonial not found', 404);
            return (0, response_1.sendSuccess)(res, 'Testimonial retrieved successfully', testimonial);
        });
        this.paginated = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 15, orderBy, sortedBy, search } = req.query;
            const query = {};
            if (search) {
                const searchString = search;
                query.$or = [
                    { name: { $regex: searchString, $options: 'i' } },
                    { role: { $regex: searchString, $options: 'i' } },
                ];
            }
            const sort = {};
            if (orderBy) {
                sort[orderBy] = sortedBy === 'asc' ? 1 : -1;
            }
            else {
                sort.created_at = -1;
            }
            const result = await this.repository.findPaginated(query, Number(page), Number(limit), sort);
            const response = {
                data: result.data,
                current_page: result.page,
                per_page: result.limit,
                total: result.total,
                last_page: result.totalPages,
            };
            return (0, response_1.sendSuccess)(res, 'Testimonials retrieved successfully', response);
        });
        this.repository = new TestimonialRepository_1.TestimonialRepository();
    }
}
exports.TestimonialController = TestimonialController;
