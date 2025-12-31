import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getOrderDetail } from "../../services/api";

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export default function OrderDetailPage({ username, token }) {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getOrderDetail(username, orderId, token);
        const o = res?.data || res;
        if (!o || !o?.id) {
          toast.error("Order not found");
        }
        setOrder(o);
      } catch (e) {
        toast.error(e?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderId, username, token]);

  if (loading) return <div className="orders-page"><p>Loading order…</p></div>;
  if (!order) return <div className="orders-page"><p className="error">Order not found</p></div>;

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="orders-page">
      <div className="order-id-status" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Order #{orderId}</h2>
        <button className="btn btn-outline" onClick={() => navigate('/orders')}>Back</button>
      </div>
      <p>Status: {order.status}</p>
      <p>Total: {inr.format(Number(order.total || 0))}</p>
      <div className="orders-list">
        {items.length === 0 ? (
          <p>No items in this order.</p>
        ) : (
          items.map((it, idx) => (
            <div className="order-item" key={idx}>
              <div className="order-left">
                <div className="order-id-status">
                  <span className="order-id">{it.productName || it.name || it.product?.name || 'Item'}</span>
                </div>
                <div className="order-meta">
                  <span>Quantity: {it.quantity ?? it.qty ?? 1}</span>
                </div>
              </div>
              <div className="order-right">
                <div className="order-total">{inr.format(Number(it.unitPrice ?? it.price ?? 0))}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
