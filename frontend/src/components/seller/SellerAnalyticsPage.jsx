import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../../services/api";

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export default function SellerAnalyticsPage({ user, token }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    ordersPlaced: 0,
    ordersProcessing: 0,
    ordersCancelled: 0,
    returnsRequested: 0,
    returnsCompleted: 0,
    revenueTotal: 0,
    revenue7d: 0,
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        // Compute simple analytics client-side using existing endpoints
        const [prodRes, ordRes] = await Promise.all([
          api.getSellerProducts(token),
          user?.id ? api.getOrderDetailsBySeller(user.id, token) : Promise.resolve({ data: [] })
        ]);
        const products = Array.isArray(prodRes?.data?.products) ? prodRes.data.products : (Array.isArray(prodRes?.products) ? prodRes.products : []);
        const orders = Array.isArray(ordRes?.data) ? ordRes.data : [];

        const totalProducts = products.length;
        const lowStock = products.filter(p => Number(p?.quantity ?? 0) <= 5 && (p?.isActive ?? p?.active ?? true)).length;

        let ordersPlaced = 0, ordersProcessing = 0, ordersCancelled = 0, returnsRequested = 0, returnsCompleted = 0;
        let revenueTotal = 0, revenue7d = 0;
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        for (const o of orders) {
          const status = String(o?.status || '').toUpperCase();
          if (status === 'PLACED') ordersPlaced++;
          else if (status === 'PROCESSING') ordersProcessing++;
          else if (status === 'CANCELLED') ordersCancelled++;
          else if (status === 'RETURN_REQUESTED') returnsRequested++;
          else if (status === 'RETURNED') returnsCompleted++;
          const total = Number(o?.total ?? 0);
          revenueTotal += total;
          const createdAt = o?.createdAt ? new Date(o.createdAt).getTime() : null;
          if (createdAt && createdAt >= sevenDaysAgo) revenue7d += total;
        }

        setStats({ totalProducts, lowStock, ordersPlaced, ordersProcessing, ordersCancelled, returnsRequested, returnsCompleted, revenueTotal, revenue7d });
      } catch (e) {
        setError(e?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id, token]);

  return (
    <div className="seller-page">
      <div className="card">
        <div className="card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Seller Analytics</h3>
          <button className="tiny" onClick={() => navigate('/seller-dashboard')}>Back to dashboard</button>
        </div>
        {loading && <p style={{ padding: 12 }}>Loading...</p>}
        {error && <p className="error" style={{ padding: 12 }}>{error}</p>}
        {!loading && !error && (
          <div className="seller-kpis">
            <div className="kpi"><div className="kpi-label">Products</div><div className="kpi-value">{stats.totalProducts}</div></div>
            <div className="kpi"><div className="kpi-label">Low Stock</div><div className="kpi-value">{stats.lowStock}</div></div>
            <div className="kpi"><div className="kpi-label">Orders Placed</div><div className="kpi-value">{stats.ordersPlaced}</div></div>
            <div className="kpi"><div className="kpi-label">Processing</div><div className="kpi-value">{stats.ordersProcessing}</div></div>
            <div className="kpi"><div className="kpi-label">Cancelled</div><div className="kpi-value">{stats.ordersCancelled}</div></div>
            <div className="kpi"><div className="kpi-label">Returns Requested</div><div className="kpi-value">{stats.returnsRequested}</div></div>
            <div className="kpi"><div className="kpi-label">Returns Completed</div><div className="kpi-value">{stats.returnsCompleted}</div></div>
            <div className="kpi"><div className="kpi-label">Revenue (Total)</div><div className="kpi-value">{inr.format(Number(stats.revenueTotal || 0))}</div></div>
            <div className="kpi"><div className="kpi-label">Revenue (7d)</div><div className="kpi-value">{inr.format(Number(stats.revenue7d || 0))}</div></div>
          </div>
        )}
      </div>
    </div>
  );
}
