const Cart = require("../models/cartModel");
const Food = require("../models/foodModel");
const { calculateTotal } = require("../utils/cartUtils");


// POST /api/cart/add
// const addToCart = async (req, res) => {
//     try {
//       const userId = req.user.id; // assuming auth middleware adds user
//       const { foodId, quantity } = req.body;
  
//       const foodItem = await Food.findById(foodId);
//       if (!foodItem) {
//         return res.status(404).json({ message: "Food item not found" });
//       }
  
//       let cart = await Cart.findOne({ userId });
  
//       if (!cart) {
//         cart = new Cart({ userId, items: [] });
//       }
  
//       const existingItem = cart.items.find(item => item.foodId.toString() === foodId);
  
//       if (existingItem) {
//         existingItem.quantity += quantity;
//       } else {
//         cart.items.push({ foodId, quantity });
//       }
  
//       // Calculate total
//       cart.totalAmount = await calculateTotal(cart.items);
  
//       const updatedCart = await cart.save();
  
//       res.status(200).json({ message: "Item added to cart", cart: updatedCart });
  
//     } catch (error) {
//       console.error("Error adding to cart:", error.message);
//       res.status(500).json({ message: "Server error while adding to cart" });
//     }
//   };

const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { foodId, quantity } = req.body;

    // Check if food item exists
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // New cart
      cart = new Cart({
        userId,
        items: [{ foodId, quantity }],
        totalAmount: food.price * quantity,
      });
    } else {
      // Existing cart
      const existingItem = cart.items.find(item => item.foodId?.toString() === foodId);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ foodId, quantity });
      }

      // Recalculate total
      let total = 0;
      for (const item of cart.items) {
        const itemFood = await Food.findById(item.foodId);
        total += itemFood.price * item.quantity;
      }
      cart.totalAmount = total;
    }

    await cart.save();
    res.status(200).json({ message: "Item added to cart", cart });

  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


  
// DELETE /api/cart/remove/:foodId
const removeFromCart = async (req, res) => {
    try {
      const userId = req.user.id;
      const { foodId } = req.params;
  
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
  
      cart.items = cart.items.filter(item => item.foodId.toString() !== foodId);
  
      cart.totalAmount = await calculateTotal(cart.items);
  
      await cart.save();
  
      res.status(200).json({ message: "Item removed", cart });
  
    } catch (error) {
      console.error("Error removing from cart:", error.message);
      res.status(500).json({ message: "Server error while removing from cart" });
    }
  };
  
  // PUT /api/cart/update
const updateCartQuantity = async (req, res) => {
    try {
      const userId = req.user.id;
      const { foodId, quantity } = req.body;
  
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
  
      const item = cart.items.find(item => item.foodId.toString() === foodId);
      if (!item) {
        return res.status(404).json({ message: "Item not found in cart" });
      }
  
      item.quantity = quantity;
  
      cart.totalAmount = await calculateTotal(cart.items);
  
      await cart.save();
  
      res.status(200).json({ message: "Cart updated", cart });
  
    } catch (error) {
      console.error("Error updating cart:", error.message);
      res.status(500).json({ message: "Server error while updating cart" });
    }
  };
  

  const getCart = async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Fetch the cart and populate food and restaurant details
      const cart = await Cart.findOne({ userId })
        .populate({
          path: "items.foodId",
          populate: {
            path: "restaurantId", // Populate restaurant details within each food item
            model: "Restaurant",
          },
        });
  
      if (!cart || cart.items.length === 0) {
        return res.status(200).json({
          message: "Cart is empty",
          cart: { items: [], totalAmount: 0 },
        });
      }
  
      // Construct the response with the populated restaurant data
      const cartData = {
        items: cart.items.map(item => ({
          _id: item._id,
          food: {
            _id: item.foodId._id,
            name: item.foodId.name,
            price: item.foodId.price,
            image: item.foodId.image,
            description: item.foodId.description,
            restaurantId: item.foodId.restaurantId // Add restaurantId here
          },
          quantity: item.quantity,
          subtotal: item.quantity * item.foodId.price,
        })),
        totalAmount: cart.totalAmount,
      };
  
      res.status(200).json({
        message: "Cart fetched successfully",
        cart: cartData,
      });
  
    } catch (error) {
      console.error("Error getting cart:", error.message);
      res.status(500).json({ message: "Server error while fetching cart" });
    }
  };
  
  

  module.exports={addToCart, removeFromCart, updateCartQuantity,getCart}