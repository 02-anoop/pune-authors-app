const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/components/LandingPage.tsx');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

// Find start and end exactly
const startIdx = lines.findIndex(l => l.includes('BOOKS BY LANGUAGE (RESTORED)')) - 1; // get the previous line which has {/* ═══
const endIdx = lines.findIndex(l => l.includes('CONTACT SECTION')) - 2;

if (startIdx >= 0 && endIdx >= startIdx) {
  // Remove lines
  lines.splice(startIdx, endIdx - startIdx);
  fs.writeFileSync(filePath, lines.join('\n'));
  console.log('Removed Books by Language section successfully.');
} else {
  console.log('Could not find boundaries.');
  console.log(startIdx, endIdx);
}
