const jwt = require("jsonwebtoken");

const userAuth = (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: "User not authorised", success: false });
    }

    const tokenVerified = jwt.verify(token, process.env.JWT_SECRET);

    req.user = tokenVerified;
    next();
  } catch (error) {
    return res.status(401).json({
      message: error.message || "User authorisation failed",
      success: false,
    });
  }
};

module.exports = userAuth;
