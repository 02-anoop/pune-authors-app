const fs = require('fs');
let content = fs.readFileSync('src/app/components/AuthorDashboardPage.tsx', 'utf8');

const tabRegex = /'Orders'\];/g;
if (!content.includes("'Gallery'")) {
    content = content.replace(tabRegex, `'Orders', 'Gallery'];`);
}

// Add state for gallery
const stateRegex = /const \[notifications, setNotifications\] = useState<any\[\]>\(\[\]\);/g;
if (!content.includes("const [galleryEvents, setGalleryEvents]")) {
    content = content.replace(stateRegex, `const [notifications, setNotifications] = useState<any[]>([]);
  const [galleryEvents, setGalleryEvents] = useState<any[]>([]);
  const [selectedGalleryEvent, setSelectedGalleryEvent] = useState<any>(null);
  const [galleryUploadFile, setGalleryUploadFile] = useState<File | null>(null);
  const [galleryUploadCaption, setGalleryUploadCaption] = useState('');
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);`);
}

// Add fetch
const fetchRegex = /fetch\(\`\$\{import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:3001'\}\/api\/notifications\`\)/g;
if (!content.includes("/api/admin/gallery")) {
    // Actually gallery public endpoint is /api/gallery, let's check what it is. It should be /api/gallery
    content = content.replace(fetchRegex, `fetch(\`\${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/notifications\`),
        fetch(\`\${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/gallery\`)`);
}

const resRegex = /const \[meRes, notificationsRes\] = await Promise\.all\(\[/g;
if (!content.includes("galleryRes")) {
    content = content.replace(resRegex, `const [meRes, notificationsRes, galleryRes] = await Promise.all([`);
    
    const setRegex = /setNotifications\(notifs\.filter\(\(n: any\) => n\.target === 'ALL' \|\| n\.target === profileData\.name\)\);\s*\}/g;
    content = content.replace(setRegex, `setNotifications(notifs.filter((n: any) => n.target === 'ALL' || n.target === profileData.name));
        }
        if (galleryRes && galleryRes.ok) {
           setGalleryEvents(await galleryRes.json());
        }`);
}

// Add handle upload gallery image
const handlersRegex = /const handleSaveProfile = async \(e: React\.FormEvent\) => \{/g;
const uploadHandler = `
  const handleUploadGalleryImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGalleryEvent || !galleryUploadFile) return;
    try {
      setIsUploadingGallery(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('photo', galleryUploadFile);
      formData.append('caption', galleryUploadCaption);
      
      const res = await fetch(\`\${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/gallery/\${selectedGalleryEvent.id}/images\`, {
        method: 'POST',
        headers: { 'Authorization': \`Bearer \${token}\` },
        body: formData
      });
      if (res.ok) {
        alert('Image uploaded successfully! It will appear in the gallery.');
        setGalleryUploadFile(null);
        setGalleryUploadCaption('');
        setSelectedGalleryEvent(null);
      } else {
        alert('Failed to upload image.');
      }
    } catch(err) {
      console.error(err);
    } finally {
      setIsUploadingGallery(false);
    }
  };
`;

if (!content.includes("handleUploadGalleryImage")) {
    content = content.replace(handlersRegex, uploadHandler + "\n  const handleSaveProfile = async (e: React.FormEvent) => {");
}


// Add Gallery Tab UI
const uiRegex = /\{activeTab === 'Orders' && \(/g;
const galleryUI = `
      {activeTab === 'Gallery' && (
        <div className="dash-card">
          <div className="dash-card-header flex justify-between items-center">
            <h2 className="dash-card-title">Event Galleries</h2>
          </div>
          <div className="dash-card-body">
            <p className="text-sm text-gray-500 mb-6">Select an event below to upload your photos. They will be shared in the public gallery.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {galleryEvents.map(ge => (
                 <div key={ge.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <h3 className="font-bold text-paa-navy text-lg">{ge.type} @ {ge.location}</h3>
                      <p className="text-xs text-gray-500 mb-2">{new Date(ge.date).toLocaleDateString()} - {ge.city}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{ge.description}</p>
                    </div>
                    <button onClick={() => setSelectedGalleryEvent(ge)} className="dash-btn dash-btn-primary self-end">Upload Photo</button>
                 </div>
              ))}
            </div>
            {galleryEvents.length === 0 && <p className="text-gray-500 text-sm">No active galleries found.</p>}
          </div>
        </div>
      )}

      {selectedGalleryEvent && (
        <div className="dash-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setSelectedGalleryEvent(null)}>
          <div className="dash-modal max-w-md">
            <div className="dash-modal-header">
              <h3 className="text-sm font-bold uppercase tracking-widest text-paa-navy">Upload to Gallery</h3>
              <button onClick={() => setSelectedGalleryEvent(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/6 text-paa-gray-text transition-colors">&#x2715;</button>
            </div>
            <div className="dash-modal-body">
              <form onSubmit={handleUploadGalleryImage} className="flex flex-col gap-4">
                <div>
                   <label className="dash-label">Event</label>
                   <input disabled className="dash-input bg-gray-100" value={selectedGalleryEvent.type + ' @ ' + selectedGalleryEvent.location} />
                </div>
                <div>
                   <label className="dash-label">Photo *</label>
                   <input type="file" required accept="image/*" className="dash-input text-xs" onChange={e => setGalleryUploadFile(e.target.files?.[0] || null)} />
                </div>
                <div>
                   <label className="dash-label">Caption (Optional)</label>
                   <input className="dash-input" placeholder="e.g., Book signing moment..." value={galleryUploadCaption} onChange={e => setGalleryUploadCaption(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button type="button" onClick={() => setSelectedGalleryEvent(null)} className="dash-btn dash-btn-ghost">Cancel</button>
                  <button type="submit" disabled={isUploadingGallery} className="dash-btn dash-btn-primary disabled:opacity-50">{isUploadingGallery ? 'Uploading...' : 'Upload'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
`;

if (!content.includes("activeTab === 'Gallery'")) {
    content = content.replace(uiRegex, galleryUI + "\n      {activeTab === 'Orders' && (");
}

fs.writeFileSync('src/app/components/AuthorDashboardPage.tsx', content);
console.log('Added Gallery to Author Dashboard');
