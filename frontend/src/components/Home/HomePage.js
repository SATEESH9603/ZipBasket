import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import electronicsImg from "../assets/images/electronics.jpg";
import fashionImg from "../assets/images/fashion.jpg";
import homeImg from "../assets/images/home.png";
import booksImg from "../assets/images/books.png";

export default function HomePage({ user }) {
  return (
    <div className="homepage">
      {/* Top-right nav buttons */}
      {!user && (
        <div className="homepage-nav">
          <Link to="/login" className="login-btn">Login</Link>
          <Link to="/register" className="signup-btn">Sign Up</Link>
        </div>
      )}

      {/* Hero Banner */}
      <section className="hero">
        <div className="hero-banner">
          <h2>Big Savings, Everyday</h2>
          <p>Shop the latest deals across electronics, fashion, and more.</p>
          <Link 
            to={user ? "/dashboard" : "/register"} 
            className="cta-btn"
          >
            {user ? "Go to Dashboard" : "Start Shopping"}
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <h3>Shop by Category</h3>
        <div className="category-grid">
          <div className="category-card">
            <img className="category-img" src={electronicsImg} alt="Electronics" />
            <p>Electronics</p>
          </div>
          <div className="category-card">
            <img className="category-img" src={fashionImg} alt="Fashion" />
            <p>Fashion</p>
          </div>
          <div className="category-card">
            <img className="category-img" src={homeImg} alt="Home Essentials" />
            <p>Home Essentials</p>
          </div>
          <div className="category-card">
            <img className="category-img" src={booksImg} alt="Books" />
            <p>Books</p>
          </div>
        </div>
      </section>
      {/*
      {/* Featured Deals Section 
      <section className="featured">
        <h3>Featured Deals</h3>
        <div className="product-grid">
          <div className="product-card">
            <img src="/images/laptop.jpg" alt="Laptop" />
            <p>High-Performance Laptop</p>
            <span className="price">₹54,999</span>
          </div>
          <div className="product-card">
            <img src="/images/phone.jpg" alt="Smartphone" />
            <p>Latest Smartphone</p>
            <span className="price">₹29,999</span>
          </div>
          <div className="product-card">
            <img src="/images/headphones.jpg" alt="Headphones" />
            <p>Wireless Headphones</p>
            <span className="price">₹3,499</span>
          </div>
          <div className="product-card">
            <img src="/images/shoes.jpg" alt="Shoes" />
            <p>Trending Sneakers</p>
            <span className="price">₹1,999</span>
          </div>
        </div>
      </section>
      */}
      {/* Amazon-like Footer */}
      <footer className="homepage-footer">
        <div className="footer-sections">
          <div className="footer-column">
            <h4>Get to Know Us</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/press">Press Releases</Link></li>
              <li><Link to="/blog">Our Blog</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Connect with Us</h4>
            <ul>
              <li><a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></li>
              <li><a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Make Money with Us</h4>
            <ul>
              <li><Link to="/sell">Sell on ShopEase</Link></li>
              <li><Link to="/affiliate">Affiliate Program</Link></li>
              <li><Link to="/ads">Advertise Your Products</Link></li>
              <li><Link to="/partner">Partner With Us</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Let Us Help You</h4>
            <ul>
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/returns">Returns & Replacements</Link></li>
              <li><Link to="/shipping">Shipping Rates & Policies</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ZipBasket. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
