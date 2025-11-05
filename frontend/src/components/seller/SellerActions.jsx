import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../seller/SellerActions.css";

export default function SellerActions({
  token,
  onOpenQuickAdd,
  onExportProducts,
  onExportOrders,
}) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="seller-actions">
      <div className="add-product-with-menu">
        <button
          className="cta"
          onClick={() => setMenuOpen(v => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          + Add Product
        </button>

        {menuOpen && (
          <div
            className="new-menu"
            role="menu"
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button role="menuitem" onClick={() => { setMenuOpen(false); onOpenQuickAdd?.(); }}>
              Quick add (modal)
            </button>
            <button
              role="menuitem"
              onClick={() => { setMenuOpen(false); navigate("/seller/products/new", { state: { token } }); }}
            >
              Open full page
            </button>
          </div>
        )}
      </div>

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
