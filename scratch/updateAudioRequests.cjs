const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/components/LandingPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. IMMERSIVE FICTION
// Add arrows
const ficArrows = `<div style={{ display: "flex", gap: "0.5rem", marginRight: "1rem" }}>
                   <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", transition: "background 0.2s" }} className="hover-bg-black"><ArrowLeft size={16}/></div>
                   <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", transition: "background 0.2s" }} className="hover-bg-black"><ArrowRight size={16}/></div>
                </div>`;
content = content.replace(
  '<Link to="/catalogue?category=Fiction"', 
  ficArrows + '\\n              <Link to="/catalogue?category=Fiction"'
);

// Reduce image height
content = content.replace('height: 320, background: "#f1f5f9"', 'height: 220, background: "#f1f5f9"');

// Add stars to Fiction
content = content.replace(
  '<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>',
  `<div style={{ display: "flex", alignItems: "center", gap: "0.2rem", marginBottom: "0.8rem" }}>
                     {[1,2,3,4].map(star => <span key={star} style={{ color: "#FFCC00", fontSize: 12 }}>★</span>)}
                     <span style={{ color: "#e2e8f0", fontSize: 12 }}>★</span>
                     <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "0.3rem", fontWeight: 700 }}>4.0</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>`
);

// 2. KNOWLEDGE & NON-FICTION
// Remove SCROLL and add arrows
const nfArrows = `<div style={{ display: "flex", gap: "0.5rem" }}>
                   <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,51,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#0033FF", transition: "background 0.2s" }} className="hover-bg-black"><ArrowLeft size={16}/></div>
                   <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,51,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#0033FF", transition: "background 0.2s" }} className="hover-bg-black"><ArrowRight size={16}/></div>
                </div>`;
content = content.replace(
  '<span style={{ color: "#0033FF", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: "0.4rem" }}><ArrowRight size={14}/> SCROLL</span>',
  nfArrows
);

// 3. NEW RELEASES
// Add something extra: A nice subtle "NEW" badge on the book cards
content = content.replace(
  'className="nr-card" style={{ flex: "0 0 240px"',
  'className="nr-card" style={{ flex: "0 0 240px"'
);
content = content.replace(
  /<div style=\{\{ width: "100%", height: 260, background: "linear-gradient/g,
  '<div style={{ position: "absolute", top: "0.5rem", right: "0.5rem", background: "#00D084", color: "#fff", fontSize: "10px", fontWeight: 800, padding: "0.3rem 0.6rem", borderRadius: "50px", letterSpacing: "0.1em", zIndex: 10, boxShadow: "0 2px 10px rgba(0,208,132,0.3)" }}>NEW</div>\\n                <div style={{ width: "100%", height: 260, background: "linear-gradient'
);

// 4. BOOKS BY LANGUAGE
// Completely remove the section
const langStart = content.indexOf('{/* ════════════════════════════════════════════\\n          BOOKS BY LANGUAGE (RESTORED)');
const langEnd = content.indexOf('</section>\\n  )}\\n\\n  \\n      {/* ════════════════════════════════════════════\\n          CONTACT SECTION (DARK DOTS)');
if (langStart !== -1 && langEnd !== -1) {
  content = content.substring(0, langStart) + '{/* ════════════════════════════════════════════\\n          CONTACT SECTION (DARK DOTS)' + content.substring(langEnd + '</section>\\n  )}\\n\\n  \\n      {/* ════════════════════════════════════════════\\n          CONTACT SECTION (DARK DOTS)'.length);
}

fs.writeFileSync(filePath, content);
console.log("Audio requests applied successfully!");
