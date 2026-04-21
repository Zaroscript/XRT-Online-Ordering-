import { UserRole } from '../../shared/constants/roles';

export interface UserProfile {
  bio?: string;
  contact?: string;
  avatar?: {
    thumbnail: string;
    original: string;
    id: string;
  };
  notifications?: {
    email: string;
    enable: boolean;
  };
  socials?: {
    type: string;
    link: string;
  }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  permissions: string[];
  isApproved: boolean;
  isBanned: boolean;
  banReason?: string;
  isActive: boolean;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshToken?: string;
  refreshTokenExpires?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  lastLogin?: Date;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  customRole?: any;
  profile?: UserProfile;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  permissions?: string[];
  isApproved?: boolean;
  profile?: UserProfile;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  permissions?: string[];
  isApproved?: boolean;
  isBanned?: boolean;
  banReason?: string;
  isActive?: boolean;
  profile?: UserProfile;
}

export interface LoginDTO {
  identity: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  email: string;
  otp: string;
  password: string;
}

export interface UpdatePasswordDTO {
  oldPassword: string;
  newPassword: string;
}

