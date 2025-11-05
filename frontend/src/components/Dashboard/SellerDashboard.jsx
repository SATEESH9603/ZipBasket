import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SellerDashboard.css";

// child components
import SellerHeader from "../seller/SellerHeader";
import SellerKPIs from "../seller/SellerKPIs";
import SellerActions from "../seller/SellerActions";
import ProductsCard from "../seller/ProductsCard";
import OrdersCard from "../seller/OrdersCard";
import PayoutCard from "../seller/PayoutCard";
import InventoryAlertsCard from "../seller/InventoryAlertsCard";
import QuickAddModal from "../seller/QuickAddModal";

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
  products = [],
  orders = [],

  // Handlers (optional)
  onAddProduct,               // (payload) => Promise|void
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

  // ——— Quick Add state (lifted so other parts can react if needed) ———
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [draftProduct, setDraftProduct] = useState(null);

  // open/close modal
  const openQuickAdd = () => setShowQuickAdd(true);
  const closeQuickAdd = () => setShowQuickAdd(false);

  // submit handler for modal (pass-through to onAddProduct or route)
  const handleQuickAddSubmit = async (payload) => {
    if (onAddProduct) {
      await onAddProduct(payload);
    } else {
      navigate("/seller/products/new", { state: { token, draft: payload } });
    }
  };

  return (
    <div className="seller-page">
      <SellerHeader user={user} token={token} />

      <SellerKPIs kpis={kpis} />

      <SellerActions
        token={token}
        onOpenQuickAdd={openQuickAdd}
        onExportProducts={onExportProducts}
        onExportOrders={onExportOrders}
      />

      <section className="seller-grid">
        <ProductsCard
          products={products}
          onNew={openQuickAdd}
          onViewProduct={(id) => onViewProduct?.(id)}
          onEditProduct={(p) => onEditProduct?.(p)}
          onToggleListing={(p) => onToggleListing?.(p)}
        />

        <OrdersCard
          orders={orders}
          onViewAll={() => navigate("/seller/orders")}
          onViewOrder={(id) => onViewOrder?.(id)}
          onFulfill={(o) => onFulfillOrder?.(o)}
        />

        <PayoutCard
          balance={stats.balance}
          nextPayoutDate={stats.nextPayoutDate}
          onRequest={() => onPayoutRequest?.()}
          onHistory={() => navigate("/seller/payouts")}
        />

        <InventoryAlertsCard
          products={products}
          onRestock={(p) => onEditProduct?.(p)}
        />
      </section>

      <QuickAddModal
        open={showQuickAdd}
        onClose={closeQuickAdd}
        user={user}
        token={token}
        defaultDraft={draftProduct}
        onSubmit={handleQuickAddSubmit}
      />
    </div>
  );
}
