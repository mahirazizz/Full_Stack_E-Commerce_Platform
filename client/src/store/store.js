import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice/index.js";

import adminProductSlice from "./admin/products-slice/index.js";
import adminOrderSlice from "./admin/order-slice/index.js";

import shoppingProductSlice from "./shop/products-slice/index.js";
import shopCartSlice from "./shop/cart-slice/index.js";
import shopAddressSlice from "./shop/address-slice/index.js";
import shopOrderSlice from "./shop/order-slice/index.js";
import shopSearchSlice from "./search-slice/index.js";
import shopReviewSlice from "./shop/review-slice/index.js";
import shopWishlistSlice from "./shop/wishlist-slice/index.js";

import commonFeatureSlice from "./common-slice/index.js";

const store = configureStore({
  reducer: {
    auth: authReducer,

    adminProducts: adminProductSlice,
    adminOrder: adminOrderSlice,

    shopProducts: shoppingProductSlice,
    shopCart: shopCartSlice,
    shopReview: shopReviewSlice,
    shopSearch: shopSearchSlice,
    shopAddress: shopAddressSlice,
    shopOrder: shopOrderSlice,
    shopWishlist: shopWishlistSlice,

    commonFeature: commonFeatureSlice,
  },
});

export default store;
