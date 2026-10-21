import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/lib/apiBaseUrl";

const initialState = {
  items: [],
  isLoading: false,
};

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/shop/wishlist/add`,
        { productId },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/shop/wishlist/get`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/shop/wishlist/remove/${productId}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

const wishlistSlice = createSlice({
  name: "shopWishlist",
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload?.data || [];
      })
      .addCase(fetchWishlist.rejected, (state) => {
        state.isLoading = false;
        state.items = [];
      })
      .addCase(addToWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload?.data || [];
      })
      .addCase(addToWishlist.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(removeFromWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload?.data || [];
      })
      .addCase(removeFromWishlist.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

