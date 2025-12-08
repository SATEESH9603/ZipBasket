import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./CartPage.css";
import { viewCart, updateCartItems } from "../../services/api";
import { toast } from "react-toastify";

// Use proper INR currency formatting to avoid '?' glyphs
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export default function CartPage({ username, token }) {
  const [data, setData] = useState({ items: [], subtotal: 0, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const navigate = useNavigate();

  const totals = useMemo(() => {
    const itemsCount = Array.isArray(data.items)
      ? data.items.reduce((sum, it) => sum + Number(it?.qty ?? it?.quantity ?? 1), 0)
      : 0;
    const subtotal = Array.isArray(data.items)
      ? data.items.reduce((sum, it) => sum + Number(it?.price ?? it?.amount ?? it?.unitPrice ?? 0) * Number(it?.qty ?? it?.quantity ?? 1), 0)
      : 0;
    const delivery = subtotal >= 500 ? 0 : (itemsCount ? 49 : 0);
    const total = subtotal + delivery;
    return { itemsCount, subtotal, delivery, total };
  }, [data.items]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const res = await viewCart(username, token);
        if (mounted) setData(res.data || {});
      } catch (e) {
        if (mounted) setErr("Failed to load cart");
        toast.error(e.response?.data?.message || "Failed to load cart");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [username, token]);

  async function updateItem(productId, quantity) {
    try {
      await updateCartItems(username, [{ productId, quantity }], token);
      const res = await viewCart(username, token);
      setData(res.data || {});
      toast.success("Cart updated");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to update cart");
    }
  }

  const resolveImg = (item) => {
    const src = (Array.isArray(item?.images) && item.images[0]) || item?.image || item?.product?.image || '/placeholder.png';
    if (!src) return '/placeholder.png';
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;
    // If backend serves relative file paths, prefix host
    return src.startsWith('/') ? `http://localhost:8080${src}` : src;
  };

  if (loading) return <div className="cart-page"><p>Loading cart…</p></div>;
  if (err) return <div className="cart-page"><p className="error">{err}</p></div>;

  return (
    <div className="cart-page">
      <div className="cart-card">
        <h2>Shopping Cart</h2>
        {Array.isArray(data.items) && data.items.length ? (
          <>
            <div className="cart-items">
              {data.items.map((item, idx) => {
                const price = Number(item?.price ?? item?.amount ?? item?.unitPrice ?? 0);
                const qty = Number(item?.qty ?? item?.quantity ?? 1);
                const subtotal = price * qty;
                const img = resolveImg(item);
                return (
                  <div className="cart-item-row" key={item?.id ?? idx}>
                    <img className="cart-thumb" src={img} alt={item?.name || 'Product'} loading="lazy"/>
                    <div>
                      <div className="cart-item-title">{item?.name || 'Product'}</div>
                      <div className="cart-item-meta">SKU: {item?.sku || '—'}</div>
                      <div className="cart-actions">
                        <button onClick={() => navigate(`/seller/product/${item?.id}`)}>View</button>
                        <button onClick={() => updateItem(item.productId, 0)}>Remove</button>
                      </div>
                    </div>
                    <div className="cart-qty">
                      <span>Qty</span>
                      <input type="number" min="1" value={qty} readOnly />
                    </div>
                    <div className="cart-price">{inr.format(subtotal)}</div>
                  </div>
                );
              })}
            </div>
            <div className="cart-footer-inline">
              <button className="clear-btn" onClick={() => setData({ items: [], subtotal: 0, totalItems: 0 })} disabled={!totals.itemsCount}>Clear Cart</button>
            </div>
            <div className="cart-summary">
              <div className="cart-summary-line"><span>Items</span><span>{totals.itemsCount}</span></div>
              <div className="cart-summary-line"><span>Subtotal</span><span>{inr.format(totals.subtotal)}</span></div>
              <div className="cart-summary-line"><span>Delivery</span><span>{totals.delivery ? inr.format(totals.delivery) : 'FREE'}</span></div>
              <div className="cart-total"><span>Order Total</span><span>{inr.format(totals.total)}</span></div>
              <button className="checkout-btn" onClick={() => navigate('/checkout')} disabled={!totals.itemsCount}>Proceed to Checkout</button>
            </div>
          </>
        ) : (
          <p style={{ padding: 16 }}>Your cart is empty.</p>
        )}
      </div>
    </div>
  );
}
