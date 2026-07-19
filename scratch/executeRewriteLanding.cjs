const fs = require('fs');

const path = 'src/app/components/LandingPage.tsx';
let content = fs.readFileSync(path, 'utf8');

const returnMatch = content.match(/  return \(\r?\n    <main/);
if (!returnMatch) {
    console.log("Could not find return statement in LandingPage.tsx");
    process.exit(1);
}

const beforeReturn = content.slice(0, returnMatch.index);

const rewriteScript = fs.readFileSync('scratch/rewriteLanding.cjs', 'utf8');
const newReturnMatch = rewriteScript.split('const newReturn = `');
if (newReturnMatch.length < 2) {
    console.log("Could not parse rewrite script.");
    process.exit(1);
}

const newReturn = newReturnMatch[1].slice(0, -3); // remove `;\n
fs.writeFileSync(path, beforeReturn + newReturn);
console.log("LandingPage.tsx updated successfully.");
