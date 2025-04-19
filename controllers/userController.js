const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;

// SIGNUP CONTROLLER
const userSignup = async (req, res) => {
  const { name, email, password, mobile } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id , name: newUser.name,role:"user" }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true only in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "User registered and logged in successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};





const userLogin = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find user by email
      const existingUser = await User.findOne({ email });
  
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, existingUser.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }
  
      // Generate JWT token
      const token = jwt.sign({  id: existingUser._id,
        role: "user", // Add this
        name: existingUser.name,
        email: existingUser.email}, JWT_SECRET, {
        expiresIn: "7d",
      });
  
      // Set cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
  
      // Send success response
      res.status(200).json({
        message: "Login successful",
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          mobile: existingUser.mobile,
          role: existingUser.role, 
        },
      });
    } catch (err) {
      res.status(500).json({ message: "Login failed", error: err.message });
    }
  };




const userProfile = async (req,res)=>{
  try{
    const userId = req.user.id
    console.log(userId);
    const userData = await User.findOne({ _id: userId}).select("-password")
    return res.json({data: userData, message: "user profile fetched"})

  } 
  catch(error){
    return res.status(500).json({message:error.message || "internal server error"})
  }
  
}

const userLogout = (req, res) => {
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






const updateUser = async (req, res) => {
  const userId = req.user.id; // From auth middleware

  const { name, mobile, address } = req.body;

  try {
    // Build the fields to update
    const updateFields = {};
    if (name) updateFields.name = name;
    if (mobile) updateFields.mobile = mobile;
    if (address) {
      updateFields.address = {
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        postalCode: address.postalCode || "",
        country: address.country || ""
      };
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};


module.exports= {userSignup,userLogin , userProfile ,userLogout ,updateUser }