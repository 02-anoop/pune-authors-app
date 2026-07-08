const fs = require('fs');

// 1. AuthorFullProfileView.tsx
let authorViewPath = 'c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorFullProfileView.tsx';
let authorViewContent = fs.readFileSync(authorViewPath, 'utf8');

authorViewContent = authorViewContent.replace(
  /<h3 className="text-2xl font-serif font-semibold text-paa-navy tracking-tight mb-4 border-l-4 border-paa-navy pl-2">Submitted Books<\/h3>\s*<div className="space-y-4">\s*\{authorProfile\.books\.length === 0 \? <p className="text-sm text-paa-gray-text">No books found\.<\/p> : authorProfile\.books\.map\(\(b: any, idx: number\) => \(/,
  `<h3 className="text-2xl font-serif font-semibold text-paa-navy tracking-tight mb-4 border-l-4 border-paa-navy pl-2">Book Catalogue</h3>
            <div className="space-y-4">
              {(() => {
                const newBooks = authorProfile.books.filter((b: any) => new Date(b.createdAt).getTime() > new Date(authorProfile.createdAt).getTime() + 60000);
                if (newBooks.length === 0) return <p className="text-sm text-paa-gray-text">No new book added by the author.</p>;
                return newBooks.map((b: any, idx: number) => (`
);

authorViewContent = authorViewContent.replace(
  /<div><span className="text-\[10px\] uppercase text-paa-gray-text block">Initial Stock<\/span><span className="text-sm font-bold text-paa-navy">\{b.stock\}<\/span><\/div>/,
  `<div><span className="text-[10px] uppercase text-paa-gray-text block">Initial Stock</span><span className="text-sm font-bold text-paa-navy">{b.stock}</span></div>
                      <div><span className="text-[10px] uppercase text-paa-gray-text block">Edition</span><span className="text-sm font-bold text-paa-navy">{b.edition || '-'}</span></div>
                      <div><span className="text-[10px] uppercase text-paa-gray-text block">Print Format</span><span className="text-sm font-bold text-paa-navy">{b.printFormat || '-'}</span></div>
                      <div><span className="text-[10px] uppercase text-paa-gray-text block">Purpose</span><span className="text-sm font-bold text-paa-navy">{b.purpose || '-'}</span></div>`
);
fs.writeFileSync(authorViewPath, authorViewContent, 'utf8');


// 2. OperationsDashboardPage.tsx
let adminDashPath = 'c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx';
let adminDashContent = fs.readFileSync(adminDashPath, 'utf8');

// Dashboard Overview (Grid 2 rows and Pie chart)
adminDashContent = adminDashContent.replace(
  /<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">([\s\S]*?)<\/div>\s*<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">/g,
  `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">$1</div>
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
            <h3 className="text-sm font-bold text-paa-navy uppercase tracking-widest mb-4">State Distribution</h3>
            {(() => {
                const knownStates = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir'];
                const stateCounts = {};
                orders.forEach(o => {
                    if (o.address) {
                        let foundState = 'Others';
                        for (const s of knownStates) {
                            if (o.address.toLowerCase().includes(s.toLowerCase())) { foundState = s; break; }
                        }
                        stateCounts[foundState] = (stateCounts[foundState] || 0) + 1;
                    }
                });
                const sorted = Object.entries(stateCounts).sort((a, b) => b[1] - a[1]);
                const top6 = sorted.slice(0, 6);
                const others = sorted.slice(6).reduce((sum, [_, count]) => sum + count, 0);
                const pieData = top6.map(([name, value]) => ({ name, value }));
                if (others > 0) pieData.push({ name: 'Others', value: others });
                
                const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
                if (pieData.length === 0) return <p className="text-sm text-gray-500 text-center">No state data available.</p>;
                return (
                    <div className="w-full h-48 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} fill="#8884d8" dataKey="value" label={({name, percent}) => \`\${name} (\${(percent * 100).toFixed(0)}%)\`} labelLine={false} style={{fontSize: '9px', fontWeight: 'bold'}}>
                                    {pieData.map((entry, index) => (
                                        <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>
                );
            })()}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
);

// Add missing Eye modal fields in Books Catalog
adminDashContent = adminDashContent.replace(
  /<div><span className="text-\[10px\] font-bold uppercase tracking-widest text-paa-gray-text block mb-1">Current Stock<\/span><span className="text-lg font-black text-paa-navy">\{selectedBookDetails\.stock\}<\/span><\/div>/,
  `<div><span className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text block mb-1">Current Stock</span><span className="text-lg font-black text-paa-navy">{selectedBookDetails.stock}</span></div>
              <div><span className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text block mb-1">Edition</span><span className="text-base font-bold text-paa-navy">{selectedBookDetails.edition || '-'}</span></div>
              <div><span className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text block mb-1">Print Format</span><span className="text-base font-bold text-paa-navy">{selectedBookDetails.printFormat || '-'}</span></div>
              <div><span className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text block mb-1">Purpose</span><span className="text-base font-bold text-paa-navy">{selectedBookDetails.purpose || '-'}</span></div>`
);

// Books Tab filter books
adminDashContent = adminDashContent.replace(
  /const renderAuthorsTab = \(\{ refreshTrigger \}: any\) => \{/,
  `const [selectedAuthorsForCatalogue, setSelectedAuthorsForCatalogue] = useState<number[]>([]);
  const renderAuthorsTab = ({ refreshTrigger }: any) => {
    const handleDownloadSelectedCatalogue = () => {
       if (selectedAuthorsForCatalogue.length === 0) return toast.error('Please select at least one author');
       window.open(\`/catalogue?pdf=true&authors=\${selectedAuthorsForCatalogue.join(',')}\`, '_blank');
    };
`
);

adminDashContent = adminDashContent.replace(
  /<button onClick=\{handleExportAuthorsCSV\} className="dash-btn dash-btn-ghost flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50">/,
  `<button onClick={handleDownloadSelectedCatalogue} disabled={selectedAuthorsForCatalogue.length === 0} className="dash-btn flex items-center gap-2 bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50">
              <Download className="w-4 h-4" /> Download Catalogue
            </button>
            <button onClick={handleExportAuthorsCSV} className="dash-btn dash-btn-ghost flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50">`
);

adminDashContent = adminDashContent.replace(
  /<tr>\s*<th>Author Details<\/th>/,
  `<tr>
                <th className="w-10 text-center"><input type="checkbox" onChange={(e) => {
                   if (e.target.checked) setSelectedAuthorsForCatalogue(authors.map(a => a.id));
                   else setSelectedAuthorsForCatalogue([]);
                }} checked={selectedAuthorsForCatalogue.length > 0 && selectedAuthorsForCatalogue.length === authors.length} /></th>
                <th>Author Details</th>`
);

adminDashContent = adminDashContent.replace(
  /<tr key=\{author\.id\}>\s*<td>/,
  `<tr key={author.id}>
                  <td className="text-center">
                     <input type="checkbox" checked={selectedAuthorsForCatalogue.includes(author.id)} onChange={(e) => {
                         if (e.target.checked) setSelectedAuthorsForCatalogue([...selectedAuthorsForCatalogue, author.id]);
                         else setSelectedAuthorsForCatalogue(selectedAuthorsForCatalogue.filter(id => id !== author.id));
                     }} />
                  </td>
                  <td>`
);


// Pie chart imports
if (!adminDashContent.includes('RechartsPieChart')) {
  adminDashContent = adminDashContent.replace(
    /import \{([^{}]*?)\} from 'recharts';/,
    (match, p1) => {
      if (!p1.includes('PieChart')) {
        return `import {${p1}, PieChart as RechartsPieChart, Pie, Cell, Tooltip} from 'recharts';`;
      }
      return match;
    }
  );
}

fs.writeFileSync(adminDashPath, adminDashContent, 'utf8');
console.log('Success Admin Part 2');
