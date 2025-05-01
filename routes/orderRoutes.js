const express = require('express')
const {  createRazorpayOrder, verifyRazorpayPayment, userOrders, cancellOrder } = require('../controllers/orderController')
const userAuth = require('../middilware/userAuth')
const router = express.Router()
// 1. Place order (unpaid initially)

// router.post('/',userAuth,placeOrder)

// 2. Create Razorpay order (call this before payment)
router.post('/create-razorpay-order',userAuth,createRazorpayOrder)

// 3. Verify payment after success
router.post('/verify-payment', userAuth,verifyRazorpayPayment);

router.get('/user-orders', userAuth,userOrders)
router.delete('/:orderId' ,userAuth ,cancellOrder)



module.exports = router       