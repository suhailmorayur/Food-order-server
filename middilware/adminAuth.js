// middleware/adminAuth.js
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");

const adminAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id);
    console.log(admin.role);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Not an admin" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: "Authorization failed", error: error.message });
  }
};

module.exports = adminAuth;
