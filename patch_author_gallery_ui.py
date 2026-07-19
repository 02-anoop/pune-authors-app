import os

filepath = "src/app/components/AuthorDashboardPage.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Add link
nav_target = "<Link onClick={() => setIsMobileMenuOpen(false)} to=\"/dashboard/events\" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/events') ? 'active' : ''}`}><CalendarIcon className=\"w-4 h-4\"/> Events Ecosystem</Link>"
nav_replace = nav_target + "\n            <Link onClick={() => setIsMobileMenuOpen(false)} to=\"/dashboard/gallery\" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/gallery') ? 'active' : ''}`}><ImageIcon className=\"w-4 h-4\"/> Event Gallery</Link>"
content = content.replace(nav_target, nav_replace)

# Add Route
route_target = "<Route path=\"/events\" element={<EventsDashboard registrations={dashboardData.authorProfile.eventRegistrations} />} />"
route_replace = route_target + "\n            <Route path=\"/gallery\" element={<AuthorGallery />} />"
content = content.replace(route_target, route_replace)

# Add Component
gallery_comp = """
function AuthorGallery() {
  const [galleries, setGalleries] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedGalleryEvent, setSelectedGalleryEvent] = React.useState<any>(null);
  const [galleryUploadFile, setGalleryUploadFile] = React.useState<File | null>(null);
  const [galleryUploadCaption, setGalleryUploadCaption] = React.useState('');
  const [isUploadingGallery, setIsUploadingGallery] = React.useState(false);

  React.useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/gallery/events`);
      setGalleries(res.data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadGalleryImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGalleryEvent || !galleryUploadFile) return;
    try {
      setIsUploadingGallery(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('photo', galleryUploadFile);
      formData.append('caption', galleryUploadCaption);
      
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/gallery/${selectedGalleryEvent.id}/images`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        toast.success('Image uploaded successfully! It will appear after admin review.');
        setGalleryUploadFile(null);
        setGalleryUploadCaption('');
        setSelectedGalleryEvent(null);
      } else {
        toast.error('Failed to upload image.');
      }
    } catch(err) {
      console.error(err);
    } finally {
      setIsUploadingGallery(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-paa-navy"/></div>;

  return (
    <div className="space-y-6">
      <div className="dash-card border-none shadow-none">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif text-paa-navy tracking-tight">Event Galleries</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">Select an event below to upload your photos. They will be shared in the public gallery pending administrative approval.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {galleries.map(ge => (
             <div key={ge.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <h3 className="font-bold text-paa-navy text-lg">{ge.type} @ {ge.location}</h3>
                  <p className="text-xs text-gray-500 mb-2">{new Date(ge.date).toLocaleDateString()} - {ge.city}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{ge.description}</p>
                </div>
                <button onClick={() => setSelectedGalleryEvent(ge)} className="dash-btn dash-btn-primary self-end whitespace-nowrap"><ImageIcon className="w-4 h-4 inline-block mr-2" />Upload Photo</button>
             </div>
          ))}
        </div>
        {galleries.length === 0 && <p className="text-gray-500 text-sm">No active galleries found.</p>}
      </div>

      {selectedGalleryEvent && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setSelectedGalleryEvent(null)}>
          <div className="bg-white rounded-3xl-2xl max-w-md w-full shadow-premium overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-sm font-bold uppercase tracking-widest text-paa-navy">Upload to Gallery</h3>
              <button onClick={() => setSelectedGalleryEvent(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-gray-500 transition-colors"><X size={16}/></button>
            </div>
            <div className="p-6">
              <form onSubmit={handleUploadGalleryImage} className="flex flex-col gap-4">
                <div>
                   <label className="dash-label">Event</label>
                   <input disabled className="dash-input bg-gray-100 w-full" value={selectedGalleryEvent.type + ' @ ' + selectedGalleryEvent.location} />
                </div>
                <div>
                   <label className="dash-label">Photo *</label>
                   <input type="file" required accept="image/*" className="dash-input text-xs w-full" onChange={e => setGalleryUploadFile(e.target.files?.[0] || null)} />
                </div>
                <div>
                   <label className="dash-label">Caption (Optional)</label>
                   <input className="dash-input w-full" placeholder="e.g., Book signing moment..." value={galleryUploadCaption} onChange={e => setGalleryUploadCaption(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setSelectedGalleryEvent(null)} className="px-6 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
                  <button type="submit" disabled={isUploadingGallery} className="dash-btn dash-btn-primary disabled:opacity-50">{isUploadingGallery ? 'Uploading...' : 'Upload Image'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"""

if "function AuthorGallery" not in content:
    content += "\n\n" + gallery_comp

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("Patched AuthorDashboardPage.tsx")
