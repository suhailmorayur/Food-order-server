const express = require('express')
const router = express.Router()
// const [userSignup , userLogin ,userProfile] = require('../controllers/userController')
const userAuth = require('../middilware/verify')
const { userSignup, userLogin, userProfile, userLogout } = require('../controllers/userController')
// const userLogout = require('../controllers/userController')
// define the about route

router.post('/signup', userSignup)
router.post('/login' , userLogin)
router.get('/profile',userAuth, userProfile )
router.get('/logout', userLogout)

module.exports = router       