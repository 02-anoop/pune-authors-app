const fs = require('fs');
let content = fs.readFileSync('src/app/components/AuthorDashboardPage.tsx', 'utf8');

content = content.replace(
  /\{\(isOptedIn \|\| isAwaitingApproval\) && evt\.status !== 'Past' && \(/g,
  "{isOptedIn && evt.status !== 'Past' && ("
);

fs.writeFileSync('src/app/components/AuthorDashboardPage.tsx', content);
console.log('Fixed POS button condition');
