const Food = require("../models/foodModel");

const calculateTotal = async (items) => {
  let total = 0;
  for (let item of items) {
    const food = await Food.findById(item.foodId);
    if (food) {
      total += food.price * item.quantity;
    }
  }
  return total;
};

module.exports = { calculateTotal };
