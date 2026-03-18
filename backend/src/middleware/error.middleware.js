import logger from '../config/logger.js';
import AppError from '../utils/AppError.js';

const isDevelopment = process.env.NODE_ENV === 'development';

const normalizeError = (err) => {
  if (err instanceof AppError) return err;

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors || {}).map((e) => ({ field: e.path, message: e.message }));
    return new AppError('Validation failed', 400, true, details);
  }

  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    return new AppError(`Duplicate value for: ${fields.join(', ')}`, 409, true, err.keyValue);
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return new AppError('Invalid or expired token', 401, true);
  }

  if (err.name === 'CastError') {
    return new AppError('Invalid resource identifier', 400, true, { path: err.path, value: err.value });
  }

  return new AppError('Internal server error', 500, false);
};

export const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, true));
};

export const globalErrorHandler = (err, req, res, next) => {
  const normalized = normalizeError(err);

  logger.error('request.failed', {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    statusCode: normalized.statusCode,
    message: normalized.message,
    isOperational: normalized.isOperational,
    details: normalized.details,
    stack: err.stack,
    userId: req.user?._id?.toString() || null,
    role: req.user?.role || null,
  });

  const response = {
    success: false,
    message: normalized.message,
    requestId: req.requestId,
  };

  if (normalized.details && normalized.isOperational) {
    response.details = normalized.details;
  }

  if (isDevelopment) {
    response.error = {
      name: err.name,
      stack: err.stack,
      isOperational: normalized.isOperational,
    };
  }

  return res.status(normalized.statusCode || 500).json(response);
};
