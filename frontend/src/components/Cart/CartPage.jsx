import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./CartPage.css";
import { viewCart, updateCartItems } from "../../services/api";
import { toast } from "react-toastify";
import { ASSET_BASE_URL } from '../../config';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='120'><rect width='100%' height='100%' fill='%23fafbff'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239aa0a6' font-size='14' font-family='Segoe UI, Roboto, system-ui, -apple-system'>No image</text></svg>";

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
        toast.error(e?.message || "Failed to load cart");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [username, token]);

  function toCartUpdatePayload(currentItems, targetId, quantity) {
    const list = Array.isArray(currentItems) ? currentItems : [];
    const merged = list.map(it => {
      const pid = it?.productId ?? it?.id ?? it?.product?.id;
      const currentQty = Number(it?.qty ?? it?.quantity ?? 1);
      const q = pid === targetId ? quantity : currentQty;
      return { productId: pid, quantity: q };
    });
    if (!merged.some(it => it.productId === targetId) && quantity > 0) {
      merged.push({ productId: targetId, quantity });
    }
    return merged;
  }

  async function updateItem(productId, quantity) {
    try {
      const payload = toCartUpdatePayload(data.items, productId, quantity);
      await updateCartItems(username, payload, token);
      const res = await viewCart(username, token);
      setData(res.data || {});
      toast.success("Cart updated");
    } catch (e) {
      toast.error(e?.message || "Failed to update cart");
    }
  }

  async function setQuantity(productId, newQty) {
    if (newQty <= 0) return updateItem(productId, 0);
    try {
      const payload = toCartUpdatePayload(data.items, productId, newQty);
      await updateCartItems(username, payload, token);
      const res = await viewCart(username, token);
      setData(res.data || {});
      toast.success("Quantity updated");
    } catch (e) {
      toast.error(e?.message || "Failed to update quantity");
    }
  }

  // add a clearCart handler
  async function clearCart() {
    try {
      await updateCartItems(username, [], token);
      const res = await viewCart(username, token);
      setData(res.data || {});
      toast.success("Cart cleared");
    } catch (e) {
      toast.error(e?.message || "Failed to clear cart");
    }
  }

  const resolveImg = (item) => {
    const src = (Array.isArray(item?.images) && item.images[0]) || item?.image || item?.product?.image || PLACEHOLDER;
    const s = typeof src === 'string' ? src : (src?.url || src?.src || PLACEHOLDER);
    if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:')) return s;
    return s.startsWith('/') ? `${ASSET_BASE_URL}${s}` : s;
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
                const pid = item?.productId ?? item?.id ?? item?.product?.id;
                const qty = Number(item?.qty ?? item?.quantity ?? 1);
                const subtotal = price * qty;
                const img = resolveImg(item);
                return (
                  <div className="cart-item-row" key={pid ?? idx}>
                    <img className="cart-thumb" src={img} alt={item?.name || 'Product'} loading="lazy"/>
                    <div className="cart-info">
                      <div className="cart-item-title">{item?.name || 'Product'}</div>
                      <div className="cart-item-meta">SKU: {item?.sku || '—'}</div>
                      <div className="cart-actions">
                        <button className="btn btn-outline" onClick={() => navigate(`/seller/product/${pid}`)}>View</button>
                        <button className="btn btn-outline" onClick={() => updateItem(pid, 0)}>Remove</button>
                      </div>
                    </div>
                    <div className="cart-qty">
                      <span>Qty</span>
                      <div className="qty-controls">
                        <button className="btn btn-outline" onClick={() => setQuantity(pid, Math.max(1, qty - 1))}>-</button>
                        <input type="number" min="1" value={qty} readOnly />
                        <button className="btn btn-outline" onClick={() => setQuantity(pid, qty + 1)}>+</button>
                      </div>
                    </div>
                    <div className="cart-price">{inr.format(subtotal)}</div>
                  </div>
                );
              })}
            </div>
            <div className="cart-footer-inline">
              <button className="clear-btn btn btn-outline" onClick={clearCart} disabled={!totals.itemsCount}>Clear Cart</button>
            </div>
            <div className="cart-summary">
              <div className="cart-summary-line"><span>Items</span><span>{totals.itemsCount}</span></div>
              <div className="cart-summary-line"><span>Subtotal</span><span>{inr.format(totals.subtotal)}</span></div>
              <div className="cart-summary-line"><span>Delivery</span><span>{totals.delivery ? inr.format(totals.delivery) : 'FREE'}</span></div>
              <div className="cart-total"><span>Order Total</span><span>{inr.format(totals.total)}</span></div>
              <button className="checkout-btn btn btn-primary" onClick={() => navigate('/checkout')} disabled={!totals.itemsCount}>Proceed to Checkout</button>
            </div>
          </>
        ) : (
          <p style={{ padding: 16 }}>Your cart is empty.</p>
        )}
      </div>
    </div>
  );
}
