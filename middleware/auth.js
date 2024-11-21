const jwt = require('jsonwebtoken');

// Middleware to decode JWT and store user rights in session
const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from cookies
    const token = req.cookies.token;  // Assume token is stored in cookies

    if (!token) {
        return next();
        }

    // Decode and verify the token
    const decodedToken = jwt.verify(token, 'llppc'); // Replace with your actual secret key
    console.log(decodedToken)
    // Store rights in session (or any other info you want from the decoded token)
    req.session.rights = decodedToken.rights;
    req.session.userId = decodedToken.userId;  // Optional: Store user ID if needed
    req.session.username = decodedToken.username;  // Optional: Store username if needed
    
    // Log the session for debugging purposes
    console.log('Session:', req.session);

    // Continue to the next middleware or route handler
    next();
  } catch (err) {
    console.error('Error in authMiddleware:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = {authMiddleware};
