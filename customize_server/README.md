# 🚀 XRT Customized System API

Enterprise-grade REST API built with **Clean Architecture**, **TypeScript**, and **Node.js + Express + MongoDB**. Features comprehensive authentication, user management, business management, and role-based access control.

## 🏗️ Architecture

This project follows **Clean Architecture** principles with strict separation of concerns:

```
src/
├── domain/              # Business logic (framework-agnostic)
│   ├── entities/        # Domain entities
│   ├── repositories/    # Repository interfaces
│   ├── services/        # Service interfaces
│   └── usecases/        # Business use cases
├── application/         # Express layer
│   ├── controllers/    # HTTP request handlers
│   ├── routes/         # Express routes
│   └── middlewares/    # Auth, validation, etc.
├── infrastructure/      # External services
│   ├── database/       # Mongoose models & connection
│   ├── repositories/   # Repository implementations
│   ├── auth/           # JWT service
│   ├── cloudinary/     # Image storage
│   └── services/       # Email service
└── shared/              # Shared utilities
    ├── config/         # Environment config
    ├── constants/      # Constants & enums
    ├── errors/         # Error classes
    └── utils/          # Utilities
```

### Architecture Principles

✅ **Domain Layer**: No Express, Mongoose, or external service imports  
✅ **Infrastructure Layer**: Implements domain interfaces only  
✅ **Controllers**: Thin, delegate to use cases  
✅ **Use Cases**: All business logic  
✅ **Repositories**: Only layer touching Mongoose  
✅ **RBAC**: Centralized in middlewares

## 📋 Features

### 🔐 Authentication & Security

- **JWT Authentication** - Access & refresh token system
- **Password Hashing** - bcrypt with salt rounds
- **Account Management** - Approval, banning, activation
- **Password Reset** - OTP-based password recovery
- **Session Management** - Secure token storage
- **Rate Limiting** - Protection against brute force
- **CORS Protection** - Configurable origins
- **Input Sanitization** - MongoDB injection protection
- **Helmet Security** - HTTP headers security

### 👥 User Management

- **Complete CRUD** - Create, read, update, delete users
- **User Approval System** - Admin approval workflow
- **Ban/Unban Users** - Account status management
- **Permission Management** - Granular permission system
- **Role Assignment** - Multiple role support
- **User Search & Filtering** - Advanced querying
- **Pagination** - Efficient data retrieval

### 🏢 Business Management

- **Multi-Business Support** - Manage multiple businesses
- **Business CRUD** - Full business lifecycle
- **Business Settings** - Operating hours, delivery, fees, tips, hero slider
- **Business Isolation** - Data separation by business
- **Owner Management** - Business ownership tracking

### 🎭 Role-Based Access Control (RBAC)

- **Built-in Roles**: `super_admin`, `admin`, `manager`, `client`, `user`
- **Custom Roles** - Create roles with specific permissions
- **Permission System** - 30+ granular permissions
- **Role Hierarchy** - Super admin bypass
- **Permission Checking** - Middleware-based authorization

### 📦 Category Management

- **Category CRUD** - Full category management
- **Image Upload** - Cloudinary integration (image & icon support)
- **Business-Scoped** - Categories per business
- **Kitchen Section Integration** - Link categories to kitchen sections
- **Multi-language Support** - Translated languages tracking

### 🍕 Item Management

- **Item CRUD** - Full item management within categories
- **Image Upload** - Cloudinary integration for item images
- **Size Management** - Multiple sizes per item (S, M, L, XL, XXL) with individual pricing
- **Modifier Group Assignment** - Assign modifier groups to items with custom display order
- **Sides Configuration** - Item-level sides configuration per modifier group
- **Filtering** - Filter items by category, active status, business
- **Pagination** - Efficient data retrieval

### 🎛️ Modifier Group & Modifier Management

