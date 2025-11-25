import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m',
  });
};

const createSendToken = async (user, statusCode, res) => {
  const accessToken = signToken(user._id);
  const refreshToken = user.generateRefreshToken();
  
  // Save refresh token to database
  await user.save({ validateBeforeSave: false });

  // Remove password from output
  user.password = undefined;
  user.refreshToken = undefined;
  user.refreshTokenExpires = undefined;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // Send tokens in HTTP-only cookies
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
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

  res.status(statusCode).json({
    status: 'success',
    accessToken,
    refreshToken,
    data: {
      user,
    },
  });
};

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: User full name
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           minLength: 8
 *           description: User password (min 8 characters)
 *           example: "password123"
 *         role:
 *           type: string
 *           enum: [super_admin, admin, manager, client, user]
 *           description: User role
 *           default: "client"
 *           example: "client"
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request - validation error or duplicate email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and password are required',
      });
    }

    // Additional validation
    if (password.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 8 characters long',
      });
    }

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'client', // Default to 'client' if not provided
      isApproved: role === 'super_admin' // Auto-approve super admins
    });

    await createSendToken(newUser, 201, res);
  } catch (err) {
    console.error('Registration error:', err);
    
    // Handle duplicate email error
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        status: 'error',
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        status: 'error',
        message: errors.join(', '),
      });
    }
    
    // Handle other errors
    res.status(400).json({
      status: 'error',
      message: err.message || 'Registration failed',
    });
  }
};

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           description: User password
 *           example: "password123"
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Account not approved or banned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password',
      });
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password, user.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password',
      });
    }

    // 3) Check if account is approved
    if (!user.isApproved) {
      return res.status(403).json({
        status: 'error',
        message: 'Your account is pending approval',
      });
    }

    // 4) Check if account is banned
    if (user.isBanned) {
      return res.status(403).json({
        status: 'error',
        message: user.banReason || 'Your account has been banned',
      });
    }

    // 5) If everything ok, send token to client
    await createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'No refresh token provided',
      });
    }

    // 1) Verify refresh token
    const decoded = await promisify(jwt.verify)(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // 2) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists',
      });
    }

    // 3) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'error',
        message: 'User recently changed password! Please log in again',
      });
    }

    // 4) Check if refresh token is still valid
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    if (hashedToken !== currentUser.refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token',
      });
    }

    if (Date.now() > currentUser.refreshTokenExpires) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token has expired',
      });
    }

    // 5) Generate new access token
    const accessToken = currentUser.generateAccessToken();
    
    // 6) Send new access token
    res.status(200).json({
      status: 'success',
      accessToken,
    });
  } catch (err) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid refresh token',
    });
  }
};

export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

export const forgotPassword = async (req, res, next) => {
  try {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'There is no user with that email address',
      });
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/reset-password/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
      // In development, skip email sending and just return success
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Development mode: Skipping email, token would be sent to', user.email);
        console.log('🔗 Reset URL:', resetURL);
        
        res.status(200).json({
          status: 'success',
          message: 'Token sent to email! (Development mode - check console)',
          resetToken // Only in development for testing
        });
      } else {
        await sendEmail({
          email: user.email,
          subject: 'Your password reset token (valid for 10 min)',
          message,
        });

        res.status(200).json({
          status: 'success',
          message: 'Token sent to email!',
        });
      }
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending the email. Try again later!',
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Token is invalid or has expired',
      });
    }

    // Validate password
    if (!req.body.password || typeof req.body.password !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Password is required and must be a string',
      });
    }

    if (req.body.password.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 8 characters long',
      });
    }

    // 3) Update changedPasswordAt property for the user
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 4) Log the user in, send JWT
    await createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if POSTed current password is correct
    if (!(await user.comparePassword(req.body.currentPassword, user.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Your current password is wrong',
      });
    }

    // Validate new password
    if (!req.body.newPassword || typeof req.body.newPassword !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'New password is required and must be a string',
      });
    }

    if (req.body.newPassword.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be at least 8 characters long',
      });
    }

    // 3) If so, update password
    user.password = req.body.newPassword;
    await user.save();

    // 4) Log user in, send JWT
    await createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Admin functions
/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -refreshToken -passwordResetToken -passwordResetExpires');
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

export const approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true, runValidators: false }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
};

export const banUser = async (req, res) => {
  try {
    const { isBanned, banReason } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned, banReason: isBanned ? banReason : undefined },
      { new: true, runValidators: false }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Permission management functions
export const updateUserPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    
    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        status: 'error',
        message: 'Permissions must be an array',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { permissions },
      { new: true, runValidators: false }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
};

export const getUserPermissions = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('permissions role');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        permissions: user.permissions,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

export const getAllPermissions = async (req, res) => {
  try {
    const allPermissions = [
      // User management permissions
      "users:read",
      "users:create", 
      "users:update",
      "users:delete",
      "users:approve",
      "users:ban",
      
      // Content management permissions
      "content:read",
      "content:create",
      "content:update", 
      "content:delete",
      "content:publish",
      
      // System permissions
      "system:read",
      "system:update",
      "system:backup",
      "system:logs",
      
      // Profile permissions
      "profile:read",
      "profile:update",
      
      // Admin permissions
      "admin:dashboard",
      "admin:settings",
      "admin:analytics"
    ];

    res.status(200).json({
      status: 'success',
      data: {
        permissions: allPermissions,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};
