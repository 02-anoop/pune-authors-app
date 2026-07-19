import sys
import re

def fix_author_dashboard():
    with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Best Event and Best Book to show 2nd best
    target1 = """                 let bestBook = { title: '-', rev: 0 };
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
                 });"""
                 
    replace1 = """                 let fastestMover = { title: '-', rate: 0 };
                 
                 const sortedEvents = eventStats.sort((a, b) => b.rev - a.rev);
                 bestEvent = sortedEvents[0] || { name: '-', rev: 0 };
                 const secondBestEvent = sortedEvents[1];
                 
                 const sortedBooks = Object.values(bookStats).sort((a, b) => b.rev - a.rev);
                 let bestBook = sortedBooks[0] || { title: '-', rev: 0 };
                 const secondBestBook = sortedBooks[1];
                 
                 Object.values(bookStats).forEach(bs => {
                     if (bs.sent > 0) {
                         const rate = (bs.sold / bs.sent) * 100;
                         if (rate >= fastestMover.rate && bs.sold > 0) {
                             if (rate > fastestMover.rate || bs.sold > (fastestMover.rate > 0 ? 0 : -1)) {
                                 fastestMover = { title: bs.title, rate };
                             }
                         }
                     }
                 });"""
                 
    target2 = """                     if (evtRev > 0) {
                         eventsWithSales++;
                         if (evtRev > bestEvent.rev) bestEvent = { name: evt.name, rev: evtRev };
                     }"""
    replace2 = """                     if (evtRev > 0) {
                         eventsWithSales++;
                         eventStats.push({ name: evt.name, rev: evtRev, date: evt.date || evt.startDate });
                     }"""
                     
    target3 = """                 let bestEvent = { name: '-', rev: 0 };
                 let eventsWithSales = 0;"""
    replace3 = """                 let bestEvent = { name: '-', rev: 0 };
                 let eventsWithSales = 0;
                 let eventStats: any[] = [];"""
                 
    # 2. Update the Best Event card HTML
    target4 = """                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-paa-navy" /> Best Event</div>
                          <div className="text-sm font-black text-paa-navy truncate" title={bestEvent.name}>{bestEvent.name}</div>
                          <div className="text-[10px] text-emerald-600 font-bold mt-1">₹{bestEvent.rev.toLocaleString()} Rev</div>"""
                          
    replace4 = """                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-paa-navy" /> Best Event</div>
                          <div className="text-sm font-black text-paa-navy truncate" title={bestEvent.name}>{bestEvent.name} <span className="text-[10px] text-emerald-600 font-bold">₹{bestEvent.rev.toLocaleString()}</span></div>
                          {secondBestEvent ? <div className="text-[10px] text-gray-500 truncate mt-1">2nd: {secondBestEvent.name} (₹{secondBestEvent.rev.toLocaleString()})</div> : <div className="text-[10px] text-transparent mt-1">-</div>}"""
                          
    # 3. Update the Best Book card HTML
    target5 = """                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3 text-purple-400" /> Best Book</div>
                          <div className="text-sm font-black text-purple-700 truncate" title={bestBook.title}>{bestBook.title}</div>
                          <div className="text-[10px] text-purple-500 font-bold mt-1">₹{bestBook.rev.toLocaleString()} Rev</div>"""
                          
    replace5 = """                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3 text-purple-400" /> Best Book</div>
                          <div className="text-sm font-black text-purple-700 truncate" title={bestBook.title}>{bestBook.title} <span className="text-[10px] text-purple-500 font-bold">₹{bestBook.rev.toLocaleString()}</span></div>
                          {secondBestBook ? <div className="text-[10px] text-gray-500 truncate mt-1">2nd: {secondBestBook.title} (₹{secondBestBook.rev.toLocaleString()})</div> : <div className="text-[10px] text-transparent mt-1">-</div>}"""

    # 4. Add sorting to the Participated Events table
    target6 = """              <thead>
                <tr className="bg-[#f0f4f8] text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">
                  <th className="px-6 py-4 w-1/4">Participated Event</th>
                  <th className="px-4 py-4 text-right">Copies Sent</th>
                  <th className="px-4 py-4 text-right">Copies Sold</th>
                  <th className="px-4 py-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {validParticipations.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-sm text-paa-gray-text italic">No events found.</td></tr>}
                {validParticipations.map((evt: any, i: number) => {"""
                
    replace6 = """              <thead>
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
                   
                   // Sort by revenue desc, then by date desc
                   enrichedEvents.sort((a, b) => b._rev - a._rev || b._date - a._date);
                   
                   return enrichedEvents.map((evt: any, i: number) => {"""

    target7 = """                  let evtBooks: any[] = [];
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
                })}"""
                
    replace7 = """                  return (
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
                })})()}"""

    content = content.replace(target1, replace1)
    content = content.replace(target2, replace2)
    content = content.replace(target3, replace3)
    content = content.replace(target4, replace4)
    content = content.replace(target5, replace5)
    content = content.replace(target6, replace6)
    content = content.replace(target7, replace7)

    with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS")

if __name__ == '__main__':
    fix_author_dashboard()