- **Modifier Group CRUD** - Complete modifier group lifecycle
- **Group-Level Configuration** - Single source of truth for:
  - **Selection Rules**: Display type (RADIO/CHECKBOX), min/max selection, applies per quantity
  - **Quantity Levels**: Default quantity levels (Light, Normal, Extra) with pricing
  - **Pricing by Size**: Size-based price deltas (S, M, L, XL, XXL)
- **Modifier Management** - Lightweight modifiers within groups:
  - Name, display order, is_default, max_quantity, is_active
  - Automatically inherit group-level settings
- **Item Integration** - Assign modifier groups to items with custom display order
- **Sides Configuration** - Item-level sides configuration per modifier group
- **Business-Scoped** - All modifier groups scoped to businesses
- **Validation** - Prevents deletion of groups used by items
- **Soft Delete** - Safe deletion with data preservation

### 🔧 Additional Features

- **TypeScript** - Full type safety
- **API Documentation** - Swagger/OpenAPI with complete schemas
- **Error Handling** - Centralized error management
- **Logging** - Structured logging
- **Email Service** - Nodemailer integration
- **Database Seeding** - Scripts for initial data
- **Health Checks** - Server status endpoint
- **Swagger Improvements** - Properly typed response schemas (no empty data objects)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (v24.12.0 recommended)
- **MongoDB** 5.0+ (local or cloud)
- **npm** or **yarn**
- **TypeScript** 5.3+

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd customize_server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/xrt-customized

   # JWT Secrets (minimum 32 characters)
   JWT_SECRET=your_jwt_secret_key_minimum_32_characters_long
   REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_minimum_32_characters

   # Token Expiration
   ACCESS_TOKEN_EXPIRE=15m
   REFRESH_TOKEN_EXPIRE=7d
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30

   # Server
   PORT=3001
   NODE_ENV=development
   API_BASE_URL=/api/v1

   # CORS
   CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002

   # Email (Optional - for password reset)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USERNAME=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   EMAIL_FROM=noreply@yourcompany.com
   EMAIL_FROM_NAME=XRT System

   # Cloudinary (optional; hero slides, logos, etc. use local uploads/ by default)
   # Set ATTACHMENT_STORAGE=cloudinary to upload images to Cloudinary instead.
   CLOUDINARY_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   # ATTACHMENT_STORAGE=disk   (default: local uploads folder)
   ```

4. **Seed initial data (optional)**

   ```bash
   # Create super admin
   npm run seed:admin

   # Seed businesses
   npm run seed:businesses

   # Seed customers (after Customer module refactoring)
   npm run seed:customers
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Access API**
   - **API Base**: `http://localhost:3001/api/v1`
   - **Health Check**: `http://localhost:3001/health`
   - **API Info**: `http://localhost:3001/api/v1/`
   - **Swagger Docs**: `http://localhost:3001/api-docs` (if configured)

## 📚 API Documentation

### Base URL

```
Development: http://localhost:3001/api/v1
Production: https://xrt-online-ordering.vercel.app/api/v1
```

### Authentication Endpoints

| Method | Endpoint                   | Description                | Auth Required |
| ------ | -------------------------- | -------------------------- | ------------- |
| POST   | `/auth/register`           | Register new user          | ❌            |
| POST   | `/auth/login`              | User login                 | ❌            |
| POST   | `/auth/refresh-token`      | Refresh access token       | ❌            |
| POST   | `/auth/forgot-password`    | Request password reset OTP | ❌            |
| POST   | `/auth/verify-reset-token` | Verify reset token         | ❌            |
| POST   | `/auth/reset-password`     | Reset password with OTP    | ❌            |
| GET    | `/auth/me`                 | Get current user profile   | ✅            |
| PATCH  | `/auth/update-password`    | Update user password       | ✅            |
| POST   | `/auth/logout`             | Logout user                | ✅            |

### User Management Endpoints (Admin)

