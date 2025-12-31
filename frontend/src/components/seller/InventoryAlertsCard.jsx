import React from "react";
import { useNavigate } from "react-router-dom";

export default function InventoryAlertsCard({ products = [], onEditProduct }) {
  const navigate = useNavigate();
  const list = Array.isArray(products) ? products : [];
  // Use quantity (fallback to stock) and consider only active products
  const lowStock = list.filter(p => {
    const qty = Number(p?.quantity ?? p?.stock ?? 0);
    const active = (p?.isActive ?? p?.active ?? true) === true;
    return active && qty <= 5;
  });

  const handleRestock = (p) => {
    if (onEditProduct) return onEditProduct(p);
    const id = p?.id ?? p?.productId;
    navigate(`/seller/edit-product/${id}`);
  };

  return (
    <div className="card tips">
      <div className="card-head">
        <h3>Inventory Alerts</h3>
      </div>

      {lowStock.length ? (
        <ul className="alert-list">
          {lowStock.slice(0, 6).map((p, idx) => (
            <li key={p?.id ?? idx}>
              <span className="dot" />
              {p?.name || "Product"} — Stock: {Number(p?.quantity ?? p?.stock ?? 0)}
              <button className="tiny link" onClick={() => handleRestock(p)}>
                Restock
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty">No low-stock items. Nice! 🎉</p>
      )}
    </div>
  );
}