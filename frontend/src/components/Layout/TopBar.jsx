import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./TopBar.css";

export default function TopBar({
  user,
  onLogout,
  cartCount = 0,
  ordersCount = 0,
  wishlistCount = 0,
}) {
  const [iconsOpen, setIconsOpen] = useState(false);
  const navigate = useNavigate();

  const totalBadge = useMemo(
    () => Number(cartCount || 0) + Number(wishlistCount || 0),
    [cartCount, wishlistCount]
  );

  const closeMenu = () => setIconsOpen(false);

  // ✅ role-based dashboard route
  const pickRole = (u) =>
    (u?.role ?? (Array.isArray(u?.roles) ? u.roles[0] : "USER"))
      ?.toString()
      ?.toUpperCase();

  const routeForRole = (role) => {
    const map = {
      ADMIN: "/admin-dashboard",
      SELLER: "/seller-dashboard",
      USER: "/user-dashboard",
    };
    return map[role] || "/user-dashboard";
  };

  const goToDashboard = () => {
    const role = pickRole(user);
    navigate(routeForRole(role), { replace: true });
  };

  return (
    <div className="global-top-line">
      <div className="topbar-content">
        <h2 className="app-title">ZipBasket</h2>

        <nav>
          {user ? (
            <>
              {/* 🚀 role-based dashboard routing */}
              <button className="linklike" onClick={goToDashboard}>
                Dashboard
              </button>

              <Link to="/profile">Profile</Link>

              {/* Desktop icons */}
              <div className="topbar-icons">
                <Link to="/cart" title="Cart" className="topbar-icon">
                  🛒{cartCount > 0 && <span>{cartCount}</span>}
                </Link>

                <Link to="/orders" title="Orders" className="topbar-icon">
                  📦{ordersCount > 0 && <span>{ordersCount}</span>}
                </Link>

                <Link to="/wishlist" title="Wishlist" className="topbar-icon">
                  💖{wishlistCount > 0 && <span>{wishlistCount}</span>}
                </Link>
              </div>

              {/* Mobile trigger (collapses to dropdown) */}
              <div className="topbar-icons-mobile">
                <button
                  className="topbar-icon-trigger"
                  aria-haspopup="menu"
                  aria-expanded={iconsOpen}
                  aria-label="Open shopping menu"
                  onClick={() => setIconsOpen((v) => !v)}
                >
                  🛍️
                  {totalBadge > 0 && <span>{totalBadge}</span>}
                </button>

                {iconsOpen && (
                  <div
                    className="topbar-icons-menu"
                    role="menu"
                    onMouseLeave={closeMenu}
                  >
                    <Link to="/cart" role="menuitem" onClick={closeMenu}>
                      <span className="mi">🛒</span>
                      Cart
                      {cartCount > 0 && <em className="badge">{cartCount}</em>}
                    </Link>
                    <Link to="/orders" role="menuitem" onClick={closeMenu}>
                      <span className="mi">📦</span>
                      Orders
                      {ordersCount > 0 && (
                        <em className="badge">{ordersCount}</em>
                      )}
                    </Link>
                    <Link to="/wishlist" role="menuitem" onClick={closeMenu}>
                      <span className="mi">💖</span>
                      Wishlist
                      {wishlistCount > 0 && (
                        <em className="badge">{wishlistCount}</em>
                      )}
                    </Link>
                  </div>
                )}
              </div>

              <button
                className="logout-btn"
                onClick={() => {
                  onLogout?.();
                  setIconsOpen(false);
                  navigate("/login", { replace: true });
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/">Home</Link>
              <Link to="/login">Login</Link>
              <Link to="/register">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
