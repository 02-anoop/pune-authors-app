import re

def fix_scope():
    with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Find where the performance tab starts
    start_str = "            {activeTab === 'performance' && (\n        <div className=\"space-y-6\">"
    
    # We will replace it with an IIFE that calculates the stats first, then returns the JSX
    # First, let's extract the stats calculation from the KPI grid.
    
    kpi_grid_start = """          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4">
             {(() => {"""
             
    # The stats calc is quite long. Let's find it by substring.
    stats_calc = """                 let totalSent = 0;
                 let totalSold = 0;
                 let totalReturned = 0;
                 let totalRev = 0;
                 let bestEvent = { name: '-', rev: 0 };
                 let eventsWithSales = 0;
                 let eventStats: any[] = [];
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
                         eventStats.push({ name: evt.name, rev: evtRev, date: evt.date || evt.startDate, sold: evtSold });
                     }
                 });
                 
                 const sellThroughNum = totalSent > 0 ? ((totalSold / totalSent) * 100) : 0;
                 const sellThrough = sellThroughNum.toFixed(1);
                 const returnRate = totalSent > 0 ? Math.max(0, 100 - sellThroughNum).toFixed(1) : 0;
                 
                 const avgRev = validParticipations.length > 0 ? Math.round(totalRev / validParticipations.length) : 0;
                 
                 let fastestMover = { title: '-', rate: 0 };
                 
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

    # We remove this block from its original location
    # Replace the start of KPI grid with just the div start
    
    kpi_grid_replacement = """          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4">"""

    # We also need to remove the `return (\n                    <>\n` and `\n                    </>\n                 );\n             })()}` from the KPI grid.
    kpi_return_start = """                 return (
                    <>"""
    kpi_return_end = """                    </>
                 );
             })()}"""
             
    # Careful here: \n vs \r\n
    if kpi_grid_start + "\n" + stats_calc + "\n                 \n" + kpi_return_start in content:
        content = content.replace(kpi_grid_start + "\n" + stats_calc + "\n                 \n" + kpi_return_start, kpi_grid_replacement)
    else:
        # Fallback to replacing chunks individually
        content = content.replace(kpi_grid_start, kpi_grid_replacement)
        content = content.replace(stats_calc, "")
        content = content.replace(kpi_return_start, "")
        
    content = content.replace(kpi_return_end, "")
    
    # Now, we insert the `stats_calc` block into the outer `{activeTab === 'performance' && (() => {`
    
    tab_start_replacement = "            {activeTab === 'performance' && (() => {\n" + stats_calc + "\n\n                return (\n        <div className=\"space-y-6\">"
    content = content.replace(start_str, tab_start_replacement)
    
    # Also need to add `})()}` at the very end of the performance tab
    tab_end_target = """            </table>
          </div>

        </div>
      )}"""
    tab_end_replacement = """            </table>
          </div>

        </div>
        );
      })()}"""
    
    content = content.replace(tab_end_target, tab_end_replacement)

    with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    fix_scope()
