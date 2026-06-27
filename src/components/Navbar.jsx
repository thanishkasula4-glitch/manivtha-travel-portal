import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./Navbar.css";
import UrlIcon from "./UrlIcon";

/* ── Icons ── */
const PlaneIcon = () => <UrlIcon name="flight" size={22} color="#f5c518" />;
const UserIcon = () => <UrlIcon name="person" size={20} color="#ffffff" />;
const DashboardIcon = () => <UrlIcon name="dashboard" size={16} />;
const AdminIcon = () => <UrlIcon name="admin-panel-settings" size={16} />;


const NAV_LINKS = [
  ["Home",     "/"],
  ["Services", "/services"],
  ["Book Now", "/book"],
];

export default function Navbar({ activePage = "" }) {
  const [scrolled, setScrolled] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const fn = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon logo-pulse"><PlaneIcon /></div>
          <div className="navbar-logo-text">
            <span className="navbar-logo-brand">Manivtha</span>
            <span className="navbar-logo-sub">TOURS &amp; TRAVELS</span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="navbar-links">
          {NAV_LINKS.map(([label, href]) => (
            <Link
              key={label}
              to={href}
              className={`navbar-link ${activePage === label ? "active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Profile Dropdown */}
        <div className="navbar-user-wrap" ref={dropRef}>
          <button
            className={`navbar-user-btn ${dropOpen ? "open" : ""}`}
            onClick={() => setDropOpen((o) => !o)}
            aria-label="User menu"
          >
            <div className="navbar-avatar avatar-pulse"><UserIcon /></div>
            <span className="navbar-username">Loveyou bugatti</span>
            <span className="navbar-chevron">▾</span>
          </button>

          {dropOpen && (
            <div className="navbar-dropdown">
              <Link
                to="/admin"
                className="navbar-drop-item"
                onClick={() => setDropOpen(false)}
              >
                <span className="navbar-drop-icon"><DashboardIcon /></span>
                Dashboard
              </Link>
              <Link
                to="/admin"
                className="navbar-drop-item navbar-drop-admin"
                onClick={() => setDropOpen(false)}
              >
                <span className="navbar-drop-icon"><AdminIcon /></span>
                Admin Panel
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
