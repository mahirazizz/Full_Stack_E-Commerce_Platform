import { Address } from "../../models/address.models.js";

const isAuthorizedUser = (req, targetUserId) => {
  if (!req.user) return false;
  return (
    req.user.id.toString() === targetUserId.toString() ||
    req.user.role === "admin"
  );
};

const addAddress = async (req, res) => {
  try {
    const {
      userId,
      name,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
      countryCode,
      phone,
      notes,
    } = req.body;

    const targetUserId = req.user?.id || userId;

    if (!isAuthorizedUser(req, targetUserId)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to add address for this user.",
      });
    }

    if (
      !name ||
      !addressLine1 ||
      !city ||
      !state ||
      !pincode ||
      !country ||
      !countryCode ||
      !phone
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, Address, City, State, PIN, Country, Country Code, and Phone are required",
      });
    }

    const newAddress = new Address({
      userId: targetUserId,
      name,
      addressLine1,
      addressLine2: addressLine2 || "",
      city,
      state,
      pincode,
      country,
      countryCode,
      phone,
      notes: notes || "",
    });

    await newAddress.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error adding address" });
  }
};

const fetchAllAddress = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = req.user?.id || userId;

    if (!isAuthorizedUser(req, targetUserId)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to view these addresses.",
      });
    }

    const addresses = await Address.find({ userId: targetUserId });

    res.status(200).json({
      success: true,
      message: "Address fetched successfully",
      data: addresses || [],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error fetching address" });
  }
};

const editAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const targetUserId = req.user?.id || userId;

    if (!isAuthorizedUser(req, targetUserId)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to edit this address.",
      });
    }

    const formData = req.body;
    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Address ID is required",
      });
    }

    const updatedAddress = await Address.findOneAndUpdate(
      {
        _id: addressId,
        userId: targetUserId,
      },
      formData,
      { new: true },
    );

    if (!updatedAddress) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error updating address" });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const targetUserId = req.user?.id || userId;

    if (!isAuthorizedUser(req, targetUserId)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to delete this address.",
      });
    }

    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Address ID is required",
      });
    }

    const deletedAddress = await Address.findOneAndDelete({
      _id: addressId,
      userId: targetUserId,
    });

    if (!deletedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error deleting address" });
  }
};

export { addAddress, fetchAllAddress, editAddress, deleteAddress };
