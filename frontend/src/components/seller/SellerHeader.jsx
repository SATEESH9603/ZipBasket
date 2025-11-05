import React from "react";
import { useNavigate } from "react-router-dom";

export default function SellerHeader({ user, token }) {
  const navigate = useNavigate();

  return (
    <header className="seller-header">
      <div className="seller-header-left">
        <div className="seller-avatar">
          <img
            src={user?.profileImage || "/default-avatar.png"}
            alt="Seller"
          />
        </div>
        <div>
          <h1>Hello, {user?.firstName || user?.username || "Seller"} 👋</h1>
          <p className="seller-sub">
            Role: {user?.role || (user?.roles?.[0] ?? "SELLER")} · Token: {token ? "Yes" : "No"}
          </p>
        </div>
      </div>

      <div className="seller-header-right">
        <button className="seller-ghost-btn" onClick={() => navigate("/profile")}>
          Profile
        </button>
        <button className="seller-ghost-btn" onClick={() => navigate("/seller/orders")}>
          Orders
        </button>
        <button className="seller-ghost-btn" onClick={() => navigate("/seller/products")}>
          Products
        </button>
      </div>
    </header>
  );
}
