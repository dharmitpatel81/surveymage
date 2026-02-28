const admin = require('../config/firebase');

/**
 * Middleware to verify Firebase ID token
 * Extracts token from Authorization header and verifies it
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'No token provided' 
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Block anonymous users
    if (decodedToken.firebase?.sign_in_provider === 'anonymous') {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Anonymous users cannot save surveys. Please sign in.' 
      });
    }
    
    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };

    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Token expired' 
      });
    }
    
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Invalid token' 
    });
  }
};

module.exports = { verifyFirebaseToken };