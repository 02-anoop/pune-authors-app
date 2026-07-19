import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_opted_in = """                       {isOptedIn ? (
                          <div className="bg-green-50 p-4 border border-green-200">
                             <p className="text-xs font-bold uppercase tracking-widest text-green-800 mb-2 border-b border-green-200 pb-1">Your Listed Inventory</p>
                             <ul className="space-y-1">
                               {myBooksForEvent.map(mb => {
                                  const bDetails = books.find(b => b.id === mb.bookId);
                                  return (
                                     <li key={mb.id} className="text-sm flex justify-between text-green-900">
                                        <span>{bDetails?.title || 'Unknown Book'}</span>
                                        <span className="font-bold">{mb.listedStock} units</span>
                                     </li>
                                  )
                               })}
                             </ul>
                          </div>
                       ) : ("""

new_opted_in = """                       {isOptedIn ? (
                          <div className="bg-green-50 border border-green-200 rounded overflow-hidden shadow-sm mt-4">
                             <div className="bg-green-100/50 px-4 py-2 border-b border-green-200 flex justify-between items-center">
                               <p className="text-xs font-bold uppercase tracking-widest text-green-800">Event Report & Inventory</p>
                               {evt.status === 'Past' && <span className="bg-paa-navy text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest">Final Report</span>}
                             </div>
                             <div className="p-4 overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                  <thead className="text-[10px] text-green-800 uppercase tracking-widest border-b border-green-200">
                                    <tr>
                                      <th className="pb-2 font-bold">Book Title</th>
                                      <th className="pb-2 font-bold text-center">Listed</th>
                                      <th className="pb-2 font-bold text-center">Sold</th>
                                      <th className="pb-2 font-bold text-center">Returned</th>
                                      <th className="pb-2 font-bold text-right">Revenue (70%)</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-green-100 text-green-900">
                                    {myBooksForEvent.map(mb => {
                                      const bDetails = books.find(b => b.id === mb.bookId);
                                      const price = bDetails?.mrp || 0;
                                      const sold = mb.soldStock || 0;
                                      const revenue = (price * sold) * 0.70;
                                      return (
                                         <tr key={mb.id}>
                                            <td className="py-2">{bDetails?.title || 'Unknown Book'}</td>
                                            <td className="py-2 text-center font-medium">{mb.listedStock}</td>
                                            <td className="py-2 text-center font-bold text-paa-navy">{sold}</td>
                                            <td className="py-2 text-center text-gray-500">{mb.returnedStock}</td>
                                            <td className="py-2 text-right font-bold text-green-700">₹{revenue.toFixed(2)}</td>
                                         </tr>
                                      )
                                    })}
                                    {evt.status === 'Past' && (
                                      <tr className="bg-green-100/50">
                                        <td colSpan={4} className="py-3 text-right font-bold text-xs uppercase tracking-widest text-green-900">Total Event Earnings:</td>
                                        <td className="py-3 text-right font-bold text-green-800">
                                          ₹{myBooksForEvent.reduce((sum, mb) => {
                                            const bDetails = books.find(b => b.id === mb.bookId);
                                            return sum + (((bDetails?.mrp || 0) * (mb.soldStock || 0)) * 0.70);
                                          }, 0).toFixed(2)}
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                                {evt.status === 'Upcoming' && (
                                  <p className="text-[10px] text-gray-500 italic mt-3 text-center">Sales data will be updated during/after the event.</p>
                                )}
                             </div>
                          </div>
                       ) : ("""

if "Event Report & Inventory" not in content:
    content = content.replace(old_opted_in, new_opted_in)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