| Method | Endpoint                      | Description             | Permission Required |
| ------ | ----------------------------- | ----------------------- | ------------------- |
| GET    | `/auth/users`                 | List all users          | `users:read`        |
| POST   | `/auth/users`                 | Create new user         | `users:create`      |
| GET    | `/auth/users/:id`             | Get user details        | `users:read`        |
| PATCH  | `/auth/users/:id`             | Update user             | `users:update`      |
| DELETE | `/auth/users/:id`             | Delete user             | `users:delete`      |
| PATCH  | `/auth/users/:id/approve`     | Approve user account    | `users:approve`     |
| PATCH  | `/auth/users/:id/ban`         | Ban/unban user          | `users:ban`         |
| PATCH  | `/auth/users/:id/permissions` | Update user permissions | `users:update`      |
| GET    | `/auth/users/:id/permissions` | Get user permissions    | `users:read`        |
| GET    | `/auth/permissions`           | List all permissions    | `users:read`        |

### Business Management Endpoints

| Method | Endpoint          | Description            | Auth Required |
| ------ | ----------------- | ---------------------- | ------------- |
| GET    | `/businesses`     | List user's businesses | ✅            |
| POST   | `/businesses`     | Create new business    | ✅            |
| GET    | `/businesses/:id` | Get business details   | ✅            |
| PATCH  | `/businesses/:id` | Update business        | ✅            |

### Category Management Endpoints

| Method | Endpoint          | Description          | Auth Required | Role Required            |
| ------ | ----------------- | -------------------- | ------------- | ------------------------ |
| GET    | `/categories`     | List all categories  | ✅            | Any authenticated        |
| GET    | `/categories/:id` | Get category details | ✅            | Any authenticated        |
| POST   | `/categories`     | Create category      | ✅            | `admin` or `super_admin` |
| PUT    | `/categories/:id` | Update category      | ✅            | `admin` or `super_admin` |
| DELETE | `/categories/:id` | Delete category      | ✅            | `admin` or `super_admin` |

### Item Management Endpoints

| Method | Endpoint     | Description      | Auth Required | Role Required            |
| ------ | ------------ | ---------------- | ------------- | ------------------------ |
| GET    | `/items`     | List all items   | ✅            | Any authenticated        |
| GET    | `/items/:id` | Get item details | ✅            | Any authenticated        |
| POST   | `/items`     | Create item      | ✅            | `admin` or `super_admin` |
| PUT    | `/items/:id` | Update item      | ✅            | `admin` or `super_admin` |
| DELETE | `/items/:id` | Delete item      | ✅            | `admin` or `super_admin` |

**Request Body (POST/PUT):**

- `multipart/form-data` with:
  - `name`, `description`, `base_price`, `category_id`, `business_id`
  - `image` (file upload)
  - `is_sizeable` (boolean) - If true, sizes are managed via `/items/:itemId/sizes` endpoint
  - `default_size_id` (optional) - ID of default ItemSize (only used when is_sizeable is true)
  - `modifier_groups` (JSON string - see detailed structure below)

**⚠️ Important Changes:**

- Item sizes are now managed separately via `/items/:itemId/sizes` endpoints
- When `is_sizeable = true`: Create sizes using POST `/items/:itemId/sizes`, then optionally set `default_size_id`
- When `is_sizeable = false`: Use `base_price`, `default_size_id` must be null
- See Item Size Management section below for size CRUD operations

**Modifier Groups Structure (JSON string):**

```json
[
  {
    "modifier_group_id": "507f1f77bcf86cd799439011",
    "display_order": 1,
    "sides_config": {
      "enabled": true,
      "allowed_sides": 2
    },
    "modifier_overrides": [
      {
        "modifier_id": "507f1f77bcf86cd799439012",
        "max_quantity": 5,
        "is_default": true,
        "prices_by_size": [
          { "sizeCode": "M", "priceDelta": 1.5 },
          { "sizeCode": "L", "priceDelta": 2.5 }
        ],
        "quantity_levels": [{ "quantity": 2, "name": "Extra", "price": 1.0, "is_default": true }]
      }
    ]
  }
]
```

**Modifier Overrides Explanation:**

