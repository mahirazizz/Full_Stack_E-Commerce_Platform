import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    userId: String,
    name: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
    countryCode: String,
    phone: String,
    notes: String,
  },
  { timestamps: true },
);

export const Address = mongoose.model("Address", AddressSchema);
