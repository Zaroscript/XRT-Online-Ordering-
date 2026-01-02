import { User, CreateUserDTO, UpdateUserDTO } from '../entities/User';

export interface UserFilters {
  role?: string;
  is_active?: boolean;
  isBanned?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
  sortedBy?: 'asc' | 'desc';
}

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IUserRepository {
  create(userData: CreateUserDTO): Promise<User>;
  findById(id: string, includePassword?: boolean): Promise<User | null>;
  findByEmail(email: string, includePassword?: boolean): Promise<User | null>;
  findAll(filters: UserFilters): Promise<PaginatedUsers>;
  update(id: string, userData: UpdateUserDTO): Promise<User>;
  delete(id: string): Promise<void>;
  exists(email: string): Promise<boolean>;
  findByPasswordResetToken(token: string): Promise<User | null>;
  updatePassword(id: string, password: string): Promise<User>;
  incrementLoginAttempts(id: string): Promise<void>;
  resetLoginAttempts(id: string): Promise<void>;
  lockAccount(id: string, lockUntil: Date): Promise<void>;
  unlockAccount(id: string): Promise<void>;
  assignRole(userId: string, roleId: string): Promise<User>;
  removeRole(userId: string): Promise<User>;
}

