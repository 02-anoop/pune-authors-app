import sys

def fix_file():
    with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Part 1: Add Action Buttons to left column
    target_left = """                                      </div>
                                   </div>
                                </div>
                                <div className="w-px bg-gray-100 hidden xl:block"></div>"""
    
    replacement_left = """                                      </div>
                                   </div>
                                   <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
                                      <button onClick={() => { setActiveTab('details'); setSelectedEventId(evt.id.toString()); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-bold transition-colors shadow-sm">
                                         <Eye className="w-4 h-4" /> Full Details & Analytics
                                      </button>
                                      {evt.livePosEnabled && !evt.isPast && (
                                        <button onClick={() => window.open('/pos/' + evt.id, '_blank')} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-bold transition-colors shadow-sm whitespace-nowrap">
                                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Launch POS
                                        </button>
                                      )}
                                   </div>
                                </div>
                                <div className="w-px bg-gray-100 hidden xl:block"></div>"""
    
    content = content.replace(target_left, replacement_left)

    # Part 2: Improve the right side inventory block for past events
    target_right = """                                <div className="flex-1 min-w-[300px] flex flex-col">
                                   <h4 className="font-bold text-sm text-gray-700 mb-4 flex items-center gap-2 border-b pb-2"><BookOpen className="w-4 h-4" /> Book Inventory</h4>
                                   <div className="flex-1 overflow-y-auto max-h-[250px] pr-1 space-y-2">
                                      {(() => {
                                         const currentBooks = evt.isInvite ? getEventBooks(evt.id) : (evt.isPast ? getPastEventBooks(evt.id) : []);
                                         if (currentBooks.length === 0) return <p className="text-sm text-gray-500 italic">No inventory recorded.</p>;
                                         return currentBooks.map((b: any, j: number) => {
                                            const bDetails = books.find(book => book.id === b.bookId);
                                            return (
                                              <React.Fragment key={j}>
                                               <div className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm border border-gray-100">
                                                  <span className="font-medium text-gray-800">{b.title || bDetails?.title || 'Unknown'}</span>
                                                  <div className="flex items-center gap-4 text-xs font-mono">
                                                     <span className="text-gray-500" title="Listed">L: {b.listedStock}</span>
                                                     <span className="text-indigo-600 font-bold" title="Sold">S: {b.soldStock || 0}</span>
                                                  </div>
                                               </div>
                                              </React.Fragment>
                                            )
                                         });
                                      })()}
                                   </div>
                                </div>"""

    replacement_right = """                                <div className="flex-1 min-w-[300px] flex flex-col">
                                   <h4 className="font-bold text-sm text-gray-700 mb-4 flex items-center gap-2 border-b pb-2">
                                      {evt.isPast ? <><Package className="w-4 h-4" /> Sales Breakdown</> : <><BookOpen className="w-4 h-4" /> Book Inventory</>}
                                   </h4>
                                   <div className="flex-1 overflow-y-auto max-h-[250px] pr-1 space-y-2">
                                      {(() => {
                                         if (evt.isPast && !evt.isDataUpdated) {
                                            return (
                                               <div className="text-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                                  <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                                  <p className="text-xs text-gray-500 font-medium">Data Pending. Sales records have not been published yet.</p>
                                               </div>
                                            );
                                         }
                                         const currentBooks = evt.isInvite ? getEventBooks(evt.id) : (evt.isPast ? getPastEventBooks(evt.id) : []);
                                         if (currentBooks.length === 0) return <p className="text-sm text-gray-500 italic">No inventory recorded.</p>;
                                         return currentBooks.map((b: any, j: number) => {
                                            const bDetails = books.find(book => book.id === b.bookId);
                                            return (
                                              <React.Fragment key={j}>
                                               <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm border border-gray-100">
                                                  <span className="font-semibold text-gray-800 line-clamp-1 flex-1 pr-2">{b.title || bDetails?.title || 'Unknown'}</span>
                                                  {evt.isPast ? (
                                                     <div className="flex items-center gap-3 text-[10px] font-mono shrink-0">
                                                        <div className="flex flex-col items-center"><span className="text-gray-400 font-bold">SENT</span><span className="text-gray-600">{b.listedStock || b.sent || 0}</span></div>
                                                        <div className="flex flex-col items-center"><span className="text-paa-navy font-bold">SOLD</span><span className="text-paa-navy text-xs font-black">{b.soldStock || b.sold || 0}</span></div>
                                                        <div className="flex flex-col items-end"><span className="text-emerald-600 font-bold">REV</span><span className="text-emerald-600 font-bold bg-emerald-50 px-1 rounded">₹{b.revenue || 0}</span></div>
                                                     </div>
                                                  ) : (
                                                     <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                                                        <span className="text-gray-500" title="Listed">L: {b.listedStock}</span>
                                                        <span className="text-indigo-600 font-bold" title="Sold">S: {b.soldStock || 0}</span>
                                                     </div>
                                                  )}
                                               </div>
                                              </React.Fragment>
                                            )
                                         });
                                      })()}
                                   </div>
                                </div>"""

    content = content.replace(target_right, replacement_right)
    
    with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("RESTORED ACTION BUTTONS AND ENHANCED INLINE SALES BREAKDOWN")

if __name__ == '__main__':
    fix_file()
