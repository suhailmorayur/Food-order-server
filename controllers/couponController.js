const Coupon = require("../models/couponModel");

// POST /api/admin/coupons
const addCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, expirationDate, usageLimit } = req.body;

    // Validate required fields
    if (!code || !discountType || !discountValue || !expirationDate) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    // Check if coupon already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists." });
    }

    // Create new coupon
    const newCoupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      expirationDate,
      usageLimit: usageLimit || 1, // default to 1 use if not provided
    });

    const savedCoupon = await newCoupon.save();

    res.status(201).json({
      message: "Coupon added successfully",
      coupon: savedCoupon,
    });

  } catch (error) {
    console.error("Error adding coupon:", error.message);
    res.status(500).json({ message: "Server error while adding coupon" });
  }
};


// PUT /api/admin/coupons/:id
const updateCoupon = async (req, res) => {
    try {
      const couponId = req.params.id;
      const updates = req.body;
  
      const coupon = await Coupon.findById(couponId);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
  
      // Update only the fields provided
      Object.keys(updates).forEach((key) => {
        coupon[key] = updates[key];
      });
  
      const updatedCoupon = await coupon.save();
  
      res.status(200).json({
        message: "Coupon updated successfully",
        coupon: updatedCoupon,
      });
  
    } catch (error) {
      console.error("Error updating coupon:", error.message);
      res.status(500).json({ message: "Server error while updating coupon" });
    }
  };
  
// DELETE /api/admin/coupons/:id
const deleteCoupon = async (req, res) => {
    try {
      const couponId = req.params.id;
  
      const coupon = await Coupon.findByIdAndDelete(couponId);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
  
      res.status(200).json({ message: "Coupon deleted successfully" });
  
    } catch (error) {
      console.error("Error deleting coupon:", error.message);
      res.status(500).json({ message: "Server error while deleting coupon" });
    }
  };
  


// POST /api/coupons/validate
const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ message: "Invalid or inactive coupon" });
    }

    if (new Date(coupon.expirationDate) < new Date()) {
      return res.status(400).json({ message: "Coupon expired" });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit exceeded" });
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (orderAmount * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    const finalAmount = orderAmount - discount;

    res.status(200).json({
      message: "Coupon applied successfully",
      discount,
      finalAmount: finalAmount > 0 ? finalAmount : 0,
    });

  } catch (error) {
    console.error("Error validating coupon:", error.message);
    res.status(500).json({ message: "Server error while validating coupon" });
  }
};



module.exports={addCoupon,updateCoupon, deleteCoupon , validateCoupon}