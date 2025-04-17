const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  postalCode: { type: String },
  country: { type: String }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: {
    type: String,
    required: true,
    unique: true
  },

  mobile: { type: String, required: true },

  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },

  address: addressSchema  

}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
