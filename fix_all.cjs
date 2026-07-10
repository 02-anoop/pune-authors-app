const fs = require('fs');

// ─────────────────────────────────────────────────────
// 1. OperationsDashboardPage: Remove Avg Order Value + Avg Delivery Time KPIs from WebOrders
// ─────────────────────────────────────────────────────
let ops = fs.readFileSync('c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx', 'utf8');

// Remove the two KPI items from web orders
ops = ops.replace(
  `            { label: 'Successful Orders', value: successfulOrders, icon: Check, colorClass: 'text-green-600 bg-green-100', bgClass: 'border-green-100' },
            { label: 'Avg Order Value', value: \`₹\${avgOrderValueWeb}\`, icon: DollarSign, colorClass: 'text-emerald-600 bg-emerald-100', bgClass: 'border-emerald-100' },
            { label: 'Pending Fulfillment', value: toApproveOrders, icon: Clock, colorClass: 'text-orange-600 bg-orange-100', bgClass: 'border-orange-100' },
            { label: 'Under Delivery', value: underDeliveryOrders, icon: Package, colorClass: 'text-blue-600 bg-blue-100', bgClass: 'border-blue-100' },
            { label: 'Avg Delivery Time', value: Number(avgDeliveryDays) > 0 ? \`\${avgDeliveryDays} Days\` : 'N/A', icon: TrendingUp, colorClass: 'text-teal-600 bg-teal-100', bgClass: 'border-teal-100' },
            { label: 'Total Customers', value: new Set(orders.map((o: any) => o.customerEmail)).size, icon: Users, colorClass: 'text-purple-600 bg-purple-100', bgClass: 'border-purple-100' },`,
  `            { label: 'Successful Orders', value: successfulOrders, icon: Check, colorClass: 'text-green-600 bg-green-100', bgClass: 'border-green-100' },
            { label: 'Pending Fulfillment', value: toApproveOrders, icon: Clock, colorClass: 'text-orange-600 bg-orange-100', bgClass: 'border-orange-100' },
            { label: 'Under Delivery', value: underDeliveryOrders, icon: Package, colorClass: 'text-blue-600 bg-blue-100', bgClass: 'border-blue-100' },
            { label: 'Returned / Cancelled', value: returnedOrdersCount, icon: TrendingUp, colorClass: 'text-red-600 bg-red-100', bgClass: 'border-red-100' },
            { label: 'Total Customers', value: new Set(orders.map((o: any) => o.customerEmail)).size, icon: Users, colorClass: 'text-purple-600 bg-purple-100', bgClass: 'border-purple-100' },`
);

// Fix grid columns from 6 to 5
ops = ops.replace(
  `        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Successful Orders', value: successfulOrders`,
  `        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Successful Orders', value: successfulOrders`
);

// ─────────────────────────────────────────────────────
// 2. Replace "Details" button with inline expand arrow in web orders table
// ─────────────────────────────────────────────────────

// Desktop table - replace Details button with expand arrow
ops = ops.replace(
  `                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => setSelectedOrder(ord)} className="dash-btn dash-btn-ghost">Details</button>
                    </td>`,
  `                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => setSelectedOrder(expandedOrderId === ord.dbId ? null : ord)} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-paa-navy" title="View Details">
                        <ChevronDown size={18} className={\`transition-transform duration-200 \${expandedOrderId === ord.dbId ? 'rotate-180' : ''}\`} />
                      </button>
                    </td>`
);

// Mobile card - replace Details button
ops = ops.replace(
  `                  <button onClick={() => setSelectedOrder(ord)} className="text-xs font-bold text-paa-gold hover:text-paa-navy uppercase tracking-widest">Details</button>`,
  `                  <button onClick={() => setSelectedOrder(expandedOrderId === ord.dbId ? null : ord)} className="p-1 rounded-full hover:bg-gray-100 text-paa-navy" title="View Details">
                    <ChevronDown size={16} className={\`transition-transform duration-200 \${expandedOrderId === ord.dbId ? 'rotate-180' : ''}\`} />
                  </button>`
);

// Add expandedOrderId state inside WebOrdersTab (after fineModalAuthor state)
ops = ops.replace(
  `    const [fineModalAuthor, setFineModalAuthor] = useState<{ id: number, name: string } | null>(null);
    const [fineAmount, setFineAmount] = useState('500');
    const [isSubmittingFine, setIsSubmittingFine] = useState(false);`,
  `    const [fineModalAuthor, setFineModalAuthor] = useState<{ id: number, name: string } | null>(null);
    const [fineAmount, setFineAmount] = useState('500');
    const [isSubmittingFine, setIsSubmittingFine] = useState(false);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);`
);

