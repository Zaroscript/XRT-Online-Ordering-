import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { LoginUseCase } from '../../domain/usecases/auth/LoginUseCase';
import { RegisterUseCase } from '../../domain/usecases/auth/RegisterUseCase';
import { RefreshTokenUseCase } from '../../domain/usecases/auth/RefreshTokenUseCase';
import { ForgotPasswordUseCase } from '../../domain/usecases/auth/ForgotPasswordUseCase';
import { ResetPasswordUseCase } from '../../domain/usecases/auth/ResetPasswordUseCase';
import { UpdatePasswordUseCase } from '../../domain/usecases/auth/UpdatePasswordUseCase';
import { GetUsersUseCase } from '../../domain/usecases/users/GetUsersUseCase';
import { GetUserUseCase } from '../../domain/usecases/users/GetUserUseCase';
import { CreateUserUseCase } from '../../domain/usecases/users/CreateUserUseCase';
import { UpdateUserUseCase } from '../../domain/usecases/users/UpdateUserUseCase';
import { DeleteUserUseCase } from '../../domain/usecases/users/DeleteUserUseCase';
import { ApproveUserUseCase } from '../../domain/usecases/users/ApproveUserUseCase';
import { BanUserUseCase } from '../../domain/usecases/users/BanUserUseCase';
import { UpdateUserPermissionsUseCase } from '../../domain/usecases/users/UpdateUserPermissionsUseCase';
import { GetUserPermissionsUseCase } from '../../domain/usecases/users/GetUserPermissionsUseCase';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { EmailService } from '../../infrastructure/services/EmailService';
import { generateToken } from '../../infrastructure/auth/jwt';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ALL_PERMISSIONS } from '../../shared/constants/roles';

export class AuthController {
  private loginUseCase: LoginUseCase;
  private registerUseCase: RegisterUseCase;
  private refreshTokenUseCase: RefreshTokenUseCase;
  private forgotPasswordUseCase: ForgotPasswordUseCase;
  private resetPasswordUseCase: ResetPasswordUseCase;
  private updatePasswordUseCase: UpdatePasswordUseCase;
  private getUsersUseCase: GetUsersUseCase;
  private getUserUseCase: GetUserUseCase;
  private createUserUseCase: CreateUserUseCase;
  private updateUserUseCase: UpdateUserUseCase;
  private deleteUserUseCase: DeleteUserUseCase;
  private approveUserUseCase: ApproveUserUseCase;
  private banUserUseCase: BanUserUseCase;
  private updateUserPermissionsUseCase: UpdateUserPermissionsUseCase;
  private getUserPermissionsUseCase: GetUserPermissionsUseCase;

  constructor() {
    const userRepository = new UserRepository();
    const emailService = new EmailService();

    this.loginUseCase = new LoginUseCase(userRepository, generateToken);
    this.registerUseCase = new RegisterUseCase(userRepository, generateToken);
    this.refreshTokenUseCase = new RefreshTokenUseCase(userRepository);
    this.forgotPasswordUseCase = new ForgotPasswordUseCase(userRepository, emailService);
    this.resetPasswordUseCase = new ResetPasswordUseCase(userRepository);
    this.updatePasswordUseCase = new UpdatePasswordUseCase(userRepository, generateToken);
    this.getUsersUseCase = new GetUsersUseCase(userRepository);
    this.getUserUseCase = new GetUserUseCase(userRepository);
    this.createUserUseCase = new CreateUserUseCase(userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(userRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(userRepository);
    this.approveUserUseCase = new ApproveUserUseCase(userRepository);
    this.banUserUseCase = new BanUserUseCase(userRepository);
    this.updateUserPermissionsUseCase = new UpdateUserPermissionsUseCase(userRepository);
    this.getUserPermissionsUseCase = new GetUserPermissionsUseCase(userRepository);
  }

  register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;

    const result = await this.registerUseCase.execute({
      name,
      email,
      password,
      role,
    });

    // Set cookies
    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return sendSuccess(res, 'Registration successful', {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    }, 201);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await this.loginUseCase.execute({ email, password });

    // Set cookies
    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return sendSuccess(res, 'Login successful', {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const result = await this.refreshTokenUseCase.execute({ refreshToken });

    return sendSuccess(res, 'Token refreshed successfully', result);
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const result = await this.forgotPasswordUseCase.execute({ email });

    return sendSuccess(res, result.message, result.otp ? { otp: result.otp } : undefined);
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp, password } = req.body;

    const result = await this.resetPasswordUseCase.execute({ email, otp, password });

    return sendSuccess(res, result.message);
  });

  updatePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    const result = await this.updatePasswordUseCase.execute(req.user!.id, {
      currentPassword,
      newPassword,
    });

    // Set new cookies
    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return sendSuccess(res, 'Password updated successfully', {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.cookie('access_token', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    return sendSuccess(res, 'Logged out successfully');
  });

  getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    return sendSuccess(res, 'User retrieved successfully', { user: req.user });
  });

  getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      sortedBy = 'desc',
      search,
      role,
      is_active,
    } = req.query;

    const result = await this.getUsersUseCase.execute({
      page: Number(page),
      limit: Number(limit),
      orderBy: orderBy as string,
      sortedBy: sortedBy as 'asc' | 'desc',
      search: search as string,
      role: role as string,
      is_active: is_active !== undefined ? String(is_active) === 'true' : undefined,
    });

    // Map users to match frontend expectations
    const mappedUsers = result.users.map((user) => ({
      ...user,
      id: user.id,
      is_active: user.isActive,
      permissions: user.permissions ? user.permissions.map((p: string) => ({ name: p })) : [],
      profile: (user as any).profile || { avatar: { thumbnail: '' } },
      count: result.users.length,
    }));

    return sendSuccess(res, 'Users retrieved successfully', {
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

  getUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.getUserUseCase.execute(req.params.id);

    return sendSuccess(res, 'User retrieved successfully', { user });
  });

  createUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, role, permissions } = req.body;

    const user = await this.createUserUseCase.execute({
      name,
      email,
      password,
      role,
      permissions,
    });

    return sendSuccess(res, 'User created successfully', { user }, 201);
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.updateUserUseCase.execute(req.params.id, req.body);

    return sendSuccess(res, 'User updated successfully', { user });
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    await this.deleteUserUseCase.execute(req.params.id);

    return sendSuccess(res, 'User deleted successfully', null, 204);
  });

  approveUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.approveUserUseCase.execute(req.params.id);

    return sendSuccess(res, 'User approved successfully', { user });
  });

  banUser = asyncHandler(async (req: Request, res: Response) => {
    const { isBanned, banReason } = req.body;

    const user = await this.banUserUseCase.execute(req.params.id, isBanned, banReason);

    return sendSuccess(res, 'User ban status updated successfully', { user });
  });

  updateUserPermissions = asyncHandler(async (req: Request, res: Response) => {
    const { permissions } = req.body;

    const user = await this.updateUserPermissionsUseCase.execute(req.params.id, permissions);

    return sendSuccess(res, 'User permissions updated successfully', { user });
  });

  getUserPermissions = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.getUserPermissionsUseCase.execute(req.params.id);

    return sendSuccess(res, 'User permissions retrieved successfully', result);
  });

  getAllPermissions = asyncHandler(async (req: Request, res: Response) => {
    return sendSuccess(res, 'All permissions retrieved successfully', {
      permissions: ALL_PERMISSIONS,
    });
  });

  verifyResetToken = asyncHandler(async (req: Request, res: Response) => {
    // This would need a use case, but for now we'll handle it in controller
    // Can be refactored later if needed
    return sendSuccess(res, 'Token verification endpoint - implement if needed');
  });

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    const cookieOptions = {
      expires: new Date(Date.now() + Number(process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
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

