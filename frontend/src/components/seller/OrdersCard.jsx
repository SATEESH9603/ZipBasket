import React from "react";

const formatDate = (d) => {
  try {
    if (!d) return "—";
    const dt = typeof d === "string" ? new Date(d) : d;
    if (!dt || isNaN(dt.getTime())) return "—";
    return dt.toLocaleString();
  } catch { return "—"; }
};

const statusClass = (s) => {
  const v = String(s || "unknown").toLowerCase();
  // map known statuses to pill variants
  if (v === "placed" || v === "processing") return `pill pill--info`;
  if (v === "cancelled") return `pill pill--warn`;
  if (v === "return_requested" || v === "returned") return `pill pill--neutral`;
  return `pill pill--default`;
};

export default function OrdersCard({
  orders = [],
  onViewAll,
  onViewOrder,
  onFulfill,
}) {
  return (
    <div className="card">
      <div className="card-head">
        <h3>Recent Orders</h3>
        <button className="tiny ghost" onClick={onViewAll}>View all</button>
      </div>

      {Array.isArray(orders) && orders.length > 0 ? (
        <div className="table">
          <div className="trow thead">
            <div>Order #</div>
            <div>Date</div>
            <div>Status</div>
            <div>Total</div>
            <div>Actions</div>
          </div>

          {orders.slice(0, 8).map((o, idx) => (
            <div className="trow" key={o?.id ?? idx}>
              <div>{o?.orderNumber || o?.id || "—"}</div>
              <div>{formatDate(o?.createdAt || o?.orderDate || o?.date)}</div>
              <div className={statusClass(o?.status)}>{o?.status || "Unknown"}</div>
              <div>₹{Number(o?.total || 0).toFixed(2)}</div>
              <div className="row-actions">
                <button onClick={() => onViewOrder?.(o?.id)}>View</button>
                <button onClick={() => onFulfill?.(o)}>Fulfill</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty">No recent orders.</p>
      )}
    </div>
  );
}
