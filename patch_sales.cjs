const fs = require('fs');
let content = fs.readFileSync('c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx', 'utf8');

const oldSalesStart = content.indexOf('function AuthorSalesReport({ data }: { data: any }) {');
const oldSalesEnd = content.indexOf('export function AuthorProfile({');

if (oldSalesStart !== -1 && oldSalesEnd !== -1) {
  const newSalesReport = `function AuthorSalesReport({ data }: { data: any }) {
  const [reportPeriod, setReportPeriod] = useState('lifetime');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customMonth, setCustomMonth] = useState(new Date().getMonth().toString());
  const [customYear, setCustomYear] = useState(new Date().getFullYear().toString());

  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const filterByDate = (date: Date) => {
    const now = new Date();
    if (reportPeriod === 'today') return date.toDateString() === now.toDateString();
    if (reportPeriod === 'week') {
      const startOfWeek = getStartOfWeek(now);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return date >= startOfWeek && date <= endOfWeek;
    }
    if (reportPeriod === 'month') {
      return date.getMonth() === parseInt(customMonth) && date.getFullYear() === parseInt(customYear);
    }
    if (reportPeriod === 'custom') {
      if (!customStartDate || !customEndDate) return true;
      const s = new Date(customStartDate);
      s.setHours(0, 0, 0, 0);
      const e = new Date(customEndDate);
      e.setHours(23, 59, 59, 999);
      return date >= s && date <= e;
    }
    return true; // lifetime
  };

  const webOrders = (data.authorOrders || []).filter((o: any) => o.paymentVerified && filterByDate(new Date(o.createdAt || o.date)));
  const posOrders = (data.posOrders || []).filter((o: any) => o.paymentStatus === 'CONFIRMED' && filterByDate(new Date(o.createdAt)));

  // Daily Aggregation
  const salesByDate: Record<string, { date: string, webSales: number, posSales: number, totalRevenue: number, totalBooks: number }> = {};

  const now = new Date();
  let rangeStart: Date | null = null;
  let rangeEnd: Date | null = null;

  if (reportPeriod === 'today') {
    rangeStart = new Date(now);
    rangeEnd = new Date(now);
  } else if (reportPeriod === 'week') {
    rangeStart = getStartOfWeek(now);
    rangeEnd = new Date(rangeStart);
    rangeEnd.setDate(rangeStart.getDate() + 6);
  } else if (reportPeriod === 'month') {
    rangeStart = new Date(parseInt(customYear), parseInt(customMonth), 1);
    rangeEnd = new Date(parseInt(customYear), parseInt(customMonth) + 1, 0);
  } else if (reportPeriod === 'custom' && customStartDate && customEndDate) {
    rangeStart = new Date(customStartDate);
    rangeEnd = new Date(customEndDate);
  }

  if (rangeStart && rangeEnd) {
    const curr = new Date(rangeStart);
    curr.setHours(0, 0, 0, 0);
    const end = new Date(rangeEnd);
    end.setHours(23, 59, 59, 999);
    while (curr <= end) {
      const d = curr.toLocaleDateString('en-GB');
      salesByDate[d] = { date: d, webSales: 0, posSales: 0, totalRevenue: 0, totalBooks: 0 };
      curr.setDate(curr.getDate() + 1);
    }
  }

  webOrders.forEach((o: any) => {
    const d = new Date(o.createdAt || o.date).toLocaleDateString('en-GB');
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
    return new Date(\`\${y1}-\${m1}-\${d1}\`).getTime() - new Date(\`\${y2}-\${m2}-\${d2}\`).getTime();
  });

  const totalWebRevenue = webOrders.reduce((acc: number, o: any) => acc + o.amount, 0);
  const totalPosRevenue = posOrders.reduce((acc: number, o: any) => acc + o.totalAmount, 0);
  const totalBooksSold = chartData.reduce((acc, curr) => acc + curr.totalBooks, 0);
  const totalRevenue = totalWebRevenue + totalPosRevenue;
  const eventsParticipated = (data.eventInvites || []).filter((inv: any) => inv.optInStatus === 'Registered' || inv.optInStatus === 'Approved').length;

  const totalEventFees = (data.eventInvites || []).filter((inv: any) => inv.optInStatus === 'Registered').reduce((acc: number, inv: any) => {
    const evt = inv.event;
    if (!evt) return acc;
    if (evt.feeType === 'Flat Fee' || evt.feeType === 'Per Author') {
      return acc + (evt.registrationFee || 0);
    } else if (evt.feeType === 'Per Title') {
      const titlesCount = (data.listedBooks || []).filter((lb: any) => lb.eventId === evt.id).length;
      return acc + ((evt.registrationFee || 0) * titlesCount);
    }
    return acc;
  }, 0);
  const platformFeePaid = 1000;
  const totalFeesPaid = platformFeePaid + totalEventFees;

  const allTransactions = [
    ...webOrders.map((o: any) => ({
      rawDate: new Date(o.createdAt || o.date).getTime(),
      type: 'Web',
      date: new Date(o.createdAt || o.date).toLocaleString('en-GB'),
      id: \`WEB-\${o.orderId}\`,
      customer: o.customerName || 'N/A',
      email: o.customerEmail || 'N/A',
      phone: o.customerPhone || 'N/A',
      address: (o.address || 'N/A').replace(/,/g, ' '),
      items: \`\${o.bookTitle || o.title} (x\${o.quantity})\`,
      quantity: o.quantity,
      amount: o.amount,
      status: o.status
    })),
    ...posOrders.map((o: any) => ({
      rawDate: new Date(o.createdAt).getTime(),
      type: 'POS',
      date: new Date(o.createdAt).toLocaleString('en-GB'),
      id: \`POS-\${o.id}\`,
      customer: 'Walk-in',
      email: 'N/A',
      phone: 'N/A',
      address: 'N/A',
      items: o.items.map((i: any) => \`\${i.book?.title} (x\${i.quantity})\`).join('; '),
      quantity: o.items.reduce((acc: number, i: any) => acc + i.quantity, 0),
      amount: o.totalAmount,
      status: o.paymentMethod
    }))
  ].sort((a, b) => b.rawDate - a.rawDate);

  const exportCSV = () => {
    let csv = 'Transaction Date,Order Type,Order ID,Customer Name,Email,Phone,Delivery Address,Books Included,Total Quantity,Total Amount,Status/Payment Method\\n';
    allTransactions.forEach(tx => {
      csv += \`"\${tx.date}","\${tx.type}","\${tx.id}","\${tx.customer}","\${tx.email}","\${tx.phone}","\${tx.address}","\${tx.items}","\${tx.quantity}","₹\${tx.amount}","\${tx.status}"\\n\`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`detailed_sales_report_\${reportPeriod}.csv\`;
    a.click();
  };

  return (
    <div className="animate-fade-in-up pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-serif text-paa-navy font-bold tracking-tight mb-2">Sales Intelligence</h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Real-time revenue tracking across all channels</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Dynamic Filters */}
          <div className="flex bg-white rounded-lg shadow-sm border border-paa-navy/5 overflow-hidden">
            {['today', 'week', 'month', 'lifetime', 'custom'].map(p => (
              <button key={p} onClick={() => setReportPeriod(p)} className={\`px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all \${reportPeriod === p ? 'bg-paa-navy text-white' : 'hover:bg-gray-50 text-gray-500'}\`}>
                {p === 'today' ? 'Today' : p === 'week' ? 'Week' : p === 'month' ? 'Month' : p === 'lifetime' ? 'Lifetime' : 'Custom'}
              </button>
            ))}
          </div>
          <button onClick={exportCSV} className="dash-btn-primary flex items-center gap-2 whitespace-nowrap shadow-sm text-xs">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {reportPeriod === 'custom' && (
        <div className="flex items-center gap-4 mb-8 bg-white p-4 rounded-xl border border-paa-navy/5 shadow-sm inline-flex">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">From</span>
            <input type="date" className="border-none bg-gray-50 px-4 py-2 rounded-lg text-sm font-bold text-paa-navy outline-none" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">To</span>
            <input type="date" className="border-none bg-gray-50 px-4 py-2 rounded-lg text-sm font-bold text-paa-navy outline-none" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} />
          </div>
        </div>
      )}

      {reportPeriod === 'month' && (
        <div className="flex items-center gap-4 mb-8 bg-white p-4 rounded-xl border border-paa-navy/5 shadow-sm inline-flex">
          <select className="border-none bg-gray-50 px-4 py-2 rounded-lg text-sm font-bold text-paa-navy outline-none" value={customMonth} onChange={e => setCustomMonth(e.target.value)}>
            {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <select className="border-none bg-gray-50 px-4 py-2 rounded-lg text-sm font-bold text-paa-navy outline-none" value={customYear} onChange={e => setCustomYear(e.target.value)}>
            {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      )}

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-paa-navy/5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 relative z-10">Total Revenue</p>
          <div className="text-2xl font-bold text-paa-navy relative z-10">₹{totalRevenue.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-paa-navy/5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 relative z-10">Fees Paid</p>
          <div className="text-2xl font-bold text-red-500 relative z-10">₹{totalFeesPaid.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-paa-navy/5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 relative z-10">Web Sales</p>
          <div className="text-2xl font-bold text-blue-600 relative z-10">₹{totalWebRevenue.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-paa-navy/5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 relative z-10">POS Sales</p>
          <div className="text-2xl font-bold text-purple-600 relative z-10">₹{totalPosRevenue.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-paa-navy/5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 relative z-10">Books Sold</p>
          <div className="text-2xl font-bold text-emerald-600 relative z-10">{totalBooksSold}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-paa-navy/5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 relative z-10">Events</p>
          <div className="text-2xl font-bold text-amber-500 relative z-10">{eventsParticipated}</div>
        </div>
      </div>

      {/* TREND CHART */}
      <div className="bg-white rounded-xl shadow-sm border border-paa-navy/5 p-8 mb-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-serif font-bold text-paa-navy">Revenue Trajectory</h3>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1">Web vs POS Sales Distribution</p>
          </div>
          <div className="flex gap-4">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/20"></div>
                <span className="text-xs font-bold text-gray-500">Web</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500 shadow-sm shadow-purple-500/20"></div>
                <span className="text-xs font-bold text-gray-500">POS</span>
             </div>
          </div>
        </div>
        <div className="h-[350px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWeb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} tickLine={false} axisLine={false} dy={10} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} tickLine={false} axisLine={false} tickFormatter={(val) => \`₹\${val}\`} />
                <Tooltip 
                  cursor={{ stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '4 4' }} 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }} 
                />
                <Area type="monotone" dataKey="webSales" name="Web Sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorWeb)" />
                <Area type="monotone" dataKey="posSales" name="POS Sales" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorPos)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm italic font-bold">No sales data for this period.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* DAILY BREAKDOWN */}
        <div className="bg-white rounded-xl shadow-sm border border-paa-navy/5 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-bold text-paa-navy uppercase tracking-widest">Daily Breakdown</h3>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-white text-gray-400 uppercase tracking-widest text-[10px] sticky top-0 border-b border-gray-100 shadow-sm">
                <tr>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Web</th>
                  <th className="px-6 py-4 font-bold">POS</th>
                  <th className="px-6 py-4 font-bold text-paa-navy">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {chartData.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-10 text-gray-400 italic">No daily data available</td></tr>
                )}
                {chartData.reverse().map((row, i) => (
                  <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-600">{row.date}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">₹{row.webSales.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 font-bold text-purple-600">₹{row.posSales.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 font-black text-paa-navy">₹{row.totalRevenue.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAILED TRANSACTIONS */}
        <div className="bg-white rounded-xl shadow-sm border border-paa-navy/5 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-paa-navy uppercase tracking-widest">Recent Transactions</h3>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded">{allTransactions.length} total</span>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-white text-gray-400 uppercase tracking-widest text-[10px] sticky top-0 border-b border-gray-100 shadow-sm">
                <tr>
                  <th className="px-6 py-4 font-bold">Type</th>
                  <th className="px-6 py-4 font-bold">Details</th>
                  <th className="px-6 py-4 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {allTransactions.length === 0 && (
                  <tr><td colSpan={3} className="text-center py-10 text-gray-400 italic">No transactions found</td></tr>
                )}
                {allTransactions.map((tx, i) => (
                  <tr key={i} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className={\`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border \${tx.type === 'Web' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}\`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-paa-navy mb-0.5">{tx.customer}</p>
                      <p className="text-[10px] text-gray-400 max-w-[200px] truncate" title={tx.items}>{tx.items}</p>
                      <p className="text-[9px] text-gray-300 mt-1 uppercase tracking-widest font-bold">{tx.date}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-black text-emerald-600 text-sm">₹{tx.amount.toLocaleString('en-IN')}</p>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 block group-hover:text-paa-navy transition-colors">{tx.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

`;

  const newContent = content.slice(0, oldSalesStart) + newSalesReport + content.slice(oldSalesEnd);
  fs.writeFileSync('c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx', newContent, 'utf8');
  console.log('Successfully updated AuthorSalesReport completely!');
} else {
  console.log('Could not find AuthorSalesReport block.');
}
