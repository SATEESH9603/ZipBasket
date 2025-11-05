import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./SellerDashboard.css";

export default function SellerDashboard({
  user,
  token,

  // Stats (optional)
  stats = {
    products: 0,
    lowStock: 0,
    ordersNew: 0,
    ordersProcessing: 0,
    revenue7d: 0,
    views7d: 0,
    balance: 0,
    nextPayoutDate: null,
  },

  // Data (optional)
  products = [], // [{id, name, sku, price, stock, status, image}]
  orders = [],   // [{id, orderNumber, date, total, status, items:[...]}]

  // Handlers (optional)
  onAddProduct,               // () => void
  onEditProduct,              // (item) => void
  onViewProduct,              // (productId) => void
  onToggleListing,            // (item) => void
  onExportProducts,           // () => void
  onExportOrders,             // () => void
  onFulfillOrder,             // (order) => void
  onViewOrder,                // (orderId) => void
  onPayoutRequest,            // () => void
}) {
  const navigate = useNavigate();

  const kpis = useMemo(() => ([
    { label: "Products", value: stats.products || 0 },
    { label: "Low Stock", value: stats.lowStock || 0 },
    { label: "New Orders", value: stats.ordersNew || 0 },
    { label: "Processing", value: stats.ordersProcessing || 0 },
    { label: "Revenue (7d)", value: `₹${Number(stats.revenue7d || 0).toLocaleString()}` },
    { label: "Views (7d)", value: Number(stats.views7d || 0).toLocaleString() },
  ]), [stats]);

  return (
    <div className="seller-page">
      {/* Header bar */}
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
            <p className="seller-sub">Role: {user?.role || (user?.roles?.[0] ?? "SELLER")} · Token: {token ? "Yes" : "No"}</p>
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

      {/* KPI cards */}
      <section className="seller-kpis">
        {kpis.map((k, i) => (
          <div className="kpi" key={i}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
          </div>
        ))}
      </section>

      {/* Quick actions */}
      <section className="seller-actions">
        <button className="cta" onClick={() => onAddProduct?.() || navigate("/seller/products/new", { state: { token } })}>
          + Add Product
        </button>
        <button className="cta ghost" onClick={() => onExportProducts?.()}>
          Export Products
        </button>
        <button className="cta ghost" onClick={() => onExportOrders?.()}>
          Export Orders
        </button>
        <button className="cta" onClick={() => navigate("/seller/analytics")}>
          View Analytics
        </button>
      </section>

      {/* Two-column main grid */}
      <section className="seller-grid">
        {/* Products */}
        <div className="card">
          <div className="card-head">
            <h3>Products</h3>
            <button className="tiny" onClick={() => onAddProduct?.() || navigate("/seller/products/new")}>
              + New
            </button>
          </div>

          {Array.isArray(products) && products.length > 0 ? (
            <div className="table">
              <div className="trow thead">
                <div>Product</div>
                <div>Price</div>
                <div>Stock</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
              {products.slice(0, 8).map((p, idx) => (
                <div className="trow" key={p?.id ?? idx}>
                  <div className="prod-cell">
                    <img src={p?.image || "/placeholder.png"} alt={p?.name || "Product"} className="prod-thumb" />
                    <div>
                      <div className="prod-name">{p?.name || "—"}</div>
                      <div className="prod-sku">{p?.sku || ""}</div>
                    </div>
                  </div>
                  <div>₹{Number(p?.price || 0).toFixed(2)}</div>
                  <div className={Number(p?.stock || 0) <= 5 ? "warn" : ""}>{p?.stock ?? 0}</div>
                  <div className={`pill pill--${(p?.status || "draft").toLowerCase()}`}>
                    {p?.status || "DRAFT"}
                  </div>
                  <div className="row-actions">
                    <button onClick={() => onViewProduct?.(p?.id) || navigate(`/products/${p?.id}`)}>View</button>
                    <button onClick={() => onEditProduct?.(p) || navigate(`/seller/products/${p?.id}/edit`)}>Edit</button>
                    <button onClick={() => onToggleListing?.(p)}>{p?.status === "ACTIVE" ? "Unlist" : "List"}</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">No products yet.</p>
          )}
          <div className="card-foot">
            <button className="linklike" onClick={() => navigate("/seller/products")}>Manage all products →</button>
          </div>
        </div>

        {/* Orders */}
        <div className="card">
          <div className="card-head">
            <h3>Recent Orders</h3>
            <button className="tiny ghost" onClick={() => navigate("/seller/orders")}>View all</button>
          </div>

          {Array.isArray(orders) && orders.length > 0 ? (
            <div className="table">
              <div className="trow thead">
                <div>Order #</div>
                <div>Date</div>
                <div>Status</div>
                <div>Total</div>
                <div>Actions</div>
              </div>
              {orders.slice(0, 8).map((o, idx) => (
                <div className="trow" key={o?.id ?? idx}>
                  <div>{o?.orderNumber || o?.id || "—"}</div>
                  <div>{o?.date || "—"}</div>
                  <div className={`pill pill--${(o?.status || "unknown").toLowerCase()}`}>{o?.status || "Unknown"}</div>
                  <div>₹{Number(o?.total || 0).toFixed(2)}</div>
                  <div className="row-actions">
                    <button onClick={() => onViewOrder?.(o?.id) || navigate(`/orders/${o?.id}`)}>View</button>
                    <button onClick={() => onFulfillOrder?.(o)}>Fulfill</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">No recent orders.</p>
          )}
        </div>

        {/* Payouts / Balance */}
        <div className="card payout">
          <div className="card-head">
            <h3>Payouts</h3>
          </div>
          <div className="payout-body">
            <div className="payout-balance">
              <div className="label">Available Balance</div>
              <div className="value">₹{Number(stats.balance || 0).toLocaleString()}</div>
            </div>
            <div className="payout-next">
              <div className="label">Next Payout</div>
              <div className="value">{stats.nextPayoutDate || "—"}</div>
            </div>
          </div>
          <div className="payout-actions">
            <button className="cta" onClick={() => onPayoutRequest?.()}>Request Payout</button>
            <button className="cta ghost" onClick={() => navigate("/seller/payouts")}>Payout History</button>
          </div>
        </div>

        {/* Inventory Alerts / Tips */}
        <div className="card tips">
          <div className="card-head">
            <h3>Inventory Alerts</h3>
          </div>
          {Array.isArray(products) && products.some(p => Number(p?.stock || 0) <= 5) ? (
            <ul className="alert-list">
              {products
                .filter(p => Number(p?.stock || 0) <= 5)
                .slice(0, 6)
                .map((p, idx) => (
                  <li key={p?.id ?? idx}>
                    <span className="dot" />
                    {p?.name || "Product"} — Stock: {p?.stock ?? 0}
                    <button className="tiny link" onClick={() => onEditProduct?.(p) || navigate(`/seller/products/${p?.id}/edit`)}>Restock</button>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="empty">No low-stock items. Nice! 🎉</p>
          )}
        </div>
      </section>
    </div>
  );
}
