const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    items: [
      {
        foodId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Food",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        subtotal: {
          type: Number,
          required: true,
        }
      }
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["placed", "preparing", "on the way", "delivered", "cancelled"],
      default: "placed",
    },
    address: {
      type: String,
      required: true,
    },
    coupon: {
      type: String,
      default: null,
    },
    paymentDetails: {
      razorpayPaymentId: { type: String, default: null },
      razorpayOrderId: { type: String, default: null },
      paymentDate: { type: Date, default: null },
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["placed", "preparing", "on the way", "delivered", "cancelled"],
        },
        changedAt: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
