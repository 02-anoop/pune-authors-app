const fs = require('fs');
const path = require('path');

// 1. Rewrite Footer.tsx
const footerPath = path.join(__dirname, '../src/app/components/Footer.tsx');
const newFooter = `import { Link } from "react-router";

export function Footer() {
  return (
    <footer style={{ background: "#FFFFFF", color: "#666", padding: "4rem 1.5rem 2rem", fontSize: 14, fontFamily: "'Google Sans', sans-serif", borderTop: "1px solid #eaeaea" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "3rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1.5rem" }}>
            <img src="/logo.png" alt="Pune Authors' Association Logo" style={{ height: 40, objectFit: "contain" }} />
            <span style={{ fontSize: 13, fontWeight: 900, color: "#111", letterSpacing: "0.05em", fontFamily: "'Playfair Display', serif", textTransform: "uppercase" }}>Pune Authors' Association</span>
          </div>
          <p style={{ lineHeight: 1.6, fontWeight: 500 }}>A dedicated, self-governing independent collective system built to publish, distribute, promote, and establish high visibility for modern Indian writers.</p>
        </div>
        <div>
          <h4 style={{ color: "#111", fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", marginBottom: "1.5rem", textTransform: "uppercase", fontFamily: "'Playfair Display', serif" }}>Quick Navigation</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontWeight: 500 }}>
            <Link to="/catalogue" style={{ color: "#666", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#111"} onMouseLeave={e => e.currentTarget.style.color = "#666"}>Buy Books</Link>
            <Link to="/register" style={{ color: "#666", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#111"} onMouseLeave={e => e.currentTarget.style.color = "#666"}>Authors - join the group</Link>
            <Link to="/authors/organize-event" style={{ color: "#666", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#111"} onMouseLeave={e => e.currentTarget.style.color = "#666"}>Organize an Event</Link>
            <Link to="/invite-authors" style={{ color: "#666", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#111"} onMouseLeave={e => e.currentTarget.style.color = "#666"}>Invite an Author</Link>
            <Link to="/about" style={{ color: "#666", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#111"} onMouseLeave={e => e.currentTarget.style.color = "#666"}>About the Group</Link>
            <Link to="/catalogue" style={{ color: "#666", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#111"} onMouseLeave={e => e.currentTarget.style.color = "#666"}>Browse & Download the Catalog</Link>
            <Link to="/events" style={{ color: "#666", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#111"} onMouseLeave={e => e.currentTarget.style.color = "#666"}>Group Initiatives</Link>
          </div>
        </div>
        <div>
          <h4 style={{ color: "#111", fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", marginBottom: "1.5rem", textTransform: "uppercase", fontFamily: "'Playfair Display', serif" }}>Official Contacts</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontWeight: 500 }}>
            <span style={{ lineHeight: 1.5 }}>Pune Authors' Association<br/>Pune, Maharashtra, India</span>
            <span>info@puneauthorsassociation.org</span>
            <span>+91 79770 97397</span>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1280, margin: "3rem auto 0", borderTop: "1px solid #eaeaea", paddingTop: "2rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", fontWeight: 500 }}>
        <span>© 2026 Pune Authors' Association. All Rights Reserved.</span>
        <div style={{ display: "flex", gap: "2rem" }}>
          <Link to="#" style={{ color: "#666", textDecoration: "none" }} onMouseEnter={e => e.currentTarget.style.color = "#111"} onMouseLeave={e => e.currentTarget.style.color = "#666"}>Privacy Charter</Link>
          <Link to="#" style={{ color: "#666", textDecoration: "none" }} onMouseEnter={e => e.currentTarget.style.color = "#111"} onMouseLeave={e => e.currentTarget.style.color = "#666"}>Terms of Operations</Link>
        </div>
      </div>
    </footer>
  );
}
`;
fs.writeFileSync(footerPath, newFooter);
console.log("Footer.tsx updated successfully!");

// 2. Rewrite NavBar.tsx specific lines
const navPath = path.join(__dirname, '../src/app/components/NavBar.tsx');
let navContent = fs.readFileSync(navPath, 'utf8');

