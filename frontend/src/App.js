import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthForm from "./components/AuthForm";
import UserDashboard from "./components/Dashboard/UserDashboard";
import ProfileView from "./components/UserProfile/ProfileView";
import TopBar from "./components/Layout/TopBar";
import ForgotPassword from "./components/Password Reset/ForgotPassword";
import ResetPassword from "./components/Password Reset/ResetPassword";
import HomePage from "./components/Home/HomePage";
import { updateProfile } from "./services/api";
import CategoryPage from "./pages/CategoryPage";
import SellerRoute from "./utils/SellerRoute";
import ViewProductRoute from "./utils/ViewProductRoute";
import EditProductRoute from "./utils/EditProductRoute";
// New pages
import CartPage from "./components/Cart/CartPage";
import WishlistPage from "./components/Wishlist/WishlistPage";
import AddressPage from "./components/Address/AddressPage";
import CheckoutPage from "./components/Checkout/CheckoutPage";
import OrdersPage from "./components/Orders/OrdersPage";

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Restore session on app load (works for any route, not only auth pages)
  useEffect(() => {
    try {
      const t = localStorage.getItem('auth_token');
      const u = localStorage.getItem('auth_user');
      if (t && u) {
        const parsed = JSON.parse(u);
        setToken(t);
        setUser(parsed);
      }
    } catch {
      // ignore malformed localStorage entries
    }
  }, []);

  const handleAuth = (token, user) => {
    setToken(token);
    setUser(user);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const handleUpdateProfile = async (formData) => {
    try {
      const { data } = await updateProfile(formData, token);
      setUser(data.user || user);
    } catch (err) {
      // handled via toasts inside ProfileView if needed
    }
  };

  const username = user?.username;

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
      <Routes>
        {/* HomePage - no TopBar */}
        <Route path="/" element={<HomePage user={user} />} />

        {/* Pages with TopBar */}
        <Route
          path="/*"
          element={
            <>
              <TopBar user={user} onLogout={handleLogout} />
              <Routes>
                <Route path="/login" element={<AuthForm mode="login" onAuth={handleAuth} />} />
                <Route path="/register" element={<AuthForm mode="register" onAuth={handleAuth} />} />
                <Route
                  path="dashboard"
                  element={token ? <UserDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
                />
                {/* Role-specific destinations */}
                <Route
                  path="/user-dashboard"
                  element={token ? <UserDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
                />
                {/* Admin route mapped to the same dashboard to avoid broken redirects */}
                <Route
                  path="/admin-dashboard"
                  element={token ? <UserDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
                />
                <Route
                  path="/seller-dashboard"
                  element={
                    token ? (
                      <SellerRoute user={user} token={token} />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />
                <Route path="/profile" element={
                  token ? <ProfileView user={user} token={token} onUpdateProfile={handleUpdateProfile} handleLogout={handleLogout} /> : <Navigate to="/login" />
                } />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token?" element={<ResetPassword />} />
                <Route path="/category/:categoryName" element={<CategoryPage user={user} token={token} />} />
                <Route path="/seller/product/:productId" element={<ViewProductRoute />} />
                <Route path="/seller/edit-product/:productId" element={<EditProductRoute token={token} />} />
                {/* New feature routes */}
                <Route path="/cart" element={token && username ? <CartPage username={username} token={token} /> : <Navigate to="/login" />} />
                <Route path="/wishlist" element={token && username ? <WishlistPage username={username} token={token} /> : <Navigate to="/login" />} />
                <Route path="/addresses" element={token && username ? <AddressPage username={username} token={token} /> : <Navigate to="/login" />} />
                <Route path="/checkout" element={token && username ? <CheckoutPage username={username} token={token} /> : <Navigate to="/login" />} />
                <Route path="/orders" element={token && username ? <OrdersPage username={username} token={token} /> : <Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
