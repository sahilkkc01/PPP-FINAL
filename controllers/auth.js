const { Staff, UserTokens } = require("../models/ppcModels");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "llppc";
const md5 = require("md5");

const verifyToken = async (req, res, next) => {
  const token = req.cookies.token; // Read token from HttpOnly cookie
  console.log(token);

  if (!token) {
    return res.redirect("/1");
  }
  const user = await UserTokens.findOne({ where: { jwtToken: token } });
  console.log("hi");
  console.log(user);

  if (!user) {
    return res.redirect("/1");
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user details to req.user
    res.locals.user = req.user; // Make user available in templates
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

const authenticateMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  // Allow access to the /1 and / routes
  const publicRoutes = ["/1", "/login"];

  if (publicRoutes.includes(req.path)) {
    return next(); // Skip the authentication check for these routes
  }

  if (!token) {
    return res.redirect("/1"); // Return 404 error if token is missing
  }

  next();
};

const login = async (req, res) => {
  const { userEmail, userPassword } = req.body;

  console.log(req.body);

  try {
    // Step 1: Verify user credentials
    const user = await Staff.findOne({
      where: {
        userId: userEmail,
        status: true,
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "Admin not found" });
    }

    const inputPasswordHash = md5(userPassword);
    if (user.password !== inputPasswordHash) {
      return res.status(401).json({ msg: "Invalid username or password" });
    }

    // Step 3: Check if user is already logged in elsewhere
    const existingToken = await UserTokens.findOne({
      where: { userId: user.id },
    });

    if (existingToken) {
      // await UserTokens.destroy({ where: { userId: user.id } });
      return res.status(409).json({ msg: "User already logged in elsewhere." });
    }

    // Step 4: Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        clinicId: user.clinicid,
        userId: user.userId,
        username: user.name,
        email: user.email,
        rights: user.rights,
      },
      JWT_SECRET // Secret key stored in environment variable
    );

    // Step 5: Store token in HttpOnly cookie
    res.cookie("token", token, {
      maxAge: 6 * 30 * 24 * 60 * 60 * 1000,
    });

    // Step 6: Save token in UserTokens table
    await UserTokens.create({
      userId: user.userId,
      jwtToken: token,
      expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // Set token expiration to 3 hours
    });

    req.user = {
      id: user.id,
      userId: user.userId,
      username: user.name,
      email: user.email,
    };

    // console.log(req.user);
    req.session.clinicId = user.clinicid;
    console.log(req.session.clinicId);

    // Step 7: Send final login response
    res.status(200).json({
      msg: "Login successful",
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).json({ msg: "Error during login" });
  }
};

const logout = async (req, res) => {
  const token = req.cookies.token; // Get token from HttpOnly cookie

  if (!token) {
    return res.status(400).json({ msg: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    console.log(`decoded-id ${decoded.id}`);

    // Find and delete the token from the UserTokens table
    let log = await UserTokens.destroy({
      where: { userId: decoded.userId, jwtToken: token },
    });

    console.log("logout account: ", log);

    // Clear the token cookie
    res.clearCookie("token");

    // Destroy the session (if using sessions)
    // req.session.destroy((err) => {
    //   if (err) {
    //     console.error("Failed to destroy session:", err);
    //     return res.status(500).json({ msg: "Error logging out" });
    //   }

    //   console.log(`Session cleared for user: ${decoded.username}`);
    //   return res.status(200).json({ msg: "Logout successful" });
    // });
    return res.status(200).json({ msg: "Logout successful" });
  } catch (err) {
    console.error("Error during logout:", err);
    return res.status(401).json({ msg: "Failed to authenticate token" });
  }
};

module.exports = { authenticateMiddleware, login, verifyToken, logout };
