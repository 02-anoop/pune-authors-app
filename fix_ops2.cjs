const fs = require('fs');
let ops = fs.readFileSync('c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx', 'utf8');
let lines = ops.split('\n');

// Remove 'Avg Order Value' web orders KPI line
let i1 = lines.findIndex(l => l.includes('avgOrderValueWeb'));
if (i1 > -1) { lines.splice(i1, 1); console.log('Removed Avg Order Value at line', i1+1); }

// Remove 'Avg Delivery Time' KPI line
let i2 = lines.findIndex(l => l.includes('avgDeliveryDays') && l.includes('label'));
if (i2 > -1) { lines.splice(i2, 1); console.log('Removed Avg Delivery Time at line', i2+1); }

// Fix grid cols from 6 to 4 (already done, verify)
lines = lines.map(l => l.includes('grid-cols-6') ? l.replace('grid-cols-6', 'grid-cols-4') : l);

ops = lines.join('\n');

// Now add checkbox state + header to Authors tab
// 1. Add state
if (!ops.includes('selectedAuthorsForCatalogue')) {
  ops = ops.replace(
    'const renderAuthorsTab = ({ refreshTrigger }: any) => {',
    'const renderAuthorsTab = ({ refreshTrigger }: any) => {\n    const [selectedAuthorsForCatalogue, setSelectedAuthorsForCatalogue] = React.useState([]);'
  );
  console.log('Added selectedAuthorsForCatalogue state');
}

// 2. Add checkbox table header
const oldTh = `              <tr>
                <th>Author Details</th>
                <th>Contact</th>
                <th>Payment Info</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Books</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>`;
const newTh = `              <tr>
                <th style={{ width: 36 }}><input type="checkbox" onChange={e => { const ids = authors.map((a) => a.id); setSelectedAuthorsForCatalogue(e.target.checked ? ids : []); }} checked={selectedAuthorsForCatalogue.length === authors.length && authors.length > 0} /></th>
                <th>Author Details</th>
                <th>Contact</th>
                <th>Payment Info</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Books</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>`;
if (ops.includes(oldTh)) {
  ops = ops.replace(oldTh, newTh);
  console.log('Added checkbox header to authors table');
} else {
  console.log('Authors table header NOT found, searching partial...');
  const idx = ops.indexOf('<th>Author Details</th>');
  console.log('Author Details th at char:', idx);
  if (idx > -1) console.log('Context:', JSON.stringify(ops.slice(idx - 50, idx + 30)));
}

// 3. Add Download Catalogue button
const exportCsvBtn = `<button onClick={handleExportAuthorsCSV} className="dash-btn dash-btn-ghost flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50">
              <Download className="w-4 h-4" /> Export CSV
            </button>`;
const exportCsvBtnNew = `<button onClick={handleExportAuthorsCSV} className="dash-btn dash-btn-ghost flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            {selectedAuthorsForCatalogue.length > 0 && (
              <button onClick={() => { const url = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api/admin/catalogue/selected?ids=' + selectedAuthorsForCatalogue.join(','); window.open(url, '_blank'); }} className="dash-btn dash-btn-primary flex items-center gap-2 bg-paa-navy text-white">
                <Download className="w-4 h-4" /> Download Catalogue ({selectedAuthorsForCatalogue.length})
              </button>
            )}`;
if (ops.includes(exportCsvBtn) && !ops.includes('Download Catalogue')) {
  ops = ops.replace(exportCsvBtn, exportCsvBtnNew);
  console.log('Added Download Catalogue button');
}

fs.writeFileSync('c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx', ops, 'utf8');
console.log('Done!');
