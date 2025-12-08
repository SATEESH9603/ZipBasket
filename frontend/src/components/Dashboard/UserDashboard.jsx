import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';
import { getProducts } from '../../services/api';

export default function UserDashboard({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);

  // Initials: Firstname first letter + Lastname last letter
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

  // Load catalog sections using JWT from storage (no prop contract changes)
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    async function load() {
      setLoading(true);
      setError('');
      try {
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

  // Resolve product image from various fields
  const resolveImage = (p) => {
    const img = (Array.isArray(p?.images) && p.images[0])
      || p?.image
      || p?.thumbnail
      || (Array.isArray(p?.imageUrls) && p.imageUrls[0])
      || (typeof p?.images === 'string' ? p.images : null)
      || '/placeholder.png';
    return img;
  };

  const isAdmin = (user?.role || '').toString().toUpperCase() === 'ADMIN';

  const handleProductClick = (p) => {
    // Only admins can go to edit-product; others see product view
    if (isAdmin) {
      navigate(`/seller/edit-product/${p.id}`);
    } else {
      navigate(`/seller/product/${p.id}`);
    }
  };

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

        {loading && <p>Loading products…</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <>
            {/* Categories section */}
            <section className="dashboard-section">
              <h3>Categories</h3>
              <div className="dashboard-chips">
                {categories.length === 0 ? (
                  <span className="chip">No categories</span>
                ) : (
                  categories.map((c) => (
                    <button key={c.name} className="chip" onClick={() => navigate(`/category/${encodeURIComponent(c.name)}`)}>
                      {c.name} <span className="badge">{c.count}</span>
                    </button>
                  ))
                )}
              </div>
            </section>

            {/* Featured/New arrivals */}
            <section className="dashboard-section">
              <h3>New Arrivals</h3>
              <div className="product-grid">
                {(products || []).slice(0, 8).map((p) => (
                  <div className="product-card" key={p.id} onClick={() => handleProductClick(p)}>
                    <div className="thumb">
                      <img src={resolveImage(p)} alt={p.name || 'Product'} />
                    </div>
                    <div className="info">
                      <div className="name">{p.name}</div>
                      <div className="price">?{(p.price ?? 0).toString()}</div>
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