import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { GetRolesUseCase } from '../../domain/usecases/roles/GetRolesUseCase';
import { GetRoleUseCase } from '../../domain/usecases/roles/GetRoleUseCase';
import { CreateRoleUseCase } from '../../domain/usecases/roles/CreateRoleUseCase';
import { UpdateRoleUseCase } from '../../domain/usecases/roles/UpdateRoleUseCase';
import { DeleteRoleUseCase } from '../../domain/usecases/roles/DeleteRoleUseCase';
import { AssignRoleUseCase } from '../../domain/usecases/roles/AssignRoleUseCase';
import { RemoveRoleUseCase } from '../../domain/usecases/roles/RemoveRoleUseCase';
import { RoleRepository } from '../../infrastructure/repositories/RoleRepository';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export class RoleController {
  private getRolesUseCase: GetRolesUseCase;
  private getRoleUseCase: GetRoleUseCase;
  private createRoleUseCase: CreateRoleUseCase;
  private updateRoleUseCase: UpdateRoleUseCase;
  private deleteRoleUseCase: DeleteRoleUseCase;
  private assignRoleUseCase: AssignRoleUseCase;
  private removeRoleUseCase: RemoveRoleUseCase;

  constructor() {
    const roleRepository = new RoleRepository();

    this.getRolesUseCase = new GetRolesUseCase(roleRepository);
    this.getRoleUseCase = new GetRoleUseCase(roleRepository);
    this.createRoleUseCase = new CreateRoleUseCase(roleRepository);
    this.updateRoleUseCase = new UpdateRoleUseCase(roleRepository);
    this.deleteRoleUseCase = new DeleteRoleUseCase(roleRepository);

    const userRepository = new UserRepository();
    this.assignRoleUseCase = new AssignRoleUseCase(userRepository);
    this.removeRoleUseCase = new RemoveRoleUseCase(userRepository);
  }

  getAllRoles = asyncHandler(async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      sortedBy = 'desc',
      search,
    } = req.query;

    const result = await this.getRolesUseCase.execute({
      page: Number(page),
      limit: Number(limit),
      orderBy: orderBy as string,
      sortedBy: sortedBy as 'asc' | 'desc',
      search: search as string,
    });

    // Map roles to match frontend expectations
    const mappedRoles = result.roles.map((role) => ({
      ...role,
      _id: role.id,
      id: role.id,
    }));

    return sendSuccess(res, 'Roles retrieved successfully', {
      roles: mappedRoles,
      paginatorInfo: {
        total: result.total,
        currentPage: result.page,
        lastPage: result.totalPages,
        perPage: result.limit,
        count: result.roles.length,
      },
    });
  });

  getRole = asyncHandler(async (req: Request, res: Response) => {
    const role = await this.getRoleUseCase.execute(req.params.id);

    return sendSuccess(res, 'Role retrieved successfully', {
      role: {
        ...role,
        _id: role.id,
        id: role.id,
      },
    });
  });

  createRole = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, displayName, description, permissions } = req.body;
    const createdBy = req.user?.id || '';

    const role = await this.createRoleUseCase.execute(
      {
        name,
        displayName,
        description,
        permissions: permissions || [],
      },
      createdBy
    );

    return sendSuccess(
      res,
      'Role created successfully',
      {
        role: {
          ...role,
          _id: role.id,
          id: role.id,
        },
      },
      201
    );
  });

  updateRole = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { displayName, description, permissions } = req.body;

    const role = await this.updateRoleUseCase.execute(id, {
      displayName,
      description,
      permissions,
    });

    return sendSuccess(res, 'Role updated successfully', {
      role: {
        ...role,
        _id: role.id,
        id: role.id,
      },
    });
  });

  deleteRole = asyncHandler(async (req: Request, res: Response) => {
    await this.deleteRoleUseCase.execute(req.params.id);

    return sendSuccess(res, 'Role deleted successfully');
  });

  assignRole = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { roleId } = req.body;

    const user = await this.assignRoleUseCase.execute(userId, roleId);

    return sendSuccess(res, 'Role assigned successfully', { user });
  });

  removeRole = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    const user = await this.removeRoleUseCase.execute(userId);

    return sendSuccess(res, 'Role removed successfully', { user });
  });
}

