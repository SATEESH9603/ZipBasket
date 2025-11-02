import React from "react";
import { Link } from "react-router-dom";
import "./TopBar.css";

export default function TopBar({ user, onLogout }) {
  return (
    <div className="global-top-line">
      <div className="topbar-content">
        <h2 className="app-title">ZipBasket</h2>
        <nav>
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/profile">Profile</Link>
              <button className="logout-btn" onClick={onLogout}>
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
