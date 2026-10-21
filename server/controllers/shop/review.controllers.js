import { Order } from "../../models/order.models.js";
import { Product } from "../../models/product.models.js";
import { Review } from "../../models/review.models.js";

const addProductReview = async (req, res) => {
  try {
    const { productId, userId, userName, reviewMessage, reviewValue } =
      req.body;

    const targetUserId = req.user?.id || userId;
    const targetUserName = req.user?.username || userName || "User";

    if (!productId || !targetUserId) {
      return res.status(400).json({
        success: false,
        message: "Product and user information is required.",
      });
    }

    const normalizedReviewValue = Number(reviewValue);

    if (
      !normalizedReviewValue ||
      Number.isNaN(normalizedReviewValue) ||
      normalizedReviewValue < 1 ||
      normalizedReviewValue > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Review rating must be between 1 and 5.",
      });
    }

    // Only allow verified purchasers with paid orders to leave reviews
    const userOrders = await Order.find({
      userId: targetUserId,
      paymentStatus: "paid",
    }).select("cartItems");

    const hasPurchasedProduct = userOrders.some((orderItem) =>
      (orderItem?.cartItems || []).some(
        (cartItem) => String(cartItem?.productId) === String(productId),
      ),
    );

    if (!hasPurchasedProduct) {
      return res.status(403).json({
        success: false,
        message: "You need to purchase this product to leave a review.",
      });
    }

    const checkExistingReview = await Review.findOne({
      productId,
      userId: targetUserId,
    });

    if (checkExistingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product!",
      });
    }

    const newReview = new Review({
      productId,
      userId: targetUserId,
      userName: targetUserName,
      reviewMessage: reviewMessage?.trim() || "",
      reviewValue: normalizedReviewValue,
    });

    await newReview.save();

    const reviews = await Review.find({ productId });
    const totalReviewsLength = reviews.length;
    const averageReview =
      reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
      totalReviewsLength;

    await Product.findByIdAndUpdate(productId, { averageReview });

    res.status(201).json({
      success: true,
      data: newReview,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred while adding review!",
    });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error occurred while retrieving reviews",
    });
  }
};

export { addProductReview, getProductReviews };
