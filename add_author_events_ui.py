import os

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

insert_idx = -1
for i, line in enumerate(lines):
    if "{activeTab === 'events' && (" in line:
        insert_idx = i + 1
        break

ui_code = """        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-center items-center">
                 <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Events Registered</div>
                 <div className="text-3xl font-serif text-paa-navy font-bold">{allEvents.length}</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm flex flex-col justify-center items-center">
                 <div className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">Total Payments Done</div>
                 <div className="text-3xl font-serif text-emerald-800 font-bold">₹{(registrations || []).reduce((sum: number, r: any) => sum + (r.amount || 0), 0).toLocaleString()}</div>
              </div>
           </div>
           
           <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h4 className="font-bold text-paa-navy mb-4">Books Sold per Event</h4>
              <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={allEvents.map((evt: any) => {
                         let sold = 0;
                         if (evt.isPast && evt.isDataUpdated) {
                             evt.books.forEach((b: any) => { sold += (b.soldStock || 0); });
                         } else if (evt.isInvite) {
                             const evtBooks = getEventBooks(evt.id);
                             evtBooks.forEach((b: any) => { sold += (b.soldStock || 0); });
                         }
                         return { name: evt.name.length > 15 ? evt.name.substring(0, 15) + '...' : evt.name, sold };
                     })} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={10} />
                         <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                         <RechartsTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }} />
                         <Bar dataKey="sold" name="Books Sold" fill="#1e3a8a" radius={[4, 4, 0, 0]} maxBarSize={50} />
                     </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
"""

if insert_idx != -1:
    lines.insert(insert_idx, ui_code)
    # also add a closing div at the end of the events tab block
    for i in range(insert_idx, len(lines)):
        if ")} " in lines[i] or lines[i].strip() == ")}":
            if "{activeTab === 'details'" in lines[i+2] or "{activeTab === 'details'" in lines[i+1]:
                lines.insert(i, "        </div>\n")
                break

    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Added Author dashboard UI!")
else:
    print("Failed to find insertion index")
