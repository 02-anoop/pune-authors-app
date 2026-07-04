import sys

def fix_author_legacy():
    with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix 1: Table headers
    target1 = """                  <th className="px-4 py-4 text-right">Revenue</th>
                  <th className="px-4 py-4 text-right">Payment</th>
                  <th className="px-4 py-4 text-center">Status</th>"""
                  
    replace1 = """                  <th className="px-4 py-4 text-right">Revenue</th>
                  {eventFilter === 'LEGACY ARCHIVE' ? (
                    <th className="px-4 py-4 text-center">Authors</th>
                  ) : (
                    <th className="px-4 py-4 text-right">Payment</th>
                  )}
                  <th className="px-4 py-4 text-center">Status</th>"""

    # Fix 2: Table body
    target2 = """                      <td className="px-4 py-3 text-sm font-bold text-paa-navy text-right">{sold > 0 || (evt.manualTotalSold !== null && evt.manualTotalSold !== undefined) ? sold : '-'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-700 text-right">{rev > 0 || (evt.manualTotalRevenue !== null && evt.manualTotalRevenue !== undefined) ? `₹${rev}` : '-'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-orange-700 text-right">
                         {evt.amountPaid ? `₹${evt.amountPaid}` : (evt.isPast ? '-' : (evt.registrationFee ? `₹${evt.registrationFee}${evt.feeType === 'Per Title' ? '/title' : ''}` : '-'))}
                      </td>"""

    replace2 = """                      <td className="px-4 py-3 text-sm font-bold text-paa-navy text-right">{sold > 0 || (evt.manualTotalSold !== null && evt.manualTotalSold !== undefined) ? sold : '-'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-700 text-right">{rev > 0 || (evt.manualTotalRevenue !== null && evt.manualTotalRevenue !== undefined) ? `₹${rev}` : '-'}</td>
                      {eventFilter === 'LEGACY ARCHIVE' ? (
                        <td className="px-4 py-3 text-sm font-bold text-paa-navy text-center">
                           {evt.aggAuthors || '-'}
                        </td>
                      ) : (
                        <td className="px-4 py-3 text-sm font-bold text-orange-700 text-right">
                           {evt.amountPaid ? `₹${evt.amountPaid}` : (evt.isPast ? '-' : (evt.registrationFee ? `₹${evt.registrationFee}${evt.feeType === 'Per Title' ? '/title' : ''}` : '-'))}
                        </td>
                      )}"""

    # Fix 3: Expanded view disclaimer
    target3 = """                                         if (evt.isPast && !evt.isDataUpdated) {
                                            return (
                                               <div className="text-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                                  <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                                  <p className="text-xs text-gray-500 font-medium">Data Pending. Sales records have not been published yet.</p>
                                               </div>
                                            );
                                         }
                                         const currentBooks = evt.isInvite ? getEventBooks(evt.id) : (evt.isPast ? getPastEventBooks(evt.id) : []);
                                         if (currentBooks.length === 0) return <p className="text-sm text-gray-500 italic">No inventory recorded.</p>;"""
                                         
    replace3 = """                                         if (evt.status === 'Legacy Archive') {
                                             return (
                                                <div className="text-center p-4 bg-indigo-50/50 rounded-lg border border-dashed border-indigo-200">
                                                   <AlertCircle className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                                                   <p className="text-xs text-indigo-700 font-medium">This is a legacy event archive. The sales and revenue shown above are cumulative across all participating authors, not your individual sales.</p>
                                                </div>
                                             );
                                         }
                                         if (evt.isPast && !evt.isDataUpdated) {
                                            return (
                                               <div className="text-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                                  <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                                  <p className="text-xs text-gray-500 font-medium">Data Pending. Sales records have not been published yet.</p>
                                               </div>
                                            );
                                         }
                                         const currentBooks = evt.isInvite ? getEventBooks(evt.id) : (evt.isPast ? getPastEventBooks(evt.id) : []);
                                         if (currentBooks.length === 0) return <p className="text-sm text-gray-500 italic">No inventory recorded.</p>;"""

    content = content.replace(target1, replace1).replace(target2, replace2).replace(target3, replace3)

    with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

    print("SUCCESS")

if __name__ == '__main__':
    fix_author_legacy()
