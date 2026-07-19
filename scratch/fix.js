const fs = require('fs');
const files = [
  'src/app/components/LandingPage.tsx',
  'src/app/components/CataloguePage.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Replace literal '\`' with '`'
  content = content.replace(/\\`/g, '`');
  // Replace literal '\$' with '$'
  content = content.replace(/\\\$/g, '$');
  fs.writeFileSync(file, content);
  console.log(`Fixed ${file}`);
});
