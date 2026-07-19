const fs = require('fs');
let ops = fs.readFileSync('c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx', 'utf8');

if (!ops.includes('selectedAuthorsForCatalogue')) {
  // Add state
  const stateMarker = 'const renderAuthorsTab = ({ refreshTrigger }: any) => {';
  if (ops.includes(stateMarker)) {
    ops = ops.replace(stateMarker, stateMarker + '\n    const [selectedAuthorsForCatalogue, setSelectedAuthorsForCatalogue] = React.useState<number[]>([]);');
  }

  // Add checkbox header
  const thIdx = ops.indexOf('<th>Author Details</th>');
  if (thIdx > -1) {
    const before = ops.slice(0, thIdx);
    const after = ops.slice(thIdx);
    ops = before + '<th style={{ width: 40, padding: "8px" }}><input type="checkbox" title="Select All" onChange={e => setSelectedAuthorsForCatalogue(e.target.checked ? authors.map((a: any) => a.id) : [])} checked={authors.length > 0 && selectedAuthorsForCatalogue.length === authors.length} /></th>\n                ' + after;
  }

  // Add checkbox cell to rows
  ops = ops.replaceAll(
    '<tr key={author.id}>\n                  <td>',
    '<tr key={author.id}>\n                  <td style={{ textAlign: "center" }}><input type="checkbox" checked={selectedAuthorsForCatalogue.includes(author.id)} onChange={e => { if (e.target.checked) setSelectedAuthorsForCatalogue(prev => [...prev, author.id]); else setSelectedAuthorsForCatalogue(prev => prev.filter(id => id !== author.id)); }} /></td>\n                  <td>'
  );
  
  // Also handle \r\n
  ops = ops.replaceAll(
    '<tr key={author.id}>\r\n                  <td>',
    '<tr key={author.id}>\r\n                  <td style={{ textAlign: "center" }}><input type="checkbox" checked={selectedAuthorsForCatalogue.includes(author.id)} onChange={e => { if (e.target.checked) setSelectedAuthorsForCatalogue(prev => [...prev, author.id]); else setSelectedAuthorsForCatalogue(prev => prev.filter(id => id !== author.id)); }} /></td>\r\n                  <td>'
  );

  // Add button
  const btnMarker = '<Download className="w-4 h-4" /> Export CSV\n            </button>';
  if (ops.includes(btnMarker)) {
    ops = ops.replace(btnMarker, btnMarker + '\n            {selectedAuthorsForCatalogue.length > 0 && (\n              <button onClick={() => { const url = (import.meta.env.VITE_API_URL || "http://localhost:3001") + "/api/admin/catalogue/selected?ids=" + selectedAuthorsForCatalogue.join(","); window.open(url, "_blank"); }} className="dash-btn dash-btn-primary flex items-center gap-2 bg-paa-navy text-white text-xs whitespace-nowrap">\n                <Download className="w-4 h-4" /> Download Catalogue ({selectedAuthorsForCatalogue.length})\n              </button>\n            )}');
  } else {
      const btnMarker2 = '<Download className="w-4 h-4" /> Export CSV\r\n            </button>';
      if (ops.includes(btnMarker2)) {
          ops = ops.replace(btnMarker2, btnMarker2 + '\r\n            {selectedAuthorsForCatalogue.length > 0 && (\r\n              <button onClick={() => { const url = (import.meta.env.VITE_API_URL || "http://localhost:3001") + "/api/admin/catalogue/selected?ids=" + selectedAuthorsForCatalogue.join(","); window.open(url, "_blank"); }} className="dash-btn dash-btn-primary flex items-center gap-2 bg-paa-navy text-white text-xs whitespace-nowrap">\r\n                <Download className="w-4 h-4" /> Download Catalogue ({selectedAuthorsForCatalogue.length})\r\n              </button>\r\n            )}');
      }
  }

  fs.writeFileSync('c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx', ops, 'utf8');
  console.log('Added selectedAuthorsForCatalogue logic successfully');
} else {
  console.log('selectedAuthorsForCatalogue already exists');
}
