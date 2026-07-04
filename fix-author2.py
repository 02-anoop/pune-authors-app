import sys

def fix_file():
    with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # The broken area starts around `{isPastPending ? (` and ends with `  );` before `<Modal isOpen={isOptInModalOpen}`
    start_str = "                {isPastPending ? ("
    end_str = "  <Modal isOpen={isOptInModalOpen} onClose={() => setIsOptInModalOpen(false)} title={`Review Invite: ${selectedInvite?.name}`}>"
    
    idx1 = content.find(start_str)
    idx2 = content.find(end_str, idx1)
    
    if idx1 == -1 or idx2 == -1:
        print("COULD NOT FIND INDICES")
        return

    replacement = """                {isPastPending ? (
                  <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">Data Pending</h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">The sales data for this past event has not been published by the admin yet. Please check back later.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                       <h4 className="font-bold text-paa-navy flex items-center gap-2"><Package className="w-4 h-4" /> Inventory & Sales Breakdown</h4>
                    </div>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                          <th className="p-4">Book Title</th>
                          <th className="p-4 text-right">Sent / Listed</th>
                          <th className="p-4 text-right">Sold</th>
                          <th className="p-4 text-right">Returned</th>
                          <th className="p-4 text-right">Revenue Generated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {displayBooks.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">No books listed for this event.</td></tr>}
                        {displayBooks.map((b: any, j: number) => (
                          <tr key={j} className="hover:bg-blue-50/30 transition-colors">
                            <td className="p-4 font-semibold text-gray-900">{b.title || books.find((ab: any) => ab.id === b.bookId)?.title || 'Unknown Book'}</td>
                            <td className="p-4 text-sm font-mono text-right text-gray-600">{b.listedStock || b.sent || 0}</td>
                            <td className="p-4 text-sm font-mono text-right text-paa-navy font-bold">{b.soldStock || b.sold || 0}</td>
                            <td className="p-4 text-sm font-mono text-right text-gray-600">{b.returnedStock || b.returned || 0}</td>
                            <td className="p-4 text-sm font-mono text-right text-emerald-600 font-bold bg-emerald-50/30">₹{b.revenue || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}


      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h4 className="font-bold text-paa-navy mb-4">Book Sales Performance Over Time</h4>
            <div className="w-full overflow-x-auto pb-4">
              <div className="h-64" style={{ minWidth: `${Math.max(100, allEvents.length * 80)}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={allEvents.filter((evt: any) => evt.isDataUpdated || !evt.isPast).map((evt: any) => {
                  let sold = 0;
                  let evtBooks: any[] = [];
                  if (evt.isPast) evtBooks = evt.books || [];
                  else evtBooks = getEventBooks(evt.id);
                  evtBooks.forEach((b: any) => {
                    if (selectedBookIds.length === 0 || selectedBookIds.includes(b.bookId.toString())) {
                      sold += (b.soldStock || b.sold || 0);
                    }
                  });
                  return { name: evt.name.length > 15 ? evt.name.substring(0, 15) + '...' : evt.name, sold };
                })} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }} />
                  <Bar dataKey="sold" name="Copies Sold" fill="#1e3a8a" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Select Books to Analyze:</label>
              <div className="flex flex-wrap gap-4">
                {books.map((b: any) => (
                  <label key={b.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBookIds.includes(b.id.toString())}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedBookIds([...selectedBookIds, b.id.toString()]);
                        else setSelectedBookIds(selectedBookIds.filter(id => id !== b.id.toString()));
                      }}
                      className="text-paa-navy focus:ring-paa-navy rounded"
                    />
                    {b.title}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-premium border border-paa-navy/5 overflow-hidden mb-8">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#f0f4f8] text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">
                  <th className="px-6 py-4 w-1/4">Event</th>
                  <th className="px-4 py-4 text-right">Copies Sent</th>
                  <th className="px-4 py-4 text-right">Copies Sold</th>
                  <th className="px-4 py-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allEvents.filter((evt: any) => evt.isDataUpdated || !evt.isPast).map((evt: any, i: number) => {
                  let sent = 0;
                  let sold = 0;
                  let rev = 0;

                  let evtBooks: any[] = [];
                  if (evt.isPast) evtBooks = evt.books || [];
                  else evtBooks = getEventBooks(evt.id);

                  evtBooks.forEach((b: any) => {
                    if (selectedBookIds.includes(b.bookId?.toString() || b.id?.toString())) {
                      sent += (b.listedStock || b.sent || 0);
                      sold += (b.soldStock || b.sold || 0);
                      rev += (b.revenue || 0);
                    }
                  });

                  if (sent === 0 && sold === 0 && rev === 0) return null;

                  return (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-paa-navy">{evt.name}</td>
                      <td className="px-4 py-4 text-sm font-bold text-gray-700 text-right">{sent > 0 ? sent : '-'}</td>
                      <td className="px-4 py-4 text-sm font-bold text-paa-navy text-right">{sold > 0 ? sold : '-'}</td>
                      <td className="px-4 py-4 text-sm font-bold text-emerald-700 text-right">{rev > 0 ? `₹${rev}` : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );

"""

    new_content = content[:idx1] + replacement + content[idx2:]
    
    with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print("FIXED SUCCESSFULLY PART 2")

if __name__ == '__main__':
    fix_file()
