import {
  capturePayPalCheckoutOrder,
  createPayPalCheckoutOrder,
  getPayPalClientId,
} from "../../utils/paypal.js";
import { Order } from "../../models/order.models.js";
import { Product } from "../../models/product.models.js";
import { Cart } from "../../models/cart.models.js";
import { Coupon } from "../../models/coupon.models.js";

const PAYMENT_CURRENCY = (process.env.PAYPAL_CURRENCY || "USD").toUpperCase();

const toFixedAmount = (value) => Number(value || 0).toFixed(2);

const parsePaypalError = (error) => {
  const response = error?.paypal || error?.response || {};
  const details = Array.isArray(response?.details) ? response.details : [];
  const firstDetail = details[0] || {};
  const network = response?.network || null;
  const isDnsLookupIssue =
    typeof error?.message === "string" &&
    (error.message.includes("getaddrinfo ENOTFOUND") ||
      network?.code === "ENOTFOUND");
  const isConnectionIssue =
    network?.code === "ECONNRESET" ||
    network?.code === "ETIMEDOUT" ||
    (typeof error?.message === "string" &&
      (error.message.toLowerCase().includes("fetch failed") ||
        error.message.toLowerCase().includes("network request failed") ||
        error.message.toLowerCase().includes("timed out")));

  return {
    message:
      (isDnsLookupIssue
        ? "Cannot reach PayPal API host. Check internet, DNS, firewall/proxy, and that PAYPAL_MODE is correct."
        : isConnectionIssue
          ? "Cannot connect to PayPal API. Check internet, firewall/proxy, TLS inspection, and outbound HTTPS access to api-m.sandbox.paypal.com."
          : null) ||
      response?.message ||
      firstDetail?.issue ||
      error?.message ||
      "Error while creating paypal payment",
    debugId: response?.debug_id || null,
    issue: firstDetail?.issue || null,
    description: firstDetail?.description || null,
    network,
  };
};

// Calculate cost breakdown with database prices, coupon discounts, shipping, and tax
const calculateOrderCostBreakdown = async ({ items, couponCode }) => {
  let subtotal = 0;
  const verifiedCartItems = [];

  for (const item of items) {
    const quantity = Math.max(1, parseInt(item?.quantity, 10) || 1);
    const product = await Product.findById(item.productId);

    if (!product) {
      throw new Error(`Product '${item.title || item.productId}' no longer exists.`);
    }

    if (product.totalStock < quantity) {
      throw new Error(
        `Insufficient stock for '${product.title}'. Only ${product.totalStock} units available.`,
      );
    }

    const price =
      Number(product.salePrice) > 0
        ? Number(product.salePrice)
        : Number(product.price);

    verifiedCartItems.push({
      productId: product._id.toString(),
      title: product.title,
      image: product.image,
      price,
      salePrice: product.salePrice ? String(product.salePrice) : "",
      quantity,
    });

    subtotal += price * quantity;
  }

  let discountAmount = 0;
  let appliedCouponCode = "";

  if (couponCode && typeof couponCode === "string") {
    const normalizedCode = couponCode.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: normalizedCode, isActive: true });
    if (coupon && subtotal >= coupon.minOrderAmount) {
      if (!coupon.expiresAt || new Date() <= new Date(coupon.expiresAt)) {
        if (coupon.usageLimit <= 0 || coupon.usedCount < coupon.usageLimit) {
          if (coupon.discountType === "percentage") {
            discountAmount = (subtotal * coupon.discountValue) / 100;
            if (
              coupon.maxDiscountAmount > 0 &&
              discountAmount > coupon.maxDiscountAmount
            ) {
              discountAmount = coupon.maxDiscountAmount;
            }
          } else {
            discountAmount = Math.min(subtotal, coupon.discountValue);
          }
          discountAmount = Math.round(discountAmount * 100) / 100;
          appliedCouponCode = coupon.code;
        }
      }
    }
  }

  // Free shipping on orders over $50, else $5
  const shippingAmount = subtotal >= 50 ? 0 : 5.0;

  // 5% standard sales tax
  const taxAmount = Math.round(subtotal * 0.05 * 100) / 100;

  const totalAmount = Math.max(
    0,
    Math.round((subtotal - discountAmount + shippingAmount + taxAmount) * 100) /
      100,
  );

  return {
    verifiedCartItems,
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount,
    couponCode: appliedCouponCode,
    shippingAmount,
    taxAmount,
    totalAmount,
  };
};

