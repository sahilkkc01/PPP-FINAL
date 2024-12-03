const jwt = require("jsonwebtoken");

// Middleware to decode JWT and store user rights in session
const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from cookies
    const token = req.cookies.token; // Assume token is stored in cookies

    // Allow access to the /1 and / routes
    const publicRoutes = ["/1", "/login"];

    if (publicRoutes.includes(req.path)) {
      return next(); // Skip the authentication check for these routes
    }

    if (!token) {
      return res.redirect("/1"); // Return 404 error if token is missing
    }
    // Decode and verify the token
    const decodedToken = jwt.verify(token, "llppc"); // Replace with your actual secret key
    console.log('Token',decodedToken);
    console.log('User',req.user);
    console.log('Session',req.session);
    // Store rights in session (or any other info you want from the decoded token)
    req.session.rights = decodedToken.rights;
    req.session.userId = decodedToken.userId; // Optional: Store user ID if needed
    req.session.username = decodedToken.username; // Optional: Store username if needed
    req.session.clinicId = decodedToken.clinicId; // Optional: Store
    res.locals.username = decodedToken.username || "X";
    res.locals.clinicId = decodedToken.clinicId || "";
    // Log the session for debugging purposes
    console.log("Session:", req.session);

    // Set visibility flags based on rights
    res.locals.canEdit = decodedToken.rights !== "View Only"; // Example condition
    res.locals.canViewAdminSection = decodedToken.rights === "Admin"; // Example condition
    res.locals.doctor = decodedToken.rights === "Doctor"; // Example condition

    // Continue to the next middleware or route handler
    next();
  } catch (err) {
    console.error("Error in authMiddleware:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { authMiddleware };
