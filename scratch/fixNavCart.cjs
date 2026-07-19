const fs = require('fs');
const path = require('path');

const navPath = path.join(__dirname, '../src/app/components/NavBar.tsx');
let navContent = fs.readFileSync(navPath, 'utf8');

// 1. Change <header style={{ position: "sticky", top: 20, ... }}> to position fixed and centered
navContent = navContent.replace(/<header\s*style=\{\{[\s\S]*?position:\s*"sticky"[\s\S]*?top:\s*20[\s\S]*?margin:\s*"20px auto 20px auto"[\s\S]*?\}\}\s*>/, 
`<header
      style={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        background: scrolled ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: "50px",
        boxShadow: scrolled ? "0 10px 30px rgba(0,0,0,0.08)" : "0 4px 20px rgba(0,0,0,0.04)",
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        width: "fit-content",
        maxWidth: "95%"
      }}
    >`);

// 2. Wrap the return in a fragment and move CartDrawer outside header
navContent = navContent.replace(/return\s*\(\s*<header/, 'return (\n    <>\n    <header');
navContent = navContent.replace(/<CartDrawer isOpen=\{cartOpen\} onClose=\{.*\} \/>\s*<\/header>/, 
`</header>\n      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />\n    </>`);

fs.writeFileSync(navPath, navContent);
console.log("NavBar fixed: changed to position: fixed and moved CartDrawer outside of header context.");
