// src/routes/ViewProductRoute.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API, * as api from "../services/api"; // getProductById(id, token)
import { addToCart, addToWishlist } from "../services/api";
import { toast } from "react-toastify";
import "./ViewProductRoute.css";
import { ASSET_BASE_URL } from '../config';

const safeParse = (val) => {
  if (!val || typeof val !== "string") return null;
  try { return JSON.parse(val); } catch { return null; }
};

// Enhance image resolution: handle relative URLs and base prefix
// const BASE = 'http://localhost:8080';
const normalizeSrc = (src) => {
  if (!src) return '/placeholder.png';
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;
  // if (src.startsWith('/')) return `${BASE}${src}`;
  if (src.startsWith('/')) return `${ASSET_BASE_URL}${src}`;
  return src;
};

const imageListFrom = (p) => {
  const list = [];
  if (!p) return list;
  if (Array.isArray(p.images)) {
    for (const it of p.images) {
      const s = typeof it === 'string' ? it : (it?.url || it?.src);
      if (s) list.push(normalizeSrc(s));
    }
  } else if (typeof p.images === 'string') {
    list.push(normalizeSrc(p.images));
  }
  if (p?.image) list.push(normalizeSrc(p.image));
  if (Array.isArray(p?.imageUrls)) list.push(...p.imageUrls.map(normalizeSrc));
  return list.length ? list : ["/placeholder.png"];
};

const toINR = (v, c = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: c }).format(Number(v || 0));

export default function ViewProductRoute() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [product, setProduct] = useState(state?.product || null);
  const [loading, setLoading] = useState(!state?.product);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('auth_user') || 'null'); } catch { return null; }
  })();
  const token = localStorage.getItem('auth_token') || null;
  const username = storedUser?.username || null;
  const isAdmin = (storedUser?.role || '').toString().toUpperCase() === 'ADMIN';

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getProductById(productId, token);
        const p = res?.data?.product ?? res?.product ?? null;
        if (!ignore) setProduct(p);
      } catch (e) {
        if (!ignore) setError(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [productId, token]);

  const descObj = useMemo(() => safeParse(product?.description), [product]);
  const images = imageListFrom(product);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => { setActiveIdx(0); }, [productId]);

  const handleAddToCart = async () => {
    if (!username || !token || !product?.id) return toast.info('Please login to add items');
    try {
      setBusy(true);
      await addToCart(username, product.id, 1, token);
      toast.success('Added to cart');
    } catch (e) {
      toast.error(e?.message || 'Failed to add to cart');
    } finally {
      setBusy(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!username || !token || !product?.id) return toast.info('Please login to add to wishlist');
    try {
      setBusy(true);
      await addToWishlist(username, product.id, token);
      toast.success('Added to wishlist');
    } catch (e) {
      toast.error(e?.message || 'Failed to add to wishlist');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Loading product…</p>;
  if (error)   return <p style={{ padding: 40, color: "crimson" }}>Failed to load: {String(error?.message || error)}</p>;
  if (!product) return <p style={{ padding: 40 }}>Not found.</p>;

  return (
    <div className="product-view">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      {/* Left: gallery */}
      <div className="pv-gallery">
        <img className="pv-main-img" src={images[activeIdx]} alt={product.name || 'Product'} />
        <div className="pv-thumbs">
          {images.map((src, i) => (
            <div key={i} className="pv-thumb-item" onClick={() => setActiveIdx(i)}>
              <img src={src} alt={`thumb-${i}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Right: details */}
      <div className="pv-details">
        <h2 className="pv-title">{product.name}</h2>
        <div className="pv-meta-row">
          SKU: {product.sku || '—'} • Category: {product.category || '—'} • Status: {product.active ? 'ACTIVE' : 'DRAFT'}
        </div>
        <div className="pv-price">{toINR(product.price)}</div>
        <div className="pv-cta-row">
          <button className="pv-cta" onClick={handleAddToCart} disabled={busy}>Add to Cart</button>
          <button className="pv-cta secondary" onClick={handleAddToWishlist} disabled={busy}>Add to Wishlist</button>
          {isAdmin && (
            <button className="pv-cta secondary" onClick={() => navigate(`/seller/edit-product/${productId}`)}>Edit</button>
          )}
        </div>

        {descObj && (
          <div className="pv-specs">
            <h3>Specifications</h3>
            <table className="pv-spec-table">
              <tbody>
                {Object.entries(descObj).map(([k,v]) => (
                  <tr key={k}>
                    <td className="pv-spec-key">{k.replace(/_/g, ' ')}</td>
                    <td className="pv-spec-val">{Array.isArray(v) ? v.join(', ') : (typeof v === 'object' ? Object.entries(v).map(([ik, iv]) => `${ik}: ${Array.isArray(iv) ? iv.join(', ') : iv}`).join(' | ') : String(v ?? '—'))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
