import { body, param } from 'express-validator';

const roles = ['customer', 'provider', 'admin'];

export const checkUsernameValidation = [
  param('username')
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3 to 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only include letters, numbers, and underscore'),
];

export const sendOtpValidation = [
  body('phone').optional().trim().isString().isLength({ min: 6, max: 25 }).withMessage('Invalid phone'),
  body('userId').optional().isMongoId().withMessage('Invalid userId'),
  body('role').trim().isIn(roles).withMessage('Invalid role'),
  body().custom((value) => {
    if (!value.phone && !value.userId) {
      throw new Error('Either phone or userId is required');
    }
    return true;
  }),
];

export const registerValidation = [
  body('fullName').trim().isLength({ min: 2, max: 80 }).withMessage('Full name is required'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3 to 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only include letters, numbers, and underscore'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isString()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must include at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must include at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must include at least one number'),
  body('phone').trim().isString().isLength({ min: 6, max: 25 }).withMessage('Phone is required'),
  body('role').trim().isIn(['customer', 'provider']).withMessage('Role must be customer or provider'),
];

export const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isString().isLength({ min: 1 }).withMessage('Password is required'),
  body('role').trim().isIn(roles).withMessage('Invalid role'),
];

export const verifyOtpValidation = [
  body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('role').trim().isIn(roles).withMessage('Invalid role'),
  body('userId').optional().isMongoId().withMessage('Invalid userId'),
  body('phone').optional().trim().isString().isLength({ min: 6, max: 25 }).withMessage('Invalid phone'),
  body().custom((value) => {
    if (!value.phone && !value.userId) {
      throw new Error('Either phone or userId is required');
    }
    return true;
  }),
];

export const verifyForResetValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').trim().isString().isLength({ min: 6, max: 25 }).withMessage('Phone is required'),
  body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('role').trim().isIn(roles).withMessage('Invalid role'),
];

export const resetPasswordValidation = [
  body('resetToken').isString().isLength({ min: 20 }).withMessage('Valid reset token is required'),
  body('newPassword')
    .isString()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must include at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must include at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must include at least one number'),
];

export const logoutValidation = [
  body('mode').optional().isIn(['current', 'all', 'selected']).withMessage('Invalid logout mode'),
  body('sessionIds').optional().isArray().withMessage('sessionIds must be an array'),
  body('sessionIds.*').optional().isString().isLength({ min: 8 }).withMessage('Invalid sessionId'),
];