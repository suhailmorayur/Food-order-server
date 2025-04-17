const express = require('express')
const { addFoodItem, getFoodItemsByRestaurant, getAllFoodItems, getFoodById, updateFoodItem, deleteFoodItem } = require('../controllers/foodController')
const adminAuth = require('../middilware/adminAuth')
const upload = require('../middilware/multer')
const router = express.Router()

router.post('/',adminAuth,upload.single("image") ,addFoodItem)
router.get('/',getAllFoodItems)
router.get('/restaurant/:restaurantId',getFoodItemsByRestaurant)
router.get('/:id',getFoodById)
router.put('/:id',adminAuth,upload.single("image"),updateFoodItem)
router.delete('/:id',adminAuth,upload.single("image"),deleteFoodItem)

module.exports = router