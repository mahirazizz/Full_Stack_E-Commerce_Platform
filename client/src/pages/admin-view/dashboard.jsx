import ProductImageUpload from "@/components/admin-view/AdminImageUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImage,
} from "@/store/common-slice/index.js";
import {
  AlertTriangle,
  ArrowUpRight,
  DollarSign,
  Package,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "@/lib/apiBaseUrl";

function AdminDashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featureImageList } = useSelector((state) => state.commonFeature);

  useEffect(() => {
    dispatch(getFeatureImages());

    // Fetch dashboard analytics
    axios
      .get(`${API_BASE_URL}/api/admin/dashboard/analytics`)
      .then((res) => {
        if (res.data?.success) {
          setAnalytics(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load admin analytics:", err);
      })
      .finally(() => {
        setAnalyticsLoading(false);
      });
  }, [dispatch]);

  function handleUploadFeatureImage() {
    dispatch(addFeatureImage(uploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setImageFile(null);
        setUploadedImageUrl("");
      }
    });
  }

  function handleDeleteFeatureImage(id) {
    dispatch(deleteFeatureImage(id)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
      }
    });
  }

  const summary = analytics?.summary || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
  };

  const statusCounts = analytics?.statusCounts || {
    pending: 0,
    confirmed: 0,
    inProcess: 0,
    inShipping: 0,
    delivered: 0,
    cancelled: 0,
  };

  const lowStock = analytics?.lowStockProducts || [];
  const recentOrders = analytics?.recentOrders || [];

  return (
    <div className="space-y-8 pb-10">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">
          Store Overview & Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor your store revenue, inventory health, order fulfillment, and marketing banners.
        </p>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Revenue
            </span>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black tracking-tight text-slate-950">
              ${summary.totalRevenue.toLocaleString()}
            </span>
            <p className="mt-1 text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> Confirmed & paid orders
            </p>
          </div>
        </Card>

        <Card className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Orders
            </span>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-50 text-sky-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black tracking-tight text-slate-950">
              {summary.totalOrders}
            </span>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Avg order: ${summary.averageOrderValue}
            </p>
          </div>
        </Card>

        <Card className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Catalog Items
            </span>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black tracking-tight text-slate-950">
              {summary.totalProducts}
            </span>
            <p className="mt-1 text-xs text-indigo-600 font-medium">
              Active store products
            </p>
          </div>
        </Card>

        <Card className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Low Stock Warnings
            </span>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black tracking-tight text-rose-600">
              {lowStock.length}
            </span>
            <p className="mt-1 text-xs text-rose-500 font-medium">
              Items with stock &lt; 5 units
            </p>
          </div>
        </Card>
      </div>

      {/* Order Status Distribution Pills */}
      <Card className="rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
          Order Pipeline Status
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase">Confirmed</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{statusCounts.confirmed}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-center">
            <p className="text-xs font-semibold text-amber-700 uppercase">Processing</p>
            <p className="mt-1 text-2xl font-black text-amber-900">{statusCounts.inProcess}</p>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 text-center">
            <p className="text-xs font-semibold text-sky-700 uppercase">In Shipping</p>
            <p className="mt-1 text-2xl font-black text-sky-900">{statusCounts.inShipping}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-center">
            <p className="text-xs font-semibold text-emerald-700 uppercase">Delivered</p>
            <p className="mt-1 text-2xl font-black text-emerald-900">{statusCounts.delivered}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase">Pending</p>
            <p className="mt-1 text-2xl font-black text-slate-700">{statusCounts.pending}</p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 text-center">
            <p className="text-xs font-semibold text-rose-700 uppercase">Cancelled</p>
            <p className="mt-1 text-2xl font-black text-rose-900">{statusCounts.cancelled}</p>
          </div>
        </div>
      </Card>

      {/* Grid: Low Stock Alert & Recent Orders */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Low Stock Watchlist */}
        <Card className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
                <h2 className="text-lg font-bold text-slate-900">
                  Inventory Alerts (Stock &lt; 5)
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/products")}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:bg-sky-50"
              >
                Manage Catalog <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {lowStock.length > 0 ? (
                lowStock.map((prod) => (
                  <div
                    key={prod._id}
                    className="flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50/30 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.image}
                        alt={prod.title}
                        className="h-12 w-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-sm line-clamp-1">
                          {prod.title}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">
                          {prod.category} • {prod.brand}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-rose-600 hover:bg-rose-700 text-white rounded-full px-3 py-1 text-xs font-bold">
                      {prod.totalStock === 0 ? "Out of Stock" : `Only ${prod.totalStock} left`}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-sm text-slate-500">
                  🎉 All products are well stocked!
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Recent Orders Overview */}
        <Card className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-sky-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Recent Store Orders
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/orders")}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:bg-sky-50"
              >
                View All Orders <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {recentOrders.length > 0 ? (
                recentOrders.map((ord) => (
                  <div
                    key={ord._id}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 text-sm"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-xs">
                        #{ord._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 uppercase">
                        {ord.paymentMethod} • {ord.paymentStatus}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">
                        ${ord.totalAmount}
                      </p>
                      <Badge
                        className={`text-[10px] rounded-full px-2 py-0.5 text-white capitalize ${
                          ord.orderStatus === "confirmed"
                            ? "bg-emerald-500"
                            : ord.orderStatus === "delivered"
                              ? "bg-sky-600"
                              : ord.orderStatus === "cancelled"
                                ? "bg-rose-500"
                                : "bg-slate-800"
                        }`}
                      >
                        {ord.orderStatus}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-sm text-slate-500">
                  No orders recorded yet.
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Feature Banner Manager Section */}
      <div className="pt-4 border-t border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-1">
          Storefront Banner Manager
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          Upload and organize the hero promotional carousel shown on the homepage.
        </p>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-slate-200/80 bg-slate-950 text-white shadow-md rounded-[1.75rem]">
            <CardContent className="flex h-full flex-col justify-between gap-6 p-6 sm:p-8">
              <div className="space-y-3">
                <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-200">
                  Home Promo Carousel
                </span>
                <h3 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Keep customer attention focused on new drops and seasonal discounts.
                </h3>
                <p className="text-sm leading-6 text-slate-300">
                  Images published here will rotate on the customer homepage every 15 seconds.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white shadow-xs rounded-[1.75rem]">
            <CardContent className="p-6">
              <ProductImageUpload
                imageFile={imageFile}
                setImageFile={setImageFile}
                uploadedImageUrl={uploadedImageUrl}
                setUploadedImageUrl={setUploadedImageUrl}
                setImageLoadingState={setImageLoadingState}
                imageLoadingState={imageLoadingState}
                isCustomStyling={true}
              />
              <Button
                onClick={handleUploadFeatureImage}
                disabled={!uploadedImageUrl || imageLoadingState}
                className="mt-6 h-11 w-full rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold disabled:cursor-not-allowed disabled:opacity-50"
              >
                {imageLoadingState ? "Publishing..." : "Publish Banner"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Existing Banners Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureImageList && featureImageList.length > 0 ? (
            featureImageList.map((featureImgItem) => (
              <div
                key={featureImgItem._id || featureImgItem.image}
                className="group relative overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-xs"
              >
                <img
                  src={featureImgItem.image}
                  className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <Button
                  onClick={() => handleDeleteFeatureImage(featureImgItem._id)}
                  className="absolute right-3 top-3 h-8 w-8 rounded-full bg-rose-50 p-0 text-rose-600 shadow-lg opacity-0 transition-opacity hover:bg-rose-100 group-hover:opacity-100"
                  title="Remove banner"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <Card className="border-dashed border-slate-200 bg-white sm:col-span-2 lg:col-span-3">
              <CardContent className="flex min-h-[160px] flex-col items-center justify-center text-center">
                <p className="text-sm font-semibold text-slate-700">No feature banners published</p>
                <p className="mt-1 text-xs text-slate-500">Upload a hero image above to display on the storefront.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
