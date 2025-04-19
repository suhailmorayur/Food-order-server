// // middleware/adminAuth.js
// const jwt = require("jsonwebtoken");
// const Admin = require("../models/adminModel");

// const adminAuth = async (req, res, next) => {
//   try {
//     const { token } = req.cookies;

//     if (!token) {
//       return res.status(401).json({ message: "Unauthorized: No token provided" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const admin = await Admin.findById(decoded.id);
//     console.log(admin.role);
//     if (!admin || admin.role !== "admin") {
//       return res.status(403).json({ message: "Access denied: Not an admin" });
//     }

//     req.admin = admin;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Authorization failed", error: error.message });
//   }
// };

// module.exports = adminAuth;

// Updated adminAuth.js (for admins)

const jwt = require("jsonwebtoken");

const adminAuth = (req, res, next) => {
  try {
    const { token } = req.cookies;
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get role directly from JWT (no DB query needed)
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admin-only route" });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Authorization failed", error: error.message });
  }
};

module.exports = adminAuth;