- `modifier_overrides` (optional): Item-level customizations for individual modifiers
- Each override applies ONLY to the specific item and never affects:
  - The modifier globally
  - The modifier group globally
  - Other items using the same modifier
- Override fields are all optional:
  - `max_quantity`: Override modifier's max_quantity for this item
  - `is_default`: Override modifier's is_default flag for this item
  - `prices_by_size`: Item-level pricing per size (overrides group defaults)
  - `quantity_levels`: Item-level quantity levels (overrides group defaults)

### Modifier Group Management Endpoints

| Method | Endpoint               | Description                       | Auth Required | Role Required            |
| ------ | ---------------------- | --------------------------------- | ------------- | ------------------------ |
| GET    | `/modifier-groups`     | List all modifier groups          | ✅            | Any authenticated        |
| GET    | `/modifier-groups/:id` | Get modifier group with modifiers | ✅            | Any authenticated        |
| POST   | `/modifier-groups`     | Create modifier group             | ✅            | `admin` or `super_admin` |
| PUT    | `/modifier-groups/:id` | Update modifier group             | ✅            | `admin` or `super_admin` |
| DELETE | `/modifier-groups/:id` | Delete modifier group             | ✅            | `admin` or `super_admin` |

**Request Body (POST/PUT):**

```json
{
  "name": "Pizza Toppings",
  "display_type": "CHECKBOX",
  "min_select": 0,
  "max_select": 5,
  "applies_per_quantity": false,
  "quantity_levels": [
    { "quantity": 1, "name": "Light", "is_default": false, "display_order": 1 },
    { "quantity": 2, "name": "Normal", "is_default": true, "display_order": 2 },
    { "quantity": 3, "name": "Extra", "is_default": false, "display_order": 3 }
  ],
  "prices_by_size": [
    { "sizeCode": "S", "priceDelta": 0 },
    { "sizeCode": "M", "priceDelta": 1.5 },
    { "sizeCode": "L", "priceDelta": 2.5 },
    { "sizeCode": "XL", "priceDelta": 3.5 },
    { "sizeCode": "XXL", "priceDelta": 4.5 }
  ],
  "is_active": true,
  "sort_order": 1
}
```

### Item Size Management Endpoints

| Method | Endpoint     | Description                        | Auth Required | Role Required            |
| ------ | ------------ | ---------------------------------- | ------------- | ------------------------ |
| GET    | `/sizes`     | List all global sizes for business | ✅            | Any authenticated        |
| GET    | `/sizes/:id` | Get single size details            | ✅            | Any authenticated        |
| POST   | `/sizes`     | Create global size                 | ✅            | `admin` or `super_admin` |
| PUT    | `/sizes/:id` | Update global size                 | ✅            | `admin` or `super_admin` |
| DELETE | `/sizes/:id` | Delete global size                 | ✅            | `admin` or `super_admin` |

**Request Body (POST):**

```json
{
  "business_id": "your_business_id",
  "name": "Large",
  "code": "L",
  "display_order": 2,
  "is_active": true
}
```

**Request Body (PUT):**

- Same as POST, all fields optional

**Business Rules:**

- Sizes are **GLOBAL** per business (not per item)
- `code` must be unique per business (e.g., 'S', 'M', 'L', 'XL')
- Code is used for modifier pricing mapping (`prices_by_size.sizeCode` matches ItemSize.code)
- Items link to these sizes via pricing configuration
- Deleting a size affects all items using that size (soft delete recommended)

### Import System Endpoints (Super Admin Only)

| Method | Endpoint                      | Description                            | Auth Required | Role Required |
| ------ | ----------------------------- | -------------------------------------- | ------------- | ------------- |
| POST   | `/import/parse`               | Parse and validate CSV/ZIP file        | ✅            | `super_admin` |
| GET    | `/import/sessions`            | List all import sessions               | ✅            | `super_admin` |
| GET    | `/import/sessions/:id`        | Get import session details             | ✅            | `super_admin` |
| PUT    | `/import/sessions/:id`        | Update import session (save draft)     | ✅            | `super_admin` |
| POST   | `/import/sessions/:id/save`   | Final save to database (transactional) | ✅            | `super_admin` |
| DELETE | `/import/sessions/:id`        | Discard import session                 | ✅            | `super_admin` |
| GET    | `/import/sessions/:id/errors` | Download validation errors as CSV      | ✅            | `super_admin` |

