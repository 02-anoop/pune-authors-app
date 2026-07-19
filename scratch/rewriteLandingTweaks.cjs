const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/components/LandingPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Rewrite CSS block
content = content.replace(
  /\.bg-mesh \{[\s\S]*?\.bg-mesh-light \{[\s\S]*?\}/,
  `.bg-hash {
          background-color: transparent;
          background-image: repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 15px);
        }
        .bg-hash-light {
          background-color: transparent;
          background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 15px);
        }
        .bg-dots {
          background-color: transparent;
          background-image: radial-gradient(rgba(0,0,0,0.15) 1.5px, transparent 1.5px);
          background-size: 24px 24px;
        }
        .bg-dots-light {
          background-color: transparent;
          background-image: radial-gradient(rgba(255,255,255,0.25) 1.5px, transparent 1.5px);
          background-size: 24px 24px;
        }`
);

// Update classNames in sections

// Hero
content = content.replace(/<section className="bg-mesh" style={{ position: "relative", minHeight: "80vh"/, '<section className="bg-hash" style={{ position: "relative", minHeight: "80vh"');

// Fiction -> bg-dots-light
content = content.replace(/<section className="bg-mesh-light" style={{ backgroundColor: "#FF7A00"/, '<section className="bg-dots-light" style={{ backgroundColor: "#FF7A00"');

// Children -> bg-hash-light
content = content.replace(/<section className="bg-mesh-light" style={{ backgroundColor: "#FFD400"/, '<section className="bg-hash-light" style={{ backgroundColor: "#FFD400"');

// New Releases -> remove bg-mesh completely
content = content.replace(/<section className="bg-mesh" style={{ backgroundColor: "#fff", padding: "6rem 2rem", position: "relative" }}>/, '<section style={{ backgroundColor: "#fff", padding: "6rem 2rem", position: "relative" }}>');

// Language -> bg-hash
content = content.replace(/<section className="bg-mesh" style={{ backgroundColor: "#FFF4F7"/, '<section className="bg-hash" style={{ backgroundColor: "#FFF4F7"');

// Contact -> bg-hash-light
content = content.replace(/<section className="bg-mesh-light" style={{ backgroundColor: "#111"/, '<section className="bg-hash-light" style={{ backgroundColor: "#111"');


// 2. Language unique deduplication
content = content.replace(
  /\{\[\.\.\.new Set\(galleryItems\.map\(b => b\.language\)\.filter\(Boolean\)\)\]\.map\(\(lang, i\) => \{/g,
  `{[...new Set(galleryItems.map(b => b.language?.trim().toLowerCase()).filter(Boolean))].map(l => l.charAt(0).toUpperCase() + l.slice(1)).map((lang, i) => {`
);

// 3. Add more 3D toys to Children's corner
const toysHTML = `{/* Floating Playful Toys */}
        <div className="animate-float" style={{ position: "absolute", top: "10%", left: "5%", fontSize: "4rem", zIndex: 0, filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.1))" }}>🚀</div>
        <div className="animate-float-delayed" style={{ position: "absolute", bottom: "15%", right: "8%", fontSize: "5rem", zIndex: 0, filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.1))" }}>🎈</div>
        <div className="animate-float" style={{ position: "absolute", top: "30%", right: "40%", fontSize: "3rem", zIndex: 0, filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.1))" }}>⭐</div>
        <div className="animate-float-delayed" style={{ position: "absolute", bottom: "30%", left: "30%", fontSize: "4rem", zIndex: 0, filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.1))" }}>🧩</div>
        <div className="animate-float" style={{ position: "absolute", top: "60%", left: "15%", fontSize: "4.5rem", zIndex: 0, filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.1))" }}>🧸</div>
        <div className="animate-float-delayed" style={{ position: "absolute", top: "20%", right: "20%", fontSize: "3.5rem", zIndex: 0, filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.1))" }}>🎨</div>
        <div className="animate-float" style={{ position: "absolute", bottom: "10%", left: "50%", fontSize: "4rem", zIndex: 0, filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.1))" }}>🪁</div>
        <div className="animate-float-delayed" style={{ position: "absolute", top: "5%", left: "40%", fontSize: "2.5rem", zIndex: 0, filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.1))" }}>🎲</div>`;

content = content.replace(
  /\{\/\* Floating Playful Toys \*\/\}[\s\S]*?<div style={{ maxWidth: 1400/,
  `${toysHTML}\n\n        <div style={{ maxWidth: 1400`
);

fs.writeFileSync(filePath, content);
console.log("LandingPage.tsx updated successfully!");
