import { useDispatch, useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { cancelUserOrder } from "@/store/shop/order-slice";
import { useToast } from "@/hooks/useToast";
import { Ban, Download, Printer } from "lucide-react";
import { useState } from "react";

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [isCancelling, setIsCancelling] = useState(false);

  const canCancel =
    orderDetails?.orderStatus === "pending" ||
    orderDetails?.orderStatus === "confirmed";

  const handleCancelOrder = async () => {
    if (!orderDetails?._id) return;
    if (!window.confirm("Are you sure you want to cancel this order? Items will be restocked.")) {
      return;
    }

    setIsCancelling(true);
    try {
      const action = await dispatch(cancelUserOrder(orderDetails._id));
      if (action?.payload?.success) {
        toast({
          title: "Order cancelled successfully.",
          description: "Items have been returned to inventory.",
        });
      } else {
        toast({
          title: action?.payload?.message || "Failed to cancel order.",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error cancelling order.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePrintInvoice = () => {
    if (!orderDetails) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download or print the invoice.");
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
            .logo { font-size: 24px; font-weight: 900; color: #0284c7; letter-spacing: -0.5px; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #e0f2fe; color: #0369a1; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th { background: #f8fafc; padding: 10px; text-align: left; font-weight: 700; border-bottom: 2px solid #cbd5e1; }
            .total-table { width: 280px; margin-left: auto; margin-top: 20px; }
            .total-table td { padding: 6px 0; }
            .total-row { font-size: 18px; font-weight: 900; color: #0284c7; border-top: 2px solid #e2e8f0; }
            .footer { margin-top: 50px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">LIGHTBLUE MART</div>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Shop Smarter, Live Better</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 20px;">INVOICE</h2>
              <p style="margin: 4px 0; color: #64748b; font-size: 13px;">Order #${orderDetails._id}</p>
              <p style="margin: 0; color: #64748b; font-size: 13px;">Date: ${new Date(orderDetails.createdAt || orderDetails.orderDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px;">
            <div>
              <p style="font-weight: 700; margin: 0 0 6px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Billed & Shipped To:</p>
              <p style="margin: 0; font-weight: 700;">${user?.username || "Customer"}</p>
              <p style="margin: 2px 0;">${orderDetails.addressInfo?.address || orderDetails.address?.address || ""}</p>
              <p style="margin: 2px 0;">${orderDetails.addressInfo?.city || orderDetails.address?.city || ""}, ${orderDetails.addressInfo?.pincode || orderDetails.address?.pincode || ""}</p>
              <p style="margin: 2px 0;">Phone: ${orderDetails.addressInfo?.phone || orderDetails.address?.phone || ""}</p>
            </div>
            <div style="text-align: right;">
              <p style="font-weight: 700; margin: 0 0 6px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Order Status:</p>
              <span class="badge">${orderDetails.orderStatus}</span>
              <p style="margin: 8px 0 0 0; font-size: 13px;">Payment Method: <strong>${orderDetails.paymentMethod?.toUpperCase()}</strong></p>
              <p style="margin: 2px 0 0 0; font-size: 13px;">Payment Status: <strong>${orderDetails.paymentStatus?.toUpperCase()}</strong></p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
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
                    <td style="color: #059669;">Discount (${orderDetails.couponCode}):</td>
                    <td style="text-align: right; color: #059669;">-$${Number(orderDetails.discountAmount).toFixed(2)}</td>
                  </tr>`
                : ""
            }
            ${
              orderDetails.shippingAmount > 0
                ? `<tr>
                    <td>Shipping:</td>
                    <td style="text-align: right;">$${Number(orderDetails.shippingAmount).toFixed(2)}</td>
                  </tr>`
                : `<tr>
                    <td>Shipping:</td>
                    <td style="text-align: right; color: #059669;">FREE</td>
                  </tr>`
            }
            ${
              orderDetails.taxAmount > 0
                ? `<tr>
                    <td>Tax (5%):</td>
                    <td style="text-align: right;">$${Number(orderDetails.taxAmount).toFixed(2)}</td>
                  </tr>`
                : ""
            }
            <tr class="total-row">
              <td style="padding-top: 10px;">Total Paid:</td>
              <td style="text-align: right; padding-top: 10px;">$${Number(orderDetails.totalAmount).toFixed(2)}</td>
            </tr>
          </table>

          <div class="footer">
            <p>Thank you for shopping with LightBlue Mart!</p>
            <p style="font-size: 11px; margin-top: 4px;">This is a computer-generated invoice and requires no physical signature.</p>
          </div>

          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 24px; background: #0284c7; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
              Print / Save as PDF
            </button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[1.75rem] border-slate-200/80 bg-white p-0 sm:max-w-[640px]">
      <div className="space-y-6 p-6 sm:p-8">
        <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              Order Details
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
            Invoice PDF
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Total Amount
            </p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              ${orderDetails?.totalAmount}
            </p>
            {orderDetails?.discountAmount > 0 && (
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                Saved ${orderDetails.discountAmount} with {orderDetails.couponCode}
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Payment Method
            </p>
            <p className="mt-1 font-bold text-slate-950 uppercase">
              {orderDetails?.paymentMethod === "cod"
                ? "Cash on Delivery"
                : "PayPal / Online"}
            </p>
            <p className="text-xs text-slate-500 mt-1 capitalize">
              Status: {orderDetails?.paymentStatus}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Order Status
              </p>
              <div className="mt-1">
                <Badge
                  className={`rounded-full px-3 py-1 text-white capitalize ${
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

            {canCancel && (
              <Button
                type="button"
                variant="outline"
                disabled={isCancelling}
                onClick={handleCancelOrder}
                className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold flex items-center gap-1.5"
              >
                <Ban className="h-4 w-4" />
                {isCancelling ? "Cancelling..." : "Cancel Order"}
              </Button>
            )}
          </div>
        </div>

        <Separator className="bg-slate-100" />

        <div className="space-y-4">
          <div className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
            Order Items
          </div>
          <div className="space-y-2.5">
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
                      <p className="text-xs text-slate-500">
                        Qty: {item.quantity} × ${item.price}
                      </p>
                    </div>
                    <span className="font-bold text-slate-950">
                      ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                    </span>
                  </div>
                ))
              : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Delivery Address
          </p>
          <div className="mt-3 grid gap-1 text-sm text-slate-700">
            <span className="font-bold text-slate-950">
              {user?.username || "Customer"}
            </span>
            <span>{orderDetails?.addressInfo?.address || orderDetails?.address?.address}</span>
            <span>
              {orderDetails?.addressInfo?.city || orderDetails?.address?.city},{" "}
              {orderDetails?.addressInfo?.pincode || orderDetails?.address?.pincode}
            </span>
            <span>Phone: {orderDetails?.addressInfo?.phone || orderDetails?.address?.phone}</span>
            {orderDetails?.addressInfo?.notes && (
              <span className="text-xs text-slate-400 italic">
                Notes: {orderDetails?.addressInfo?.notes}
              </span>
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