**Import File Format:**

- Accepts single CSV file or ZIP containing multiple CSV files
- Uses business keys (item_key, group_key, modifier_key) - NOT database IDs
- Auto-detects entity type by filename or column presence
- Supported entities: Items, ItemSizes, ModifierGroups, Modifiers, ItemModifierOverrides

**Validation Rules:**

- **Items**: item_key unique, name required, base_price required if not sizable, at least one size if sizable
- **ItemSizes**: size_code unique per item, price > 0, exactly one default size per item
- **ModifierGroups**: group_key unique, name required, min_select ≤ max_select, valid display_type
- **Modifiers**: modifier_key unique per group, name required, max_quantity ≥ 1
- **Overrides**: Valid item_key, group_key, modifier_key, size_code must exist for item

**Import Session:**

- Status: `draft` (has errors), `validated` (no errors), `confirmed` (saved), `discarded`
- TTL: 7 days (auto-deleted after expiration)
- All validation errors and warnings stored for review
- Can be updated and re-validated before final save

**Safety Features:**

- No database writes until final save
- Transactional save with rollback on any failure
- Re-validation before final save
- Complete audit logging
- Super Admin only access

### Modifier Management Endpoints

| Method | Endpoint                                  | Description             | Auth Required | Role Required            |
| ------ | ----------------------------------------- | ----------------------- | ------------- | ------------------------ |
| GET    | `/modifier-groups/:groupId/modifiers`     | List modifiers in group | ✅            | Any authenticated        |
| POST   | `/modifier-groups/:groupId/modifiers`     | Create modifier         | ✅            | `admin` or `super_admin` |
| PUT    | `/modifier-groups/:groupId/modifiers/:id` | Update modifier         | ✅            | `admin` or `super_admin` |
| DELETE | `/modifier-groups/:groupId/modifiers/:id` | Delete modifier         | ✅            | `admin` or `super_admin` |

**Request Body (POST/PUT):**

```json
{
  "name": "Pepperoni",
  "is_default": false,
  "max_quantity": 3,
  "display_order": 1,
  "is_active": true
}
```

## 🔐 Authentication Flow

### 1. Register User

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secure_password_123",
    "role": "client"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "secure_password_123"
  }'
```

### 3. Use Protected Endpoints

```bash
curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Refresh Token

