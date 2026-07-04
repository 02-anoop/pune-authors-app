const fs = require('fs');

let c = fs.readFileSync('src/app/components/AuthorDashboardPage.tsx', 'utf8');

const regex = /<div className="overflow-x-auto">\s*<table className="w-full text-left border-collapse">[\s\S]*?<\/tbody>\s*<\/table>\s*<\/div>/;

const replacement = `<div className="bg-white rounded-xl shadow-premium border border-paa-navy/5 overflow-hidden mb-8">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#f0f4f8] text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">
                  <th className="px-6 py-4 w-12 text-center"></th>
                  <th className="px-4 py-4 w-1/4">Event Name</th>
                  <th className="px-4 py-4 w-32">Date</th>
                  <th className="px-4 py-4">Location</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4 text-right">Books Sold</th>
                  <th className="px-4 py-4 text-right">Revenue</th>
                  <th className="px-4 py-4 text-right">Payment</th>
                  <th className="px-4 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEvents.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-sm text-paa-gray-text italic">No events found.</td></tr>}
                {filteredEvents.map((evt: any, i: number) => {
                  let sold = 0;
                  let rev = 0;
                  if (evt.manualTotalSold !== null && evt.manualTotalSold !== undefined) {
                    sold = evt.manualTotalSold;
                    rev = evt.manualTotalRevenue || 0;
                  } else if (evt.isPast && evt.isDataUpdated) {
                    evt.books?.forEach((b: any) => {
                      sold += (b.soldStock || 0);
                      rev += (b.soldStock || 0) * (b.mrp || b.book?.mrp || 0);
                    });
                  } else if (evt.isInvite) {
                    const evtBooks = getEventBooks(evt.id);
                    evtBooks.forEach((b: any) => {
                      sold += (b.soldStock || 0);
                      rev += (b.soldStock || 0) * (b.book?.mrp || 0);
                    });
                  }

                  return (
                    <React.Fragment key={i}>
                    <tr className={\`hover:bg-gray-50 transition-colors \${expandedEventId === evt.id ? 'bg-gray-50' : ''}\`}>
                      <td className="pl-6 pr-2 py-3 text-center cursor-pointer" onClick={() => { 
                         setExpandedEventId(expandedEventId === evt.id ? null : evt.id);
                         if (expandedEventId !== evt.id && evt.isInvite && evt.registration === 'Pending') {
                            setSelectedInvite(evt);
                            setOptInBooks(books.map((b: any) => ({ bookId: b.id.toString(), title: b.title, stock: 10, included: true })));
                            setPaymentScreenshot(null);
                         }
                      }}>
                         <button className="text-gray-400 hover:text-paa-navy transition-colors">
                            {expandedEventId === evt.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                         </button>
                      </td>
                      <td className="px-4 py-3">
                         <div className="text-sm font-semibold text-paa-navy">{evt.name}</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-paa-gray-text">{new Date(evt.startDate || evt.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm text-paa-gray-text">{evt.location || evt.venue || 'TBA'}</td>
                      <td className="px-4 py-3 text-sm font-semibold">
                         <div className="flex flex-col items-start gap-1">
                             <span className={\`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest \${evt.isPast ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}\`}>
                               {evt.type || (evt.isPast ? 'Past Event' : 'Upcoming/Live')}
                             </span>
                             {evt.registration === 'Not Participated' && evt.aggAuthors > 0 && (
                               <div className="text-[10px] text-gray-500 font-mono mt-1">{evt.aggAuthors} Authors</div>
                             )}
                         </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-paa-navy text-right">{sold > 0 || (evt.manualTotalSold !== null && evt.manualTotalSold !== undefined) ? sold : '-'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-700 text-right">{rev > 0 || (evt.manualTotalRevenue !== null && evt.manualTotalRevenue !== undefined) ? \`₹\${rev}\` : '-'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-orange-700 text-right">{evt.amountPaid ? \`₹\${evt.amountPaid}\` : '-'}</td>
                      <td className="px-4 py-3 text-center">
                          <span className={\`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest \${evt.registration === 'Registered' || evt.registration === 'Approved' ? 'bg-emerald-100 text-emerald-700' : (evt.registration === 'Pending' || evt.registration === 'Pending Approval' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700')}\`}>
                            {evt.registration}
                          </span>
                      </td>
                    </tr>
                    {expandedEventId === evt.id && (
                       <tr className="bg-[#f8fafc] border-b border-gray-100 shadow-inner">
                          <td colSpan={9} className="p-0">
                             <div className="flex flex-col xl:flex-row gap-8 px-8 py-6 border-l-4 border-indigo-400 ml-6 my-4 bg-white rounded-r-xl shadow-sm mr-6">
                                <div className="flex-1 min-w-[300px] flex flex-col gap-5">
                                   <div className="flex gap-6">
                                      <div className="w-40 shrink-0">
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1"><ImageIcon className="w-3 h-3"/> Event Banner</p>
                                          {evt.bannerUrl ? (
                                             <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-video relative group">
                                               <img src={evt.bannerUrl.startsWith('http') ? evt.bannerUrl : \`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}\${evt.bannerUrl}\`} alt="Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                             </div>
                                          ) : (
                                             <div className="aspect-video bg-gray-50 rounded-lg border border-gray-200 border-dashed flex items-center justify-center text-[10px] text-gray-400 italic">No Banner</div>
                                          )}
                                      </div>
                                      <div className="flex flex-col gap-4">
                                         <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Location</p>
                                            <p className="text-sm text-paa-navy font-semibold">{evt.location || evt.venue || 'TBA'}</p>
                                         </div>
                                         <div className="flex gap-6">
                                            <div>
                                               <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> Date & Timings</p>
                                               <p className="text-sm text-paa-navy font-semibold">{new Date(evt.startDate || evt.date).toLocaleDateString()} • {(evt.startTime && evt.endTime) ? \`\${evt.startTime}-\${evt.endTime}\` : 'TBA'}</p>
                                            </div>
                                            <div>
                                               <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1">Fee</p>
                                               <p className="text-sm text-emerald-700 font-bold">₹{evt.registrationFee || 0}</p>
                                            </div>
                                         </div>
                                      </div>
                                   </div>
                                </div>
                                <div className="w-px bg-gray-100 hidden xl:block"></div>
                                {evt.isInvite && evt.registration === 'Pending' ? (
                                    <div className="flex-1 min-w-[300px] flex flex-col animate-fade-in-up">
                                        <h4 className="font-bold text-sm text-gray-700 mb-3 border-b pb-2 flex items-center gap-2"><BookOpen className="w-4 h-4"/> Opt-In: Select Books</h4>
                                        <div className="flex-1 overflow-y-auto max-h-[250px] space-y-2 mb-4 pr-2">
                                            {optInBooks.map((b, idx) => (
                                              <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-200">
                                                <input type="checkbox" checked={b.included} onChange={e => { const newB = [...optInBooks]; newB[idx].included = e.target.checked; setOptInBooks(newB); }} className="text-paa-navy focus:ring-paa-navy rounded" />
                                                <span className="flex-1 text-sm font-medium text-gray-800 truncate">{b.title}</span>
                                                <input type="number" disabled={!b.included} value={b.stock} onChange={e => { const newB = [...optInBooks]; newB[idx].stock = parseInt(e.target.value) || 0; setOptInBooks(newB); }} className="w-16 p-1 text-xs border border-gray-300 rounded disabled:bg-gray-100 disabled:text-gray-400" min="0" />
                                              </div>
                                            ))}
                                        </div>
                                        {evt.registrationFee > 0 && (() => {
                                          const selectedBooksCount = optInBooks.filter((b: any) => b.included).length;
                                          const totalFee = evt.feeType === 'Per Title' ? evt.registrationFee * selectedBooksCount : evt.registrationFee;
                                          return (
                                          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 shadow-sm">
                                            <div className="flex justify-between items-center mb-1">
                                              <div className="font-bold">Total Registration Fee:</div>
                                              <div className="text-xl font-black text-paa-navy">₹{totalFee}</div>
                                            </div>
                                            {evt.feeType === 'Per Title' && <div className="text-xs text-yellow-700 mb-3">(₹{evt.registrationFee} per title × {selectedBooksCount} selected)</div>}
                                            
                                            {totalFee > 0 && (
                                              <div className="flex flex-col sm:flex-row gap-4 mt-4 border-t border-yellow-200 pt-4">
                                                <div>
                                                   <div className="text-[10px] font-bold mb-2 uppercase tracking-widest text-yellow-900">Scan to Pay</div>
                                                   <img src={qrCode} alt="Payment QR" className="w-24 h-24 object-contain bg-white p-1 border border-yellow-300 rounded shadow-sm" />
                                                </div>
                                                <div className="flex-1 flex flex-col justify-center">
                                                   <label className="block text-[10px] font-bold mb-2 uppercase tracking-widest text-yellow-900">Upload Screenshot</label>
                                                   <input type="file" accept="image/*" onChange={(e) => setPaymentScreenshot(e.target.files?.[0] || null)} className="text-xs bg-white p-2 rounded border border-yellow-300 w-full" />
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                          );
                                        })()}
                                        <div className="flex gap-2 shrink-0 mt-auto">
                                            <button onClick={() => handleOptInSubmit('reject')} className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">Decline</button>
                                            <button onClick={() => handleOptInSubmit('approve')} className="flex-1 px-4 py-2 bg-paa-navy text-paa-cream rounded-lg text-sm font-bold hover:bg-paa-gold hover:text-paa-navy transition-colors shadow-sm">Submit Opt-In</button>
                                        </div>
                                    </div>
                                ) : (
                                <div className="flex-1 min-w-[300px] flex flex-col">
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
                                </div>
                                )}
                             </div>
                          </td>
                       </tr>
                    )}
                  </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>`;

if (!regex.test(c)) {
  console.log('REGEX DID NOT MATCH');
} else {
  c = c.replace(regex, replacement);
  fs.writeFileSync('src/app/components/AuthorDashboardPage.tsx', c);
  console.log('Table replaced completely');
}
