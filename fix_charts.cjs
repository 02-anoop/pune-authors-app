const fs = require('fs');
let content = fs.readFileSync('c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx', 'utf8');

const missingCharts = `      {/* ── Charts ── */}
      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        <div className="dash-panel">
          <div className="dash-panel-header"><h3 className="dash-panel-title">Books Sold per Title</h3></div>
          <div className="h-[250px] p-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="colorSold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4a90e2" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#4a90e2" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={10} tick={{ fill: '#71717A' }} />
                <YAxis fontSize={10} tick={{ fill: '#71717A' }} />
                <Tooltip cursor={{ fill: 'rgba(24,24,27,0.03)' }} contentStyle={{ borderRadius: 10, border: '1px solid rgba(24,24,27,0.08)', fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="sold" fill="url(#colorSold)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>`;

content = content.replace(/        <div className="dash-panel">\s*<div className="dash-panel-header"><h3 className="dash-panel-title">Web Orders Distribution<\/h3><\/div>/, missingCharts + '\n\n        <div className="dash-panel">\n          <div className="dash-panel-header"><h3 className="dash-panel-title">Web Orders Distribution</h3></div>');

fs.writeFileSync('c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx', content, 'utf8');
console.log('Fixed missing charts.');
