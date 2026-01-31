// Auto-generated Swagger Spec
import { AssignRoleRequest } from './components/schemas/AssignRoleRequest.schema';
import { AuthResponse } from './components/schemas/AuthResponse.schema';
import { BanUserRequest } from './components/schemas/BanUserRequest.schema';
import { Business } from './components/schemas/Business.schema';
import { BusinessSettings } from './components/schemas/BusinessSettings.schema';
import { Category } from './components/schemas/Category.schema';
import { CreateBusinessRequest } from './components/schemas/CreateBusinessRequest.schema';
import { CreateLocationRequest } from './components/schemas/CreateLocationRequest.schema';
import { CreateModifierGroupRequest } from './components/schemas/CreateModifierGroupRequest.schema';
import { CreateModifierRequestSchema } from './components/schemas/CreateModifierRequest.schema';
import { CreateRoleRequest } from './components/schemas/CreateRoleRequest.schema';
import { CreateWithdrawRequest } from './components/schemas/CreateWithdrawRequest.schema';
import { Customer } from './components/schemas/Customer.schema';
import { ErrorResponse } from './components/schemas/ErrorResponse.schema';
import { ForgotPasswordRequest } from './components/schemas/ForgotPasswordRequest.schema';
import { ImportSession } from './components/schemas/ImportSession.schema';
import { ImportValidationError } from './components/schemas/ImportValidationError.schema';
import { ImportValidationWarning } from './components/schemas/ImportValidationWarning.schema';
import { Item } from './components/schemas/Item.schema';
import { ItemModifierGroupAssignment } from './components/schemas/ItemModifierGroupAssignment.schema';
import { ItemModifierOverride } from './components/schemas/ItemModifierOverride.schema';
import { ItemModifierPriceOverride } from './components/schemas/ItemModifierPriceOverride.schema';
import { ItemModifierQuantityLevelOverride } from './components/schemas/ItemModifierQuantityLevelOverride.schema';
import { ItemSize } from './components/schemas/ItemSize.schema';
import { Location } from './components/schemas/Location.schema';
import { LoginRequest } from './components/schemas/LoginRequest.schema';
import { Modifier } from './components/schemas/Modifier.schema';
import { ModifierGroup } from './components/schemas/ModifierGroup.schema';
import { PaginatedResponse } from './components/schemas/PaginatedResponse.schema';
import { Permission } from './components/schemas/Permission.schema';
import { PriceDelta } from './components/schemas/PriceDelta.schema';
import { QuantityLevel } from './components/schemas/QuantityLevel.schema';
import { RefreshTokenRequest } from './components/schemas/RefreshTokenRequest.schema';
import { RegisterRequest } from './components/schemas/RegisterRequest.schema';
import { ResetPasswordRequest } from './components/schemas/ResetPasswordRequest.schema';
import { Role } from './components/schemas/Role.schema';
import { SuccessResponse } from './components/schemas/SuccessResponse.schema';
import { UpdateBusinessOwnerRequest } from './components/schemas/UpdateBusinessOwnerRequest.schema';
import { UpdateBusinessRequest } from './components/schemas/UpdateBusinessRequest.schema';
import { UpdateBusinessSettingsRequest } from './components/schemas/UpdateBusinessSettingsRequest.schema';
import { UpdateLocationRequest } from './components/schemas/UpdateLocationRequest.schema';
import { UpdateModifierGroupRequest } from './components/schemas/UpdateModifierGroupRequest.schema';
import { UpdateModifierRequestSchema } from './components/schemas/UpdateModifierRequest.schema';
import { UpdatePasswordRequest } from './components/schemas/UpdatePasswordRequest.schema';
import { UpdatePermissionsRequest } from './components/schemas/UpdatePermissionsRequest.schema';
import { UpdateRoleRequest } from './components/schemas/UpdateRoleRequest.schema';
import { UpdateWithdrawStatusRequest } from './components/schemas/UpdateWithdrawStatusRequest.schema';
import { User } from './components/schemas/User.schema';
import { Withdraw } from './components/schemas/Withdraw.schema';
import { bearerAuth } from './components/security/bearerAuth.security';
import { attachments_paths } from './modules/attachments.swagger';
import { authentication_paths } from './modules/authentication.swagger';
import { business_settings_paths } from './modules/business-settings.swagger';
import { businesses_paths } from './modules/businesses.swagger';
import { categories_paths } from './modules/categories.swagger';
import { customers_paths } from './modules/customers.swagger';
import { import_paths } from './modules/import.swagger';
import { item_sizes_paths } from './modules/item-sizes.swagger';
import { items_paths } from './modules/items.swagger';
import { locations_paths } from './modules/locations.swagger';
import { modifier_groups_paths } from './modules/modifier-groups.swagger';
import { modifiers_paths } from './modules/modifiers.swagger';
import { permissions_paths } from './modules/permissions.swagger';
import { role_management_paths } from './modules/role-management.swagger';
import { roles_paths } from './modules/roles.swagger';
import { user_management_paths } from './modules/user-management.swagger';
import { withdraws_paths } from './modules/withdraws.swagger';
import { env } from '../shared/config/env';
import packageJson from '../../package.json';

