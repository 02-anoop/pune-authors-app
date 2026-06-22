import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X, User } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Books", href: "/catalogue" },
  { label: "Gallery", href: "/gallery" },
  { label: "Events", href: "/events" },
  { label: "Contact", href: "/contact" },
];

export function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const location = useLocation();

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.98)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 1.5rem",
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "2rem",
        }}
      >
        {/* Logo */}
        <Link 
          to="/" 
          style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none", flexShrink: 0 }}
          onClick={() => {
            if (location.pathname === "/") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
          {!logoError ? (
            <img 
              src="/logo.png" 
              alt="Pune Authors' Association Logo" 
              style={{ height: 40, objectFit: "contain" }} 
              onError={() => setLogoError(true)} 
            />
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#b44d28",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              P
            </div>
          )}
          <span className="brand-text" style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 800, color: "#1a1a2e", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Pune Authors' Association
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: "none", alignItems: "center", gap: "1.25rem" }} className="desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              onClick={() => {
                if (location.pathname === link.href) {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                fontWeight: 600,
                color: location.pathname === link.href ? "#b44d28" : "#1a1a2e",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#b44d28"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = location.pathname === link.href ? "#b44d28" : "#1a1a2e"; }}
            >
              {link.label}
            </Link>
          ))}
          
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "1rem" }}>
            {token ? (
              <Link
                to={userRole === "ADMIN" ? "/operations" : userRole === "AUTHOR" ? "/dashboard" : "/profile"}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1a1a2e",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <User size={14} /> My Profile
              </Link>
            ) : (
              <Link
                to="/login"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1a1a2e",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                Login
              </Link>
            )}
            {!token && (
              <Link
                to="/register"
                style={{
                  padding: "0.6rem 1.25rem",
                  borderRadius: 4,
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  background: "#b44d28",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                Join as Author
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }} className="mobile-only">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}
          >
            {menuOpen ? <X size={24} color="#1a1a2e" /> : <Menu size={24} color="#1a1a2e" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div style={{ position: "absolute", top: 72, left: 0, right: 0, background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              onClick={() => {
                setMenuOpen(false);
                if (location.pathname === link.href) {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: "#1a1a2e", textDecoration: "none", padding: "0.5rem 0" }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ height: 1, background: "rgba(0,0,0,0.06)", margin: "0.5rem 0" }} />
          {!token && (
            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
              style={{ padding: "0.8rem", borderRadius: 4, textAlign: "center", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "#fff", background: "#b44d28", textDecoration: "none" }}
            >
              Join as Author
            </Link>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 1024px) {
          .desktop-nav { display: flex !important; }
          .mobile-only { display: none !important; }
        }
        @media (max-width: 1150px) {
          .brand-text { display: none !important; }
        }
      `}</style>
    </header>
  );
}
