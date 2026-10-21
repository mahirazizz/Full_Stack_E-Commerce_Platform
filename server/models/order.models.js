import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: String,
    cartId: String,
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
    addressInfo: {
      addressId: String,
      address: String,
      city: String,
      pincode: String,
      phone: String,
      notes: String,
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "inProcess",
        "inShipping",
        "delivered",
        "rejected",
        "cancelled",
      ],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      default: "paypal", // "paypal" or "cod"
    },
    paymentStatus: {
      type: String,
      default: "pending", // "pending" or "paid"
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    shippingAmount: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: "",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    orderUpdateDate: {
      type: Date,
      default: Date.now,
    },
    paymentId: {
      type: String,
      default: "",
    },
    payerId: {
      type: String,
      default: "",
    },
    carrierName: {
      type: String,
      default: "",
    },
    trackingNumber: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export const Order = mongoose.model("Order", OrderSchema);
