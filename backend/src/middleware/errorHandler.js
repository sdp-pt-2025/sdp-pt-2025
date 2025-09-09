import { validationResult } from 'express-validator';

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle validation errors from express-validator
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errorMessages,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

/**
 * Handle async errors in route handlers
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle Firebase errors
 */
export const handleFirebaseError = (error) => {
  if (error.code) {
    switch (error.code) {
      case 'auth/user-not-found':
        return new AppError('User not found', 404);
      case 'auth/invalid-email':
        return new AppError('Invalid email address', 400);
      case 'auth/weak-password':
        return new AppError('Password is too weak', 400);
      case 'auth/email-already-in-use':
        return new AppError('Email already in use', 409);
      case 'auth/invalid-credential':
        return new AppError('Invalid credentials', 401);
      case 'auth/too-many-requests':
        return new AppError('Too many requests, please try again later', 429);
      case 'firestore/permission-denied':
        return new AppError('Permission denied', 403);
      case 'firestore/not-found':
        return new AppError('Resource not found', 404);
      case 'firestore/already-exists':
        return new AppError('Resource already exists', 409);
      case 'storage/object-not-found':
        return new AppError('File not found', 404);
      case 'storage/unauthorized':
        return new AppError('Unauthorized to access file', 403);
      default:
        return new AppError('Firebase error occurred', 500);
    }
  }
  
  return new AppError('Unknown Firebase error', 500);
};

/**
 * Handle external API errors
 */
export const handleExternalAPIError = (error) => {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || 'External API error';
    
    switch (status) {
      case 400:
        return new AppError(`Bad request to external API: ${message}`, 400);
      case 401:
        return new AppError('External API authentication failed', 401);
      case 403:
        return new AppError('External API access forbidden', 403);
      case 404:
        return new AppError('External API resource not found', 404);
      case 429:
        return new AppError('External API rate limit exceeded', 429);
      case 500:
        return new AppError('External API server error', 502);
      default:
        return new AppError(`External API error: ${message}`, 502);
    }
  }
  
  if (error.code === 'ECONNABORTED') {
    return new AppError('External API request timeout', 408);
  }
  
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return new AppError('External API service unavailable', 503);
  }
  
  return new AppError('Unknown external API error', 502);
};

/**
 * Handle file upload errors
 */
export const handleFileUploadError = (error) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File too large', 413);
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Too many files', 413);
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Unexpected file field', 400);
  }
  
  if (error.message.includes('File type')) {
    return new AppError('Invalid file type', 400);
  }
  
  return new AppError('File upload error', 500);
};

/**
 * Global error handler middleware
 */
export const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400);
  }
  
  if (err.name === 'CastError') {
    const message = 'Invalid ID format';
    error = new AppError(message, 400);
  }
  
  if (err.code === 11000) {
    const message = 'Duplicate field value';
    error = new AppError(message, 400);
  }
  
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }
  
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401);
  }
  
  // Handle Firebase errors
  if (err.code && err.code.startsWith('auth/') || err.code.startsWith('firestore/') || err.code.startsWith('storage/')) {
    error = handleFirebaseError(err);
  }
  
  // Handle external API errors
  if (err.isAxiosError) {
    error = handleExternalAPIError(err);
  }
  
  // Handle file upload errors
  if (err.code && err.code.startsWith('LIMIT_')) {
    error = handleFileUploadError(err);
  }
  
  // Send error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  
  const errorResponse = {
    error: error.status || 'error',
    message,
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  };
  
  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = err;
  }
  
  // Add request ID if available
  if (req.id) {
    errorResponse.requestId = req.id;
  }
  
  res.status(statusCode).json(errorResponse);
};

/**
 * Handle 404 errors
 */
export const handleNotFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Request logging middleware
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Generate request ID
  req.id = Math.random().toString(36).substr(2, 9);
  
  // Log request
  console.log(`[${req.id}] ${req.method} ${req.url} - ${req.ip} - ${req.get('User-Agent')}`);
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    console.log(`[${req.id}] ${res.statusCode} - ${duration}ms`);
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

/**
 * Rate limiting error handler
 */
export const handleRateLimitError = (req, res) => {
  res.status(429).json({
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: req.rateLimit?.resetTime || 900, // 15 minutes default
    timestamp: new Date().toISOString()
  });
};

/**
 * CORS error handler
 */
export const handleCORSError = (req, res) => {
  res.status(403).json({
    error: 'CORS Error',
    message: 'Cross-origin request blocked',
    origin: req.get('Origin'),
    timestamp: new Date().toISOString()
  });
};

/**
 * Security headers middleware
 */
export const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Strict transport security (HTTPS only)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content security policy
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

export default {
  AppError,
  handleValidationErrors,
  asyncHandler,
  handleFirebaseError,
  handleExternalAPIError,
  handleFileUploadError,
  globalErrorHandler,
  handleNotFound,
  requestLogger,
  handleRateLimitError,
  handleCORSError,
  securityHeaders
};
