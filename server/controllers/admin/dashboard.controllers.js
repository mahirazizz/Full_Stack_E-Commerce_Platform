import { Order } from "../../models/order.models.js";
import { Product } from "../../models/product.models.js";
import { User } from "../../models/user.models.js";

const getAdminDashboardAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: "user" });

    // Revenue calculation
    const revenueAggregate = await Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: "cancelled" },
          $or: [
            { paymentStatus: "paid" },
            { paymentMethod: "cod", orderStatus: { $ne: "cancelled" } },
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue = revenueAggregate[0]?.totalRevenue || 0;

    // Order status counts
    const statusCountsAggregate = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts = {
      pending: 0,
      confirmed: 0,
      inProcess: 0,
      inShipping: 0,
      delivered: 0,
      cancelled: 0,
    };

    statusCountsAggregate.forEach((item) => {
      if (item._id && statusCounts.hasOwnProperty(item._id)) {
        statusCounts[item._id] = item.count;
      }
    });

    // Low stock alerts (items with less than 5 in stock)
    const lowStockProducts = await Product.find({ totalStock: { $lt: 5 } })
      .select("title image category brand totalStock price salePrice")
      .limit(8);

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select(
        "userId orderStatus paymentMethod paymentStatus totalAmount orderDate cartItems",
      );

    // Calculate Average Order Value
    const averageOrderValue =
      totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalOrders,
          totalProducts,
          totalCustomers,
          averageOrderValue,
        },
        statusCounts,
        lowStockProducts,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin dashboard analytics.",
    });
  }
};

export { getAdminDashboardAnalytics };

