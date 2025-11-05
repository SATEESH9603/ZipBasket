import React from "react";
import { useNavigate } from "react-router-dom";

export default function InventoryAlertsCard({ products = [], onRestock }) {
  const navigate = useNavigate();
  const lowStock = Array.isArray(products) ? products.filter(p => Number(p?.stock || 0) <= 5) : [];

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
              {p?.name || "Product"} — Stock: {p?.stock ?? 0}
              <button className="tiny link" onClick={() => onRestock?.(p) || navigate(`/seller/products/${p?.id}/edit`)}>
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
 