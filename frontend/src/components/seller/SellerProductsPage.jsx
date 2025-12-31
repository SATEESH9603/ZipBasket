import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import * as api from "../../services/api";
import ProductsCard from "./ProductsCard";
import QuickAddModal from "./QuickAddModal";

export default function SellerProductsPage({ user, token }) {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getProducts({ page, token });
      const prods = Array.isArray(res?.products) ? res.products : (Array.isArray(res) ? res : []);
      setProducts(prods);
      setTotalPages(Number(res?.totalPages ?? 1));
    } catch (e) {
      setError(e?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, token]);

  useEffect(() => { load(); }, [load]);

  const handleAddProduct = async (payload) => {
    try {
      await api.createProduct(payload, token);
      toast.success("Product created");
      setShowAdd(false);
      await load();
    } catch (e) {
      toast.error(e?.message || "Failed to create product");
    }
  };

  const prevPage = () => setPage(p => Math.max(1, p - 1));
  const nextPage = () => setPage(p => Math.min(totalPages, p + 1));

  return (
    <div className="seller-page">
      <div className="card-head" style={{ justifyContent: 'space-between' }}>
        <h3>Manage Products</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="tiny" onClick={() => setShowAdd(true)}>+ New</button>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button className="tiny" onClick={prevPage} disabled={page <= 1}>Prev</button>
            <span>Page {page} / {totalPages}</span>
            <button className="tiny" onClick={nextPage} disabled={page >= totalPages}>Next</button>
          </div>
        </div>
      </div>

      {loading && <p style={{ padding: 12 }}>Loading...</p>}
      {error && <p className="error" style={{ padding: 12 }}>{error}</p>}

      <ProductsCard
        products={products}
        onAddProduct={() => setShowAdd(true)}
        onEditProduct={(p) => setShowAdd(true)}
        onViewProduct={() => {}}
        showManageAll={false}
      />

      <QuickAddModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        user={user}
        token={token}
        onSubmit={handleAddProduct}
        mode="create"
      />
    </div>
  );
}
