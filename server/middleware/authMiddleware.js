const admin = require('../config/firebase');
const logger = require('../utils/logger');
const apiRes = require('../utils/apiResponse');

/**
 * Middleware to verify Firebase ID token
 * Extracts token from Authorization header and verifies it
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return apiRes.error(res, 'UNAUTHORIZED', 'No token provided', 401);
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken.firebase?.sign_in_provider === 'anonymous') {
      return apiRes.error(res, 'FORBIDDEN', 'Anonymous users cannot save surveys. Please sign in.', 403);
    }
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
    next();
  } catch (error) {
    logger.error('Token verification failed', { error: error.message });
    const message = error.code === 'auth/id-token-expired' ? 'Token expired' : 'Invalid token';
    return apiRes.error(res, 'UNAUTHORIZED', message, 401);
  }
};

module.exports = { verifyFirebaseToken };