import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../../infrastructure/auth/jwt';
import { UnauthorizedError, ForbiddenError } from '../../shared/errors/AppError';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { UserModel } from '../../infrastructure/database/models/UserModel';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export interface AuthRequest extends Request {
  user?: any; // User document with all methods
  decoded?: JWTPayload;
}

export const requireAuth = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // Get token from header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    if (!token || token === 'loggedout' || token === 'null' || token === 'undefined') {
      throw new UnauthorizedError('You are not logged in! Please log in to get access.');
    }

    // Verify token
    let decoded: JWTPayload;
    try {
      decoded = verifyToken(token);
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Invalid token. Please log in again!');
      }
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Your token has expired! Please log in again.');
      }
      throw new UnauthorizedError('Authentication failed. Please log in again.');
    }

    // Check if user still exists
    const userRepository = new UserRepository();
    const currentUser = await userRepository.findById(decoded.id, true);

    if (!currentUser) {
      throw new UnauthorizedError('The user belonging to this token no longer exists.');
    }

    const userDoc = await UserModel.findById(decoded.id).select(
      '+isActive +isApproved +isBanned +banReason'
    );

    if (!userDoc) {
      throw new UnauthorizedError('The user belonging to this token no longer exists.');
    }

    // Check if user changed password after token was issued
    if (userDoc.changedPasswordAfter(decoded.iat || 0)) {
      throw new UnauthorizedError('User recently changed password! Please log in again.');
    }

    // Check if account is active
    if (!userDoc.isActive) {
      throw new UnauthorizedError('This account has been deactivated.');
    }

    // Check if account is approved
    if (!userDoc.isApproved) {
      throw new ForbiddenError('Your account is pending approval.');
    }

    // Check if account is banned
    if (userDoc.isBanned) {
      throw new ForbiddenError(userDoc.banReason || 'Your account has been banned.');
    }

    // Attach user to request
    req.user = userDoc;
    req.decoded = decoded;
    res.locals.user = userDoc;

    next();
  }
);

