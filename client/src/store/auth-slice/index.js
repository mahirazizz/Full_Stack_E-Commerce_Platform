import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

export const registerUser = createAsyncThunk(
  "/auth/register",
  async (formData, thunkAPI) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/auth/register`,
        formData,
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Registration failed",
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  "/auth/login",
  async (formData, thunkAPI) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/auth/login`,
        formData,
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Login failed",
      );
    }
  },
);

export const logoutUser = createAsyncThunk("/auth/logout", async () => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/auth/logout`,
    {},
    {
      withCredentials: true,
    },
  );
  return response.data;
});

export const checkAuth = createAsyncThunk("/auth/checkauth", async () => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/auth/check-auth`,
    {
      withCredentials: true,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Expires: "0",
      },
    },
  );
  return response.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success ? true : false;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
