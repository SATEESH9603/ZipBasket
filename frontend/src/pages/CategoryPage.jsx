import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { getProducts } from "../services/api";
import "../pages/CategoryPage.css";

export default function CategoryPage() {
  const { categoryName } = useParams(); // e.g., "ELECTRONICS"
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page") || 1);

  const [serverData, setServerData] = useState({
    products: [],
    page: pageFromUrl,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const title = useMemo(
    () =>
      categoryName
        ?.toString()
        .replace(/_/g, " ")
        .toUpperCase() || "PRODUCTS",
    [categoryName]
  );

  useEffect(() => {
    let isMounted = true;

    async function run() {
      setLoading(true);
      setErr("");

      try {
        // Try server-side filtering first (if the backend supports ?category=)
        const data = await getProducts({
          page: pageFromUrl,
          category: categoryName, // harmless if backend ignores it
        });

        // If backend ignores category, fall back to client-side filter:
        const products =
          Array.isArray(data?.products) ? data.products : [];

        const clientFiltered = products.filter(
          (p) => String(p.category || "").toUpperCase() === String(categoryName).toUpperCase()
        );

        // Heuristic: if server already filtered, clientFiltered length ~ products length.
        // Use clientFiltered so it works in both cases.
        if (isMounted) {
          setServerData({
            products: clientFiltered,
            page: data?.page ?? pageFromUrl,
            totalPages: data?.totalPages ?? 1,
            totalItems: data?.totalItems ?? clientFiltered.length,
          });
        }
      } catch (e) {
        console.error(e);
        if (isMounted) setErr("Failed to load products. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    run();
    return () => {
      isMounted = false;
    };
  }, [categoryName, pageFromUrl]);

  const handlePageChange = (nextPage) => {
    setSearchParams((prev) => {
      const s = new URLSearchParams(prev);
      s.set("page", String(nextPage));
      return s;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="category-page">
      <div className="category-page-header">
        <h2>{title}</h2>
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>

      {loading && <p>Loading products…</p>}
      {err && <p className="error">{err}</p>}

      {!loading && !err && (
        <>
          {serverData.products.length === 0 ? (
            <p>No products found in this category.</p>
          ) : (
            <div className="product-grid">
              {serverData.products.map((product) => (
                <div className="product-card" key={product.id}>
                  <img
                    src={
                      product.images && product.images.trim()
                        ? product.images
                        : "https://via.placeholder.com/300x200?text=No+Image"
                    }
                    alt={product.name}
                    className="product-img"
                  />
                  <div className="product-body">
                    <h4 className="product-title">{product.name}</h4>
                    <div className="product-meta">
                      <span className="price">
                        {product.currency === "INR" ? "₹" : ""}
                        {Number(product.price).toLocaleString("en-IN")}
                      </span>
                      {product.sku && <small className="sku">SKU: {product.sku}</small>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pagination">
            <button
              disabled={serverData.page <= 1}
              onClick={() => handlePageChange(serverData.page - 1)}
            >
              Prev
            </button>
            <span>
              Page {serverData.page} of {serverData.totalPages}
            </span>
            <button
              disabled={serverData.page >= serverData.totalPages}
              onClick={() => handlePageChange(serverData.page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}