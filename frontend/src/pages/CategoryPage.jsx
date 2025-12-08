import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { getProducts, addToCart, addToWishlist } from "../services/api";
import "../pages/CategoryPage.css";
import { toast } from "react-toastify";

export default function CategoryPage({ user, token }) {
  const { categoryName } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page") || 1);
  const q = (searchParams.get("q") || "").trim();

  const [serverData, setServerData] = useState({
    products: [],
    page: pageFromUrl,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchInput, setSearchInput] = useState(q);

  const title = useMemo(
    () =>
      (categoryName || "PRODUCTS")
        .toString()
        .replace(/_/g, " ")
        .toUpperCase(),
    [categoryName]
  );

  useEffect(() => {
    let isMounted = true;

    async function run() {
      setLoading(true);
      setErr("");

      try {
        const data = await getProducts({
          page: pageFromUrl,
          category: categoryName,
          q,
        });

        const products = Array.isArray(data?.products) ? data.products : [];

        // Client-side category filter fallback
        const byCategory = products.filter(
          (p) => String(p.category || "").toUpperCase() === String(categoryName).toUpperCase()
        );

        // Client-side search fallback using q
        const query = q.toLowerCase();
        const bySearch = query
          ? byCategory.filter((p) =>
              String(p.name || "").toLowerCase().includes(query) ||
              String(p.sku || "").toLowerCase().includes(query)
            )
          : byCategory;

        if (isMounted) {
          setServerData({
            products: bySearch,
            page: data?.page ?? pageFromUrl,
            totalPages: data?.totalPages ?? 1,
            totalItems: data?.totalItems ?? bySearch.length,
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
  }, [categoryName, pageFromUrl, q]);

  const handlePageChange = (nextPage) => {
    setSearchParams((prev) => {
      const s = new URLSearchParams(prev);
      s.set("page", String(nextPage));
      return s;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams((prev) => {
      const s = new URLSearchParams(prev);
      if (searchInput) s.set("q", searchInput);
      else s.delete("q");
      s.set("page", "1");
      return s;
    });
  };

  const canAct = !!(user && token);

  const addCart = async (productId) => {
    if (!canAct) return toast.info("Login to add items to cart");
    try {
      await addToCart(user.username, productId, 1, token);
      toast.success("Added to cart");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to add to cart");
    }
  };

  const addWish = async (productId) => {
    if (!canAct) return toast.info("Login to manage wishlist");
    try {
      await addToWishlist(user.username, productId, token);
      toast.success("Added to wishlist");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to add to wishlist");
    }
  };

  return (
    <div className="category-page">
      <div className="category-page-header">
        <h2>{title}</h2>
        <Link to="/" className="back-link">← Back to Home</Link>
        <form className="search-bar" onSubmit={onSearchSubmit}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products…"
          />
          <button type="submit">Search</button>
        </form>
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
                    <div className="product-actions">
                      <button onClick={() => addCart(product.id)}>Add to Cart</button>
                      <button onClick={() => addWish(product.id)}>Add to Wishlist</button>
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