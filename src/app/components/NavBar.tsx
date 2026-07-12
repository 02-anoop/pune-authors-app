import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import { bookCategories } from "../data/categories";
import { Menu, X, User, ShoppingCart } from "lucide-react";
import { CartDrawer } from "./CartDrawer";

const navLinks = [
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Books", href: "/catalogue" },
  { label: "Gallery", href: "/gallery" },
  { label: "Events", href: "/events" },
  { label: "Flybraries", href: "/flybraries" },
  { label: "Contact", href: "/contact" },
];

export function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterBooks = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setMegaMenuOpen(true);
  };

  const handleMouseLeaveBooks = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 200);
  };

  const [hasBooks, setHasBooks] = useState<{ main: Record<string, boolean>, sub: Record<string, boolean> }>({ main: {}, sub: {} });

  useEffect(() => {
    const processBooks = (books: any[]) => {
      const main: Record<string, boolean> = {};
      const sub: Record<string, boolean> = {};
      books.forEach(b => {
        if (b.genre) main[b.genre] = true;
        if (b.subGenre) {
          const parts = b.subGenre.split(b.subGenre.includes(" > ") ? " > " : ">").map((s: string) => s.trim());
          if (parts[0]) sub[parts[0]] = true;
        }
      });
      setHasBooks({ main, sub });
    };

    const w = window as any;
    if (w.__apiCache?.catalogueBooks) {
      processBooks(w.__apiCache.catalogueBooks);
    } else {
      fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/books`)
        .then(res => res.json())
        .then(data => processBooks(data))
        .catch(console.error);
    }
  }, []);

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    const updateCartCount = () => {
      const saved = localStorage.getItem('checkout_cart');
      const savedQ = localStorage.getItem('checkout_quantities');
      if (saved) {
        const ids = JSON.parse(saved);
        if (savedQ) {
           const qs = JSON.parse(savedQ);
           const total = ids.reduce((sum: number, id: string) => sum + (qs[id] || 1), 0);
           setCartCount(total);
        } else {
           setCartCount(ids.length);
        }
      } else {
        setCartCount(0);
      }
    };
    updateCartCount();
    window.addEventListener('cart_updated', updateCartCount);
    return () => window.removeEventListener('cart_updated', updateCartCount);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: scrolled ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
        transition: "all 0.4s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
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
          style={{ display: "flex", alignItems: "center", gap: "0.8rem", textDecoration: "none", flexShrink: 0 }}
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
              style={{ height: 60, objectFit: "contain", transition: "transform 0.3s ease" }} 
              onError={() => setLogoError(true)} 
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
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
          <span className="brand-text" style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "#111", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Pune Authors' Association
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2rem", flex: 1, justifyContent: "center" }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.label}
                to={link.href}
                className="nav-link"
                onClick={() => {
                  if (isActive) window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 500,
                  color: isActive ? "#b44d28" : "#333",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { 
                  (e.currentTarget as HTMLAnchorElement).style.color = "#b44d28"; 
                  if (link.label === "Books") handleMouseEnterBooks();
                }}
                onMouseLeave={(e) => { 
                  (e.currentTarget as HTMLAnchorElement).style.color = isActive ? "#b44d28" : "#333"; 
                  if (link.label === "Books") handleMouseLeaveBooks();
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        
        {/* Desktop Actions */}
        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          {(!userRole || userRole === "CUSTOMER") && location.pathname !== "/register" && (
            <button onClick={() => setCartOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", position: 'relative', display: 'flex', alignItems: 'center', color: '#111' }}>
              <ShoppingCart size={20} />
              {cartCount > 0 && <span style={{ position: 'absolute', top: -8, right: -12, background: '#b44d28', color: '#fff', fontSize: 10, fontWeight: 'bold', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>{cartCount}</span>}
            </button>
          )}
          {token ? (
            <Link
              to={userRole === "ADMIN" ? "/operations" : userRole === "AUTHOR" ? "/dashboard" : "/profile"}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 500,
                color: "#111",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "color 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#b44d28"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#111"; }}
            >
              <User size={15} /> My Profile
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#333",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#b44d28"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#333"; }}
              >
                Sign In
              </Link>

            </>
          )}
        </div>

        {/* Mobile Toggle & Cart */}
        <div className="mobile-toggle" style={{ display: "none", alignItems: "center", gap: "1.2rem" }}>
          {(!userRole || userRole === "CUSTOMER") && location.pathname !== "/register" && (
            <button onClick={() => setCartOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", position: 'relative', display: 'flex', color: '#111' }}>
              <ShoppingCart size={22} />
              {cartCount > 0 && <span style={{ position: 'absolute', top: -8, right: -12, background: '#b44d28', color: '#fff', fontSize: 10, fontWeight: 'bold', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>{cartCount}</span>}
            </button>
          )}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#111",
              padding: "0.2rem",
              display: "flex",
              alignItems: "center"
            }}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className="mobile-menu"
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          width: "100%",
          background: "#fff",
          borderBottom: "1px solid #eaeaea",
          display: menuOpen ? "flex" : "none",
          flexDirection: "column",
          padding: "2rem 1.5rem",
          gap: "1.5rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        }}
      >
        {navLinks.map((link) => {
          const isActive = location.pathname === link.href;
          return (
            <Link
              key={link.label}
              to={link.href}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.2rem",
                color: isActive ? "#b44d28" : "#111",
                textDecoration: "none",
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {link.label}
            </Link>
          );
        })}
        
        <div style={{ height: "1px", background: "#eaeaea", width: "100%", margin: "0.5rem 0" }}></div>

        {token ? (
            <Link
              to={userRole === "ADMIN" ? "/operations" : userRole === "AUTHOR" ? "/dashboard" : "/profile"}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.2rem",
                color: "#111",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
              }}
            >
              <User size={18} /> My Profile
            </Link>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Link
                to="/login"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#333",
                  textDecoration: "none",
                  textAlign: "center",
                  padding: "0.8rem",
                  border: "1px solid #eaeaea",
                }}
              >
                Sign In
              </Link>

            </div>
          )}
      </div>

      <style>{`
        .nav-link { position: relative; }
        .nav-link::after { content: ''; position: absolute; width: 100%; height: 1px; bottom: -4px; left: 0; background-color: transparent; transition: background-color 0.2s ease; }
        .nav-link:hover::after { background-color: #b44d28; }
        
        @media (max-width: 992px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
        @media (max-width: 600px) {
          .brand-text { display: none !important; }
        }
      `}</style>
      
      {/* Mega Menu Dropdown */}
      {megaMenuOpen && (
        <div 
          style={{ 
            position: 'absolute', top: '100%', left: 0, width: '100%', 
            background: '#fff', borderTop: '1px solid #eaeaea', 
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'flex', 
            justifyContent: 'center', transition: 'all 0.3s ease',
            zIndex: 40
          }}
          onMouseEnter={handleMouseEnterBooks}
          onMouseLeave={handleMouseLeaveBooks}
        >
          <div style={{ maxWidth: 1100, width: '100%', display: 'flex' }}>
            <div style={{ flex: 3, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '2.5rem 1.5rem', gap: '2rem' }}>
              
              {/* Column 1: Fiction */}
              {hasBooks.main["Fiction"] && (
                <div>
                  <Link onClick={() => setMegaMenuOpen(false)} to={`/catalogue?category=Fiction`} style={{ color: '#b44d28', fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: '1.2rem', display: 'block' }}>Fiction</Link>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    {Object.keys(bookCategories["Fiction"]).filter(sub => hasBooks.sub[sub]).slice(0, 6).map(sub => (
                      <li key={sub}>
                        <Link onClick={() => setMegaMenuOpen(false)} to={`/catalogue?category=Fiction&subcategory=${encodeURIComponent(sub)}`} style={{ color: '#4b5563', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#b44d28')} onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}>{sub}</Link>
                      </li>
                    ))}
                    <li style={{ marginTop: '0.2rem' }}>
                      <Link onClick={() => setMegaMenuOpen(false)} to={`/catalogue?category=Fiction`} style={{ color: '#b44d28', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>See All &rarr;</Link>
                    </li>
                  </ul>
                </div>
              )}

              {/* Column 2: Non-Fiction */}
              {hasBooks.main["Non-Fiction"] && (
                <div>
                  <Link onClick={() => setMegaMenuOpen(false)} to={`/catalogue?category=Non-Fiction`} style={{ color: '#b44d28', fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: '1.2rem', display: 'block' }}>Non-Fiction</Link>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    {Object.keys(bookCategories["Non-Fiction"]).filter(sub => hasBooks.sub[sub]).slice(0, 6).map(sub => (
                      <li key={sub}>
                        <Link onClick={() => setMegaMenuOpen(false)} to={`/catalogue?category=Non-Fiction&subcategory=${encodeURIComponent(sub)}`} style={{ color: '#4b5563', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#b44d28')} onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}>{sub}</Link>
                      </li>
                    ))}
                    <li style={{ marginTop: '0.2rem' }}>
                      <Link onClick={() => setMegaMenuOpen(false)} to={`/catalogue?category=Non-Fiction`} style={{ color: '#b44d28', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>See All &rarr;</Link>
                    </li>
                  </ul>
                </div>
              )}

              {/* Column 3: Children's Books */}
              {hasBooks.main["Children's Books"] && (
                <div>
                  <Link onClick={() => setMegaMenuOpen(false)} to={`/catalogue?category=${encodeURIComponent("Children's Books")}`} style={{ color: '#b44d28', fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: '1.2rem', display: 'block' }}>Children's Books</Link>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    {Object.keys(bookCategories["Children's Books"]).filter(sub => hasBooks.sub[sub]).slice(0, 6).map(sub => (
                      <li key={sub}>
                        <Link onClick={() => setMegaMenuOpen(false)} to={`/catalogue?category=${encodeURIComponent("Children's Books")}&subcategory=${encodeURIComponent(sub)}`} style={{ color: '#4b5563', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#b44d28')} onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}>{sub}</Link>
                      </li>
                    ))}
                    <li style={{ marginTop: '0.2rem' }}>
                      <Link onClick={() => setMegaMenuOpen(false)} to={`/catalogue?category=${encodeURIComponent("Children's Books")}`} style={{ color: '#b44d28', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>See All &rarr;</Link>
                    </li>
                  </ul>
                </div>
              )}

            </div>

            {/* Column 4: Also Explore */}
            <div style={{ flex: 1, background: '#fff9f5', padding: '2.5rem 2rem', borderLeft: '1px solid #f3e8e0', display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#1e293b', fontWeight: 700, fontSize: 15, marginBottom: '1.2rem', display: 'block' }}>Also Explore</span>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {["Academic & Educational", "Arts & Entertainment", "Comics & Graphic Novels", "Lifestyle", "Poetry", "Reference", "Sports & Outdoors", "Regional & Language Literature"].filter(cat => hasBooks.main[cat]).map(cat => (
                  <li key={cat}>
                    <Link onClick={() => setMegaMenuOpen(false)} to={`/catalogue?category=${encodeURIComponent(cat)}`} style={{ color: '#c2410c', fontSize: 13, textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#7c2d12')} onMouseLeave={(e) => (e.currentTarget.style.color = '#c2410c')}>{cat}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
