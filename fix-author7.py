import sys
import re

def fix_author_dashboard_performance():
    with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Define the chunk to replace
    target = """      {activeTab === 'performance' && (
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
      )}"""
    
    replace = """      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="mb-2">
              <label className="text-sm font-semibold text-gray-700 block mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-500" /> Analyze Specific Books:</label>
              <div className="flex flex-wrap gap-4">
                {books.map((b: any) => (
                  <label key={b.id} className="flex items-center gap-2 text-sm cursor-pointer bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm hover:border-indigo-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedBookIds.includes(b.id.toString())}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedBookIds([...selectedBookIds, b.id.toString()]);
                        else setSelectedBookIds(selectedBookIds.filter(id => id !== b.id.toString()));
                      }}
                      className="text-paa-navy focus:ring-paa-navy rounded border-gray-300"
                    />
                    <span className="font-medium text-gray-700">{b.title}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-2 mt-4">
             {(() => {
                 let totalSent = 0;
                 let totalSold = 0;
                 let totalReturned = 0;
                 let totalRev = 0;
                 let bestEvent = { name: '-', rev: 0 };
                 let eventsWithSales = 0;
                 
                 validParticipations.forEach(evt => {
                     let evtSent = 0;
                     let evtSold = 0;
                     let evtReturned = 0;
                     let evtRev = 0;
                     
                     let evtBooks: any[] = [];
                     if (evt.isInvite) evtBooks = getEventBooks(evt.id);
                     else if (evt.isPast && evt.isDataUpdated) evtBooks = evt.books || [];
                     
                     evtBooks.forEach((b: any) => {
                         if (selectedBookIds.length === 0 || selectedBookIds.includes(b.bookId?.toString() || b.id?.toString())) {
                             evtSent += (b.listedStock || b.sent || 0);
                             evtSold += (b.soldStock || b.sold || 0);
                             evtReturned += (b.returnedStock || b.returned || 0);
                             evtRev += (b.soldStock || b.sold || 0) * (b.mrp || b.book?.mrp || 0);
                         }
                     });
                     
                     totalSent += evtSent;
                     totalSold += evtSold;
                     totalReturned += evtReturned;
                     totalRev += evtRev;
                     
                     if (evtRev > 0) {
                         eventsWithSales++;
                         if (evtRev > bestEvent.rev) bestEvent = { name: evt.name, rev: evtRev };
                     }
                 });
                 
                 const sellThrough = totalSent > 0 ? ((totalSold / totalSent) * 100).toFixed(1) : 0;
                 const returnRate = totalSent > 0 ? ((totalReturned / totalSent) * 100).toFixed(1) : 0;
                 const avgRev = eventsWithSales > 0 ? Math.round(totalRev / eventsWithSales) : 0;
                 
                 return (
                    <>
                       <div className="bg-white p-4 rounded-xl border border-paa-navy/10 shadow-premium flex flex-col justify-center">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-indigo-400" /> Sell-Through Rate</div>
                          <div className="text-2xl font-black text-indigo-600">{sellThrough}%</div>
                       </div>
                       <div className="bg-white p-4 rounded-xl border border-paa-navy/10 shadow-premium flex flex-col justify-center">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3 text-orange-400" /> Return Rate</div>
                          <div className="text-2xl font-black text-orange-600">{returnRate}%</div>
                       </div>
                       <div className="bg-white p-4 rounded-xl border border-paa-navy/10 shadow-premium flex flex-col justify-center">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Package className="w-3 h-3 text-gray-400" /> Total Copies Sent</div>
                          <div className="text-2xl font-black text-paa-navy">{totalSent}</div>
                       </div>
                       <div className="bg-white p-4 rounded-xl border border-paa-navy/10 shadow-premium flex flex-col justify-center">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3 text-emerald-400" /> Avg Rev / Event</div>
                          <div className="text-2xl font-black text-emerald-600">₹{avgRev}</div>
                       </div>
                       <div className="bg-white p-4 rounded-xl border border-paa-navy/10 shadow-premium flex flex-col justify-center">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-paa-navy" /> Best Event</div>
                          <div className="text-sm font-black text-paa-navy truncate" title={bestEvent.name}>{bestEvent.name}</div>
                          <div className="text-[10px] text-emerald-600 font-bold mt-1">₹{bestEvent.rev.toLocaleString()} Rev</div>
                       </div>
                    </>
                 );
             })()}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h4 className="font-bold text-paa-navy mb-4">Book Sales Performance Over Time</h4>
            <div className="w-full overflow-x-auto pb-4">
              <div className="h-64" style={{ minWidth: `${Math.max(100, validParticipations.length * 80)}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={validParticipations.map((evt: any) => {
                  let sold = 0;
                  let evtBooks: any[] = [];
                  if (evt.isInvite) evtBooks = getEventBooks(evt.id);
                  else if (evt.isPast && evt.isDataUpdated) evtBooks = evt.books || [];
                  evtBooks.forEach((b: any) => {
                    if (selectedBookIds.length === 0 || selectedBookIds.includes(b.bookId?.toString() || b.id?.toString())) {
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

          <div className="bg-white rounded-xl shadow-premium border border-paa-navy/5 overflow-hidden mb-8">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#f0f4f8] text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">
                  <th className="px-6 py-4 w-1/4">Participated Event</th>
                  <th className="px-4 py-4 text-right">Copies Sent</th>
                  <th className="px-4 py-4 text-right">Copies Sold</th>
                  <th className="px-4 py-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {validParticipations.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-sm text-paa-gray-text italic">No events found.</td></tr>}
                {validParticipations.map((evt: any, i: number) => {
                  let sent = 0;
                  let sold = 0;
                  let rev = 0;

                  let evtBooks: any[] = [];
                  if (evt.isInvite) evtBooks = getEventBooks(evt.id);
                  else if (evt.isPast && evt.isDataUpdated) evtBooks = evt.books || [];

                  evtBooks.forEach((b: any) => {
                    if (selectedBookIds.length === 0 || selectedBookIds.includes(b.bookId?.toString() || b.id?.toString())) {
                      sent += (b.listedStock || b.sent || 0);
                      sold += (b.soldStock || b.sold || 0);
                      rev += (b.soldStock || b.sold || 0) * (b.mrp || b.book?.mrp || 0);
                    }
                  });

                  return (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-paa-navy">{evt.name}</td>
                      <td className="px-4 py-4 text-sm font-bold text-gray-700 text-right">{sent > 0 ? sent : '-'}</td>
                      <td className="px-4 py-4 text-sm font-bold text-paa-navy text-right">{sold > 0 ? sold : '-'}</td>
                      <td className="px-4 py-4 text-sm font-bold text-emerald-700 text-right">{rev > 0 ? `₹${rev.toLocaleString()}` : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}"""
    
    # We will use simple replace. 
    # Let's ensure there are no issues with the string exactness.
    # To be safer, I will do a search and replace using regex to capture everything between {activeTab === 'performance' && (  ... )}
    
    target_regex = re.compile(r"\{activeTab === 'performance' && \(\s*<div className=\"space-y-6\">\s*<div className=\"bg-white border border-gray-200 rounded-xl p-6 shadow-sm\">\s*<h4 className=\"font-bold text-paa-navy mb-4\">Book Sales Performance Over Time</h4>.*?<table className=\"w-full text-left border-collapse whitespace-nowrap\">.*?</table>\s*</div>\s*</div>\s*\)}", re.DOTALL)
    
    match = target_regex.search(content)
    if match:
        content = content[:match.start()] + replace + content[match.end():]
        with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
        print("SUCCESS")
    else:
        print("REGEX FAILED TO MATCH")

if __name__ == '__main__':
    fix_author_dashboard_performance()
