const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const razorpay = require("../utils/razorpay");
const sendSMS = require("../utils/sendSMS");
const User = require("../models/userModel");

const crypto = require("crypto");

const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address, restaurantId, coupon, razorpayOrderId } = req.body;

    // Fetch cart with populated foodId
    const cart = await Cart.findOne({ userId }).populate("items.foodId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Ensure totalAmount is valid; calculate manually if not set in the cart
    let totalAmount = cart.totalAmount || 0;
    if (isNaN(totalAmount)) {
      totalAmount = cart.items.reduce((acc, item) => {
        return acc + (item.foodId.price * item.quantity);
      }, 0);
    }

    let discount = 0;

    // If a coupon is provided, calculate the discount (you can adjust this logic as needed)
    if (coupon && coupon.discountPercentage) {
      discount = (totalAmount * coupon.discountPercentage) / 100;
      totalAmount -= discount;
    }

    // Ensure totalAmount is still a valid number after discount
    if (isNaN(totalAmount)) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    // ✅ Create new order with correct items and razorpayOrderId
    const newOrder = new Order({
      userId,
      restaurantId,
      items: cart.items.map((item) => ({
        foodId: item.foodId._id,
        quantity: item.quantity,
        subtotal: item.foodId.price * item.quantity,
      })),
      totalAmount,
      address,
      coupon,
      paymentStatus: "paid", // Payment is assumed to be successful here
      razorpayOrderId, // Store Razorpay order ID for tracking
    });

    const savedOrder = await newOrder.save();

    // ✅ Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    // ✅ Fetch user info
    const user = await User.findById(userId);

    // ✅ Send SMS confirmation
    if (user?.mobile) {
      const orderItems = savedOrder.items
        .map((item) => `${item.foodId.name} x ${item.quantity}`)
        .join(", ");
      const message = `✅ Order Confirmed!\nItems: ${orderItems}\nTotal: ₹${totalAmount}\nThank you for ordering with TastyNest!`;

      const toNumber = user.mobile.startsWith("+") ? user.mobile : `+91${user.mobile}`;
      await sendSMS(toNumber, message);
    }

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







// const createRazorpayOrder = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     // Fetch cart with populated food and restaurantId
//     const cart = await Cart.findOne({ userId }).populate({
//       path: "items.foodId",
//       populate: { path: "restaurantId" },
//     });

//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ message: "Cart is empty" });
//     }

//     const restaurantId = cart.items[0]?.foodId?.restaurantId?._id;

//     if (!restaurantId) {
//       return res.status(400).json({ message: "restaurantId not found" });
//     }

//     const amount = req.body.amount * 100; // Razorpay accepts paise

//     const options = {
//       amount,
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//     };

//     const razorpayOrder = await razorpay.orders.create(options);

//     res.status(200).json({
//       success: true,
//       orderId: razorpayOrder.id,
//       amount: razorpayOrder.amount,
//       restaurantId,
//     });

//   } catch (err) {
//     console.error("Razorpay create order error:", err);
//     res.status(500).json({ message: "Failed to create Razorpay order" });
//   }
// };

const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch cart with populated foodId and nested restaurantId
    const cart = await Cart.findOne({ userId }).populate({
      path: "items.foodId",
      populate: { path: "restaurantId" },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const validItems = cart.items.filter(item => item.foodId && item.foodId.restaurantId);

    if (validItems.length === 0) {
      return res.status(400).json({ message: "Cart contains invalid items" });
    }

    const firstRestaurantId = validItems[0].foodId.restaurantId._id;

    const allSameRestaurant = validItems.every(
      item => item.foodId.restaurantId._id.toString() === firstRestaurantId.toString()
    );

    if (!allSameRestaurant) {
      return res.status(400).json({
        message: "Items from multiple restaurants cannot be ordered together",
      });
    }

    const amount = req.body.amount * 100; // in paise

    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    // Create the Razorpay order
    const razorpayOrder = await razorpay.orders.create(options);

    // Create a new order in the database
    const newOrder = new Order({
      userId,
      restaurantId: firstRestaurantId,
      items: cart.items.map(item => ({
        foodId: item.foodId,
        quantity: item.quantity,
        subtotal: item.foodId.price * item.quantity,
      })),
      totalAmount: req.body.amount,
      paymentStatus: "pending", // Initially set to pending
      razorpayOrderId: razorpayOrder.id,
      paymentDetails: {
        razorpayOrderId: razorpayOrder.id,
        paymentDate: null, // Will be updated after payment verification
      },
      address: req.body.address,
      coupon: req.body.coupon,
    });

    await newOrder.save(); // Save the order to the database

    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      restaurantId: firstRestaurantId,
    });
  } catch (err) {
    console.error("Razorpay create order error:", err);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
};








  

  // const verifyRazorpayPayment = async (req, res) => {
  //   try {
  //     const { razorpay_order_id, razorpay_payment_id, razorpay_signature,orderId } = req.body;
  
  //     const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
  //     hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  //     const generated_signature = hmac.digest("hex");
  
  //     if (generated_signature === razorpay_signature) {
  //       // ✅ Find the order using razorpayOrderId
  //       const order = await Order.findOne({ "paymentDetails.razorpayOrderId": razorpay_order_id });
  //       if (!order) return res.status(404).json({ message: "Order not found" });
  
  //       // ✅ Update payment status
  //       order.paymentStatus = "paid";
  //       order.razorpayPaymentId = razorpay_payment_id;
  //       order.razorpaySignature = razorpay_signature;
  //       await order.save();
  
  //       return res.status(200).json({ success: true, message: "Payment verified successfully" });
  //     } else {
  //       return res.status(400).json({ success: false, message: "Invalid signature" });
  //     }
  //   } catch (err) {
  //     console.error("Payment verification error:", err.message);
  //     res.status(500).json({ success: false, message: "Payment verification failed" });
  //   }
  // };
  const verifyRazorpayPayment = async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, o } = req.body;
  
      const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      const generated_signature = hmac.digest("hex");
  
      if (generated_signature === razorpay_signature) {
        // ✅ Find the order using razorpayOrderId
        const order = await Order.findOne({ "paymentDetails.razorpayOrderId": razorpay_order_id });
        if (!order) return res.status(404).json({ message: "Order not found" });
  
        // ✅ Update payment status
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