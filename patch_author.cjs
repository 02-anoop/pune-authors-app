const fs = require('fs');
let content = fs.readFileSync('c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx', 'utf8');

// 1. Overview KPI
const oldKpi = `<div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        {[
          { label: 'Total Titles', value: authorBooks.length, colorClass: 'blue' },
          { label: 'Total Stock', value: authorBooks.reduce((a: number, b: any) => a + b.stock, 0), colorClass: 'green' },
          { label: 'Gross Sales', value: '\\u20b9' + grossSales.toFixed(0), colorClass: 'amber' },
          { label: 'Total Fees Paid', value: '\\u20b9' + totalFeesPaid, colorClass: 'red' },
          { label: 'Web Sales', value: '\\u20b9' + webSalesAmount.toFixed(0), colorClass: 'blue' },
          { label: 'POS/Event Sales', value: '\\u20b9' + posSalesAmount.toFixed(0), colorClass: 'amber' },
          { label: 'Avg Order Value', value: '\\u20b9' + avgOrderValue, colorClass: 'blue' },
          { label: 'Avg Delivery', value: Number(avgDeliveryDays) > 0 ? \`\${avgDeliveryDays} Days\` : 'N/A', colorClass: 'teal' },
          { label: 'Pending Web Orders', value: toApproveOrders, colorClass: 'amber' },
          { label: 'Low Stock Titles', value: lowStockCount, colorClass: 'red' },
        ].map((kpi, i) => (`

const newKpi = `<div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        {[
          { label: 'Total Titles', value: authorBooks.length, colorClass: 'blue' },
          { label: 'Gross Sales', value: '\\u20b9' + grossSales.toFixed(0), colorClass: 'amber' },
          { label: 'Total Fees Paid', value: '\\u20b9' + totalFeesPaid, colorClass: 'red' },
          { label: 'Web Sales', value: '\\u20b9' + webSalesAmount.toFixed(0), colorClass: 'blue' },
          { label: 'POS/Event Sales', value: '\\u20b9' + posSalesAmount.toFixed(0), colorClass: 'amber' }
        ].map((kpi, i) => (`

content = content.replace(oldKpi, newKpi);

// 2. Your Titles - Star Rating
const oldTitleTd = `<td className="font-semibold text-paa-navy">{row.title}</td>`;
const newTitleTd = `<td className="font-semibold text-paa-navy">
                    {row.title}
                    {(() => {
                      const bk = authorBooks.find((b: any) => b.id === row.id);
                      const avgRating = bk?.reviews?.length ? (bk.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / bk.reviews.length).toFixed(1) : null;
                      if (avgRating) return (
                        <div className="flex items-center gap-0.5 mt-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded w-max">
                          {avgRating} <Star size={10} className="fill-amber-500 text-amber-500" />
                        </div>
                      );
                      return null;
                    })()}
                  </td>`;
content = content.replace(oldTitleTd, newTitleTd);

// 3. Charts Design
const oldChart = `<BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={10} tick={{ fill: '#71717A' }} />
                <YAxis fontSize={10} tick={{ fill: '#71717A' }} />
                <Tooltip cursor={{ fill: 'rgba(24,24,27,0.03)' }} contentStyle={{ borderRadius: 10, border: '1px solid rgba(24,24,27,0.08)', fontSize: 12 }} />
                <Bar dataKey="sold" fill="#18181B" radius={[4, 4, 0, 0]} />
              </BarChart>`;

const newChart = `<BarChart data={chartData}>
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
              </BarChart>`;
content = content.replace(oldChart, newChart);

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


