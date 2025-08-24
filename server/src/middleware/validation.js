import { body, query, param, validationResult } from 'express-validator';

/**
 * Middleware to check for validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

/**
 * Validation rules for partners endpoints
 */
export const validatePartnersQuery = [
  query('module')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Module must be a non-empty string'),
  query('notModule')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Not module must be a non-empty string'),
  query('modules')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Modules must be a comma-separated string'),
  query('modulesAll')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Modules all must be a comma-separated string'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

/**
 * Validation rules for creating groups
 */
export const validateCreateGroup = [
  body('name')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be under 500 characters'),
  body('module')
    .isString()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Module must be between 1 and 20 characters'),
  body('maxMembers')
    .optional()
    .isInt({ min: 2, max: 50 })
    .withMessage('Max members must be between 2 and 50'),
  body('location')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must be under 200 characters'),
  handleValidationErrors
];

/**
 * Validation rules for group messages
 */
export const validateGroupMessage = [
  body('message')
    .isString()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  handleValidationErrors
];

/**
 * Validation rules for progress entries
 */
export const validateProgressEntry = [
  body('topic')
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Topic must be between 1 and 200 characters'),
  body('hours')
    .isFloat({ min: 0.1, max: 24 })
    .withMessage('Hours must be between 0.1 and 24'),
  body('module')
    .isString()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Module must be between 1 and 20 characters'),
  body('confidence')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Confidence must be between 1 and 5'),
  body('notes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be under 1000 characters'),
  handleValidationErrors
];

/**
 * Validation rules for schedule events
 */
export const validateScheduleEvent = [
  body('title')
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('startISO')
    .isISO8601()
    .withMessage('Start time must be a valid ISO 8601 date'),
  body('endISO')
    .isISO8601()
    .withMessage('End time must be a valid ISO 8601 date'),
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be under 500 characters'),
  body('attendees')
    .optional()
    .isArray()
    .withMessage('Attendees must be an array'),
  body('attendees.*')
    .optional()
    .isEmail()
    .withMessage('Each attendee must be a valid email'),
  handleValidationErrors
];

/**
 * Validation rules for group ID parameter
 */
export const validateGroupId = [
  param('id').isString().trim().notEmpty().withMessage('Group ID is required'),
  handleValidationErrors
];

/**
 * Validation rules for user ID parameter
 */
export const validateUserId = [
  param('userId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('User ID is required'),
  handleValidationErrors
];
