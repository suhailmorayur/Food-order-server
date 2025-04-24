const express = require('express')
const { addToCart, removeFromCart, updateCartQuantity, getCart } = require('../controllers/cartController')
const userAuth = require('../middilware/userAuth')
const router = express.Router()

router.post('/',userAuth,addToCart)

router.delete('/remove/:foodId',userAuth,removeFromCart)
router.put("/update/:foodId", userAuth, updateCartQuantity);

router.get('/',userAuth,getCart)

module.exports = router       