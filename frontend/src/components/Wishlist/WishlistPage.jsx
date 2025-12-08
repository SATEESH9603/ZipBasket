import React, { useEffect, useState } from "react";
import "./WishlistPage.css";
import { viewWishlist, removeFromWishlist, moveWishlistToCart } from "../../services/api";
import { toast } from "react-toastify";

export default function WishlistPage({ username, token }) {
  const [data, setData] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const res = await viewWishlist(username, token);
        if (mounted) setData(res.data || {});
      } catch (e) {
        if (mounted) setErr("Failed to load wishlist");
        toast.error(e.response?.data?.message || "Failed to load wishlist");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [username, token]);

  async function removeItem(productId) {
    try {
      await removeFromWishlist(username, productId, token);
      const res = await viewWishlist(username, token);
      setData(res.data || {});
      toast.success("Removed from wishlist");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to remove from wishlist");
    }
  }

  async function moveToCart(productId) {
    try {
      await moveWishlistToCart(username, productId, token);
      const res = await viewWishlist(username, token);
      setData(res.data || {});
      toast.success("Moved to cart");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to move to cart");
    }
  }

  if (loading) return <div className="wishlist-page"><p>Loading wishlist…</p></div>;
  if (err) return <div className="wishlist-page"><p className="error">{err}</p></div>;

  return (
    <div className="wishlist-page">
      <h2>Your Wishlist</h2>
      {(!data.items || data.items.length === 0) ? (
        <p>No items in wishlist.</p>
      ) : (
        <div className="wishlist-list">
          {data.items.map(item => (
            <div className="wl-item" key={item.productId}>
              <div className="wl-info">
                <h4>{item.name}</h4>
                <p>Price: {item.price}</p>
              </div>
              <div className="wl-actions">
                <button onClick={() => moveToCart(item.productId)}>Move to Cart</button>
                <button onClick={() => removeItem(item.productId)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
