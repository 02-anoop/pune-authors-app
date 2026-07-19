const fs = require('fs');
const path = require('path');

const navPath = path.join(__dirname, '../src/app/components/NavBar.tsx');
let navContent = fs.readFileSync(navPath, 'utf8');

// Update header background to be more transparent
navContent = navContent.replace(/background:\s*scrolled\s*\?\s*"rgba\(255,\s*255,\s*255,\s*0\.9\)"\s*:\s*"rgba\(255,\s*255,\s*255,\s*0\.7\)"/, 'background: scrolled ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.2)"');
navContent = navContent.replace(/backdropFilter:\s*"blur\(24px\)\s*saturate\(180\%\)"/g, 'backdropFilter: "blur(16px) saturate(180%)"');
navContent = navContent.replace(/WebkitBackdropFilter:\s*"blur\(24px\)\s*saturate\(180\%\)"/g, 'WebkitBackdropFilter: "blur(16px) saturate(180%)"');

// Fix the overflow issue by reducing gap from 2.5rem to 1.5rem, and padding
navContent = navContent.replace(/padding:\s*"0 1\.5rem 0 1rem",\s*height:\s*60,\s*display:\s*"flex",\s*alignItems:\s*"center",\s*justifyContent:\s*"space-between",\s*gap:\s*"2\.5rem",/, 'padding: "0 1.2rem", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.2rem",');

// Also update max-width of header to 98% just in case
navContent = navContent.replace(/maxWidth:\s*"95\%"/, 'maxWidth: "98%"');

fs.writeFileSync(navPath, navContent);
console.log("NavBar styles updated.");

// Now update LandingPage.tsx
const landPath = path.join(__dirname, '../src/app/components/LandingPage.tsx');
let landContent = fs.readFileSync(landPath, 'utf8');

// Fix hero padding so it starts below the navbar
// Search for: <section className="bg-dots" style={{ position: "relative", minHeight: "80vh", display: "flex", alignItems: "center", overflow: "hidden", backgroundColor: "#f8f9fa" }}>
// And the div below it: <div style={{ maxWidth: 1400, margin: "0 auto", padding: "4rem 2rem", ... }}>
landContent = landContent.replace(/padding:\s*"4rem 2rem"/, 'padding: "10rem 2rem 4rem 2rem"');

// Fix language section background
// It currently has a <section> with backgroundColor: "#FAFAFA" and overflow: "hidden"
// Replace the entire section opening tag + SVG patterns with just a clean background-image
const languageSectionStartRegex = /<section style=\{\{\s*backgroundColor:\s*"#FAFAFA"[\s\S]*?\{galleryItems\.some\(b => b\.language\) && \(/;

const targetStartStr = '{/* ════════════════════════════════════════════\n          BOOKS BY LANGUAGE — PETAL CIRCLES\n      ════════════════════════════════════════════ */}';

// I will just replace the specific section opening tag and drop all SVGs
const startIdx = landContent.indexOf('BOOKS BY LANGUAGE');
if(startIdx !== -1) {
    // Find the section tag
    const sectionStart = landContent.indexOf('<section style={{ backgroundColor: "#FAFAFA"', startIdx);
    const contentStart = landContent.indexOf('<div style={{ maxWidth: 1400, margin: "0 auto"', sectionStart);
    
    if (sectionStart !== -1 && contentStart !== -1) {
        const replacement = `<section style={{ 
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
        `;
        
        landContent = landContent.substring(0, sectionStart) + replacement + landContent.substring(contentStart);
        fs.writeFileSync(landPath, landContent);
        console.log("LandingPage styles updated.");
    }
}
