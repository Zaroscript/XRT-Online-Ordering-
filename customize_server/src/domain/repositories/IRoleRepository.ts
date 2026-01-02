import { Role, CreateRoleDTO, UpdateRoleDTO } from '../entities/Role';

export interface RoleFilters {
  page?: number;
  limit?: number;
  orderBy?: string;
  sortedBy?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedRoles {
  roles: Role[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IRoleRepository {
  create(roleData: CreateRoleDTO, createdBy: string): Promise<Role>;
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findAll(filters: RoleFilters): Promise<PaginatedRoles>;
  update(id: string, roleData: UpdateRoleDTO): Promise<Role>;
  delete(id: string): Promise<void>;
}

