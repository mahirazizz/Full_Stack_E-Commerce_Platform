import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    image: String,
    images: {
      type: [String],
      default: [],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    category: {
      type: String,
      index: true,
    },
    brand: {
      type: String,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    averageReview: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

ProductSchema.index({ category: 1, brand: 1, price: 1 });
ProductSchema.index({ title: "text", description: "text" });

export const Product = mongoose.model("Product", ProductSchema);
