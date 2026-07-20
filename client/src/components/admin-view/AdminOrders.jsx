import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import AdminOrderDetailsView from "./AdminOrderDetails";
import { useDispatch, useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
} from "@/store/admin/order-slice/index.js";

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { orderList, orderDetails } = useSelector((state) => state.adminOrder);
  const dispatch = useDispatch();

  console.log("orderList", orderList?.filter((order) => order.orderStatus === "pending"));
  console.log("orderDetails", orderDetails);
  
  const confirmedCount =
    orderList?.filter((order) => order.orderStatus === "confirmed").length || 0;
  const pendingCount =
    orderList?.filter((order) => order.orderStatus === "pending").length || 0;

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetailsForAdmin(getId));
  }


  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  return (
    <Card className="border-slate-200/80 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
      <CardHeader className="space-y-4 border-b border-slate-100 bg-slate-50/60">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
              Order management
            </p>
            <CardTitle className="text-2xl font-black tracking-tight text-slate-950">
              All Orders
            </CardTitle>
            <p className="max-w-2xl text-sm text-slate-600">
              Review order activity, track fulfillment, and inspect each
              purchase in detail.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[18rem]">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Pending
              </p>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {pendingCount}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-950 p-4 text-white shadow-lg shadow-slate-950/10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Confirmed
              </p>
              <p className="mt-2 text-3xl font-black">{confirmedCount}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="py-4 pl-6">Order ID</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Order Price</TableHead>
                <TableHead>
                  <span className="sr-only">Details</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderList && orderList.length > 0 ? (
                orderList.map((orderItem) => (
                  <TableRow
                    key={orderItem?._id}
                    className="hover:bg-slate-50/80"
                  >
                    <TableCell className="pl-6 font-medium text-slate-700">
                      {orderItem?._id}
                    </TableCell>
                    <TableCell>{orderItem?.createdAt.split("T")[0]}</TableCell>
                    <TableCell>
                      <Badge
                        className={`rounded-full px-3 py-1 text-white ${
                          orderItem?.orderStatus === "confirmed"
                            ? "bg-emerald-500"
                            : orderItem?.orderStatus === "rejected"
                              ? "bg-rose-500"
                              : "bg-slate-900"
                        }`}
                      >
                        {orderItem?.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      ${orderItem?.totalAmount}
                    </TableCell>
                    <TableCell>
                      <Dialog
                        open={openDetailsDialog}
                        onOpenChange={() => {
                          setOpenDetailsDialog(false);
                          dispatch(resetOrderDetails());
                        }}
                      >
                        <Button
                          onClick={() =>
                            handleFetchOrderDetails(orderItem?._id)
                          }
                          className="rounded-full bg-slate-950 px-4 text-white hover:bg-slate-800"
                        >
                          View Details
                        </Button>
                        <AdminOrderDetailsView orderDetails={orderDetails} />
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-16 text-center text-slate-500"
                  >
                    No orders found yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default AdminOrdersView;
