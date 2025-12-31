import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./SellerDashboard.css";
import * as api from "../../services/api";
import SellerHeader from "../seller/SellerHeader";
import SellerKPIs from "../seller/SellerKPIs";
import SellerActions from "../seller/SellerActions";
import ProductsCard from "../seller/ProductsCard";
import OrdersCard from "../seller/OrdersCard";
import PayoutCard from "../seller/PayoutCard";
import InventoryAlertsCard from "../seller/InventoryAlertsCard";
import QuickAddModal from "../seller/QuickAddModal";

export default function SellerDashboard(props) {
  const { user, token, stats = {}, products = [], orders = [], onAddProduct, onEditProduct, onViewProduct, onToggleListing, onExportProducts, onExportOrders, onFulfillOrder, onViewOrder, onPayoutRequest } = props;
  const navigate = useNavigate();

  const [localProducts, setLocalProducts] = useState(products);
  const [localOrders, setLocalOrders] = useState(orders);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { setLocalProducts(products); }, [products]);
  useEffect(() => { setLocalOrders(orders); }, [orders]);

  // Fetch seller products and orders on mount
  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [prodRes, detailsRes] = await Promise.all([
          api.getSellerProducts(token),
          user?.id ? api.getOrderDetailsBySeller(user.id, token) : Promise.resolve({ data: [] })
        ]);
        const prods = Array.isArray(prodRes?.data?.products) ? prodRes.data.products : (Array.isArray(prodRes?.products) ? prodRes.products : []);
        const dets = Array.isArray(detailsRes?.data) ? detailsRes.data : [];
        if (!ignore) {
          setLocalProducts(prods);
          setOrderDetails(dets);
          // Build summary list and sort by createdAt desc for Recent Orders
          const summaries = dets.map(o => ({ id: o.id, status: o.status, total: o.total, createdAt: o.createdAt }))
            .sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          setLocalOrders(summaries);
        }
      } catch (e) {
        if (!ignore) setError(e?.message || "Failed to load dashboard data");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [token, user?.id]);

  // modal state
  const [showAdd, setShowAdd] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [editingProduct, setEditingProduct] = useState(null);

  const handleCreateProduct = useCallback(
    async (payload) => {
      if (onAddProduct) {
        await onAddProduct(payload);
      } else {
        const res = await api.createProduct(payload, token);
        const created = res?.data?.product ?? res?.product ?? null;
        if (created) {
          setLocalProducts((prev) => [created, ...(Array.isArray(prev) ? prev : [])]);
        }
      }
      setShowAdd(false);
    },
    [onAddProduct, token]
  );

  const handleEditRequest = useCallback(
    (p) => {
      if (onEditProduct) { onEditProduct(p); return; }
      setEditingProduct(p);
      setModalMode("edit");
      setShowAdd(true);
    },
    [onEditProduct]
  );

  const handleSubmitModal = useCallback(
    async (formValues) => {
      if (modalMode === "create") {
        await handleCreateProduct(formValues);
      } else {
        const id = editingProduct?.productId ?? editingProduct?.id;
        const payload = {
          price: formValues.price,
          quantity: formValues.quantity,
          images: formValues.images,
          active: formValues.active,
          description: formValues.description,
        };
        const res = await api.updateProduct(id, payload, token);
        const updated = res?.data?.product ?? res?.product ?? null;
        if (updated) {
          setLocalProducts((prev) => (Array.isArray(prev) ? prev : []).map((x) => ((x.id ?? x.productId) === (updated.id ?? updated.productId) ? updated : x)));
        }
        setShowAdd(false);
        setModalMode("create");
        setEditingProduct(null);
      }
    },
    [modalMode, editingProduct, token, handleCreateProduct]
  );

  // Compute KPIs from local state
  const kpis = useMemo(() => {
    const prods = Array.isArray(localProducts) ? localProducts : [];
    const ords = Array.isArray(localOrders) ? localOrders : [];
    const productsCount = prods.length;
    const lowStock = prods.filter(p => Number(p?.quantity ?? 0) <= 5).length; // simple threshold
    const ordersNew = ords.filter(o => String(o?.status).toUpperCase() === 'PLACED').length;
    const ordersProcessing = ords.filter(o => String(o?.status).toUpperCase() === 'PROCESSING').length;
    const revenue7d = 0; // placeholder unless backend provides
    const views7d = 0;   // placeholder
    return [
      { label: "Products", value: productsCount },
      { label: "Low Stock", value: lowStock },
      { label: "New Orders", value: ordersNew },
      { label: "Processing", value: ordersProcessing },
      { label: "Revenue (7d)", value: `₹${Number(revenue7d).toLocaleString()}` },
      { label: "Views (7d)", value: Number(views7d).toLocaleString() },
    ];
  }, [localProducts, localOrders]);

  // Toggle listing active state
  const handleToggleListing = useCallback(async (p) => {
    try {
      const id = p?.id ?? p?.productId;
      const nextActive = !(p?.isActive ?? p?.active ?? true);
      const res = await api.updateProduct(id, { isActive: nextActive }, token);
      const updated = res?.data?.product ?? res?.product ?? null;
      if (updated) {
        setLocalProducts(prev => (Array.isArray(prev) ? prev : []).map(x => ((x.id ?? x.productId) === (updated.id ?? updated.productId) ? updated : x)));
      }
    } catch (e) {
      // noop or toast if available
    }
  }, [token]);

  // Export helpers
  const exportCSV = (filename, rows, headers) => {
    const cols = headers || (rows[0] ? Object.keys(rows[0]) : []);
    const csv = [cols.join(','), ...rows.map(r => cols.map(c => JSON.stringify(r[c] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Define missing export products handler
  const handleExportProducts = useCallback(() => {
    const rows = (Array.isArray(localProducts) ? localProducts : []).map(p => ({
      id: p.id ?? p.productId,
      name: p.name,
      price: p.price,
      quantity: p.quantity,
      active: p.isActive ?? p.active,
      sku: p.sku,
      category: p.category,
    }));
    exportCSV('products.csv', rows);
  }, [localProducts]);

  // Export only non-sensitive order fields
  const handleExportOrders = useCallback(() => {
    const dets = Array.isArray(orderDetails) ? orderDetails : [];
    const rows = [];
    for (const o of dets) {
      const orderId = o.id;
      const status = o.status;
      const orderDate = o.createdAt ?? o.date ?? '';
      const total = o.total ?? 0;
      const subtotal = o.subtotal ?? 0;
      const shippingCost = o.shippingCost ?? 0;
      const items = Array.isArray(o.items) ? o.items : [];
      for (const it of items) {
        rows.push({
          orderId,
          status,
          orderDate,
          total,
          subtotal,
          shippingCost,
          productId: it.product?.id ?? it.productId ?? '',
          productName: it.product?.name ?? it.productName ?? '',
          quantity: it.quantity ?? it.qty ?? 0,
          unitPrice: it.unitPrice ?? it.price ?? 0,
        });
      }
    }
    exportCSV('orders.csv', rows, ['orderId','status','orderDate','total','subtotal','shippingCost','productId','productName','quantity','unitPrice']);
  }, [orderDetails]);

  // View actions if not provided
  const handleViewProduct = useCallback((p) => {
    if (onViewProduct) return onViewProduct(p);
    const id = p?.id ?? p?.productId;
    navigate(`/seller/product/${id}`);
  }, [navigate, onViewProduct]);

  const handleViewOrder = useCallback((o) => {
    if (onViewOrder) return onViewOrder(o);
    const id = o?.id;
    navigate(`/seller/orders/${id}`);
  }, [navigate, onViewOrder]);

  // Navigate to all orders page
  const handleViewAllOrders = useCallback(() => {
    navigate('/seller/orders');
  }, [navigate]);

  return (
    <div className="seller-page">
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

      <SellerKPIs kpis={kpis} />

      <SellerActions
        token={token}
        onOpenQuickAdd={() => { setModalMode("create"); setEditingProduct(null); setShowAdd(true); }}
        onExportProducts={onExportProducts || handleExportProducts}
        onExportOrders={onExportOrders || handleExportOrders}
      />

      <section className="seller-grid">
        <ProductsCard
          products={localProducts}
          onAddProduct={() => { setModalMode("create"); setEditingProduct(null); setShowAdd(true); }}
          onEditProduct={handleEditRequest}
          onViewProduct={handleViewProduct}
          onToggleListing={onToggleListing || handleToggleListing}
        />

        <OrdersCard
          orders={localOrders}
          onViewAll={handleViewAllOrders}
          onViewOrder={handleViewOrder}
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

      <QuickAddModal
        open={showAdd}
        onClose={() => { setShowAdd(false); setModalMode("create"); setEditingProduct(null); }}
        user={user}
        token={token}
        onSubmit={handleSubmitModal}
        mode={modalMode}
        initialValues={editingProduct}
        fieldsToEdit={["price","quantity","images","active","description"]}
      />

      {loading && <p style={{ padding: 12 }}>Loading...</p>}
      {error && <p className="error" style={{ padding: 12 }}>{error}</p>}
    </div>
  );
}
