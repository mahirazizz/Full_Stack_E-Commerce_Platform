import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();

  // Root redirect
  if (location.pathname === "/") {
    if (!isAuthenticated) {
      return <Navigate to="/shop/home" />;
    }
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" />;
    }
    return <Navigate to="/shop/home" />;
  }

  // Public shopping pages accessible without login
  const isShopPublicRoute =
    location.pathname.startsWith("/shop/home") ||
    location.pathname.startsWith("/shop/listing") ||
    location.pathname.startsWith("/shop/search") ||
    location.pathname.startsWith("/shop/product");

  // Auth pages
  const isAuthRoute =
    location.pathname.includes("/login") ||
    location.pathname.includes("/register") ||
    location.pathname.includes("/forgot-password") ||
    location.pathname.includes("/reset-password");

  // 1. Unauthenticated users trying to access protected routes
  if (!isAuthenticated && !isAuthRoute && !isShopPublicRoute) {
    return <Navigate to="/auth/login" />;
  }

  // 2. Authenticated users trying to access auth pages (login/register)
  if (isAuthenticated && isAuthRoute) {
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" />;
    }
    return <Navigate to="/shop/home" />;
  }

  // 3. Regular users trying to access admin dashboard
  if (
    isAuthenticated &&
    user?.role !== "admin" &&
    location.pathname.startsWith("/admin")
  ) {
    return <Navigate to="/unauth-page" />;
  }

  return <>{children}</>;
}

export default CheckAuth;
