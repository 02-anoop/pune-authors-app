const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/components/LandingPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add class to Contact Grid
content = content.replace(
  /<div style=\{\{\s*display:\s*"grid",\s*gridTemplateColumns:\s*"1fr 1fr",\s*gap:\s*"3rem",\s*marginBottom:\s*"3rem"\s*\}\}>/,
  '<div className="contact-grid" style={{ display: "grid", gap: "3rem", marginBottom: "3rem" }}>'
);

// 2. Add classes to headers that might wrap badly
content = content.replace(
  /<div style=\{\{\s*display:\s*"flex",\s*justifyContent:\s*"space-between",\s*alignItems:\s*"flex-end",\s*marginBottom:\s*"3rem",\s*flexDirection:\s*"row-reverse",\s*flexWrap:\s*"wrap",\s*gap:\s*"2rem"\s*\}\}>/,
  '<div className="nf-header-flex" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", flexDirection: "row-reverse", flexWrap: "wrap", gap: "2rem" }}>'
);

// 3. Inject responsive CSS rules
const cssAdditions = `
        .contact-grid { grid-template-columns: 1fr 1fr; }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 1.5rem !important; }
          section { padding: 4rem 1.2rem !important; }
          .contact-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
          
          /* Fix headers wrapping on mobile */
          .nf-header-flex { flex-direction: column !important; align-items: flex-start !important; gap: 1.5rem !important; }
          .nf-header-flex > div:first-child { text-align: left !important; }
          
          h2 { font-size: 2rem !important; line-height: 1.2 !important; }
        }
`;

content = content.replace(
  /@media\s*\(\max-width:\s*768px\)\s*\{\s*\.hero-grid\s*\{\s*grid-template-columns:\s*1fr\s*!important;\s*gap:\s*2\.5rem\s*!important;\s*\}\s*\.stats-grid\s*\{\s*grid-template-columns:\s*1fr\s*1fr\s*1fr\s*!important;\s*gap:\s*1\.5rem\s*!important;\s*\}\s*\}/,
  cssAdditions
);

fs.writeFileSync(filePath, content);
console.log("Mobile responsiveness improved!");
