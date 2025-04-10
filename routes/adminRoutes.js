const express = require('express')
const { adminSignup, adminLogin, adminProfile, adminLogout, updateAdmin } = require('../controllers/adminController')
const userAuth = require('../middilware/userAuth')
const adminAuth = require('../middilware/adminAuth')
const router = express.Router()


router.post('/signup',adminSignup)
router.post('/login' , adminLogin)
router.get('/profile',adminAuth,adminProfile)
router.put('/update-admin',adminAuth,updateAdmin)
router.get('/logout', adminAuth, adminLogout )


module.exports = router     