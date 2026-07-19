import os

file_path = "src/app/components/AuthorDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

profile_init = """const [editProfileForm, setEditProfileForm] = useState({
    name: authorProfile.name || '',
    phone: authorProfile.phone || '',
    whatsapp: authorProfile.whatsapp || '',
    bio: authorProfile.bio || '',
    penName: authorProfile.penName || '',
    city: authorProfile.city || '',
    state: authorProfile.state || '',
    instagram: authorProfile.instagram || '',
    facebook: authorProfile.facebook || '',
    address: authorProfile.address || '',
    district: authorProfile.district || '',
    pincode: authorProfile.pincode || '',
    aadharNumber: authorProfile.aadharNumber || '',
    qualification: authorProfile.qualification || '',
    institution: '', subject: '',
    age: authorProfile.dob || authorProfile.age || '',
    experience: authorProfile.experience || '',
    skills: (authorProfile.skillsJson || []).join(', ') || authorProfile.skills || '',
    hobbies: (authorProfile.hobbiesJson || []).join(', ') || authorProfile.hobbies || '',
    whyJoining: authorProfile.whyJoining || ''
  });"""

content = content.replace(
    """const [editProfileForm, setEditProfileForm] = useState({
    name: authorProfile.name || '',
    phone: authorProfile.phone || '',
    whatsapp: authorProfile.whatsapp || '',
    bio: authorProfile.bio || '',
    penName: authorProfile.penName || '',
    city: authorProfile.city || '',
    state: authorProfile.state || '',
    instagram: authorProfile.instagram || '',
    facebook: authorProfile.facebook || '',
    address: authorProfile.address || '',
    aadharNumber: authorProfile.aadharNumber || '',
    qualification: authorProfile.qualification || '',
    institution: '', subject: '',
    age: authorProfile.age || '',
    experience: authorProfile.experience || '',
    skills: authorProfile.skills || '',
    hobbies: authorProfile.hobbies || '',
    whyJoining: authorProfile.whyJoining || ''
  });""",
    profile_init
)

address_fields = """<div>
                <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Full Address</label>
                <input className="dash-input w-full" value={editProfileForm.address} onChange={e => setEditProfileForm({...editProfileForm, address: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">District</label>
                  <input className="dash-input w-full" value={editProfileForm.district} onChange={e => setEditProfileForm({...editProfileForm, district: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Pincode</label>
                  <input className="dash-input w-full" value={editProfileForm.pincode} onChange={e => setEditProfileForm({...editProfileForm, pincode: e.target.value.replace(/\\D/g, '')})} maxLength={6} />
                </div>
              </div>"""

content = content.replace(
    """<div>
                <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Full Address</label>
                <input className="dash-input w-full" value={editProfileForm.address} onChange={e => setEditProfileForm({...editProfileForm, address: e.target.value})} />
              </div>""",
    address_fields
)

content = content.replace(
    "formData.append(key, val);",
    "if(key === 'age') formData.append('dob', val);\n        else if(key === 'skills') formData.append('skills', JSON.stringify(val.split(',').map((s:any)=>s.trim()).filter(Boolean)));\n        else if(key === 'hobbies') formData.append('hobbies', JSON.stringify(val.split(',').map((s:any)=>s.trim()).filter(Boolean)));\n        else formData.append(key, val);"
)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Profile editing patched.")