// After the table row close </tr>, add an expandable row
// Find the specific pattern in the web orders tbody row - add expand row after it
ops = ops.replace(
  `                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => setSelectedOrder(expandedOrderId === ord.dbId ? null : ord)} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-paa-navy" title="View Details">
                        <ChevronDown size={18} className={\`transition-transform duration-200 \${expandedOrderId === ord.dbId ? 'rotate-180' : ''}\`} />
                      </button>
                    </td>
                  </tr>
                ))}\n                {orders.length === 0 && <tr><td colSpan={6}`,
  `                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => { setExpandedOrderId(expandedOrderId === ord.dbId ? null : ord.dbId); }} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-paa-navy" title="View Details">
                        <ChevronDown size={18} className={\`transition-transform duration-200 \${expandedOrderId === ord.dbId ? 'rotate-180' : ''}\`} />
                      </button>
                    </td>
                  </tr>
                  {expandedOrderId === ord.dbId && (
                    <tr>
                      <td colSpan={6} style={{ padding: 0 }}>
                        <div className="bg-gray-50 border-t border-b border-paa-navy/5 px-6 py-4 animate-fade-in-up">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Customer Details</p>
                              <p className="text-sm font-bold text-paa-navy">{ord.customer}</p>
                              <p className="text-xs text-gray-500">{ord.customerEmail}</p>
                              <p className="text-xs text-gray-500 mt-1">{ord.address}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Items Ordered</p>
                              <div className="flex flex-col gap-1">
                                {ord.items?.map((it: any, i: number) => (
                                  <div key={i} className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-paa-navy">{it.qty}x {it.title}</span>
                                    <span className="text-gray-500 ml-2">₹{it.price}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Order Summary</p>
                              <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Date</span><span className="font-bold text-paa-navy">{ord.date}</span></div>
                              <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Total</span><span className="font-bold text-green-700">₹{ord.total}</span></div>
                              <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><span className="font-bold text-paa-navy">{ord.status}</span></div>
                              {ord.transactionId && <div className="flex justify-between text-sm mt-1"><span className="text-gray-500">Txn ID</span><span className="font-bold text-paa-navy text-xs">{ord.transactionId}</span></div>}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                ))}\n                {orders.length === 0 && <tr><td colSpan={6}`
);

console.log('Step 1 & 2 done: Web orders KPI and Details button');

// ─────────────────────────────────────────────────────
// 3. Authors table: Add checkbox for selective catalogue download
// ─────────────────────────────────────────────────────

// Add selectedAuthorsForCatalogue state
ops = ops.replace(
  `  const renderAuthorsTab = ({ refreshTrigger }: any) => {
    const handleExportAuthorsCSV = () => {`,
  `  const renderAuthorsTab = ({ refreshTrigger }: any) => {
    const [selectedAuthorsForCatalogue, setSelectedAuthorsForCatalogue] = React.useState<number[]>([]);
    const toggleAuthorSelection = (id: number) => {
      setSelectedAuthorsForCatalogue(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };
    const handleExportAuthorsCSV = () => {`
);

// Add checkbox column header
ops = ops.replace(
  `              <tr>
                <th>Author Details</th>
                <th>Contact</th>
                <th>Payment Info</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Books</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>`,
  `              <tr>
                <th style={{ width: 36 }}><input type="checkbox" onChange={e => { const ids = authors.map((a: any) => a.id); setSelectedAuthorsForCatalogue(e.target.checked ? ids : []); }} checked={selectedAuthorsForCatalogue.length === authors.length && authors.length > 0} /></th>
                <th>Author Details</th>
                <th>Contact</th>
                <th>Payment Info</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Books</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>`
);

// Add Download Catalogue button
ops = ops.replace(
  `            <button onClick={handleExportAuthorsCSV} className="dash-btn dash-btn-ghost flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50">
              <Download className="w-4 h-4" /> Export CSV
            </button>`,
  `            <button onClick={handleExportAuthorsCSV} className="dash-btn dash-btn-ghost flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            {selectedAuthorsForCatalogue.length > 0 && (
              <button
                onClick={() => {
                  const selectedIds = selectedAuthorsForCatalogue;
                  const url = \`\${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/catalogue/selected?ids=\${selectedIds.join(',')}\`;
                  window.open(url, '_blank');
                }}
                className="dash-btn dash-btn-primary flex items-center gap-2 bg-paa-navy text-white"
              >
                <Download className="w-4 h-4" /> Download Catalogue ({selectedAuthorsForCatalogue.length})
              </button>
            )}`
);

fs.writeFileSync('c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx', ops, 'utf8');
console.log('Step 3 done: Authors catalogue checkboxes');
