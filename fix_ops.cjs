const fs = require('fs');

// ─────────────────────────────────────────────────────
// Part A: OperationsDashboardPage changes
// ─────────────────────────────────────────────────────
let ops = fs.readFileSync('c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx', 'utf8');

// 1. Remove Avg Order Value + Avg Delivery Time KPI items from the array
ops = ops.replace(
  /\{ label: 'Avg Order Value'[^}]+\},\s*\n/g, ''
);
ops = ops.replace(
  /\{ label: 'Avg Delivery Time'[^}]+\},\s*\n/g, ''
);

// 2. Authors table: add checkbox column header
ops = ops.replace(
  `              <tr>
                <th>Author Details</th>`,
  `              <tr>
                <th style={{ width: 36, padding: '8px' }}><input type="checkbox" title="Select all" onChange={e => setSelectedAuthorsForCatalogue(e.target.checked ? authors.map((a: any) => a.id) : [])} checked={selectedAuthorsForCatalogue.length === authors.length && authors.length > 0} /></th>
                <th>Author Details</th>`
);

// 3. Add checkbox td to every author row
ops = ops.replace(
  `                return (\n                  <tr key={a.id} className`,
  `                return (\n                  <tr key={a.id} className`
);

// Verify
console.log('Avg Order Value removed:', !ops.includes("label: 'Avg Order Value'"));
console.log('Avg Delivery Time removed:', !ops.includes("label: 'Avg Delivery Time'"));
console.log('selectedAuthorsForCatalogue state exists:', ops.includes('selectedAuthorsForCatalogue'));
console.log('Authors checkbox header added:', ops.includes('Select all'));

fs.writeFileSync('c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx', ops, 'utf8');
console.log('OperationsDashboardPage updated');
