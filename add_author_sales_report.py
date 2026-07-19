import os
import re

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add sidebar link
old_sidebar_links = """            <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname === '/dashboard' ? 'active' : ''}`}><BarChart3 className="w-4 h-4"/> Overview</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/orders" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/orders') ? 'active' : ''}`}><ShoppingCart className="w-4 h-4"/> Web Orders</Link>"""

new_sidebar_links = """            <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname === '/dashboard' ? 'active' : ''}`}><BarChart3 className="w-4 h-4"/> Overview</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/orders" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/orders') ? 'active' : ''}`}><ShoppingCart className="w-4 h-4"/> Web Orders</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/sales" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/sales') ? 'active' : ''}`}><TrendingUp className="w-4 h-4"/> Sales Report</Link>"""

content = content.replace(old_sidebar_links, new_sidebar_links)

# 2. Add Route
old_routes = """            <Route path="/orders" element={<AuthorOrders orders={dashboardData.authorOrders} onRefresh={() => fetchDashboardData(true)} />} />"""
new_routes = """            <Route path="/orders" element={<AuthorOrders orders={dashboardData.authorOrders} onRefresh={() => fetchDashboardData(true)} />} />
            <Route path="/sales" element={<AuthorSalesReport data={dashboardData} />} />"""
content = content.replace(old_routes, new_routes)