// PayPal checkout order creation
const createOrder = async (req, res) => {
  try {
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      return res.status(500).json({
        success: false,
        message:
          "PayPal configuration is missing. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in server environment.",
        currency: PAYMENT_CURRENCY,
      });
    }

    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      cartId,
      checkoutType,
      couponCode,
    } = req.body;

    const targetUserId = req.user?.id || userId;
    if (!targetUserId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required to place an order.",
      });
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty. Cannot create order.",
        currency: PAYMENT_CURRENCY,
      });
    }

    const {
      verifiedCartItems,
      subtotal,
      discountAmount,
      couponCode: appliedCode,
      shippingAmount,
      taxAmount,
      totalAmount,
    } = await calculateOrderCostBreakdown({ items: cartItems, couponCode });

    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid calculated order total.",
        currency: PAYMENT_CURRENCY,
      });
    }

    // Create PayPal order with verified total
    const paypalOrder = await createPayPalCheckoutOrder({
      currency: PAYMENT_CURRENCY,
      totalAmount,
      returnUrl: "http://localhost:5173/shop/paypal-return",
      cancelUrl: "http://localhost:5173/shop/paypal-cancel",
      items: verifiedCartItems.map((item) => ({
        name: item.title,
        sku: item.productId,
        unit_amount: {
          currency_code: PAYMENT_CURRENCY,
          value: toFixedAmount(item.price),
        },
        quantity: String(item.quantity),
      })),
    });

    const normalizedAddressInfo = addressInfo || null;

    const newlyCreatedOrder = new Order({
      userId: targetUserId,
      cartId,
      cartItems: verifiedCartItems,
      addressInfo: normalizedAddressInfo,
      address: normalizedAddressInfo,
      orderStatus: orderStatus || "pending",
      paymentMethod: "paypal",
      paymentStatus: "pending",
      subtotal,
      discountAmount,
      couponCode: appliedCode,
      shippingAmount,
      taxAmount,
      totalAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    });

    await newlyCreatedOrder.save();

    if (checkoutType === "smart-buttons") {
      return res.status(201).json({
        success: true,
        message: "Order created successfully",
        orderId: newlyCreatedOrder._id,
        paymentId: paypalOrder?.id || null,
        currency: PAYMENT_CURRENCY,
      });
    }

    const approvalURL = paypalOrder?.links?.find(
      (link) => link.rel === "approve",
    )?.href;

    if (!approvalURL) {
      return res.status(500).json({
        success: false,
        message: "PayPal approval link was not returned.",
        currency: PAYMENT_CURRENCY,
      });
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      approvalURL,
      orderId: newlyCreatedOrder._id,
      paymentId: paypalOrder?.id || null,
      currency: PAYMENT_CURRENCY,
    });
  } catch (e) {
    const paypalError = parsePaypalError(e);
    console.log("PayPal create payment error:", {
      currency: PAYMENT_CURRENCY,
      ...paypalError,
    });

    res.status(500).json({
      success: false,
      message: paypalError.message || "Some error occurred!",
      details: {
        issue: paypalError.issue,
        description: paypalError.description,
        debugId: paypalError.debugId,
        network: paypalError.network,
      },
      currency: PAYMENT_CURRENCY,
    });
  }
};

