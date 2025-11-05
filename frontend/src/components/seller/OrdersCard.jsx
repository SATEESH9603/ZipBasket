import React from "react";

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
              <div>{o?.date || "—"}</div>
              <div className={`pill pill--${(o?.status || "unknown").toLowerCase()}`}>{o?.status || "Unknown"}</div>
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
