import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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


function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const handleAuth = (token, user) => {
    setToken(token);
    setUser(user);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');   // ⬅️ required
    localStorage.removeItem('auth_user');    // ⬅️ required
  };

  const handleUpdateProfile = async (formData) => {
    try {
      const { data } = await updateProfile(formData, token);
      setUser(data.user || user);
      alert("Profile updated!");
    } catch (err) {
      alert("Failed to update profile: " + (err.response?.data?.message || ""));
    }
  };

  return (
    <Router>
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
                {/* NEW: role-specific destinations used by AuthForm */}
                <Route
                  path="/user-dashboard"
                  element={token ? <UserDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
                />
                <Route
                  path="/seller-dashboard"
                  element={
                    token ? (
                      <SellerRoute user={user} token={token} />
                      // or simply: <SellerRoute />  (it will read from localStorage)
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
                <Route path="/category/:categoryName" element={<CategoryPage />} />
                
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
