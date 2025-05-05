const express = require('express')
const router = express.Router()
const userAuth = require('../middilware/userAuth')
const { userSignup, userLogin, userProfile, userLogout, updateUser, getAllUsers } = require('../controllers/userController')
const adminAuth = require('../middilware/adminAuth')


router.post('/signup', userSignup)
router.post('/login' , userLogin)
router.get('/profile',userAuth, userProfile )
router.get('/',adminAuth,getAllUsers)
router.get('/logout', userLogout)
router.put('/update-user' , userAuth, updateUser)
module.exports = router       