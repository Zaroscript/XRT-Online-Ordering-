import { Customer, CreateCustomerDTO, UpdateCustomerDTO } from '../entities/Customer';

export interface CustomerFilters {
  business_id?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  orderBy?: string;
  sortedBy?: 'asc' | 'desc';
}

export interface PaginatedCustomers {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ICustomerRepository {
  create(customerData: CreateCustomerDTO): Promise<Customer>;
  findById(id: string, business_id?: string): Promise<Customer | null>;
  findAll(filters: CustomerFilters): Promise<PaginatedCustomers>;
  update(id: string, customerData: UpdateCustomerDTO, business_id?: string): Promise<Customer>;
  delete(id: string, business_id?: string): Promise<void>;
  exists(email: string, business_id: string): Promise<boolean>;
}

