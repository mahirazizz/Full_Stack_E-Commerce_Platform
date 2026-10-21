import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      default: "percentage",
    },
    discountValue: {
      type: Number,
      required: true,
      min: 1,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: 0, // 0 indicates no upper limit cap
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageLimit: {
      type: Number,
      default: 500,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export const Coupon = mongoose.model("Coupon", CouponSchema);

