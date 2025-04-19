const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const razorpay = require("../utils/razorpay");
const crypto = require("crypto");

const placeOrder = async (req, res) => {
    try {
      const userId = req.user.id;
      const { address, restaurantId, coupon: couponCode } = req.body;
  
      const cart = await Cart.findOne({ userId }).populate("items.foodId");
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
  
      let totalAmount = cart.totalAmount;
      let discount = 0;
  
      // 🔍 Check for valid coupon
      if (couponCode) {
        const coupon = await Coupon.findOne({
          code: couponCode.toUpperCase(),
          isActive: true,
          expirationDate: { $gt: new Date() },
          
        });
  
        if (coupon) {
          if (coupon.discountType === "flat") {
            discount = coupon.discountValue;
          } else if (coupon.discountType === "percentage") {
            discount = (totalAmount * coupon.discountValue) / 100;
          }
  
          if (discount > totalAmount) discount = totalAmount;
          totalAmount = totalAmount - discount;
  
          // Optional: Increment usage count
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
  
      const newOrder = new Order({
        userId,
        restaurantId,
        items: cart.items,
        totalAmount,
        address,
        coupon: couponCode || null,
        paymentStatus: "paid", // will change to 'paid' after payment verification
 razorpayOrderId: req.body.razorpayOrderId, // store Razorpay orderId

      });
  
      const savedOrder = await newOrder.save();
  
      // Empty cart after placing order
      cart.items = [];
      cart.totalAmount = 0;
      await cart.save();
  
      res.status(201).json({
        message: "Order placed successfully",
        discount,
        totalAmount,
        order: savedOrder,
      });
  
    } catch (error) {
      console.error("Order error:", error.message);
      res.status(500).json({ message: "Failed to place order" });
    }
  };
  


  const createRazorpayOrder = async (req, res) => {
    try {
      const { amount } = req.body;
  
      const options = {
        amount: amount * 100, // Razorpay uses paise
        currency: "INR",
        receipt: `rcptid_${Math.random().toString(36).substr(2, 9)}`,
      };
  
      const order = await razorpay.orders.create(options);
  
      res.status(201).json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      });
    } catch (err) {
      console.error("Razorpay error:", err.message);
      res.status(500).json({ success: false, message: "Failed to create Razorpay order" });
    }
  };
  

  const verifyRazorpayPayment = async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
  
      const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      const generated_signature = hmac.digest("hex");
  
      if (generated_signature === razorpay_signature) {
        // ✅ Mark order as paid
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });
  
        order.paymentStatus = "paid";
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        await order.save();
  
        return res.status(200).json({ success: true, message: "Payment verified successfully" });
      } else {
        return res.status(400).json({ success: false, message: "Invalid signature" });
      }
    } catch (err) {
      console.error("Payment verification error:", err.message);
      res.status(500).json({ success: false, message: "Payment verification failed" });
    }
  };

module.exports={placeOrder,createRazorpayOrder, verifyRazorpayPayment}