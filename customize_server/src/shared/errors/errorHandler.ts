import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';
import multer from 'multer';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Express body parser oversized payload
  if ((err as any)?.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Payload too large',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Multer upload limits/file errors
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Uploaded file is too large'
        : err.message || 'Upload failed';
    return res.status(413).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Multer fileFilter custom error messages ("Only image files are allowed", etc.)
  if (
    err instanceof Error &&
    /Only .* files are allowed/i.test(err.message)
  ) {
    return res.status(400).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Unexpected errors
  console.error('Unexpected error:', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

