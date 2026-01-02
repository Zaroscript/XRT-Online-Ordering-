import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { CreateCustomerUseCase } from '../../domain/usecases/customers/CreateCustomerUseCase';
import { GetCustomersUseCase } from '../../domain/usecases/customers/GetCustomersUseCase';
import { GetCustomerUseCase } from '../../domain/usecases/customers/GetCustomerUseCase';
import { UpdateCustomerUseCase } from '../../domain/usecases/customers/UpdateCustomerUseCase';
import { DeleteCustomerUseCase } from '../../domain/usecases/customers/DeleteCustomerUseCase';
import { CustomerRepository } from '../../infrastructure/repositories/CustomerRepository';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ValidationError } from '../../shared/errors/AppError';
import { UserRole } from '../../shared/constants/roles';

export class CustomerController {
  private createCustomerUseCase: CreateCustomerUseCase;
  private getCustomersUseCase: GetCustomersUseCase;
  private getCustomerUseCase: GetCustomerUseCase;
  private updateCustomerUseCase: UpdateCustomerUseCase;
  private deleteCustomerUseCase: DeleteCustomerUseCase;

  constructor() {
    const customerRepository = new CustomerRepository();

    this.createCustomerUseCase = new CreateCustomerUseCase(customerRepository);
    this.getCustomersUseCase = new GetCustomersUseCase(customerRepository);
    this.getCustomerUseCase = new GetCustomerUseCase(customerRepository);
    this.updateCustomerUseCase = new UpdateCustomerUseCase(customerRepository);
    this.deleteCustomerUseCase = new DeleteCustomerUseCase(customerRepository);
  }

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      name,
      email,
      phoneNumber,
      rewards,
      notes,
    } = req.body;

    // Automatically get business_id from current user's business
    const business_id = req.user?.business_id;

    if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
      throw new ValidationError('business_id is required');
    }

    if (!name || !email || !phoneNumber) {
      throw new ValidationError('Name, email, and phone number are required');
    }

    try {
      const customer = await this.createCustomerUseCase.execute({
        business_id: business_id!,
        name,
        email,
        phoneNumber,
        rewards,
        notes,
      });

      return sendSuccess(res, 'Customer created successfully', customer, 201);
    } catch (error: any) {
      console.error('❌ Error in CustomerController.create:', error);
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
      role,
      isActive,
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
      search: search as string | undefined,
      isActive: isActive ? isActive === 'true' : undefined,
    };

    if (business_id) {
      filters.business_id = business_id as string;
    }

    const result = await this.getCustomersUseCase.execute(filters);

    return sendSuccess(res, 'Customers retrieved successfully', {
      customers: result.customers,
      paginatorInfo: {
        total: result.total,
        currentPage: result.page,
        lastPage: result.totalPages,
        perPage: result.limit,
        count: result.customers.length,
      },
    });
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    let business_id = req.user?.business_id || req.query.business_id;

    // For super admins, allow getting any customer if no business_id
    if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
      throw new ValidationError('business_id is required');
    }

    if (!business_id && req.user?.role === UserRole.SUPER_ADMIN) {
      business_id = undefined;
    }

    const customer = await this.getCustomerUseCase.execute(id, business_id as string | undefined);

    return sendSuccess(res, 'Customer retrieved successfully', customer);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const {
      name,
      email,
      phoneNumber,
      rewards,
      notes,
      isActive,
    } = req.body;

    let business_id = req.user?.business_id || req.query.business_id;

    if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
      throw new ValidationError('business_id is required');
    }

    if (!business_id && req.user?.role === UserRole.SUPER_ADMIN) {
      business_id = undefined;
    }

    try {
      const customer = await this.updateCustomerUseCase.execute(
        id,
        {
          name,
          email,
          phoneNumber,
          rewards,
          notes,
          isActive,
        },
        business_id as string | undefined
      );

      return sendSuccess(res, 'Customer updated successfully', customer);
    } catch (error: any) {
      console.error('❌ Error in CustomerController.update:', error);
      throw error;
    }
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    let business_id = req.user?.business_id || req.query.business_id;

    if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
      throw new ValidationError('business_id is required');
    }

    if (!business_id && req.user?.role === UserRole.SUPER_ADMIN) {
      business_id = undefined;
    }

    await this.deleteCustomerUseCase.execute(id, business_id as string | undefined);

    return sendSuccess(res, 'Customer deleted successfully', null, 204);
  });
}