# 3. Add AuthorSalesReport Component
author_sales_report = """

function AuthorSalesReport({ data }: { data: any }) {
  const [reportPeriod, setReportPeriod] = useState('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const filterByDate = (date: Date) => {
    const now = new Date();
    if (reportPeriod === '7days') return date >= new Date(now.setDate(now.getDate() - 7));
    if (reportPeriod === '30days') return date >= new Date(now.setDate(now.getDate() - 30));
    if (reportPeriod === 'year') return date >= new Date(now.setFullYear(now.getFullYear() - 1));
    if (reportPeriod === 'custom') {
      if (!customStartDate || !customEndDate) return true;
      const s = new Date(customStartDate);
      const e = new Date(customEndDate);
      e.setHours(23, 59, 59, 999);
      return date >= s && date <= e;
    }
    return true; // lifetime
  };

  const webOrders = (data.authorOrders || []).filter((o: any) => (o.status === 'Completed' || o.status === 'Dispatched') && filterByDate(new Date(o.createdAt)));
  const posOrders = (data.posOrders || []).filter((o: any) => o.paymentStatus === 'CONFIRMED' && filterByDate(new Date(o.createdAt)));

  // Daily Aggregation
  const salesByDate: Record<string, { date: string, webSales: number, posSales: number, totalRevenue: number, totalBooks: number }> = {};

  webOrders.forEach((o: any) => {
    const d = new Date(o.createdAt).toLocaleDateString('en-GB');
    if (!salesByDate[d]) salesByDate[d] = { date: d, webSales: 0, posSales: 0, totalRevenue: 0, totalBooks: 0 };
    salesByDate[d].webSales += o.amount;
    salesByDate[d].totalRevenue += o.amount;
    salesByDate[d].totalBooks += o.quantity;
  });

  posOrders.forEach((o: any) => {
    const d = new Date(o.createdAt).toLocaleDateString('en-GB');
    if (!salesByDate[d]) salesByDate[d] = { date: d, webSales: 0, posSales: 0, totalRevenue: 0, totalBooks: 0 };
    salesByDate[d].posSales += o.totalAmount;
    salesByDate[d].totalRevenue += o.totalAmount;
    
    const qty = o.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
    salesByDate[d].totalBooks += qty;
  });

  const chartData = Object.values(salesByDate).sort((a, b) => {
    const [d1, m1, y1] = a.date.split('/');
    const [d2, m2, y2] = b.date.split('/');
    return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime();
  });

  const totalWebRevenue = webOrders.reduce((acc: number, o: any) => acc + o.amount, 0);
  const totalPosRevenue = posOrders.reduce((acc: number, o: any) => acc + o.totalAmount, 0);
  const totalBooksSold = chartData.reduce((acc, curr) => acc + curr.totalBooks, 0);
  const totalRevenue = totalWebRevenue + totalPosRevenue;
  const netEarnings = totalRevenue * 0.7;

  const exportCSV = () => {
    let csv = 'Date,Web Sales,POS Sales,Total Revenue,Books Sold\\n';
    chartData.forEach(row => {
      csv += `"${row.date}","₹${row.webSales}","₹${row.posSales}","₹${row.totalRevenue}","${row.totalBooks}"\\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `author_sales_report_${reportPeriod}.csv`;
    a.click();
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-serif text-paa-navy font-bold tracking-tight">Sales & Revenue Report</h2>
           <p className="text-xs text-paa-gray-text font-bold uppercase tracking-widest mt-1">Track your earnings across platforms</p>
        </div>
        <button onClick={exportCSV} className="dash-btn dash-btn-primary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Export CSV
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6 bg-gray-50 p-2 rounded-xl border border-gray-200 inline-flex flex-wrap">
        {['7days', '30days', 'year', 'lifetime', 'custom'].map(p => (
          <button key={p} onClick={() => setReportPeriod(p)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${reportPeriod === p ? 'bg-white shadow-sm text-paa-navy border border-gray-200' : 'text-gray-500 hover:text-paa-navy'}`}>
            {p === '7days' ? '7 Days' : p === '30days' ? '30 Days' : p === 'year' ? '1 Year' : p === 'lifetime' ? 'Lifetime' : 'Custom'}
          </button>
        ))}
        
        {reportPeriod === 'custom' && (
          <div className="flex items-center gap-2 px-2 border-l border-gray-300 ml-2">
            <input type="date" className="border-none bg-white px-3 py-1.5 rounded text-xs shadow-sm" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} />
            <span className="text-gray-400">to</span>
            <input type="date" className="border-none bg-white px-3 py-1.5 rounded text-xs shadow-sm" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
           <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Total Revenue</p>
           <div className="text-2xl font-bold text-paa-navy">₹{totalRevenue}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
           <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Net Earnings (70%)</p>
           <div className="text-2xl font-bold text-green-600">₹{Math.round(netEarnings)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
           <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Web Sales</p>
           <div className="text-2xl font-bold text-blue-600">₹{totalWebRevenue}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
           <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">POS Sales</p>
           <div className="text-2xl font-bold text-purple-600">₹{totalPosRevenue}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
           <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Books Sold</p>
           <div className="text-2xl font-bold text-paa-navy">{totalBooksSold}</div>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-6 mb-8">
         <h3 className="font-serif font-bold text-lg mb-6">Revenue Trend</h3>
         <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="date" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                    <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip cursor={{fill: '#f8f9fa'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="webSales" name="Web Sales" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="posSales" name="POS Sales" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                 </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No sales data for this period.</div>
            )}
         </div>
      </div>
      
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
         <div className="px-6 py-4 border-b">
            <h3 className="font-serif font-bold text-lg">Daily Breakdown</h3>
         </div>
         <div className="overflow-x-auto">
            <table className="dash-table">
               <thead>
                  <tr>
                     <th>Date</th>
                     <th>Web Sales</th>
                     <th>POS Sales</th>
                     <th>Total Revenue</th>
                     <th>Books Sold</th>
                  </tr>
               </thead>
               <tbody>
                  {chartData.length === 0 && (
                     <tr><td colSpan={5} className="text-center py-6 text-gray-400">No data available</td></tr>
                  )}
                  {chartData.reverse().map((row, i) => (
                     <tr key={i}>
                        <td className="font-semibold">{row.date}</td>
                        <td className="text-blue-600 font-semibold">₹{row.webSales}</td>
                        <td className="text-purple-600 font-semibold">₹{row.posSales}</td>
                        <td className="font-bold text-paa-navy">₹{row.totalRevenue}</td>
                        <td>{row.totalBooks}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
}

"""

content = content + author_sales_report

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Author Sales Report created.")
