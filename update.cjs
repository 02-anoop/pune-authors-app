const fs = require('fs');
const path = 'c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update insights
content = content.replace(
  /const insights = \[\s*\{ label: 'Avg Order Value'.*?\{ label: 'Order Completion'.*?\{ label: 'Web Books Sold'.*?\{ label: 'Event Adoption'.*?\];/s,
  `const insights = [
      { label: 'Order Completion', value: \`\${orderCompletionRate}%\`, desc: 'Of all web orders', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Web Books Sold', value: totalBooksSoldWeb, desc: 'Total physical copies sold online', icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-50' }
    ];`
);

const startMarker = 'const WebOrdersTab = ({ refreshTrigger }: { refreshTrigger?: number }) => {';
const startIndex = content.indexOf(startMarker);
const endMarker = 'const LateAuthorsSystemTab = () => {';
const endIndex = content.indexOf(endMarker);

if (startIndex > -1 && endIndex > -1) {
  let before = content.slice(0, startIndex);
  let after = content.slice(endIndex);

  let newTab = `const WebOrdersTab = ({ refreshTrigger, onNavigate }: { refreshTrigger?: number, onNavigate?: (t: any) => void }) => {
    const [expandedOrder, setExpandedOrder] = React.useState<string | null>(null);

    const successfulOrders = orders.filter((o: any) => o.status === 'Completed').length;
    const toApproveOrders = orders.filter((o: any) => o.status === 'Pending Verification' || o.status === 'Processing').length;
    const underDeliveryOrders = orders.filter((o: any) => o.status === 'Dispatched').length;
    const returnedOrdersCount = orders.filter((o: any) => o.status === 'Returned' || o.status === 'Cancelled').length;

    const totalRevenueWebOrders = orders.reduce((sum: number, o: any) => (o.status === 'Completed' || o.status === 'Dispatched') ? sum + (o.total || 0) : sum, 0);
    const avgOrderValueWeb = successfulOrders > 0 ? Math.round(totalRevenueWebOrders / successfulOrders) : 0;

    let totalDeliveryTime = 0;
    let deliveredCount = 0;

    orders.forEach((o: any) => {
      o.items?.forEach((it: any) => {
        if (it.status === 'Delivered' && it.dispatchedAt && it.deliveredAt) {
          const time = new Date(it.deliveredAt).getTime() - new Date(it.dispatchedAt).getTime();
          totalDeliveryTime += time;
          deliveredCount++;
        }
      });
    });
    const avgDeliveryDays = deliveredCount > 0 ? (totalDeliveryTime / deliveredCount / (1000 * 3600 * 24)).toFixed(1) : 0;

    const knownStates = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir'];
    const stateCounts: Record<string, number> = {};
    orders.forEach((o: any) => {
      if (o.address) {
        let foundState = 'Other';
        for (const s of knownStates) {
           if (o.address.toLowerCase().includes(s.toLowerCase())) { foundState = s; break; }
        }
        stateCounts[foundState] = (stateCounts[foundState] || 0) + 1;
      }
    });
    const stateEntries = Object.entries(stateCounts).sort((a, b) => b[1] - a[1]);

    const handleDeleteWebOrder = async (id: number) => {
       if (window.confirm('Delete this web order?')) {
          try {
             await axios.delete(\`\${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/orders/\${id}\`);
             toast.success('Order deleted');
             // refresh handled via polling
          } catch(err) {
             toast.error('Failed to delete');
          }
       }
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Successful Orders', value: successfulOrders, icon: Check, colorClass: 'text-green-600 bg-green-100', bgClass: 'border-green-100' },
            { label: 'Avg Order Value', value: \`₹\${avgOrderValueWeb}\`, icon: DollarSign, colorClass: 'text-emerald-600 bg-emerald-100', bgClass: 'border-emerald-100' },
            { label: 'Pending Fulfillment', value: toApproveOrders, icon: Clock, colorClass: 'text-orange-600 bg-orange-100', bgClass: 'border-orange-100' },
            { label: 'Under Delivery', value: underDeliveryOrders, icon: Package, colorClass: 'text-blue-600 bg-blue-100', bgClass: 'border-blue-100' },
            { label: 'Avg Delivery Time', value: Number(avgDeliveryDays) > 0 ? \`\${avgDeliveryDays} Days\` : 'N/A', icon: TrendingUp, colorClass: 'text-teal-600 bg-teal-100', bgClass: 'border-teal-100' },
            { label: 'Total Customers', value: new Set(orders.map((o: any) => o.customerEmail)).size, icon: Users, colorClass: 'text-purple-600 bg-purple-100', bgClass: 'border-purple-100' },
          ].map((kpi, i) => (
            <div key={i} className={\`bg-white rounded-2xl border p-4 shadow-sm flex flex-col justify-center items-start gap-3 hover:-translate-y-1 hover:shadow-md transition-all\`}>
              <div className={\`w-10 h-10 rounded-full flex items-center justify-center shrink-0 \${kpi.colorClass}\`}>
                <kpi.icon size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-paa-gray-text mb-1">{kpi.label}</p>
                <h3 className="text-2xl font-bold text-paa-navy">{kpi.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {(() => {
              const alerts: any[] = [];
              orders.forEach((ord: any) => {
                ord.items?.forEach((it: any) => {
                  if (it.status === 'Completed' && it.deliveredAt && it.dispatchedAt) {
                    const days = (new Date(it.deliveredAt).getTime() - new Date(it.dispatchedAt).getTime()) / (1000 * 3600 * 24);
                    if (days > 10 || (it.feedbackRating && it.feedbackRating <= 2) || (it.feedbackCondition === 'Damaged')) {
                      alerts.push({ ...it, orderId: ord.id, customer: ord.customer, date: ord.date, issue: it.feedbackCondition === 'Damaged' ? 'Damaged Condition Reported' : (it.feedbackRating && it.feedbackRating <= 2) ? \`Low Rating (\${it.feedbackRating} Stars)\` : \`Slow Delivery (\${Math.round(days)} days)\` });
                    }
                  } else if (it.status === 'Dispatched' && it.dispatchedAt) {
                    const days = (new Date().getTime() - new Date(it.dispatchedAt).getTime()) / (1000 * 3600 * 24);
                    if (days > 14) alerts.push({ ...it, orderId: ord.id, customer: ord.customer, date: ord.date, issue: \`Stuck in Transit (\${Math.round(days)} days)\` });
                  } else if ((it.status === 'Pending' || it.status === 'Accepted' || it.status === 'Pending Verification') && it.createdAt) {
                    const days = (new Date().getTime() - new Date(it.createdAt).getTime()) / (1000 * 3600 * 24);
                    if (days > 7) alerts.push({ ...it, orderId: ord.id, customer: ord.customer, date: ord.date, issue: \`Not Dispatched (\${Math.round(days)} days)\` });
                  }
                });
              });

              if (alerts.length === 0) return null;
              const topAlerts = alerts.slice(0, 3);
              return (
                <div className="bg-red-50 border border-red-200 shadow-sm flex flex-col">
                  <div className="p-4 border-b border-red-200 flex items-center justify-between bg-red-100/50">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <h3 className="text-lg font-serif font-semibold text-red-900 tracking-tight">Author Logistics Alerts (Defaulters)</h3>
                    </div>
                    {alerts.length > 3 && onNavigate && (
                      <button onClick={() => onNavigate('late_authors')} className="text-xs font-bold uppercase tracking-widest text-red-700 hover:text-red-900 bg-white px-3 py-1.5 rounded shadow-sm border border-red-200">View All</button>
                    )}
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-xs uppercase tracking-widest text-red-800 border-b border-red-200">
                          <th className="pb-2 font-bold">Author</th>
                          <th className="pb-2 font-bold">Book</th>
                          <th className="pb-2 font-bold">Issue</th>
                          <th className="pb-2 font-bold">Order Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topAlerts.map((a, idx) => (
                          <tr key={idx} className="border-b border-red-100 last:border-0 text-sm text-red-900">
                            <td className="py-3 font-bold">{a.authorName}</td>
                            <td className="py-3">{a.title}</td>
                            <td className="py-3 font-bold flex items-center gap-2">
                              <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs">{a.issue}</span>
                              {a.feedbackComments && <span className="text-xs italic text-red-700 bg-red-50 px-2 py-1 rounded border border-red-100">"{a.feedbackComments}"</span>}
                            </td>
                            <td className="py-3">
                              <p className="font-mono text-xs">{a.orderId}</p>
                              <p className="text-xs opacity-80">{a.customer} ({a.date})</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
            
            <div className="bg-white border border-paa-navy/5 shadow-premium flex flex-col">
              <div className="p-4 border-b border-paa-navy/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f0f4f8]">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-serif font-semibold text-paa-navy tracking-tight">Web Orders</h3>
                </div>
              </div>
              <div className="hidden md:block overflow-x-auto">
                <table className="dash-table w-full">
                  <thead>
                    <tr>
                      <th>Order ID & Date</th>
                      <th>Customer</th>
                      <th>Items / Books</th>
                      <th style={{ textAlign: 'center' }}>Amount</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord: any) => (
                      <React.Fragment key={ord.dbId}>
                      <tr>
                        <td>
                          <p className="font-bold text-paa-navy mb-1">{ord.id}</p>
                          <p className="text-xs text-paa-gray-text flex items-center gap-1 font-medium"><CalendarIcon className="w-3 h-3" /> {ord.date}</p>
                        </td>
                        <td className="font-bold text-paa-navy">{ord.customer}</td>
                        <td>
                          <ul className="text-xs text-paa-gray-text font-medium space-y-1">
                            {ord.items.map((it: any, idx: number) => (
                              <li key={idx} className="flex gap-2"><span className="text-paa-navy font-bold">{it.qty}x</span> <span>{it.title} <span className="text-gray-400 italic">by {it.authorName}</span></span></li>
                            ))}
                          </ul>
                        </td>
                        <td style={{ textAlign: 'center' }} className="font-bold text-paa-navy">₹{ord.total}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={\`dash-badge \${ord.status === 'Completed' ? 'active' : ord.status === 'Payment Not Received' ? 'rejected' : 'pending'}\`}>
                            {ord.status === 'Completed' ? 'Accepted' : ord.status === 'Payment Not Received' ? 'Payment Failed' : 'Pending'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="flex items-center justify-center gap-2">
                              <button onClick={() => setExpandedOrder(expandedOrder === ord.id ? null : ord.id)} className="dash-btn dash-btn-ghost w-8 h-8 p-0 flex items-center justify-center">
                                {expandedOrder === ord.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                              <button onClick={() => handleDeleteWebOrder(ord.dbId)} className="dash-btn dash-btn-ghost text-red-500 w-8 h-8 p-0 flex items-center justify-center hover:bg-red-50 hover:text-red-600">
                                <Trash2 size={16} />
                              </button>
                          </div>
                        </td>
                      </tr>
                      {expandedOrder === ord.id && (
                        <tr className="bg-gray-50 border-b border-paa-navy/10">
                            <td colSpan={6} className="p-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="font-bold text-paa-navy mb-2">Bill Details</p>
                                        <div className="bg-white p-3 rounded border border-gray-100 shadow-sm text-xs space-y-1 text-gray-600">
                                            {ord.items.map((it: any, idx: number) => (
                                                <div key={idx} className="flex justify-between">
                                                    <span>{it.qty}x {it.title}</span>
                                                    <span>₹{(it.mrp * it.qty).toFixed(2)}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between border-t border-gray-100 pt-1 mt-1">
                                                <span>Delivery Charges</span>
                                                <span>₹{(ord.items.reduce((s:number,it:any) => s+(it.shippingCost*it.qty||0),0) || 50).toFixed(2)}</span>
                                            </div>
                                            {ord.bundleOffer && (
                                                <div className="flex justify-between text-paa-gold">
                                                    <span>Bundle Offer</span>
                                                    <span>Applied</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between font-bold text-paa-navy border-t border-gray-200 pt-1 mt-1">
                                                <span>Total</span>
                                                <span>₹{ord.total}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-paa-navy mb-2">Shipping Address</p>
                                        <p className="text-xs text-gray-600 whitespace-pre-wrap bg-white p-3 rounded border border-gray-100 shadow-sm">
                                            {ord.address || 'Address not provided'}
                                        </p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                      )}
                      </React.Fragment>
                    ))}
                    {orders.length === 0 && <tr><td colSpan={6} className="text-center py-8">No orders yet.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden flex flex-col gap-4 p-4 bg-gray-50">
                {orders.map((ord: any) => (
                  <div key={ord.dbId} className="bg-white p-4 rounded-xl shadow-sm border border-paa-navy/10 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-paa-navy text-sm">{ord.id}</p>
                        <p className="text-[10px] text-paa-gray-text flex items-center gap-1 font-medium"><CalendarIcon className="w-3 h-3" /> {ord.date}</p>
                      </div>
                      <span className={\`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest \${ord.status === 'Completed' ? 'bg-green-100 text-green-700' : ord.status === 'Payment Not Received' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}\`}>
                        {ord.status === 'Completed' ? 'Accepted' : ord.status === 'Payment Not Received' ? 'Failed' : 'Pending'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-paa-gray-text font-bold uppercase tracking-widest mb-1">Customer</p>
                      <p className="text-sm font-semibold text-paa-navy">{ord.customer}</p>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-1">
                      <div className="text-sm font-bold text-paa-navy">₹{ord.total}</div>
                      <div className="flex items-center gap-2">
                          <button onClick={() => handleDeleteWebOrder(ord.dbId)} className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-widest"><Trash2 size={16} /></button>
                          <button onClick={() => setExpandedOrder(expandedOrder === ord.id ? null : ord.id)} className="text-xs font-bold text-paa-gold hover:text-paa-navy uppercase tracking-widest flex items-center gap-1">Details {expandedOrder === ord.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
                      </div>
                    </div>
                    {expandedOrder === ord.id && (
                        <div className="pt-3 border-t border-gray-100 space-y-3">
                           <div className="bg-gray-50 p-2 rounded text-xs text-gray-600">
                               {ord.items.map((it:any, idx:number)=>(
                                   <div key={idx} className="flex justify-between"><span>{it.qty}x {it.title}</span> <span>₹{(it.mrp * it.qty).toFixed(2)}</span></div>
                               ))}
                               <div className="flex justify-between border-t border-gray-200 pt-1 mt-1 font-bold text-paa-navy"><span>Total</span> <span>₹{ord.total}</span></div>
                           </div>
                           <div>
                               <p className="text-[10px] text-paa-gray-text font-bold uppercase tracking-widest mb-1">Address</p>
                               <p className="text-xs text-gray-600">{ord.address}</p>
                           </div>
                        </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
               <h3 className="text-sm font-bold text-paa-navy uppercase tracking-widest mb-4 flex items-center gap-2"><MapPin size={16} /> State-Wise Distribution</h3>
               <div className="space-y-3">
                 {stateEntries.length === 0 ? (
                   <p className="text-sm text-gray-500">No address data available.</p>
                 ) : (
                   stateEntries.map(([state, count], idx) => (
                     <div key={idx} className="flex items-center justify-between">
                       <span className="text-sm font-medium text-gray-700">{state}</span>
                       <span className="text-sm font-bold text-paa-navy bg-gray-50 px-2 py-1 rounded">{count}</span>
                     </div>
                   ))
                 )}
               </div>
             </div>
          </div>
        </div>
      </div>
    );
  };
\n\n  ` + after;

  content = before + newTab;
  
  content = content.replace(/<WebOrdersTab refreshTrigger=\{lastRefreshTime\} \/>/g, "<WebOrdersTab refreshTrigger={lastRefreshTime} onNavigate={(tab) => setActiveTab(tab)} />");

  fs.writeFileSync(path, content, 'utf8');
  console.log('Success');
} else {
  console.log('Markers not found');
}
