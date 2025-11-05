import React, { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import SellerDashboard from "../components/Dashboard/SellerDashboard";
import * as api from "../services/api";

const pickRole = (u) =>
  (u?.role ?? (Array.isArray(u?.roles) ? u.roles[0] : "USER"))
    ?.toString()
    ?.toUpperCase();

const isSeller = (u) => pickRole(u) === "SELLER";

export default function SellerRoute({ user: userProp, token: tokenProp }) {
  // 1) get user/token from props or fallback to persistence
  const [user] = useState(
    () => userProp ?? JSON.parse(localStorage.getItem("auth_user") || "null")
  );
  const [token] = useState(() => tokenProp ?? localStorage.getItem("auth_token"));

  // 2) local state for seller data
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});

  // 3) data loader
  const loadSellerData = useCallback(async () => {
    if (!token || !isSeller(user)) return;
    const [prodRes, orderRes, statRes] = await Promise.all([
      api.getSellerProducts(token),
      api.getSellerOrders(token),
      api.getSellerStats(token),
    ]);
    setProducts(prodRes?.data?.products ?? prodRes?.products ?? []);
    setOrders(orderRes?.data?.orders ?? orderRes?.orders ?? []);
    setStats(statRes?.data ?? statRes ?? {});
  }, [token, user]);

  useEffect(() => {
    loadSellerData().catch(console.warn);
  }, [loadSellerData]);

  // 4) create product then refresh
  const handleAddProduct = async (payload) => {
    await api.createProduct(payload, token);
    await loadSellerData();
  };

  // 5) route guards
  if (!token) return <Navigate to="/login" replace />;
  if (!isSeller(user)) return <Navigate to="/user-dashboard" replace />;

  // 6) render dashboard with data + handlers
  return (
    <SellerDashboard
      user={user}
      token={token}
      products={products}
      orders={orders}
      stats={stats}
      onAddProduct={handleAddProduct}
    />
  );
}
