import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/lib/apiBaseUrl";

const initialState = {
  approvalURL: null,
  isLoading: false,
  orderId: null,
  paypalClientId: "",
  orderList: [],
  orderDetails: null,
};

export const getPayPalConfig = createAsyncThunk(
  "/order/getPayPalConfig",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/shop/order/paypal-config`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || {
          success: false,
          message: "Unable to load PayPal configuration.",
        },
      );
    }
  },
);

export const createNewOrder = createAsyncThunk(
  "/order/createNewOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/shop/order/create`,
        orderData,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || {
          success: false,
          message: "Unable to create order. Please try again.",
        },
      );
    }
  },
);

export const createCodOrder = createAsyncThunk(
  "/order/createCodOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/shop/order/create-cod`,
        orderData,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || {
          success: false,
          message: "Unable to place COD order.",
        },
      );
    }
  },
);

export const cancelUserOrder = createAsyncThunk(
  "/order/cancelUserOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/shop/order/cancel/${orderId}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || {
          success: false,
          message: "Unable to cancel order.",
        },
      );
    }
  },
);

export const capturePayment = createAsyncThunk(
  "/order/capturePayment",
  async (
    { paymentId, payerId, orderId, paypalOrderId },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/shop/order/capture`,
        {
          paymentId,
          payerId,
          orderId,
          paypalOrderId,
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || {
          success: false,
          message: "Unable to capture payment. Please try again.",
        },
      );
    }
  },
);

export const getAllOrdersByUserId = createAsyncThunk(
  "/order/getAllOrdersByUserId",
  async (userId) => {
    const response = await axios.get(
      `${API_BASE_URL}/api/shop/order/list/${userId}`,
    );
    return response.data;
  },
);

export const getOrderDetails = createAsyncThunk(
  "/order/getOrderDetails",
  async (id) => {
    const response = await axios.get(
      `${API_BASE_URL}/api/shop/order/details/${id}`,
    );
    return response.data;
  },
);

const shoppingOrderSlice = createSlice({
  name: "shoppingOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.approvalURL = action.payload.approvalURL;
        state.orderId = action.payload.orderId;
        sessionStorage.setItem(
          "currentOrderId",
          JSON.stringify(action.payload.orderId),
        );
      })
      .addCase(createNewOrder.rejected, (state) => {
        state.isLoading = false;
        state.approvalURL = null;
        state.orderId = null;
      })
      .addCase(createCodOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCodOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderId = action.payload.orderId;
      })
      .addCase(createCodOrder.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(cancelUserOrder.fulfilled, (state, action) => {
        if (state.orderDetails?._id === action.payload?.data?._id) {
          state.orderDetails = action.payload.data;
        }
        state.orderList = state.orderList.map((order) =>
          order._id === action.payload?.data?._id ? action.payload.data : order,
        );
      })
      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data;
      })
      .addCase(getAllOrdersByUserId.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetails.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      })
      .addCase(getPayPalConfig.fulfilled, (state, action) => {
        state.paypalClientId = action.payload.clientId || "";
      });
  },
});

export const { resetOrderDetails } = shoppingOrderSlice.actions;

export default shoppingOrderSlice.reducer;
