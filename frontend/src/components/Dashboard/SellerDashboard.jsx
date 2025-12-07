// SellerDashboard.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./SellerDashboard.css";

import SellerHeader from "../seller/SellerHeader";
import SellerKPIs from "../seller/SellerKPIs";
import SellerActions from "../seller/SellerActions";
import ProductsCard from "../seller/ProductsCard";
import OrdersCard from "../seller/OrdersCard";
import PayoutCard from "../seller/PayoutCard";
import InventoryAlertsCard from "../seller/InventoryAlertsCard";
import QuickAddModal from "../seller/QuickAddModal";
import * as api from "../../services/api";

export default function SellerDashboard({
  user,
  token,
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
  products = [],
  orders = [],
  onAddProduct,       // optional passthrough
  onEditProduct,      // optional passthrough
  onViewProduct,
  onToggleListing,
  onExportProducts,
  onExportOrders,
  onFulfillOrder,
  onViewOrder,
  onPayoutRequest,
}) {
  const navigate = useNavigate();

  const [localProducts, setLocalProducts] = useState(products);
  useEffect(() => { setLocalProducts(products); }, [products]);

  // modal state
  const [showAdd, setShowAdd] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [editingProduct, setEditingProduct] = useState(null);

  // CREATE (existing behavior kept; only runs if parent didn't override)
  const handleCreateProduct = useCallback(
    async (payload) => {
      if (onAddProduct) {
        await onAddProduct(payload);
      } else {
        const res = await api.createProduct(payload, token);
        const created = res?.product || res?.data?.product || res;
        if (created) {
          setLocalProducts((prev) => [created, ...(Array.isArray(prev) ? prev : [])]);
        }
      }
      setShowAdd(false);
    },
    [onAddProduct, token]
  );

  // EDIT: If parent provided handler, use it. Otherwise open modal in "edit" mode.
  const handleEditRequest = useCallback(
    (p) => {
      if (onEditProduct) {
        onEditProduct(p); // preserve external behavior
        return;
      }
      setEditingProduct(p);
      setModalMode("edit");
      setShowAdd(true);
    },
    [onEditProduct]
  );

  // Unified submit for modal (create or update)
  const handleSubmitModal = useCallback(
    async (formValues) => {
      if (modalMode === "create") {
        await handleCreateProduct(formValues);
      } else {
        // UPDATE path (only used when parent didn't provide onEditProduct)
        const id = editingProduct?.productId ?? editingProduct?.id;
        const payload = {
          // send only the limited/allowed fields you want to update
          price: formValues.price,
          quantity: formValues.quantity,
          images: formValues.images,
          active: formValues.active,
          description: formValues.description,
        };

        const res = await api.updateProduct(id, payload, token);
        const updated = res?.data?.product ?? res?.product ?? null;

        if (updated) {
          setLocalProducts((prev) =>
            (Array.isArray(prev) ? prev : []).map((x) =>
              (x.id ?? x.productId) === (updated.id ?? updated.productId) ? updated : x
            )
          );
        }
        setShowAdd(false);
        setModalMode("create");
        setEditingProduct(null);
      }
    },
    [modalMode, editingProduct, token, handleCreateProduct]
  );

  const kpis = useMemo(
    () => [
      { label: "Products", value: Array.isArray(localProducts) ? localProducts : (stats.products || 0) },
      { label: "Low Stock", value: stats.lowStock || 0 },
      { label: "New Orders", value: stats.ordersNew || 0 },
      { label: "Processing", value: stats.ordersProcessing || 0 },
      { label: "Revenue (7d)", value: `₹${Number(stats.revenue7d || 0).toLocaleString()}` },
      { label: "Views (7d)", value: Number(stats.views7d || 0).toLocaleString() },
    ],
    [localProducts, stats]
  );

  return (
    <div className="seller-page">
      {/* Header */}
      <header className="seller-header">
        <div className="seller-header-left">
          <div className="seller-avatar">
            <img src={user?.profileImage || "/default-avatar.png"} alt="Seller" />
          </div>
          <div>
            <h1>Hello, {user?.firstName || user?.username || "Seller"} 👋</h1>
            <p className="seller-sub">
              Role: {user?.role || (user?.roles?.[0] ?? "SELLER")} · Token: {token ? "Yes" : "No"}
            </p>
          </div>
        </div>
        <div className="seller-header-right">
          <button className="seller-ghost-btn" onClick={() => navigate("/profile")}>Profile</button>
          <button className="seller-ghost-btn" onClick={() => navigate("/seller/orders")}>Orders</button>
          <button className="seller-ghost-btn" onClick={() => navigate("/seller/products")}>Products</button>
        </div>
      </header>

      {/* KPIs */}
      <SellerKPIs kpis={kpis} />

      {/* Quick actions */}
      <SellerActions
        token={token}
        onOpenQuickAdd={() => { setModalMode("create"); setEditingProduct(null); setShowAdd(true); }}
        onExportProducts={onExportProducts}
        onExportOrders={onExportOrders}
      />

      {/* Main grid */}
      <section className="seller-grid">
        <ProductsCard
          products={localProducts}
          onAddProduct={() => { setModalMode("create"); setEditingProduct(null); setShowAdd(true); }}
          onEditProduct={handleEditRequest}
          onViewProduct={onViewProduct}
          onToggleListing={onToggleListing}
        />

        <OrdersCard
          orders={orders}
          onViewOrder={onViewOrder}
          onFulfillOrder={onFulfillOrder}
        />

        <PayoutCard
          balance={stats.balance}
          nextPayoutDate={stats.nextPayoutDate}
          onPayoutRequest={onPayoutRequest}
        />

        <InventoryAlertsCard
          products={localProducts}
          onEditProduct={handleEditRequest}
        />
      </section>

      {/* Modal (create / edit) */}
      <QuickAddModal
        open={showAdd}
        onClose={() => { setShowAdd(false); setModalMode("create"); setEditingProduct(null); }}
        user={user}
        token={token}
        onSubmit={handleSubmitModal}
        mode={modalMode}                     // "create" | "edit"
        initialValues={editingProduct}       // prefill for edit
        fieldsToEdit={["price","quantity","images","active","description"]} // limit edit fields
      />
    </div>
  );
}
