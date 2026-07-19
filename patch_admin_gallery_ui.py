import os

filepath = "src/app/components/OperationsDashboardPage.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Add link to sub nav if applicable, but Admin has Tabs mostly.
# Let's search for the Tabs list.
tabs_target = "const tabs = ['Overview', 'Registrations', 'Events', 'Author Queries', 'Book Catalogue', 'Customer Orders', 'Helpdesk'];"
tabs_replace = "const tabs = ['Overview', 'Registrations', 'Events', 'Author Queries', 'Book Catalogue', 'Customer Orders', 'Helpdesk', 'Gallery Review'];"
if tabs_target in content:
    content = content.replace(tabs_target, tabs_replace)

ui_target = "{activeTab === 'Helpdesk' && <HelpdeskTab />}"
ui_replace = ui_target + "\n        {activeTab === 'Gallery Review' && <GalleryReviewTab />}"
if "{activeTab === 'Gallery Review'" not in content:
    content = content.replace(ui_target, ui_replace)

gallery_comp = """
function GalleryReviewTab() {
  const [pendingImages, setPendingImages] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchPendingImages = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/gallery/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPendingImages(res.data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchPendingImages(); }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('token');
      if (action === 'approve') {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/gallery/images/${id}/approve`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Image approved for public gallery.');
      } else {
        await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/gallery/images/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Image rejected and deleted.');
      }
      fetchPendingImages();
    } catch(err) {
      toast.error('Failed to process image action.');
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-paa-navy"/></div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-paa-navy tracking-tight">Gallery Review</h2>
          <p className="text-sm text-gray-500 mt-1">Review event photos uploaded by authors before they appear in the public gallery.</p>
        </div>
        <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl text-sm font-bold shadow-sm border border-amber-200 flex items-center gap-2">
          <ImageIcon className="w-4 h-4"/> {pendingImages.length} Pending
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
        {pendingImages.map(img => (
          <div key={img.id} className="bg-white rounded-3xl-2xl border border-gray-100 shadow-premium overflow-hidden hover:-translate-y-1 transition-all">
            <div className="aspect-square bg-gray-100 relative group">
              <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${img.url}`} alt="Event" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button onClick={() => handleAction(img.id, 'approve')} className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shadow-lg" title="Approve"><Check size={20}/></button>
                <button onClick={() => handleAction(img.id, 'reject')} className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg" title="Reject"><X size={20}/></button>
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-paa-navy mb-1 line-clamp-1">{img.galleryEvent?.location || 'Unknown Event'}</p>
              <p className="text-sm text-gray-600 line-clamp-2">{img.caption || 'No caption provided'}</p>
              <div className="mt-4 flex gap-2">
                 <button onClick={() => handleAction(img.id, 'approve')} className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-2 rounded-xl text-xs font-bold transition-colors text-center border border-green-200">APPROVE</button>
                 <button onClick={() => handleAction(img.id, 'reject')} className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded-xl text-xs font-bold transition-colors text-center border border-red-200">REJECT</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {pendingImages.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl-2xl border border-gray-100 border-dashed">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-lg font-serif text-paa-navy">All caught up!</h3>
          <p className="text-gray-500 text-sm mt-1">There are no pending gallery images to review.</p>
        </div>
      )}
    </div>
  );
}
"""

if "function GalleryReviewTab" not in content:
    content += "\n\n" + gallery_comp

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("Patched OperationsDashboardPage.tsx")
