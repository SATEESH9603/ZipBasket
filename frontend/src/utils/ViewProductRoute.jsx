// src/routes/ViewProductRoute.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API, * as api from "../services/api"; // getProductById(id, token)
import "./ViewProductRoute.css";
const safeParse = (val) => {
  if (!val || typeof val !== "string") return null;
  try { return JSON.parse(val); } catch { return null; }
};
const imageFrom = (p) => {
  if (!p) return "/placeholder.png";
  if (typeof p.images === "string") return p.images;    // data URL or http
  if (typeof p.image === "string") return p.image;
  if (Array.isArray(p.images)) {
    const f = p.images[0];
    if (typeof f === "string") return f;
    if (f?.url) return f.url;
    if (f?.src) return f.src;
  }
  if (p?.images?.url) return p.images.url;
  if (p?.images?.src) return p.images.src;
  return "/placeholder.png";
};
const toINR = (v, c = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: c }).format(Number(v || 0));

export default function ViewProductRoute() {
  const { productId } = useParams();              // <-- must match your route
  const navigate = useNavigate();
  const { state } = useLocation();                // optional preloaded product
  const [product, setProduct] = useState(state?.product || null);
  const [loading, setLoading] = useState(!state?.product);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token"); // or your auth store
        // right before calling the API
        console.log("GET URL =>", API.getUri({ url: "/products/getProduct", params: { productId: productId } }));
        const res = await api.getProductById(productId, token);
        // backend: { success, product: {...} }
        const p = res?.data?.product ?? res?.product ?? null;
        if (!ignore) setProduct(p);
      } catch (e) {
        if (!ignore) setError(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [productId]);

  const descObj = useMemo(() => safeParse(product?.description), [product]);
  const metaObj = useMemo(() => safeParse(product?.metadata), [product]);
  const img = imageFrom(product);

  if (loading) return <p style={{ padding: 40 }}>Loading product…</p>;
  if (error)   return <p style={{ padding: 40, color: "crimson" }}>Failed to load: {String(error?.message || error)}</p>;
  if (!product) return <p style={{ padding: 40 }}>Not found.</p>;

  return (
    <div className="product-view">
  <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
  <h2>{product.name}</h2>

  <img
    src={img}
    alt={product.name || "Product"}
    className="pv-thumb"
  />

  <p><strong>SKU:</strong> {product.sku || "—"}</p>
  <p><strong>Price:</strong> ₹{product.price}</p>
  <p><strong>Quantity:</strong> {product.quantity ?? 0}</p>
  <p><strong>Category:</strong> {product.category || "—"}</p>
  <p><strong>Status:</strong> {product.active ? "ACTIVE" : "DRAFT"}</p>

  {descObj && (
    <>
      <h3>Specs</h3>
      <pre>{JSON.stringify(descObj, null, 2)}</pre>
    </>
  )}

  {metaObj && (
    <>
      <h3>Metadata</h3>
      <pre>{JSON.stringify(metaObj, null, 2)}</pre>
    </>
  )}

  <button className="cta" onClick={() => navigate(`/seller/edit-product/${productId}`)}>
    Edit Product
  </button>
</div>
  );
}
