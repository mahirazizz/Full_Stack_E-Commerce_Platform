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
import ShoppingOrderDetailsView from "./ShopOrderDetails";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/order-slice/index.js";
import { Badge } from "../ui/badge";

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails } = useSelector((state) => state.shopOrder);

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetails(getId));
  }

  useEffect(() => {
    dispatch(getAllOrdersByUserId(user?.id));
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  return (
    <Card className="border-slate-200/80 bg-white shadow-[0_12px_36px_rgba(15,23,42,0.06)]">
      <CardHeader className="border-b border-slate-100 bg-slate-50/60">
        <CardTitle className="text-2xl font-black tracking-tight text-slate-950">Order history</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Order Price</TableHead>
              <TableHead>
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderList && orderList.length > 0
              ? orderList.map((orderItem) => (
                  <TableRow key={orderItem?._id} className="hover:bg-slate-50/80">
                    <TableCell className="font-medium text-slate-700">{orderItem?._id}</TableCell>
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
                    <TableCell className="font-semibold text-slate-950">${orderItem?.totalAmount}</TableCell>
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
                          className="rounded-full bg-sky-600 text-white hover:bg-sky-500"
                        >
                          View Details
                        </Button>
                        <ShoppingOrderDetailsView orderDetails={orderDetails} />
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              : (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center text-slate-500">
                    No orders yet.
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

export default ShoppingOrders;
