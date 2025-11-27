import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateSignup = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name required (min 2 characters)'),
  handleValidationErrors,
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  handleValidationErrors,
];

export const validateMessage = [
  body('content').trim().notEmpty().withMessage('Message content required'),
  handleValidationErrors,
];

export const validateListing = [
  body('title').trim().isLength({ min: 5 }).withMessage('Title required (min 5 characters)'),
  body('description').trim().isLength({ min: 20 }).withMessage('Description required (min 20 characters)'),
  body('price').isInt({ min: 100 }).withMessage('Price must be at least £1 (100 pence)'),
  body('niche').trim().notEmpty().withMessage('Niche required'),
  handleValidationErrors,
];

export const validateForumPost = [
  body('title').trim().isLength({ min: 5 }).withMessage('Title required (min 5 characters)'),
  body('content').trim().isLength({ min: 10 }).withMessage('Content required (min 10 characters)'),
  body('categoryId').notEmpty().withMessage('Category required'),
  handleValidationErrors,
];

export const validateContent = [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('description').trim().notEmpty().withMessage('Description required'),
  body('contentType').isIn(['VIDEO', 'TEXT', 'AUDIO', 'TEMPLATE', 'PDF', 'WORKSHEET']).withMessage('Invalid content type'),
  body('pillar').isIn(['BODY', 'BRAIN', 'BUSINESS', 'GENERAL']).withMessage('Invalid pillar'),
  body('accessLevel').isIn(['FREE', 'UPGRADE', 'MEMBER']).withMessage('Invalid access level'),
  handleValidationErrors,
];
