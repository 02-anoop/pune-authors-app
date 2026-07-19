import re

def rewrite_book_performance():
    with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
        
    # 1. KPI Cards replacement
    kpi_cards_target = """                       <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col justify-center relative group cursor-default">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-indigo-400" /> Sell-Through Rate</div>
                          <div className="text-3xl font-serif font-bold text-indigo-700">{sellThrough}%</div>
                          <div className="text-[10px] text-orange-500 font-bold mt-1">Returns: {returnRate}%</div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none text-center shadow-lg">Percentage of the inventory you sent that successfully sold vs returned.</div>
                       </div>
                       <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col justify-center relative group cursor-default">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Package className="w-3 h-3 text-gray-400" /> Total Books Sold</div>
                          <div className="text-3xl font-serif font-bold text-paa-navy">{totalSold}</div>
                          <div className="text-[10px] text-gray-500 font-bold mt-1">Avg: {validParticipations.length > 0 ? (totalSold / validParticipations.length).toFixed(1) : 0} / event</div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none text-center shadow-lg">Total number of books sold, and the average per event.</div>
                       </div>
                       <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col justify-center relative group cursor-default">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3 text-emerald-400" /> Total Revenue</div>
                          <div className="text-3xl font-serif font-bold text-emerald-700">₹{totalRev.toLocaleString()}</div>
                          <div className="text-[10px] text-gray-500 font-bold mt-1">Avg: ₹{avgRev.toLocaleString()} / event</div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none text-center shadow-lg">Total gross revenue and average earnings across your events.</div>
                       </div>
                       <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col justify-center relative group cursor-default">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-paa-navy" /> Best Event</div>
                          <div className="text-lg font-serif font-bold text-paa-navy" title={bestEvent.name}>{bestEvent.name}</div>
                          <div className="text-[10px] text-emerald-600 font-bold mt-1">₹{bestEvent.rev.toLocaleString()} • {bestEvent.sold} Sold</div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none text-center shadow-lg">The event that generated the highest revenue for you.</div>
                       </div>
                       <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col justify-center relative group cursor-default">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3 text-purple-400" /> Best Book</div>
                          <div className="text-lg font-serif font-bold text-purple-700" title={bestBook.title}>{bestBook.title}</div>
                          <div className="text-[10px] text-purple-500 font-bold mt-1">₹{bestBook.rev.toLocaleString()} • {bestBook.sold} Sold</div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none text-center shadow-lg">The specific title that generated the most gross revenue across all events.</div>
                       </div>
                       <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col justify-center relative group cursor-default">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-blue-400" /> Fastest Mover</div>
                          <div className="text-lg font-serif font-bold text-blue-700 truncate" title={fastestMover.title}>{fastestMover.title}</div>
                          <div className="text-[10px] text-blue-500 font-bold mt-1">{fastestMover.rate > 0 ? fastestMover.rate.toFixed(1) : 0}% Sold</div>
                          <div className="absolute top-full right-0 md:left-1/2 md:-translate-x-1/2 mt-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none text-center shadow-lg">The book with the highest sell-through rate overall.</div>
                       </div>"""
                       
    kpi_cards_replace = """                       <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col justify-center relative group cursor-default">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-indigo-400" /> Sell-Through Rate</div>
                          <div className="text-3xl font-serif font-bold text-indigo-700">{sellThrough}%</div>
                          <div className="text-[10px] text-orange-500 font-bold mt-1">Returns: {returnRate}%</div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none text-center shadow-lg">Percentage of the inventory you sent that successfully sold vs returned.</div>
                       </div>
                       <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col justify-center relative group cursor-default">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3 text-purple-400" /> Best Book</div>
                          <div className="text-lg font-serif font-bold text-purple-700" title={bestBook.title}>{bestBook.title}</div>
                          <div className="text-[10px] text-purple-500 font-bold mt-1">₹{bestBook.rev.toLocaleString()} • {bestBook.sold} Sold</div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none text-center shadow-lg">The specific title that generated the most gross revenue across all events.</div>
                       </div>
                       <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col justify-center relative group cursor-default">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-blue-400" /> Fastest Mover</div>
                          <div className="text-lg font-serif font-bold text-blue-700 truncate" title={fastestMover.title}>{fastestMover.title}</div>
                          <div className="text-[10px] text-blue-500 font-bold mt-1">{fastestMover.rate > 0 ? fastestMover.rate.toFixed(1) : 0}% Sold</div>
                          <div className="absolute top-full right-0 md:left-1/2 md:-translate-x-1/2 mt-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none text-center shadow-lg">The book with the highest sell-through rate overall.</div>
                       </div>"""
                       
    content = content.replace(kpi_cards_target, kpi_cards_replace)
    
    # 2. Table Replacement
    table_target = """          <div className="flex justify-between items-end mb-4">
            <h4 className="font-bold text-paa-navy text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-500" /> Event Performance Breakdown</h4>
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sort By:</span>
                <select className="border border-gray-200 rounded-lg text-sm font-bold text-paa-navy p-2 outline-none cursor-pointer bg-white" value={bpSort} onChange={e => setBpSort(e.target.value)}>
                    <option value="revenue_desc">Highest Revenue</option>
                    <option value="revenue_asc">Lowest Revenue</option>
                    <option value="sold_desc">Most Copies Sold</option>
                    <option value="date_desc">Newest Events</option>
                    <option value="date_asc">Oldest Events</option>
                </select>
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
                {(() => {
                   const enrichedEvents = validParticipations.map((evt: any) => {
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
                     
                     return { ...evt, _sent: sent, _sold: sold, _rev: rev, _date: new Date(evt.startDate || evt.date).getTime() };
                   });
                   
                   enrichedEvents.sort((a, b) => {
                       if (bpSort === 'revenue_desc') return b._rev - a._rev || b._date - a._date;
                       if (bpSort === 'revenue_asc') return a._rev - b._rev || a._date - b._date;
                       if (bpSort === 'date_desc') return b._date - a._date;
                       if (bpSort === 'date_asc') return a._date - b._date;
                       if (bpSort === 'sold_desc') return b._sold - a._sold || b._rev - a._rev;
                       return b._rev - a._rev;
                   });
                   
                   return enrichedEvents.map((evt: any, i: number) => {
                  let sent = 0;
                  let sold = 0;
                  let rev = 0;

                  return (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-paa-navy">
                         {evt.name}
                         <div className="text-[10px] font-medium text-gray-400 mt-1">{new Date(evt.startDate || evt.date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-gray-700 text-right">{evt._sent > 0 ? evt._sent : '-'}</td>
                      <td className="px-4 py-4 text-sm font-bold text-paa-navy text-right">{evt._sold > 0 ? evt._sold : '-'}</td>
                      <td className="px-4 py-4 text-sm font-bold text-emerald-700 text-right">{evt._rev > 0 ? `₹${evt._rev.toLocaleString()}` : '-'}</td>
                    </tr>
                  );
                })})()}
              </tbody>
            </table>
          </div>"""
          
    table_replace = """          <div className="flex justify-between items-end mb-4">
            <h4 className="font-bold text-paa-navy text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-500" /> Book Performance Breakdown</h4>
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sort By:</span>
                <select className="border border-gray-200 rounded-lg text-sm font-bold text-paa-navy p-2 outline-none cursor-pointer bg-white" value={bpSort} onChange={e => setBpSort(e.target.value)}>
                    <option value="revenue_desc">Highest Revenue</option>
                    <option value="revenue_asc">Lowest Revenue</option>
                    <option value="sold_desc">Most Copies Sold</option>
                    <option value="rate_desc">Highest Sell-Through</option>
                </select>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-premium border border-paa-navy/5 overflow-hidden mb-8">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#f0f4f8] text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">
                  <th className="px-6 py-4 w-1/3">Book Title</th>
                  <th className="px-4 py-4 text-right">Copies Sent</th>
                  <th className="px-4 py-4 text-right">Copies Sold</th>
                  <th className="px-4 py-4 text-right">Sell-Through Rate</th>
                  <th className="px-4 py-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.keys(bookStats).length === 0 && <tr><td colSpan={5} className="p-8 text-center text-sm text-paa-gray-text italic">No books found.</td></tr>}
                {(() => {
                   const statsArray = Object.values(bookStats).map(bs => ({
                       ...bs,
                       rate: bs.sent > 0 ? (bs.sold / bs.sent) * 100 : 0
                   }));
                   
                   statsArray.sort((a, b) => {
                       if (bpSort === 'revenue_desc') return b.rev - a.rev;
                       if (bpSort === 'revenue_asc') return a.rev - b.rev;
                       if (bpSort === 'sold_desc') return b.sold - a.sold || b.rev - a.rev;
                       if (bpSort === 'rate_desc') return b.rate - a.rate || b.rev - a.rev;
                       return b.rev - a.rev;
                   });
                   
                   return statsArray.map((bs: any, i: number) => {
                  return (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-paa-navy whitespace-normal">
                         {bs.title}
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-gray-700 text-right">{bs.sent > 0 ? bs.sent : '-'}</td>
                      <td className="px-4 py-4 text-sm font-bold text-paa-navy text-right">{bs.sold > 0 ? bs.sold : '-'}</td>
                      <td className="px-4 py-4 text-sm font-bold text-indigo-600 text-right">{bs.rate > 0 ? `${bs.rate.toFixed(1)}%` : '-'}</td>
                      <td className="px-4 py-4 text-sm font-black text-emerald-700 text-right">{bs.rev > 0 ? `₹${bs.rev.toLocaleString()}` : '-'}</td>
                    </tr>
                  );
                })})()}
              </tbody>
            </table>
          </div>"""
          
    content = content.replace(table_target, table_replace)
    
    # 3. Change grid columns for KPI cards since there are only 3 now
    content = content.replace('<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-2 mt-4">', '<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4">')

    with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("DONE")

if __name__ == '__main__':
    rewrite_book_performance()