// Cash on Delivery (COD) order placement
const createCodOrder = async (req, res) => {
  try {
    const { userId, cartItems, addressInfo, cartId, couponCode } = req.body;

    const targetUserId = req.user?.id || userId;
    if (!targetUserId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required to place an order.",
      });
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    if (!addressInfo || !addressInfo.address || !addressInfo.city) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required for Cash on Delivery.",
      });
    }

    const {
      verifiedCartItems,
      subtotal,
      discountAmount,
      couponCode: appliedCode,
      shippingAmount,
      taxAmount,
      totalAmount,
    } = await calculateOrderCostBreakdown({ items: cartItems, couponCode });

    // ATOMIC stock decrement
    for (const item of verifiedCartItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, totalStock: { $gte: item.quantity } },
        { $inc: { totalStock: -item.quantity } },
      );

      if (!updated) {
        return res.status(400).json({
          success: false,
          message: `Stock for item '${item.title}' is no longer available.`,
        });
      }
    }

    // Increment coupon usage count
    if (appliedCode) {
      await Coupon.updateOne(
        { code: appliedCode },
        { $inc: { usedCount: 1 } },
      );
    }

    const newlyCreatedOrder = new Order({
      userId: targetUserId,
      cartId,
      cartItems: verifiedCartItems,
      addressInfo,
      address: addressInfo,
      orderStatus: "confirmed",
      paymentMethod: "cod",
      paymentStatus: "pending", // Cash to be collected at doorstep
      subtotal,
      discountAmount,
      couponCode: appliedCode,
      shippingAmount,
      taxAmount,
      totalAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    });

    await newlyCreatedOrder.save();

    // Clear user cart
    if (cartId) {
      await Cart.findByIdAndDelete(cartId);
    } else {
      await Cart.findOneAndDelete({ userId: targetUserId });
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully with Cash on Delivery!",
      orderId: newlyCreatedOrder._id,
      data: newlyCreatedOrder,
    });
  } catch (error) {
    console.error("Create COD order error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to place Cash on Delivery order.",
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId, paypalOrderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    if (
      req.user &&
      order.userId.toString() !== req.user.id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to capture this order.",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        message: "Order already confirmed and paid",
        data: order,
      });
    }

    const resolvedPaypalOrderId = paypalOrderId || paymentId;

    if (!resolvedPaypalOrderId) {
      return res.status(400).json({
        success: false,
        message: "PayPal order id is required to capture payment.",
      });
    }

    const captureResult = await capturePayPalCheckoutOrder(
      resolvedPaypalOrderId,
    );
    const capturedPaymentId =
      captureResult?.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
      resolvedPaypalOrderId;
    const capturedPayerId = captureResult?.payer?.payer_id || payerId || "";

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = capturedPaymentId;
    order.payerId = capturedPayerId;
    order.orderUpdateDate = new Date();

    // ATOMIC stock decrement
    for (const item of order.cartItems) {
      await Product.findOneAndUpdate(
        { _id: item.productId, totalStock: { $gte: item.quantity } },
        { $inc: { totalStock: -item.quantity } },
      );
    }

    // Increment coupon usage if used
    if (order.couponCode) {
      await Coupon.updateOne(
        { code: order.couponCode },
        { $inc: { usedCount: 1 } },
      );
    }

    // Clear cart
    if (order.cartId) {
      await Cart.findByIdAndDelete(order.cartId);
    } else {
      await Cart.findOneAndDelete({ userId: order.userId });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (e) {
    const paypalError = parsePaypalError(e);
    console.log("PayPal capture payment error:", {
      currency: PAYMENT_CURRENCY,
      ...paypalError,
    });

    res.status(500).json({
      success: false,
      message: paypalError.message || "Some error occurred!",
      details: {
        issue: paypalError.issue,
        description: paypalError.description,
        debugId: paypalError.debugId,
        network: paypalError.network,
      },
      currency: PAYMENT_CURRENCY,
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (
      req.user &&
      order.userId.toString() !== req.user.id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to cancel this order.",
      });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "This order has already been cancelled.",
      });
    }

    if (order.orderStatus === "delivered" || order.orderStatus === "inShipping") {
      return res.status(400).json({
        success: false,
        message: "Shipped or delivered orders cannot be cancelled directly.",
      });
    }

    order.orderStatus = "cancelled";
    order.orderUpdateDate = new Date();

    // Restock product inventory atomically
    for (const item of order.cartItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { totalStock: item.quantity },
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order successfully cancelled and items restocked.",
      data: order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling order.",
    });
  }
};

const getPayPalConfig = async (req, res) => {
  try {
    const clientId = getPayPalClientId();

    if (!clientId) {
      return res.status(500).json({
        success: false,
        message: "PayPal client id is missing in server environment.",
      });
    }

    res.status(200).json({
      success: true,
      clientId,
      currency: PAYMENT_CURRENCY,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Unable to load PayPal configuration.",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = req.user?.id || userId;

    if (
      req.user &&
      targetUserId.toString() !== req.user.id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to view these orders.",
      });
    }

    const orders = await Order.find({ userId: targetUserId }).sort({
      createdAt: -1,
    });

    if (!orders.length) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const normalizedOrders = orders.map((order) => {
      const plainOrder = order.toObject();

      if (!plainOrder.addressInfo && plainOrder.address) {
        plainOrder.addressInfo = plainOrder.address;
      }

      return plainOrder;
    });

    res.status(200).json({
      success: true,
      data: normalizedOrders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    if (
      req.user &&
      order.userId.toString() !== req.user.id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to view this order.",
      });
    }

    const plainOrder = order.toObject();

    if (!plainOrder.addressInfo && plainOrder.address) {
      plainOrder.addressInfo = plainOrder.address;
    }

    res.status(200).json({
      success: true,
      data: plainOrder,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

export {
  createOrder,
  createCodOrder,
  capturePayment,
  cancelOrder,
  getPayPalConfig,
  getAllOrdersByUser,
  getOrderDetails,
};
