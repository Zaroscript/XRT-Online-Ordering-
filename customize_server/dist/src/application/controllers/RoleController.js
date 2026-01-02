"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleController = void 0;
const GetRolesUseCase_1 = require("../../domain/usecases/roles/GetRolesUseCase");
const GetRoleUseCase_1 = require("../../domain/usecases/roles/GetRoleUseCase");
const CreateRoleUseCase_1 = require("../../domain/usecases/roles/CreateRoleUseCase");
const UpdateRoleUseCase_1 = require("../../domain/usecases/roles/UpdateRoleUseCase");
const DeleteRoleUseCase_1 = require("../../domain/usecases/roles/DeleteRoleUseCase");
const AssignRoleUseCase_1 = require("../../domain/usecases/roles/AssignRoleUseCase");
const RemoveRoleUseCase_1 = require("../../domain/usecases/roles/RemoveRoleUseCase");
const RoleRepository_1 = require("../../infrastructure/repositories/RoleRepository");
const UserRepository_1 = require("../../infrastructure/repositories/UserRepository");
const response_1 = require("../../shared/utils/response");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
class RoleController {
    constructor() {
        this.getAllRoles = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 10, orderBy = 'created_at', sortedBy = 'desc', search, } = req.query;
            const result = await this.getRolesUseCase.execute({
                page: Number(page),
                limit: Number(limit),
                orderBy: orderBy,
                sortedBy: sortedBy,
                search: search,
            });
            // Map roles to match frontend expectations
            const mappedRoles = result.roles.map((role) => ({
                ...role,
                _id: role.id,
                id: role.id,
            }));
            return (0, response_1.sendSuccess)(res, 'Roles retrieved successfully', {
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
        this.getRole = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const role = await this.getRoleUseCase.execute(req.params.id);
            return (0, response_1.sendSuccess)(res, 'Role retrieved successfully', {
                role: {
                    ...role,
                    _id: role.id,
                    id: role.id,
                },
            });
        });
        this.createRole = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { name, displayName, description, permissions } = req.body;
            const createdBy = req.user?.id || '';
            const role = await this.createRoleUseCase.execute({
                name,
                displayName,
                description,
                permissions: permissions || [],
            }, createdBy);
            return (0, response_1.sendSuccess)(res, 'Role created successfully', {
                role: {
                    ...role,
                    _id: role.id,
                    id: role.id,
                },
            }, 201);
        });
        this.updateRole = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { displayName, description, permissions } = req.body;
            const role = await this.updateRoleUseCase.execute(id, {
                displayName,
                description,
                permissions,
            });
            return (0, response_1.sendSuccess)(res, 'Role updated successfully', {
                role: {
                    ...role,
                    _id: role.id,
                    id: role.id,
                },
            });
        });
        this.deleteRole = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            await this.deleteRoleUseCase.execute(req.params.id);
            return (0, response_1.sendSuccess)(res, 'Role deleted successfully');
        });
        this.assignRole = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { userId } = req.params;
            const { roleId } = req.body;
            const user = await this.assignRoleUseCase.execute(userId, roleId);
            return (0, response_1.sendSuccess)(res, 'Role assigned successfully', { user });
        });
        this.removeRole = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { userId } = req.params;
            const user = await this.removeRoleUseCase.execute(userId);
            return (0, response_1.sendSuccess)(res, 'Role removed successfully', { user });
        });
        const roleRepository = new RoleRepository_1.RoleRepository();
        this.getRolesUseCase = new GetRolesUseCase_1.GetRolesUseCase(roleRepository);
        this.getRoleUseCase = new GetRoleUseCase_1.GetRoleUseCase(roleRepository);
        this.createRoleUseCase = new CreateRoleUseCase_1.CreateRoleUseCase(roleRepository);
        this.updateRoleUseCase = new UpdateRoleUseCase_1.UpdateRoleUseCase(roleRepository);
        this.deleteRoleUseCase = new DeleteRoleUseCase_1.DeleteRoleUseCase(roleRepository);
        const userRepository = new UserRepository_1.UserRepository();
        this.assignRoleUseCase = new AssignRoleUseCase_1.AssignRoleUseCase(userRepository);
        this.removeRoleUseCase = new RemoveRoleUseCase_1.RemoveRoleUseCase(userRepository);
    }
}
exports.RoleController = RoleController;
