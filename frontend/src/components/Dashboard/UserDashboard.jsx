import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';
import { getProducts } from '../../services/api';
import { ASSET_BASE_URL } from '../../config';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export default function UserDashboard({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.slice(-1) || ''}`.toUpperCase();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    async function load() {
      setLoading(true);
      setError('');
      try {
        // Server filters IN_STOCK by default via getProducts default filter
        const data = await getProducts({ page: 1, token });
        const list = Array.isArray(data?.products) ? data.products : (Array.isArray(data) ? data : []);
        setProducts(list);
      } catch (e) {
        setError(e?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = React.useMemo(() => {
    const map = new Map();
    for (const p of products) {
      const c = (p?.category || 'Uncategorized').toString();
      map.set(c, (map.get(c) || 0) + 1);
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [products]);

  const resolveImage = (p) => {
    const img = (Array.isArray(p?.images) && p.images[0])
      || p?.image
      || p?.thumbnail
      || (Array.isArray(p?.imageUrls) && p.imageUrls[0])
      || (typeof p?.images === 'string' ? p.images : null)
      || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="100%" height="100%" fill="%23fafbff"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239aa0a6" font-size="14" font-family="Segoe UI, Roboto, system-ui, -apple-system">No image</text></svg>';
    if (typeof img === 'string') return img.startsWith('/') ? `${ASSET_BASE_URL}${img}` : img;
    return img?.url || img?.src || '';
  };

  const isAdmin = (user?.role || '').toString().toUpperCase() === 'ADMIN';

  const handleProductClick = (p) => {
    const id = p?.id || p?.productId;
    if (!id) return;
    if (isAdmin) {
      navigate(`/seller/edit-product/${id}`);
    } else {
      navigate(`/seller/product/${id}`);
    }
  };

  // Use products directly; server already filters to IN_STOCK by default
  const visibleProducts = products || [];

  // Prebuild category chips to avoid nested JSX parsing quirks
  const categoryChips = React.useMemo(() => {
    if (categories.length === 0) {
      return <span className="chip">No categories</span>;
    }
    return categories.map((c) => (
      <button key={c.name} className="chip" onClick={() => navigate(`/category/${encodeURIComponent(c.name)}`)}>
        {c.name} <span className="badge">{c.count}</span>
      </button>
    ));
  }, [categories, navigate]);

  return (
    <div>
      <div ref={dropdownRef} className="fixed-avatar-container" onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}>
        <div
          className="user-avatar"
          title={`${user?.firstName} ${user?.lastName}`}
        >
          {user?.profileImage ? (
            <img src={user.profileImage} alt="User Avatar" className="avatar-img" />
          ) : (
            initials
          )}
        </div>
        {open && (
          <div className="user-dropdown">
            <div
              className="user-dropdown-option"
              onClick={() => navigate('/profile')}
            >
              Profile View
            </div>
            <div
              className="user-dropdown-option logout"
              onClick={onLogout}
            >
              Logout
            </div>
          </div>
        )}
      </div>

      <div className="user-dashboard-content">
        <h2>Welcome, {user?.firstName || 'User'}!</h2>
        <p>Your personalized home.</p>

        {loading && <p>Loading products...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <>
            <section className="dashboard-section">
              <h3>Categories</h3>
              <div className="dashboard-chips">
                {categoryChips}
              </div>
            </section>

            <section className="dashboard-section">
              <h3>New Arrivals</h3>
              <div className="product-grid">
                {visibleProducts.slice(0, 8).map((p) => (
                  <div className="product-card" key={p.id || p.productId} onClick={() => handleProductClick(p)}>
                    <div className="thumb">
                      <img src={resolveImage(p)} alt={p.name || 'Product'} />
                    </div>
                    <div className="info">
                      <div className="name">{p.name}</div>
                      <div className="price">{inr.format(Number(p.price || 0))}</div>
                      {p.sellerName && (
                        <div className="seller-line">Sold by: {p.sellerName}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}