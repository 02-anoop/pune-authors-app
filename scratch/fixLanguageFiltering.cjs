const fs = require('fs');
const path = require('path');

// 1. Update CataloguePage.tsx filtering logic
const catPath = path.join(__dirname, '../src/app/components/CataloguePage.tsx');
let catContent = fs.readFileSync(catPath, 'utf8');

const oldCatSearch = `    let list = allBooks;

    if (activeCategory !== "All") {
      list = list.filter((b) => b.genre === activeCategory);
    }`;

const newCatReplace = `    let list = baseAllBooks;

    const langParam = params.get('language');
    if (langParam) {
      list = list.filter((b) => (b.language || "").toLowerCase() === langParam.toLowerCase());
    }

    if (activeCategory !== "All") {
      // If language param is present, maybe don't enforce category filter unless explicitly requested?
      // Since clicking language takes us to /catalogue?language=X, activeCategory will be "All" initially!
      // So this is perfectly fine.
      list = list.filter((b) => b.genre === activeCategory);
    }`;

if (catContent.includes(oldCatSearch)) {
    catContent = catContent.replace(oldCatSearch, newCatReplace);
    fs.writeFileSync(catPath, catContent);
    console.log("Updated CataloguePage.tsx successfully.");
} else if (catContent.includes("const langParam = params.get('language');")) {
    console.log("CataloguePage.tsx already has the language filter logic.");
} else {
    console.log("ERROR: Could not find the target code in CataloguePage.tsx. Let's try Regex.");
    catContent = catContent.replace(
        /let list = allBooks;\s*if \(activeCategory !== "All"\) {\s*list = list\.filter\(\(b\) => b\.genre === activeCategory\);\s*}/,
        newCatReplace
    );
    fs.writeFileSync(catPath, catContent);
    console.log("Regex replace attempted for CataloguePage.tsx.");
}

// 2. Update LandingPage.tsx language section color
const landPath = path.join(__dirname, '../src/app/components/LandingPage.tsx');
let landContent = fs.readFileSync(landPath, 'utf8');

// The section looks like: <section style={{ backgroundColor: "#FFF4F7", padding: "6rem 2rem", position: "relative" }}>
const oldLandSearch1 = `<section style={{ backgroundColor: "#FFF4F7", padding: "6rem 2rem", position: "relative" }}>`;
const newLandReplace1 = `<section style={{ backgroundColor: "#FAFAFA", padding: "6rem 2rem", position: "relative", borderTop: "1px solid #eaeaea" }}>`;

if (landContent.includes(oldLandSearch1)) {
    landContent = landContent.replace(oldLandSearch1, newLandReplace1);
} else {
    // maybe it still has className="bg-hash" if the multi_replace failed earlier or wasn't perfect?
    const oldLandSearch2 = `<section className="bg-hash" style={{ backgroundColor: "#FFF4F7", padding: "6rem 2rem", position: "relative" }}>`;
    if (landContent.includes(oldLandSearch2)) {
        landContent = landContent.replace(oldLandSearch2, newLandReplace1);
    }
}

fs.writeFileSync(landPath, landContent);
console.log("Updated LandingPage.tsx successfully.");
