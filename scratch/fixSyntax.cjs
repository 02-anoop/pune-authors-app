const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/components/LandingPage.tsx');
let content = fs.readFileSync(file, 'utf8');

// The disaster happened here:
//   }).sort((a, b) => {
//     if (a.name === "Others") return 1;
//   { name: "Poetry", icon: <Feather color="#ec4899" size={28} />, bg: "#fce7f3", cat: "Poetry", subcat: "All" },

// We need to replace that mess with the correct end of availableLanguages.

const badStringStart = `  }).sort((a, b) => {
    if (a.name === "Others") return 1;
  { name: "Poetry", icon: <Feather color="#ec4899" size={28} />, bg: "#fce7f3", cat: "Poetry", subcat: "All" },`;

const correctEndForAvailableLanguages = `    if (b.name === "Others") return -1;
    return a.name.localeCompare(b.name);
  });`;

// Find where the duplicate `export function LandingPage() {` is.
// Actually, I can just extract everything before `badStringStart`, append `correctEndForAvailableLanguages`, and then append the REST of the file starting from the SECOND `const allLanguageNames = Array.from(new Set(galleryItems.map((b: any) => b.language?.trim()).filter(Boolean)));`?

// Wait, the easiest way is to split the file by `export function LandingPage() {`
const parts = content.split('export function LandingPage() {');
// parts[0] is everything before LandingPage (imports, topGenres, topLanguages)
// parts[1] is the first (broken) LandingPage function
// parts[2] is the duplicated (correct) LandingPage function but with the new hero section!

if (parts.length === 3) {
    console.log("Found 3 parts (duplicate LandingPage). Fixing...");
    // The top part is correct.
    let newContent = parts[0] + 'export function LandingPage() {' + parts[2];
    fs.writeFileSync(file, newContent);
    console.log("Fixed by removing the broken duplicate LandingPage function.");
} else {
    console.log("Unexpected parts length: " + parts.length);
}
