import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { TestimonialRepository } from '../../infrastructure/repositories/TestimonialRepository';
import { sendSuccess, sendError } from '../../shared/utils/response';

export class TestimonialController {
  private repository: TestimonialRepository;

  constructor() {
    this.repository = new TestimonialRepository();
  }

  create = asyncHandler(async (req: Request, res: Response) => {
    const testimonial = await this.repository.create(req.body);
    return sendSuccess(res, 'Testimonial created successfully', testimonial);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const testimonial = await this.repository.update(id, req.body);
    return sendSuccess(res, 'Testimonial updated successfully', testimonial);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.repository.delete(id);
    return sendSuccess(res, 'Testimonial deleted successfully');
  });

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { active } = req.query;
    const query: any = {};
    if (active === 'true') {
      query.is_active = true;
    }
    const testimonials = await this.repository.findAll(query);
    return sendSuccess(res, 'Testimonials retrieved successfully', testimonials);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const testimonial = await this.repository.findById(id);
    if (!testimonial) return sendError(res, 'Testimonial not found', 404);
    return sendSuccess(res, 'Testimonial retrieved successfully', testimonial);
  });

  paginated = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 15, orderBy, sortedBy, search } = req.query;
    const query: any = {};

    if (search) {
      const searchString = search as string;
      query.$or = [
        { name: { $regex: searchString, $options: 'i' } },
        { role: { $regex: searchString, $options: 'i' } },
      ];
    }

    const sort: any = {};
    if (orderBy) {
      sort[orderBy as string] = sortedBy === 'asc' ? 1 : -1;
    } else {
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

    return sendSuccess(res, 'Testimonials retrieved successfully', response);
  });
}
