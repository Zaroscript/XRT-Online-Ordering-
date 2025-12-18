# XRT Online Ordering System

Enterprise-grade online ordering platform with comprehensive business management, customer relationship management, and role-based access control.

## 🏗️ Project Architecture

This monorepo contains two main applications:

### 📊 Admin Dashboard (`/admin`)

- **Technology**: Next.js 13+, TypeScript, TailwindCSS
- **Port**: 3002
- **Purpose**: Administrative interface for business management
- **Features**: User management, business oversight, analytics, role-based UI

### 🚀 Backend Server (`/customize_server`)

- **Technology**: Node.js, Express, MongoDB, JWT Authentication
- **Port**: 3001
- **Purpose**: RESTful API with comprehensive business logic
- **Features**: Authentication, user management, business management, location management, customer management

## ✨ Key Features

### 🔐 Authentication & Security

- JWT-based authentication with access/refresh tokens
- Role-based access control (RBAC)
- Permission-based endpoint protection
- Password hashing with bcrypt
- Account approval workflows
- User banning/unbanning capabilities

### 👥 User Management

- Multi-role user system (super_admin, admin, manager, client, user)
- Custom role creation with granular permissions
- User profile management
- Permission assignment and management

### 🏢 Business Management

### 🏢 Business Management

- Business registration and verification
- Owner assignment and transfer
- Business activation/deactivation
- **Unified Business Settings**: Manage operating hours, delivery fees, and tax settings
- **Extended Business Profile**: Social media, location coordinates, and custom messages
- Contact information management
- Business metadata and branding

### 📍 Location Management

- Multi-location support per business
- Geolocation with coordinates
- Operating hours management
- Contact information per location
- Online ordering configuration (pickup/delivery)

### 👤 Customer Management

- Customer profiles with preferences
- Rewards and loyalty system
- Address management
- Order history tracking
- CSV import/export functionality
- Customer segmentation by business/location

### 💳 Financial Management

- Withdrawal management system
- Transaction tracking
- Business revenue analytics

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 5.0+
- npm or yarn

### 1. Clone the Repository

```bash
git clone <[repository-url](https://github.com/thomasibrahim10/XRT-Online-Ordering-.git)>
cd XRT-Online-Ordering-
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd customize_server

# Install dependencies
npm install

# Set up environment variables
node setup-env.js

# Start development server
npm run dev
```

The backend will be available at `http://localhost:3001`

### 3. Frontend Setup

```bash
# Navigate to admin dashboard (new terminal)
cd admin

# Install dependencies
npm install

# Start development server
npm run dev
```

The admin dashboard will be available at `http://localhost:3002`

## 🔧 Environment Configuration

### Backend Environment Variables (.env)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/xrt-online-ordering

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
CORS_ORIGIN=http://localhost:3000,http://localhost:3002

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@xrt.com
EMAIL_FROM_NAME=XRT System
```

### Frontend Environment Variables (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_NAME=XRT Online Ordering
```

## 📚 API Documentation

### Interactive Documentation

- **Swagger UI**: `http://localhost:3001/api-docs`
- **API Info**: `http://localhost:3001/api/v1/`
- **OpenAPI Spec**: `http://localhost:3001/api-docs.json`

### API Endpoints Overview

#### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh-token` - Token refresh
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset confirmation
- `GET /auth/me` - Get current user profile
- `PATCH /auth/update-password` - Update password
- `POST /auth/logout` - User logout

#### User Management (Admin)

- `GET /auth/users` - List all users
- `POST /auth/users` - Create user
- `GET /auth/users/:id` - Get user details
- `PATCH /auth/users/:id` - Update user
- `DELETE /auth/users/:id` - Delete user
- `PATCH /auth/users/:id/approve` - Approve user account
- `PATCH /auth/users/:id/ban` - Ban/unban user
- `PATCH /auth/users/:id/permissions` - Update user permissions
- `GET /auth/users/:id/permissions` - Get user permissions
- `GET /auth/permissions` - List all permissions

#### Role Management

