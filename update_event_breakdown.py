import os
import re

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    data = f.read()

# Add expandedAuthorId state
data = data.replace("const [authorSearch, setAuthorSearch] = useState('');", "const [authorSearch, setAuthorSearch] = useState('');\n  const [expandedAuthorId, setExpandedAuthorId] = useState<number | null>(null);")

# Update Back button
old_back_btn = 'className="dash-btn dash-btn-ghost text-gray-500 hover:text-gray-700"'
new_back_btn = 'className="dash-btn bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors shadow-sm"'
data = data.replace(old_back_btn, new_back_btn)

# Add KPI cards
kpi_html = """               <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                   <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Authors</div>
                      <div className="text-xl font-serif text-paa-navy font-bold">{selectedEventBreakdown.isLegacy ? (selectedEventBreakdown.authorsParticipated || selectedEventBreakdown.aggAuthors || 0) : (selectedEventBreakdown._count?.eventAuthors || 0)}</div>
                   </div>
                   <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
                      <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">Total Listed</div>
                      <div className="text-xl font-serif text-blue-800 font-bold">{selectedEventBreakdown.isLegacy ? (selectedEventBreakdown.aggSent || 0) : (selectedEventBreakdown.eventBooks?.reduce((s,b)=>s+(b.listedStock||0), 0) || 0)}</div>
                   </div>
                   <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 shadow-sm">
                      <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1">Total Sold</div>
                      <div className="text-xl font-serif text-indigo-800 font-bold">{selectedEventBreakdown.isLegacy ? (selectedEventBreakdown.booksSold || selectedEventBreakdown.aggSold || 0) : (selectedEventBreakdown.eventBooks?.reduce((s,b)=>s+(b.soldStock||0), 0) || 0)}</div>
                   </div>
                   <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
                      <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Total Sale</div>
                      <div className="text-xl font-serif text-emerald-800 font-bold">₹{selectedEventBreakdown.isLegacy ? (selectedEventBreakdown.aggRevenue || 0) : (selectedEventBreakdown.eventBooks?.reduce((s,b)=>s+((b.soldStock||0)*(b.book?.mrp||0)), 0) || 0)}</div>
                   </div>
                   <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 shadow-sm">
                      <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider mb-1">Best Selling Book</div>
                      <div className="text-sm font-bold text-purple-900 truncate">
                         {(() => {
                             if (selectedEventBreakdown.isLegacy) return 'N/A';
                             let max = -1; let btitle = '-';
                             (selectedEventBreakdown.eventBooks || []).forEach(b => { if((b.soldStock||0)>max) { max = b.soldStock; btitle = b.book?.title||''; } });
                             return btitle;
                         })()}
                      </div>
                   </div>
               </div>"""

# Insert KPI html just after the header
header_end = """                 </button>
               </div>"""
if header_end in data:
    data = data.replace(header_end, header_end + "\n" + kpi_html)

# Auto-calculate Returned
# Find: newBooks[idx].listedStock = parseInt(e.target.value) || 0;
# Change: if (newBooks[idx].soldStock > 0) newBooks[idx].returnedStock = Math.max(0, newBooks[idx].listedStock - newBooks[idx].soldStock);
calc_listed = """                                      newBooks[idx].listedStock = parseInt(e.target.value) || 0;
                                      setManageAuthorBooks(newBooks);"""
new_calc_listed = """                                      newBooks[idx].listedStock = parseInt(e.target.value) || 0;
                                      if (newBooks[idx].listedStock > 0 && newBooks[idx].soldStock > 0) newBooks[idx].returnedStock = Math.max(0, newBooks[idx].listedStock - newBooks[idx].soldStock);
                                      setManageAuthorBooks(newBooks);"""
data = data.replace(calc_listed, new_calc_listed)

calc_sold = """                                      newBooks[idx].soldStock = parseInt(e.target.value) || 0;
                                      setManageAuthorBooks(newBooks);"""
new_calc_sold = """                                      newBooks[idx].soldStock = parseInt(e.target.value) || 0;
                                      if (newBooks[idx].listedStock > 0 && newBooks[idx].soldStock > 0) newBooks[idx].returnedStock = Math.max(0, newBooks[idx].listedStock - newBooks[idx].soldStock);
                                      setManageAuthorBooks(newBooks);"""
data = data.replace(calc_sold, new_calc_sold)

