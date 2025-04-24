const express = require('express')
const { adminSignup,generateInviteCode ,adminLogin, adminProfile, adminLogout, updateAdmin, getAllInviteCodes } = require('../controllers/adminController')
const userAuth = require('../middilware/userAuth')
const adminAuth = require('../middilware/adminAuth')
const validateInvite = require('../middilware/validateInvite')
const router = express.Router()


router.post('/signup',validateInvite,adminSignup)
router.post('/login' , adminLogin)
router.get('/profile',adminAuth,adminProfile)
router.put('/update-admin',adminAuth,updateAdmin)
router.get('/logout', adminAuth, adminLogout )

router.post('/invites/generate', adminAuth,generateInviteCode);
router.get('/invites/codes' ,adminAuth,getAllInviteCodes)
module.exports = router     