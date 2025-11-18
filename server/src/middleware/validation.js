import { validationResult } from 'express-validator';

// Middleware to check validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }

  next();
};

// Custom validators
export const isValidPillar = (value) => {
  const validPillars = ['body', 'brain', 'business'];
  return !value || validPillars.includes(value);
};

export const isValidRole = (value) => {
  const validRoles = ['user', 'admin'];
  return validRoles.includes(value);
};

export const isValidSubscriptionStatus = (value) => {
  const validStatuses = ['free', 'upgraded', 'monthly', 'annual'];
  return validStatuses.includes(value);
};
