import os
import re

file_path = r'c:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Rename OrdersTab to OverviewTab
content = content.replace('const OrdersTab = ({ refreshTrigger }: { refreshTrigger: number }) => {', 'const OverviewTab = ({ refreshTrigger }: { refreshTrigger: number }) => {')

# 2. Extract the Web Orders table from OverviewTab and create WebOrdersTab
web_orders_block_pattern = r'(<div className="bg-white border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out flex flex-col">.*?<div className="p-4 border-b border-paa-navy/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-\[#f0f4f8\]">.*?Web Orders</h3>.*?</table>\s*</div>\s*</div>)'

sales_reports_ui = """
      {/* ── Sales & Revenue Reports ── */}
       <div className="bg-white p-4 md:p-8 border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out rounded-3xl-2xl mt-8">
          <div className="mb-6 border-b border-paa-navy/5 pb-4">
             <h3 className="text-xl font-serif font-medium text-paa-navy mb-1 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Sales & Revenue Reports
             </h3>
             <p className="text-paa-gray-text text-sm">Generate comprehensive reports on books sold through all channels (Web & Live Events).</p>
          </div>
          
          {salesChartData.length > 0 && (
            <div className="mb-8 border border-paa-navy/5 p-4 rounded-xl overflow-x-auto">
               <h4 className="text-sm font-bold text-paa-navy uppercase tracking-widest mb-4">Books Sold By Channel</h4>
               <div className="h-64 min-w-[500px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={salesChartData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                     <XAxis dataKey="name" fontSize={10} tick={{fill:'#6B7280'}} axisLine={false} tickLine={false} />
                     <YAxis fontSize={10} tick={{fill:'#6B7280'}} axisLine={false} tickLine={false} />
                     <RechartsTooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                     <Area type="monotone" dataKey="Web" stackId="1" stroke="#3b82f6" fill="#bfdbfe" name="Online Orders (Web)" />
                     <Area type="monotone" dataKey="POS" stackId="1" stroke="#10b981" fill="#a7f3d0" name="Event Sales (POS)" />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 w-full">
              <label className="dash-label">Report Grouping Period</label>
              <select className="dash-input w-full" value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)}>
                <option value="daily">Daily (Group by Day)</option>
                <option value="weekly">Weekly (Group by Week)</option>
                <option value="monthly">Monthly (Group by Month)</option>
                <option value="yearly">Yearly (Group by Year)</option>
                <option value="lifelong">Lifelong (All Time)</option>
              </select>
            </div>
            <button 
              onClick={handleExportSalesReport}
              disabled={isExporting}
              className="dash-btn dash-btn-primary whitespace-nowrap h-12 px-8 w-full md:w-auto"
            >
              {isExporting ? 'Generating Report...' : 'Download CSV Report'}
            </button>
          </div>
          <div className="mt-8 border border-paa-navy/5 rounded-2xl overflow-hidden shadow-sm">
             <div className="overflow-x-auto">
               <table className="dash-table w-full text-left min-w-[600px]">
                  <thead className="bg-[#f0f4f8]">
                     <tr>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-paa-navy/5">Period</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-paa-navy/5">Channel</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-paa-navy/5">Author</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-paa-navy/5">Book Title</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-paa-navy/5 text-right">Qty</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-paa-navy/5 text-right">Revenue</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-paa-navy/5 bg-white">
                     {isLoadingTable ? (
                        <tr><td colSpan={6} className="text-center py-6 text-sm text-paa-gray-text"><Loader2 className="w-5 h-5 animate-spin mx-auto text-paa-navy" /></td></tr>
                     ) : salesTableData.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-6 text-sm text-paa-gray-text italic">No sales data found for this period.</td></tr>
                     ) : salesTableData.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                           <td className="px-4 py-3 text-sm font-medium text-paa-navy">{row.Period}</td>
                           <td className="px-4 py-3 text-sm text-paa-gray-text"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${row.Channel === 'Web' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{row.Channel}</span></td>
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
"""

