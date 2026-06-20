import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add state for the Report Modal
if "const [reportEventId, setReportEventId] = useState<number | null>(null);" not in content:
    content = content.replace(
        "const [isEventModalOpen, setIsEventModalOpen] = useState(false);",
        "const [isEventModalOpen, setIsEventModalOpen] = useState(false);\n  const [reportEventId, setReportEventId] = useState<number | null>(null);\n  const [eventReportData, setEventReportData] = useState<any[]>([]);"
    )

# 2. Add API fetch function
fetch_report_code = """
  const fetchEventReport = async (eventId: number) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/events/${eventId}/report`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEventReportData(res.data);
      setReportEventId(eventId);
    } catch (err) {
      toast.error('Failed to load event report');
    }
  };
"""
if "fetchEventReport" not in content:
    content = content.replace(
        "const handleBroadcastEvent",
        fetch_report_code + "\n  const handleBroadcastEvent"
    )

# 3. Add the button to the Event Card
if "View Sales Report" not in content:
    content = content.replace(
        """                     <a href={`/events/${evt.id}/catalogue`} target="_blank" rel="noopener noreferrer" className="block text-center w-full py-2 bg-paa-navy hover:bg-paa-navy/90 text-white text-xs font-bold uppercase tracking-widest transition-colors">
                        View Live Catalogue
                     </a>""",
        """                     <a href={`/events/${evt.id}/catalogue`} target="_blank" rel="noopener noreferrer" className="block text-center w-full py-2 bg-paa-navy hover:bg-paa-navy/90 text-white text-xs font-bold uppercase tracking-widest transition-colors">
                        View Live Catalogue
                     </a>
                     {evt.status === 'Past' && (
                       <button onClick={() => fetchEventReport(evt.id)} className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-widest transition-colors border border-purple-200 mt-2">
                          View Sales & Settlement Report
                       </button>
                     )}"""
    )

# 4. Add the Report Modal JSX
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
                           const price = row.book.mrp;
                           const sold = row.soldStock;
                           const revenue = price * sold;
                           const adminCut = revenue * 0.30;
                           const authorPayout = revenue * 0.70;
                           return (
                              <tr key={row.id} className="hover:bg-gray-50">
                                 <td className="px-4 py-3">{row.author.name}</td>
                                 <td className="px-4 py-3 font-medium text-paa-navy">{row.book.title}</td>
                                 <td className="px-4 py-3 text-center">{row.listedStock}</td>
                                 <td className="px-4 py-3 text-center font-bold">{sold}</td>
                                 <td className="px-4 py-3 text-center text-gray-500">{row.returnedStock}</td>
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
                    Total Event Revenue: <span className="text-paa-navy text-sm">₹{eventReportData.reduce((sum, r) => sum + (r.book.mrp * r.soldStock), 0).toFixed(2)}</span>
                 </div>
                 <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Total Author Payouts: <span className="text-green-700 text-sm">₹{eventReportData.reduce((sum, r) => sum + ((r.book.mrp * r.soldStock) * 0.70), 0).toFixed(2)}</span>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}
"""

if "{reportEventId && (" not in content:
    content = content.replace("{/* Image Modal */}", modal_code + "\n      {/* Image Modal */}")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
