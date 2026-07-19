const fs = require('fs');
const path = require('path');

// 1. Fix NavBar buttons
const navPath = path.join(__dirname, '../src/app/components/NavBar.tsx');
let navContent = fs.readFileSync(navPath, 'utf8');

// Replace desktop btnStyle
const btnRegexDesktop = /const btnStyle = \{\s*fontSize: 12,\s*fontWeight: 700,\s*textTransform: 'uppercase' as const,\s*letterSpacing: '0\.05em',\s*color: '#b44d28',\s*border: '1px solid #b44d28',\s*padding: '0\.4rem 1rem',\s*borderRadius: '4px',\s*textDecoration: 'none',\s*transition: 'all 0\.2s'\s*\};/g;

navContent = navContent.replace(btnRegexDesktop, `const btnStyle = { 
               fontSize: 11, 
               fontWeight: 800, 
               textTransform: 'uppercase' as const, 
               letterSpacing: '0.05em', 
               color: '#111', 
               background: 'rgba(0,0,0,0.04)',
               border: '1px solid rgba(0,0,0,0.08)', 
               padding: '0.5rem 1.2rem', 
               borderRadius: '50px', 
               textDecoration: 'none', 
               transition: 'all 0.3s ease',
               whiteSpace: 'nowrap' as const,
               fontFamily: "'Google Sans', sans-serif"
             };`);

// Replace mobile btnStyle
const btnRegexMobile = /const btnStyle = \{\s*fontSize: '1\.1rem',\s*fontWeight: 700,\s*textTransform: 'uppercase' as const,\s*letterSpacing: '0\.05em',\s*color: '#b44d28',\s*border: '1px solid #b44d28',\s*padding: '0\.8rem 1rem',\s*borderRadius: '4px',\s*textDecoration: 'none',\s*textAlign: 'center' as const,\s*transition: 'all 0\.2s'\s*\};/g;

navContent = navContent.replace(btnRegexMobile, `const btnStyle = { 
            fontSize: '1rem', 
            fontWeight: 800, 
            textTransform: 'uppercase' as const, 
            letterSpacing: '0.05em', 
            color: '#111', 
            background: 'rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.08)', 
            padding: '0.8rem 1rem', 
            borderRadius: '50px', 
            textDecoration: 'none', 
            textAlign: 'center' as const, 
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap' as const,
            fontFamily: "'Google Sans', sans-serif"
          };`);

fs.writeFileSync(navPath, navContent);
console.log("NavBar.tsx updated successfully!");

// 2. Fix LandingPage.tsx background
const landPath = path.join(__dirname, '../src/app/components/LandingPage.tsx');
let landContent = fs.readFileSync(landPath, 'utf8');

// Replace bg-hash with bg-dots everywhere except where intentionally wanted
// Looking at the screenshot, the hero section has the slanting hash background.
// The user said "remvove that slanting instead add that dotted one".
// Let's replace ALL instances of "bg-hash" with "bg-dots" and "bg-hash-light" with "bg-dots-light"
// because the user seems to hate the slanting hash pattern.

landContent = landContent.replace(/bg-hash/g, 'bg-dots');

fs.writeFileSync(landPath, landContent);
console.log("LandingPage.tsx updated successfully!");
