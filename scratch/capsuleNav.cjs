const fs = require('fs');
const path = require('path');

const navPath = path.join(__dirname, '../src/app/components/NavBar.tsx');
let navContent = fs.readFileSync(navPath, 'utf8');

// Replace header block
navContent = navContent.replace(/<header[\s\S]*?className="desktop-nav"/, 
`<header
      style={{
        position: "sticky",
        top: 20,
        zIndex: 50,
        background: scrolled ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: "50px",
        boxShadow: scrolled ? "0 10px 30px rgba(0,0,0,0.08)" : "0 4px 20px rgba(0,0,0,0.04)",
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        margin: "20px auto 20px auto",
        width: "fit-content",
        maxWidth: "95%"
      }}
    >
      <div
        style={{
          padding: "0 1.5rem 0 1rem",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "2.5rem",
        }}
      >
        {/* Logo */}
        <Link 
          to="/" 
          style={{ display: "flex", alignItems: "center", gap: "0.8rem", textDecoration: "none", flexShrink: 0, paddingRight: "1rem" }}
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
              style={{ height: 44, objectFit: "contain", transition: "transform 0.3s ease", borderRadius: "50%" }} 
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
          <span className="brand-text" style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#111", letterSpacing: "0.02em", textTransform: "uppercase" }}>
            Pune Authors
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="desktop-nav"`);

// Let's also hide the brand-text on smaller screens if the width isn't enough, but it's already handled.

fs.writeFileSync(navPath, navContent);
console.log("NavBar updated to floating capsule successfully!");
