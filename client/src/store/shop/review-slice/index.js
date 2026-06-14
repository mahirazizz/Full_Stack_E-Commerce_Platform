import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/lib/apiBaseUrl";

const initialState = {
  isLoading: false,
  reviews: [],
};

export const addReview = createAsyncThunk(
  "reviews/addReview",
  async (
    { productId, userId, userName, reviewMessage, reviewValue },
    thunkAPI,
  ) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/shop/review/add`,
        {
          productId,
          userId,
          userName,
          reviewMessage,
          reviewValue,
        },
        {
          withCredentials: true,
        },
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Unable to submit review.",
      );
    }
  },
);

export const getReviews = createAsyncThunk(
  "reviews/getReviews",
  async (productId) => {
    const result = await axios.get(
      `${API_BASE_URL}/api/shop/review/${productId}`,
    );
    return result?.data;
  },
);

const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addReview.fulfilled, (state) => {
        state.isLoading = false;
        // Optionally push new review or refetch all
      })
      .addCase(addReview.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(getReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.data || [];
      })
      .addCase(getReviews.rejected, (state) => {
        state.isLoading = false;
        state.reviews = [];
      });
  },
});

export default reviewSlice.reducer;
