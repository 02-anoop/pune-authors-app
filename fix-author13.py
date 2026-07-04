import re

def rewrite_book_breakdown():
    with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update bookStats calculation
    stats_target = """                 let eventStats: any[] = [];
                 let bookStats: Record<string, { sold: number, rev: number, title: string, sent: number }> = {};
                 
                 validParticipations.forEach(evt => {"""
    
    stats_replace = """                 let eventStats: any[] = [];
                 let bookStats: Record<string, { sold: number, rev: number, title: string, sent: number, events: any[] }> = {};
                 
                 validParticipations.forEach(evt => {"""

    content = content.replace(stats_target, stats_replace)

    # 2. Update the bookStats insertion
    push_target = """                                     const bDetails = books.find(book => book.id.toString() === bId);
                                     bookStats[bId] = { sold: 0, rev: 0, sent: 0, title: b.title || bDetails?.title || 'Unknown' };
                                 }
                                 bookStats[bId].sold += sold;
                                 bookStats[bId].sent += listed;
                                 bookStats[bId].rev += rev;"""
                                 
    push_replace = """                                     const bDetails = books.find(book => book.id.toString() === bId);
                                     bookStats[bId] = { sold: 0, rev: 0, sent: 0, title: b.title || bDetails?.title || 'Unknown', events: [] };
                                 }
                                 bookStats[bId].sold += sold;
                                 bookStats[bId].sent += listed;
                                 bookStats[bId].rev += rev;
                                 if (listed > 0 || sold > 0) {
                                     bookStats[bId].events.push({
                                         name: evt.name || 'Unknown Event',
                                         date: evt.date || evt.startDate,
                                         sent: listed,
                                         sold: sold,
                                         rev: rev
                                     });
                                 }"""

    content = content.replace(push_target, push_replace)

    # 3. Update the table rendering
    table_target = """                   return statsArray.map((bs: any, i: number) => {
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
                })})()}"""
                
    table_replace = """                   return statsArray.map((bs: any, i: number) => {
                  const isExpanded = expandedBookId === bs.title;
                  return (
                    <React.Fragment key={i}>
                      <tr onClick={() => setExpandedBookId(isExpanded ? null : bs.title)} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                        <td className="px-6 py-4 text-sm font-semibold text-paa-navy whitespace-normal flex items-center gap-2">
                           <div className={`transform transition-transform text-gray-400 group-hover:text-paa-navy ${isExpanded ? 'rotate-180' : ''}`}>▼</div>
                           {bs.title}
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-gray-700 text-right">{bs.sent > 0 ? bs.sent : '-'}</td>
                        <td className="px-4 py-4 text-sm font-bold text-paa-navy text-right">{bs.sold > 0 ? bs.sold : '-'}</td>
                        <td className="px-4 py-4 text-sm font-bold text-indigo-600 text-right">{bs.rate > 0 ? `${bs.rate.toFixed(1)}%` : '-'}</td>
                        <td className="px-4 py-4 text-sm font-black text-emerald-700 text-right">{bs.rev > 0 ? `₹${bs.rev.toLocaleString()}` : '-'}</td>
                      </tr>
                      {isExpanded && (
                          <tr>
                            <td colSpan={5} className="p-0 bg-gray-50 border-b border-gray-200">
                                <div className="p-4 pl-12">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <BookOpen className="w-3 h-3" /> Event Breakdown for {bs.title}
                                    </div>
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-200">
                                                <th className="pb-2 font-bold w-1/2">Event Name</th>
                                                <th className="pb-2 font-bold text-right">Date</th>
                                                <th className="pb-2 font-bold text-right">Sent</th>
                                                <th className="pb-2 font-bold text-right">Sold</th>
                                                <th className="pb-2 font-bold text-right">Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {bs.events?.length > 0 ? bs.events.map((ev: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-white transition-colors">
                                                    <td className="py-3 text-xs font-semibold text-paa-navy">{ev.name}</td>
                                                    <td className="py-3 text-[10px] text-gray-500 text-right">{new Date(ev.date).toLocaleDateString()}</td>
                                                    <td className="py-3 text-xs font-bold text-gray-700 text-right">{ev.sent > 0 ? ev.sent : '-'}</td>
                                                    <td className="py-3 text-xs font-bold text-paa-navy text-right">{ev.sold > 0 ? ev.sold : '-'}</td>
                                                    <td className="py-3 text-xs font-black text-emerald-700 text-right">{ev.rev > 0 ? `₹${ev.rev.toLocaleString()}` : '-'}</td>
                                                </tr>
                                            )) : <tr><td colSpan={5} className="py-4 text-center text-xs text-gray-400 italic">No events recorded.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                          </tr>
                      )}
                    </React.Fragment>
                  );
                })})()}"""
                
    content = content.replace(table_target, table_replace)

    with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("DONE")

if __name__ == '__main__':
    rewrite_book_breakdown()
