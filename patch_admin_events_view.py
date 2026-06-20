import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update handleEditEventClick to include status
if "status: evt.status" not in content:
    content = content.replace(
        "id: evt.id, name: evt.name, location: evt.location, date: evt.date, duration: evt.duration",
        "id: evt.id, name: evt.name, location: evt.location, date: evt.date, duration: evt.duration, status: evt.status"
    )

# 2. Update the submit handler in the EventModal
# Current code uses a hardcoded post vs put depending on eventFormData.id, but the form data just reads from e.target.
old_event_submit = """      <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title="Create Event">
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          const target = e.target as any;
          setIsSubmittingEvent(true);
          try {
            if (eventFormData?.id) {
              await axios.put(`${API}/api/admin/events/${eventFormData.id}`, {
                name: target.name.value,
                date: target.date.value,
                location: target.location.value,
                duration: target.duration.value
              });
            } else {
              await axios.post(`${API}/api/admin/events`, {
                name: target.name.value,
                date: target.date.value,
                location: target.location.value,
                duration: target.duration.value
              });
            }"""

new_event_submit = """      <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title="Create / Edit Event">
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          const target = e.target as any;
          setIsSubmittingEvent(true);
          try {
            if (eventFormData?.id) {
              await axios.put(`${API}/api/admin/events/${eventFormData.id}`, {
                name: target.name.value,
                date: target.date.value,
                location: target.location.value,
                duration: target.duration.value,
                status: target.status?.value || 'Upcoming'
              });
            } else {
              await axios.post(`${API}/api/admin/events`, {
                name: target.name.value,
                date: target.date.value,
                location: target.location.value,
                duration: target.duration.value,
                status: target.status?.value || 'Upcoming'
              });
            }"""

if "status: target.status?.value || 'Upcoming'" not in content:
    content = content.replace(old_event_submit, new_event_submit)

# 3. Add Status field to EventModal form
old_event_form_fields = """            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Duration</label>
              <input name="duration" defaultValue={eventFormData?.duration} required className="w-full border border-paa-navy/20 p-2 text-sm outline-none" placeholder="e.g. 10:00 AM - 6:00 PM" />
            </div>
            <button disabled={isSubmittingEvent} type="submit" className="w-full py-3 bg-paa-navy text-paa-cream text-xs font-bold tracking-widest uppercase mt-6">{isSubmittingEvent ? 'Saving...' : 'Save Event'}</button>"""

new_event_form_fields = """            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Duration</label>
              <input name="duration" defaultValue={eventFormData?.duration} required className="w-full border border-paa-navy/20 p-2 text-sm outline-none" placeholder="e.g. 10:00 AM - 6:00 PM" />
            </div>
            {eventFormData?.id && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Status</label>
              <select name="status" defaultValue={eventFormData?.status || 'Upcoming'} className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-white">
                 <option value="Upcoming">Upcoming (Active)</option>
                 <option value="Past">Past (Concluded)</option>
              </select>
            </div>
            )}
            <button disabled={isSubmittingEvent} type="submit" className="w-full py-3 bg-paa-navy text-paa-cream text-xs font-bold tracking-widest uppercase mt-6">{isSubmittingEvent ? 'Saving...' : 'Save Event'}</button>"""

if "option value=\"Past\"" not in content:
    content = content.replace(old_event_form_fields, new_event_form_fields)

# 4. Group EventsTab into Upcoming and Past
old_events_tab = """       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => ("""

new_events_tab = """       <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 border-b pb-2">Active / Upcoming Events</h4>
       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {events.filter(e => e.status === 'Upcoming').map((evt) => ("""

if "Active / Upcoming Events" not in content:
    content = content.replace(old_events_tab, new_events_tab)

old_no_events = """          ))}
          {events.length === 0 && (
             <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No events created yet.
             </div>
          )}
       </div>"""

new_no_events = """          ))}
          {events.filter(e => e.status === 'Upcoming').length === 0 && (
             <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded border border-dashed border-gray-200">
                No upcoming events.
             </div>
          )}
       </div>

       <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 border-b pb-2 mt-12">Past Events Archive</h4>
       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.filter(e => e.status === 'Past').map((evt) => (
             <div key={evt.id} className="bg-gray-50 border border-gray-200 shadow-sm flex flex-col relative overflow-hidden opacity-90">
                <div className="bg-gray-500 px-4 py-2 text-white font-bold text-xs uppercase tracking-widest flex justify-between items-center">
                   <span>{evt.status}</span>
                   <div className="flex gap-2 items-center">
                     <button onClick={() => handleEditEventClick(evt)} className="p-1 hover:bg-white/20 rounded transition-colors" title="Edit Event"><Edit className="w-3 h-3" /></button>
                     <button onClick={() => handleDeleteEvent(evt.id)} className="p-1 hover:bg-white/20 text-red-200 hover:text-red-100 rounded transition-colors" title="Delete Event"><Trash2 className="w-3 h-3" /></button>
                   </div>
                </div>
                <div className="p-6 flex-1">
                  <h4 className="text-xl font-serif font-medium text-paa-navy mb-4">{evt.name}</h4>
                  <div className="space-y-3 mb-6 flex-1 text-sm font-medium text-gray-500">
                     <p className="flex items-center gap-3"><CalendarIcon className="w-4 h-4 text-gray-400"/> {evt.date} &bull; {evt.duration}</p>
                     <p className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-400"/> {evt.location}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                     <div className="bg-white p-2 text-center rounded border border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Authors</p>
                        <p className="text-lg font-black text-gray-700">{evt._count?.eventAuthors || 0}</p>
                     </div>
                     <div className="bg-white p-2 text-center rounded border border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Books Linked</p>
                        <p className="text-lg font-black text-gray-700">{evt._count?.eventBooks || 0}</p>
                     </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 flex flex-col gap-2">
                     <a href={`/events/${evt.id}/catalogue`} target="_blank" rel="noopener noreferrer" className="block text-center w-full py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold uppercase tracking-widest transition-colors">
                        View Past Catalogue
                     </a>
                     <button onClick={() => fetchEventReport(evt.id)} className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-widest transition-colors border border-purple-200 mt-2 shadow-sm">
                        View Sales & Settlement Report
                     </button>
                  </div>
                </div>
             </div>
          ))}
          {events.filter(e => e.status === 'Past').length === 0 && (
             <div className="col-span-full py-8 text-center text-gray-400 bg-gray-50 rounded border border-dashed border-gray-200">
                No past events archived yet.
             </div>
          )}
       </div>
       </div>"""

if "Past Events Archive" not in content:
    content = content.replace(old_no_events, new_no_events)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