# Authors table changes
old_tbody = """                             <tbody className="divide-y divide-gray-100">
                                 {authors.filter((a: any) => a.name.toLowerCase().includes(authorSearch.toLowerCase())).slice(0, 50).map((a: any, i: number) => (
                                     <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                         <td className="p-3 font-semibold text-paa-navy">{a.name}</td>
                                         <td className="p-3 text-sm text-gray-600">{a.books?.length || 0} Books</td>
                                         <td className="p-3 font-mono text-sm text-gray-600">--</td>
                                         <td className="p-3 font-mono text-sm text-gray-600">--</td>
                                         <td className="p-3 font-mono text-sm text-gray-600">--</td>
                                         <td className="p-3">
                                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold uppercase">Unpublished</span>
                                         </td>
                                         <td className="p-3 text-center">
                                             <button onClick={() => handleEditAuthorData(a)} className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-bold border border-indigo-200 transition-colors shadow-sm">
                                                 Edit
                                             </button>
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>"""

new_tbody = """                             <tbody className="divide-y divide-gray-100">
                                 {authors.filter((a: any) => a.name.toLowerCase().includes(authorSearch.toLowerCase())).slice(0, 50).map((a: any, i: number) => {
                                     const listed = a.books?.reduce((s:number,b:any)=>s+(b.listedStock||0),0)||0;
                                     const sold = a.books?.reduce((s:number,b:any)=>s+(b.soldStock||0),0)||0;
                                     const rev = a.books?.reduce((s:number,b:any)=>s+((b.soldStock||0)*(b.book?.mrp||0)),0)||0;
                                     const isExpanded = expandedAuthorId === a.id;
                                     return (
                                     <React.Fragment key={i}>
                                     <tr className="hover:bg-gray-50/50 transition-colors">
                                         <td className="p-3 font-semibold text-paa-navy">{a.name}</td>
                                         <td className="p-3 text-sm text-gray-600">{a.books?.length || 0} Books</td>
                                         <td className="p-3 font-mono text-sm text-gray-600">{listed}</td>
                                         <td className="p-3 font-mono text-sm text-gray-600">{sold}</td>
                                         <td className="p-3 font-mono text-sm text-emerald-600 font-bold">₹{rev}</td>
                                         <td className="p-3">
                                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold uppercase">Unpublished</span>
                                         </td>
                                         <td className="p-3 text-center">
                                             <div className="flex gap-2 justify-center items-center">
                                                 <button onClick={() => setExpandedAuthorId(isExpanded ? null : a.id)} className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-bold border border-gray-200 transition-colors shadow-sm">
                                                     {isExpanded ? '▲' : '▼'}
                                                 </button>
                                                 <button onClick={() => handleEditAuthorData(a)} className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-bold border border-indigo-200 transition-colors shadow-sm whitespace-nowrap">
                                                     Manage Data
                                                 </button>
                                             </div>
                                         </td>
                                     </tr>
                                     {isExpanded && (
                                         <tr>
                                             <td colSpan={7} className="p-0 border-b border-gray-200">
                                                 <div className="bg-gray-50 p-4 border-l-4 border-paa-navy m-2 rounded-r-lg">
                                                     <h5 className="text-xs font-bold text-gray-500 uppercase mb-3">Individual Book Breakdown</h5>
                                                     {a.books?.length > 0 ? (
                                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                             {a.books.map((b:any, j:number) => (
                                                                 <div key={j} className="bg-white p-3 rounded border border-gray-200 text-sm flex justify-between items-center shadow-sm">
                                                                     <div className="font-semibold text-paa-navy truncate max-w-[200px]">{b.book?.title}</div>
                                                                     <div className="flex gap-4 font-mono text-xs">
                                                                         <div>Listed: <span className="font-bold text-gray-700">{b.listedStock||0}</span></div>
                                                                         <div>Sold: <span className="font-bold text-indigo-700">{b.soldStock||0}</span></div>
                                                                     </div>
                                                                 </div>
                                                             ))}
                                                         </div>
                                                     ) : (
                                                         <p className="text-xs text-gray-500">No books found for this author in this event.</p>
                                                     )}
                                                 </div>
                                             </td>
                                         </tr>
                                     )}
                                     </React.Fragment>
                                 )})}
                             </tbody>"""

data = data.replace(old_tbody, new_tbody)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(data)

print("Updated event breakdown!")