// 4. Web Orders KPI and Chart
const oldWebOrdersKPIs = `      {/* ── Order Tracking KPIs ── */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="dash-kpi-card green" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
            <Check size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-paa-gray-text mb-1">Successful Orders</p>
            <h3 className="text-2xl font-bold text-paa-navy">{orders.filter((o: any) => o.status === 'Completed' || o.status === 'Delivered').length}</h3>
          </div>
        </div>
        <div className="dash-kpi-card amber" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-paa-gray-text mb-1">To Be Approved</p>
            <h3 className="text-2xl font-bold text-paa-navy">{orders.filter((o: any) => o.status === 'Pending Verification' || o.status === 'Processing').length}</h3>
          </div>
        </div>
        <div className="dash-kpi-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Package size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-paa-gray-text mb-1">To Be Dispatched</p>
            <h3 className="text-2xl font-bold text-paa-navy">{orders.filter((o: any) => o.status === 'Accepted').length}</h3>
          </div>
        </div>
        <div className="dash-kpi-card blue" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <MapPin size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-paa-gray-text mb-1">Under Delivery</p>
            <h3 className="text-2xl font-bold text-paa-navy">{orders.filter((o: any) => o.status === 'Dispatched').length}</h3>
          </div>
        </div>
        <div className="dash-kpi-card border border-red-500/20" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#fef2f2' }}>
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <TrendingDown size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-red-500 mb-1">Late Fines</p>
            <h3 className="text-2xl font-bold text-red-600">₹{dashboardData?.authorProfile?.extraData?.lateFines || 0}</h3>
          </div>
        </div>
      </div>

      {/* Order Geography Pie Chart */}
      {(() => {
        const stateCounts: Record<string, number> = {};
        const knownStates = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"];
        
        orders.forEach((o: any) => {
          if (o.address) {
            let foundState = "Other";
            for (const s of knownStates) {
               if (o.address.toLowerCase().includes(s.toLowerCase())) {
                  foundState = s; break;
               }
            }
            stateCounts[foundState] = (stateCounts[foundState] || 0) + 1;
          }
        });

        const stateEntries = Object.entries(stateCounts).sort((a, b) => b[1] - a[1]);
        const topStates = stateEntries.slice(0, 6);
        const topStatesTotal = topStates.reduce((acc, curr) => acc + curr[1], 0);
        const totalWithAddress = orders.filter((o:any) => o.address).length;
        if (totalWithAddress > topStatesTotal) {
          topStates.push(['Other', totalWithAddress - topStatesTotal]);
        }
        const statePieData = topStates.map(([name, value]) => ({ name, value }));
        const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#94a3b8'];

        return (
          <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-sm mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-paa-navy mb-4">Orders by State</h3>
            <div className="h-64">
              {statePieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" label={({name, value}) => \`\${name} (\${value})\`}>
                      {statePieData.map((entry, index) => (
                        <Cell key={\`cell-\${index}\`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-paa-gray-text text-sm italic">No state data available.</div>
              )}
            </div>
          </div>
        );
      })()}`;

const newWebOrdersLayout = `      {/* ── Web Orders Layout (KPIs + Pie) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 mb-8">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-max">
          <div className="bg-white rounded-xl shadow-sm border border-paa-navy/5 p-4 flex items-center gap-4 hover:border-green-500/30 transition-colors">
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <Check size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-0.5">Successful Orders</p>
              <h3 className="text-xl font-bold text-paa-navy">{orders.filter((o: any) => o.status === 'Completed' || o.status === 'Delivered').length}</h3>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-paa-navy/5 p-4 flex items-center gap-4 hover:border-yellow-500/30 transition-colors">
            <div className="w-10 h-10 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
              <AlertCircle size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-0.5">To Be Approved</p>
              <h3 className="text-xl font-bold text-paa-navy">{orders.filter((o: any) => o.status === 'Pending Verification' || o.status === 'Processing').length}</h3>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-paa-navy/5 p-4 flex items-center gap-4 hover:border-indigo-500/30 transition-colors">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Package size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-0.5">To Be Dispatched</p>
              <h3 className="text-xl font-bold text-paa-navy">{orders.filter((o: any) => o.status === 'Accepted').length}</h3>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-paa-navy/5 p-4 flex items-center gap-4 hover:border-blue-500/30 transition-colors">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <MapPin size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-0.5">Under Delivery</p>
              <h3 className="text-xl font-bold text-paa-navy">{orders.filter((o: any) => o.status === 'Dispatched').length}</h3>
            </div>
          </div>
          <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white text-red-600 flex items-center justify-center shrink-0 shadow-sm border border-red-100">
              <TrendingDown size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-red-500 mb-0.5">Late Fines</p>
              <h3 className="text-xl font-bold text-red-600">₹{dashboardData?.authorProfile?.extraData?.lateFines || 0}</h3>
            </div>
          </div>
        </div>

        {/* Orders by Status Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-paa-navy/5 p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2 border-b pb-2">Orders by Status</p>
          <div className="h-[200px]">
            {(() => {
              const statusCounts: Record<string, number> = {};
              orders.forEach((o: any) => {
                const st = o.status || 'Pending';
                statusCounts[st] = (statusCounts[st] || 0) + 1;
              });
              const statusPieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
              const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#94a3b8'];

              return statusPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" label={({name, value}) => \`\${name} (\${value})\`}>
                      {statusPieData.map((entry, index) => (
                        <Cell key={\`cell-\${index}\`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-paa-gray-text text-sm italic">No data</div>
              );
            })()}
          </div>
        </div>

      </div>`;

content = content.replace(oldWebOrdersKPIs, newWebOrdersLayout);


fs.writeFileSync('c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx', content, 'utf8');
console.log('Successfully applied patches to AuthorDashboardPage.tsx');
