import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    image: String,
    images: {
      type: [String],
      default: [],
    },
    title: String,
    description: String,
    category: String,
    brand: String,
    price: Number,
    salePrice: Number,
    totalStock: Number,
  },
  { timestamps: true },
);

export const Product = mongoose.model("Product", ProductSchema);
