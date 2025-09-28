const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  let token = null;
  let authMethod = 'none';

  // Primary: Try to get token from httpOnly cookie (most secure)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    authMethod = 'cookie';
  }
  
  // Fallback: Try to get token from Authorization header (for incognito mode)
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7); // Remove 'Bearer ' prefix
      authMethod = 'header';
    }
  }

  // No token found in either location
  if (!token) {
    return res.status(401).json({ 
      error: 'Unauthorized: Missing token',
      authMethod: 'none'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.authMethod = authMethod; // Track which method was used for logging
    next();
  } catch (err) {
    // Log token verification failures for security monitoring
    console.warn(`Token verification failed via ${authMethod}:`, {
      error: err.message,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    return res.status(401).json({ 
      error: 'Unauthorized: Invalid token',
      authMethod: authMethod
    });
  }
};

module.exports = requireAuth;