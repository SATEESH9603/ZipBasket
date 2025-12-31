import React, { useEffect, useState, useCallback } from "react";
import "./WishlistPage.css";
import { viewWishlist, removeFromWishlist, moveWishlistToCart, viewCart, getProductById, addToCart } from "../../services/api";
import { ASSET_BASE_URL } from "../../config";
import { toast } from "react-toastify";

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const PLACEHOLDER = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjAiIGhlaWdodD0iMTIwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmFmYmZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5YWEwYTYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSJTZWdvZSBVSSwgUm9ib3RvLCBzeXN0ZW0tdWksIC1hcHBsZS1zeXN0ZW0iPk5vIGltYWdlPC90ZXh0Pjwvc3ZnPg==";


export default function WishlistPage({ username, token }) {
  const [items, setItems] = useState([]);
  const [cartQtyMap, setCartQtyMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const normalizeSrc = (src) => {
    if (!src) return PLACEHOLDER;
    var s = String(src).trim().replace(/\\/g, "/");
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:")) return s;
    if (s.startsWith("/")) return ASSET_BASE_URL + s;
    if (s.startsWith("images/") || s.startsWith("files/") || s.startsWith("uploads/")) return ASSET_BASE_URL + "/" + s;
    return s;
  };

  const resolveImg = (item) => {
    const p = item && item.product ? item.product : {};
    const candidates = [
      Array.isArray(p.images) ? p.images[0] : null,
      p.primaryImage, p.imagePath, p.image, p.thumbnail,
      Array.isArray(p.imageUrls) ? p.imageUrls[0] : null,
      item && item.imageUrl ? item.imageUrl : null,
      item && item.thumbnailUrl ? item.thumbnailUrl : null,
      Array.isArray(item && item.images) ? item.images[0] : null,
      item && item.image ? item.image : null
    ].filter(Boolean);
    const src = candidates[0];
    const val = typeof src === "string" ? src : ((src && src.url) || (src && src.src) || "");
    return normalizeSrc(val);
  };

  const refreshWishlist = useCallback(async () => {
    const res = await viewWishlist(username, token);
    const raw =
      (Array.isArray(res && res.data && res.data.items) && res.data.items) ||
      (Array.isArray(res && res.items) && res.items) ||
      (Array.isArray(res && res.data && res.data.wishlist && res.data.wishlist.items) && res.data.wishlist.items) ||
      [];
    const enriched = await Promise.all(
      raw.map(async (it) => {
        if (!it.product && it.productId) {
          try {
            const pRes = await getProductById(it.productId, token);
            const product = (pRes && pRes.data && pRes.data.product) || pRes.product || null;
            return Object.assign({}, it, { product: product || null });
          } catch {
            return it;
          }
        }
        return it;
      })
    );
    setItems(enriched);
  }, [username, token]);

  const refreshCartQty = useCallback(async () => {
    const res = await viewCart(username, token);
    const cartItems =
      (Array.isArray(res && res.data && res.data.items) && res.data.items) ||
      (Array.isArray(res && res.items) && res.items) ||
      [];
    const map = new Map();
    for (var i = 0; i < cartItems.length; i++) {
      const ci = cartItems[i];
      const pid = (ci && ci.product && ci.product.id) || ci.productId || ci.id;
      const qty = Number(ci.quantity !== undefined ? ci.quantity : (ci.qty !== undefined ? ci.qty : 1));
      if (pid != null) map.set(pid, (map.get(pid) || 0) + qty);
    }
    setCartQtyMap(map);
  }, [username, token]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      await Promise.all([refreshWishlist(), refreshCartQty()]);
    } catch (e) {
      setErr("Failed to load wishlist");
      toast.error(e && e.message ? e.message : "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  }, [refreshWishlist, refreshCartQty]);

  useEffect(() => {
    let mounted = true;
    (async function() { if (mounted) await loadAll(); })();
    const onFocus = function() { loadAll(); };
    window.addEventListener("focus", onFocus);
    return function() { mounted = false; window.removeEventListener("focus", onFocus); };
  }, [loadAll]);

  async function removeItem(productId) {
    try {
      await removeFromWishlist(username, productId, token);
      await loadAll();
      toast.success("Removed from wishlist");
    } catch (e) {
      toast.error(e && e.message ? e.message : "Failed to remove from wishlist");
    }
  }

  async function moveToCart(productId) {
    try {
      await moveWishlistToCart(username, productId, token);
      await loadAll();
      toast.success("Added to cart");
    } catch (e) {
      toast.error(e && e.message ? e.message : "Failed to add to cart");
    }
  }

  const [moveQty, setMoveQty] = useState(1);

  // Move to cart with selected quantity: add to cart, then remove from wishlist
  async function moveToCartWithQty(productId, qty) {
    try {
      // Reserve and merge quantity via cart update flow
      await addToCart(username, productId, qty, token);
      // Remove from wishlist only after cart update succeeds
      await removeFromWishlist(username, productId, token);
      await loadAll();
      toast.success("Moved to cart");
    } catch (e) {
      toast.error(e && e.message ? e.message : "Failed to move to cart");
    }
  }

  if (loading) return <div className="wishlist-page"><p>Loading wishlist...</p></div>;
  if (err) return <div className="wishlist-page"><p className="error">{err}</p></div>;

  return (
    <div className="wishlist-page">
      <div className="wishlist-head">
        <h2>Wishlist</h2>
        <span className="wl-count">{items.length} items</span>
      </div>

      {items.length === 0 ? (
        <p>No items in wishlist.</p>
      ) : (
        <div className="wishlist-grid">
          {items.map((w, idx) => {
            const name = (w && w.product && w.product.name) || w.name || w.productName || "Item";
            const price = Number((w && w.product && w.product.price) !== undefined ? w.product.price : (w.price !== undefined ? w.price : (w.productPrice !== undefined ? w.productPrice : 0)));
            const pid = (w && w.product && w.product.id) || w.productId;
            const qtyInCart = pid != null ? (cartQtyMap.get(pid) || 0) : 0;
            return (
              <div key={pid || idx} className="wl-card">
                <img
                  className="wl-thumb"
                  src={resolveImg(w)}
                  alt={name}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                />
                <div className="wl-info">
                  <div className="wl-name">{name}</div>
                  <div className="wl-price-qty">
                    <span className="wl-price">{inr.format(price)}</span>
                    {qtyInCart > 0 ? <span className="wl-qty">In Cart: {qtyInCart}</span> : null}
                  </div>
                </div>
                <div className="wl-actions">
                  <div className="qty-controls">
                    <button className="btn btn-outline" onClick={() => setMoveQty(Math.max(1, moveQty - 1))}>-</button>
                    <input type="number" min="1" value={moveQty} readOnly />
                    <button className="btn btn-outline" onClick={() => setMoveQty(moveQty + 1)}>+</button>
                  </div>
                  <button className="btn btn-primary" onClick={() => moveToCartWithQty(pid, moveQty)}>Move to Cart</button>
                  <button className="btn btn-outline" onClick={() => removeItem(pid)}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
