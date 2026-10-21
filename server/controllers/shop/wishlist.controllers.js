import { Wishlist } from "../../models/wishlist.models.js";
import { Product } from "../../models/product.models.js";

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to manage wishlist.",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
    }

    const itemExists = wishlist.items.some(
      (item) => item.productId.toString() === productId.toString(),
    );

    if (!itemExists) {
      wishlist.items.push({ productId });
      await wishlist.save();
    }

    await wishlist.populate({
      path: "items.productId",
      select: "image title price salePrice totalStock category brand",
    });

    const validItems = wishlist.items.filter((item) => item.productId);

    res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      data: validItems,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error adding product to wishlist",
    });
  }
};

const getWishlist = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to view wishlist.",
      });
    }

    const wishlist = await Wishlist.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice totalStock category brand",
    });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const validItems = wishlist.items.filter((item) => item.productId);

    res.status(200).json({
      success: true,
      data: validItems,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error retrieving wishlist",
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to modify wishlist.",
      });
    }

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.productId.toString() !== productId.toString(),
    );

    await wishlist.save();

    await wishlist.populate({
      path: "items.productId",
      select: "image title price salePrice totalStock category brand",
    });

    const validItems = wishlist.items.filter((item) => item.productId);

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      data: validItems,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error removing product from wishlist",
    });
  }
};

export { addToWishlist, getWishlist, removeFromWishlist };

