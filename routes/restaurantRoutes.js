const express = require('express')
const { addRestaurant, getAllRestaurants, updateRestaurant, getSingleRestaurant, deleteRestaurant } = require('../controllers/RestaurantController')
const adminAuth = require('../middilware/adminAuth')
const upload =require('../middilware/multer')
const router = express.Router()

router.get('/', getAllRestaurants)
router.get('/:id',getSingleRestaurant)
router.post('/addRestaurant',adminAuth,upload.single("image"), addRestaurant )
router.put('/updateRestaurant/:id',adminAuth,upload.single("image"),updateRestaurant)
router.delete('/:id',deleteRestaurant)

module.exports = router        