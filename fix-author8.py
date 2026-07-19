import sys
import re

def fix_author_dashboard_insights():
    with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the insight cards grid
    target = """          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-2 mt-4">
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
          </div>"""
          
    replace = """          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-2 mt-4">
             {(() => {
                 let totalSent = 0;
                 let totalSold = 0;
                 let totalReturned = 0;
                 let totalRev = 0;
                 let bestEvent = { name: '-', rev: 0 };
                 let eventsWithSales = 0;
                 let bookStats: Record<string, { sold: number, rev: number, title: string, sent: number }> = {};
                 
                 validParticipations.forEach(evt => {
                     let evtSent = 0;
                     let evtSold = 0;
                     let evtReturned = 0;
                     let evtRev = 0;
                     
                     let evtBooks: any[] = [];
                     if (evt.isInvite) evtBooks = getEventBooks(evt.id);
                     else if (evt.isPast && evt.isDataUpdated) evtBooks = evt.books || [];
                     
                     evtBooks.forEach((b: any) => {
                         const bId = b.bookId?.toString() || b.id?.toString();
                         if (selectedBookIds.length === 0 || selectedBookIds.includes(bId)) {
                             const listed = (b.listedStock || b.sent || 0);
                             const sold = (b.soldStock || b.sold || 0);
                             const returned = (b.returnedStock || b.returned || 0);
                             const rev = sold * (b.mrp || b.book?.mrp || 0);
                             
                             evtSent += listed;
                             evtSold += sold;
                             evtReturned += returned;
                             evtRev += rev;
                             
                             if (bId && bId !== 'undefined') {
                                 if (!bookStats[bId]) {
                                     const bDetails = books.find(book => book.id.toString() === bId);
                                     bookStats[bId] = { sold: 0, rev: 0, sent: 0, title: b.title || bDetails?.title || 'Unknown' };
                                 }
                                 bookStats[bId].sold += sold;
                                 bookStats[bId].sent += listed;
                                 bookStats[bId].rev += rev;
                             }
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
                 
                 let bestBook = { title: '-', rev: 0 };
                 let fastestMover = { title: '-', rate: 0 };
                 
                 Object.values(bookStats).forEach(bs => {
                     if (bs.rev > bestBook.rev) bestBook = { title: bs.title, rev: bs.rev };
                     if (bs.sent > 0) {
                         const rate = (bs.sold / bs.sent) * 100;
                         if (rate >= fastestMover.rate && bs.sold > 0) {
                             // Tie breaker: if same rate, pick one with more sales
                             if (rate > fastestMover.rate || bs.sold > (fastestMover.rate > 0 ? 0 : -1)) {
                                 fastestMover = { title: bs.title, rate };
                             }
                         }
                     }
                 });
                 
                 return (
                    <>
                       <div className="bg-white p-4 rounded-xl border border-paa-navy/10 shadow-premium flex flex-col justify-center relative group cursor-default">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-indigo-400" /> Sell-Through Rate</div>
                          <div className="text-2xl font-black text-indigo-600">{sellThrough}%</div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none text-center shadow-lg">Percentage of the inventory you sent that successfully sold.</div>
                       </div>
                       <div className="bg-white p-4 rounded-xl border border-paa-navy/10 shadow-premium flex flex-col justify-center relative group cursor-default">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3 text-orange-400" /> Return Rate</div>
                          <div className="text-2xl font-black text-orange-600">{returnRate}%</div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none text-center shadow-lg">Percentage of your inventory that went unsold and was returned.</div>
                       </div>
                       <div className="bg-white p-4 rounded-xl border border-paa-navy/10 shadow-premium flex flex-col justify-center relative group cursor-default">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3 text-emerald-400" /> Avg Rev / Event</div>
                          <div className="text-2xl font-black text-emerald-600">₹{avgRev.toLocaleString()}</div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none text-center shadow-lg">Your average earnings across all events where you had sales.</div>
                       </div>
                       <div className="bg-white p-4 rounded-xl border border-paa-navy/10 shadow-premium flex flex-col justify-center relative group cursor-default">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-paa-navy" /> Best Event</div>
                          <div className="text-sm font-black text-paa-navy truncate" title={bestEvent.name}>{bestEvent.name}</div>
                          <div className="text-[10px] text-emerald-600 font-bold mt-1">₹{bestEvent.rev.toLocaleString()} Rev</div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none text-center shadow-lg">The event that generated the highest revenue for you.</div>
                       </div>
                       <div className="bg-white p-4 rounded-xl border border-paa-navy/10 shadow-premium flex flex-col justify-center relative group cursor-default">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3 text-purple-400" /> Best Book</div>
                          <div className="text-sm font-black text-purple-700 truncate" title={bestBook.title}>{bestBook.title}</div>
                          <div className="text-[10px] text-purple-500 font-bold mt-1">₹{bestBook.rev.toLocaleString()} Rev</div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none text-center shadow-lg">The specific title that generated the most gross revenue across all events.</div>
                       </div>
                       <div className="bg-white p-4 rounded-xl border border-paa-navy/10 shadow-premium flex flex-col justify-center relative group cursor-default">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-blue-400" /> Fastest Mover</div>
                          <div className="text-sm font-black text-blue-700 truncate" title={fastestMover.title}>{fastestMover.title}</div>
                          <div className="text-[10px] text-blue-500 font-bold mt-1">{fastestMover.rate > 0 ? fastestMover.rate.toFixed(1) : 0}% Sold</div>
                          <div className="absolute top-full right-0 md:left-1/2 md:-translate-x-1/2 mt-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none text-center shadow-lg">The book with the highest sell-through rate overall.</div>
                       </div>
                    </>
                 );
             })()}
          </div>"""
          
    content = content.replace(target, replace)
    
    with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS")

if __name__ == '__main__':
    fix_author_dashboard_insights()
