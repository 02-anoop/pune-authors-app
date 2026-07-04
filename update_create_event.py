import os

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    data = f.read()

# Make the form fields more compact using grid
old_form = """          <div className="p-6">
            <form onSubmit={handleCreateEvent} className="space-y-6">
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
                  <div>
                    <label className="dash-label">Date (e.g. 15 Aug 2026)</label>
                    <input required name="date" type="date" className="dash-input" value={createEventDate} onChange={(e) => setCreateEventDate(e.target.value)} />
                    {createEventDate && (
                      <div className={`text-xs mt-1 font-bold ${isPastEvent ? 'text-orange-500' : 'text-emerald-500'}`}>
                        {isPastEvent ? '✓ This will be logged as a Past Event' : '✓ This will be logged as an Upcoming Event'}
                      </div>
                    )}
                  </div>
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
              </div>"""

new_form = """          <div className="p-6">
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="md:col-span-2"><label className="dash-label">Event Name</label><input required name="name" type="text" className="dash-input" /></div>
                 <div><label className="dash-label">Event Type</label>
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="md:col-span-2"><label className="dash-label">Event Description</label><textarea name="description" rows={1} className="dash-input" placeholder="Short details about the event..."></textarea></div>
                 <div><label className="dash-label">Event Banner (Optional)</label><input name="banner" type="file" accept="image/*" className="dash-input text-xs pt-1" /></div>
              </div>
    
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="dash-label">Date (e.g. 15 Aug 2026)</label>
                  <input required name="date" type="date" className="dash-input" value={createEventDate} onChange={(e) => setCreateEventDate(e.target.value)} />
                  {createEventDate && (
                    <div className={`text-[10px] mt-1 font-bold ${isPastEvent ? 'text-orange-500' : 'text-emerald-500'}`}>
                      {isPastEvent ? '✓ Past Event' : '✓ Upcoming Event'}
                    </div>
                  )}
                </div>
                <div><label className="dash-label">Duration (days)</label><input required name="duration" type="text" className="dash-input" /></div>
                <div>
                  <label className="dash-label">From Timing</label>
                  <input name="startTime" type="time" className="dash-input" />
                </div>
                <div>
                  <label className="dash-label">To Timing</label>
                  <input name="endTime" type="time" className="dash-input" />
                </div>
              </div>
    
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="dash-label">Location (Venue)</label><input required name="location" type="text" className="dash-input" /></div>
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
              </div>"""

data = data.replace(old_form, new_form)

# Modify granular data block
old_granular = """              <div className="border-t border-gray-200 pt-6 mt-6">
                  <label className="flex items-center gap-3 font-semibold text-paa-navy mb-4 cursor-pointer">
                      <input type="checkbox" className="w-5 h-5 rounded text-paa-navy" checked={hasGranularData} onChange={(e) => setHasGranularData(e.target.checked)} />
                      I have granular author-specific data for this event (manage authors individually)
                  </label>
                  {!hasGranularData && ("""

new_granular = """              <div className="border-t border-gray-200 pt-6 mt-6">
                  {isPastEvent && (
                      <label className="flex items-center gap-3 font-semibold text-paa-navy mb-4 cursor-pointer">
                          <input type="checkbox" className="w-5 h-5 rounded text-paa-navy" checked={hasGranularData} onChange={(e) => setHasGranularData(e.target.checked)} />
                          I have granular author-specific data for this event (manage authors individually)
                      </label>
                  )}
                  {(!hasGranularData && isPastEvent) && ("""

data = data.replace(old_granular, new_granular)

old_granular_end = """                  )}
                  {hasGranularData && ("""

new_granular_end = """                  )}
                  {(hasGranularData || !isPastEvent) && ("""

data = data.replace(old_granular_end, new_granular_end)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(data)

print("Updated create event form layout!")
