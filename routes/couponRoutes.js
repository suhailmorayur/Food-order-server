const express = require('express')
const { addCoupon, updateCoupon, deleteCoupon, validateCoupon } = require('../controllers/couponController')
const adminAuth = require('../middilware/adminAuth')
const router = express.Router()

router.post('/',adminAuth,addCoupon)
router.put('/:id',adminAuth,updateCoupon)
router.delete('/:id',adminAuth,deleteCoupon)

router.post("/coupons/validate", validateCoupon);

module.exports = router       