```bash
curl -X POST http://localhost:3001/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## 🎭 Role-Based Access Control

### Built-in Roles

| Role          | Description                 | Default Permissions             |
| ------------- | --------------------------- | ------------------------------- |
| `super_admin` | **SYSTEM ROLE** (Immutable) | All permissions                 |
| `admin`       | Custom Role (Template)      | Most admin permissions          |
| `manager`     | Custom Role (Template)      | Business management permissions |
| `client`      | Custom Role (Template)      | Profile & content read          |
| `user`        | Custom Role (Default)       | Profile only                    |

### Available Permissions

#### User Management

- `users:read` - View user information
- `users:create` - Create new users
- `users:update` - Update user data
- `users:delete` - Delete users
- `users:approve` - Approve user accounts
- `users:ban` - Ban/unban users

#### Category Management

- `categories:read` - View categories
- `categories:create` - Create categories
- `categories:update` - Update categories
- `categories:delete` - Delete categories

#### Item Management

- `items:read` - View items
- `items:create` - Create items
- `items:update` - Update items
- `items:delete` - Delete items

#### Modifier Group Management

- `modifier-groups:read` - View modifier groups
- `modifier-groups:create` - Create modifier groups
- `modifier-groups:update` - Update modifier groups
- `modifier-groups:delete` - Delete modifier groups

#### Modifier Management

- `modifiers:read` - View modifiers
- `modifiers:create` - Create modifiers
- `modifiers:update` - Update modifiers
- `modifiers:delete` - Delete modifiers

#### Content Management

- `content:read` - View content
- `content:create` - Create content
- `content:update` - Update content
- `content:delete` - Delete content
- `content:publish` - Publish content

#### System

- `system:read` - View system information
- `system:update` - Update system settings
- `system:backup` - System backup
- `system:logs` - View system logs

#### Profile

- `profile:read` - View profile
- `profile:update` - Update profile

#### Permissions Management (Super Admin)

- `permissions:read` - View all permissions
- `permissions:update` - Update permission status

#### Admin

- `admin:dashboard` - Access admin dashboard
- `admin:settings` - Manage settings
- `admin:analytics` - View analytics

#### Roles

- `roles:read` - View roles
- `roles:create` - Create roles
- `roles:update` - Update roles
- `roles:delete` - Delete roles

#### Withdraws

- `withdraws:read` - View withdrawals
- `withdraws:create` - Create withdrawal
- `withdraws:update` - Update withdrawal
- `withdraws:delete` - Delete withdrawal

## 🛠️ Development

### Project Structure

```
customize_server/
├── src/
│   ├── domain/                    # Business logic layer
│   │   ├── entities/              # Domain entities
│   │   │   ├── User.ts
│   │   │   ├── Business.ts
│   │   │   ├── BusinessSettings.ts
│   │   │   ├── Category.ts
│   │   │   ├── Item.ts
│   │   │   ├── ModifierGroup.ts
│   │   │   └── Modifier.ts
│   │   ├── repositories/          # Repository interfaces
│   │   │   ├── IUserRepository.ts
│   │   │   ├── IBusinessRepository.ts
│   │   │   ├── ICategoryRepository.ts
│   │   │   ├── IItemRepository.ts
│   │   │   ├── IModifierGroupRepository.ts
│   │   │   └── IModifierRepository.ts
│   │   ├── services/              # Service interfaces
│   │   │   ├── IEmailService.ts
│   │   │   └── IImageStorage.ts
│   │   └── usecases/             # Business use cases
│   │       ├── auth/
│   │       ├── users/
│   │       ├── businesses/
│   │       ├── categories/
│   │       ├── items/
│   │       ├── modifier-groups/
│   │       └── modifiers/
│   ├── application/               # Application layer
│   │   ├── controllers/           # HTTP controllers
│   │   │   ├── AuthController.ts
│   │   │   ├── BusinessController.ts
│   │   │   ├── CategoryController.ts
│   │   │   ├── ItemController.ts
│   │   │   ├── ModifierGroupController.ts
│   │   │   └── ModifierController.ts
│   │   ├── routes/                # Express routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── business.routes.ts
│   │   │   ├── category.routes.ts
│   │   │   ├── item.routes.ts
│   │   │   ├── modifier-group.routes.ts
│   │   │   └── modifier.routes.ts
│   │   └── middlewares/           # Express middlewares
│   │       ├── auth.ts            # Authentication
│   │       ├── authorize.ts       # Authorization
│   │       └── upload.ts          # File upload
│   ├── infrastructure/            # Infrastructure layer
│   │   ├── database/
│   │   │   ├── connection.ts      # MongoDB connection
│   │   │   └── models/            # Mongoose models
│   │   ├── repositories/          # Repository implementations
│   │   ├── auth/                  # JWT service
│   │   ├── cloudinary/            # Image storage
│   │   └── services/               # Service implementations
│   ├── shared/                    # Shared utilities
│   │   ├── config/                # Configuration
│   │   ├── constants/             # Constants & enums
│   │   ├── errors/                # Error classes
│   │   └── utils/                 # Utilities
│   └── server.ts                  # Application entry point
├── config/                        # Configuration files
│   ├── passport.ts                # Passport strategies
│   └── swagger.ts                 # Swagger/OpenAPI config
├── scripts/                       # Database seeding scripts
│   ├── seedSuperAdmin.ts
│   ├── seedBusinesses.ts
│   └── seedCustomers.ts
├── postman/                       # Postman collection
├── public/                        # Static files
├── views/                         # Email templates
├── package.json
├── tsconfig.json
└── nodemon.json
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload

