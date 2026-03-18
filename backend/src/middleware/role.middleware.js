import AppError from '../utils/AppError.js';

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return next(new AppError('Unauthorized', 401, true));
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Forbidden: insufficient role', 403, true));
  }
  next();
};
