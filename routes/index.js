const express = require('express')
const router = express.Router()
const userRoutes = require('./userRoutes')
const adminRoutes = require('./adminRoutes')
const restaurantRoutes = require('./restaurantRoutes')
const foodRoutes = require('../routes/foodRoutes')
// define the about route
router.use('/user', userRoutes)
router.use('/admin' , adminRoutes)
router.use('/restuarants',restaurantRoutes)
router.use('/fooditems',foodRoutes)

module.exports = router