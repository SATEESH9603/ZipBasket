import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import * as api from "../../services/api";

export default function SellerOrdersPage({ user, token }) {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.getOrdersBySeller(user.id, token, page, size);
      // Support both wrapped and raw arrays
      const dto = res?.data;
      const items = Array.isArray(dto?.items) ? dto.items : (Array.isArray(dto) ? dto : []);
      setOrders(items);
      setTotalPages(Number(dto?.totalPages ?? totalPages));
    } catch (e) {
      setError(e?.message || "Failed to load orders");
      toast.error(e?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [user?.id, token, page, size, totalPages]);

  useEffect(() => { load(); }, [load]);

  const prevPage = () => setPage(p => Math.max(1, p - 1));
  const nextPage = () => setPage(p => Math.min(totalPages, p + 1));

  return (
    <div className="seller-page">
      <div className="card">
        <div className="card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>All Orders</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="tiny" onClick={prevPage} disabled={page <= 1}>Prev</button>
            <span>Page {page} / {totalPages}</span>
            <button className="tiny" onClick={nextPage} disabled={page >= totalPages}>Next</button>
          </div>
        </div>

        {loading && <p style={{ padding: 12 }}>Loading...</p>}
        {error && <p className="error" style={{ padding: 12 }}>{error}</p>}
        {!loading && !error && (
          <div className="table">
            <div className="trow thead">
              <div>Order #</div>
              <div>Date</div>
              <div>Status</div>
              <div>Total</div>
            </div>
            {orders.map((o, idx) => (
              <div key={o?.id ?? idx} className="trow">
                <div>{o?.id}</div>
                <div>{o?.createdAt ?? o?.orderDate ?? '-'}</div>
                <div>{o?.status}</div>
                <div>{o?.total}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
