import {
  Testimonial,
  CreateTestimonialDTO,
  UpdateTestimonialDTO,
} from '../../domain/entities/Testimonial';
import { TestimonialModel, TestimonialDocument } from '../database/models/TestimonialModel';
import { NotFoundError } from '../../shared/errors/AppError';

export class TestimonialRepository {
  private toDomain(document: TestimonialDocument): Testimonial {
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

  async create(data: CreateTestimonialDTO): Promise<Testimonial> {
    const testimonial = new TestimonialModel(data);
    await testimonial.save();
    return this.toDomain(testimonial);
  }

  async update(id: string, data: UpdateTestimonialDTO): Promise<Testimonial> {
    const testimonial = await TestimonialModel.findByIdAndUpdate(id, data, { new: true });
    if (!testimonial) throw new NotFoundError('Testimonial not found');
    return this.toDomain(testimonial);
  }

  async delete(id: string): Promise<void> {
    const result = await TestimonialModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundError('Testimonial not found');
  }

  async findById(id: string): Promise<Testimonial | null> {
    const testimonial = await TestimonialModel.findById(id);
    return testimonial ? this.toDomain(testimonial) : null;
  }

  async findAll(query: any = {}): Promise<Testimonial[]> {
    const testimonials = await TestimonialModel.find(query).sort({ created_at: -1 });
    return testimonials.map((doc) => this.toDomain(doc));
  }

  async findPaginated(query: any, page: number, limit: number, sort: any = { created_at: -1 }) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      TestimonialModel.find(query).sort(sort).skip(skip).limit(limit),
      TestimonialModel.countDocuments(query),
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
