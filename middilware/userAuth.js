// const jwt = require("jsonwebtoken");

// const userAuth = (req, res, next) => {
//   try {
//     const { token } = req.cookies;

//     if (!token) {
//       return res.status(401).json({ message: "User not authorised", success: false });
//     }

//     const tokenVerified = jwt.verify(token, process.env.JWT_SECRET);
  
//     req.user = tokenVerified;
//     next();
//   } catch (error) {
//     return res.status(401).json({
//       message: error.message || "User authorisation failed",
//       success: false,
//     });
//   }
// };

// module.exports = userAuth;

// Updated userAuth.js (for regular users)
const jwt = require("jsonwebtoken");

const userAuth = (req, res, next) => {
  try {
    const { token } = req.cookies;
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add role check for users
    if (decoded.role !== "user") {
      return res.status(403).json({ message: "Access denied: User-only route" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Authorization failed", error: error.message });
  }
};

module.exports = userAuth;