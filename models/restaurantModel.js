const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  image: {
    type: String, 
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  openingHours: {
    type: String,
    default: '9 AM - 10 PM',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin', 
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
