import os

file_path = "src/app/components/AuthorDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Edit Profile Form initial state
content = content.replace(
    "editProfileForm = useState({ name: '', phone: '', whatsapp: '', bio: '', penName: '', city: '', state: '', instagram: '', facebook: '', address: '', aadharNumber: '', qualification: '', institution: '', subject: '', age: '', experience: '', skills: '', hobbies: '', whyJoining: '' });",
    "editProfileForm = useState({ name: '', phone: '', whatsapp: '', bio: '', penName: '', city: '', state: '', instagram: '', facebook: '', address: '', district: '', pincode: '', aadharNumber: '', qualification: '', institution: '', subject: '', age: '', experience: '', skills: '', hobbies: '', whyJoining: '' });"
)

# Address, City, State, District, Pincode
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
                  <input className="dash-input w-full" value={editProfileForm.pincode} onChange={e => setEditProfileForm({...editProfileForm, pincode: e.target.value})} />
                </div>
              </div>"""

content = content.replace(
    """<div>
                <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Full Address</label>
                <input className="dash-input w-full" value={editProfileForm.address} onChange={e => setEditProfileForm({...editProfileForm, address: e.target.value})} />
              </div>""",
    address_fields
)

# Fix open edit profile prefill
content = content.replace(
    "setEditProfileForm({",
    "setEditProfileForm({"
) # Wait, where is handleEditProfileOpen?
open_func = """const handleEditProfileOpen = () => {
    setEditProfileForm({
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
    });
    setShowEditProfile(true);
  };"""

content = content.replace(
    """const handleEditProfileOpen = () => {
    navigate('/dashboard/profile');
  };""",
    """const handleEditProfileOpen = () => {
    navigate('/dashboard/profile');
  };"""
)

# Oh wait, `handleEditProfileOpen` just navigates to `/dashboard/profile`!
# The modal is legacy or not used?
# Wait, `<button onClick={handleEditProfileOpen} ...>Edit Profile</button>`
# `navigate('/dashboard/profile')` takes the user to `AuthorProfile` component.
# The edit profile modal `showEditProfile && ( ... )` is actually inside `OverviewTab` but handleEditProfileOpen doesn't open it!
# Wait, `OverviewTab` has `<Route path="/profile" element={<AuthorProfile ... />} />`
# Yes, Profile Editing is in `AuthorProfile` component!

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
