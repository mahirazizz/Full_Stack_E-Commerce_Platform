import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: String,
    cartItems: [
      {
        productId: String,
        title: String,
        image: String,
        price: Number,
        salePrice: String,
        quantity: Number,
      },
    ],
    address: {
      addressId: String,
      address: String,
      city: String,
      pincode: String,
      phone: String,
      notes: String,
    },
    orderStatus: String,
    paymentMethod: String,
    paymentStatus: String,
    totalAmount: Number,
    orderCreatedAt: Date,
    orderUpdatedAt: Date,
    paymentId: String,
    payerId: String,
  },
  { timestamps: true },
);

export const Order = mongoose.model("Order", OrderSchema);
