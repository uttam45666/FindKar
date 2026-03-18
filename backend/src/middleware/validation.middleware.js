import { param, validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const mappedErrors = errors.array().map((err) => ({
    field: err.path,
    message: err.msg,
    value: err.value,
  }));

  return next(new AppError('Validation failed', 400, true, mappedErrors));
};

export const validateMongoIdParam = (name = 'id') => [
  param(name).isMongoId().withMessage(`Invalid ${name}`),
  validateRequest,
];
