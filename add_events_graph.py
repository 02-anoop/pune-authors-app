import os

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

chart_start_idx = -1
for i, line in enumerate(lines):
    if '</div>' in line and '</div>' in lines[i-1] and 'Total Gross Revenue' in lines[i-3]:
        chart_start_idx = i + 1
        break

chart_code = """
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h4 className="font-bold text-paa-navy">Events Performance Overview</h4>
                    <p className="text-xs text-gray-500 font-medium mt-1">Comparing book sales and author participation across all events.</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-paa-navy"></div> Books Sold</div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-indigo-300"></div> Authors Participated</div>
                </div>
            </div>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={allCombinedEvents.map(e => ({ name: e.name.length > 15 ? e.name.substring(0, 15) + '...' : e.name, booksSold: e.aggSold || 0, authors: e.aggAuthors || 0 }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={10} />
                        <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                        <RechartsTooltip 
                            cursor={{ fill: '#F3F4F6' }}
                            contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                        />
                        <Bar yAxisId="left" dataKey="booksSold" name="Books Sold" fill="var(--color-paa-navy, #1e3a8a)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar yAxisId="right" dataKey="authors" name="Authors" fill="#818CF8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
"""

if chart_start_idx != -1:
    lines.insert(chart_start_idx, chart_code)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Added graph!")
else:
    print("Could not find insertion point for graph")
