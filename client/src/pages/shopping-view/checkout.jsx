import Address from "@/components/shopping-view/ShopAddress";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/ShopCartItemContent";
import { useEffect, useState } from "react";
import {
  capturePayment,
  createNewOrder,
  createCodOrder,
  getPayPalConfig,
} from "@/store/shop/order-slice";
import { useToast } from "@/hooks/useToast";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { API_BASE_URL } from "@/lib/apiBaseUrl";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Sparkles,
  Tag,
  Truck,
  X,
} from "lucide-react";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { paypalClientId } = useSelector((state) => state.shopOrder);

  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isSmartButtonBusy, setIsSmartButtonBusy] = useState(false);
  const [isCodSubmitting, setIsCodSubmitting] = useState(false);
  const [paymentMethodChoice, setPaymentMethodChoice] = useState("cod"); // "cod" or "paypal"
  const [payMode, setPayMode] = useState("card");

  // Promo code states
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  const dispatch = useDispatch();
  const { toast } = useToast();

  const cartItemList = cartItems?.items ?? [];

  // Calculate Subtotal
  const subtotal =
    cartItemList.length > 0
      ? cartItemList.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0,
        )
      : 0;

  // Shipping: Free over $50, else $5
  const shipping = subtotal > 0 && subtotal < 50 ? 5.0 : 0.0;

  // Discount
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0.0;

  // Estimated Tax: 5%
  const tax = subtotal > 0 ? Math.round(subtotal * 0.05 * 100) / 100 : 0.0;

  // Final Total
  const finalTotal = Math.max(
    0,
    Math.round((subtotal - discount + shipping + tax) * 100) / 100,
  );

  useEffect(() => {
    dispatch(getPayPalConfig());

    // Fetch public promo codes
    axios
      .get(`${API_BASE_URL}/api/shop/coupon/list`)
      .then((res) => {
        if (res.data?.success) {
          setAvailableCoupons(res.data.data || []);
        }
      })
      .catch(() => {});
  }, [dispatch]);

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      toast({
        title: "Please enter a coupon code.",
        variant: "destructive",
      });
      return;
    }

    if (subtotal <= 0) {
      toast({
        title: "Your cart is empty.",
        variant: "destructive",
      });
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/shop/coupon/apply`, {
        couponCode: code,
        subtotal,
      });

      if (response.data?.success) {
        setAppliedCoupon(response.data.data);
        setCouponInput(response.data.data.code);
        toast({
          title: response.data.message || "Coupon applied successfully!",
        });
      }
    } catch (error) {
      toast({
        title: error?.response?.data?.message || "Invalid coupon code.",
        variant: "destructive",
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    toast({
      title: "Coupon removed.",
    });
  };

  const getOrderData = (
    paymentMethod = "paypal",
    checkoutType = "smart-buttons",
  ) => ({
    userId: user?.id || user?._id,
    cartId: cartItems?._id,
    cartItems: cartItemList.map((singleCartItem) => ({
      productId: singleCartItem?.productId,
      title: singleCartItem?.title,
      image: singleCartItem?.image,
      price:
        singleCartItem?.salePrice > 0
          ? singleCartItem?.salePrice
          : singleCartItem?.price,
      quantity: singleCartItem?.quantity,
    })),
    addressInfo: {
      addressId: currentSelectedAddress?._id,
      address: currentSelectedAddress?.address,
      city: currentSelectedAddress?.city,
      pincode: currentSelectedAddress?.pincode,
      phone: currentSelectedAddress?.phone,
      notes: currentSelectedAddress?.notes,
    },
    orderStatus: "pending",
    paymentMethod,
    paymentStatus: "pending",
    couponCode: appliedCoupon?.code || "",
    subtotal,
    discountAmount: discount,
    shippingAmount: shipping,
    taxAmount: tax,
    totalAmount: finalTotal,
    orderDate: new Date(),
    orderUpdateDate: new Date(),
    paymentId: "",
    payerId: "",
    checkoutType,
  });

  const validateCheckoutData = () => {
    if (cartItemList.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return false;
    }

    if (currentSelectedAddress === null) {
      toast({
        title: "Please select a delivery address to proceed.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Cash on Delivery Handler
  const handlePlaceCodOrder = async () => {
    if (!validateCheckoutData()) return;

    setIsCodSubmitting(true);
    try {
      const orderData = getOrderData("cod", "direct");
      const action = await dispatch(createCodOrder(orderData));

      if (action?.payload?.success) {
        toast({
          title: "Order placed successfully!",
          description: "Cash will be collected upon doorstep delivery.",
        });
        window.location.href = "/shop/payment-success";
      } else {
        toast({
          title: action?.payload?.message || "Failed to place COD order.",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error placing order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCodSubmitting(false);
    }
  };

  const handleSmartPaymentError = (payload, fallbackMessage) => {
    const errorMessage = payload?.message || fallbackMessage;
    const errorIssue = payload?.details?.issue;
    const errorDescription = payload?.details?.description;
    const errorDebugId = payload?.details?.debugId;

    const detailLine = [
      errorDescription,
      errorIssue ? `Issue: ${errorIssue}` : null,
      errorDebugId ? `Debug ID: ${errorDebugId}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    toast({
      title: errorMessage,
      description: detailLine || "Please try again.",
      variant: "destructive",
    });
  };

  const createOrderForSmartButtons = async (method) => {
    if (!validateCheckoutData()) {
      throw new Error("Checkout data is invalid");
    }

    setIsSmartButtonBusy(true);
    const action = await dispatch(
      createNewOrder(getOrderData(method, "smart-buttons")),
    );
    setIsSmartButtonBusy(false);

    const payload = action?.payload;

    if (!payload?.success || !payload?.paymentId || !payload?.orderId) {
      handleSmartPaymentError(payload, "Unable to create PayPal order.");
      throw new Error(payload?.message || "Unable to create PayPal order.");
    }

    sessionStorage.setItem("currentOrderId", JSON.stringify(payload.orderId));
    return payload.paymentId;
  };

  const handleOnApprove = async (data) => {
    const orderId = JSON.parse(sessionStorage.getItem("currentOrderId"));

    if (!orderId || !data?.orderID) {
      toast({
        title: "Order capture failed",
        description: "Missing order information to capture payment.",
        variant: "destructive",
      });
      return;
    }

    const action = await dispatch(
      capturePayment({
        orderId,
        paypalOrderId: data.orderID,
      }),
    );

    if (action?.payload?.success) {
      sessionStorage.removeItem("currentOrderId");
      window.location.href = "/shop/payment-success";
      return;
    }

    handleSmartPaymentError(action?.payload, "Unable to capture payment.");
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      <div className="relative h-[240px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(2,6,23,0.75),_rgba(2,6,23,0.3),_rgba(2,6,23,0.6))]" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-8 md:px-6 lg:px-8">
            <div className="max-w-2xl text-white">
              <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-100">
                Secure checkout
              </span>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Review & Place Your Order
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-8 md:px-6 lg:grid-cols-2 lg:px-8">
        {/* Left Column: Address Selection */}
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />

        {/* Right Column: Order Summary, Coupons & Payment */}
        <div className="flex flex-col gap-6 rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.06)] sm:p-7">
          <h2 className="text-xl font-black tracking-tight text-slate-950 pb-3 border-b border-slate-100">
            Order Items ({cartItemList.length})
          </h2>

          <div className="max-h-[260px] overflow-y-auto space-y-3 pr-1">
            {cartItemList.length > 0 ? (
              cartItemList.map((item) => (
                <UserCartItemsContent key={item.productId} cartItem={item} />
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-6">
                Your cart is empty.
              </p>
            )}
          </div>

          {/* Coupon / Promo Code Section */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Tag className="h-4 w-4 text-sky-600" />
              <span>Have a Promo Code?</span>
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider">
                      {appliedCoupon.code} applied!
                    </p>
                    <p className="text-xs text-emerald-700">
                      Saved {usdFormatter.format(appliedCoupon.discountAmount)} on this order
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-100 transition"
                  title="Remove coupon"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter code (e.g. WELCOME10)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="rounded-xl bg-white border-slate-200 font-semibold uppercase tracking-wider"
                />
                <Button
                  type="button"
                  disabled={isApplyingCoupon || !couponInput.trim()}
                  onClick={() => handleApplyCoupon()}
                  className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold px-5"
                >
                  {isApplyingCoupon ? "Applying..." : "Apply"}
                </Button>
              </div>
            )}

            {/* Quick Promo Chips */}
            {!appliedCoupon && availableCoupons.length > 0 && (
              <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium">Available:</span>
                {availableCoupons.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleApplyCoupon(c.code)}
                    className="inline-flex items-center gap-1 rounded-full bg-white border border-sky-200 px-2.5 py-1 font-bold text-sky-700 hover:bg-sky-50 transition shadow-xs"
                  >
                    <Sparkles className="h-3 w-3 text-sky-500" />
                    {c.code} ({c.discountType === "percentage" ? `${c.discountValue}% off` : `$${c.discountValue} off`})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2.5 rounded-2xl bg-sky-50/70 p-4 border border-sky-100/70 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">
                {usdFormatter.format(subtotal)}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span className="flex items-center gap-1">
                  Coupon Discount ({appliedCoupon?.code})
                </span>
                <span>-{usdFormatter.format(discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1">
                <Truck className="h-4 w-4 text-slate-400" />
                Shipping
              </span>
              <span>
                {shipping === 0 ? (
                  <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50 text-xs font-bold">
                    FREE (Orders &gt; $50)
                  </Badge>
                ) : (
                  usdFormatter.format(shipping)
                )}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax (5%)</span>
              <span className="font-semibold text-slate-900">
                {usdFormatter.format(tax)}
              </span>
            </div>

            <div className="border-t border-sky-200/80 pt-2.5 flex justify-between items-baseline">
              <span className="text-base font-bold text-slate-900">Total</span>
              <span className="text-2xl font-black text-slate-950">
                {usdFormatter.format(finalTotal)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-900">
              Select Payment Method
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cash on Delivery Card */}
              <div
                onClick={() => setPaymentMethodChoice("cod")}
                className={`cursor-pointer rounded-2xl border-2 p-4 transition flex flex-col justify-between ${
                  paymentMethodChoice === "cod"
                    ? "border-sky-600 bg-sky-50/50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Banknote className="h-6 w-6 text-emerald-600" />
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethodChoice === "cod"}
                    onChange={() => setPaymentMethodChoice("cod")}
                    className="accent-sky-600 h-4 w-4"
                  />
                </div>
                <div className="mt-3">
                  <p className="font-bold text-slate-900 text-sm">
                    Cash on Delivery
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pay in cash upon physical doorstep delivery.
                  </p>
                </div>
              </div>

              {/* PayPal / Cards Card */}
              <div
                onClick={() => setPaymentMethodChoice("paypal")}
                className={`cursor-pointer rounded-2xl border-2 p-4 transition flex flex-col justify-between ${
                  paymentMethodChoice === "paypal"
                    ? "border-sky-600 bg-sky-50/50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <CreditCard className="h-6 w-6 text-sky-600" />
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethodChoice === "paypal"}
                    onChange={() => setPaymentMethodChoice("paypal")}
                    className="accent-sky-600 h-4 w-4"
                  />
                </div>
                <div className="mt-3">
                  <p className="font-bold text-slate-900 text-sm">
                    PayPal / Card
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pay online with PayPal, Debit, or Credit Card.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Area based on Payment Method */}
          {paymentMethodChoice === "cod" ? (
            <Button
              type="button"
              disabled={isCodSubmitting || cartItemList.length === 0}
              onClick={handlePlaceCodOrder}
              className="w-full h-13 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
            >
              <Banknote className="h-5 w-5" />
              {isCodSubmitting
                ? "Placing Order..."
                : `Place Order with Cash on Delivery (${usdFormatter.format(finalTotal)})`}
            </Button>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPayMode("card")}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    payMode === "card"
                      ? "border-sky-500 bg-sky-100 text-sky-900"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  Debit / Credit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPayMode("paypal")}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    payMode === "paypal"
                      ? "border-sky-500 bg-sky-100 text-sky-900"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  PayPal Account
                </button>
              </div>

              {paypalClientId ? (
                <PayPalScriptProvider
                  options={{
                    clientId: paypalClientId,
                    currency: "USD",
                    intent: "capture",
                    components: "buttons",
                    "enable-funding": "card",
                    "disable-funding": "paylater,venmo,credit",
                  }}
                >
                  <div className="space-y-3">
                    <PayPalButtons
                      fundingSource={payMode === "card" ? "card" : undefined}
                      disabled={isSmartButtonBusy}
                      style={{ layout: "vertical", shape: "pill" }}
                      forceReRender={[payMode, finalTotal]}
                      createOrder={() =>
                        createOrderForSmartButtons(
                          payMode === "card" ? "card" : "paypal",
                        )
                      }
                      onApprove={handleOnApprove}
                      onError={(error) => {
                        console.error("PayPal checkout error:", error);
                        toast({
                          title: "PayPal/Card checkout failed",
                          description:
                            payMode === "card"
                              ? "Card option may be unavailable for this sandbox account/region. Try PayPal mode."
                              : "Please try again.",
                          variant: "destructive",
                        });
                      }}
                    />
                  </div>
                </PayPalScriptProvider>
              ) : (
                <p className="text-xs text-slate-400 text-center py-2">
                  Loading payment gateway...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
