import jwt from 'jsonwebtoken';
import { env } from '../../shared/config/env';
import { User } from '../../domain/entities/User';

export interface JWTPayload {
  id: string;
  role: string;
  iat?: number;
}

export const generateToken = (user: User): string => {
  const payload: JWTPayload = {
    id: user.id,
    role: user.role,
  };

  return jwt.sign(payload as object, env.JWT_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRE as any,
  });
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

