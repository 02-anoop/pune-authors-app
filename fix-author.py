import sys

def fix_file():
    with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # We need to find the `validParticipations` block and restore everything cleanly.
    # It starts with `const validParticipations` and goes up to the start of the table.

    start_str = "  const validParticipations = allEvents.filter((evt: any) => {"
    table_start_str = "          <div className=\"bg-white rounded-xl shadow-premium border border-paa-navy/5 overflow-hidden mb-8\">"
    
    idx1 = content.find(start_str)
    idx2 = content.find(table_start_str, idx1)
    
    if idx1 == -1 or idx2 == -1:
        print("COULD NOT FIND INDICES")
        return

    replacement = """  const validParticipations = allEvents.filter((evt: any) => {
    if (evt.registration === 'Registered' || evt.registration === 'Approved' || evt.registration === 'Pending Approval') return true;
    if (evt.isPast) {
      if (evt.isDataUpdated && getPastEventBooks(evt.id).length > 0) return true;
    }
    return false;
  });

  const filteredEvents = allEvents.filter((evt: any) => {
    if (eventFilter === 'UPCOMING' && evt.isPast) return false;
    if (eventFilter === 'PAST' && !evt.isPast) return false;
    if (eventFilter === 'INVITES' && !evt.isInvite) return false;
    if (searchTerm) {
        return (evt.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
               (evt.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(n => <div key={n} className="h-24 bg-gray-100 animate-pulse rounded-xl"></div>)}
      </div>
      <div className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>
      <div className="space-y-4">
        {[1,2,3].map(n => <div key={n} className="h-16 bg-gray-100 animate-pulse rounded-xl"></div>)}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl">
      <div className="flex border-b border-gray-200 mb-6">
        <button onClick={() => setActiveTab('events')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'events' ? 'border-paa-navy text-paa-navy' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Events Overview</button>
        <button onClick={() => setActiveTab('performance')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'performance' ? 'border-paa-navy text-paa-navy' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Book Performance</button>
      </div>

      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col justify-center">
              <div className="text-[10px] font-bold text-paa-gray-text uppercase tracking-widest mb-2 flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-indigo-500" /> Total Events</div>
              <div className="text-3xl font-serif font-bold text-paa-navy">{validParticipations.length}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col justify-center">
              <div className="text-[10px] font-bold text-paa-gray-text uppercase tracking-widest mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4 text-emerald-500" /> Total Books Sold</div>
             <div className="text-3xl font-serif font-bold text-emerald-700">
                 {validParticipations.reduce((acc: number, evt: any) => {
                    let sold = 0;
                    if (evt.manualTotalSold !== null && evt.manualTotalSold !== undefined) {
                       sold = evt.manualTotalSold;
                    } else if (evt.isPast && evt.isDataUpdated) {
                       evt.books?.forEach((b: any) => sold += (b.soldStock || 0));
                    } else if (evt.isInvite) {
                       getEventBooks(evt.id).forEach((b: any) => sold += (b.soldStock || 0));
                    }
                    return acc + sold;
                 }, 0)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col justify-center">
              <div className="text-[10px] font-bold text-paa-gray-text uppercase tracking-widest mb-2 flex items-center gap-2"><DollarSign className="w-4 h-4 text-blue-500" /> Total Revenue</div>
              <div className="text-3xl font-serif font-bold text-blue-700">
                 ₹{validParticipations.reduce((acc: number, evt: any) => {
                    let rev = 0;
                    if (evt.manualTotalRevenue !== null && evt.manualTotalRevenue !== undefined) {
                       rev = evt.manualTotalRevenue;
                    } else if (evt.isPast && evt.isDataUpdated) {
                       evt.books?.forEach((b: any) => rev += (b.revenue || 0));
                    } else if (evt.isInvite) {
                       getEventBooks(evt.id).forEach((b: any) => rev += (b.revenue || 0));
                    }
                    return acc + rev;
                 }, 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col justify-center">
              <div className="text-[10px] font-bold text-paa-gray-text uppercase tracking-widest mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500" /> Total Payments Done</div>
              <div className="text-3xl font-serif font-bold text-orange-700">₹{(registrations || []).reduce((sum: number, r: any) => sum + (r.amount || 0), 0).toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium mt-6 mb-8">
            <h4 className="text-sm font-serif font-semibold text-paa-navy mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-indigo-500" /> Books Sold per Event</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={allEvents.map((evt: any) => {
                  let sold = 0;
                  if (evt.manualTotalSold !== null && evt.manualTotalSold !== undefined) {
                    sold = evt.manualTotalSold;
                  } else if (evt.isPast && evt.isDataUpdated) {
                    evt.books?.forEach((b: any) => { sold += (b.soldStock || 0); });
                  } else if (evt.isInvite) {
                    const evtBooks = getEventBooks(evt.id);
                    evtBooks.forEach((b: any) => { sold += (b.soldStock || 0); });
                  }
                  const evtName = evt.name || evt.title || 'Unknown Event';
                  return { name: evtName, sold };
                })} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={10} tickFormatter={(v) => v.length > 15 ? v.substring(0, 15) + '...' : v} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                  <Bar dataKey="sold" name="Books Sold" fill="#1e3a8a" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
             <div className="flex gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
               {['ALL', 'UPCOMING', 'PAST', 'INVITES'].map((f) => (
                 <button key={f} onClick={() => setEventFilter(f)} className={`px-5 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${eventFilter === f ? 'bg-white text-paa-navy shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>{f === 'ALL' ? 'All Events' : (f === 'UPCOMING' ? 'Upcoming & Live' : (f === 'PAST' ? 'Past Events' : 'Invites'))}</button>
               ))}
             </div>
             <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Search events..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" />
             </div>
          </div>
          
"""

    new_content = content[:idx1] + replacement + content[idx2:]
    
    with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print("FIXED SUCCESSFULLY")

if __name__ == '__main__':
    fix_file()
