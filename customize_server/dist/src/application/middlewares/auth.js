"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jwt_1 = require("../../infrastructure/auth/jwt");
const AppError_1 = require("../../shared/errors/AppError");
const UserRepository_1 = require("../../infrastructure/repositories/UserRepository");
const UserModel_1 = require("../../infrastructure/database/models/UserModel");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
exports.requireAuth = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    let token;
    // Get token from header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies && req.cookies.access_token) {
        token = req.cookies.access_token;
    }
    if (!token || token === 'loggedout' || token === 'null' || token === 'undefined') {
        throw new AppError_1.UnauthorizedError('You are not logged in! Please log in to get access.');
    }
    // Verify token
    let decoded;
    try {
        decoded = (0, jwt_1.verifyToken)(token);
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            throw new AppError_1.UnauthorizedError('Invalid token. Please log in again!');
        }
        if (error.name === 'TokenExpiredError') {
            throw new AppError_1.UnauthorizedError('Your token has expired! Please log in again.');
        }
        throw new AppError_1.UnauthorizedError('Authentication failed. Please log in again.');
    }
    // Check if user still exists
    const userRepository = new UserRepository_1.UserRepository();
    const currentUser = await userRepository.findById(decoded.id, true);
    if (!currentUser) {
        throw new AppError_1.UnauthorizedError('The user belonging to this token no longer exists.');
    }
    const userDoc = await UserModel_1.UserModel.findById(decoded.id).select('+isActive +isApproved +isBanned +banReason');
    if (!userDoc) {
        throw new AppError_1.UnauthorizedError('The user belonging to this token no longer exists.');
    }
    // Check if user changed password after token was issued
    if (userDoc.changedPasswordAfter(decoded.iat || 0)) {
        throw new AppError_1.UnauthorizedError('User recently changed password! Please log in again.');
    }
    // Check if account is active
    if (!userDoc.isActive) {
        throw new AppError_1.UnauthorizedError('This account has been deactivated.');
    }
    // Check if account is approved
    if (!userDoc.isApproved) {
        throw new AppError_1.ForbiddenError('Your account is pending approval.');
    }
    // Check if account is banned
    if (userDoc.isBanned) {
        throw new AppError_1.ForbiddenError(userDoc.banReason || 'Your account has been banned.');
    }
    // Attach user to request
    req.user = userDoc;
    req.decoded = decoded;
    res.locals.user = userDoc;
    next();
});
