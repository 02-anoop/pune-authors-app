const fs = require('fs');
let content = fs.readFileSync('c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx', 'utf8');

const replacement = `      {/* ── Charts ── */}
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

// Replace until the Web Orders Distribution header
content = content.replace(/      \{\/\* ── Charts ── \*\/\}[\s\S]*?<div className="dash-panel">\s*<div className="dash-panel-header"><h3 className="dash-panel-title">Web Orders Distribution<\/h3><\/div>/, replacement + '\n\n        <div className="dash-panel">\n          <div className="dash-panel-header"><h3 className="dash-panel-title">Web Orders Distribution</h3></div>');

const oldActivityChart = `<BarChart data={activityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" fontSize={10} tick={{ fill: '#71717A' }} />
                <YAxis dataKey="name" type="category" width={90} fontSize={10} tick={{ fill: '#71717A' }} />
                <Tooltip cursor={{ fill: 'rgba(24,24,27,0.03)' }} contentStyle={{ borderRadius: 10, border: '1px solid rgba(24,24,27,0.08)', fontSize: 12 }} />
                <Bar dataKey="count" fill="#C0A062" radius={[0, 4, 4, 0]} />
              </BarChart>`;

const newActivityChart = `<BarChart data={activityData} layout="vertical">
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#50e3c2" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#50e3c2" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" fontSize={10} tick={{ fill: '#71717A' }} />
                <YAxis dataKey="name" type="category" width={90} fontSize={10} tick={{ fill: '#71717A' }} />
                <Tooltip cursor={{ fill: 'rgba(24,24,27,0.03)' }} contentStyle={{ borderRadius: 10, border: '1px solid rgba(24,24,27,0.08)', fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="url(#colorActivity)" radius={[0, 6, 6, 0]} />
              </BarChart>`;

content = content.replace(oldActivityChart, newActivityChart);

fs.writeFileSync('c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx', content, 'utf8');
