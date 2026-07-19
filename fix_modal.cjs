const fs = require('fs');
let content = fs.readFileSync('src/app/components/AuthorDashboardPage.tsx', 'utf8');

// Change z-[100] to z-[1000] for the modal
content = content.replace(
  /className="fixed inset-0 bg-paa-navy\/80 backdrop-blur-sm flex items-center justify-center p-4 z-\[100\]"/g,
  `className="fixed inset-0 bg-paa-navy/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"`
);

// Also just in case it was z-[60], change that too
content = content.replace(
  /className="fixed inset-0 bg-paa-navy\/80 backdrop-blur-sm flex items-center justify-center p-4 z-\[60\]"/g,
  `className="fixed inset-0 bg-paa-navy/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"`
);

fs.writeFileSync('src/app/components/AuthorDashboardPage.tsx', content);
console.log('Fixed modal z-index to 9999');
