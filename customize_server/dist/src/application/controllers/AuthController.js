"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const LoginUseCase_1 = require("../../domain/usecases/auth/LoginUseCase");
const RegisterUseCase_1 = require("../../domain/usecases/auth/RegisterUseCase");
const RefreshTokenUseCase_1 = require("../../domain/usecases/auth/RefreshTokenUseCase");
const ForgotPasswordUseCase_1 = require("../../domain/usecases/auth/ForgotPasswordUseCase");
const ResetPasswordUseCase_1 = require("../../domain/usecases/auth/ResetPasswordUseCase");
const UpdatePasswordUseCase_1 = require("../../domain/usecases/auth/UpdatePasswordUseCase");
const GetUsersUseCase_1 = require("../../domain/usecases/users/GetUsersUseCase");
const GetUserUseCase_1 = require("../../domain/usecases/users/GetUserUseCase");
const CreateUserUseCase_1 = require("../../domain/usecases/users/CreateUserUseCase");
const UpdateUserUseCase_1 = require("../../domain/usecases/users/UpdateUserUseCase");
const DeleteUserUseCase_1 = require("../../domain/usecases/users/DeleteUserUseCase");
const ApproveUserUseCase_1 = require("../../domain/usecases/users/ApproveUserUseCase");
const BanUserUseCase_1 = require("../../domain/usecases/users/BanUserUseCase");
const UpdateUserPermissionsUseCase_1 = require("../../domain/usecases/users/UpdateUserPermissionsUseCase");
const GetUserPermissionsUseCase_1 = require("../../domain/usecases/users/GetUserPermissionsUseCase");
const UserRepository_1 = require("../../infrastructure/repositories/UserRepository");
const EmailService_1 = require("../../infrastructure/services/EmailService");
const jwt_1 = require("../../infrastructure/auth/jwt");
const response_1 = require("../../shared/utils/response");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const roles_1 = require("../../shared/constants/roles");
class AuthController {
    constructor() {
        this.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { name, email, password, role } = req.body;
            const result = await this.registerUseCase.execute({
                name,
                email,
                password,
                role,
            });
            // Set cookies
            this.setAuthCookies(res, result.accessToken, result.refreshToken);
            return (0, response_1.sendSuccess)(res, 'Registration successful', {
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            }, 201);
        });
        this.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { email, password } = req.body;
            const result = await this.loginUseCase.execute({ email, password });
            // Set cookies
            this.setAuthCookies(res, result.accessToken, result.refreshToken);
            return (0, response_1.sendSuccess)(res, 'Login successful', {
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            });
        });
        this.refreshToken = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { refreshToken } = req.body;
            const result = await this.refreshTokenUseCase.execute({ refreshToken });
            return (0, response_1.sendSuccess)(res, 'Token refreshed successfully', result);
        });
        this.forgotPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { email } = req.body;
            const result = await this.forgotPasswordUseCase.execute({ email });
            return (0, response_1.sendSuccess)(res, result.message, result.otp ? { otp: result.otp } : undefined);
        });
        this.resetPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { email, otp, password } = req.body;
            const result = await this.resetPasswordUseCase.execute({ email, otp, password });
            return (0, response_1.sendSuccess)(res, result.message);
        });
        this.updatePassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { currentPassword, newPassword } = req.body;
            const result = await this.updatePasswordUseCase.execute(req.user.id, {
                currentPassword,
                newPassword,
            });
            // Set new cookies
            this.setAuthCookies(res, result.accessToken, result.refreshToken);
            return (0, response_1.sendSuccess)(res, 'Password updated successfully', {
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            });
        });
        this.logout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            res.cookie('jwt', 'loggedout', {
                expires: new Date(Date.now() + 10 * 1000),
                httpOnly: true,
            });
            res.cookie('access_token', 'loggedout', {
                expires: new Date(Date.now() + 10 * 1000),
                httpOnly: true,
            });
            return (0, response_1.sendSuccess)(res, 'Logged out successfully');
        });
        this.getMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            return (0, response_1.sendSuccess)(res, 'User retrieved successfully', { user: req.user });
        });
        this.getAllUsers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 10, orderBy = 'created_at', sortedBy = 'desc', search, role, is_active, } = req.query;
            const result = await this.getUsersUseCase.execute({
                page: Number(page),
                limit: Number(limit),
                orderBy: orderBy,
                sortedBy: sortedBy,
                search: search,
                role: role,
                is_active: is_active !== undefined ? String(is_active) === 'true' : undefined,
            });
            // Map users to match frontend expectations
            const mappedUsers = result.users.map((user) => ({
                ...user,
                id: user.id,
                is_active: user.isActive,
                permissions: user.permissions ? user.permissions.map((p) => ({ name: p })) : [],
                profile: user.profile || { avatar: { thumbnail: '' } },
                count: result.users.length,
            }));
            return (0, response_1.sendSuccess)(res, 'Users retrieved successfully', {
                users: mappedUsers,
                paginatorInfo: {
                    total: result.total,
                    currentPage: result.page,
                    lastPage: result.totalPages,
                    perPage: result.limit,
                    count: result.users.length,
                },
            });
        });
        this.getUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const user = await this.getUserUseCase.execute(req.params.id);
            return (0, response_1.sendSuccess)(res, 'User retrieved successfully', { user });
        });
        this.createUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { name, email, password, role, permissions } = req.body;
            const user = await this.createUserUseCase.execute({
                name,
                email,
                password,
                role,
                permissions,
            });
            return (0, response_1.sendSuccess)(res, 'User created successfully', { user }, 201);
        });
        this.updateUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const user = await this.updateUserUseCase.execute(req.params.id, req.body);
            return (0, response_1.sendSuccess)(res, 'User updated successfully', { user });
        });
        this.deleteUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            await this.deleteUserUseCase.execute(req.params.id);
            return (0, response_1.sendSuccess)(res, 'User deleted successfully', null, 204);
        });
        this.approveUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const user = await this.approveUserUseCase.execute(req.params.id);
            return (0, response_1.sendSuccess)(res, 'User approved successfully', { user });
        });
        this.banUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { isBanned, banReason } = req.body;
            const user = await this.banUserUseCase.execute(req.params.id, isBanned, banReason);
            return (0, response_1.sendSuccess)(res, 'User ban status updated successfully', { user });
        });
        this.updateUserPermissions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { permissions } = req.body;
            const user = await this.updateUserPermissionsUseCase.execute(req.params.id, permissions);
            return (0, response_1.sendSuccess)(res, 'User permissions updated successfully', { user });
        });
        this.getUserPermissions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const result = await this.getUserPermissionsUseCase.execute(req.params.id);
            return (0, response_1.sendSuccess)(res, 'User permissions retrieved successfully', result);
        });
        this.getAllPermissions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            return (0, response_1.sendSuccess)(res, 'All permissions retrieved successfully', {
                permissions: roles_1.ALL_PERMISSIONS,
            });
        });
        this.verifyResetToken = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            // This would need a use case, but for now we'll handle it in controller
            // Can be refactored later if needed
            return (0, response_1.sendSuccess)(res, 'Token verification endpoint - implement if needed');
        });
        const userRepository = new UserRepository_1.UserRepository();
        const emailService = new EmailService_1.EmailService();
        this.loginUseCase = new LoginUseCase_1.LoginUseCase(userRepository, jwt_1.generateToken);
        this.registerUseCase = new RegisterUseCase_1.RegisterUseCase(userRepository, jwt_1.generateToken);
        this.refreshTokenUseCase = new RefreshTokenUseCase_1.RefreshTokenUseCase(userRepository);
        this.forgotPasswordUseCase = new ForgotPasswordUseCase_1.ForgotPasswordUseCase(userRepository, emailService);
        this.resetPasswordUseCase = new ResetPasswordUseCase_1.ResetPasswordUseCase(userRepository);
        this.updatePasswordUseCase = new UpdatePasswordUseCase_1.UpdatePasswordUseCase(userRepository, jwt_1.generateToken);
        this.getUsersUseCase = new GetUsersUseCase_1.GetUsersUseCase(userRepository);
        this.getUserUseCase = new GetUserUseCase_1.GetUserUseCase(userRepository);
        this.createUserUseCase = new CreateUserUseCase_1.CreateUserUseCase(userRepository);
        this.updateUserUseCase = new UpdateUserUseCase_1.UpdateUserUseCase(userRepository);
        this.deleteUserUseCase = new DeleteUserUseCase_1.DeleteUserUseCase(userRepository);
        this.approveUserUseCase = new ApproveUserUseCase_1.ApproveUserUseCase(userRepository);
        this.banUserUseCase = new BanUserUseCase_1.BanUserUseCase(userRepository);
        this.updateUserPermissionsUseCase = new UpdateUserPermissionsUseCase_1.UpdateUserPermissionsUseCase(userRepository);
        this.getUserPermissionsUseCase = new GetUserPermissionsUseCase_1.GetUserPermissionsUseCase(userRepository);
    }
    setAuthCookies(res, accessToken, refreshToken) {
        const cookieOptions = {
            expires: new Date(Date.now() + Number(process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        };
        res.cookie('jwt', refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.cookie('access_token', accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
    }
}
exports.AuthController = AuthController;
