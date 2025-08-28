import admin from 'firebase-admin';

/**
 * Middleware to verify Firebase ID token
 * Expects Authorization: Bearer <token> header
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authorization header found'
      });
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }

    // Verify the token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.display_name,
      picture: decodedToken.picture
    };

    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please log in again'
      });
    }

    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        error: 'Token revoked',
        message: 'Please log in again'
      });
    }

    return res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication failed'
    });
  }
};

/**
 * Optional token verification - doesn't fail if no token provided
 * Useful for routes that can work with or without authentication
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.display_name,
        picture: decodedToken.picture
      };
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
