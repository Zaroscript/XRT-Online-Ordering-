# 📘 API Documentation Guide

## 🚀 Quick Start

The XRT Customized System includes comprehensive API documentation for seamless integration and development.

### 📍 Access Points

1. **API Documentation**: `http://localhost:3001/api-docs`
2. **API Info**: `http://localhost:3001/api-info`
3. **Base API**: `http://localhost:3001/api/v1`

## 🎯 Features

### 📚 Interactive Documentation
- **Live testing** capabilities for each endpoint
- **Real-time API validation** from your browser
- **Complete request/response examples**
- **Integrated authentication** with JWT tokens

### 🔐 Authentication Setup
1. Click the **"Authorize"** button in the documentation
2. Enter your JWT token in format: `Bearer your_access_token`
3. Click **"Authorize"** to authenticate
4. Test protected endpoints immediately

## 📋 Available Endpoints

### 🔑 Authentication (`/auth`)
- `POST /auth/register` - Create new user account
- `POST /auth/login` - User authentication
- `POST /auth/refresh-token` - Token refresh mechanism
- `POST /auth/forgot-password` - Password recovery request

### 👥 User Management (`/auth`)
- `GET /auth/users` - Retrieve all users (Admin only)
- `PATCH /auth/users/:id/approve` - Approve user registration
- `PATCH /auth/users/:id/ban` - User ban management
- `PATCH /auth/users/:id/permissions` - Permission assignment
- `GET /auth/users/:id/permissions` - View user permissions
- `GET /auth/permissions` - List available permissions

### 🎭 Role Management (`/roles`)
- `POST /roles` - Create custom role
- `GET /roles` - List all roles
- `GET /roles/:id` - Get role details
- `PATCH /roles/:id` - Update role configuration
- `DELETE /roles/:id` - Remove role
- `PATCH /roles/users/:id/assign` - Assign role to user
- `PATCH /roles/users/:id/remove` - Remove user role

## 🧪 Testing Workflow

### Step 1: Create Admin Account
```json
{
  "name": "System Administrator",
  "email": "admin@yourcompany.com",
  "password": "secure_password_123",
  "role": "super_admin"
}
```

### Step 2: Authenticate
```json
{
  "email": "admin@yourcompany.com",
  "password": "secure_password_123"
}
```

### Step 3: Configure Documentation Access
1. Copy the `accessToken` from login response
2. Click "Authorize" in API documentation
3. Enter: `Bearer your_access_token_here`
4. Click "Authorize" to complete setup

### Step 4: Test API Endpoints
Use the "Try it out" feature to test any endpoint with live data!

## 📊 Response Formats

### Success Response (201 Created)
```json
{
  "status": "success",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
      "name": "System Administrator",
      "email": "admin@yourcompany.com",
      "role": "super_admin",
      "permissions": ["users:read", "users:create", "users:update"],
      "isApproved": true,
      "isActive": true,
      "isBanned": false,
      "createdAt": "2023-07-05T12:00:00.000Z"
    }
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "status": "error",
  "message": "Email address already registered"
}
```

## 🔧 Development Integration

### 📝 Request Validation
The documentation provides complete validation details:
- Required field specifications
- Data type requirements
- Validation constraints
- Sample input values

### 🔍 Response Documentation
- Complete response schemas
- Error handling formats
- HTTP status code meanings
- Real response examples

### 🛡️ Security Information
- Authentication requirements
- Permission specifications
- Role-based access rules

## 🌐 Production Configuration

For production deployment, update server URLs in `config/swagger.js`:

```javascript
servers: [
  {
    url: 'https://api.yourcompany.com/v1',
    description: 'Production API Server'
  }
]
```

## 📱 Client Integration

The API documentation provides:
- **OpenAPI specification** at `/api-docs/json`
- **Postman collection** export functionality
- **Multi-language code generation**
- **SDK generation capabilities**

## 🚀 Business Benefits

1. **📖 Zero Maintenance Documentation** - Always up-to-date API docs
2. **🧪 Instant Testing** - Browser-based API validation
3. **👥 Team Productivity** - Shared documentation platform
4. **🔧 Rapid Development** - Faster API integration
5. **📱 Client Ready** - Generate SDKs automatically
6. **🛡️ Security Transparency** - Clear permission models

## 🎯 Implementation Steps

1. **Access documentation** at `http://localhost:3001/api-docs`
2. **Test authentication flow** using interactive features
3. **Configure custom roles** via role management
4. **Validate user permissions** across different roles
5. **Export documentation** for team distribution

---

🎉 **Professional API documentation ready for production use!**
