const express = require('express')
const router = express.Router()
const userRoutes = require('./userRoutes')

// define the about route
router.use('/user', userRoutes)

module.exports = router