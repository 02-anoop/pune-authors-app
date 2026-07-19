import os

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "<div className=\"overflow-x-auto border border-gray-200 rounded-xl\">" in line:
        chart_ui = """           <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h4 className="font-bold text-paa-navy mb-4">Book Sales Performance Over Time</h4>
              <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={allEvents.filter((evt: any) => evt.isDataUpdated || !evt.isPast).map((evt: any) => {
                         let sold = 0;
                         let evtBooks: any[] = [];
                         if (evt.isPast) evtBooks = evt.books || [];
                         else evtBooks = getEventBooks(evt.id);
                         evtBooks.forEach((b: any) => {
                             if (selectedBookIds.length === 0 || selectedBookIds.includes(b.bookId.toString())) {
                                 sold += (b.soldStock || b.sold || 0);
                             }
                         });
                         return { name: evt.name.length > 15 ? evt.name.substring(0, 15) + '...' : evt.name, sold };
                     })} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={10} />
                         <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                         <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }} />
                         <Bar dataKey="sold" name="Copies Sold" fill="#1e3a8a" radius={[4, 4, 0, 0]} maxBarSize={50} />
                     </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
"""
        lines.insert(i, chart_ui)
        break

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Added Book Performance BarChart!")
