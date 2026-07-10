const fs = require('fs');

const path = 'c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx';
let content = fs.readFileSync(path, 'utf8');

const startMarker = 'const SalesReportTab = ({ refreshTrigger }: { refreshTrigger?: number }) => {';
const startIndex = content.indexOf(startMarker);
const endMarker = 'const WebOrdersTab = ({ refreshTrigger, onNavigate }';
const endIndex = content.indexOf(endMarker);

if (startIndex > -1 && endIndex > -1) {
  let before = content.slice(0, startIndex);
  let after = content.slice(endIndex);

  let newTab = `const SalesReportTab = ({ refreshTrigger }: { refreshTrigger?: number }) => {
    const [reportFilter, setReportFilter] = React.useState('Daily');
    const [customStart, setCustomStart] = React.useState('');
    const [customEnd, setCustomEnd] = React.useState('');
    const [isExporting, setIsExporting] = React.useState(false);
    
    // rawSales holds daily data from backend
    const [rawSales, setRawSales] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    React.useEffect(() => {
      const fetchRawData = async () => {
        setIsLoading(true);
        try {
          // Fetching 'daily' gives us day-by-day granularity which we can aggregate
          const res = await axios.get(\`\${API}/api/admin/reports/sales?period=daily&format=json\`, {
            headers: { Authorization: \`Bearer \${localStorage.getItem('token')}\` }
          });
          setRawSales(res.data);
        } catch (err) {
          toast.error('Failed to load sales data');
        } finally {
          setIsLoading(false);
        }
      };
      fetchRawData();
    }, [API, refreshTrigger]);

    const { filteredData, chartData } = React.useMemo(() => {
        if (rawSales.length === 0) return { filteredData: [], chartData: [] };

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        // Helper to get week string
        const getWeekStr = (dObj: Date) => {
            const d = new Date(dObj);
            d.setHours(0,0,0,0);
            d.setDate(d.getDate() + 4 - (d.getDay()||7));
            const yearStart = new Date(d.getFullYear(),0,1);
            const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
            return \`\${d.getFullYear()}-W\${String(weekNo).padStart(2, '0')}\`;
        };

        let processed = [...rawSales];

        // 1. Filter by date range based on reportFilter
        if (reportFilter === 'Today') {
            processed = processed.filter(r => r.Period === todayStr);
        } else if (reportFilter === 'Custom' && customStart && customEnd) {
            processed = processed.filter(r => r.Period >= customStart && r.Period <= customEnd);
        }

        // 2. Aggregate Data based on reportFilter format
        // If Daily, Today, Custom -> group by Day
        // If Weekly -> group by Week
        // If Monthly -> group by Month
        // If Lifetime -> group by 'Lifetime'
        const aggregatedMap = new Map();
        
        processed.forEach(row => {
            let periodKey = row.Period; // default daily YYYY-MM-DD
            if (reportFilter === 'Weekly') {
                periodKey = getWeekStr(new Date(row.Period));
            } else if (reportFilter === 'Monthly') {
                periodKey = row.Period.substring(0, 7); // YYYY-MM
            } else if (reportFilter === 'Lifetime') {
                periodKey = 'Lifetime';
            }
            
            const groupKey = \`\${periodKey}|\${row.Channel}|\${row.Author}|\${row.BookTitle}\`;
            if (!aggregatedMap.has(groupKey)) {
                aggregatedMap.set(groupKey, { ...row, Period: periodKey });
            } else {
                const existing = aggregatedMap.get(groupKey);
                existing.QuantitySold += row.QuantitySold;
                existing.Revenue += row.Revenue;
            }
        });

        const finalTableData = Array.from(aggregatedMap.values()).sort((a,b) => b.Period.localeCompare(a.Period));

        // 3. Build Chart Data (aggregate by Period and Channel)
        const chartMap = new Map();
        finalTableData.forEach(row => {
            if (!chartMap.has(row.Period)) {
                chartMap.set(row.Period, { name: row.Period, Web: 0, POS: 0 });
            }
            chartMap.get(row.Period)[row.Channel] += row.QuantitySold; // or Revenue
        });
        
        const finalChartData = Array.from(chartMap.values()).sort((a,b) => a.name.localeCompare(b.name));

        return { filteredData: finalTableData, chartData: finalChartData };
    }, [rawSales, reportFilter, customStart, customEnd]);

    const handleExportSalesReport = () => {
      setIsExporting(true);
      setTimeout(() => {
          const headers = ['Period', 'Channel', 'Event', 'Author', 'Book Title', 'Qty', 'Revenue'];
          let csv = headers.join(',') + '\\n';
          filteredData.forEach(row => {
              csv += [\`"\${row.Period}"\`, \`"\${row.Channel}"\`, \`"\${row.Event || '-'}"\`, \`"\${row.Author}"\`, \`"\${row.BookTitle}"\`, row.QuantitySold, row.Revenue].join(',') + '\\n';
          });
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = \`sales_report_\${reportFilter}_\${new Date().toISOString().split('T')[0]}.csv\`;
          a.click();
          setIsExporting(false);
          toast.success('Report downloaded');
      }, 500);
    };

    const todayStr = new Date().toDateString();
    const todaysOrders = orders.filter((o: any) => new Date(o.createdAt).toDateString() === todayStr);
    const ordersArrivedToday = todaysOrders.length;
    const ordersAcceptedToday = todaysOrders.filter((o: any) => ['Processing', 'Dispatched', 'Completed'].includes(o.status)).length;
    const ordersUnderDeliveryToday = todaysOrders.filter((o: any) => o.status === 'Dispatched').length;
    const revenueToday = todaysOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-serif font-medium text-paa-navy flex items-center gap-2">
          <Activity className="w-5 h-5 text-paa-gold" /> Today's Sales Activity
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="dash-kpi-card blue">
            <div className="flex items-start justify-between mb-4"><div className="dash-kpi-icon blue"><ShoppingCart className="w-5 h-5" /></div></div>
            <p className="text-xs font-semibold tracking-wide uppercase text-paa-gray-text mb-1">Orders Arrived Today</p>
            <h3 className="text-3xl font-bold text-paa-navy tracking-tight">{ordersArrivedToday}</h3>
          </div>
          <div className="dash-kpi-card green">
            <div className="flex items-start justify-between mb-4"><div className="dash-kpi-icon green"><CheckCircle className="w-5 h-5" /></div></div>
            <p className="text-xs font-semibold tracking-wide uppercase text-paa-gray-text mb-1">Orders Accepted Today</p>
            <h3 className="text-3xl font-bold text-paa-navy tracking-tight">{ordersAcceptedToday}</h3>
          </div>
          <div className="dash-kpi-card amber">
            <div className="flex items-start justify-between mb-4"><div className="dash-kpi-icon amber"><Package className="w-5 h-5" /></div></div>
            <p className="text-xs font-semibold tracking-wide uppercase text-paa-gray-text mb-1">Made For Delivery Today</p>
            <h3 className="text-3xl font-bold text-paa-navy tracking-tight">{ordersUnderDeliveryToday}</h3>
          </div>
          <div className="dash-kpi-card emerald">
            <div className="flex items-start justify-between mb-4"><div className="dash-kpi-icon emerald"><TrendingUp className="w-5 h-5" /></div></div>
            <p className="text-xs font-semibold tracking-wide uppercase text-paa-gray-text mb-1">Today's Revenue</p>
            <h3 className="text-3xl font-bold text-paa-navy tracking-tight">₹{revenueToday.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-4 md:p-8 border border-paa-navy/5 shadow-premium rounded-3xl-2xl mt-8">
          <div className="mb-6 border-b border-paa-navy/5 pb-4">
            <h3 className="text-xl font-serif font-medium text-paa-navy mb-1 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Dynamic Sales & Revenue Reports
            </h3>
            <p className="text-paa-gray-text text-sm">Generate comprehensive reports on books sold through all channels dynamically.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-end mb-8">
            <div className="flex-1 w-full">
              <label className="dash-label mb-3 block">Report Filter</label>
              <div className="flex flex-wrap gap-2">
                {['Today', 'Daily', 'Weekly', 'Monthly', 'Lifetime', 'Custom'].map(period => (
                  <button key={period} onClick={() => setReportFilter(period)} className={\`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all border \${reportFilter === period ? 'bg-paa-navy text-white border-paa-navy shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-paa-navy/30'}\`}>
                    {period}
                  </button>
                ))}
              </div>
            </div>
            {reportFilter === 'Custom' && (
               <div className="flex gap-2">
                  <div><label className="dash-label text-[10px]">Start Date</label><input type="date" className="dash-input h-10" value={customStart} onChange={e=>setCustomStart(e.target.value)} /></div>
                  <div><label className="dash-label text-[10px]">End Date</label><input type="date" className="dash-input h-10" value={customEnd} onChange={e=>setCustomEnd(e.target.value)} /></div>
               </div>
            )}
            <button onClick={handleExportSalesReport} disabled={isExporting} className="dash-btn dash-btn-primary whitespace-nowrap h-12 px-8 w-full md:w-auto">
              {isExporting ? 'Generating...' : 'Download CSV'}
            </button>
          </div>

          {chartData.length > 0 && (
            <div className="mb-8 border border-paa-navy/5 p-4 rounded-xl overflow-x-auto">
              <h4 className="text-sm font-bold text-paa-navy uppercase tracking-widest mb-4">Books Sold By Channel</h4>
              <div className="h-64 min-w-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" fontSize={10} tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <YAxis fontSize={10} tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="Web" stackId="1" stroke="#3b82f6" fill="#bfdbfe" name="Online Orders (Web)" />
                    <Area type="monotone" dataKey="POS" stackId="1" stroke="#10b981" fill="#a7f3d0" name="Event Sales (POS)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="border border-paa-navy/5 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="dash-table w-full text-left min-w-[600px]">
                <thead className="bg-[#f0f4f8] sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy">Period</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy">Channel</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy">Author</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy">Book Title</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy text-right">Qty</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paa-navy/5 bg-white">
                  {isLoading ? (
                    <tr><td colSpan={6} className="text-center py-6 text-sm text-paa-gray-text"><Loader2 className="w-5 h-5 animate-spin mx-auto text-paa-navy" /></td></tr>
                  ) : filteredData.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-6 text-sm text-paa-gray-text italic">No sales data found.</td></tr>
                  ) : filteredData.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-paa-navy">{row.Period}</td>
                      <td className="px-4 py-3 text-sm"><span className={\`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest \${row.Channel === 'Web' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}\`}>{row.Channel}</span></td>
                      <td className="px-4 py-3 text-sm font-semibold text-paa-navy">{row.Author}</td>
                      <td className="px-4 py-3 text-sm text-paa-navy">{row.BookTitle}</td>
                      <td className="px-4 py-3 text-sm font-bold text-paa-navy text-right">{row.QuantitySold}</td>
                      <td className="px-4 py-3 text-sm font-bold text-green-700 text-right">₹{row.Revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };
\n  ` + after;

  content = before + newTab;
  fs.writeFileSync(path, content, 'utf8');
  console.log('Success Admin Sales Report');
} else {
  console.log('Markers not found');
}