- `GET /roles` - List all roles
- `POST /roles` - Create role
- `GET /roles/:id` - Get role details
- `PATCH /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role
- `PATCH /roles/users/:id/assign` - Assign role to user
- `PATCH /roles/users/:id/remove` - Remove role from user
- `GET /roles/users/:roleId` - Get users with role

#### Business Management

- `GET /businesses` - List all businesses
- `POST /businesses` - Create business
- `GET /businesses/:id` - Get business details
- `PUT /businesses/:id` - Update business
- `DELETE /businesses/:id` - Delete business
- `PATCH /businesses/:id/activate` - Activate business

#### Business Management

- `GET /businesses` - List all businesses
- `POST /businesses` - Create business
- `GET /businesses/:id` - Get business details
- `PUT /businesses/:id` - Update business
- `DELETE /businesses/:id` - Delete business
- `PATCH /businesses/:id/activate` - Activate business
- `PATCH /businesses/:id/deactivate` - Deactivate business
- `PATCH /businesses/:id/owner` - Update business owner
- `GET /businesses/owner/:ownerId` - Get businesses by owner
- `GET /business-settings` - Get business settings
- `PATCH /business-settings` - Update business settings

#### Location Management

- `GET /locations` - List all locations
- `POST /locations` - Create location
- `GET /locations/:id` - Get location details
- `PUT /locations/:id` - Update location
- `DELETE /locations/:id` - Delete location
- `PATCH /locations/:id/activate` - Activate location
- `PATCH /locations/:id/deactivate` - Deactivate location
- `GET /locations/nearby` - Get nearby locations
- `GET /locations/business/:businessId` - Get locations by business

#### Customer Management

- `GET /customers` - List all customers
- `POST /customers` - Create customer
- `GET /customers/:id` - Get customer details
- `PATCH /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer
- `GET /customers/top-rewards` - Get top customers by rewards
- `GET /customers/business/:businessId` - Get customers by business
- `GET /customers/location/:locationId` - Get customers by location
- `PATCH /customers/:id/rewards/add` - Add rewards to customer
- `PATCH /customers/:id/rewards/redeem` - Redeem customer rewards
- `POST /customers/import` - Import customers from CSV
- `POST /customers/export` - Export customers to CSV

#### Withdraw Management

- `GET /withdraws` - List all withdrawal requests

## 🎭 Role-Based Access Control

### Built-in Roles

- **super_admin**: Full system access
- **admin**: Administrative access
- **manager**: Management access
- **client**: Standard business user access
- **user**: Limited access

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
- **businesses:read** - View businesses
- **businesses:create** - Create businesses
- **businesses:update** - Update businesses
- **businesses:delete** - Delete businesses
- **locations:read** - View locations
- **locations:create** - Create locations
- **locations:update** - Update locations
- **locations:delete** - Delete locations
- **customers:read** - View customers
- **customers:create** - Create customers
- **customers:update** - Update customers
- **customers:delete** - Delete customers
- **withdraws:read** - View withdrawal requests
- **system:read** - View system information
- **system:update** - Update system settings

## 🛠️ Development

### Project Structure

```
XRT-Online-Ordering-/
├── admin/                          # Next.js Admin Dashboard
│   ├── src/
│   │   ├── components/              # React components
│   │   ├── pages/                 # Next.js pages
│   │   ├── contexts/              # React contexts
│   │   ├── hooks/                 # Custom hooks
│   │   ├── utils/                 # Utility functions
│   │   └── types/                 # TypeScript definitions
│   ├── public/                    # Static assets
│   ├── package.json
│   └── tailwind.config.js
├── customize_server/               # Express.js Backend API
│   ├── controllers/               # Route controllers
│   ├── models/                   # Database models
│   ├── routes/                   # API routes
│   ├── middleware/               # Express middleware
│   ├── config/                   # Configuration files
│   ├── utils/                    # Utility functions
│   ├── scripts/                  # Database seeding scripts
│   ├── utils/                    # Utility functions
│   ├── scripts/                  # Database seeding scripts
│   ├── postman/                  # Postman collections
│   └── package.json
└── README.md                     # This file
```

### Available Scripts

#### Backend (customize_server)

```bash
npm run dev          # Start development server
npm start           # Start production server
npm run dev          # Start development server
npm start           # Start production server
npm run lint        # Run ESLint
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
```

#### Frontend (admin)

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Database Seeding

```bash
# Seed super admin user
node scripts/seedSuperAdmin.js

# Seed sample businesses
node scripts/seedBusinesses.js

# Seed sample customers
node scripts/seedCustomers.js
```

## 📱 Postman Collection

Import the provided Postman collection for easy API testing:

1. Open Postman
2. Click "Import"
3. Select `customize_server/postman/XRT-Customized-System.postman_collection.json`
4. Update environment variables:
   - `baseUrl`: http://localhost:3001
   - `accessToken`: Get from login response
   - `refreshToken`: Get from login response
   - `adminAccessToken`: Get from admin login response

## 🔒 Security Features

- **JWT Authentication** with access and refresh tokens
- **Password Hashing** using bcrypt
- **Rate Limiting** on sensitive endpoints
- **CORS Protection** with configurable origins
- **Input Validation** on all endpoints
- **Permission-Based Access Control**
- **Account Status Management** (active/inactive/banned)
- **Secure Password Reset** flow
- **HTTP-Only Cookies** for token storage

## 🌐 Production Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Use strong JWT secrets (minimum 32 characters)
3. Configure MongoDB with authentication
4. Set up reverse proxy (nginx/Apache)
5. Enable HTTPS with SSL certificates
6. Configure email service for production

### Docker Deployment

Backend Dockerfile:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

Frontend Dockerfile:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3002
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

- Email: support@xrttech.com
- Documentation: http://localhost:3001/api-docs
- API Info: http://localhost:3001/api/v1/

---

🎉 **Built with enterprise-grade security and scalability in mind**
