import sys
import re

with open('src/app/components/OperationsDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state for viewing registrations
state_target = "const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);"
state_replace = """const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [viewingRegistrationsEventId, setViewingRegistrationsEventId] = useState<number | null>(null);
  const [eventRegistrations, setEventRegistrations] = useState<any[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  const fetchEventRegistrations = async (eventId: number) => {
    setLoadingRegistrations(true);
    setViewingRegistrationsEventId(eventId);
    try {
      const res = await axios.get(`${API}/api/admin/events/${eventId}/registrations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEventRegistrations(res.data);
    } catch (err) {
      toast.error('Failed to load registrations');
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleApproveRegistration = async (eventId: number, authorId: number) => {
    try {
      await axios.post(`${API}/api/admin/events/${eventId}/author/${authorId}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Registration approved');
      fetchEventRegistrations(eventId);
      fetchEvents();
    } catch (err) {
      toast.error('Failed to approve registration');
    }
  };

  const handleRejectRegistration = async (eventId: number, authorId: number) => {
    try {
      await axios.post(`${API}/api/admin/events/${eventId}/author/${authorId}/reject`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Registration rejected');
      fetchEventRegistrations(eventId);
    } catch (err) {
      toast.error('Failed to reject registration');
    }
  };
"""

content = content.replace(state_target, state_replace)

# 2. Add button to the Event card
btn_target = """                     <button onClick={() => handleBroadcastEvent(evt.id, 'Authors')} className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest transition-colors border border-blue-200">
                        1. Broadcast to Authors
                     </button>"""

btn_replace = """                     <button onClick={() => fetchEventRegistrations(evt.id)} className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-widest transition-colors border border-orange-200">
                        View Author Registrations
                     </button>
                     <button onClick={() => handleBroadcastEvent(evt.id, 'Authors')} className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest transition-colors border border-blue-200">
                        1. Broadcast to Authors
                     </button>"""

content = content.replace(btn_target, btn_replace)

# 3. Add Modal for Registrations
modal_target = "{/* Edit Event Modal */}"
modal_replace = """{/* Event Registrations Modal */}
      <Modal isOpen={viewingRegistrationsEventId !== null} onClose={() => { setViewingRegistrationsEventId(null); setEventRegistrations([]); }} title="Author Event Registrations">
        {loadingRegistrations ? (
          <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-paa-navy" /></div>
        ) : (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {eventRegistrations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No registrations found for this event yet.</p>
            ) : (
              eventRegistrations.map((reg) => (
                <div key={reg.id} className={`border p-4 shadow-sm flex flex-col gap-4 ${reg.optInStatus === 'Awaiting Approval' ? 'bg-orange-50 border-orange-200' : reg.optInStatus === 'Opted-In' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  
                  <div className="flex justify-between items-start border-b pb-3">
                    <div>
                      <h4 className="font-bold text-paa-navy text-lg">{reg.author.name}</h4>
                      <p className="text-xs text-gray-500">{reg.author.email} | {reg.author.phone}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest text-white ${reg.optInStatus === 'Awaiting Approval' ? 'bg-orange-500' : reg.optInStatus === 'Opted-In' ? 'bg-green-500' : 'bg-red-500'}`}>
                      {reg.optInStatus}
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Books Registered</p>
                      <ul className="space-y-1">
                        {reg.books.map((b: any) => (
                          <li key={b.id} className="text-sm flex justify-between bg-white px-2 py-1 border border-gray-100">
                            <span className="truncate pr-2">{b.book.title}</span>
                            <span className="font-bold whitespace-nowrap">{b.listedStock} units</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                       <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Category Breakdown</p>
                       <div className="flex flex-wrap gap-2">
                         {Object.entries(reg.categoryCounts || {}).map(([cat, count]: [string, any]) => (
                           <span key={cat} className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-1 rounded">
                             {cat}: {count}
                           </span>
                         ))}
                       </div>
                    </div>
                  </div>

                  {reg.paymentScreenshot && (
                    <div className="mt-2 border-t pt-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Payment Screenshot</p>
                      <a href={`${API}${reg.paymentScreenshot}`} target="_blank" rel="noopener noreferrer">
                        <img src={`${API}${reg.paymentScreenshot}`} alt="Payment Proof" className="w-32 h-auto border shadow-sm hover:opacity-80 transition-opacity" />
                      </a>
                    </div>
                  )}

                  {reg.optInStatus === 'Awaiting Approval' && (
                    <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-black/5">
                      <button onClick={() => handleRejectRegistration(reg.eventId, reg.authorId)} className="px-4 py-2 bg-[#d9534f] hover:bg-[#c9302c] text-white text-xs font-bold uppercase tracking-widest shadow-sm transition-colors">
                        Reject
                      </button>
                      <button onClick={() => handleApproveRegistration(reg.eventId, reg.authorId)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-widest shadow-sm transition-colors">
                        Approve Registration
                      </button>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        )}
      </Modal>

      {/* Edit Event Modal */}"""

content = content.replace(modal_target, modal_replace)

with open('src/app/components/OperationsDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
