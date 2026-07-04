import os

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

events_tab_start = -1
settings_tab_start = -1

for i, line in enumerate(lines):
    if line.strip().startswith("const EventsTab = () => {"):
        events_tab_start = i
    if line.strip().startswith("const SettingsTab = () => {"):
        settings_tab_start = i
        break

if events_tab_start == -1 or settings_tab_start == -1:
    print("Could not find EventsTab or SettingsTab")
    exit()

new_events_tab = """
  const EventsTab = () => {
    const [selectedEventBreakdown, setSelectedEventBreakdown] = useState<any>(null);
    const [selectedAuthorForData, setSelectedAuthorForData] = useState('');
    const [hasGranularData, setHasGranularData] = useState(false);

    const handleExportEventRegistrations = () => {
      let csv = 'S.No,Author Name,City,Date Registered,Included in the Catalogue,Included in the Database,Donating Books to the Airport,Participating in Website,';
      events.forEach(e => csv += `Participated in ${e.name.replace(/,/g, '')},`);
      csv += 'No of Literary Events participated in,No of Literary Events Organised,No of Book Fair Stall Organised,Authors Offering Publishing Services\\n';

      authors.forEach((author, idx) => {
        const city = author.address ? author.address.split(',').pop()?.trim() || '' : '';
        const registeredDate = new Date(author.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });

        csv += `"${idx + 1}","${author.name}","${city}","${registeredDate}","Yes","Yes","NA","Yes",`;

        const registeredEventIds = author.eventRegistrations ? author.eventRegistrations.map((r: any) => r.eventId) : [];
        let numEventsParticipated = registeredEventIds.length;

        events.forEach(e => {
          csv += registeredEventIds.includes(e.id) ? '"Yes",' : '"No",';
        });

        csv += `"${numEventsParticipated}","","",""\\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'author_event_registrations.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    if (isEventModalOpen) {
        return (
          <div className="bg-white rounded-xl shadow-premium p-8 border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
               <h3 className="text-2xl font-serif text-paa-navy">Create New Event</h3>
               <button onClick={() => setIsEventModalOpen(false)} className="dash-btn dash-btn-ghost text-gray-500 hover:text-gray-700">Cancel & Go Back</button>
            </div>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const target = e.target as any;
              setIsSubmittingEvent(true);
              try {
                const fd = new FormData();
                fd.append('name', target.name.value);
                fd.append('date', target.date.value);
                fd.append('location', target.location.value);
                fd.append('duration', target.duration.value);
                if (target.startTime?.value) fd.append('startTime', target.startTime.value);
                if (target.endTime?.value) fd.append('endTime', target.endTime.value);
                fd.append('eventType', target.eventType.value === 'Other' ? (target.otherEventType?.value || 'Other') : target.eventType.value);
                fd.append('registrationFee', target.registrationFee.value);
                fd.append('feeType', target.feeType.value);
                if (target.description.value) fd.append('description', target.description.value);
                fd.append('livePosEnabled', target.livePosEnabled?.checked ? 'true' : 'false');
                if (target.banner.files[0]) fd.append('banner', target.banner.files[0]);
                
                if (!hasGranularData) {
                    fd.append('aggAuthors', target.aggAuthors?.value || '0');
                    fd.append('aggSent', target.aggSent?.value || '0');
                    fd.append('aggSold', target.aggSold?.value || '0');
                    fd.append('aggRevenue', target.aggRevenue?.value || '0');
                }
    
                await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/events`, fd, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                toast.success('Event Created Successfully!');
                setIsEventModalOpen(false);
              } catch (err: any) {
                toast.error(err.response?.data?.error || err.message);
              } finally {
                setIsSubmittingEvent(false);
              }
            }}>
              <div><label className="dash-label">Event Name</label><input required name="name" type="text" className="dash-input" /></div>
              <div><label className="dash-label">Event Description</label><textarea name="description" rows={2} className="dash-input" placeholder="Short details about the event..."></textarea></div>
              <div><label className="dash-label">Event Banner (Optional)</label><input name="banner" type="file" accept="image/*" className="dash-input" /></div>
    
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="dash-label">From Timing</label>
                  <input name="startTime" type="time" className="dash-input" />
                </div>
                <div>
                  <label className="dash-label">To Timing</label>
                  <input name="endTime" type="time" className="dash-input" />
                </div>
              </div>
    
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="dash-label">Event Type</label>
                  <select name="eventType" className="dash-input" onChange={(e) => {
                      const el = document.getElementById('otherEventTypeInput');
                      if (el) el.style.display = e.target.value === 'Other' ? 'block' : 'none';
                  }}>
                    <option value="Book Fair">Book Fair</option>
                    <option value="Literary Event">Literary Event</option>
                    <option value="Other">Other</option>
                  </select>
                  <input id="otherEventTypeInput" name="otherEventType" type="text" className="dash-input mt-2" placeholder="Specify event type" style={{ display: 'none' }} />
                </div>
    
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="dash-label">Date (e.g. 15 Aug 2026)</label><input required name="date" type="date" className="dash-input" /></div>
                  <div><label className="dash-label">Duration (e.g. 3 days)</label><input required name="duration" type="text" className="dash-input" /></div>
                </div>
                <div><label className="dash-label">Location (Venue)</label><input required name="location" type="text" className="dash-input" /></div>
    
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="dash-label">Registration Fee (₹)</label>
                    <input required name="registrationFee" type="number" defaultValue={0} className="dash-input" />
                  </div>
                  <div>
                    <label className="dash-label">Fee Type</label>
                    <select name="feeType" className="dash-input">
                      <option value="Refundable">Refundable</option>
                      <option value="Non-Refundable">Non-Refundable</option>
                      <option value="Free">Free</option>
                    </select>
                  </div>
                </div>
              </div>
    
              <div className="flex items-center gap-2 mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <input type="checkbox" name="livePosEnabled" id="livePosEnabled" className="w-4 h-4 text-paa-navy focus:ring-paa-navy rounded border-gray-300" defaultChecked />
                <label htmlFor="livePosEnabled" className="text-sm font-medium text-paa-navy">Enable Live POS tracking for this event</label>
              </div>
              
              <div className="border-t border-gray-200 pt-6 mt-6">
                  <label className="flex items-center gap-3 font-semibold text-paa-navy mb-4 cursor-pointer">
                      <input type="checkbox" className="w-5 h-5 rounded text-paa-navy" checked={hasGranularData} onChange={(e) => setHasGranularData(e.target.checked)} />
                      I have granular author-specific data for this event (manage authors individually)
                  </label>
                  {!hasGranularData && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                          <div>
                              <label className="dash-label">Total Authors Participated</label>
                              <input type="number" name="aggAuthors" className="dash-input font-mono" defaultValue={0} />
                          </div>
                          <div>
                              <label className="dash-label">Total Books Sent</label>
                              <input type="number" name="aggSent" className="dash-input font-mono" defaultValue={0} />
                          </div>
                          <div>
                              <label className="dash-label">Total Books Sold</label>
                              <input type="number" name="aggSold" className="dash-input font-mono" defaultValue={0} />
                          </div>
                          <div>
                              <label className="dash-label">Total Revenue (₹)</label>
                              <input type="number" name="aggRevenue" className="dash-input font-mono text-emerald-600" defaultValue={0} />
                          </div>
                          <div className="col-span-full mt-2 text-xs text-gray-500">
                             * This data will be shown for legacy/past events where granular author tracking isn't available.
                          </div>
                      </div>
                  )}
                  {hasGranularData && (
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-sm text-blue-800">
                         * You can manage granular data for each author from the Event Breakdown view after creating this event.
                      </div>
                  )}
              </div>
    
              <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                <button type="button" onClick={() => setIsEventModalOpen(false)} className="dash-btn dash-btn-ghost">Cancel</button>
                <button type="submit" disabled={isSubmittingEvent} className="dash-btn dash-btn-primary min-w-[120px]">
                  {isSubmittingEvent ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span> : 'Save Event Details'}
                </button>
              </div>
            </form>
          </div>
        );
    }

    const allCombinedEvents = [
        ...events.map((e: any) => ({ ...e, isLegacy: false })),
        ...pastEventsData.map((e: any) => ({ ...e, isLegacy: true }))
    ];

    if (selectedEventBreakdown) {
       return (
           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between mb-6 border-b pb-4">
                 <div>
                    <h3 className="text-2xl font-serif text-paa-navy mb-1">{selectedEventBreakdown.name}</h3>
                    <p className="text-sm text-gray-500 font-medium">{selectedEventBreakdown.date} &bull; {selectedEventBreakdown.location || selectedEventBreakdown.address || 'Location TBA'}</p>
                 </div>
                 <button onClick={() => { setSelectedEventBreakdown(null); setSelectedAuthorForData(''); }} className="dash-btn dash-btn-ghost text-gray-500 hover:text-gray-700">Cancel & Go Back</button>
               </div>
               
               <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Select Author to Add/Manage Data</label>
                  <select 
                     className="w-full max-w-lg border border-gray-300 rounded-lg p-3 outline-none focus:border-paa-navy bg-gray-50"
                     value={selectedAuthorForData}
                     onChange={(e) => setSelectedAuthorForData(e.target.value)}
                  >
                     <option value="">-- Select Author --</option>
                     {authors.map((a: any) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                     ))}
                  </select>
               </div>
               
               {selectedAuthorForData ? (
                  <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 shadow-sm">
                     <h4 className="font-semibold text-paa-navy mb-4 border-b border-gray-200 pb-2">Author Event Details</h4>
                     <div className="grid grid-cols-2 gap-4 mb-8">
                        <div>
                           <label className="block text-xs font-bold text-gray-600 mb-1">Registration Status</label>
                           <select className="w-full border border-gray-300 rounded p-2 text-sm"><option>Registered</option><option>Participated</option><option>Declined</option></select>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-gray-600 mb-1">Payment Status</label>
                           <select className="w-full border border-gray-300 rounded p-2 text-sm"><option>Paid</option><option>Unpaid</option><option>-</option></select>
                        </div>
                     </div>
                     
                     <h4 className="font-semibold text-paa-navy mb-4 border-b border-gray-200 pb-2">Book Sales & Metrics</h4>
                     <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm hover:shadow transition-shadow">
                           <div className="flex justify-between items-center p-4 bg-white border-b border-gray-100">
                              <div className="font-medium text-sm text-gray-800">Example Book Title</div>
                              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                                 <input type="checkbox" defaultChecked className="rounded text-paa-navy w-4 h-4" /> Listed for this event
                              </label>
                           </div>
                           <div className="p-4 bg-gray-50 grid grid-cols-2 md:grid-cols-5 gap-4">
                              <div>
                                 <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Copies Sent</label>
                                 <input type="number" defaultValue="50" className="w-full border border-gray-300 rounded p-2 text-sm font-mono" />
                              </div>
                              <div>
                                 <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Manual Sold</label>
                                 <input type="number" defaultValue="20" className="w-full border border-gray-300 rounded p-2 text-sm font-mono" />
                              </div>
                              <div>
                                 <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Returned</label>
                                 <input type="number" defaultValue="30" className="w-full border border-gray-300 rounded p-2 text-sm font-mono" />
                              </div>
                              <div>
                                 <label className="block text-[10px] font-bold text-emerald-600 mb-1 uppercase tracking-wider">Revenue (₹)</label>
                                 <input type="number" defaultValue="4000" className="w-full border border-emerald-200 bg-emerald-50 text-emerald-700 rounded p-2 text-sm font-mono font-bold" />
                              </div>
                              <div>
                                 <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">POS Sold (Auto)</label>
                                 <input type="number" defaultValue="0" disabled className="w-full border border-gray-200 bg-gray-100 text-gray-500 rounded p-2 text-sm font-mono" />
                              </div>
                           </div>
                        </div>
                     </div>
                     
                     <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3 items-center">
                        <span className="text-xs text-gray-500 mr-auto font-medium">* Explicit publish required for authors to see past data in their dashboard.</span>
                        <button onClick={() => { setSelectedAuthorForData(''); }} className="px-6 py-2.5 text-sm text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-lg font-bold transition-colors">Reset Author</button>
                        <button onClick={() => toast.success('Draft Saved!')} className="px-6 py-2.5 text-sm text-paa-navy border border-paa-navy rounded-lg font-bold hover:bg-paa-navy hover:text-white transition-colors">Save Draft</button>
                        <button onClick={() => { toast.success('Data Published! The author will now see these metrics in their dashboard.'); }} className="px-8 py-2.5 text-sm bg-paa-gold text-paa-navy rounded-lg font-black hover:brightness-110 transition-all shadow-md">PUBLISH TO AUTHOR</button>
                     </div>
                  </div>
               ) : (
                  <div className="p-16 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                     <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                     <p className="text-gray-500 font-medium">Please select an Author to manage their specific event data.</p>
                  </div>
               )}
           </div>
       );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-paa-navy/5 pb-4">
          <h3 className="text-lg font-serif font-medium text-paa-navy">Events & Fairs Ecosystem</h3>
          <div className="flex gap-3">
            <button onClick={handleExportEventRegistrations} className="dash-btn dash-btn-ghost flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50">
              <Download className="w-4 h-4" /> Export Authors/Events CSV
            </button>
            <button onClick={() => setIsEventModalOpen(true)} className="dash-btn dash-btn-primary bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
              <Plus className="w-4 h-4" /> Create New Event
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm animate-in fade-in duration-500">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-bold">Event Name</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Location</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Authors</th>
                <th className="p-4 font-bold text-right">Books</th>
                <th className="p-4 font-bold text-right">Revenue</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {allCombinedEvents.map((evt: any, i: number) => {
                  const authors = evt.isLegacy ? (evt.authorsParticipated || evt.aggAuthors || 0) : (evt._count?.eventAuthors || evt.aggAuthors || 0);
                  const books = evt.isLegacy ? (evt.booksSold || evt.aggSold || 0) : (evt._count?.eventBooks || evt.aggSold || 0);
                  const revenue = evt.isLegacy ? (evt.aggRevenue || (books * 200)) : (evt.aggRevenue || 0);
                  return (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-bold text-paa-navy">{evt.name}</td>
                        <td className="p-4 text-sm font-medium text-gray-600">{evt.date}</td>
                        <td className="p-4 text-sm font-medium text-gray-600">{evt.location || evt.address || 'TBA'}</td>
                        <td className="p-4">
                           <span className={`px-2.5 py-1 text-[10px] uppercase font-black tracking-widest rounded-full ${evt.isLegacy ? 'bg-gray-200 text-gray-700' : (evt.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700')}`}>
                              {evt.isLegacy ? 'Legacy Archive' : evt.status}
                           </span>
                        </td>
                        <td className="p-4 text-sm font-mono font-medium text-right">{authors}</td>
                        <td className="p-4 text-sm font-mono font-medium text-right">{books}</td>
                        <td className="p-4 text-sm font-mono text-right text-emerald-600 font-bold">{evt.isLegacy || revenue > 0 ? `₹${revenue}` : 'Auto-synced'}</td>
                        <td className="p-4 text-center">
                           <button onClick={() => setSelectedEventBreakdown(evt)} className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-bold border border-indigo-200 transition-colors">
                              View Breakdown
                           </button>
                        </td>
                      </tr>
                  );
               })}
               {allCombinedEvents.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-gray-500">No events found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
"""

final_content = "".join(lines[:events_tab_start]) + new_events_tab + "\n" + "".join(lines[settings_tab_start:])

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(final_content)

print("Updated EventsTab perfectly")
