import {
  capturePayPalCheckoutOrder,
  createPayPalCheckoutOrder,
  getPayPalClientId,
} from "../../utils/paypal.js";
import { Order } from "../../models/order.models.js";
import { Product } from "../../models/product.models.js";
import { Cart } from "../../models/cart.models.js";

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
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
      cartId,
      checkoutType,
    } = req.body;

    const sanitizedCartItems = (cartItems || []).map((item) => {
      const price = Number(item?.price || 0);
      const quantity = Number(item?.quantity || 0);

      return {
        ...item,
        price,
        quantity,
      };
    });

    const calculatedTotalAmount = sanitizedCartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    if (!sanitizedCartItems.length || calculatedTotalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Cart items are invalid for payment.",
        currency: PAYMENT_CURRENCY,
      });
    }

    const paypalOrder = await createPayPalCheckoutOrder({
      currency: PAYMENT_CURRENCY,
      totalAmount: calculatedTotalAmount || totalAmount,
      returnUrl: "http://localhost:5173/shop/paypal-return",
      cancelUrl: "http://localhost:5173/shop/paypal-cancel",
      items: sanitizedCartItems.map((item) => ({
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
      userId,
      cartId,
      cartItems,
      addressInfo: normalizedAddressInfo,
      address: normalizedAddressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
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
      message: paypalError.message || "Some error occured!",
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

const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId, paypalOrderId } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
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

    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Not enough stock for this product ${product.title}`,
        });
      }

      product.totalStock -= item.quantity;

      await product.save();
    }

    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);

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
      message: paypalError.message || "Some error occured!",
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

    const orders = await Order.find({ userId });

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
      message: "Some error occured!",
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
      message: "Some error occured!",
    });
  }
};

export {
  createOrder,
  capturePayment,
  getPayPalConfig,
  getAllOrdersByUser,
  getOrderDetails,
};
