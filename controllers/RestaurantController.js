

const Restaurant = require("../models/restaurantModel");
const cloudinary = require("../utils/cloudinary"); // Assuming Cloudinary is configured


// POST /api/admin/restaurants
const addRestaurant = async (req, res) => {
  try {
    const { name, location, description, openingHours } = req.body;
    const adminId = req.admin.id; // assuming admin is authenticated and injected by middleware

    if (!name || !location || !req.file) {
      return res.status(400).json({ message: "Name, location, and image are required." })
    }

    const imageUrl = req.file.path; // Cloudinary image URL

    const newRestaurant = new Restaurant({
      name,
      location,
      image: imageUrl,
      description,
      openingHours,
      createdBy: adminId,
    });

    const savedRestaurant = await newRestaurant.save();

    res.status(201).json({
      message: "Restaurant added successfully",
      restaurant: savedRestaurant,
    });

  } catch (error) {
    console.error("Error adding restaurant:", error.message);
    res.status(500).json({ message: "Server error while adding restaurant" });
  }
};


const getAllRestaurants = async (req, res) => {
    try {
      const restaurants = await Restaurant.find().sort({ createdAt: -1 }); // latest first
  
      res.status(200).json({
        message: "Restaurants fetched successfully",
        count: restaurants.length,
        restaurants,
      });
    } catch (error) {
      console.error("Error fetching restaurants:", error.message);
      res.status(500).json({ message: "Server error while fetching restaurants" });
    }
  };
  

// GET /api/restaurants/:id
const getSingleRestaurant = async (req, res) => {
    try {
      const restaurantId = req.params.id;
  
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
  
      res.status(200).json({
        message: "Restaurant fetched successfully",
        restaurant,
      });
  
    } catch (error) {
      console.error("Error fetching restaurant:", error.message);
      res.status(500).json({ message: "Server error while fetching restaurant" });
    }
  };


  const updateRestaurant = async (req, res) => {
    try {
      const restaurantId = req.params.id;
      const { name, location, description, openingHours } = req.body;
  
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
  
      // Update fields if provided
      if (name) restaurant.name = name;
      if (location) restaurant.location = location;
      if (description) restaurant.description = description;
      if (openingHours) restaurant.openingHours = openingHours;
  
      // If new image uploaded, update the image URL
      if (req.file) {
        restaurant.image = req.file.path; // new Cloudinary URL from multer
      }
  
      const updatedRestaurant = await restaurant.save();
  
      res.status(200).json({
        message: "Restaurant updated successfully",
        restaurant: updatedRestaurant,
      });
  
    } catch (error) {
      console.error("Error updating restaurant:", error.message);
      res.status(500).json({ message: "Server error while updating restaurant" });
    }
  };


// DELETE /api/admin/restaurants/:id
const deleteRestaurant = async (req, res) => {
    try {
      const restaurantId = req.params.id;
  
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
  
      // 🔹 Optional: Delete image from Cloudinary
      if (restaurant.image) {
        const publicId = restaurant.image.split("/").pop().split(".")[0]; // Extract public ID from URL
        await cloudinary.uploader.destroy(publicId);
      }
  
      await restaurant.deleteOne(); // Delete restaurant from DB
  
      res.status(200).json({ message: "Restaurant deleted successfully" });
  
    } catch (error) {
      console.error("Error deleting restaurant:", error.message);
      res.status(500).json({ message: "Server error while deleting restaurant" });
    }
  };



module.exports = { addRestaurant ,getAllRestaurants , updateRestaurant, getSingleRestaurant ,deleteRestaurant};
