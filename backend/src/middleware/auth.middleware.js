import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import AppError from '../utils/AppError.js';
import logger from '../config/logger.js';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No token provided', 401, true));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.sid) return next(new AppError('Invalid or expired token', 401, true));

    const user = await User.findOne({
      _id: decoded.id,
      'sessions.sessionId': decoded.sid,
    }).select('-password');

    if (!user) return next(new AppError('User not found', 401, true));
    if (!user.isActive) return next(new AppError('Account deactivated', 403, true));

    req.user = user;
    req.sessionId = decoded.sid;
    logger.debug('auth.token.verified', {
      requestId: req.requestId,
      userId: user._id.toString(),
      role: user.role,
      sessionId: decoded.sid,
    });

    next();
  } catch (err) {
    logger.warn('auth.token.failed', {
      requestId: req.requestId,
      message: err.message,
    });
    return next(new AppError('Invalid or expired token', 401, true));
  }
};
