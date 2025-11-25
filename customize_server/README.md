# 🚀 XRT Customized System

Enterprise-grade authentication and user management system with role-based access control.

## 📋 Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **User Management** - Complete user lifecycle management
- 🎭 **Role-Based Access Control** - Flexible permission system
- 📚 **API Documentation** - Interactive Swagger documentation
- 🔧 **Admin Dashboard** - Comprehensive admin tools
- 🛡️ **Security First** - Built-in security best practices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB
- npm or yarn

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
   ```bash
   node setup-env.js
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

5. **Access API documentation**
   - Open: http://localhost:3001/api-docs
   - API Info: http://localhost:3001/api-info

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create new user account |
| POST | `/auth/login` | User authentication |
| POST | `/auth/refresh-token` | Refresh access token |
| POST | `/auth/forgot-password` | Password recovery |

### User Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/auth/users` | List all users | ✅ |
| PATCH | `/auth/users/:id/approve` | Approve user account | ✅ |
| PATCH | `/auth/users/:id/ban` | Ban/unban user | ✅ |
| PATCH | `/auth/users/:id/permissions` | Update permissions | ✅ |

### Role Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/roles` | List all roles | ✅ |
| POST | `/roles` | Create new role | ✅ |
| PATCH | `/roles/:id` | Update role | ✅ |
| DELETE | `/roles/:id` | Delete role | ✅ |
| PATCH | `/roles/users/:id/assign` | Assign role to user | ✅ |

## 🔐 Authentication Flow

### 1. Create Super Admin
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "System Administrator",
    "email": "admin@yourcompany.com",
    "password": "secure_password_123",
    "role": "super_admin"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "secure_password_123"
  }'
```

### 3. Use Token
```bash
curl -X GET http://localhost:3001/api/v1/auth/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🎭 Role System

### Built-in Roles

- **super_admin** - Full system access
- **admin** - Administrative access
- **manager** - Management access
- **client** - Standard user access
- **user** - Limited access

### Custom Roles

Create custom roles with specific permissions:

```json
{
  "name": "content-manager",
  "displayName": "Content Manager",
  "description": "Can manage content but not users",
  "permissions": [
    "content:read",
    "content:create",
    "content:update"
  ]
}
```

### Available Permissions

- **users:read** - View user information
- **users:create** - Create new users
- **users:update** - Update user data
- **users:delete** - Delete users
- **users:approve** - Approve user accounts
- **users:ban** - Ban/unban users
- **roles:read** - View roles
- **roles:create** - Create roles
- **roles:update** - Update roles
- **roles:delete** - Delete roles
- **content:read** - View content
- **content:create** - Create content
- **content:update** - Update content
- **content:delete** - Delete content
- **system:read** - View system information
- **system:update** - Update system settings

## 🔧 Configuration

### Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/xrt-customized

# JWT Secrets
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_minimum_32_characters

# Token Expiration
ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d
JWT_EXPIRE=30d

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@yourcompany.com
EMAIL_FROM_NAME=XRT System
```

## 🛠️ Development

### Project Structure

```
customize_server/
├── config/
│   ├── database.js      # Database configuration
│   ├── config.js        # App configuration
│   ├── passport.js      # Passport authentication
│   └── swagger.js       # API documentation
├── controllers/
│   ├── authController.js # Authentication logic
│   └── roleController.js # Role management logic
├── middleware/
│   ├── auth.js          # Authentication middleware
│   └── permissions.js   # Permission middleware
├── models/
│   └── User.js          # User and role schemas
├── routes/
│   ├── auth.js          # Authentication routes
│   └── roles.js         # Role management routes
├── utils/
│   ├── catchAsync.js    # Async error handler
│   └── email.js         # Email utilities
├── postman/
│   └── XRT-Customized-System.postman_collection.json
├── SWAGGER_GUIDE.md     # API documentation guide
└── README.md            # This file
```

### Scripts

```bash
# Start development server
npm run dev

# Start production server
npm start

# Setup environment
node setup-env.js
```

## 📱 Postman Collection

Import the provided Postman collection for easy API testing:

1. Open Postman
2. Click "Import"
3. Select `postman/XRT-Customized-System.postman_collection.json`
4. Update environment variables:
   - `baseUrl`: http://localhost:3001
   - `accessToken`: Get from login response
   - `refreshToken`: Get from login response

## 🔒 Security Features

- **JWT Authentication** with access and refresh tokens
- **Password Hashing** using bcrypt
- **Rate Limiting** on sensitive endpoints
- **CORS Protection** with configurable origins
- **Input Validation** on all endpoints
- **Permission-Based Access Control**
- **Account Status Management** (active/inactive/banned)
- **Secure Password Reset** flow

## 🌐 Production Deployment

### Environment Setup

1. **Set NODE_ENV to production**
2. **Use strong JWT secrets** (minimum 32 characters)
3. **Configure MongoDB with authentication**
4. **Set up reverse proxy** (nginx/Apache)
5. **Enable HTTPS** with SSL certificates
6. **Configure email service** for production

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 📊 Monitoring & Logging

### Development Mode
- Detailed error messages
- Request/response logging
- Database query logging

### Production Mode
- Error tracking only
- Performance monitoring
- Security event logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Email: dev@xrt.com
- Documentation: http://localhost:3001/api-docs
- API Info: http://localhost:3001/api-info

---

🎉 **Built with enterprise-grade security and scalability in mind**