# Production
npm start                # Start production server
npm run build            # Build TypeScript to JavaScript

# Database Seeding
npm run seed:admin       # Create super admin user
npm run seed:businesses  # Seed sample businesses
npm run seed:customers   # Seed sample customers

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run type-check       # Type check without building
```

### TypeScript Configuration

The project uses TypeScript with ESM modules. Key configuration:

- **Module System**: ESNext (ES Modules)
- **Target**: ES2020
- **Module Resolution**: Node
- **Strict Mode**: Enabled
- **Source**: `src/` directory
- **Output**: `dist/` directory

## 📱 API Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

### Paginated Response

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [...],
    "paginatorInfo": {
      "total": 100,
      "currentPage": 1,
      "lastPage": 10,
      "perPage": 10,
      "count": 10
    }
  }
}
```

## 🔒 Security Features

- ✅ **JWT Authentication** - Access & refresh token system
- ✅ **Password Hashing** - bcrypt with 10 salt rounds
- ✅ **Rate Limiting** - 100 requests per 15 minutes per IP
- ✅ **CORS Protection** - Configurable allowed origins
- ✅ **Input Sanitization** - MongoDB injection protection
- ✅ **Helmet Security** - HTTP security headers
- ✅ **Permission-Based Access** - Granular permission system
- ✅ **Account Status Management** - Active/inactive/banned
- ✅ **Secure Password Reset** - OTP-based flow
- ✅ **Token Expiration** - Short-lived access tokens

## 🌐 Production Deployment

### Environment Setup

1. **Set NODE_ENV to production**

   ```env
   NODE_ENV=production
   ```

2. **Use strong JWT secrets** (minimum 32 characters)

   ```env
   JWT_SECRET=your_very_long_and_secure_secret_key_minimum_32_characters
   REFRESH_TOKEN_SECRET=your_very_long_and_secure_refresh_secret_key_minimum_32_characters
   ```

3. **Configure MongoDB with authentication**

   ```env
   MONGODB_URI=mongodb://username:password@host:port/database?authSource=admin
   ```

4. **Set up reverse proxy** (nginx/Apache)
5. **Enable HTTPS** with SSL certificates
6. **Configure email service** for production

### Build for Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 📊 Monitoring & Logging

### Development Mode

- Detailed error messages with stack traces
- Request/response logging
- Database query logging (if enabled)

### Production Mode

- Error tracking only
- Performance monitoring
- Security event logging

## 🧪 Testing

### Manual Testing

Use the provided Postman collection:

1. Import `postman/XRT-Customized-System.postman_collection.json`
2. Set environment variables:
   - `baseUrl`: `http://localhost:3001/api/v1`
   - `accessToken`: Get from login response
   - `refreshToken`: Get from login response

### API Testing

```bash
# Health check
curl http://localhost:3001/health

# Register user
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"client"}'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow Clean Architecture principles
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow Clean Architecture structure
- Use async/await for async operations
- Use centralized error handling
- Add JSDoc comments for public APIs

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:

- **Email**: support@xrt.com
- **API Documentation**: `http://localhost:3001/api-docs`
- **API Info**: `http://localhost:3001/api/v1/`
- **Health Check**: `http://localhost:3001/health`

---

## 🎯 Key Highlights

✨ **Clean Architecture** - Maintainable, testable, scalable  
✨ **TypeScript** - Full type safety  
✨ **RBAC** - Granular permission system  
✨ **JWT Auth** - Secure token-based authentication  
✨ **Multi-Business** - Support for multiple businesses  
✨ **Production Ready** - Error handling, logging, security

🎉 **Built with enterprise-grade security and scalability in mind**
