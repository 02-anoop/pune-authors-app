import os

file_path = "src/app/components/OperationsDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Admin edits profile state
content = content.replace(
    "editForm = useState({ name: '', phone: '', whatsapp: '', bio: '', penName: '', city: '', state: '', instagram: '', facebook: '', address: '', aadharNumber: '', qualification: '', institution: '', subject: '', age: '', experience: '', skills: '', hobbies: '', whyJoining: '' });",
    "editForm = useState({ name: '', phone: '', whatsapp: '', bio: '', penName: '', city: '', state: '', instagram: '', facebook: '', address: '', district: '', pincode: '', aadharNumber: '', qualification: '', institution: '', subject: '', age: '', experience: '', skills: '', hobbies: '', whyJoining: '' });"
)

# Open edit modal
prefill_open = """setEditForm({
      name: author.name || '',
      phone: author.phone || '',
      whatsapp: author.whatsapp || '',
      bio: author.bio || '',
      penName: author.penName || '',
      city: author.city || '',
      state: author.state || '',
      instagram: author.instagram || '',
      facebook: author.facebook || '',
      address: author.address || '',
      district: author.district || '',
      pincode: author.pincode || '',
      aadharNumber: author.aadharNumber || '',
      qualification: author.qualification || '',
      institution: '', subject: '',
      age: author.dob || author.age || '',
      experience: author.experience || '',
      skills: author.skills || (author.skillsJson || []).join(', ') || '',
      hobbies: author.hobbies || (author.hobbiesJson || []).join(', ') || '',
      whyJoining: author.whyJoining || ''
    });"""

content = content.replace(
    """setEditForm({
      name: author.name || '',
      phone: author.phone || '',
      whatsapp: author.whatsapp || '',
      bio: author.bio || '',
      penName: author.penName || '',
      city: author.city || '',
      state: author.state || '',
      instagram: author.instagram || '',
      facebook: author.facebook || '',
      address: author.address || '',
      aadharNumber: author.aadharNumber || '',
      qualification: author.qualification || '',
      institution: '', subject: '',
      age: author.age || '',
      experience: author.experience || '',
      skills: author.skills || '',
      hobbies: author.hobbies || '',
      whyJoining: author.whyJoining || ''
    });""",
    prefill_open
)

# Edit form in OperationsDashboardPage.tsx
address_ui = """<div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Full Address</label>
                    <input className="dash-input w-full text-xs" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">District</label>
                      <input className="dash-input w-full text-xs" value={editForm.district} onChange={e => setEditForm({...editForm, district: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Pincode</label>
                      <input className="dash-input w-full text-xs" value={editForm.pincode} onChange={e => setEditForm({...editForm, pincode: e.target.value.replace(/\\D/g, '')})} maxLength={6} />
                    </div>
                  </div>"""

content = content.replace(
    """<div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Full Address</label>
                    <input className="dash-input w-full text-xs" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} />
                  </div>""",
    address_ui
)

content = content.replace(
    "formData.append(key, String(val));",
    "if(key === 'age') formData.append('dob', String(val));\n        else if(key === 'skills') formData.append('skills', JSON.stringify(String(val).split(',').map((s:any)=>s.trim()).filter(Boolean)));\n        else if(key === 'hobbies') formData.append('hobbies', JSON.stringify(String(val).split(',').map((s:any)=>s.trim()).filter(Boolean)));\n        else formData.append(key, String(val));"
)

# Admin author view
# There's a section showing author details.
content = content.replace(
    "<div><span className=\"block text-[10px] text-gray-400 uppercase font-bold tracking-widest\">Age</span><span className=\"text-sm text-paa-navy\">{selectedAuthor.age || 'N/A'}</span></div>",
    "<div><span className=\"block text-[10px] text-gray-400 uppercase font-bold tracking-widest\">Date of Birth</span><span className=\"text-sm text-paa-navy\">{selectedAuthor.dob || selectedAuthor.age || 'N/A'}</span></div>"
)

content = content.replace(
    "<div><span className=\"block text-[10px] text-gray-400 uppercase font-bold tracking-widest\">Address</span><span className=\"text-sm text-paa-navy break-words\">{selectedAuthor.address || 'N/A'}</span></div>",
    "<div><span className=\"block text-[10px] text-gray-400 uppercase font-bold tracking-widest\">Address</span><span className=\"text-sm text-paa-navy break-words\">{selectedAuthor.address ? `${selectedAuthor.address}, ${selectedAuthor.district || ''} - ${selectedAuthor.pincode || ''}` : 'N/A'}</span></div>"
)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Operations dashboard patched.")
