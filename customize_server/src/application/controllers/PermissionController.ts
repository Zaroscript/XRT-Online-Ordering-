import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { GetPermissionsUseCase } from '../../domain/usecases/permissions/GetPermissionsUseCase';
import { PermissionRepository } from '../../infrastructure/repositories/PermissionRepository';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ForbiddenError, NotFoundError } from '../../shared/errors/AppError';
import { SYSTEM_ROLES } from '../../shared/constants/roles';
import { permissionRegistry } from '../../shared/permissions/PermissionRegistry';
import { Permission } from '../../domain/entities/Permission';

/** Drop DB rows no longer registered in code so the role picker only shows handled permissions */
function filterGroupedToRegistry(
    grouped: Record<string, Permission[]>,
): Record<string, Permission[]> {
    const filtered: Record<string, Permission[]> = {};
    for (const [module, permissions] of Object.entries(grouped)) {
        const list = permissions.filter((p) =>
            permissionRegistry.isRegistered(p.key),
        );
        if (list.length > 0) {
            filtered[module] = list;
        }
    }
    return filtered;
}

export class PermissionController {
    private getPermissionsUseCase: GetPermissionsUseCase;
    private permissionRepository: PermissionRepository;

    constructor() {
        this.permissionRepository = new PermissionRepository();
        this.getPermissionsUseCase = new GetPermissionsUseCase(this.permissionRepository);
    }

    /**
     * Get all permissions
     * GET /api/permissions
     */
    getAllPermissions = asyncHandler(async (req: Request, res: Response) => {
        const { module, isActive, search } = req.query;

        const permissions = await this.getPermissionsUseCase.execute({
            module: module as string,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
            search: search as string,
        });

        return sendSuccess(res, 'Permissions retrieved successfully', {
            permissions,
            total: permissions.length,
        });
    });

    /**
     * Get permissions grouped by module
     * GET /api/permissions/grouped
     */
    getGroupedPermissions = asyncHandler(async (req: Request, res: Response) => {
        const rawGrouped = await this.getPermissionsUseCase.executeGrouped();
        const grouped = filterGroupedToRegistry(rawGrouped);
        const modules = Object.keys(grouped).sort();

        return sendSuccess(res, 'Permissions retrieved successfully', {
            permissionsByModule: grouped,
            modules,
        });
    });

    /**
     * Get a single permission by ID
     * GET /api/permissions/:id
     */
    getPermission = asyncHandler(async (req: Request, res: Response) => {
        const permission = await this.permissionRepository.findById(req.params.id);

        if (!permission) {
            throw new NotFoundError('Permission not found');
        }

        return sendSuccess(res, 'Permission retrieved successfully', { permission });
    });

    /**
     * Update a permission (enable/disable)
     * PATCH /api/permissions/:id
     * Only super_admin can do this
     */
    updatePermission = asyncHandler(async (req: AuthRequest, res: Response) => {
        // Only super_admin can update permissions
        if (req.user?.role !== SYSTEM_ROLES.SUPER_ADMIN) {
            throw new ForbiddenError('Only super_admin can update permissions');
        }

        const { id } = req.params;
        const { isActive, description } = req.body;

        const existingPermission = await this.permissionRepository.findById(id);
        if (!existingPermission) {
            throw new NotFoundError('Permission not found');
        }

        const updated = await this.permissionRepository.update(id, {
            isActive,
            description,
        });

        return sendSuccess(res, 'Permission updated successfully', { permission: updated });
    });

    /**
     * Get all available modules
     * GET /api/permissions/modules
     */
    getModules = asyncHandler(async (req: Request, res: Response) => {
        const modules = await this.getPermissionsUseCase.getModules();

        return sendSuccess(res, 'Modules retrieved successfully', { modules });
    });
}
