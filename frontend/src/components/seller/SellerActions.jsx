import React from "react";
import { useNavigate } from "react-router-dom";
import "../seller/SellerActions.css";

export default function SellerActions({
  token,
  onOpenQuickAdd,
  onExportProducts,
  onExportOrders,
}) {
  const navigate = useNavigate();

  return (
    <section className="seller-actions">
      <button className="cta" onClick={() => onOpenQuickAdd?.()}>
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
  );
}
