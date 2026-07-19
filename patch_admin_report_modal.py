import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

modal_code = """
      {/* Event Report Modal */}
      {reportEventId && (
        <div className="fixed inset-0 bg-paa-navy/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-paa-navy/10 flex justify-between items-center bg-[#f8fafc]">
              <div>
                 <h2 className="text-2xl font-serif text-paa-navy">Event Settlement Report</h2>
                 <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">Full breakdown of all author sales and revenue.</p>
              </div>
              <button onClick={() => setReportEventId(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={24} className="text-gray-500" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
               {eventReportData.length === 0 ? (
                  <p className="text-center text-gray-500 italic">No books were listed for this event.</p>
               ) : (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                     <thead className="bg-[#e4ebf5] text-paa-navy uppercase tracking-widest text-xs border-b border-paa-navy/10">
                        <tr>
                           <th className="px-4 py-3 font-bold">Author</th>
                           <th className="px-4 py-3 font-bold">Book Title</th>
                           <th className="px-4 py-3 font-bold text-center">Listed</th>
                           <th className="px-4 py-3 font-bold text-center">Sold</th>
                           <th className="px-4 py-3 font-bold text-center">Returned</th>
                           <th className="px-4 py-3 font-bold text-right">Admin Cut (30%)</th>
                           <th className="px-4 py-3 font-bold text-right">Author Payout (70%)</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {eventReportData.map((row: any) => {
                           const price = row?.book?.mrp || 0;
                           const sold = row?.soldStock || 0;
                           const revenue = price * sold;
                           const adminCut = revenue * 0.30;
                           const authorPayout = revenue * 0.70;
                           return (
                              <tr key={row.id} className="hover:bg-gray-50">
                                 <td className="px-4 py-3">{row?.author?.name || 'N/A'}</td>
                                 <td className="px-4 py-3 font-medium text-paa-navy">{row?.book?.title || 'N/A'}</td>
                                 <td className="px-4 py-3 text-center">{row?.listedStock || 0}</td>
                                 <td className="px-4 py-3 text-center font-bold">{sold}</td>
                                 <td className="px-4 py-3 text-center text-gray-500">{row?.returnedStock || 0}</td>
                                 <td className="px-4 py-3 text-right text-gray-500">₹{adminCut.toFixed(2)}</td>
                                 <td className="px-4 py-3 text-right font-bold text-green-700">₹{authorPayout.toFixed(2)}</td>
                              </tr>
                           )
                        })}
                     </tbody>
                  </table>
               )}
            </div>
            {eventReportData.length > 0 && (
              <div className="p-4 border-t border-paa-navy/10 bg-gray-50 flex justify-between items-center">
                 <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Total Event Revenue: <span className="text-paa-navy text-sm">₹{eventReportData.reduce((sum, r) => sum + ((r?.book?.mrp || 0) * (r?.soldStock || 0)), 0).toFixed(2)}</span>
                 </div>
                 <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Total Author Payouts: <span className="text-green-700 text-sm">₹{eventReportData.reduce((sum, r) => sum + (((r?.book?.mrp || 0) * (r?.soldStock || 0)) * 0.70), 0).toFixed(2)}</span>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}
"""

if "{reportEventId && (" not in content:
    content = content.replace("{/* Order Details Modal */}", modal_code + "\n      {/* Order Details Modal */}")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
