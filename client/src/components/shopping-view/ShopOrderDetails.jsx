import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth);

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[1.75rem] border-slate-200/80 bg-white p-0 sm:max-w-[640px]">
        <div className="space-y-6 p-6 sm:p-8">
          <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              Order details
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight">
              {orderDetails?._id}
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Placed on {orderDetails?.createdAt?.split("T")[0]}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Order price
              </p>
              <p className="mt-2 text-xl font-black text-slate-950">
                ${orderDetails?.totalAmount}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Payment method
              </p>
              <p className="mt-2 font-semibold text-slate-950">
                {orderDetails?.paymentMethod}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Payment status
              </p>
              <p className="mt-2 font-semibold text-slate-950">
                {orderDetails?.paymentStatus}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Order status
              </p>
              <Badge
                className={`mt-2 rounded-full px-3 py-1 text-white ${
                  orderDetails?.orderStatus === "confirmed"
                    ? "bg-emerald-500"
                    : orderDetails?.orderStatus === "rejected"
                      ? "bg-rose-500"
                      : "bg-slate-900"
                }`}
              >
                {orderDetails?.orderStatus}
              </Badge>
            </div>
          </div>
          <Separator className="bg-slate-100" />
          <div className="space-y-4">
            <div>
              <div className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                Order items
              </div>
              <div className="space-y-3">
                {orderDetails?.cartItems && orderDetails?.cartItems.length > 0
                  ? orderDetails?.cartItems.map((item) => (
                      <div
                        key={item.productId || item.title}
                        className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                      >
                        <div>
                          <p className="font-semibold text-slate-950">
                            {item.title}
                          </p>
                          <p className="text-sm text-slate-500">
                            Qty {item.quantity}
                          </p>
                        </div>
                        <span className="font-bold text-slate-950">
                          ${item.price}
                        </span>
                      </div>
                    ))
                  : null}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Shipping info
            </p>
            <div className="mt-3 grid gap-1 text-sm text-slate-700">
              <span className="font-semibold text-slate-950">
                {user?.username || user?.userName}
              </span>
              <span>{orderDetails?.addressInfo?.address}</span>
              <span>{orderDetails?.addressInfo?.city}</span>
              <span>{orderDetails?.addressInfo?.pincode}</span>
              <span>{orderDetails?.addressInfo?.phone}</span>
              <span>{orderDetails?.addressInfo?.notes}</span>
            </div>
          </div>
        </div>
      </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
