const express = require('express')
const router = express.Router()
const userRoutes = require('./userRoutes')
const adminRoutes = require('./adminRoutes')
const restaurantRoutes = require('./restaurantRoutes')
const foodRoutes = require('../routes/foodRoutes')
const couponRoutes = require('../routes/couponRoutes')
const cartRoutes = require('../routes/cartRoutes')
const orderRoutes = require('../routes/orderRoutes')
const contactRoutes = require('../routes/contactRoute')

// define the about route
router.use('/user', userRoutes)
router.use('/admin' , adminRoutes)
router.use('/restaurants',restaurantRoutes)
router.use('/fooditems',foodRoutes)
router.use('/coupons',couponRoutes)
router.use('/cart',cartRoutes)
router.use('/orders',orderRoutes)
router.use('/contact',contactRoutes)

module.exports = router