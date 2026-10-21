import { Coupon } from "../../models/coupon.models.js";

// Helper to seed standard default coupons if collection is empty
const seedDefaultCouponsIfEmpty = async () => {
  try {
    const count = await Coupon.countDocuments();
    if (count === 0) {
      await Coupon.create([
        {
          code: "WELCOME10",
          description: "10% off for all orders above $20",
          discountType: "percentage",
          discountValue: 10,
          minOrderAmount: 20,
          maxDiscountAmount: 50,
          isActive: true,
        },
        {
          code: "SAVE20",
          description: "$20 off on orders over $100",
          discountType: "flat",
          discountValue: 20,
          minOrderAmount: 100,
          isActive: true,
        },
        {
          code: "MEGA15",
          description: "15% off on orders over $50",
          discountType: "percentage",
          discountValue: 15,
          minOrderAmount: 50,
          maxDiscountAmount: 100,
          isActive: true,
        },
      ]);
    }
  } catch (error) {
    console.error("Error seeding default coupons:", error);
  }
};

const applyCoupon = async (req, res) => {
  try {
    await seedDefaultCouponsIfEmpty();

    const { couponCode, subtotal } = req.body;

    if (!couponCode || typeof couponCode !== "string") {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required.",
      });
    }

    const orderSubtotal = Number(subtotal) || 0;
    if (orderSubtotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Order subtotal must be greater than zero to apply a coupon.",
      });
    }

    const normalizedCode = couponCode.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: normalizedCode });

    if (!coupon || !coupon.isActive) {
      return res.status(404).json({
        success: false,
        message: "Invalid or inactive promo code.",
      });
    }

    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: "This coupon code has expired.",
      });
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "This coupon has reached its maximum usage limit.",
      });
    }

    if (orderSubtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum subtotal of $${coupon.minOrderAmount}.`,
      });
    }

    let calculatedDiscount = 0;
    if (coupon.discountType === "percentage") {
      calculatedDiscount = (orderSubtotal * coupon.discountValue) / 100;
      if (
        coupon.maxDiscountAmount > 0 &&
        calculatedDiscount > coupon.maxDiscountAmount
      ) {
        calculatedDiscount = coupon.maxDiscountAmount;
      }
    } else {
      calculatedDiscount = Math.min(orderSubtotal, coupon.discountValue);
    }

    calculatedDiscount = Math.round(calculatedDiscount * 100) / 100;

    res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully!`,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: calculatedDiscount,
      },
    });
  } catch (error) {
    console.error("Apply coupon error:", error);
    res.status(500).json({
      success: false,
      message: "Error applying coupon code.",
    });
  }
};

const getPublicCoupons = async (req, res) => {
  try {
    await seedDefaultCouponsIfEmpty();

    const activeCoupons = await Coupon.find({ isActive: true }).select(
      "code description discountType discountValue minOrderAmount maxDiscountAmount",
    );

    res.status(200).json({
      success: true,
      data: activeCoupons,
    });
  } catch (error) {
    console.error("Get public coupons error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching coupons.",
    });
  }
};

export { applyCoupon, getPublicCoupons };