export const specs = {
  openapi: '3.0.0',
  info: {
    title: 'XRT Customized System API',
    version: packageJson.version || '2.0.0',
    description: `Enterprise-grade REST API built with Clean Architecture, TypeScript, and Node.js + Express + MongoDB.

## Architecture
This API follows Clean Architecture principles with strict separation of concerns:
- **Domain Layer**: Business logic (framework-agnostic)
- **Application Layer**: Express controllers, routes, and middlewares
- **Infrastructure Layer**: Database, external services, and implementations
- **Shared Layer**: Utilities, constants, and configuration

## Features
- 🔐 JWT Authentication with access & refresh tokens
- 👥 Complete User Management with RBAC
- 🏢 Multi-Business Support
- 📦 Category Management
- 🍕 Item Management with Modifier Groups
- 🎛️ Modifier Group & Modifier Management
- 🎭 Role-Based Access Control (RBAC)
- 🔒 Enterprise Security Features
- 📚 Comprehensive API Documentation

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
\`Authorization: Bearer YOUR_ACCESS_TOKEN\`

## Response Format
All responses follow a consistent format:
- Success: \`{ "success": true, "message": "...", "data": {...} }\`
- Error: \`{ "success": false, "message": "Error description" }\``,
    contact: {
      name: 'API Support',
      email: 'support@xrt.com',
    },
    license: {
      name: 'MIT',
    },
  },
  servers: [
    {
      url:
        process.env.PRODUCTION_URL || `https://xrt-online-ordering.vercel.app${env.API_BASE_URL}`,
      description: 'Production',
    },
    {
      url: `http://localhost:${env.PORT}${env.API_BASE_URL}`,
      description: 'Development',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { ...bearerAuth },
    },
    schemas: {
      AssignRoleRequest,
      AuthResponse,
      BanUserRequest,
      Business,
      BusinessSettings,
      Category,
      CreateBusinessRequest,
      CreateLocationRequest,
      CreateModifierGroupRequest,
      CreateModifierRequest: CreateModifierRequestSchema,
      CreateRoleRequest,
      CreateWithdrawRequest,
      Customer,
      ErrorResponse,
      ForgotPasswordRequest,
      ImportSession,
      ImportValidationError,
      ImportValidationWarning,
      Item,
      ItemModifierGroupAssignment,
      ItemModifierOverride,
      ItemModifierPriceOverride,
      ItemModifierQuantityLevelOverride,
      ItemSize,
      Location,
      LoginRequest,
      Modifier,
      ModifierGroup,
      PaginatedResponse,
      Permission,
      PriceDelta,
      QuantityLevel,
      RefreshTokenRequest,
      RegisterRequest,
      ResetPasswordRequest,
      Role,
      SuccessResponse,
      UpdateBusinessOwnerRequest,
      UpdateBusinessRequest,
      UpdateBusinessSettingsRequest,
      UpdateLocationRequest,
      UpdateModifierGroupRequest,
      UpdateModifierRequest: UpdateModifierRequestSchema,
      UpdatePasswordRequest,
      UpdatePermissionsRequest,
      UpdateRoleRequest,
      UpdateWithdrawStatusRequest,
      User,
      Withdraw,
    },
    responses: {},
    parameters: {},
  },
  paths: {
    ...attachments_paths,
    ...authentication_paths,
    ...business_settings_paths,
    ...businesses_paths,
    ...categories_paths,
    ...customers_paths,
    ...import_paths,
    ...item_sizes_paths,
    ...items_paths,
    ...locations_paths,
    ...modifier_groups_paths,
    ...modifiers_paths,
    ...permissions_paths,
    ...role_management_paths,
    ...roles_paths,
    ...user_management_paths,
    ...withdraws_paths,
  },
};
