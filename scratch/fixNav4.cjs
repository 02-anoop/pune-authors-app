const fs = require('fs');
const path = require('path');

const landPath = path.join(__dirname, '../src/app/components/LandingPage.tsx');
let landContent = fs.readFileSync(landPath, 'utf8');

// The section is around:
/*
      <section style={{ 
        backgroundColor: "#FAFAFA", 
        backgroundImage: "url('/floral-pattern.png')",
        backgroundSize: "400px",
        backgroundRepeat: "repeat",
        backgroundBlendMode: "overlay",
        padding: "6rem 2rem", 
        position: "relative", 
        borderTop: "1px solid #eaeaea", 
        overflow: "hidden" 
      }}>
*/

// Let's replace the style object
landContent = landContent.replace(
    /backgroundColor:\s*"#FAFAFA",[\s\S]*?backgroundImage:\s*"url\('\/floral-pattern\.png'\)",[\s\S]*?backgroundSize:\s*"400px",[\s\S]*?backgroundRepeat:\s*"repeat",[\s\S]*?backgroundBlendMode:\s*"overlay",[\s\S]*?padding:\s*"6rem 2rem",[\s\S]*?position:\s*"relative",[\s\S]*?borderTop:\s*"1px solid #eaeaea",[\s\S]*?overflow:\s*"hidden"/,
    `background: "linear-gradient(135deg, #FF7A00 0%, #E91E63 100%)",
        position: "relative", 
        padding: "6rem 2rem",
        overflow: "hidden"`
);

// We need to add the background image properly using a pseudo element or direct background layered.
// Direct layered background:
// backgroundImage: "url('/floral-pattern.png'), linear-gradient(135deg, #FF7A00 0%, #E91E63 100%)",
// Let's re-do the replacement cleanly

const sectionStart = landContent.indexOf('<section style={{ \n        background: "linear-gradient');
if (sectionStart !== -1 || landContent.indexOf('backgroundColor: "#FAFAFA", \n        backgroundImage: "url(\'/floral-pattern.png\')"') !== -1) {
    // Already modified or original found, let's use a regex that captures the whole style
    const regex = /<section style=\{\{[\s\S]*?overflow:\s*"hidden"\s*\}\}>/;
    landContent = landContent.replace(regex, `<section style={{ 
        position: "relative", 
        padding: "8rem 2rem", 
        overflow: "hidden",
        background: "linear-gradient(135deg, #FF7A00 0%, #E91E63 100%)"
      }}>
        {/* Subtle patterned overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/floral-pattern.png')", backgroundSize: "300px", opacity: 0.15, mixBlendMode: "overlay", pointerEvents: "none" }} />
      `);
}

// Now we must fix the text colors inside this section so they are readable on the bright gradient
// "Books by Language" is currently color: "#E91E63" -> make it "#fff"
// "Discover literature..." is color: "#666" -> make it "rgba(255,255,255,0.9)"
landContent = landContent.replace(/<h2 style=\{\{\s*fontSize:\s*"clamp\(2\.5rem, 4vw, 3\.5rem\)",\s*fontWeight:\s*900,\s*color:\s*"#E91E63"/, '<h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 900, color: "#fff"');
landContent = landContent.replace(/<p style=\{\{\s*fontSize:\s*18,\s*color:\s*"#666",\s*marginBottom:\s*"4rem",\s*fontWeight:\s*500\s*\}\}>/, '<p style={{ fontSize: 18, color: "rgba(255,255,255,0.9)", marginBottom: "4rem", fontWeight: 500 }}>');

fs.writeFileSync(landPath, landContent);
console.log("LandingPage styles updated for bright floral background.");
