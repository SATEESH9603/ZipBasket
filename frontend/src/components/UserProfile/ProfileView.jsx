import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileView.css';
import { viewCart, getOrders, viewWishlist } from '../../services/api';

export default function ProfileView({
  user,
  token,
  onUpdateProfile,
  handleLogout,
  cart = [],
  orders = [],
  wishlist = [],
  onCartItemRemove,
  onCartClear,
  onAddWishlistToCart,
  onWishlistRemove,
}) {
  const [activeTab, setActiveTab] = useState('personal');
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    username: user?.username || '',
    profileImage: user?.profileImage || null,
  });
  const [imagePreview, setImagePreview] = useState(user?.profileImage || '');
  const [loading, setLoading] = useState(false);

  // Header counts state
  const [cartCountState, setCartCountState] = useState(0);
  const [ordersCountState, setOrdersCountState] = useState(0);
  const [wishlistCountState, setWishlistCountState] = useState(0);

  // Tab data state
  const [cartItemsState, setCartItemsState] = useState([]);
  const [ordersListState, setOrdersListState] = useState([]);
  const [wishlistItemsState, setWishlistItemsState] = useState([]);

  const navigate = useNavigate();

  const getAuth = () => {
    const u = user?.username || (() => { try { return JSON.parse(localStorage.getItem('auth_user')||'{}').username; } catch { return null; } })();
    const t = token || localStorage.getItem('auth_token');
    return { u, t };
  };

  const fetchCounts = async () => {
    const { u, t } = getAuth();
    if (!u || !t) return;
    try {
      const cartRes = await viewCart(u, t);
      const cartItems = Array.isArray(cartRes?.data?.items) ? cartRes.data.items : Array.isArray(cartRes?.items) ? cartRes.items : [];
      setCartCountState(cartItems.reduce((sum, it) => sum + Number(it?.quantity ?? it?.qty ?? 1), 0));

      const ordersRes = await getOrders(u, t);
      const orderList = Array.isArray(ordersRes?.data?.orders) ? ordersRes.data.orders : Array.isArray(ordersRes?.data) ? ordersRes.data : Array.isArray(ordersRes?.orders) ? ordersRes.orders : [];
      setOrdersCountState(orderList.length);

      const wishRes = await viewWishlist(u, t);
      const wishItems = Array.isArray(wishRes?.data?.items) ? wishRes.data.items : Array.isArray(wishRes?.items) ? wishRes.items : [];
      setWishlistCountState(wishItems.length);
    } catch {}
  };

  useEffect(() => {
    fetchCounts();
    const onFocus = () => fetchCounts();
    const onVis = () => { if (document.visibilityState === 'visible') fetchCounts(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.username, token]);

  // Lazy-load tab data
  useEffect(() => {
    const { u, t } = getAuth();
    if (!u || !t) return;
    (async () => {
      try {
        if (activeTab === 'cart') {
          const cartRes = await viewCart(u, t);
          const items = Array.isArray(cartRes?.data?.items) ? cartRes.data.items : Array.isArray(cartRes?.items) ? cartRes.items : [];
          setCartItemsState(items);
        } else if (activeTab === 'orders') {
          const ordersRes = await getOrders(u, t);
          const list = Array.isArray(ordersRes?.data?.orders) ? ordersRes.data.orders : Array.isArray(ordersRes?.data) ? ordersRes.data : Array.isArray(ordersRes?.orders) ? ordersRes.orders : [];
          setOrdersListState(list);
        } else if (activeTab === 'wishlist') {
          const wishRes = await viewWishlist(u, t);
          const items = Array.isArray(wishRes?.data?.items) ? wishRes.data.items : Array.isArray(wishRes?.items) ? wishRes.items : [];
          setWishlistItemsState(items);
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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

  const cartTotal = Array.isArray(cartItemsState) && cartItemsState.length
    ? cartItemsState.reduce((sum, it) => sum + Number(it?.product?.price || 0) * Number(it?.quantity ?? it?.qty ?? 1), 0)
    : Array.isArray(cart)
      ? cart.reduce((sum, it) => sum + (Number(it?.price) * Number(it?.qty ?? 1) || 0), 0)
      : 0;

  const cartCount = Array.isArray(cartItemsState) && cartItemsState.length
    ? cartItemsState.reduce((sum, it) => sum + Number(it?.quantity ?? it?.qty ?? 1), 0)
    : Array.isArray(cart)
      ? cart.reduce((sum, it) => sum + Number(it?.qty ?? 1), 0)
      : cartCountState;

  const ordersCount = Array.isArray(ordersListState) && ordersListState.length ? ordersListState.length : ordersCountState;
  const wishlistCount = Array.isArray(wishlistItemsState) && wishlistItemsState.length ? wishlistItemsState.length : wishlistCountState;

  // Helper to resolve wishlist image path
  const resolveWishImg = (w) => {
    const src = (Array.isArray(w?.product?.images) && w.product.images[0]) || w?.product?.image || w?.image || '/placeholder.png';
    if (!src) return '/placeholder.png';
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;
    return src.startsWith('/') ? `http://localhost:8080${src}` : src;
  };

  // Helper to resolve cart item price and quantity safely
  const getCartItemPrice = (ci) => {
    const p = ci?.product;
    const price = p?.price ?? p?.unitPrice ?? p?.amount ?? ci?.price;
    return Number(price || 0);
  };
  const getCartItemQty = (ci) => Number(ci?.quantity ?? ci?.qty ?? 1);

  return (
    <div className="profile-page">
      <aside className="profile-sidebar">
        <div className="profile-header-top">
          <div className="profile-image-wrapper">
            <img src={imagePreview || '/default-avatar.png'} alt="Profile" className="profile-image" />
            <label className="upload-label">
              Change Photo
              <input type="file" accept="image/*" onChange={handleImageChange} hidden />
            </label>
          </div>

          <div className="header-icons-bar">
            <div className="header-icon" title="Cart" role="button" tabIndex={0}
              onClick={() => navigate('/cart', { replace: true })}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/cart', { replace: true })}
            >
              🛒<span>{cartCount}</span>
            </div>
            <div className="header-icon" title="Orders" role="button" tabIndex={0}
              onClick={() => navigate('/orders', { replace: true })}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/orders', { replace: true })}
            >
              📦<span>{ordersCount}</span>
            </div>
            <div className="header-icon" title="Wishlist" role="button" tabIndex={0}
              onClick={() => navigate('/wishlist', { replace: true })}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/wishlist', { replace: true })}
            >
              💖<span>{wishlistCount}</span>
            </div>
          </div>
        </div>

        <div className="quick-stats">
          <div className="stat"><span className="stat-label">Cart</span><span className="stat-value">{cartCount}</span></div>
          <div className="stat"><span className="stat-label">Orders</span><span className="stat-value">{ordersCount}</span></div>
          <div className="stat"><span className="stat-label">Wishlist</span><span className="stat-value">{wishlistCount}</span></div>
        </div>

        <div className="quick-actions">
          <button onClick={() => { handleLogout?.(); navigate('/', { replace: true }); }}>Logout</button>
          <button onClick={() => navigate('/dashboard', { replace: true })}>Dashboard</button>
          <button onClick={() => navigate('/cart', { replace: true })}>Go to Cart</button>
          <button onClick={() => navigate('/orders', { replace: true })}>My Orders</button>
          <button onClick={() => navigate('/wishlist', { replace: true })}>Wishlist</button>
          <button onClick={() => navigate('/addresses', { replace: true })}>Manage Addresses</button>
        </div>
      </aside>

      <main className="profile-main">
        <h2>Account Settings</h2>
        <div className="profile-tabs">
          <button className={activeTab === 'personal' ? 'active' : ''} onClick={() => setActiveTab('personal')}>Personal Info</button>
          <button className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>Security</button>
          <button className={activeTab === 'preferences' ? 'active' : ''} onClick={() => setActiveTab('preferences')}>Preferences</button>
          <button className={activeTab === 'cart' ? 'active' : ''} onClick={() => setActiveTab('cart')}>Cart</button>
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>Orders</button>
          <button className={activeTab === 'wishlist' ? 'active' : ''} onClick={() => setActiveTab('wishlist')}>Wishlist</button>
        </div>

        {activeTab === 'personal' && (
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="name-fields">
              <div>
                <label>First Name</label>
                <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required />
              </div>
              <div>
                <label>Last Name</label>
                <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required />
              </div>
            </div>
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
            <label>Username</label>
            <input type="text" name="username" value={form.username} disabled />
            <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
          </form>
        )}

        {activeTab === 'security' && (
          <div className="password-section">
            <h3>Change Password</h3>
            <button className="update-password-btn" onClick={() => navigate('/reset-password', { state: { token } })}>Reset Password</button>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="preferences-section">
            <h3>Preferences</h3>
            <label><input type="checkbox" /> Enable dark mode</label>
            <label><input type="checkbox" /> Receive email notifications</label>
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="cart-section">
            <div className="cart-header">
              <h3>My Cart</h3>
              <div className="cart-summary">
                <span>Items: {cartCount}</span>
                <span>Total: ₹{Number(cartTotal).toFixed(2)}</span>
                <button className="cart-clear" onClick={() => onCartClear?.()} disabled={!cartCount} title="Clear cart">Clear</button>
              </div>
            </div>

            {Array.isArray(cartItemsState) && cartItemsState.length > 0 ? (
              <div className="cart-table">
                <div className="cart-row cart-row--head">
                  <div>Product</div>
                  <div>Price</div>
                  <div>Qty</div>
                  <div>Subtotal</div>
                  <div>Actions</div>
                </div>
                {cartItemsState.map((ci, idx) => {
                  const price = getCartItemPrice(ci);
                  const qty = getCartItemQty(ci);
                  const subtotal = price * qty;
                  const img = (ci?.product?.images && ci.product.images[0]) || ci?.product?.image || '/placeholder.png';
                  return (
                    <div key={ci?.product?.id ?? idx} className="cart-row">
                      <div className="cart-col cart-col--product">
                        <img src={img} alt={ci?.product?.name || 'Product'} className="cart-thumb" />
                        <div>
                          <div className="cart-name">{ci?.product?.name || 'Product'}</div>
                          <div className="cart-sku">{ci?.product?.sku || ''}</div>
                        </div>
                      </div>
                      <div>₹{price.toFixed(2)}</div>
                      <div>{qty}</div>
                      <div>₹{subtotal.toFixed(2)}</div>
                      <div className="cart-actions">
                        <button onClick={() => navigate(`/seller/product/${ci?.product?.id}`)}>View</button>
                        <button onClick={() => onCartItemRemove?.(ci)}>Remove</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="empty-hint">Your cart is empty.</p>
            )}

            <div className="cart-footer">
              <button className="checkout-btn" onClick={() => navigate('/checkout', { state: { token } })} disabled={!cartCount}>Proceed to Checkout</button>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-section">
            <h3>My Orders</h3>
            {Array.isArray(ordersListState) && ordersListState.length > 0 ? (
              <div className="orders-list">
                {ordersListState.map((o, idx) => (
                  <div key={o?.id ?? idx} className="order-card">
                    <div className="order-head">
                      <div><strong>Order #</strong> {o?.id || '-'}</div>
                      <div className={`order-status status--${(o?.status || 'unknown').toLowerCase()}`}>{o?.status || 'Unknown'}</div>
                    </div>
                    <div className="order-body">
                      <div><strong>Items:</strong> {o?.items?.length ?? 0}</div>
                      <div><strong>Total:</strong> ₹{Number(o?.total || 0).toFixed(2)}</div>
                    </div>
                    <div className="order-actions">
                      <button onClick={() => navigate(`/orders/${o?.id}`)}>View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-hint">No orders yet.</p>
            )}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="wishlist-section">
            <h3>My Wishlist</h3>
            {Array.isArray(wishlistItemsState) && wishlistItemsState.length > 0 ? (
              <div className="wishlist-grid">
                {wishlistItemsState.map((w, idx) => (
                  <div key={w?.product?.id ?? idx} className="wish-card">
                    <img src={resolveWishImg(w)} alt={w?.product?.name || 'Wishlist item'} className="wish-thumb" />
                    <div className="wish-info">
                      <div className="wish-name">{w?.product?.name || 'Item'}</div>
                      <div className="wish-price">₹{Number(w?.product?.price || 0).toFixed(2)}</div>
                    </div>
                    <div className="wish-actions">
                      <button onClick={() => navigate(`/seller/product/${w?.product?.id}`)}>View</button>
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
