const fs = require('fs');

let c = fs.readFileSync('src/app/components/OperationsDashboardPage.tsx', 'utf8');

// Replace table row
const rowStart = `<tr key={i} className="hover:bg-gray-50 transition-colors">`;
const rowEnd = `</tr>
                   );`;
const blockRegex = new RegExp(`<tr key={i} className="hover:bg-gray-50 transition-colors">[\\s\\S]*?</tr>\\s*\\);`);

const newBlock = `<React.Fragment key={i}>
                       <tr className={\`hover:bg-gray-50 transition-colors \${expandedEventIndex === i ? 'bg-gray-50' : ''}\`}>
                         <td className="px-2 py-3 text-center cursor-pointer" onClick={() => setExpandedEventIndex(expandedEventIndex === i ? null : i)}>
                            <button className="text-gray-400 hover:text-paa-navy transition-colors">
                                {expandedEventIndex === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                         </td>
                         <td className="px-4 py-3 text-sm font-semibold text-paa-navy">{evt.name}</td>
                         <td className="px-4 py-3 text-sm font-medium text-paa-gray-text">{evt.date}</td>
                         <td className="px-4 py-3 text-sm text-paa-gray-text capitalize">{evt.eventType || 'N/A'}</td>
                         <td className="px-4 py-3 text-sm font-bold text-paa-navy text-right">
                            <div>₹{evt.registrationFee || 0}</div>
                            {evt.registrationFee > 0 && <div className="text-[10px] font-normal text-gray-500 uppercase tracking-widest mt-0.5">{evt.feeType || 'Per Author'}</div>}
                         </td>
                         <td className="px-4 py-3">
                            <span className={\`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest \${evt.isLegacy ? 'bg-gray-200 text-gray-700' : (evt.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700')}\`}>
                               {evt.isLegacy ? 'Legacy Archive' : evt.status}
                            </span>
                         </td>
                         <td className="px-4 py-3 text-sm font-bold text-center">{evt.livePosEnabled && !evt.isPast ? <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Enabled</span> : <span className="text-gray-400">-</span>}</td>
                         <td className="px-4 py-3 text-sm font-bold text-paa-navy text-right">
                            <div className="flex items-center justify-end gap-2">
                                {authors}
                            </div>
                         </td>
                         <td className="px-4 py-3 text-sm font-bold text-paa-navy text-right">{books}</td>
                         <td className="px-4 py-3 text-sm font-bold text-green-700 text-right">₹{revenue}</td>
                         <td className="px-4 py-3 text-right">
                            <div className="flex gap-2 justify-center">
                                <button title="View Breakdown" onClick={() => handleOpenBreakdown(evt)} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors shadow-sm relative">
                                   <Eye className="w-4 h-4" />
                                   {evt.registrations?.filter((r:any) => r.optInStatus === 'Pending' || r.optInStatus === 'Pending Approval').length > 0 && (
                                       <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-pulse shadow-sm">
                                           {evt.registrations.filter((r:any) => r.optInStatus === 'Pending' || r.optInStatus === 'Pending Approval').length}
                                       </span>
                                   )}
                                </button>
                                <button title="Edit Event" onClick={() => { setEditingEvent(evt); setIsEditEventModalOpen(true); }} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors shadow-sm">
                                   <Edit2 className="w-4 h-4" />
                                </button>
                                <button title="Delete Event" onClick={() => handleDeleteEvent(evt.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors shadow-sm">
                                   <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                         </td>
                       </tr>
                       {expandedEventIndex === i && (
                          <tr className="bg-gray-50/50 border-b border-gray-100">
                             <td colSpan={11} className="px-10 py-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                   <div>
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Description</p>
                                      <p className="text-sm text-paa-navy leading-relaxed">{evt.description || 'No description provided.'}</p>
                                   </div>
                                   <div>
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Location</p>
                                      <p className="text-sm text-paa-navy font-medium">{evt.location || evt.address || 'TBA'}</p>
                                   </div>
                                   <div>
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Duration</p>
                                      <p className="text-sm text-paa-navy font-medium">{evt.durationDays ? \`\${evt.durationDays} Days\` : 'N/A'}</p>
                                   </div>
                                </div>
                             </td>
                          </tr>
                       )}
                      </React.Fragment>
                   );`;

c = c.replace(blockRegex, newBlock);

fs.writeFileSync('src/app/components/OperationsDashboardPage.tsx', c);
console.log('Replaced block successfully');
