const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/components/LandingPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const contactSectionMatch = content.indexOf(`{/* ════════════════════════════════════════════\n          CONTACT & INQUIRY`);
if (contactSectionMatch === -1) {
    console.log("Could not find contact section in LandingPage.tsx");
    process.exit(1);
}

const beforeContact = content.slice(0, contactSectionMatch);
const contactAndAfter = content.slice(contactSectionMatch);

const languageSection = `      {/* ════════════════════════════════════════════
          BOOKS BY LANGUAGE — PETAL CIRCLES
      ════════════════════════════════════════════ */}
      {galleryItems.some(b => b.language) && (
      <section className="bg-mesh" style={{ backgroundColor: "#FFF4F7", padding: "6rem 2rem", position: "relative" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 900, color: "#E91E63", margin: "0 0 1rem 0", letterSpacing: "-0.02em" }}>Books by Language</h2>
            <p style={{ fontSize: 18, color: "#666", marginBottom: "4rem", fontWeight: 500 }}>Discover literature in your preferred tongue.</p>
            
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "3rem" }}>
              {[...new Set(galleryItems.map(b => b.language).filter(Boolean))].map((lang, i) => {
                const colors = ["#E91E63", "#9C27B0", "#3F51B5", "#009688", "#FF9800"];
                const color = colors[i % colors.length];
                return (
                  <Link key={i} to={\`/catalogue?language=\${lang}\`} className="hover-lift" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                    <div style={{ 
                      width: "160px", height: "160px", borderRadius: "50%", background: \`\${color}10\`, 
                      border: \`1px solid \${color}30\`, display: "flex", alignItems: "center", justifyContent: "center", 
                      position: "relative", overflow: "hidden", transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      boxShadow: \`0 15px 30px \${color}15\`
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1) rotate(15deg)"; e.currentTarget.style.background = color; e.currentTarget.style.boxShadow = \`0 20px 40px \${color}40\`; e.currentTarget.querySelector('.lang-text').style.color = '#fff'; e.currentTarget.querySelector('.petal-bg').style.opacity = '0.3'; e.currentTarget.querySelector('.petal-bg').style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1) rotate(0deg)"; e.currentTarget.style.background = \`\${color}10\`; e.currentTarget.style.boxShadow = \`0 15px 30px \${color}15\`; e.currentTarget.querySelector('.lang-text').style.color = color; e.currentTarget.querySelector('.petal-bg').style.opacity = '0.1'; e.currentTarget.querySelector('.petal-bg').style.color = color; }}
                    >
                      {/* Beautiful Flower Petal/Mandala SVG inside the circle */}
                      <svg className="petal-bg" viewBox="0 0 100 100" style={{ position: "absolute", width: "130%", height: "130%", opacity: 0.1, transition: "all 0.4s ease", color: color }}>
                        <path d="M50 5 C65 25, 95 35, 95 50 C95 65, 65 75, 50 95 C35 75, 5 65, 5 50 C5 35, 35 25, 50 5 Z" fill="currentColor" />
                        <path d="M18 18 C38 25, 50 5, 50 5 C50 5, 62 25, 82 18 C75 38, 95 50, 95 50 C95 50, 75 62, 82 82 C62 75, 50 95, 50 95 C50 95, 38 75, 18 82 C25 62, 5 50, 5 50 C5 50, 25 38, 18 18 Z" fill="currentColor" style={{ transformOrigin: "center", transform: "rotate(45deg)", opacity: 0.7 }} />
                      </svg>
                      
                      <span className="lang-text" style={{ fontSize: 24, fontWeight: 900, color: color, position: "relative", zIndex: 2, fontFamily: "'Playfair Display', serif", transition: "color 0.3s" }}>{lang}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </FadeIn>
        </div>
      </section>
      )}

      `;

fs.writeFileSync(filePath, beforeContact + languageSection + contactAndAfter);
console.log("LandingPage.tsx updated with Books by Language section (circular petal design).");