match = re.search(web_orders_block_pattern, content, re.DOTALL)
if match:
    web_orders_block = match.group(1)
    
    # Remove it from OverviewTab and inject the Sales Reports UI
    content = content.replace(web_orders_block, sales_reports_ui)

    # Build the new WebOrdersTab component
    mobile_friendly_block = web_orders_block.replace(
        '<div className="overflow-x-auto">',
        '<div className="hidden md:block overflow-x-auto">'
    )
    
    mobile_friendly_block = mobile_friendly_block.replace(
        '<div className="flex items-center gap-3">',
        '<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">'
    )
    mobile_friendly_block = mobile_friendly_block.replace(
        'w-64"',
        'w-full sm:w-64"'
    )
    mobile_friendly_block = mobile_friendly_block.replace(
        'className="flex items-center gap-2 px-4 py-2 bg-[#5cb85c]',
        'className="flex items-center justify-center gap-2 px-4 py-2 bg-[#5cb85c]'
    )

    mobile_cards = """
            <div className="md:hidden flex flex-col gap-4 p-4 bg-gray-50">
             {orders.map((ord: any) => (
                <div key={ord.dbId} className="bg-white p-4 rounded-xl shadow-sm border border-paa-navy/10 flex flex-col gap-3">
                   <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-paa-navy text-sm">{ord.id}</p>
                        <p className="text-[10px] text-paa-gray-text flex items-center gap-1 font-medium"><CalendarIcon className="w-3 h-3"/> {ord.date}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest ${ord.status === 'Completed' ? 'bg-green-100 text-green-700' : ord.status === 'Payment Not Received' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {ord.status === 'Completed' ? 'Verified' : ord.status === 'Payment Not Received' ? 'Failed' : 'Pending'}
                      </span>
                   </div>
                   <div>
                     <p className="text-xs text-paa-gray-text font-bold uppercase tracking-widest mb-1">Customer</p>
                     <p className="text-sm font-semibold text-paa-navy">{ord.customer}</p>
                   </div>
                   <div>
                     <p className="text-xs text-paa-gray-text font-bold uppercase tracking-widest mb-1">Items</p>
                     <ul className="text-xs text-paa-gray-text font-medium space-y-1">
                       {ord.items.map((it: any, idx: number) => (
                         <li key={idx} className="flex gap-2"><span className="text-paa-navy font-bold">{it.qty}x</span> <span>{it.title}</span></li>
                       ))}
                     </ul>
                   </div>
                   <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-1">
                     <div className="text-sm font-bold text-paa-navy">₹{ord.total}</div>
                     <button onClick={() => setSelectedOrder(ord)} className="text-xs font-bold text-paa-gold hover:text-paa-navy uppercase tracking-widest">Details</button>
                   </div>
                </div>
             ))}
             {orders.length === 0 && <div className="text-center py-8 text-sm text-gray-500">No orders yet.</div>}
            </div>
    """
    
    mobile_friendly_block = mobile_friendly_block.replace('</table>\n           </div>', '</table>\n           </div>\n' + mobile_cards)

    web_orders_tab_code = f"""
  const WebOrdersTab = ({{ refreshTrigger }}: {{ refreshTrigger: number }}) => {{
    return (
      <div className="space-y-6">
        {mobile_friendly_block}
      </div>
    );
  }};
"""
    
    content = content.replace('const SettingsTab = () => {', web_orders_tab_code + '\n  const SettingsTab = () => {')


# 3. Update activeTab state initialization
content = content.replace("const [activeTab, setActiveTab] = useState('orders');", "const [activeTab, setActiveTab] = useState('overview');")
content = content.replace("const savedTab = localStorage.getItem('adminActiveTab');\n    if (savedTab) setActiveTab(savedTab as any);", "const savedTab = localStorage.getItem('adminActiveTab');\n    if (savedTab && savedTab !== 'orders') setActiveTab(savedTab as any);\n    else setActiveTab('overview');")

# 4. Update the Navigation Array
nav_array_search = """           {[
             { id: 'orders', label: 'Web Orders & Reports', icon: ShoppingCart, hasAlert: pendingAlerts.orders },
             { id: 'authors', label: 'Authors Menu', icon: Users, hasAlert: pendingAlerts.authors },"""
nav_array_replace = """           {[
             { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
             { id: 'web_orders', label: 'Web Orders', icon: ShoppingCart, hasAlert: pendingAlerts.orders },
             { id: 'authors', label: 'Authors Menu', icon: Users, hasAlert: pendingAlerts.authors },"""
content = content.replace(nav_array_search, nav_array_replace)

# 5. Update the Tab Render Logic
tab_render_search = "{activeTab === 'orders' && <OrdersTab refreshTrigger={lastRefreshTime} />}"
tab_render_replace = "{activeTab === 'overview' && <OverviewTab refreshTrigger={lastRefreshTime} />}\n           {activeTab === 'web_orders' && <WebOrdersTab refreshTrigger={lastRefreshTime} />}"
content = content.replace(tab_render_search, tab_render_replace)

# 6. Add imports for Recharts if missing
if 'ResponsiveContainer' not in content:
    import_recharts = "import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';\n"
    content = content.replace("import { Loader2, Plus, Search, Calendar as CalendarIcon,", import_recharts + "import { Loader2, Plus, Search, Calendar as CalendarIcon,")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch successful!")
