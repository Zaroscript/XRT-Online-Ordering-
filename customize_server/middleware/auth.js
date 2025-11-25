import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '../models/User.js';

// Protect routes
const protect = async (req, res, next) => {
  try {
    let token;
    
    // 1) Get token and check if it exists
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in! Please log in to get access.',
      });
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id).select('+isActive +isApproved +isBanned +banReason');
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'error',
        message: 'User recently changed password! Please log in again.',
      });
    }

    // 5) Check if account is active
    if (!currentUser.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'This account has been deactivated.',
      });
    }

    // 6) Check if account is approved
    if (!currentUser.isApproved) {
      return res.status(403).json({
        status: 'error',
        message: 'Your account is pending approval.',
      });
    }

    // 7) Check if account is banned
    if (currentUser.isBanned) {
      return res.status(403).json({
        status: 'error',
        message: currentUser.banReason || 'Your account has been banned.',
      });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token. Please log in again!',
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Your token has expired! Please log in again.',
      });
    }
    if (err.name === 'ValidationError') {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication failed. Please log in again.',
      });
    }
    
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed. Please log in again.',
    });
  }
};

// Restrict to certain roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};

// Only for rendered pages, no errors!
const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) Verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.REFRESH_TOKEN_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// Check if user is authenticated (for API)
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({
    status: 'error',
    message: 'You are not authenticated',
  });
};

// Check if user is not authenticated (for login/register pages)
const isNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.status(400).json({
      status: 'error',
      message: 'You are already logged in',
    });
  }
  next();
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    return next();
  }
  res.status(403).json({
    status: 'error',
    message: 'Admin access required',
  });
};

export {
  protect,
  restrictTo,
  isLoggedIn,
  isAuthenticated,
  isNotAuthenticated,
  isAdmin,
};
