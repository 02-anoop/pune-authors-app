with open('src/app/components/OperationsDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update fetchEvents
old_fetch = '''  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/activities`);
      setEvents(res.data);
    } catch(err) {}
  };'''

new_fetch = '''  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/events`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
      setEvents(res.data);
    } catch(err) {}
  };

  const handleBroadcastEvent = async (eventId: number, target: 'Authors' | 'Customers') => {
    try {
      const res = await axios.post(`${API}/api/admin/events/${eventId}/broadcast`, { target }, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
      toast.success(res.data.message);
      fetchEvents();
    } catch(err) {
      toast.error('Failed to broadcast event');
    }
  };'''

content = content.replace(old_fetch, new_fetch)

# 2. Update EventsTab UI
old_events_tab_start = '''  const EventsTab = () => (
    <div className="space-y-6">
       <div className="flex items-center justify-between border-b border-paa-navy/10 pb-4">
          <h3 className="text-lg font-serif font-medium text-paa-navy">Events & Fairs Management</h3>
          <button onClick={() => setIsEventModalOpen(true)} className="flex items-center gap-2 px-6 py-2 bg-paa-navy text-paa-cream text-xs font-bold tracking-widest uppercase hover:bg-paa-gold hover:text-paa-navy border border-paa-navy transition-colors">
            <Plus className="w-4 h-4" /> Create Event
          </button>
       </div>'''

old_events_tab_end = '''                  <div className="pt-4 border-t border-paa-navy/10 flex items-center justify-between">
                     <div className="flex items-center justify-center bg-[#ffff99] px-3 py-1 text-xs font-bold text-paa-navy border border-paa-navy/20">
                        {evt.registeredAuthors} Registered
                     </div>
                     <button className="text-[#5bc0de] text-xs font-bold uppercase tracking-widest hover:text-paa-navy transition-colors">Manage</button>
                  </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );'''

new_events_tab = '''  const EventsTab = () => (
    <div className="space-y-6">
       <div className="flex items-center justify-between border-b border-paa-navy/10 pb-4">
          <h3 className="text-lg font-serif font-medium text-paa-navy">Events & Fairs Ecosystem</h3>
          <button onClick={() => setIsEventModalOpen(true)} className="flex items-center gap-2 px-6 py-2 bg-paa-navy text-paa-cream text-xs font-bold tracking-widest uppercase hover:bg-paa-gold hover:text-paa-navy border border-paa-navy transition-colors">
            <Plus className="w-4 h-4" /> Create Event
          </button>
       </div>

       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
             <div key={evt.id} className="bg-white border border-paa-navy/10 shadow-sm hover:shadow-md transition-shadow flex flex-col relative overflow-hidden">
                <div className={`${evt.status === 'Upcoming' ? 'bg-blue-600' : 'bg-gray-500'} px-4 py-2 text-white font-bold text-xs uppercase tracking-widest flex justify-between items-center`}>
                   <span>{evt.status}</span>
                   {evt.broadcastStatus === 'AuthorsOnly' && <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">Authors Notified</span>}
                   {evt.broadcastStatus === 'CustomersAlso' && <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">Public</span>}
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-serif font-medium text-paa-navy mb-4">{evt.name}</h4>
                  <div className="space-y-3 mb-6 flex-1 text-sm font-medium text-paa-gray-text">
                     <p className="flex items-center gap-3"><CalendarIcon className="w-4 h-4 text-paa-navy/50"/> {evt.date} &bull; {evt.duration}</p>
                     <p className="flex items-center gap-3"><MapPin className="w-4 h-4 text-paa-navy/50"/> {evt.location}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                     <div className="bg-gray-50 p-2 text-center rounded border border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Authors</p>
                        <p className="text-lg font-black text-paa-navy">{evt._count?.eventAuthors || 0}</p>
                     </div>
                     <div className="bg-gray-50 p-2 text-center rounded border border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Books Linked</p>
                        <p className="text-lg font-black text-paa-navy">{evt._count?.eventBooks || 0}</p>
                     </div>
                  </div>

                  <div className="pt-4 border-t border-paa-navy/10 flex flex-col gap-2">
                     {evt.broadcastStatus === 'None' && (
                       <button onClick={() => handleBroadcastEvent(evt.id, 'Authors')} className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest transition-colors border border-blue-200">
                          1. Broadcast to Authors
                       </button>
                     )}
                     {evt.broadcastStatus === 'AuthorsOnly' && (
                       <button onClick={() => handleBroadcastEvent(evt.id, 'Customers')} className="w-full py-2 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold uppercase tracking-widest transition-colors border border-green-200">
                          2. Generate Catalogue & Publish
                       </button>
                     )}
                     {evt.broadcastStatus === 'CustomersAlso' && (
                       <button className="w-full py-2 bg-paa-navy hover:bg-paa-navy/90 text-white text-xs font-bold uppercase tracking-widest transition-colors">
                          View Live Catalogue
                       </button>
                     )}
                  </div>
                </div>
             </div>
          ))}
          {events.length === 0 && (
             <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No events created yet.
             </div>
          )}
       </div>
    </div>
  );'''

# Because I don't want to mess up the replace logic with whitespace exactly, I'll use regex.
import re
content = re.sub(r'  const EventsTab = \(\) => \([\s\S]*?    </div>\n  \);', new_events_tab, content)

with open('src/app/components/OperationsDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated OperationsDashboardPage.tsx UI")
