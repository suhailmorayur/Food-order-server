const InviteCode = require('../models/inviteCode');

const validateInvite = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    
    if (!inviteCode) {
      return res.status(400).json({ 
        success: false,
        message: "Invite code is required for admin registration" 
      });
    }

    const code = await InviteCode.findOne({ code: inviteCode });
    
    if (!code) {
      return res.status(404).json({ 
        success: false,
        message: "Invalid invite code" 
      });
    }

    if (code.used) {
      return res.status(400).json({ 
        success: false,
        message: "Invite code already used" 
      });
    }

    if (new Date() > code.expiresAt) {
      return res.status(400).json({ 
        success: false,
        message: "Invite code has expired" 
      });
    }

    req.inviteCode = code;
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Invite code validation failed" 
    });
  }
};

module.exports = validateInvite;