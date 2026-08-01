import { useState } from "react";
import CommonForm from "../common/form.jsx";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";

import { useToast } from "@/hooks/useToast.js";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice/index.js";

const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    dispatch(
      updateOrderStatus({ id: orderDetails?._id, orderStatus: status }),
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setFormData(initialFormData);
        toast({
          title: data?.payload?.message,
        });
      }
    });
  }

  return (
    <Dialog>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/60 bg-white/95 p-0 sm:max-w-[760px]">
        <div className="space-y-6 p-6 sm:p-8">
          <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              Order details
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight">
              {orderDetails?._id}
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Placed on {orderDetails?.createdAt?.split("T")[0]}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Order Price
              </p>
              <p className="mt-2 text-2xl font-black text-slate-950">
                ${orderDetails?.totalAmount}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Payment method
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {orderDetails?.paymentMethod}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Payment Status
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {orderDetails?.paymentStatus}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Order Status
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
          <Separator className="bg-slate-200" />
          <div className="grid gap-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Items
              </p>
              <div className="space-y-3">
                {orderDetails?.cartItems &&
                orderDetails?.cartItems.length > 0 ? (
                  orderDetails?.cartItems.map((item) => (
                    <div
                      key={item.productId || item.title}
                      className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-950">
                          {item.title}
                        </p>
                        <p className="text-sm text-slate-500">
                          Quantity {item.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-slate-950">
                        ${item.price}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                    No line items found.
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
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

          <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5">
            <CommonForm
              formControls={[
                {
                  label: "Order Status",
                  name: "status",
                  componentType: "select",
                  options: [
                    { id: "pending", label: "Pending" },
                    { id: "inProcess", label: "In Process" },
                    { id: "inShipping", label: "In Shipping" },
                    { id: "delivered", label: "Delivered" },
                    { id: "rejected", label: "Rejected" },
                  ],
                },
              ]}
              formData={formData}
              setFormData={setFormData}
              buttonText={"Update Order Status"}
              onSubmit={handleUpdateStatus}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AdminOrderDetailsView;
