const fs = require('fs');

let c = fs.readFileSync('src/app/components/OperationsDashboardPage.tsx', 'utf8');

// Replace expanded view
const blockRegex = new RegExp(`\\{expandedEventIndex === i && \\(\\[\\s\\S\\]*?\\s*<tr className="bg-gray-50/50 border-b border-gray-100">[\\s\\S]*?</tr>\\s*\\)\\}`);

const newBlock = `{expandedEventIndex === i && (
                          <tr className="bg-[#f8fafc] border-b border-gray-100 shadow-inner">
                             <td colSpan={11} className="p-0">
                                <div className="flex flex-col md:flex-row gap-8 px-8 py-6 border-l-4 border-indigo-400 ml-6 my-4 bg-white rounded-r-xl shadow-sm mr-6">
                                   <div className="flex-1">
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1"><FileText className="w-3 h-3"/> Event Description</p>
                                      <p className="text-sm text-paa-navy leading-relaxed">{evt.description || 'No description provided.'}</p>
                                   </div>
                                   <div className="w-px bg-gray-100 hidden md:block"></div>
                                   <div className="flex flex-col gap-5 min-w-[150px]">
                                      <div>
                                         <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Location</p>
                                         <p className="text-sm text-paa-navy font-semibold">{evt.location || evt.address || 'TBA'}</p>
                                      </div>
                                      <div>
                                         <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> Duration</p>
                                         <p className="text-sm text-paa-navy font-semibold">{evt.durationDays ? \`\${evt.durationDays} Days\` : 'N/A'}</p>
                                      </div>
                                   </div>
                                   <div className="w-px bg-gray-100 hidden md:block"></div>
                                   <div className="min-w-[160px]">
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1"><ImageIcon className="w-3 h-3"/> Event Banner</p>
                                      {evt.bannerUrl ? (
                                         <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-video w-40 relative group">
                                           <img src={evt.bannerUrl.startsWith('http') ? evt.bannerUrl : \`\${API}\${evt.bannerUrl}\`} alt="Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                         </div>
                                      ) : (
                                         <div className="aspect-video w-40 bg-gray-50 rounded-lg border border-gray-200 border-dashed flex items-center justify-center text-[10px] text-gray-400 italic">No Banner Uploaded</div>
                                      )}
                                   </div>
                                </div>
                             </td>
                          </tr>
                       )}`;

c = c.replace(blockRegex, newBlock);

fs.writeFileSync('src/app/components/OperationsDashboardPage.tsx', c);
console.log('Replaced block successfully');
