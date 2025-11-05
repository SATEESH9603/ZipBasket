import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileView.css';

export default function ProfileView({
  user,
  token,
  onUpdateProfile,
  handleLogout,
  // NEW optional props (safe defaults)
  cart = [],
  orders = [],
  wishlist = [],
  onCartItemRemove,      // (item) => void
  onCartClear,           // () => void
  onAddWishlistToCart,   // (item) => void
  onWishlistRemove,      // (item) => void
}) {
  const [activeTab, setActiveTab] = useState('personal'); // personal | security | preferences | cart | orders | wishlist
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    username: user?.username || '',
    profileImage: user?.profileImage || null,
  });
  const [imagePreview, setImagePreview] = useState(user?.profileImage || '');
  const [loading, setLoading] = useState(false);

  // ---------- existing logic (unchanged) ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, profileImage: reader.result }));
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdateProfile(form);
      alert('Profile updated!');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  // -----------------------------------------------

  const navigate = useNavigate();

  // ---------- derived data for new tabs (non-breaking) ----------
  const cartTotal = Array.isArray(cart)
    ? cart.reduce((sum, it) => sum + (Number(it?.price) * Number(it?.qty ?? 1) || 0), 0)
    : 0;

  const cartCount = Array.isArray(cart)
    ? cart.reduce((sum, it) => sum + Number(it?.qty ?? 1), 0)
    : 0;

  const ordersCount = Array.isArray(orders) ? orders.length : 0;
  const wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0;
  // --------------------------------------------------------------

  return (
    <div className="profile-page">
      {/* LEFT SIDEBAR */}
      <aside className="profile-sidebar">
        {/* ===== PROFILE HEADER AREA (with icons) ===== */}
        <div className="profile-header-top">
          <div className="profile-image-wrapper">
            <img
              src={imagePreview || '/default-avatar.png'}
              alt="Profile"
              className="profile-image"
            />
            {/* keep existing upload control */}
            <label className="upload-label">
              Change Photo
              <input type="file" accept="image/*" onChange={handleImageChange} hidden />
            </label>
          </div>

          {/* Header icons next to profile image */}
          <div className="header-icons-bar">
            <div
              className="header-icon"
              title="Cart"
              onClick={() => setActiveTab('cart')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveTab('cart')}
            >
              🛒<span>{cartCount}</span>
            </div>
            <div
              className="header-icon"
              title="Orders"
              onClick={() => setActiveTab('orders')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveTab('orders')}
            >
              📦<span>{ordersCount}</span>
            </div>
            <div
              className="header-icon"
              title="Wishlist"
              onClick={() => setActiveTab('wishlist')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveTab('wishlist')}
            >
              💖<span>{wishlistCount}</span>
            </div>
          </div>
        </div>
        {/* ===== END PROFILE HEADER AREA ===== */}

        {/* NEW: Quick stats */}
        <div className="quick-stats">
          <div className="stat">
            <span className="stat-label">Cart</span>
            <span className="stat-value">{cartCount}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Orders</span>
            <span className="stat-value">{ordersCount}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Wishlist</span>
            <span className="stat-value">{wishlistCount}</span>
          </div>
        </div>

        <div className="quick-actions">
          <button
            onClick={() => {
              handleLogout?.();
              navigate('/'); // redirect to login page
            }}>
            Logout
          </button>

        <button onClick={() => navigate('/dashboard')}>Dashboard</button>

          {/* quick links */}
          <button onClick={() => setActiveTab('cart')}>Go to Cart</button>
          <button onClick={() => setActiveTab('orders')}>My Orders</button>
          <button onClick={() => setActiveTab('wishlist')}>Wishlist</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="profile-main">
        {/* (Removed previous inner header to avoid duplication) */}

        <h2>Account Settings</h2>

        {/* TABS */}
        <div className="profile-tabs">
          <button
            className={activeTab === 'personal' ? 'active' : ''}
            onClick={() => setActiveTab('personal')}
          >
            Personal Info
          </button>
          <button
            className={activeTab === 'security' ? 'active' : ''}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button
            className={activeTab === 'preferences' ? 'active' : ''}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>

          {/* NEW tabs */}
          <button
            className={activeTab === 'cart' ? 'active' : ''}
            onClick={() => setActiveTab('cart')}
          >
            Cart
          </button>
          <button
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button
            className={activeTab === 'wishlist' ? 'active' : ''}
            onClick={() => setActiveTab('wishlist')}
          >
            Wishlist
          </button>
        </div>

        {/* TAB CONTENTS - Existing (unchanged) */}
        {activeTab === 'personal' && (
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="name-fields">
              <div>
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <label>Username</label>
            <input type="text" name="username" value={form.username} disabled />

            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {activeTab === 'security' && (
          <div className="password-section">
            <h3>Change Password</h3>
            <button
              className="update-password-btn"
              onClick={() => navigate('/reset-password', { state: { token } })}
            >
              Reset Password
            </button>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="preferences-section">
            <h3>Preferences</h3>
            <label>
              <input type="checkbox" /> Enable dark mode
            </label>
            <label>
              <input type="checkbox" /> Receive email notifications
            </label>
          </div>
        )}

        {/* CART TAB */}
        {activeTab === 'cart' && (
          <div className="cart-section">
            <div className="cart-header">
              <h3>My Cart</h3>
              <div className="cart-summary">
                <span>Items: {cartCount}</span>
                <span>Total: ₹{cartTotal.toFixed(2)}</span>
                <button
                  className="cart-clear"
                  onClick={() => onCartClear?.()}
                  disabled={!cartCount}
                  title="Clear cart"
                >
                  Clear
                </button>
              </div>
            </div>

            {Array.isArray(cart) && cart.length > 0 ? (
              <div className="cart-table">
                <div className="cart-row cart-row--head">
                  <div>Product</div>
                  <div>Price</div>
                  <div>Qty</div>
                  <div>Subtotal</div>
                  <div>Actions</div>
                </div>
                {cart.map((item, idx) => {
                  const price = Number(item?.price) || 0;
                  const qty = Number(item?.qty ?? 1);
                  const subtotal = price * qty;
                  return (
                    <div key={item?.id ?? idx} className="cart-row">
                      <div className="cart-col cart-col--product">
                        <img
                          src={item?.image || '/placeholder.png'}
                          alt={item?.name || 'Product'}
                          className="cart-thumb"
                        />
                        <div>
                          <div className="cart-name">{item?.name || 'Product'}</div>
                          <div className="cart-sku">{item?.sku || ''}</div>
                        </div>
                      </div>
                      <div>₹{price.toFixed(2)}</div>
                      <div>{qty}</div>
                      <div>₹{subtotal.toFixed(2)}</div>
                      <div className="cart-actions">
                        <button onClick={() => navigate(`/products/${item?.id}`)}>View</button>
                        <button onClick={() => onCartItemRemove?.(item)}>Remove</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="empty-hint">Your cart is empty.</p>
            )}

            <div className="cart-footer">
              <button
                className="checkout-btn"
                onClick={() => navigate('/checkout', { state: { token } })}
                disabled={!cartCount}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="orders-section">
            <h3>My Orders</h3>
            {Array.isArray(orders) && orders.length > 0 ? (
              <div className="orders-list">
                {orders.map((o, idx) => (
                  <div key={o?.id ?? idx} className="order-card">
                    <div className="order-head">
                      <div><strong>Order #</strong> {o?.orderNumber || o?.id || '-'}</div>
                      <div className={`order-status status--${(o?.status || 'unknown').toLowerCase()}`}>
                        {o?.status || 'Unknown'}
                      </div>
                    </div>
                    <div className="order-body">
                      <div><strong>Date:</strong> {o?.date || '-'}</div>
                      <div><strong>Items:</strong> {o?.items?.length ?? 0}</div>
                      <div><strong>Total:</strong> ₹{Number(o?.total || 0).toFixed(2)}</div>
                    </div>
                    <div className="order-actions">
                      <button onClick={() => navigate(`/orders/${o?.id}`)}>View Details</button>
                      {o?.invoiceUrl && (
                        <button onClick={() => window.open(o.invoiceUrl, '_blank')}>Invoice</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-hint">No orders yet.</p>
            )}
          </div>
        )}

        {/* WISHLIST TAB */}
        {activeTab === 'wishlist' && (
          <div className="wishlist-section">
            <h3>My Wishlist</h3>
            {Array.isArray(wishlist) && wishlist.length > 0 ? (
              <div className="wishlist-grid">
                {wishlist.map((w, idx) => (
                  <div key={w?.id ?? idx} className="wish-card">
                    <img
                      src={w?.image || '/placeholder.png'}
                      alt={w?.name || 'Wishlist item'}
                      className="wish-thumb"
                    />
                    <div className="wish-info">
                      <div className="wish-name">{w?.name || 'Item'}</div>
                      <div className="wish-price">₹{Number(w?.price || 0).toFixed(2)}</div>
                    </div>
                    <div className="wish-actions">
                      <button onClick={() => navigate(`/products/${w?.id}`)}>View</button>
                      <button onClick={() => onAddWishlistToCart?.(w)}>Add to Cart</button>
                      <button onClick={() => onWishlistRemove?.(w)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-hint">Your wishlist is empty.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
