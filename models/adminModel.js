// const mongoose = require("mongoose");

// const adminSchema = new mongoose.Schema(
//   {
//     username: {
//       type: String,
//       required: [true, "Admin username is required"],
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       unique: true,
//       lowercase: true,
//     },
//     password: {
//       type: String,
//       required: [true, "Password is required"],
//       minlength: 6,
//     },
//     role: {
//       type: String,
//       enum: ["admin"],
//       default: "admin",
//     },
//     profilePicture: {
//       type: String,
//       default: "https://example.com/default-profile-picture.png", // Replace with actual URL to the default image
//     },
//   },
//   { timestamps: true }
// );

// const Admin = mongoose.model("Admin", adminSchema);
// module.exports = Admin;
