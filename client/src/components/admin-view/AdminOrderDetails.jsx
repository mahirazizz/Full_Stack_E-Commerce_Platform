import { useState } from "react";
import CommonForm from "../common/form.jsx";
import { DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { Printer } from "lucide-react";

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

    if (!status) {
      toast({
        title: "Please select a new order status.",
        variant: "destructive",
      });
      return;
    }

    dispatch(
      updateOrderStatus({ id: orderDetails?._id, orderStatus: status }),
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setFormData(initialFormData);
        toast({
          title: data?.payload?.message || "Order status updated successfully",
        });
      }
    });
  }

  const handlePrintInvoice = () => {
    if (!orderDetails) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print invoice.");
      return;
    }

    const itemsHtml = (orderDetails.cartItems || [])
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.title}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">$${Number(item.price).toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">$${(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
        </tr>`,
      )
      .join("");

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${orderDetails._id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; padding: 40px; margin: 0; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 900; color: #0284c7; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #e0f2fe; color: #0369a1; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th { background: #f8fafc; padding: 10px; text-align: left; font-weight: 700; border-bottom: 2px solid #cbd5e1; }
            .total-table { width: 280px; margin-left: auto; margin-top: 20px; }
            .total-table td { padding: 6px 0; }
            .total-row { font-size: 18px; font-weight: 900; color: #0284c7; border-top: 2px solid #e2e8f0; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">LIGHTBLUE MART (ADMIN COPY)</div>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Merchant Invoice Record</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 20px;">INVOICE</h2>
              <p style="margin: 4px 0; color: #64748b; font-size: 13px;">Order #${orderDetails._id}</p>
              <p style="margin: 0; color: #64748b; font-size: 13px;">Date: ${new Date(orderDetails.createdAt || orderDetails.orderDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px;">
            <div>
              <p style="font-weight: 700; margin: 0 0 6px 0; color: #64748b; font-size: 11px; text-transform: uppercase;">Customer Info:</p>
              <p style="margin: 0; font-weight: 700;">Customer ID: ${orderDetails.userId}</p>
              <p style="margin: 2px 0;">${orderDetails.addressInfo?.address || orderDetails.address?.address || ""}</p>
              <p style="margin: 2px 0;">${orderDetails.addressInfo?.city || orderDetails.address?.city || ""}, ${orderDetails.addressInfo?.pincode || orderDetails.address?.pincode || ""}</p>
              <p style="margin: 2px 0;">Phone: ${orderDetails.addressInfo?.phone || orderDetails.address?.phone || ""}</p>
            </div>
            <div style="text-align: right;">
              <p style="font-weight: 700; margin: 0 0 6px 0; color: #64748b; font-size: 11px; text-transform: uppercase;">Status:</p>
              <span class="badge">${orderDetails.orderStatus}</span>
              <p style="margin: 8px 0 0 0; font-size: 13px;">Payment: <strong>${orderDetails.paymentMethod?.toUpperCase()}</strong></p>
              <p style="margin: 2px 0 0 0; font-size: 13px;">Payment Status: <strong>${orderDetails.paymentStatus?.toUpperCase()}</strong></p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <table class="total-table">
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right;">$${Number(orderDetails.subtotal || orderDetails.totalAmount).toFixed(2)}</td>
            </tr>
            ${
              orderDetails.discountAmount > 0
                ? `<tr>
                    <td style="color: #059669;">Discount:</td>
                    <td style="text-align: right; color: #059669;">-$${Number(orderDetails.discountAmount).toFixed(2)}</td>
                  </tr>`
                : ""
            }
            <tr class="total-row">
              <td style="padding-top: 10px;">Total:</td>
              <td style="text-align: right; padding-top: 10px;">$${Number(orderDetails.totalAmount).toFixed(2)}</td>
            </tr>
          </table>

          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 24px; background: #0284c7; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
              Print Invoice
            </button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto border-white/60 bg-white/95 p-0 sm:max-w-[760px]">
      <div className="space-y-6 p-6 sm:p-8">
        <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              Admin Order View
            </p>
            <h2 className="mt-2 text-xl sm:text-2xl font-black tracking-tight break-all">
              {orderDetails?._id}
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Placed on {orderDetails?.createdAt?.split("T")[0] || orderDetails?.orderDate?.split?.("T")?.[0]}
            </p>
          </div>
          <Button
            type="button"
            onClick={handlePrintInvoice}
            className="rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-2 text-xs shrink-0"
          >
            <Printer className="h-4 w-4" />
            Print Invoice
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Order Total
            </p>
            <p className="mt-2 text-2xl font-black text-slate-950">
              ${orderDetails?.totalAmount}
            </p>
            {orderDetails?.discountAmount > 0 && (
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                Coupon: {orderDetails.couponCode} (-${orderDetails.discountAmount})
              </p>
            )}
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Payment Method
            </p>
            <p className="mt-2 text-lg font-bold text-slate-950 uppercase">
              {orderDetails?.paymentMethod === "cod" ? "Cash on Delivery" : "PayPal / Card"}
            </p>
            <p className="text-xs text-slate-500 capitalize mt-0.5">
              Status: {orderDetails?.paymentStatus}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Payment Status
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950 capitalize">
              {orderDetails?.paymentStatus}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Current Order Status
            </p>
            <Badge
              className={`mt-2 rounded-full px-3 py-1 text-white capitalize ${
                orderDetails?.orderStatus === "confirmed"
                  ? "bg-emerald-500"
                  : orderDetails?.orderStatus === "delivered"
                    ? "bg-sky-600"
                    : orderDetails?.orderStatus === "cancelled" ||
                        orderDetails?.orderStatus === "rejected"
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
              Order Items ({orderDetails?.cartItems?.length || 0})
            </p>
            <div className="space-y-3">
              {orderDetails?.cartItems && orderDetails?.cartItems.length > 0 ? (
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
                        Quantity: {item.quantity} × ${item.price}
                      </p>
                    </div>
                    <span className="font-bold text-slate-950">
                      ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
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
            Shipping Information
          </p>
          <div className="mt-3 grid gap-1 text-sm text-slate-700">
            <span className="font-semibold text-slate-950">
              Customer: {orderDetails?.addressInfo?.addressId || orderDetails?.userId}
            </span>
            <span>{orderDetails?.addressInfo?.address || orderDetails?.address?.address}</span>
            <span>
              {orderDetails?.addressInfo?.city || orderDetails?.address?.city},{" "}
              {orderDetails?.addressInfo?.pincode || orderDetails?.address?.pincode}
            </span>
            <span>Phone: {orderDetails?.addressInfo?.phone || orderDetails?.address?.phone}</span>
            {orderDetails?.addressInfo?.notes && (
              <span className="italic text-slate-500">Notes: {orderDetails?.addressInfo?.notes}</span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5">
          <CommonForm
            formControls={[
              {
                label: "Update Order Fulfillment Status",
                name: "status",
                componentType: "select",
                options: [
                  { id: "pending", label: "Pending" },
                  { id: "confirmed", label: "Confirmed" },
                  { id: "inProcess", label: "In Process (Packing)" },
                  { id: "inShipping", label: "In Shipping (Dispatched)" },
                  { id: "delivered", label: "Delivered (Complete)" },
                  { id: "cancelled", label: "Cancelled" },
                  { id: "rejected", label: "Rejected" },
                ],
              },
            ]}
            formData={formData}
            setFormData={setFormData}
            buttonText={"Update Fulfillment Status"}
            onSubmit={handleUpdateStatus}
          />
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;
