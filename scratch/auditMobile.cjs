const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/components/LandingPage.tsx');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.includes('gridTemplateColumns') || l.includes('padding: "8rem') || l.includes('padding: "6rem') || l.includes('padding: "5rem') || l.includes('grid-template-columns') || l.includes('@media')) {
    console.log(i + 1 + ': ' + l.trim());
  }
}
