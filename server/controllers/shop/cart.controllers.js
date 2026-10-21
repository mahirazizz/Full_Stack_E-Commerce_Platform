import { Cart } from "../../models/cart.models.js";
import { Product } from "../../models/product.models.js";

const isAuthorizedUser = (req, targetUserId) => {
  if (!req.user) return false;
  return req.user.id.toString() === targetUserId.toString() || req.user.role === "admin";
};

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    const targetUserId = req.user?.id || userId;

    if (!isAuthorizedUser(req, targetUserId)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to modify this cart.",
      });
    }

    if (!productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({ userId: targetUserId });
    if (!cart) {
      cart = new Cart({ userId: targetUserId, items: [] });
    }

    const findCurrentProductIndex = cart.items.findIndex(
      (item) => item.productId?.toString() === productId,
    );

    const currentQuantity =
      findCurrentProductIndex > -1
        ? cart.items[findCurrentProductIndex].quantity
        : 0;

    if (currentQuantity + quantity > product.totalStock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.totalStock} units available in stock for ${product.title}.`,
      });
    }

    if (findCurrentProductIndex === -1) {
      cart.items.push({ productId, quantity });
    } else {
      cart.items[findCurrentProductIndex].quantity += quantity;
    }

    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice totalStock",
    });

    const populateCartItems = cart.items
      .filter((item) => item.productId)
      .map((item) => ({
        productId: item.productId._id,
        image: item.productId.image,
        title: item.productId.title,
        price: item.productId.price,
        salePrice: item.productId.salePrice,
        totalStock: item.productId.totalStock,
        quantity: item.quantity,
      }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while adding to cart",
    });
  }
};

const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = req.user?.id || userId;

    if (!isAuthorizedUser(req, targetUserId)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to view this cart.",
      });
    }

    const cart = await Cart.findOne({ userId: targetUserId }).populate({
      path: "items.productId",
      select: "image title price salePrice totalStock",
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          items: [],
        },
      });
    }

    const validCartItems = cart.items.filter(
      (productItem) => productItem.productId,
    );

    if (validCartItems.length < cart.items.length) {
      cart.items = validCartItems;
      await cart.save();
    }

    const populateCartItems = validCartItems.map((item) => ({
      productId: item.productId._id,
      image: item.productId.image,
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      totalStock: item.productId.totalStock,
      quantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while fetching cart",
    });
  }
};

const updateCartItems = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    const targetUserId = req.user?.id || userId;

    if (!isAuthorizedUser(req, targetUserId)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to modify this cart.",
      });
    }

    if (!productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (quantity > product.totalStock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.totalStock} units available in stock for ${product.title}.`,
      });
    }

    const cart = await Cart.findOne({ userId: targetUserId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const findCurrentProductIndex = cart.items.findIndex(
      (item) => item.productId?.toString() === productId,
    );

    if (findCurrentProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not present",
      });
    }

    cart.items[findCurrentProductIndex].quantity = quantity;

    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice totalStock",
    });

    const populateCartItems = cart.items
      .filter((item) => item.productId)
      .map((item) => ({
        productId: item.productId._id,
        image: item.productId.image,
        title: item.productId.title,
        price: item.productId.price,
        salePrice: item.productId.salePrice,
        totalStock: item.productId.totalStock,
        quantity: item.quantity,
      }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while updating cart",
    });
  }
};

const deleteCartItems = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const targetUserId = req.user?.id || userId;

    if (!isAuthorizedUser(req, targetUserId)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to modify this cart.",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const cart = await Cart.findOne({ userId: targetUserId }).populate({
      path: "items.productId",
      select: "image title price salePrice totalStock",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    cart.items = cart.items.filter(
      (item) =>
        item.productId && item.productId._id?.toString() !== productId,
    );

    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice totalStock",
    });

    const populateCartItems = cart.items
      .filter((item) => item.productId)
      .map((item) => ({
        productId: item.productId._id,
        image: item.productId.image,
        title: item.productId.title,
        price: item.productId.price,
        salePrice: item.productId.salePrice,
        totalStock: item.productId.totalStock,
        quantity: item.quantity,
      }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while deleting cart item",
    });
  }
};

export { addToCart, fetchCartItems, updateCartItems, deleteCartItems };
