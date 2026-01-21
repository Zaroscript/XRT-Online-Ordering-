"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.specs = void 0;
// Auto-generated Swagger Spec
const AssignRoleRequest_schema_1 = require("./components/schemas/AssignRoleRequest.schema");
const AuthResponse_schema_1 = require("./components/schemas/AuthResponse.schema");
const BanUserRequest_schema_1 = require("./components/schemas/BanUserRequest.schema");
const Business_schema_1 = require("./components/schemas/Business.schema");
const BusinessSettings_schema_1 = require("./components/schemas/BusinessSettings.schema");
const Category_schema_1 = require("./components/schemas/Category.schema");
const CreateBusinessRequest_schema_1 = require("./components/schemas/CreateBusinessRequest.schema");
const CreateLocationRequest_schema_1 = require("./components/schemas/CreateLocationRequest.schema");
const CreateModifierGroupRequest_schema_1 = require("./components/schemas/CreateModifierGroupRequest.schema");
const CreateModifierRequest_schema_1 = require("./components/schemas/CreateModifierRequest.schema");
const CreateRoleRequest_schema_1 = require("./components/schemas/CreateRoleRequest.schema");
const CreateWithdrawRequest_schema_1 = require("./components/schemas/CreateWithdrawRequest.schema");
const Customer_schema_1 = require("./components/schemas/Customer.schema");
const ErrorResponse_schema_1 = require("./components/schemas/ErrorResponse.schema");
const ForgotPasswordRequest_schema_1 = require("./components/schemas/ForgotPasswordRequest.schema");
const ImportSession_schema_1 = require("./components/schemas/ImportSession.schema");
const ImportValidationError_schema_1 = require("./components/schemas/ImportValidationError.schema");
const ImportValidationWarning_schema_1 = require("./components/schemas/ImportValidationWarning.schema");
const Item_schema_1 = require("./components/schemas/Item.schema");
const ItemModifierGroupAssignment_schema_1 = require("./components/schemas/ItemModifierGroupAssignment.schema");
const ItemModifierOverride_schema_1 = require("./components/schemas/ItemModifierOverride.schema");
const ItemModifierPriceOverride_schema_1 = require("./components/schemas/ItemModifierPriceOverride.schema");
const ItemModifierQuantityLevelOverride_schema_1 = require("./components/schemas/ItemModifierQuantityLevelOverride.schema");
const ItemSize_schema_1 = require("./components/schemas/ItemSize.schema");
const Location_schema_1 = require("./components/schemas/Location.schema");
const LoginRequest_schema_1 = require("./components/schemas/LoginRequest.schema");
const Modifier_schema_1 = require("./components/schemas/Modifier.schema");
const ModifierGroup_schema_1 = require("./components/schemas/ModifierGroup.schema");
const PaginatedResponse_schema_1 = require("./components/schemas/PaginatedResponse.schema");
const Permission_schema_1 = require("./components/schemas/Permission.schema");
const PriceDelta_schema_1 = require("./components/schemas/PriceDelta.schema");
const QuantityLevel_schema_1 = require("./components/schemas/QuantityLevel.schema");
const RefreshTokenRequest_schema_1 = require("./components/schemas/RefreshTokenRequest.schema");
const RegisterRequest_schema_1 = require("./components/schemas/RegisterRequest.schema");
const ResetPasswordRequest_schema_1 = require("./components/schemas/ResetPasswordRequest.schema");
const Role_schema_1 = require("./components/schemas/Role.schema");
const SuccessResponse_schema_1 = require("./components/schemas/SuccessResponse.schema");
const UpdateBusinessOwnerRequest_schema_1 = require("./components/schemas/UpdateBusinessOwnerRequest.schema");
const UpdateBusinessRequest_schema_1 = require("./components/schemas/UpdateBusinessRequest.schema");
const UpdateBusinessSettingsRequest_schema_1 = require("./components/schemas/UpdateBusinessSettingsRequest.schema");
const UpdateLocationRequest_schema_1 = require("./components/schemas/UpdateLocationRequest.schema");
const UpdateModifierGroupRequest_schema_1 = require("./components/schemas/UpdateModifierGroupRequest.schema");
const UpdateModifierRequest_schema_1 = require("./components/schemas/UpdateModifierRequest.schema");
const UpdatePasswordRequest_schema_1 = require("./components/schemas/UpdatePasswordRequest.schema");
const UpdatePermissionsRequest_schema_1 = require("./components/schemas/UpdatePermissionsRequest.schema");
const UpdateRoleRequest_schema_1 = require("./components/schemas/UpdateRoleRequest.schema");
const UpdateWithdrawStatusRequest_schema_1 = require("./components/schemas/UpdateWithdrawStatusRequest.schema");
const User_schema_1 = require("./components/schemas/User.schema");
const Withdraw_schema_1 = require("./components/schemas/Withdraw.schema");
const bearerAuth_security_1 = require("./components/security/bearerAuth.security");
const attachments_swagger_1 = require("./modules/attachments.swagger");
const authentication_swagger_1 = require("./modules/authentication.swagger");
const business_settings_swagger_1 = require("./modules/business-settings.swagger");
const businesses_swagger_1 = require("./modules/businesses.swagger");
const categories_swagger_1 = require("./modules/categories.swagger");
const customers_swagger_1 = require("./modules/customers.swagger");
const import_swagger_1 = require("./modules/import.swagger");
const item_sizes_swagger_1 = require("./modules/item-sizes.swagger");
const items_swagger_1 = require("./modules/items.swagger");
const locations_swagger_1 = require("./modules/locations.swagger");
const modifier_groups_swagger_1 = require("./modules/modifier-groups.swagger");
const modifiers_swagger_1 = require("./modules/modifiers.swagger");
const permissions_swagger_1 = require("./modules/permissions.swagger");
const role_management_swagger_1 = require("./modules/role-management.swagger");
const roles_swagger_1 = require("./modules/roles.swagger");
const user_management_swagger_1 = require("./modules/user-management.swagger");
const withdraws_swagger_1 = require("./modules/withdraws.swagger");
const env_1 = require("../shared/config/env");
const package_json_1 = __importDefault(require("../../package.json"));
exports.specs = {
    openapi: '3.0.0',
    info: {
        title: 'XRT Customized System API',
        version: package_json_1.default.version || '2.0.0',
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
            url: process.env.PRODUCTION_URL || `https://xrt-online-ordering.vercel.app${env_1.env.API_BASE_URL}`,
            description: 'Production',
        },
        {
            url: `http://localhost:${env_1.env.PORT}${env_1.env.API_BASE_URL}`,
            description: 'Development',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: { ...bearerAuth_security_1.bearerAuth }
        },
        schemas: {
            AssignRoleRequest: AssignRoleRequest_schema_1.AssignRoleRequest,
            AuthResponse: AuthResponse_schema_1.AuthResponse,
            BanUserRequest: BanUserRequest_schema_1.BanUserRequest,
            Business: Business_schema_1.Business,
            BusinessSettings: BusinessSettings_schema_1.BusinessSettings,
            Category: Category_schema_1.Category,
            CreateBusinessRequest: CreateBusinessRequest_schema_1.CreateBusinessRequest,
            CreateLocationRequest: CreateLocationRequest_schema_1.CreateLocationRequest,
            CreateModifierGroupRequest: CreateModifierGroupRequest_schema_1.CreateModifierGroupRequest,
            CreateModifierRequest: CreateModifierRequest_schema_1.CreateModifierRequest,
            CreateRoleRequest: CreateRoleRequest_schema_1.CreateRoleRequest,
            CreateWithdrawRequest: CreateWithdrawRequest_schema_1.CreateWithdrawRequest,
            Customer: Customer_schema_1.Customer,
            ErrorResponse: ErrorResponse_schema_1.ErrorResponse,
            ForgotPasswordRequest: ForgotPasswordRequest_schema_1.ForgotPasswordRequest,
            ImportSession: ImportSession_schema_1.ImportSession,
            ImportValidationError: ImportValidationError_schema_1.ImportValidationError,
            ImportValidationWarning: ImportValidationWarning_schema_1.ImportValidationWarning,
            Item: Item_schema_1.Item,
            ItemModifierGroupAssignment: ItemModifierGroupAssignment_schema_1.ItemModifierGroupAssignment,
            ItemModifierOverride: ItemModifierOverride_schema_1.ItemModifierOverride,
            ItemModifierPriceOverride: ItemModifierPriceOverride_schema_1.ItemModifierPriceOverride,
            ItemModifierQuantityLevelOverride: ItemModifierQuantityLevelOverride_schema_1.ItemModifierQuantityLevelOverride,
            ItemSize: ItemSize_schema_1.ItemSize,
            Location: Location_schema_1.Location,
            LoginRequest: LoginRequest_schema_1.LoginRequest,
            Modifier: Modifier_schema_1.Modifier,
            ModifierGroup: ModifierGroup_schema_1.ModifierGroup,
            PaginatedResponse: PaginatedResponse_schema_1.PaginatedResponse,
            Permission: Permission_schema_1.Permission,
            PriceDelta: PriceDelta_schema_1.PriceDelta,
            QuantityLevel: QuantityLevel_schema_1.QuantityLevel,
            RefreshTokenRequest: RefreshTokenRequest_schema_1.RefreshTokenRequest,
            RegisterRequest: RegisterRequest_schema_1.RegisterRequest,
            ResetPasswordRequest: ResetPasswordRequest_schema_1.ResetPasswordRequest,
            Role: Role_schema_1.Role,
            SuccessResponse: SuccessResponse_schema_1.SuccessResponse,
            UpdateBusinessOwnerRequest: UpdateBusinessOwnerRequest_schema_1.UpdateBusinessOwnerRequest,
            UpdateBusinessRequest: UpdateBusinessRequest_schema_1.UpdateBusinessRequest,
            UpdateBusinessSettingsRequest: UpdateBusinessSettingsRequest_schema_1.UpdateBusinessSettingsRequest,
            UpdateLocationRequest: UpdateLocationRequest_schema_1.UpdateLocationRequest,
            UpdateModifierGroupRequest: UpdateModifierGroupRequest_schema_1.UpdateModifierGroupRequest,
            UpdateModifierRequest: UpdateModifierRequest_schema_1.UpdateModifierRequest,
            UpdatePasswordRequest: UpdatePasswordRequest_schema_1.UpdatePasswordRequest,
            UpdatePermissionsRequest: UpdatePermissionsRequest_schema_1.UpdatePermissionsRequest,
            UpdateRoleRequest: UpdateRoleRequest_schema_1.UpdateRoleRequest,
            UpdateWithdrawStatusRequest: UpdateWithdrawStatusRequest_schema_1.UpdateWithdrawStatusRequest,
            User: User_schema_1.User,
            Withdraw: Withdraw_schema_1.Withdraw
        },
        responses: {},
        parameters: {}
    },
    paths: {
        ...attachments_swagger_1.attachments_paths,
        ...authentication_swagger_1.authentication_paths,
        ...business_settings_swagger_1.business_settings_paths,
        ...businesses_swagger_1.businesses_paths,
        ...categories_swagger_1.categories_paths,
        ...customers_swagger_1.customers_paths,
        ...import_swagger_1.import_paths,
        ...item_sizes_swagger_1.item_sizes_paths,
        ...items_swagger_1.items_paths,
        ...locations_swagger_1.locations_paths,
        ...modifier_groups_swagger_1.modifier_groups_paths,
        ...modifiers_swagger_1.modifiers_paths,
        ...permissions_swagger_1.permissions_paths,
        ...role_management_swagger_1.role_management_paths,
        ...roles_swagger_1.roles_paths,
        ...user_management_swagger_1.user_management_paths,
        ...withdraws_swagger_1.withdraws_paths
    }
};
