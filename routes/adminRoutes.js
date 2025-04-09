const express = require('express')
const { adminSignup, adminLogin, adminProfile, adminLogout } = require('../controllers/adminController')
const userAuth = require('../middilware/verify')
const router = express.Router()


router.post('/signup',adminSignup)
router.post('/login' , adminLogin)
router.get('/profile',userAuth,adminProfile)
router.get('/logout', userAuth, adminLogout )


module.exports = router      