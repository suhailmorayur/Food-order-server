const express = require('express')
const { addCoupon, updateCoupon, deleteCoupon, validateCoupon, getAllCoupons } = require('../controllers/couponController')
const adminAuth = require('../middilware/adminAuth')
const router = express.Router()

router.post('/',adminAuth,addCoupon)
router.put('/:id',adminAuth,updateCoupon)
router.delete('/:id',adminAuth,deleteCoupon)
router.get('/',getAllCoupons)

router.post("/validate", validateCoupon);

module.exports = router       