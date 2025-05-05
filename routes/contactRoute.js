const express = require('express')
const {postContact, getContact} = require ('../controllers/contactController');
const adminAuth = require('../middilware/adminAuth');
const router = express.Router();



router.post('/',postContact)
router.get('/',adminAuth,getContact)



module.exports = router