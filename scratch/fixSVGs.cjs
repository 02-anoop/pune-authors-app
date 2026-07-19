const fs = require('fs');
const path = require('path');

const landPath = path.join(__dirname, '../src/app/components/LandingPage.tsx');
let landContent = fs.readFileSync(landPath, 'utf8');

// The current SVG block starts with {/* Subtle Indian Art Background Patterns */}
// and ends right before <div style={{ maxWidth: 1400

const targetStart = `{/* Subtle Indian Art Background Patterns */}`;
const targetEnd = `<div style={{ maxWidth: 1400, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 10 }}>`;

const startIndex = landContent.indexOf(targetStart);
const endIndex = landContent.indexOf(targetEnd);

if (startIndex !== -1 && endIndex !== -1) {
    const newSvgs = `{/* Subtle Indian Art Background Patterns */}
        {/* Top Left Leaf Motif */}
        <svg viewBox="0 0 100 100" style={{ position: "absolute", top: "-50px", left: "-50px", width: "350px", height: "350px", opacity: 0.08, transform: "rotate(45deg)", pointerEvents: "none" }}>
          <path d="M50 90 C20 90, 0 60, 0 30 C0 10, 50 0, 50 0 C50 0, 100 10, 100 30 C100 60, 80 90, 50 90 Z" fill="#E91E63" />
          <path d="M50 80 C30 80, 15 55, 15 35 C15 20, 50 10, 50 10 C50 10, 85 20, 85 35 C85 55, 70 80, 50 80 Z" fill="#FAFAFA" />
          <path d="M50 70 C35 70, 25 50, 25 35 C25 25, 50 18, 50 18 C50 18, 75 25, 75 35 C75 50, 65 70, 50 70 Z" fill="#E91E63" />
        </svg>

        {/* Bottom Right Mango/Paisley Motif */}
        <svg viewBox="0 0 100 100" style={{ position: "absolute", bottom: "-80px", right: "-80px", width: "450px", height: "450px", opacity: 0.08, transform: "rotate(-20deg)", pointerEvents: "none" }}>
          <path d="M50 95 C20 95, 5 70, 5 45 C5 25, 25 5, 50 5 C75 5, 95 25, 95 45 C95 70, 70 80, 50 80 C40 80, 30 75, 30 65 C30 55, 40 50, 50 50 C65 50, 75 60, 75 75" fill="none" stroke="#9C27B0" strokeWidth="6" strokeLinecap="round" />
          <path d="M50 85 C25 85, 15 65, 15 45 C15 30, 30 15, 50 15 C70 15, 85 30, 85 45" fill="none" stroke="#9C27B0" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="50" cy="45" r="15" fill="#9C27B0" opacity="0.5" />
        </svg>

        {/* Center Giant Mandala (Lotus) */}
        <svg viewBox="0 0 200 200" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "800px", height: "800px", opacity: 0.04, pointerEvents: "none" }}>
          <g fill="#3F51B5">
            <path d="M100 100 L100 10 C120 10, 140 40, 100 100 Z" />
            <path d="M100 100 L100 10 C80 10, 60 40, 100 100 Z" />
            
            <path d="M100 100 L190 100 C190 80, 160 60, 100 100 Z" />
            <path d="M100 100 L190 100 C190 120, 160 140, 100 100 Z" />

            <path d="M100 100 L100 190 C120 190, 140 160, 100 100 Z" />
            <path d="M100 100 L100 190 C80 190, 60 160, 100 100 Z" />

            <path d="M100 100 L10 100 C10 80, 40 60, 100 100 Z" />
            <path d="M100 100 L10 100 C10 120, 40 140, 100 100 Z" />

            <circle cx="100" cy="100" r="20" fill="#FAFAFA" />
            <circle cx="100" cy="100" r="15" fill="#3F51B5" />
            <circle cx="100" cy="100" r="5" fill="#FAFAFA" />
          </g>
        </svg>

        `;
    
    landContent = landContent.substring(0, startIndex) + newSvgs + landContent.substring(endIndex);
    fs.writeFileSync(landPath, landContent);
    console.log("LandingPage.tsx updated with highly visible Indian SVGs!");
} else {
    console.log("ERROR: Could not find the SVG injection point!");
}
