const fs = require('fs');
let content = fs.readFileSync('src/app/components/AuthorDashboardPage.tsx', 'utf8');

const replacement1 = `function AuthorSalesReport({ data }: { data: any }) {
  const [reportPeriod, setReportPeriod] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customMonth, setCustomMonth] = useState(new Date().getMonth().toString());
  const [customYear, setCustomYear] = useState(new Date().getFullYear().toString());

  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0,0,0,0);
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

  const webOrders = (data.authorOrders || []).filter((o: any) => (o.status === 'Completed' || o.status === 'Dispatched') && filterByDate(new Date(o.createdAt)));
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
     curr.setHours(0,0,0,0);
     const end = new Date(rangeEnd);
     end.setHours(23,59,59,999);
     while (curr <= end) {
        const d = curr.toLocaleDateString('en-GB');
        salesByDate[d] = { date: d, webSales: 0, posSales: 0, totalRevenue: 0, totalBooks: 0 };
        curr.setDate(curr.getDate() + 1);
     }
  }

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
  });`;

const target1 = content.substring(content.indexOf('function AuthorSalesReport({ data }: { data: any }) {'), content.indexOf('const chartData = Object.values(salesByDate)'));
content = content.replace(target1, replacement1);

const replacement2 = `        {reportPeriod === 'custom' && (
          <div className="flex items-center gap-2 px-2 border-l border-gray-300 ml-2">
            <input type="date" className="border-none bg-white px-3 py-1.5 rounded text-xs shadow-sm" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} />
            <span className="text-gray-400">to</span>
            <input type="date" className="border-none bg-white px-3 py-1.5 rounded text-xs shadow-sm" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} />
          </div>
        )}

        {reportPeriod === 'month' && (
          <div className="flex items-center gap-2 px-2 border-l border-gray-300 ml-2">
            <select className="border-none bg-white px-3 py-1.5 rounded text-xs shadow-sm" value={customMonth} onChange={e => setCustomMonth(e.target.value)}>
              <option value="0">January</option>
              <option value="1">February</option>
              <option value="2">March</option>
              <option value="3">April</option>
              <option value="4">May</option>
              <option value="5">June</option>
              <option value="6">July</option>
              <option value="7">August</option>
              <option value="8">September</option>
              <option value="9">October</option>
              <option value="10">November</option>
              <option value="11">December</option>
            </select>
            <select className="border-none bg-white px-3 py-1.5 rounded text-xs shadow-sm" value={customYear} onChange={e => setCustomYear(e.target.value)}>
              <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
              <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
              <option value={new Date().getFullYear() - 2}>{new Date().getFullYear() - 2}</option>
            </select>
          </div>
        )}`;

const target2 = content.substring(content.indexOf(`{reportPeriod === 'custom' && (`), content.indexOf(`</div>\r\n\r\n      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">`));
if (target2.length > 10) {
  content = content.replace(target2, replacement2);
} else {
  const target2Fallback = content.substring(content.indexOf(`{reportPeriod === 'custom' && (`), content.indexOf(`</div>\n\n      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">`));
  content = content.replace(target2Fallback, replacement2);
}

fs.writeFileSync('src/app/components/AuthorDashboardPage.tsx', content);
console.log('Done replacement');
