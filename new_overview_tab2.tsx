  const OverviewTab = ({ refreshTrigger }: { refreshTrigger: number }) => {
    const [localDismissed, setLocalDismissed] = useState<string[]>([]);
    const [notifiedBooks, setNotifiedBooks] = useState<string[]>([]);

    const handleDismiss = (e: React.MouseEvent, id: string) => {
       e.stopPropagation();
       setLocalDismissed(prev => [...prev, id]);
    };

    // Low stock books
    const lowStockBooks = books.filter((b: any) => (b.inventory || 0) < 5 && b.status === 'Approved' && !notifiedBooks.includes(b.id || b.dbId));

    const handleNotifyAllLowStock = () => {
       const ids = lowStockBooks.map((b: any) => b.id || b.dbId);
       setNotifiedBooks(prev => [...prev, ...ids]);
       toast.success(`Notified ${ids.length} authors about low stock!`);
    };

    const handleNotifySingleBook = (id: string) => {
       setNotifiedBooks(prev => [...prev, id]);
       toast.success('Author notified about low stock!');
    };

    // KPIs & Insights
    const pendingAuthors = authors.filter((a: any) => a.status === 'Pending').length;
    const pendingEvents = authors.filter((a: any) => a.eventParticipation && a.eventParticipation.length > 0 && a.eventParticipation.some((e: any) => e.status === 'Pending')).length;
    const pendingOrders = orders.filter((o: any) => o.status === 'Pending Verification' || o.status === 'Processing').length;
    const pendingQueries = prevCountsRef.current?.queries || 0;

    const totalOrders = orders.length;
    const completedOrders = orders.filter((o: any) => o.status === 'Completed' || o.status === 'Dispatched').length;
    const orderCompletionRate = totalOrders ? Math.round((completedOrders / totalOrders) * 100) : 0;

    const totalAuthorsCount = authors.length;
    const eventAuthors = authors.filter((a: any) => a.eventParticipation && a.eventParticipation.length > 0).length;
    const eventAdoptionRate = totalAuthorsCount ? Math.round((eventAuthors / totalAuthorsCount) * 100) : 0;

    // Chart Data 1: Category Sales
    const categorySalesMap: Record<string, number> = {};
    orders.forEach((o: any) => {
       if (o.status === 'Completed' || o.status === 'Dispatched') {
          o.items?.forEach((item: any) => {
             const book = books.find((b: any) => b.title === item.title || b.id === item.bookId);
             const cat = book && book.category ? book.category : 'Unknown';
             categorySalesMap[cat] = (categorySalesMap[cat] || 0) + (item.qty || 1);
          });
       }
    });
    const categoryChartData = Object.entries(categorySalesMap)
      .filter(([name]) => name !== 'Others' && name !== 'Uncategorized' && name !== 'N/A' && name !== 'Unknown')
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 6);

    // Chart Data 2: Order Status
    const orderStatusMap: Record<string, number> = {};
    orders.forEach((o: any) => {
      const s = o.status || 'Pending';
      orderStatusMap[s] = (orderStatusMap[s] || 0) + 1;
    });
    const orderStatusData = Object.entries(orderStatusMap).map(([name, value]) => ({ name, value }));

    // Chart Data 3: Top Authors
    const authorSalesMap: Record<string, number> = {};
    orders.forEach((o: any) => {
      if (o.status === 'Completed' || o.status === 'Dispatched') {
        o.items?.forEach((it: any) => {
          const aName = it.authorName || 'Unknown Author';
          authorSalesMap[aName] = (authorSalesMap[aName] || 0) + (it.qty || 1);
        });
      }
    });
    const topAuthorsData = Object.entries(authorSalesMap)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // Chart Data 4: Revenue Trend
    const revenueTrendMap: Record<string, number> = {};
    orders.forEach((o: any) => {
      if (o.status === 'Completed' || o.status === 'Dispatched') {
        const d = o.date || 'Unknown';
        if (d !== 'Unknown') {
           revenueTrendMap[d] = (revenueTrendMap[d] || 0) + (o.total || 0);
        }
      }
    });
    const uniqueDates = Array.from(new Set(orders.filter((o: any) => o.date).map((o: any) => o.date)));
    const recentDates = uniqueDates.slice(0, 7).reverse();
    const revenueTrendData = recentDates.map(d => ({ date: d, revenue: revenueTrendMap[d] || 0 }));

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const totalBooksSoldWeb = Object.values(categorySalesMap).reduce((a: number,b: number) => a+b, 0);
    const totalRevenueWeb = orders.reduce((sum: number, o: any) => (o.status === 'Completed' || o.status === 'Dispatched') ? sum + (o.total || 0) : sum, 0);
    const avgOrderValue = completedOrders > 0 ? Math.round(totalRevenueWeb / completedOrders) : 0;

    const insights = [
      { label: 'Avg Order Value', value: `₹${avgOrderValue}`, desc: 'Avg revenue per successful order', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Order Completion', value: `${orderCompletionRate}%`, desc: 'Of all web orders', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Web Books Sold', value: totalBooksSoldWeb, desc: 'Total physical copies sold online', icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Event Adoption', value: `${eventAdoptionRate}%`, desc: 'Authors in live events', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' }
    ];

    return (
    <div className="space-y-6">
      {/* ── High Level KPIs ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Authors', value: stats?.totalAuthors || 0, icon: Users, colorClass: 'blue' },
          { label: 'Books Published', value: stats?.totalBooks || 0, icon: BookOpen, colorClass: 'green' },
          { label: 'Event Participations', value: stats?.eventParticipations || 0, icon: CalendarIcon, colorClass: 'amber' },
          { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, colorClass: 'red' },
        ].map((kpi, i) => (
          <div key={i} className={`dash-kpi-card ${kpi.colorClass}`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`dash-kpi-icon ${kpi.colorClass}`}><kpi.icon className="w-5 h-5" /></div>
            </div>
            <p className="text-xs font-semibold tracking-wide uppercase text-paa-gray-text mb-1">{kpi.label}</p>
            <h3 className="text-3xl font-bold text-paa-navy tracking-tight">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Visual Data Insights (col-span-2) ── */}
        <div className="lg:col-span-2 space-y-6">
           {/* Mini Insight Cards */}
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
             {insights.map((insight, idx) => (
               <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${insight.bg} ${insight.color}`}>
                     <insight.icon size={16} />
                  </div>
                  <h4 className="text-2xl font-bold text-paa-navy mb-1">{insight.value}</h4>
                  <p className="text-xs font-semibold text-gray-800 mb-1">{insight.label}</p>
                  <p className="text-[10px] text-paa-gray-text">{insight.desc}</p>
               </div>
             ))}
           </div>

           {/* Charts Row 1 */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-sm">
               <h3 className="text-sm font-serif font-semibold text-paa-navy mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Recent Revenue Trend
               </h3>
               <div className="h-48 w-full">
                 {revenueTrendData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={revenueTrendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                       <defs>
                         <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                       <XAxis dataKey="date" fontSize={10} tick={{fill:'#6B7280'}} axisLine={false} tickLine={false} />
                       <YAxis fontSize={10} tick={{fill:'#6B7280'}} axisLine={false} tickLine={false} />
                       <RechartsTooltip cursor={{stroke: '#10b981', strokeWidth: 1, strokeDasharray: '3 3'}} contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}} />
                       <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Revenue (₹)" />
                     </AreaChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="h-full flex items-center justify-center text-gray-400 text-xs">No revenue data.</div>
                 )}
               </div>
             </div>

             <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-sm">
               <h3 className="text-sm font-serif font-semibold text-paa-navy mb-4 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-indigo-500" /> Order Status Distribution
               </h3>
               <div className="h-48 w-full">
                 {orderStatusData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                       <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                         {orderStatusData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                       <RechartsTooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}} />
                     </PieChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="h-full flex items-center justify-center text-gray-400 text-xs">No orders.</div>
                 )}
               </div>
             </div>
           </div>

           {/* Charts Row 2 */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-sm">
               <h3 className="text-sm font-serif font-semibold text-paa-navy mb-4 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-blue-500" /> Most Popular Categories
               </h3>
               <div className="h-56 w-full">
                 {categoryChartData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={categoryChartData} layout="vertical" margin={{ top: 5, right: 10, left: 40, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                       <XAxis type="number" fontSize={10} tick={{fill:'#6B7280'}} axisLine={false} tickLine={false} />
                       <YAxis dataKey="name" type="category" fontSize={10} tick={{fill:'#4B5563', fontWeight: 600}} axisLine={false} tickLine={false} width={80} />
                       <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}} />
                       <Bar dataKey="sales" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Books Sold">
                          {categoryChartData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                       </Bar>
                     </BarChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="h-full flex items-center justify-center text-gray-400 text-xs">No category data.</div>
                 )}
               </div>
             </div>

             <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-sm">
               <h3 className="text-sm font-serif font-semibold text-paa-navy mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500" /> Top Performing Authors
               </h3>
               <div className="h-56 w-full">
                 {topAuthorsData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={topAuthorsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                       <XAxis dataKey="name" fontSize={10} tick={{fill:'#6B7280'}} axisLine={false} tickLine={false} />
                       <YAxis fontSize={10} tick={{fill:'#6B7280'}} axisLine={false} tickLine={false} />
                       <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}} />
                       <Bar dataKey="sales" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Books Sold">
                          {topAuthorsData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'][index % 5]} />
                          ))}
                       </Bar>
                     </BarChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="h-full flex items-center justify-center text-gray-400 text-xs">No author sales data.</div>
                 )}
               </div>
             </div>
           </div>
        </div>

        {/* ── Pending Actions & Low Stock (col-span-1) ── */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-sm">
             <h3 className="text-lg font-serif font-semibold text-paa-navy mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" /> Pending Actions
             </h3>
             <div className="space-y-3">
                {!localDismissed.includes('authors') && pendingAuthors > 0 && (
                  <div className="group relative flex items-center justify-between p-3 rounded-xl border border-paa-navy/10 hover:bg-paa-navy/5 transition-colors text-left cursor-pointer" onClick={() => setActiveTab('authors')}>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                           <Users size={18} />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-paa-navy">Approve New Authors</p>
                           <p className="text-xs text-paa-gray-text">{pendingAuthors} authors waiting for approval</p>
                        </div>
                     </div>
                     <button onClick={(e) => handleDismiss(e, 'authors')} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                        <X size={16} />
                     </button>
                  </div>
                )}

                {!localDismissed.includes('events') && pendingEvents > 0 && (
                  <div className="group relative flex items-center justify-between p-3 rounded-xl border border-paa-navy/10 hover:bg-paa-navy/5 transition-colors text-left cursor-pointer" onClick={() => setActiveTab('events')}>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                           <CalendarIcon size={18} />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-paa-navy">Event Registrations</p>
                           <p className="text-xs text-paa-gray-text">{pendingEvents} new event participations pending</p>
                        </div>
                     </div>
                     <button onClick={(e) => handleDismiss(e, 'events')} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                        <X size={16} />
                     </button>
                  </div>
                )}

                {!localDismissed.includes('orders') && pendingOrders > 0 && (
                  <div className="group relative flex items-center justify-between p-3 rounded-xl border border-paa-navy/10 hover:bg-paa-navy/5 transition-colors text-left cursor-pointer" onClick={() => setActiveTab('web_orders')}>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                           <ShoppingCart size={18} />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-paa-navy">Fulfill Web Orders</p>
                           <p className="text-xs text-paa-gray-text">{pendingOrders} orders pending verification or dispatch</p>
                        </div>
                     </div>
                     <button onClick={(e) => handleDismiss(e, 'orders')} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                        <X size={16} />
                     </button>
                  </div>
                )}
                
                {!localDismissed.includes('helpdesk') && pendingQueries > 0 && (
                  <div className="group relative flex items-center justify-between p-3 rounded-xl border border-paa-navy/10 hover:bg-paa-navy/5 transition-colors text-left cursor-pointer" onClick={() => setActiveTab('helpdesk')}>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                           <MessageSquare size={18} />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-paa-navy">Author Queries</p>
                           <p className="text-xs text-paa-gray-text">{pendingQueries} unread helpdesk queries</p>
                        </div>
                     </div>
                     <button onClick={(e) => handleDismiss(e, 'helpdesk')} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                        <X size={16} />
                     </button>
                  </div>
                )}

                {((localDismissed.includes('authors') || pendingAuthors === 0) &&
                  (localDismissed.includes('events') || pendingEvents === 0) &&
                  (localDismissed.includes('orders') || pendingOrders === 0) &&
                  (localDismissed.includes('helpdesk') || pendingQueries === 0)) && (
                   <div className="text-center py-6 text-sm text-paa-gray-text">No pending actions to display.</div>
                )}
             </div>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-sm flex flex-col h-[500px]">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif font-semibold text-paa-navy flex items-center gap-2">
                   <Package className="w-5 h-5 text-red-500" /> Low Stock Books Alert
                </h3>
                {lowStockBooks.length > 0 && (
                   <button onClick={handleNotifyAllLowStock} className="text-xs flex items-center gap-1 font-bold text-paa-navy bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors uppercase tracking-wider">
                      <Bell size={12} className="text-amber-500" /> Notify All
                   </button>
                )}
             </div>
             {lowStockBooks.length === 0 ? (
                <div className="text-center py-8 text-sm text-paa-gray-text my-auto">All books have sufficient inventory or authors notified.</div>
             ) : (
                <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                   {lowStockBooks.map((b: any) => (
                      <div key={b.dbId || b.id} className="flex items-center justify-between p-3 rounded-xl border border-red-100 bg-red-50/30 group">
                         <div className="flex-1 min-w-0 pr-4">
                            <p className="text-sm font-bold text-paa-navy line-clamp-1">{b.title}</p>
                            <p className="text-xs text-paa-gray-text">by {b.authorName}</p>
                         </div>
                         <div className="flex items-center gap-3 shrink-0">
                            <button onClick={() => handleNotifySingleBook(b.id || b.dbId)} className="opacity-0 group-hover:opacity-100 p-1.5 bg-white text-gray-400 hover:text-amber-500 rounded-full shadow-sm transition-all" title="Notify Author">
                               <Bell size={14} />
                            </button>
                            <div className="text-right">
                               <span className="text-lg font-black text-red-600">{b.inventory || 0}</span>
                               <p className="text-[10px] uppercase tracking-widest font-bold text-red-400">Left</p>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             )}
           </div>
        </div>
      </div>
    </div>
    );
  };
