import sys

def fix_file():
    with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Part 1: Remove Actions header
    target_headers = """                  <th className="px-6 py-4 w-12 text-center"></th>
                  <th className="px-4 py-4 w-1/4">Event Name</th>
                  <th className="px-4 py-4 w-32">Date</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4 text-right">Books Sold</th>
                  <th className="px-4 py-4 text-right">Revenue</th>
                  <th className="px-4 py-4 text-right">Payment</th>
                  <th className="px-4 py-4 text-center">Status</th>
                  <th className="px-4 py-4 text-right">Actions</th>"""
                  
    replacement_headers = """                  <th className="px-6 py-4 w-12 text-center"></th>
                  <th className="px-4 py-4 w-1/4">Event Name</th>
                  <th className="px-4 py-4 w-32">Date</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4 text-right">Books Sold</th>
                  <th className="px-4 py-4 text-right">Revenue</th>
                  <th className="px-4 py-4 text-right">Payment</th>
                  <th className="px-4 py-4 text-center">Status</th>"""
                  
    content = content.replace(target_headers, replacement_headers)

    # Part 2: Remove Actions cell from row
    target_row_cells = """                      <td className="px-4 py-3 text-sm font-medium text-paa-gray-text">{new Date(evt.startDate || evt.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm font-semibold">
                         <div className="flex flex-col items-start gap-1">
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${evt.isPast ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                               {evt.type || (evt.isPast ? 'Past Event' : 'Upcoming/Live')}
                             </span>
                             {evt.registration === 'Not Participated' && evt.aggAuthors > 0 && (
                               <div className="text-[10px] text-gray-500 font-mono mt-1">{evt.aggAuthors} Authors</div>
                             )}
                         </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-paa-navy text-right">{sold > 0 || (evt.manualTotalSold !== null && evt.manualTotalSold !== undefined) ? sold : '-'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-700 text-right">{rev > 0 || (evt.manualTotalRevenue !== null && evt.manualTotalRevenue !== undefined) ? `₹${rev}` : '-'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-orange-700 text-right">{evt.amountPaid ? `₹${evt.amountPaid}` : '-'}</td>
                      <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${evt.registration === 'Registered' || evt.registration === 'Approved' ? 'bg-emerald-100 text-emerald-700' : (evt.registration === 'Pending' || evt.registration === 'Pending Approval' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700')}`}>
                            {evt.registration}
                          </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                              <button onClick={(e) => { e.stopPropagation(); setActiveTab('details'); setSelectedEventId(evt.id.toString()); }} title="View Full Details" className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors shadow-sm">
                                 <Eye className="w-4 h-4" />
                              </button>
                              {evt.livePosEnabled && !evt.isPast && (
                                <button onClick={(e) => { e.stopPropagation(); window.open('/pos/' + evt.id, '_blank'); }} title="Launch POS" className="w-8 h-8 flex items-center justify-center bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg shadow-sm transition-colors">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse absolute -mt-4 -ml-4"></span>
                                  <Package className="w-4 h-4" />
                                </button>
                              )}
                          </div>
                      </td>"""

    replacement_row_cells = """                      <td className="px-4 py-3 text-sm font-medium text-paa-gray-text">{new Date(evt.startDate || evt.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm font-semibold">
                         <div className="flex flex-col items-start gap-1">
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${evt.isPast ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                               {evt.type || (evt.isPast ? 'Past Event' : 'Upcoming/Live')}
                             </span>
                             {evt.registration === 'Not Participated' && evt.aggAuthors > 0 && (
                               <div className="text-[10px] text-gray-500 font-mono mt-1">{evt.aggAuthors} Authors</div>
                             )}
                         </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-paa-navy text-right">{sold > 0 || (evt.manualTotalSold !== null && evt.manualTotalSold !== undefined) ? sold : '-'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-700 text-right">{rev > 0 || (evt.manualTotalRevenue !== null && evt.manualTotalRevenue !== undefined) ? `₹${rev}` : '-'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-orange-700 text-right">{evt.amountPaid ? `₹${evt.amountPaid}` : '-'}</td>
                      <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${evt.registration === 'Registered' || evt.registration === 'Approved' ? 'bg-emerald-100 text-emerald-700' : (evt.registration === 'Pending' || evt.registration === 'Pending Approval' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700')}`}>
                            {evt.registration}
                          </span>
                      </td>"""

    content = content.replace(target_row_cells, replacement_row_cells)

    # Part 3: Adjust colSpan for expanded row
    target_colspan = 'colSpan={9}'
    replacement_colspan = 'colSpan={8}'
    content = content.replace(target_colspan, replacement_colspan)
    
    # Part 4: Add action buttons back to expanded detail card
    target_expanded_actions = """                                      </div>
                                   </div>
                                </div>"""

    replacement_expanded_actions = """                                      </div>
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
                                </div>"""

    # Only replace the first occurrence which is inside the expanded row structure
    content = content.replace(target_expanded_actions, replacement_expanded_actions, 1)

    with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("SUCCESSFULLY REVERTED ACTION BUTTONS")

if __name__ == '__main__':
    fix_file()
