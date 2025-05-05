


const Coupon = require("../models/couponModel");

// POST /api/admin/coupons - Add new coupon
const addCoupon = async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      discountType,
      discountValue,
      expirationDate,
      usageLimit,
      minOrderAmount
    } = req.body;

    if (!code || !title || !discountType || !discountValue || !expirationDate) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists." });
    }

    const newCoupon = new Coupon({
      code: code.toUpperCase(),
      title,
      description,
      discountType,
      discountValue,
      expirationDate,
      usageLimit: usageLimit || 1,
      minOrderAmount: minOrderAmount || 0
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

// GET /api/admin/coupons - Get all coupons
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    console.error("Error fetching coupons:", error.message);
    res.status(500).json({ message: "Server error while fetching coupons" });
  }
};

// PUT /api/admin/coupons/:id - Update coupon
const updateCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;
    const updates = req.body;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

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

// DELETE /api/admin/coupons/:id - Delete coupon
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

// POST /api/coupons/validate - Validate and apply coupon
const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount, userId } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ message: "Invalid or inactive coupon" });
    }

    if (new Date(coupon.expirationDate) < new Date()) {
      return res.status(400).json({ message: "Coupon expired" });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ message: `Minimum order amount is ₹${coupon.minOrderAmount}` });
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

    const finalAmount = Math.max(orderAmount - discount, 0);

    // Optionally track usage here or in order placement
    // coupon.usedCount += 1;
    // coupon.usedBy.push(userId);
    // await coupon.save();

    res.status(200).json({
      message: "Coupon applied successfully",
      discount,
      finalAmount,
    });

  } catch (error) {
    console.error("Error validating coupon:", error.message);
    res.status(500).json({ message: "Server error while validating coupon" });
  }
};

module.exports = {
  addCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon
};
