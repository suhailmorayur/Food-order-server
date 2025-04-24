const express = require('express')
const router = express.Router()
// const [userSignup , userLogin ,userProfile] = require('../controllers/userController')
const userAuth = require('../middilware/userAuth')
const { userSignup, userLogin, userProfile, userLogout, updateUser, getAllUsers } = require('../controllers/userController')
const adminAuth = require('../middilware/adminAuth')
// const userLogout = require('../controllers/userController')
// define the about route

router.post('/signup', userSignup)
router.post('/login' , userLogin)
router.get('/profile',userAuth, userProfile )
router.get('/',adminAuth,getAllUsers)
router.get('/logout', userLogout)
router.put('/update-user' , userAuth, updateUser)
module.exports = router       