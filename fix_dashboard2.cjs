const fs = require('fs');

let c = fs.readFileSync('src/app/components/AuthorDashboardPage.tsx', 'utf8');
c = c.replace(/require\('react'\)\.useState/g, 'React.useState');
c = c.replace(/require\('axios'\)\.put/g, 'axios.put');

// listedBooks
c = c.replace('const events = data.events || [];', 'const events = data.events || [];\n  const listedBooks = [];');

fs.writeFileSync('src/app/components/AuthorDashboardPage.tsx', c);

let co = fs.readFileSync('src/app/components/CheckoutPage.tsx', 'utf8');
co = co.replace(/import \{([^}]+)\} from 'lucide-react';/, (match, p1) => {
  if (!p1.includes('Trash2')) {
    return `import {${p1}, Trash2} from 'lucide-react';`;
  }
  return match;
});
fs.writeFileSync('src/app/components/CheckoutPage.tsx', co);

let op = fs.readFileSync('src/app/components/OperationsDashboardPage.tsx', 'utf8');
op = op.replace('fetchDashboardData(true)', 'fetchDashboardData()').replace('fetchDashboardData(true)', 'fetchDashboardData()');
fs.writeFileSync('src/app/components/OperationsDashboardPage.tsx', op);
