import re

# 1. Update api.js
api_path = r'server/routes/api.js'
with open(api_path, 'r', encoding='utf-8') as f:
    api_content = f.read()

new_api_route = """router.post('/api/author/propose-event', verifyToken, upload.single('banner'), async (req, res) => {
  try {
    const { name, location, date, duration, eventType, description, startTime, endTime, registrationFee, feeType } = req.body;

    // Fetch author info
    const author = await prisma.author.findFirst({ where: { userId: req.user.id } });
    const authorName = author ? author.name : req.user.email;

    const eventDesc = `[Proposed by Author: ${authorName}]\n${description || ''}`;
    
    let bannerUrl = null;
    if (req.file) {
      bannerUrl = `/uploads/${req.file.filename}`;
    }

    const event = await prisma.event.create({
      data: {
        name: name || 'Untitled Event',
        location: location || '',
        date: date || null,
        duration: duration || null,
        eventType: eventType || 'Other',
        description: eventDesc,
        startTime: startTime || null,
        endTime: endTime || null,
        registrationFee: registrationFee ? parseFloat(registrationFee) : 0,
        feeType: feeType || 'Per Author',
        bannerUrl,
        status: 'Pending Approval',
        commissionFlat: 0,
        commissionPercent: 0,
      }
    });
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to propose event' });
  }
});"""

api_content = re.sub(
    r"router\.post\('/api/author/propose-event', verifyToken, async \(req, res\) => \{.*?\n\}\);",
    new_api_route,
    api_content,
    flags=re.DOTALL
)

with open(api_path, 'w', encoding='utf-8') as f:
    f.write(api_content)


# 2. Update AuthorDashboardPage.tsx
auth_path = r'src/app/components/AuthorDashboardPage.tsx'
with open(auth_path, 'r', encoding='utf-8') as f:
    auth_content = f.read()

new_handle_propose = """  const handleProposeEvent = async (e: any) => {
    e.preventDefault();
    const target = e.target;
    setIsProposingEvent(true);
    try {
      const fd = new FormData();
      if (target.name.value) fd.append('name', target.name.value);
      if (target.date.value) fd.append('date', target.date.value);
      if (target.location.value) fd.append('location', target.location.value);
      
      const days = target.durationDays?.value;
      const hours = target.durationHours?.value;
      let durationStr = [];
      if (days && parseInt(days) > 0) durationStr.push(`${days} Days`);
      if (hours && parseInt(hours) > 0) durationStr.push(`${hours} Hours`);
      fd.append('duration', durationStr.length > 0 ? durationStr.join(', ') : '');

      if (target.startTime?.value) fd.append('startTime', target.startTime.value);
      if (target.endTime?.value) fd.append('endTime', target.endTime.value);
      
      const evtType = target.eventType?.value;
      if (evtType) fd.append('eventType', evtType === 'Other' ? (target.otherEventType?.value || 'Other') : evtType);
      
      if (target.registrationFee?.value) fd.append('registrationFee', target.registrationFee.value);
      if (target.feeType?.value) fd.append('feeType', target.feeType.value);
      if (target.description?.value) fd.append('description', target.description.value);
      if (target.banner?.files && target.banner.files[0]) fd.append('banner', target.banner.files[0]);

      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/propose-event`, fd, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Event proposed successfully!');
      setShowProposeEventModal(false);
      fetchAuthorEvents();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to propose event');
    } finally {
      setIsProposingEvent(false);
    }
  };"""

auth_content = re.sub(
    r"const handleProposeEvent = async \(e: any\) => \{.*?setProposeEventForm\(\{ name: '', location: '', date: '', duration: '', eventType: 'Book Fair', description: '' \}\);\n\s*\} catch \(err: any\) \{.*?\n\s*\}\n\s*\};",
    new_handle_propose,
    auth_content,
    flags=re.DOTALL
)

new_form = """<form onSubmit={handleProposeEvent}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><label className="dash-label">Event Name</label><input required name="name" type="text" className="dash-input" placeholder="e.g., Spring Book Fair" /></div>
                  <div className="md:col-span-2"><label className="dash-label">Event Banner (Optional)</label><input name="banner" type="file" accept="image/*" className="dash-input" /></div>
                </div>

                <div><label className="dash-label">Event Description</label><textarea name="description" rows={3} className="dash-input resize-y" placeholder="Short details about the event..."></textarea></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="dash-label">Event Type</label>
                    <select name="eventType" className="dash-input" onChange={(e) => {
                      const el = document.getElementById('authorOtherEventTypeInput');
                      if (el) el.style.display = e.target.value === 'Other' ? 'block' : 'none';
                    }}>
                      <option value="Book Fair">Book Fair</option>
                      <option value="Literary Event">Literary Event</option>
                      <option value="Other">Other</option>
                    </select>
                    <input id="authorOtherEventTypeInput" name="otherEventType" type="text" className="dash-input mt-2" placeholder="Specify event type" style={{ display: 'none' }} />
                  </div>
                  <div><label className="dash-label">Location (Venue)</label><input name="location" type="text" className="dash-input" placeholder="e.g., Phoenix Mall, Pune" /></div>
                  <div>
                    <label className="dash-label">Date</label>
                    <input name="date" type="date" className="dash-input" />
                  </div>
                  <div>
                    <label className="dash-label">Duration</label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input name="durationDays" type="number" min="0" className="dash-input" placeholder="Days" />
                      </div>
                      <div className="flex-1">
                        <input name="durationHours" type="number" min="0" className="dash-input" placeholder="Hours" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="dash-label">From Timing</label><input name="startTime" type="time" className="dash-input" /></div>
                  <div><label className="dash-label">To Timing</label><input name="endTime" type="time" className="dash-input" /></div>
                  <div><label className="dash-label">Registration Fee (₹)</label><input name="registrationFee" type="number" placeholder="Optional" className="dash-input" /></div>
                  <div>
                    <label className="dash-label">Fee Type</label>
                    <select name="feeType" className="dash-input">
                      <option value="Per Author">Per Author</option>
                      <option value="Per Title">Per Title</option>
                      <option value="Flat Fee">Flat Fee</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50">
                <button type="button" onClick={() => setShowProposeEventModal(false)} className="dash-btn dash-btn-ghost">Cancel</button>
                <button type="submit" disabled={isProposingEvent} className="dash-btn dash-btn-primary min-w-[120px]">
                  {isProposingEvent ? 'Proposing...' : 'Submit Proposal'}
                </button>
              </div>
            </form>"""

auth_content = re.sub(
    r"<form onSubmit=\{handleProposeEvent\} className=\"p-6 space-y-4\">.*?</form>",
    new_form,
    auth_content,
    flags=re.DOTALL
)

with open(auth_path, 'w', encoding='utf-8') as f:
    f.write(auth_content)

print("Author dashboard propose event form updated!")
