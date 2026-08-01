import Address from "@/components/shopping-view/ShopAddress";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/ShopCartItemContent";
import { useEffect, useState } from "react";
import {
  capturePayment,
  createNewOrder,
  getPayPalConfig,
} from "@/store/shop/order-slice";
import { useToast } from "@/hooks/useToast";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

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
  const [payMode, setPayMode] = useState("card");
  const dispatch = useDispatch();
  const { toast } = useToast();

  const cartItemList = cartItems?.items ?? [];

  const totalCartAmount =
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

  useEffect(() => {
    dispatch(getPayPalConfig());
  }, [dispatch]);

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
    totalAmount: totalCartAmount,
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
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSmartPaymentError = (payload, fallbackMessage) => {
    const errorMessage = payload?.message || fallbackMessage;
    const errorIssue = payload?.details?.issue;
    const errorDescription = payload?.details?.description;
    const errorDebugId = payload?.details?.debugId;
    const networkCode = payload?.details?.network?.code;

    const detailLine = [
      errorDescription,
      errorIssue ? `Issue: ${errorIssue}` : null,
      errorDebugId ? `Debug ID: ${errorDebugId}` : null,
      networkCode ? `Network: ${networkCode}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    toast({
      title: errorMessage,
      description: detailLine || "Please try again.",
      variant: "destructive",
    });
  };

  const createOrderForSmartButtons = async (paymentMethod) => {
    if (!validateCheckoutData()) {
      throw new Error("Checkout data is invalid");
    }

    setIsSmartButtonBusy(true);
    const action = await dispatch(
      createNewOrder(getOrderData(paymentMethod, "smart-buttons")),
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
    <div className="flex flex-col bg-slate-50">
      <div className="relative h-[280px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(2,6,23,0.7),_rgba(2,6,23,0.2),_rgba(2,6,23,0.55))]" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-8 md:px-6 lg:px-8">
            <div className="max-w-2xl text-white">
              <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-100">
                Secure checkout
              </span>
              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                Complete your order with confidence.
              </h1>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 py-5 md:px-6 lg:grid-cols-2 lg:px-8">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
        <div className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-[0_12px_36px_rgba(15,23,42,0.06)] sm:p-6">
          {cartItemList.length > 0
            ? cartItemList.map((item) => (
                <UserCartItemsContent key={item.productId} cartItem={item} />
              ))
            : null}
          <div className="mt-4 space-y-4 rounded-2xl bg-sky-50 p-4">
            <div className="flex justify-between text-slate-700">
              <span className="font-medium">Total</span>
              <span className="font-black text-slate-950">
                {usdFormatter.format(totalCartAmount)}
              </span>
            </div>
          </div>
          {paypalClientId ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Pay instantly with PayPal or Card
              </p>
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
                    forceReRender={[payMode, totalCartAmount]}
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
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
