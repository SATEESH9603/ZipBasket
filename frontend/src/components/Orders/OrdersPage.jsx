import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./OrdersPage.css";
import { getOrders, cancelOrder, returnOrder } from "../../services/api";
import { toast } from "react-toastify";

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export default function OrdersPage({ username, token }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const normalizeOrders = (res) => {
    const raw = Array.isArray(res?.data?.orders) ? res.data.orders : Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return raw.map((o) => {
      // Resolve items array or count from multiple possible DTO shapes
      const itemsArr = Array.isArray(o.items)
        ? o.items
        : Array.isArray(o.orderItems)
          ? o.orderItems
          : Array.isArray(o.products)
            ? o.products
            : Array.isArray(o.itemsList)
              ? o.itemsList
              : [];
      // Some DTOs provide an items count field
      const itemsCountField = Number(
        o.itemsCount ?? o.totalItems ?? o.itemCount ?? o.items_length ?? o.itemsSize ?? 0
      );
      const itemsCount = itemsCountField || itemsArr.length;

      const date = o.orderDate || o.date || o.createdAt || o.placedAt || o.timestamp || '-';
      const total = Number(o.total ?? o.orderTotal ?? o.amount ?? 0);
      const id = o.id ?? o.orderId ?? o.number ?? o.orderNumber;
      const status = o.status ?? o.orderStatus ?? 'UNKNOWN';
      return { ...o, id, status, items: itemsArr, itemsCount, date, total };
    });
  };

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await getOrders(username, token);
      setOrders(normalizeOrders(res));
    } catch (e) {
      setErr("Failed to load orders");
      toast.error(e?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [username, token]);

  useEffect(() => {
    let mounted = true;
    (async () => { if (mounted) await load(); })();
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => { mounted = false; window.removeEventListener('focus', onFocus); };
  }, [load]);

  async function onCancel(orderId){
    try {
      await cancelOrder(username, orderId, token);
      toast.success("Order cancelled");
      await load();
    } catch (e) {
      toast.error(e?.message || "Failed to cancel order");
    }
  }

  async function onReturn(orderId){
    try {
      await returnOrder(username, orderId, token);
      toast.success("Return requested");
      await load();
    } catch (e) {
      toast.error(e?.message || "Failed to request return");
    }
  }

  if (loading) return <div className="orders-page"><p>Loading orders…</p></div>;
  if (err) return <div className="orders-page"><p className="error">{err}</p></div>;

  return (
    <div className="orders-page">
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((o) => (
            <div className="order-item" key={o.id}>
              <div className="order-left">
                <div className="order-id-status">
                  <span className="order-id">Order #{o.id}</span>
                  <span className={`order-status status--${String(o.status || 'UNKNOWN').toLowerCase()}`}>{o.status || 'Unknown'}</span>
                </div>
                <div className="order-meta">
                  <span>Items: {Number.isFinite(o.itemsCount) ? o.itemsCount : (Array.isArray(o.items) ? o.items.length : 0)}</span>
                  <span>Placed: {o.date || '-'}</span>
                </div>
              </div>
              <div className="order-right">
                <div className="order-total">{inr.format(Number(o.total || 0))}</div>
                <div className="order-actions">
                  <button className="btn btn-primary" onClick={() => navigate(`/orders/${o.id}`)}>View Details</button>
                  {String(o.status).toUpperCase() === 'PLACED' && (
                    <>
                      <button className="btn btn-outline" onClick={() => onCancel(o.id)}>Cancel</button>
                      <button className="btn btn-outline" onClick={() => onReturn(o.id)}>Return</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
