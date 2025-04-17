const Food = require("../models/foodModel");

// POST /api/food
const addFoodItem = async (req, res) => {
  try {
    const { name, description, price, restaurantId } = req.body;

    if (!name || !price || !restaurantId || !req.file) {
      return res.status(400).json({ message: "Name, price, restaurantId, and image are required." });
    }

    const image = req.file.path;

    const newFood = new Food({
      name,
      description,
      price,
      image,
      restaurantId,
    });

    const savedFood = await newFood.save();

    // Populate restaurant data (e.g., name, location)
    const populatedFood = await Food.findById(savedFood._id).populate("restaurantId", "name location");

    res.status(201).json({
      message: "Food item added successfully",
      food: populatedFood,
    });
  } catch (error) {
    console.error("Add food item error:", error.message);
    res.status(500).json({ message: "Server error while adding food item" });
  }
};

// GET /api/food/restaurant/:restaurantId
const getFoodItemsByRestaurant = async (req, res) => {
    try {
      const { restaurantId } = req.params;
  
      const foodItems = await Food.find({ restaurantId })
        .populate("restaurantId", "name location openingHours");
  
      res.status(200).json({
        message: "Food items fetched successfully",
        count: foodItems.length,
        foodItems,
      });
  
    } catch (error) {
      console.error("Error fetching food items:", error.message);
      res.status(500).json({ message: "Server error while fetching food items" });
    }
  };


// GET /api/food?search=&sort=
const getAllFoodItems = async (req, res) => {
    try {
      const { search, sort } = req.query;
  
      let query = { available: true };
  
      if (search) {
        query.name = { $regex: search, $options: "i" };
      }
  
      // Default sort: newest first
      let sortOption = { createdAt: -1 };
  
      if (sort === "price_asc") {
        sortOption = { price: 1 };
      } else if (sort === "price_desc") {
        sortOption = { price: -1 };
      } else if (sort === "oldest") {
        sortOption = { createdAt: 1 };
      }
  
      const foodItems = await Food.find(query)
        .populate("restaurantId", "name location")
        .sort(sortOption);
  
      res.status(200).json({
        message: "Available food items fetched successfully",
        count: foodItems.length,
        foodItems,
      });
  
    } catch (error) {
      console.error("Error fetching food items:", error.message);
      res.status(500).json({ message: "Server error while fetching food items" });
    }
  };


// GET /api/food/:id
const getFoodById = async (req, res) => {
    try {
      const foodId = req.params.id;
  
      const food = await Food.findById(foodId).populate("restaurantId", "name location");
  
      if (!food) {
        return res.status(404).json({ message: "Food item not found" });
      }
  
      res.status(200).json({
        message: "Food item fetched successfully",
        food,
      });
  
    } catch (error) {
      console.error("Error fetching food item by ID:", error.message);
      res.status(500).json({ message: "Server error while fetching food item" });
    }
  };


  // PUT /api/food/:id
// PUT /api/food/:id
const updateFoodItem = async (req, res) => {
    try {
      const foodId = req.params.id;
      const { name, description, price, available } = req.body;
  
      const food = await Food.findById(foodId);
      if (!food) {
        return res.status(404).json({ message: "Food item not found" });
      }
  
      // Update fields if provided
      if (name) food.name = name;
      if (description) food.description = description;
      if (price) food.price = price;
      if (typeof available !== "undefined") food.available = available;
  
      // If new image is uploaded
      if (req.file) {
        // Optional: delete old image from Cloudinary
        if (food.image?.public_id) {
          await cloudinary.uploader.destroy(food.image.public_id);
        }
  
        // Save new image
        food.image = {
          url: req.file.path,
          public_id: req.file.filename, // filename from multer-storage-cloudinary
        };
      }
  
      const updatedFood = await food.save();
  
      res.status(200).json({
        message: "Food item updated successfully",
        food: updatedFood,
      });
  
    } catch (error) {
      console.error("Error updating food item:", error.message);
      res.status(500).json({ message: "Server error while updating food item" });
    }
  };

// DELETE /api/food/:id
const deleteFoodItem = async (req, res) => {
    try {
      const foodId = req.params.id;
  
      const food = await Food.findById(foodId);
      if (!food) {
        return res.status(404).json({ message: "Food item not found" });
      }
  
      // 🔹 Optional: Delete image from Cloudinary
      if (food.image?.public_id) {
        await cloudinary.uploader.destroy(food.image.public_id);
      }
  
      await food.deleteOne(); // Delete food from DB
  
      res.status(200).json({ message: "Food item deleted successfully" });
  
    } catch (error) {
      console.error("Error deleting food item:", error.message);
      res.status(500).json({ message: "Server error while deleting food item" });
    }
  };


module.exports = { addFoodItem , getFoodItemsByRestaurant, getAllFoodItems, getFoodById, updateFoodItem , deleteFoodItem};
