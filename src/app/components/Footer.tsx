import { Link } from "react-router";

export function Footer() {
  return (
    <footer style={{ background: "#111827", color: "rgba(255,255,255,0.6)", padding: "4rem 1.5rem 2rem", fontSize: 13 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "4rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "3rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1.5rem" }}>
            <img src="/logo.png" alt="Pune Authors' Association Logo" style={{ height: 32, objectFit: "contain" }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: "0.1em" }}>PUNE AUTHORS' ASSOCIATION</span>
          </div>
          <p style={{ lineHeight: 1.6 }}>A dedicated, self-governing independent collective system built to publish, distribute, promote, and establish high visibility for modern Indian writers.</p>
        </div>
        <div>
          <h4 style={{ color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: "1.5rem", textTransform: "uppercase" }}>Quick Navigation</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <Link to="/catalogue" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Buy Books</Link>
            <Link to="/register" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Authors - join the group</Link>
            <Link to="/services" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Publishing Support</Link>
            <Link to="/about" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>About the Group</Link>
            <Link to="/catalogue" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Browse & Download the Catalog</Link>
            <Link to="/events" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>View Group Initiatives like Literary Events, Flybraries, Book Fairs</Link>
          </div>
        </div>
        <div>
          <h4 style={{ color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: "1.5rem", textTransform: "uppercase" }}>Official Contacts</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <span>Pune Authors' Association, Pune, Maharashtra, India</span>
            <span>info@puneauthorsassociation.org</span>
            <span>+91 79770 97397</span>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1280, margin: "3rem auto 0", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "2rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <span>© 2026 Pune Authors' Association. All Rights Reserved.</span>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <Link to="#" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Privacy Charter</Link>
          <Link to="#" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Terms of Operations</Link>
        </div>
      </div>
    </footer>
  );
}
