const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const razorpay = require("../utils/razorpay");
const sendSMS = require("../utils/sendSMS");
const User = require("../models/userModel");

const crypto = require("crypto");




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
        name:item.foodId.name,
        image:item.foodId.image
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









  


  const verifyRazorpayPayment = async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
      const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      const generated_signature = hmac.digest("hex");
  
      if (generated_signature === razorpay_signature) {
        // ✅ Find the order using razorpayOrderId
        const order = await Order.findOne({ "paymentDetails.razorpayOrderId": razorpay_order_id }).populate("userId");
        if (!order) return res.status(404).json({ message: "Order not found" });
  
        // ✅ Update payment status
        order.paymentStatus = "paid";
        order.paymentDetails.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        await order.save();
        console.log("Order updated:", order);
  
        // ✅ Clear user's cart
        const cart = await Cart.findOne({ userId: order.userId });
        if (cart) {
          cart.items = [];
          cart.totalAmount = 0;
          await cart.save();
          console.log("Cart cleared");
        }
  
        // ✅ Send SMS confirmation
        const user = order.userId;
        if (user?.mobile) {
          const orderItems = order.items
            .map((item) => `${item.name} x ${item.quantity}`)
            .join(", ");
          const message = `✅ Payment Successful!\nItems: ${orderItems}\nTotal: ₹${order.totalAmount}\nThank you for ordering with TastyNest!`;
  
          const toNumber = user.mobile.startsWith("+") ? user.mobile : `+91${user.mobile}`;
          await sendSMS(toNumber, message);
          console.log("SMS sent");
        }
  
        return res.status(200).json({ success: true, message: "Payment verified, cart cleared, and SMS sent" });
      } else {
        return res.status(400).json({ success: false, message: "Invalid signature" });
      }
    } catch (err) {
      console.error("Payment verification error:", err.message);
      res.status(500).json({ success: false, message: "Payment verification failed" });
    }
  };
  

const userOrders = async (req,res) =>{
  const userId = req.user.id;

  try {
    const orders = await Order.find({ userId });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}

const cancellOrder = async (req,res)=>{
  const { orderId } = req.params;
  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered') {
    return res.status(400).json({ message: 'Cannot cancel shipped or delivered orders' });
  }

  order.orderStatus = 'Canceled';
  await order.save();
  res.status(200).json({ message: 'Order canceled successfully' });
}


module.exports={createRazorpayOrder, verifyRazorpayPayment ,  userOrders ,cancellOrder}