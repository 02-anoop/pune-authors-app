const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/components/NavBar.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `      <div 
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
      >`;

const replaceStr = `      <div 
        className="mobile-menu"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "#ffffff",
          display: menuOpen ? "flex" : "none",
          flexDirection: "column",
          padding: "100px 2rem 2rem 2rem",
          gap: "1.5rem",
          zIndex: -1,
          overflowY: "auto",
        }}
      >`;

// replace all spacing to match exactly if needed, or just use indexOf
let replaced = content.replace(/className="mobile-menu"[\s\S]*?boxShadow:\s*"0 10px 30px rgba\(0,0,0,0\.05\)",\s*\}\}\s*>/, replaceStr.substring(13)); // match from className="mobile-menu"

fs.writeFileSync(filePath, replaced);
console.log("Mobile menu fixed");
