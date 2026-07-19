const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/components/LandingPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove Books by Language Section
const langStart = content.indexOf('{/* ════════════════════════════════════════════\\n          BOOKS BY LANGUAGE (RESTORED)');
const langEndStr = '</section>\\n  )}';
let langEnd = content.indexOf(langEndStr, langStart);
if (langStart !== -1 && langEnd !== -1) {
  content = content.substring(0, langStart) + content.substring(langEnd + langEndStr.length);
}

// 2. Group Arrows and View All
content = content.replace(
  /<div style=\{\{\s*display:\s*"flex",\s*gap:\s*"0\.5rem",\s*marginRight:\s*"1rem"\s*\}\}>[\s\S]*?<\/div>\s*<Link to="\/catalogue\?category=Fiction"[\s\S]*?<\/Link>/,
  `<div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                   <div onClick={() => scrollContainer(ficScrollRef, 'left')} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", transition: "all 0.3s ease" }} className="hover-bg-black"><ArrowLeft size={16}/></div>
                   <div onClick={() => scrollContainer(ficScrollRef, 'right')} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", transition: "all 0.3s ease" }} className="hover-bg-black"><ArrowRight size={16}/></div>
                </div>
                <Link to="/catalogue?category=Fiction" className="view-all-btn" style={{ background: "#fff", color: "#111", padding: "0.8rem 2rem", borderRadius: 50, fontWeight: 700, textDecoration: "none", fontSize: 13, letterSpacing: "0.05em", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", display: "inline-block" }}>
                  VIEW ALL
                </Link>
              </div>`
);

content = content.replace(
  /<Link to="\/catalogue\?category=Non-Fiction"[\s\S]*?<\/Link>\s*<div style=\{\{\s*display:\s*"flex",\s*gap:\s*"0\.5rem"\s*\}\}>[\s\S]*?<\/div>\s*<\/div>/,
  `<div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                   <div onClick={() => scrollContainer(nfScrollRef, 'left')} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,51,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#0033FF", transition: "all 0.3s ease" }} className="hover-bg-black"><ArrowLeft size={16}/></div>
                   <div onClick={() => scrollContainer(nfScrollRef, 'right')} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,51,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#0033FF", transition: "all 0.3s ease" }} className="hover-bg-black"><ArrowRight size={16}/></div>
                </div>
                <Link to="/catalogue?category=Non-Fiction" className="view-all-btn" style={{ background: "#0033FF", color: "#fff", padding: "0.8rem 2rem", borderRadius: 50, fontWeight: 700, textDecoration: "none", fontSize: 13, letterSpacing: "0.05em", boxShadow: "0 4px 15px rgba(0,51,255,0.2)" }}>
                  VIEW ALL
                </Link>
              </div>`
);

content = content.replace(
  /<Link to="\/catalogue\?category=Children"[\s\S]*?<\/Link>/,
  `<Link to="/catalogue?category=Children" className="view-all-btn" style={{ background: "#111", color: "#FFD700", padding: "0.8rem 2rem", borderRadius: 50, fontWeight: 800, textDecoration: "none", fontSize: 13, letterSpacing: "0.05em", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", display: "inline-block" }}>
                  VIEW ALL
                </Link>`
);

content = content.replace(
  /<div style=\{\{\s*display:\s*"flex",\s*alignItems:\s*"center",\s*gap:\s*"1\.5rem"\s*\}\}>[\s\S]*?<div style=\{\{\s*display:\s*"flex",\s*gap:\s*"0\.5rem"\s*\}\}>[\s\S]*?<\/div>[\s\S]*?<Link to="\/catalogue"[\s\S]*?<\/Link>\s*<\/div>/,
  `<div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                   <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#111", transition: "all 0.3s ease" }} className="hover-bg-black"><ArrowLeft size={16}/></div>
                   <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#111", transition: "all 0.3s ease" }} className="hover-bg-black"><ArrowRight size={16}/></div>
                </div>
                <Link to="/catalogue" className="view-all-btn" style={{ background: "#00D084", color: "#fff", padding: "0.8rem 2rem", borderRadius: 50, fontWeight: 700, textDecoration: "none", fontSize: 13, letterSpacing: "0.05em", boxShadow: "0 4px 15px rgba(0,208,132,0.2)", display: "inline-block" }}>
                  VIEW ALL
                </Link>
              </div>`
);

if (!content.includes('.view-all-btn')) {
  content = content.replace(
    '<style>{`',
    '<style>{`\\n        .view-all-btn { transition: all 0.3s ease; }\\n        .view-all-btn:hover { background-color: #111 !important; color: #fff !important; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.15) !important; }\\n        .hover-bg-black:hover { background-color: #111 !important; color: #fff !important; transform: scale(1.05); }'
  );
}

content = content.replace(/fontFamily:\s*"'Playfair Display',\s*serif"(,\s*)?/g, (match, p1) => p1 ? '' : '');
content = content.replace(/<h2 style=\{\{\s*(fontFamily:\s*"'Playfair Display',\s*serif",\s*)?/g, '<h2 style={{ fontFamily: "\\\'Playfair Display\\\', serif", ');

fs.writeFileSync(filePath, content);
console.log("Refinements applied for UI and font!");
