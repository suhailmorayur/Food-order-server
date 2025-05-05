const express = require('express')
const {  createRazorpayOrder, verifyRazorpayPayment, userOrders, cancellOrder } = require('../controllers/orderController')
const userAuth = require('../middilware/userAuth')
const router = express.Router()

router.post('/create-razorpay-order',userAuth,createRazorpayOrder)

// 3. Verify payment after success
router.post('/verify-payment', userAuth,verifyRazorpayPayment);

router.get('/user-orders', userAuth,userOrders)
router.delete('/:orderId' ,userAuth ,cancellOrder)



module.exports = router       