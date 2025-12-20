import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';

const signToken = id => {
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
    expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000),
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
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, password, and role are required',
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
      role,
      permissions: req.body.permissions || [],
      isApproved: role === 'super_admin', // Auto-approve super admins
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
 * /auth/users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *       403:
 *         description: Insufficient permissions
 */
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    console.log('Create user request body:', req.body);
    console.log('Extracted values:', { name, email, password: password ? '***' : undefined, role });

    // Validate required fields
    if (!name || !email || !password || !role) {
      console.log('Validation failed. Missing fields:', {
        name: !!name,
        email: !!email,
        password: !!password,
        role: !!role
      });
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, password, and role are required',
      });
    }

    // Additional validation
    if (password.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 8 characters long',
      });
    }

    console.log('Attempting to create user with role:', role);
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      permissions: req.body.permissions || [],
      isApproved: true, // Admin-created users are auto-approved
    });

    // Remove password from output
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    console.error('User creation error:', err);

    // Handle duplicate email error
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already exists',
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

    res.status(400).json({
      status: 'error',
      message: err.message || 'User creation failed',
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
    console.log('Login attempt for email:', email);

    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password',
      });
    }

    console.log('Found user:', { id: user._id, role: user.role, isApproved: user.isApproved });
    const isMatch = await user.comparePassword(password, user.password);
    console.log('Password match status:', isMatch);

    if (!isMatch) {
      console.log('Password mismatch for user:', email);
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

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 */
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
    const decoded = await promisify(jwt.verify)(refreshToken, process.env.REFRESH_TOKEN_SECRET);

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
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

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

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user and clear cookies
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 */
export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.cookie('access_token', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: Password reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Password reset email sent
 */
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

    // 2) Generate the random reset OTP
    const otp = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const message = `Your password reset OTP is: ${otp}\n\nThis code is valid for 10 minutes.\nIf you didn't request a password reset, please ignore this email.`;

    try {
      // In development, skip email sending and just return success
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Development mode: OTP for', user.email, 'is:', otp);

        res.status(200).json({
          success: true,
          message: 'OTP sent to email! (Development mode - check console)',
          otp, // Only in development for testing
        });
      } else {
        await sendEmail({
          email: user.email,
          subject: 'Your password reset OTP (valid for 10 min)',
          message,
        });

        res.status(200).json({
          success: true,
          message: 'OTP sent to email!',
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

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   patch:
 *     summary: Reset password using token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: New password
 *               confirmPassword:
 *                 type: string
 *                 description: Confirm new password
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    // Validate required fields
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    // 1) Get user based on the OTP
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email,
      passwordResetToken: hashedOtp,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If OTP has not expired, and there is user, set the new password
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'OTP is invalid or has expired',
      });
    }

    // Validate password
    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required and must be a string',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    // 3) Update changedPasswordAt property for the user
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 4) Return success
    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.',
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * @swagger
 * /auth/verify-reset-token:
 *   post:
 *     summary: Verify password reset token is valid
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               token:
 *                 type: string
 *                 description: Password reset token
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Token is valid
 *       400:
 *         description: Token is invalid or expired
 */
export const verifyResetToken = async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({
        success: false,
        message: 'Email and token are required',
      });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching email and valid token
    const user = await User.findOne({
      email,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token is invalid or has expired',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * @swagger
 * /auth/update-password:
 *   patch:
 *     summary: Update user password (requires authentication)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: New password
 *               confirmPassword:
 *                 type: string
 *                 description: Confirm new password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 */
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
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      sortedBy = 'desc',
      search,
      role,
      is_active,
    } = req.query;

    const query = {};

    // Handle Role Filter
    if (role) {
      if (role === 'admin') {
        // Show all users who are NOT 'client' and NOT 'super_admin' (assuming these are the staff/admins)
        // Or if you want to include super_admin in the list but not client, adjust accordingly.
        // The user asked "not show the super admin in the list".
        query.role = { $nin: ['client', 'super_admin'] };
      } else {
        query.role = role;
      }
    }
    // Removed default super_admin exclusion - show all users by default

    // Handle Active/Inactive Filter
    if (is_active !== undefined) {
      if (String(is_active) === 'true') {
        query.isBanned = false;
      }
    }

    // Handle specific boolean search params often sent by frontend
    if (req.query.is_active === 'true') {
      query.isBanned = false;
    }
    if (req.query.is_active === 'false') {
      query.isBanned = true;
    }

    // Handle Search Param (format: "key:value;key2:value2")
    if (search) {
      const searchParams = search.split(';');
      for (const param of searchParams) {
        const [key, value] = param.split(':');
        if (key && value) {
          if (key === 'name') {
            query.name = { $regex: value, $options: 'i' };
          } else if (key === 'email') {
            query.email = { $regex: value, $options: 'i' };
          } else if (key === 'role') {
            if (value === 'admin') {
              // If search param specifies role:admin
              query.role = { $nin: ['client', 'super_admin'] };
            } else {
              query.role = value;
            }
          }
        }
      }
    }

    const skip = (page - 1) * limit;

    // Sorting
    const sort = {};
    const sortField = orderBy === 'created_at' ? 'createdAt' : orderBy; // Map created_at to createdAt
    const sortOrder = sortedBy === 'asc' ? 1 : -1;
    sort[sortField] = sortOrder;

    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password -refreshToken -passwordResetToken -passwordResetExpires +isActive');

    // Map users to match frontend expectations
    const mappedUsers = users.map(user => {
      const userObj = user.toObject();
      return {
        ...userObj,
        id: userObj._id.toString(), // Map _id to id
        is_active: userObj.isActive, // Map isActive to is_active
        permissions: userObj.permissions ? userObj.permissions.map(p => ({ name: p })) : [],
        profile: userObj.profile || { avatar: { thumbnail: '' } },
        count: users.length,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        users: mappedUsers,
      },
      paginatorInfo: {
        total,
        currentPage: parseInt(page),
        lastPage: Math.ceil(total / limit),
        perPage: parseInt(limit),
        count: users.length,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};
// Get user by ID (Admin)
/**
 * @swagger
 * /auth/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Map user data to match frontend expectations
    const userObj = user.toObject();
    const mappedUser = {
      ...userObj,
      id: userObj._id.toString(), // Map _id to id
      is_active: userObj.isActive, // Map isActive to is_active
      permissions: userObj.permissions ? userObj.permissions.map(p => ({ name: p })) : [],
      profile: userObj.profile || { avatar: { thumbnail: '' } },
    };

    console.log('getUser response:', mappedUser);

    res.status(200).json({
      status: 'success',
      data: {
        user: mappedUser,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Admin functions
/**
 * @swagger
 * /auth/users/{id}/approve:
 *   patch:
 *     summary: Approve a user account (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 */
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

/**
 * @swagger
 * /auth/users/{id}/ban:
 *   patch:
 *     summary: Ban or unban a user (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isBanned:
 *                 type: boolean
 *                 description: Ban status
 *               banReason:
 *                 type: string
 *                 description: Reason for banning
 *     responses:
 *       200:
 *         description: User ban status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 */
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

/**
 * @swagger
 * /auth/users/{id}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
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

// Update user (Admin)
/**
 * @swagger
 * /auth/users/{id}:
 *   put:
 *     summary: Update a user (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 */
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Update fields
    const allowedFields = [
      'name',
      'email',
      'role',
      'role',
      'permissions',
      'isApproved',
      'isBanned',
      'banReason',
      'isActive',
      'profile',
      'bio',
      'socials',
    ]; // Add other allowed fields as necessary

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        user[key] = req.body[key];
      }
    });

    await user.save();

    // Select fields after save
    const updatedUser = await User.findById(user._id).select('-password -refreshToken');

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
      // Return user directly in data for some clients? Backend standard seems to be data: { user }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Permission management functions
/**
 * @swagger
 * /auth/users/{id}/permissions:
 *   patch:
 *     summary: Update user permissions (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of permission strings
 *     responses:
 *       200:
 *         description: User permissions updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 */
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

/**
 * @swagger
 * /auth/users/{id}/permissions:
 *   get:
 *     summary: Get user permissions (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     role:
 *                       type: string
 */
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

/**
 * @swagger
 * /auth/permissions:
 *   get:
 *     summary: Get all available permissions (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All available permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Array of all available permissions
 */
export const getAllPermissions = async (req, res) => {
  try {
    const allPermissions = [
      // User management permissions
      'users:read',
      'users:create',
      'users:update',
      'users:delete',
      'users:approve',
      'users:ban',

      // Content management permissions
      'content:read',
      'content:create',
      'content:update',
      'content:delete',
      'content:publish',

      // System permissions
      'system:read',
      'system:update',
      'system:backup',
      'system:logs',

      // Profile permissions
      'profile:read',
      'profile:update',

      // Admin permissions
      'admin:dashboard',
      'admin:settings',
      'admin:analytics',
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