// Update desktop btnStyle
const oldDesktopBtnStyle = `             const btnStyle = { 
               fontSize: 12, 
               fontWeight: 700, 
               textTransform: 'uppercase' as const, 
               letterSpacing: '0.05em', 
               color: '#b44d28', 
               border: '1px solid #b44d28', 
               padding: '0.4rem 1rem', 
               borderRadius: '4px', 
               textDecoration: 'none', 
               transition: 'all 0.2s' 
             };`;
const newDesktopBtnStyle = `             const btnStyle = { 
               fontSize: 11, 
               fontWeight: 800, 
               textTransform: 'uppercase' as const, 
               letterSpacing: '0.05em', 
               color: '#111', 
               background: 'rgba(0,0,0,0.04)',
               border: '1px solid rgba(0,0,0,0.08)', 
               padding: '0.5rem 1.2rem', 
               borderRadius: '50px', 
               textDecoration: 'none', 
               transition: 'all 0.3s ease',
               whiteSpace: 'nowrap' as const,
               fontFamily: "'Google Sans', sans-serif"
             };`;
navContent = navContent.replace(oldDesktopBtnStyle, newDesktopBtnStyle);

// Update mobile btnStyle
const oldMobileBtnStyle = `          const btnStyle = { 
            fontSize: '1.1rem', 
            fontWeight: 700, 
            textTransform: 'uppercase' as const, 
            letterSpacing: '0.05em', 
            color: '#b44d28', 
            border: '1px solid #b44d28', 
            padding: '0.8rem 1rem', 
            borderRadius: '4px', 
            textDecoration: 'none', 
            textAlign: 'center' as const, 
            transition: 'all 0.2s' 
          };`;
const newMobileBtnStyle = `          const btnStyle = { 
            fontSize: '1rem', 
            fontWeight: 800, 
            textTransform: 'uppercase' as const, 
            letterSpacing: '0.05em', 
            color: '#111', 
            background: 'rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.08)', 
            padding: '0.8rem 1rem', 
            borderRadius: '50px', 
            textDecoration: 'none', 
            textAlign: 'center' as const, 
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap' as const,
            fontFamily: "'Google Sans', sans-serif"
          };`;
navContent = navContent.replace(oldMobileBtnStyle, newMobileBtnStyle);

// Update hover logic to match new style
navContent = navContent.replace(
  /const hoverEnter = \(e: React.MouseEvent<HTMLAnchorElement>\) => \{[\s\S]*?\};/,
  `const hoverEnter = (e: React.MouseEvent<HTMLAnchorElement>) => { 
               e.currentTarget.style.backgroundColor = '#111'; 
               e.currentTarget.style.color = '#fff'; 
               e.currentTarget.style.transform = 'translateY(-2px)';
             };`
);
navContent = navContent.replace(
  /const hoverLeave = \(e: React.MouseEvent<HTMLAnchorElement>\) => \{[\s\S]*?\};/,
  `const hoverLeave = (e: React.MouseEvent<HTMLAnchorElement>) => { 
               e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'; 
               e.currentTarget.style.color = '#111'; 
               e.currentTarget.style.transform = 'translateY(0)';
             };`
);

// Enhance glassmorphism
navContent = navContent.replace(
  `background: scrolled ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.8)",`,
  `background: scrolled ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.6)",`
);
navContent = navContent.replace(
  `backdropFilter: "blur(12px)",`,
  `backdropFilter: "blur(20px) saturate(180%)",`
);

// Ensure Google Sans is used for normal links
navContent = navContent.replace(
  /fontFamily: "var\(--font-body\)"/g,
  `fontFamily: "'Google Sans', sans-serif"`
);

// Update Brand text to use Google Sans/Playfair
navContent = navContent.replace(
  /fontFamily: "var\(--font-display\)"/g,
  `fontFamily: "'Playfair Display', serif"`
);

fs.writeFileSync(navPath, navContent);
console.log("NavBar.tsx updated successfully!");
