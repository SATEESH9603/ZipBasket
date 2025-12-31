// ProductsCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

const toText = (v) => {
  if (v == null) return "—";
  if (v instanceof Date) return v.toLocaleString();
  if (typeof v === "object") {
    if (v.label) return String(v.label);
    if (v.name) return String(v.name);
    try { return JSON.stringify(v); } catch { return String(v); }
  }
  return String(v);
};

const stockFrom = (p) => {
  const candidates = [p?.stock, p?.quantity, p?.qty, p?.inventory?.stock, p?.inventory];
  const v = candidates.find((x) => x !== undefined && x !== null);
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const getImageUrl = (p) => {
  if (typeof p?.image === "string") return p.image;
  if (typeof p?.images === "string") return p.images;
  if (Array.isArray(p?.images)) {
    const first = p.images[0];
    if (typeof first === "string") return first;
    if (first?.url) return first.url;
    if (first?.src) return first.src;
  }
  if (p?.images?.url) return p.images.url;
  if (p?.images?.src) return p.images.src;
  if (typeof p?.images === "object" && p?.images?.base64) return p.images.base64;
  return "/placeholder.png";
};

const statusFrom = (p) => {
  if (p?.status) return String(p.status).toUpperCase();
  const on = (p?.active ?? p?.isActive) ? true : false;
  return on ? "ACTIVE" : "DRAFT";
};

const productIdOf = (p) => p?.productId ?? p?.id;

export default function ProductsCard({
  products = [],
  onAddProduct,
  onEditProduct,      // <- if provided, we'll use it; else fallback to route nav
  onViewProduct,
  onToggleListing,
  showManageAll = true,
}) {
  const navigate = useNavigate();

  return (
    <div className="card">
      <div className="card-head">
        <h3>Products</h3>
        <button className="tiny" onClick={() => onAddProduct?.()}>
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

          {products.slice(0, 8).map((p, idx) => {
            const img = getImageUrl(p);
            const price = Number(p?.price || 0);
            const stock = stockFrom(p);
            const pid = productIdOf(p);

            return (
              <div className="trow" key={p?.id ?? idx}>
                <div className="prod-cell">
                  <img src={img} alt={toText(p?.name || "Product")} className="prod-thumb" />
                  <div>
                    <div className="prod-name">{toText(p?.name)}</div>
                    <div className="prod-sku">{toText(p?.sku)}</div>
                  </div>
                </div>

                <div>{inr.format(price)}</div>
                <div className={stock <= 5 ? "warn" : ""}>{stock}</div>
                <div className={`pill pill--${statusFrom(p).toLowerCase()}`}>{statusFrom(p)}</div>

                <div className="row-actions">
                  <button onClick={() => onViewProduct ? onViewProduct(p) : navigate(`/seller/product/${pid}`, { state: { product: p } })}>
                    View
                  </button>
                  <button onClick={() => {
                      if (onEditProduct) {
                        onEditProduct(p);
                      } else {
                        navigate(`/seller/edit-product/${pid}`);
                      }
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="empty">No products yet.</p>
      )}

      {showManageAll && (
        <div className="card-foot">
          <button
            className="linklike"
            onClick={() => navigate('/seller/products')}
          >
            Manage all products →
          </button>
        </div>
      )}
    </div>
  );
}
