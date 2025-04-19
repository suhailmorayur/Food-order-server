const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const InviteCode = require('../models/inviteCode');
const crypto = require('crypto'); // Add at top

const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;


// const adminSignup = async (req, res) => {
//   const { name, email, password, mobile } = req.body;

//   try {
//     const existingAdmin = await Admin.findOne({ email });
//     if (existingAdmin) {
//       return res.status(400).json({ message: "Admin already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     const newAdmin = new Admin({
//       name,
//       email,
//       mobile,
//       password: hashedPassword,
//     });

//     await newAdmin.save();

//     // Generate JWT token
//     const token = jwt.sign({ id: newAdmin._id , name: newAdmin.name,role:"admin" }, JWT_SECRET, {
//       expiresIn: "7d",
//     });

//     // Set cookie
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production", // true only in production
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     });

//     res.status(201).json({
//       message: "Admin registered and logged in successfully",
//       admin: {
//         id: newAdmin._id,
//         name: newAdmin.name,
//         email: newAdmin.email,
//         mobile: newAdmin.mobile,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Signup failed", error: err.message });
//   }
// };

const adminSignup = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({ 
        success: false,
        message: "Admin already exists" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const newAdmin = await Admin.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      role: 'admin'
    });

    // Mark invite code as used
    await InviteCode.findByIdAndUpdate(req.inviteCode._id, {
      used: true,
      usedBy: newAdmin._id
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newAdmin._id,
        role: 'admin',
        email: newAdmin.email
      }, 
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email
      }
    });

  } catch (error) {
    console.error("Signup Error:", error); // 🔍 ADD THIS LINE TO DEBUG
    res.status(500).json({ 
      success: false,
      message: "Admin registration failed",
      error: error.message 
    });
  }
};





const adminLogin = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find admin by email
      const existingAdmin = await Admin.findOne({ email });
  
      if (!existingAdmin) {
        return res.status(404).json({ message: "Admin not found" });
      }
  
      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, existingAdmin.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
        
      }
  
      // Generate JWT token
      const token = jwt.sign({    id: existingAdmin._id,
        role: "admin", // Add this
        name: existingAdmin.name,
        email: existingAdmin.email }, JWT_SECRET, {
        expiresIn: "7d",
      });
  
      // Set cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
  
      // Send success response
      res.status(200).json({
        message: "Login successful",
        admin: {
          id: existingAdmin._id,
          name: existingAdmin.name,
          email: existingAdmin.email,
          mobile: existingAdmin.mobile,
          role: existingAdmin.role, 
        },
      });
    } catch (err) {
      res.status(500).json({ message: "Login failed", error: err.message });
    }
  };



  const adminProfile = async (req,res)=>{
    try{
      const adminId = req.admin.id
      console.log(adminId);
      const adminData = await Admin.findOne({ _id: adminId}).select("-password")
      return res.json({data: adminData, message: "admin profile fetched"})
  
    } 
    catch(error){
      return res.status(500).json({message:error.message || "internal server error"})
    }
    
  }
  


  const adminLogout = (req, res) => {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
  
      return res.status(200).json({
        message: "Logout successful",
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Logout failed",
        success: false,
        error: error.message,
      });
    }
  };



  const updateAdmin = async (req, res) => {
    const adminId = req.admin._id; 
    const updateFields = req.body;
  
    try {
      const updatedAdmin = await Admin.findByIdAndUpdate(
        adminId,
        { $set: updateFields },
        { new: true }
      );
  
      if (!updatedAdmin) {
        return res.status(404).json({ message: "Admin not found" });
      }
  
      res.status(200).json({
        success: true,
        message: "Admin profile updated successfully",
        admin: updatedAdmin,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to update admin",
        error: error.message,
      });
    }
  };
  
  const generateInviteCode = async (req, res) => {
    try {
      const { expiresInHours = 24 } = req.body;
      
      // Generate random 8-character code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      
      const newInviteCode = await InviteCode.create({
        code,
        createdBy: req.admin.id,
        expiresAt: new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
      });
  
      res.status(201).json({
        success: true,
        code: newInviteCode.code,
        expiresAt: newInviteCode.expiresAt
      });
  
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Failed to generate invite code",
        error: error.message 
      });
    }
  };


module.exports={
    adminSignup , adminLogin ,adminProfile , adminLogout ,updateAdmin ,generateInviteCode
}
