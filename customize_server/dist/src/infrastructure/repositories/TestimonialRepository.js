"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonialRepository = void 0;
const TestimonialModel_1 = require("../database/models/TestimonialModel");
const AppError_1 = require("../../shared/errors/AppError");
class TestimonialRepository {
    toDomain(document) {
        return {
            id: document._id.toString(),
            name: document.name,
            feedback: document.feedback,
            image: document.image,
            role: document.role,
            is_active: document.is_active,
            created_at: new Date(document.created_at).toISOString(),
            updated_at: new Date(document.updated_at).toISOString(),
        };
    }
    async create(data) {
        const testimonial = new TestimonialModel_1.TestimonialModel(data);
        await testimonial.save();
        return this.toDomain(testimonial);
    }
    async update(id, data) {
        const testimonial = await TestimonialModel_1.TestimonialModel.findByIdAndUpdate(id, data, { new: true });
        if (!testimonial)
            throw new AppError_1.NotFoundError('Testimonial not found');
        return this.toDomain(testimonial);
    }
    async delete(id) {
        const result = await TestimonialModel_1.TestimonialModel.findByIdAndDelete(id);
        if (!result)
            throw new AppError_1.NotFoundError('Testimonial not found');
    }
    async findById(id) {
        const testimonial = await TestimonialModel_1.TestimonialModel.findById(id);
        return testimonial ? this.toDomain(testimonial) : null;
    }
    async findAll(query = {}) {
        const testimonials = await TestimonialModel_1.TestimonialModel.find(query).sort({ created_at: -1 });
        return testimonials.map((doc) => this.toDomain(doc));
    }
    async findPaginated(query, page, limit, sort = { created_at: -1 }) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            TestimonialModel_1.TestimonialModel.find(query).sort(sort).skip(skip).limit(limit),
            TestimonialModel_1.TestimonialModel.countDocuments(query),
        ]);
        return {
            data: data.map((doc) => this.toDomain(doc)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
exports.TestimonialRepository = TestimonialRepository;
