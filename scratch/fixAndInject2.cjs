const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/components/LandingPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix syntax error
content = content.replace("        }\n      `}\n        .bg-dots-light {", "        }\n        .bg-dots-light {");

// Add Childrens Corner section between NF and NR
const nfEnd = content.indexOf('{/* ════════════════════════════════════════════\n          NEW RELEASES (SLANT GREEN)');

if (nfEnd !== -1) {
  const childrenSection = `
      {/* ════════════════════════════════════════════
          CHILDREN'S CORNER (YELLOW 3D)
      ════════════════════════════════════════════ */}
      <section style={{ backgroundColor: "#FFD700", padding: "5rem 2rem", position: "relative", overflow: "hidden" }}>
        {/* Floating 3D emojis */}
        <div style={{ position: "absolute", top: "10%", left: "5%", fontSize: "3rem", animation: "float 6s ease-in-out infinite" }}>🚀</div>
        <div style={{ position: "absolute", top: "20%", right: "15%", fontSize: "3rem", animation: "float 8s ease-in-out infinite reverse" }}>🎲</div>
        <div style={{ position: "absolute", bottom: "15%", left: "10%", fontSize: "4rem", animation: "float 7s ease-in-out infinite" }}>🎨</div>
        <div style={{ position: "absolute", top: "50%", right: "5%", fontSize: "3rem", animation: "float 5s ease-in-out infinite" }}>🎈</div>
        <div style={{ position: "absolute", bottom: "30%", right: "25%", fontSize: "2.5rem", animation: "float 9s ease-in-out infinite reverse" }}>⭐</div>

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <FadeIn>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 900, color: "#111", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>Children's Corner</h2>
                <p style={{ color: "#333", fontSize: 16, fontWeight: 600 }}>Colorful stories for young, imaginative minds.</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                   <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#111", transition: "background 0.2s" }} className="hover-bg-black"><ArrowLeft size={16}/></div>
                   <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#111", transition: "background 0.2s" }} className="hover-bg-black"><ArrowRight size={16}/></div>
                </div>
                <Link to="/catalogue?category=Children's corner" style={{ background: "#111", color: "#fff", padding: "0.8rem 2rem", borderRadius: 50, fontWeight: 700, textDecoration: "none", fontSize: 13, letterSpacing: "0.05em", display: "inline-block" }}>
                  VIEW ALL
                </Link>
              </div>
            </div>
          </FadeIn>
          
          <div className="horizontal-scroll" style={{ display: "flex", gap: "1.5rem", overflowX: "auto", paddingBottom: "2rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
            {galleryItems.filter(b => b.genre === "C").slice(0, 8).map((book, i) => (
              <div key={i} className="nr-card" style={{ flex: "0 0 300px", width: 300, background: "#fff", borderRadius: 20, padding: "1.2rem", position: "relative", display: "flex", gap: "1rem", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                <div style={{ width: 100, height: 140, background: "#f1f5f9", borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
                   <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : \`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}\${book.coverUrl}\`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop"} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: "#111", margin: "0 0 0.2rem 0", fontFamily: "'Playfair Display', serif", lineHeight: 1.2 }}>{book.title}</h4>
                  <p style={{ fontSize: 12, color: "#666", margin: "0 0 0.5rem 0", fontWeight: 600 }}>by {book.authorName}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", marginBottom: "0.8rem" }}>
                     {[1,2,3,4].map(star => <span key={star} style={{ color: "#FFD700", fontSize: 12 }}>★</span>)}
                     <span style={{ color: "#e2e8f0", fontSize: 12 }}>★</span>
                     <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "0.3rem", fontWeight: 700 }}>4.0</span>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "#111" }}>₹{book.mrp || 220}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

`;
  
  content = content.substring(0, nfEnd) + childrenSection + content.substring(nfEnd);
} else {
  console.log("Could not find NEW RELEASES section to inject CHILDREN'S CORNER");
}

fs.writeFileSync(filePath, content);
console.log("Fixed syntax and injected Children's Corner");
