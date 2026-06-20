import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router';
import { Home, Check, AlertCircle, Upload, Loader2, LogOut } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import { toast } from 'sonner';

export function AuthorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [extraDataState, setExtraDataState] = useState<any>({});
  const [hasNewQueries, setHasNewQueries] = useState(false);
  const prevQueryAnsCountRef = useRef(0);
  const navigate = useNavigate();
  const location = useLocation();


  const fetchQueriesAlert = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/queries`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      const answeredCount = res.data.filter((q: any) => q.status === 'Answered').length;
      if (prevQueryAnsCountRef.current > 0 && answeredCount > prevQueryAnsCountRef.current && !location.pathname.includes('/queries')) {
         setHasNewQueries(true);
      }
      prevQueryAnsCountRef.current = answeredCount;
    } catch(err) {}
  };

  const fetchDashboardData = async (forceRefresh = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      // Append timestamp to bust server-side cache on explicit refresh
      const cacheBust = forceRefresh ? `?t=${Date.now()}` : '';
      const dashRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/dashboard-data${cacheBust}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(dashRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
      localStorage.removeItem('token');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (dashboardData?.authorProfile?.extraData) {
      setExtraDataState(dashboardData.authorProfile.extraData);
    }
  }, [dashboardData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen bg-paa-cream p-6">
        <div className="max-w-7xl mx-auto space-y-6">
           <div className="h-12 bg-gray-200 animate-pulse rounded"></div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="h-32 bg-gray-200 animate-pulse rounded"></div>
             <div className="h-32 bg-gray-200 animate-pulse rounded"></div>
             <div className="h-32 bg-gray-200 animate-pulse rounded"></div>
           </div>
           <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  const { status, rejectionReason, name, email, phone, bio, photoUrl, transactionId, paymentScreenshot, extraData } = dashboardData.authorProfile;
  const dynamicFields = dashboardData.dynamicFields || [];

  const missingFields = dynamicFields.filter((f: any) => !extraDataState[f.name]);

  const handleSaveExtraData = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/profile/extra`, { extraData: extraDataState }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Information saved!');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to save information');
    }
  };

  if (status === 'Approved' && missingFields.length > 0) {
    return (
      <div className="min-h-screen bg-paa-cream font-sans flex items-center justify-center p-6">
        <div className="bg-white max-w-lg w-full p-8 rounded border border-paa-navy/10 shadow-sm">
          <h2 className="text-xl font-serif text-paa-navy mb-4 border-b pb-2">Action Required</h2>
          <p className="text-sm text-gray-600 mb-6">The administration requires some additional information to complete your profile setup. Please fill out the following fields to proceed to your dashboard.</p>
          <div className="space-y-4 mb-6">
            {missingFields.map((f: any) => (
              <div key={f.name}>
                <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">{f.name}</label>
                {f.type === 'number' ? (
                  <input type="number" className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" value={extraDataState[f.name] || ''} onChange={e => setExtraDataState({...extraDataState, [f.name]: e.target.value})} />
                ) : f.type === 'date' ? (
                  <input type="date" className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" value={extraDataState[f.name] || ''} onChange={e => setExtraDataState({...extraDataState, [f.name]: e.target.value})} />
                ) : (
                  <input type="text" className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" value={extraDataState[f.name] || ''} onChange={e => setExtraDataState({...extraDataState, [f.name]: e.target.value})} />
                )}
              </div>
            ))}
          </div>
          <button onClick={handleSaveExtraData} className="w-full py-3 bg-paa-navy text-paa-cream text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors">Save & Continue</button>
        </div>
      </div>
    );
  }

  if (status === 'Pending' || status === 'Rejected') {
    return (
      <div className="min-h-screen bg-paa-cream font-sans flex items-center justify-center p-6">
        <div className="bg-white max-w-2xl w-full p-8 rounded-lg shadow border border-paa-navy/10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-serif text-paa-navy">Author Application Status</h1>
            <button onClick={handleLogout} className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-bold uppercase"><LogOut size={16}/> Logout</button>
          </div>
          
          <div className={`p-4 mb-8 rounded border ${status === 'Pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <h2 className="text-xl font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              {status === 'Pending' ? <AlertCircle size={20} /> : <AlertCircle size={20} />}
              Status: {status}
            </h2>
            {status === 'Pending' ? (
              <p className="text-sm">Your author application has been submitted and is currently pending review by the admin team. You will be notified via email once approved. Check back here for updates.</p>
            ) : (
              <div>
                <p className="text-sm mb-2">Unfortunately, your author application has been rejected.</p>
                {rejectionReason && <p className="text-sm font-bold bg-white p-3 rounded border border-red-100">Reason: {rejectionReason}</p>}
              </div>
            )}
          </div>

          <h3 className="text-lg font-bold text-paa-navy border-b pb-2 mb-4 uppercase tracking-widest">Submitted Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div><span className="text-gray-500 block text-xs uppercase font-bold">Name</span> {name}</div>
            <div><span className="text-gray-500 block text-xs uppercase font-bold">Email</span> {email}</div>
            <div><span className="text-gray-500 block text-xs uppercase font-bold">Phone</span> {phone}</div>
            <div><span className="text-gray-500 block text-xs uppercase font-bold">Transaction ID</span> {transactionId || 'N/A'}</div>
          </div>
          
          <div className="mb-4">
            <span className="text-gray-500 block text-xs uppercase font-bold mb-1">Bio</span>
            <p className="text-sm bg-gray-50 p-3 rounded">{bio}</p>
          </div>
          {extraData && Object.keys(extraData).length > 0 && (
            <div className="mt-4">
               <h4 className="text-xs font-bold uppercase tracking-widest text-paa-navy border-b pb-1 mb-3">Additional Details</h4>
               <div className="grid grid-cols-2 gap-4 text-sm">
                 {Object.entries(extraData).map(([key, val]) => (
                    <div key={key}><span className="text-gray-500 block text-xs uppercase font-bold">{key}</span> {String(val)}</div>
                 ))}
               </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6">
            {photoUrl && (
              <div>
                <span className="text-gray-500 block text-xs uppercase font-bold mb-2">Profile Photo</span>
                <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${photoUrl}`} alt="Profile" className="w-24 h-24 object-cover rounded shadow" />
              </div>
            )}
            {paymentScreenshot && (
              <div>
                <span className="text-gray-500 block text-xs uppercase font-bold mb-2">Payment Screenshot</span>
                <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${paymentScreenshot}`} alt="Payment" className="w-full max-w-xs object-contain border rounded shadow-sm" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>

      {/* Mandatory Settlement Overlay Blackout */}
      {dashboardData?.eventInvites?.some((inv: any) => inv.optInStatus === 'Opted-In' && inv.event.status === 'Past' && dashboardData?.listedBooks?.some((lb: any) => lb.eventId === inv.eventId && lb.listedStock !== (lb.soldStock || 0) + (lb.returnedStock || 0))) && location.pathname !== '/dashboard/events' && (
         <div className="fixed inset-0 bg-white z-[65] flex items-center justify-center pointer-events-auto">
            <div className="text-center">
               <Loader2 className="w-12 h-12 animate-spin text-paa-navy mx-auto mb-4" />
               <h2 className="text-2xl font-serif text-paa-navy">Action Required</h2>
               <p className="text-gray-500 mt-2 mb-6">Please settle your past event inventory to access your dashboard.</p>
               <button onClick={() => navigate('/dashboard/events')} className="bg-paa-navy text-paa-cream px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-paa-gold hover:text-paa-navy transition-colors">Go to Events Tab</button>
            </div>
         </div>
      )}

    <div className="min-h-screen bg-paa-cream font-sans">
      <div className="bg-white border-b border-paa-navy/10 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-6 text-xs font-bold tracking-widest uppercase overflow-x-auto hide-scrollbar items-center">
          <Link to="/dashboard" className={`${location.pathname === '/dashboard' ? 'text-paa-navy border-b-2 border-paa-navy' : 'text-gray-500 hover:text-paa-navy'} pb-1 transition-colors whitespace-nowrap`}>Overview</Link>
          <Link to="/dashboard/catalogue" className={`${location.pathname.includes('/catalogue') ? 'text-paa-navy border-b-2 border-paa-navy' : 'text-gray-500 hover:text-paa-navy'} pb-1 transition-colors whitespace-nowrap`}>Catalogue Books</Link>
          <Link to="/dashboard/orders" className={`${location.pathname.includes('/orders') ? 'text-paa-navy border-b-2 border-paa-navy' : 'text-gray-500 hover:text-paa-navy'} pb-1 transition-colors whitespace-nowrap`}>My Orders</Link>
          <Link to="/dashboard/inventory" className={`${location.pathname.includes('/inventory') ? 'text-paa-navy border-b-2 border-paa-navy' : 'text-gray-500 hover:text-paa-navy'} pb-1 transition-colors whitespace-nowrap`}>Inventory</Link>
          <Link to="/dashboard/distribution" className={`${location.pathname.includes('/distribution') ? 'text-paa-navy border-b-2 border-paa-navy' : 'text-gray-500 hover:text-paa-navy'} pb-1 transition-colors whitespace-nowrap`}>Distribution</Link>
          <Link to="/dashboard/events" className={`${location.pathname.includes('/events') ? 'text-paa-navy border-b-2 border-paa-navy' : 'text-gray-500 hover:text-paa-navy'} pb-1 transition-colors whitespace-nowrap`}>Events</Link>
          <button onClick={handleLogout} className="ml-auto flex items-center gap-1 text-red-600 hover:text-red-700 pb-1 transition-colors whitespace-nowrap"><LogOut size={14}/> Logout</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<OverviewTab data={dashboardData} onRefresh={fetchDashboardData} />} />
          <Route path="/catalogue" element={<AuthorCatalogueTab />} />
          <Route path="/orders" element={<AuthorOrders orders={dashboardData.authorOrders} onRefresh={fetchDashboardData} />} />
          <Route path="/forms/*" element={<FormsWrapper />} />
          <Route path="/inventory" element={<InventoryPage books={dashboardData.authorProfile.books} onRefresh={fetchDashboardData} />} />
          <Route path="/distribution" element={<DistributionRecord books={dashboardData.authorProfile.books} orders={dashboardData.authorOrders} authorName={dashboardData.authorProfile.name} />} />
          <Route path="/book-fair" element={<BookFairDashboard registrations={dashboardData.authorProfile.eventRegistrations} books={dashboardData.authorProfile.books} />} />
          <Route path="/events" element={<EventsDashboard registrations={dashboardData.authorProfile.eventRegistrations} />} />
        </Routes>
      </div>
    </div>
    </>
  );
}

function OverviewTab({ data, onRefresh }: { data: any, onRefresh: () => void }) {
  const [filter, setFilter] = useState('all');
  const [showAddBook, setShowAddBook] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', genre: '', synopsis: '', mrp: '', stock: '' });
  const [cover, setCover] = useState<File | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [editCoverBookId, setEditCoverBookId] = useState<number | null>(null);
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);

  const authorProfile = data.authorProfile;
  const authorBooks = authorProfile.books;
  const authorOrders = data.authorOrders;

  const titlesData = authorBooks.map((b: any, index: number) => {
    const sold = authorOrders.filter((o: any) => o.bookTitle === b.title && (o.status === 'Completed' || o.status === 'Dispatched')).reduce((acc: number, curr: any) => acc + curr.quantity, 0);
    return {
      sno: index + 1,
      id: b.id,
      title: b.title,
      date: new Date(b.createdAt).toLocaleDateString('en-GB'),
      mrp: `â‚¹${b.mrp}`,
      overpriced: b.overpriced ? 'Yes' : 'No',
      pub: 'Self-Published',
      genre: b.genre,
      sold: sold,
      status: b.status,
      rejectionReason: b.rejectionReason,
      stock: b.stock
    };
  });

  const filteredTitles = filter === 'all' ? titlesData : titlesData.filter((t: any) => t.genre === filter);

  const chartData = titlesData.map((t: any) => ({ name: t.title.substring(0, 15) + '...', sold: t.sold }));

  const activityData = [
    { name: 'Events Part.', count: authorProfile.eventRegistrations?.filter((r:any) => r.activity.type.includes('Event')).length || 0 },
    { name: 'Book Fairs', count: authorProfile.eventRegistrations?.filter((r:any) => r.activity.type.includes('Fair')).length || 0 },
    { name: 'Flybraries', count: authorProfile.eventRegistrations?.filter((r:any) => r.activity.type.includes('Flybrary')).length || 0 },
  ];

  const completedOrders = authorOrders.filter((o: any) => o.status === 'Completed');
  const grossSales = completedOrders.reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const netEarnings = grossSales * 0.7;

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', newBook.title);
      formData.append('genre', newBook.genre);
      formData.append('synopsis', newBook.synopsis);
      formData.append('mrp', newBook.mrp);
      formData.append('stock', newBook.stock);
      if (cover) formData.append('cover', cover);

      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/books`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Book added successfully! Pending admin approval.');
      setShowAddBook(false);
      window.location.reload();
    } catch (err) {
      toast.error('Failed to add book');
    }
  };

  const handleEditProfileOpen = () => {
    setEditBio(authorProfile.bio || '');
    setEditPhone(authorProfile.phone || '');
    setEditWhatsapp(authorProfile.whatsapp || '');
    setEditPhoto(null);
    setShowEditProfile(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('bio', editBio);
      formData.append('phone', editPhone);
      formData.append('whatsapp', editWhatsapp);
      if (editPhoto) formData.append('photo', editPhoto);
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/profile/bio`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Profile updated successfully!');
      setShowEditProfile(false);
      onRefresh();
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const handleUpdateCover = async (bookId: number) => {
    if (!newCoverFile) { toast.error('Please select a cover image'); return; }
    try {
      const formData = new FormData();
      formData.append('cover', newCoverFile);
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/books/${bookId}/cover`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Book cover updated!');
      setEditCoverBookId(null);
      setNewCoverFile(null);
      onRefresh();
    } catch (err) {
      toast.error('Failed to update cover');
    }
  };




  return (
    <div>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-3">
        <h1 className="text-4xl font-serif text-paa-navy">Author Dashboard</h1>
        <div className="flex gap-2">
          <button onClick={handleEditProfileOpen} className="bg-white border border-paa-navy text-paa-navy px-4 py-2 font-bold tracking-widest uppercase text-xs hover:bg-paa-navy hover:text-white transition-colors">
            âœŽ Edit My Profile
          </button>
          <button onClick={() => setShowAddBook(true)} className="bg-paa-gold text-paa-navy px-4 py-2 font-bold tracking-widest uppercase text-xs hover:bg-paa-navy hover:text-paa-gold transition-colors">
            + Add New Book
          </button>
        </div>
      </div>

      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-serif text-paa-navy mb-4 border-b pb-2">Edit My Profile</h2>
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Author Bio</label>
                <textarea required className="border p-2 w-full text-sm" rows={5} value={editBio} onChange={e => setEditBio(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Phone</label>
                  <input className="border p-2 w-full text-sm" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">WhatsApp</label>
                  <input className="border p-2 w-full text-sm" value={editWhatsapp} onChange={e => setEditWhatsapp(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Update Profile Photo</label>
                <input type="file" accept="image/*" className="border p-2 text-xs w-full" onChange={e => setEditPhoto(e.target.files?.[0] || null)} />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowEditProfile(false)} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
                <button type="submit" className="bg-paa-navy text-paa-cream px-4 py-2 text-sm font-bold">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editCoverBookId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-sm w-full">
            <h2 className="text-xl font-serif text-paa-navy mb-4 border-b pb-2">Update Book Cover</h2>
            <div className="flex flex-col gap-4">
              <input type="file" accept="image/*" className="border p-2 text-xs" onChange={e => setNewCoverFile(e.target.files?.[0] || null)} />
              <div className="flex justify-end gap-2">
                <button onClick={() => { setEditCoverBookId(null); setNewCoverFile(null); }} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
                <button onClick={() => handleUpdateCover(editCoverBookId)} className="bg-paa-navy text-paa-cream px-4 py-2 text-sm font-bold">Upload Cover</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showAddBook && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-md w-full">
            <h2 className="text-xl font-serif text-paa-navy mb-4">Add New Title</h2>
            <form onSubmit={handleAddBook} className="flex flex-col gap-4">
              <input required placeholder="Book Title" className="border p-2" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} />
              <select required className="border p-2" value={newBook.genre} onChange={e => setNewBook({...newBook, genre: e.target.value})}>
                <option value="">Select Genre</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Children">Children</option>
                <option value="Poetry">Poetry</option>
              </select>
              <textarea required placeholder="Synopsis" className="border p-2" value={newBook.synopsis} onChange={e => setNewBook({...newBook, synopsis: e.target.value})} />
              <input required type="number" placeholder="MRP (â‚¹)" className="border p-2" value={newBook.mrp} onChange={e => setNewBook({...newBook, mrp: e.target.value})} />
              <input required type="number" placeholder="Initial Stock" className="border p-2" value={newBook.stock} onChange={e => setNewBook({...newBook, stock: e.target.value})} />
              <input type="file" accept="image/*" onChange={e => setCover(e.target.files?.[0] || null)} className="border p-2 text-xs" />
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowAddBook(false)} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
                <button type="submit" className="bg-paa-navy text-paa-cream px-4 py-2 text-sm font-bold">Add Book</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col md:flex-row gap-6">
        <div className="flex items-center gap-4 bg-white p-4 border border-paa-navy/10 rounded grow">
           <span className="text-sm font-bold tracking-widest uppercase text-paa-navy">Filter Titles:</span>
           <select className="border p-2 text-sm outline-none" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Genres</option>
              <option value="Fiction">Fiction</option>
              <option value="Non-Fiction">Non-Fiction</option>
              <option value="Children">Children</option>
              <option value="Poetry">Poetry</option>
           </select>
        </div>

        <div className="flex gap-4">
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-4 rounded flex flex-col justify-center w-48">
            <div className="text-xs font-bold tracking-widest text-[#16a34a] uppercase mb-1">Gross Sales</div>
            <div className="text-2xl font-serif text-[#14532d]">â‚¹{grossSales.toFixed(2)}</div>
          </div>
          <div className="bg-[#eff6ff] border border-[#bfdbfe] p-4 rounded flex flex-col justify-center w-48">
            <div className="text-xs font-bold tracking-widest text-[#2563eb] uppercase mb-1">Net Earnings (70%)</div>
            <div className="text-2xl font-serif text-[#1e3a8a]">â‚¹{netEarnings.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-paa-navy/10 overflow-hidden mb-12">
        <h2 className="text-sm font-bold tracking-widest uppercase bg-[#5bc0de] text-white p-4">Your Titles Information</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#b3d4ff] text-paa-navy">
              <tr>
                <th className="p-3 border-r border-[#8faadc]">S.No</th>
                <th className="p-3 border-r border-[#8faadc]">Cover</th>
                <th className="p-3 border-r border-[#8faadc]">Title</th>
                <th className="p-3 border-r border-[#8faadc]">Status</th>
                <th className="p-3 border-r border-[#8faadc]">Date Joined</th>
                <th className="p-3 border-r border-[#8faadc]">MRP</th>
                <th className="p-3 border-r border-[#8faadc]">Genre</th>
                <th className="p-3 border-r border-[#8faadc]">Stock</th>
                <th className="p-3 border-r border-[#8faadc]">Books Sold</th>
                <th className="p-3">Change Cover</th>
              </tr>
            </thead>
            <tbody>
              {filteredTitles.map((row: any) => (
                <tr key={row.id} className="border-b border-paa-navy/5 even:bg-gray-50">
                  <td className="p-3 border-r border-paa-navy/5 text-center">{row.sno}</td>
                  <td className="p-3 border-r border-paa-navy/5">
                    {authorBooks.find((b: any) => b.id === row.id)?.coverUrl
                      ? <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${authorBooks.find((b: any) => b.id === row.id)?.coverUrl}`} alt="cover" className="w-10 h-14 object-cover rounded shadow" />
                      : <div className="w-10 h-14 bg-gray-100 flex items-center justify-center text-gray-400 text-xs rounded border">No Cover</div>
                    }
                  </td>
                  <td className="p-3 border-r border-paa-navy/5 font-medium">{row.title}</td>
                  <td className="p-3 border-r border-paa-navy/5">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded ${row.status === 'Approved' ? 'bg-green-100 text-green-800' : row.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{row.status}</span>
                    {row.status === 'Rejected' && row.rejectionReason && (
                       <div className="mt-1 text-xs text-red-600 font-medium">Reason: {row.rejectionReason}</div>
                    )}
                  </td>
                  <td className="p-3 border-r border-paa-navy/5">{row.date}</td>
                  <td className="p-3 border-r border-paa-navy/5">{row.mrp}</td>
                  <td className="p-3 border-r border-paa-navy/5">{row.genre}</td>
                  <td className="p-3 border-r border-paa-navy/5 font-bold bg-yellow-50">{row.stock}</td>
                  <td className="p-3 border-r border-paa-navy/5 font-bold text-paa-navy">{row.sold}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => { setEditCoverBookId(row.id); setNewCoverFile(null); }} className="bg-[#5bc0de] text-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest hover:bg-paa-navy transition-colors rounded">
                      Change Cover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
         <div className="bg-white p-6 border border-paa-navy/10 rounded">
            <h3 className="text-lg font-serif text-paa-navy mb-6">Books Sold per Title</h3>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis />
                    <Tooltip cursor={{fill: '#f3f4f6'}} />
                    <Bar dataKey="sold" fill="#5bc0de" />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
         <div className="bg-white p-6 border border-paa-navy/10 rounded">
            <h3 className="text-lg font-serif text-paa-navy mb-6">Activity Participation Overview</h3>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} />
                    <Bar dataKey="count" fill="#8faadc" />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
}

function InventoryPage({ books, onRefresh }: { books: any[], onRefresh: () => void }) {
  const [newStocks, setNewStocks] = useState<{[key: number]: string}>({});

  const handleUpdateStock = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const book = books.find(b => b.id === id);
      const updatedStock = book.stock + parseInt(newStocks[id] || '0');
      
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/inventory/${id}`, 
        { stock: updatedStock },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Stock updated');
      setNewStocks(prev => ({...prev, [id]: ''}));
      onRefresh();
    } catch (err) {
      toast.error('Failed to update stock');
    }
  };




  return (
    <div>
      <h1 className="text-4xl font-serif text-paa-navy mb-8 text-center uppercase">INVENTORY DASHBOARD</h1>
      
      <div className="bg-white border border-paa-navy/10 overflow-hidden mb-12">
        <h2 className="text-sm font-bold tracking-widest uppercase bg-[#5bc0de] text-white p-4">Update Stock</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
             <thead className="bg-[#b3d4ff] text-paa-navy uppercase text-xs">
                <tr>
                   <th className="p-3 border-r border-[#8faadc]">S.No</th>
                   <th className="p-3 border-r border-[#8faadc]">Title</th>
                   <th className="p-3 border-r border-[#8faadc] text-center">Current Stock</th>
                   <th className="p-3 border-r border-[#8faadc] text-center">Status</th>
                   <th className="p-3 border-r border-[#8faadc]">Add Stock</th>
                   <th className="p-3">Action</th>
                </tr>
             </thead>
             <tbody>
               {books.map((item, index) => (
                 <tr key={item.id} className="border-b border-paa-navy/5 even:bg-gray-50">
                    <td className="p-3 border-r border-paa-navy/5 text-center">{index + 1}</td>
                    <td className="p-3 border-r border-paa-navy/5 font-medium">{item.title}</td>
                    <td className="p-3 border-r border-paa-navy/5 text-center font-bold text-lg">{item.stock}</td>
                    <td className="p-3 border-r border-paa-navy/5 text-center">
                       {item.stock < 10 ? (
                         <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">
                           <AlertCircle className="w-3 h-3" /> LOW STOCK
                         </span>
                       ) : (
                         <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">OK</span>
                       )}
                    </td>
                    <td className="p-3 border-r border-paa-navy/5">
                       <input 
                         type="number" 
                         min="1"
                         className="border p-2 w-24 text-xs" 
                         placeholder="Qty"
                         value={newStocks[item.id] || ''}
                         onChange={(e) => setNewStocks({...newStocks, [item.id]: e.target.value})}
                       />
                    </td>
                    <td className="p-3 text-center">
                       <button 
                         onClick={() => handleUpdateStock(item.id)}
                         disabled={!newStocks[item.id]}
                         className="bg-paa-navy text-paa-cream px-4 py-2 text-xs uppercase font-bold tracking-widest hover:bg-paa-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                       >
                         Update
                       </button>
                    </td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
         <div className="bg-white p-6 border border-paa-navy/10">
            <h3 className="text-xl font-serif text-paa-navy mb-4">Stock Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={books}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8faadc"
                    dataKey="stock"
                    nameKey="title"
                    label={({ name, percent }) => `${name.substring(0,10)} ${(percent * 100).toFixed(0)}%`}
                  >
                    {books.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#5bc0de', '#8faadc', '#ffff99'][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
         </div>
         <div className="bg-white p-6 border border-paa-navy/10 flex flex-col justify-center">
             <div className="flex items-center gap-4 mb-4">
                 <div className="w-16 h-16 bg-red-100 text-red-800 rounded flex items-center justify-center font-bold text-2xl">
                    {books.filter(i => i.stock < 10).length}
                 </div>
                 <div>
                    <div className="font-bold text-paa-navy">Titles Need Restocking</div>
                    <div className="text-sm text-gray-500">Less than 10 copies available</div>
                 </div>
             </div>
             
             <div className="flex items-center gap-4">
                 <div className="w-16 h-16 bg-[#b3d4ff] text-paa-navy rounded flex items-center justify-center font-bold text-2xl">
                    {books.reduce((acc, curr) => acc + curr.stock, 0)}
                 </div>
                 <div>
                    <div className="font-bold text-paa-navy">Total Copies in Inventory</div>
                    <div className="text-sm text-gray-500">Across all titles</div>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
}

function ActivityRegistration({ activities, books, onRefresh, registrations }: { activities: any[], books: any[], onRefresh: () => void, registrations: any[] }) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAct, setSelectedAct] = useState<any>(null);
  const [selectedBooks, setSelectedBooks] = useState<{id: number, qty: number}[]>([]);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registeredIds = registrations.map(r => r.activityId);

  const handleParticipateClick = (act: any) => {
    if (registeredIds.includes(act.id)) return;
    if (act.status === 'CLOSED') return;
    setSelectedAct(act);
    setShowDialog(true);
  };

  const confirmParticipation = async () => {
    if (selectedBooks.length === 0) {
      toast.error('Please select at least one book');
      return;
    }
    if (!screenshot && selectedAct.charges > 0) {
      toast.error('Please upload payment screenshot');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('activityId', selectedAct.id);
      formData.append('booksIds', JSON.stringify(selectedBooks));
      formData.append('amount', selectedAct.charges);
      if (screenshot) formData.append('paymentScreenshot', screenshot);

      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/activities/register`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Registration submitted! Pending verification.');
      setShowDialog(false);
      setSelectedAct(null);
      setScreenshot(null);
      setSelectedBooks([]);
      onRefresh();
    } catch (err) {
      toast.error('Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleBook = (id: number) => {
    setSelectedBooks(prev => {
      if (prev.find(b => b.id === id)) {
        return prev.filter(b => b.id !== id);
      } else {
        return [...prev, { id, qty: 1 }];
      }
    });
  };
  
  const updateBookQty = (id: number, qty: number) => {
    setSelectedBooks(prev => prev.map(b => b.id === id ? { ...b, qty } : b));
  };




  return (
    <div>
      <h1 className="text-4xl font-serif text-paa-navy mb-8">Activity Announcements</h1>
      <div className="bg-white border border-paa-navy/10 overflow-hidden relative">
        {showDialog && (
           <div className="fixed inset-0 bg-paa-navy/80 z-50 flex items-center justify-center p-4">
              <div className="bg-white max-w-md w-full p-6 rounded shadow-xl max-h-[90vh] overflow-y-auto">
                 <h3 className="text-xl font-serif text-paa-navy mb-4 border-b pb-2">Register for {selectedAct?.name}</h3>
                 
                 <div className="mb-4">
                   <p className="text-sm font-bold text-paa-navy mb-2">1. Select Books and Quantity for this event:</p>
                   <div className="flex flex-col gap-2 max-h-32 overflow-y-auto border p-2 bg-gray-50">
                     {books.map(b => {
                       const selected = selectedBooks.find(sb => sb.id === b.id);
                       return (
                         <div key={b.id} className="flex items-center justify-between gap-2 text-sm">
                           <label className="flex items-center gap-2 cursor-pointer flex-1">
                             <input type="checkbox" checked={!!selected} onChange={() => toggleBook(b.id)} />
                             {b.title}
                           </label>
                           {selected && (
                             <input type="number" min="1" placeholder="Qty" value={selected.qty} onChange={(e) => updateBookQty(b.id, parseInt(e.target.value) || 1)} className="w-16 p-1 text-xs border" />
                           )}
                         </div>
                       )
                     })}
                   </div>
                 </div>

                 <div className="mb-6">
                   <p className="text-sm font-bold text-paa-navy mb-2">2. Payment (â‚¹{selectedAct?.charges})</p>
                   {selectedAct?.charges > 0 ? (
                     <div className="border border-paa-navy/20 p-4 bg-gray-50 text-center">
                       <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=puneauthors@upi&pn=PuneAuthors&am=10" alt="QR Code" className="mx-auto mb-2 w-32 h-32" />
                       <p className="text-xs text-gray-500 mb-4">Scan QR to pay â‚¹{selectedAct.charges}</p>
                       <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-100">
                         <div className="flex flex-col items-center justify-center">
                           <Upload className="w-5 h-5 text-gray-400" />
                           <p className="text-xs text-gray-500">{screenshot ? screenshot.name : 'Upload Screenshot'}</p>
                         </div>
                         <input type="file" className="hidden" accept="image/*" onChange={e => setScreenshot(e.target.files?.[0] || null)} />
                       </label>
                     </div>
                   ) : (
                     <p className="text-sm text-green-600 font-bold">This event is free.</p>
                   )}
                 </div>

                 <div className="flex justify-end gap-4">
                    <button onClick={() => setShowDialog(false)} className="text-sm font-bold text-gray-500 hover:text-paa-navy">Cancel</button>
                    <button onClick={confirmParticipation} disabled={isSubmitting} className="bg-paa-gold text-paa-navy px-6 py-2 rounded text-sm font-bold disabled:opacity-50">
                      {isSubmitting ? 'Submitting...' : 'Register & Pay'}
                    </button>
                 </div>
              </div>
           </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#8faadc] text-paa-navy">
              <tr>
                <th className="p-3 border-r border-white/20 text-center">S.No</th>
                <th className="p-3 border-r border-white/20">ACTIVITY</th>
                <th className="p-3 border-r border-white/20">TYPE</th>
                <th className="p-3 border-r border-white/20">DATE</th>
                <th className="p-3 border-r border-white/20 text-center">STATUS</th>
                <th className="p-3 border-r border-white/20">CITY</th>
                <th className="p-3 border-r border-white/20 text-center">CHARGES</th>
                <th className="p-3 border-r border-white/20 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? <tr><td colSpan={8} className="p-4 text-center">No activities available.</td></tr> : activities.map((row, index) => {
                const reg = registrations.find(r => r.activityId === row.id);
                const isParticipating = !!reg;
                const statusColor = row.type.includes('Event') ? 'bg-[#5bc0de]' : row.type.includes('Fair') ? 'bg-[#d9534f]' : 'bg-[#5cb85c]';

                return (
                <tr key={row.id} className="border-b border-paa-navy/5 even:bg-gray-100">
                  <td className="p-3 border-r border-paa-navy/5 text-center bg-[#e4ebf5]">{index + 1}</td>
                  <td className="p-3 border-r border-paa-navy/5 font-medium">{row.name}</td>
                  <td className="p-3 border-r border-paa-navy/5 text-xs">{row.type}</td>
                  <td className="p-3 border-r border-paa-navy/5">{row.date}</td>
                  <td className="p-3 border-r border-paa-navy/5 text-center">
                    <span className="font-bold text-xs">{row.status}</span>
                  </td>
                  <td className="p-3 border-r border-paa-navy/5">{row.city}</td>
                  <td className="p-3 border-r border-paa-navy/5 text-center">â‚¹{row.charges}</td>
                  <td className="p-3 border-r border-paa-navy/5 text-center">
                    {isParticipating ? (
                      <div className="flex flex-col items-center">
                        <span className="bg-green-100 text-green-800 text-[10px] px-2 py-1 rounded-full font-bold mb-1 flex items-center gap-1"><Check size={12}/> Registered</span>
                        <span className="text-[10px] text-gray-500">{reg.status}</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleParticipateClick(row)}
                        disabled={row.status === 'CLOSED'}
                        className={`${row.status === 'CLOSED' ? 'bg-gray-300' : statusColor} text-white px-4 py-1.5 rounded-full text-xs font-bold shadow disabled:cursor-not-allowed transition-colors w-24`}
                      >
                         {row.status === 'CLOSED' ? 'CLOSED' : 'REGISTER'}
                      </button>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Author Orders
function AuthorOrders({ orders, onRefresh }: { orders: any[], onRefresh: () => void }) {
  const [loadingAction, setLoadingAction] = useState<number | null>(null);
  const [rejectItemId, setRejectItemId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // â”€â”€â”€ Invoice generator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const generateAndPrintInvoice = async (orderItemId: number) => {
    try {
      const token = localStorage.getItem('token');
      const { data: inv } = await axios.get(`${API}/api/order-items/${orderItemId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Delivery Invoice ${inv.orderId}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #111; }
    .page { max-width: 800px; margin: 0 auto; padding: 40px 36px; }

    /* --- HEADER --- */
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1a1a2e; padding-bottom: 18px; margin-bottom: 24px; }
    .brand h1 { font-size: 22px; font-weight: 800; color: #1a1a2e; letter-spacing: -.5px; }
    .brand p { font-size: 11px; color: #64748b; margin-top: 2px; }
    .inv-meta { text-align: right; }
    .inv-meta .inv-id { font-size: 20px; font-weight: 800; color: #1a1a2e; }
    .inv-meta .inv-label { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; }
    .badge { display: inline-block; background: #22c55e; color: #fff; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; margin-top: 6px; }
    .badge.dispatched { background: #3b82f6; }

    /* --- SECTIONS --- */
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .box { border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; }
    .box h3 { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; font-weight: 700; margin-bottom: 10px; border-bottom: 1px solid #f0f0f4; padding-bottom: 6px; }
    .box p { font-size: 13px; line-height: 1.7; color: #334155; }
    .box strong { color: #1a1a2e; }

    /* --- BOOK TABLE --- */
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead th { background: #1a1a2e; color: #fff; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; padding: 10px 14px; text-align: left; }
    tbody td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px; vertical-align: top; }
    tbody tr:last-child td { border-bottom: none; }
    tfoot td { padding: 12px 14px; font-weight: 700; font-size: 14px; border-top: 2px solid #1a1a2e; }
    .amount { text-align: right; font-weight: 700; color: #1a1a2e; }

    /* --- DELIVERY SLIP DIVIDER --- */
    .cut-line { border: none; border-top: 2px dashed #cbd5e1; margin: 32px 0; position: relative; }
    .cut-line::after { content: 'âœ‚ FOLD & PASTE ON DELIVERY BOX'; position: absolute; top: -9px; left: 50%; transform: translateX(-50%); background: #fff; padding: 0 10px; font-size: 10px; color: #94a3b8; letter-spacing: .06em; white-space: nowrap; }

    /* --- DELIVERY SLIP --- */
    .slip { border: 2.5px solid #1a1a2e; border-radius: 12px; padding: 22px 24px; }
    .slip-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; }
    .slip-header .from { font-size: 11px; color: #64748b; }
    .slip-header .from strong { display: block; font-size: 15px; color: #1a1a2e; }
    .slip-to { }
    .slip-to h4 { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; margin-bottom: 6px; }
    .slip-to .name { font-size: 18px; font-weight: 800; color: #1a1a2e; line-height: 1.2; }
    .slip-to .addr { font-size: 13px; color: #334155; margin-top: 4px; line-height: 1.6; }
    .slip-to .phone { font-size: 14px; font-weight: 700; color: #1a1a2e; margin-top: 8px; }
    .slip-contents { margin-top: 16px; padding-top: 14px; border-top: 1px dashed #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .slip-book { font-size: 13px; color: #334155; }
    .slip-book strong { display: block; font-size: 15px; color: #1a1a2e; font-weight: 700; }
    .slip-order { text-align: right; font-size: 11px; color: #94a3b8; }
    .slip-order strong { display: block; font-size: 14px; color: #1a1a2e; }

    /* --- FOOTER --- */
    .footer { margin-top: 28px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f0f0f4; padding-top: 16px; }

    @media print {
      body { background: #fff; }
      .page { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="page">

    <!-- Print Button -->
    <div class="no-print" style="text-align:right;margin-bottom:20px">
      <button onclick="window.print()" style="background:#1a1a2e;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;">ðŸ–¨ Print / Save as PDF</button>
    </div>

    <!-- INVOICE HEADER -->
    <div class="header">
      <div class="brand">
        <h1>Pune Authors' Association</h1>
        <p>puneauthors.com &nbsp;Â·&nbsp; Official Delivery Invoice</p>
      </div>
      <div class="inv-meta">
        <div class="inv-label">Invoice / Order ID</div>
        <div class="inv-id">${inv.orderId}</div>
        <div><span class="badge ${inv.status === 'Dispatched' ? 'dispatched' : ''}">${inv.status === 'Dispatched' ? 'Dispatched' : 'Approved'}</span></div>
      </div>
    </div>

    <!-- DATES -->
    <div style="display:flex;gap:12px;margin-bottom:20px;font-size:12px;color:#64748b">
      <span>ðŸ“… Order Date: <strong style="color:#1a1a2e">${new Date(inv.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</strong></span>
      ${inv.trackingNumber ? `<span>ðŸšš Tracking: <strong style="color:#1a1a2e">${inv.trackingNumber}</strong></span>` : ''}
    </div>

    <!-- TWO COLUMN: FROM / TO -->
    <div class="two-col">
      <div class="box">
        <h3>From (Author / Seller)</h3>
        <p>
          <strong>${inv.author.name}</strong><br>
          ${inv.author.email}<br>
          ${inv.author.phone ? inv.author.phone : ''}
          ${inv.author.whatsapp ? '<br>WhatsApp: ' + inv.author.whatsapp : ''}
        </p>
      </div>
      <div class="box">
        <h3>Bill To (Customer)</h3>
        <p>
          <strong>${inv.customer.name}</strong><br>
          ${inv.customer.email || ''}<br>
          ${inv.customer.phone || ''}
        </p>
      </div>
    </div>

    <!-- BOOK TABLE -->
    <table>
      <thead>
        <tr>
          <th>Book Title</th>
          <th>Genre</th>
          <th style="text-align:center">Qty</th>
          <th style="text-align:right">Unit Price</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>${inv.book.title}</strong></td>
          <td>${inv.book.genre}</td>
          <td style="text-align:center">${inv.quantity}</td>
          <td style="text-align:right">â‚¹${parseFloat(inv.book.mrp).toFixed(2)}</td>
          <td class="amount">â‚¹${parseFloat(inv.total).toFixed(2)}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4" style="text-align:right;color:#64748b;font-size:12px">Subtotal</td>
          <td class="amount">â‚¹${parseFloat(inv.total).toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan="4" style="text-align:right;color:#64748b;font-size:12px">Shipping</td>
          <td class="amount" style="font-size:12px;color:#22c55e">Included</td>
        </tr>
        <tr style="background:#f8fafc">
          <td colspan="4" style="text-align:right">Grand Total</td>
          <td class="amount" style="font-size:18px;color:#1a1a2e">â‚¹${parseFloat(inv.total).toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>

    ${inv.transactionId ? `
    <div class="box" style="margin-bottom:24px">
      <h3>Payment Reference</h3>
      <p>Transaction ID: <strong>${inv.transactionId}</strong></p>
    </div>` : ''}

    <!-- DELIVERY ADDRESS -->
    <div class="box" style="margin-bottom:32px">
      <h3>Delivery Address</h3>
      <p>${inv.customer.address}</p>
    </div>

    <!-- â•â•â• CUT LINE â•â•â• -->
    <hr class="cut-line">

    <!-- DELIVERY SLIP -->
    <div class="slip">
      <div class="slip-header">
        <div class="from">
          <strong>${inv.author.name}</strong>
          Pune Authors' Association<br>
          ${inv.author.email} ${inv.author.phone ? 'Â· ' + inv.author.phone : ''}
        </div>
        <div style="text-align:right;font-size:11px;color:#94a3b8">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:.06em">Order Reference</div>
          <div style="font-size:16px;font-weight:800;color:#1a1a2e">${inv.orderId}</div>
        </div>
      </div>
      <div class="slip-to">
        <h4>ðŸ“¬ Deliver To</h4>
        <div class="name">${inv.customer.name}</div>
        <div class="addr">${inv.customer.address}</div>
        <div class="phone">${inv.customer.phone || ''}</div>
      </div>
      <div class="slip-contents">
        <div class="slip-book">
          Contents:<br>
          <strong>${inv.book.title} Ã— ${inv.quantity}</strong>
        </div>
        <div class="slip-order">
          Amount Paid<br>
          <strong>â‚¹${parseFloat(inv.total).toFixed(2)}</strong>
        </div>
      </div>
    </div>

    <div class="footer">
      Pune Authors' Association &nbsp;Â·&nbsp; puneauthors.com &nbsp;Â·&nbsp;
      This document is system-generated and serves as proof of order.
    </div>
  </div>
</body>
</html>`;

      const win = window.open('', '_blank');
      if (win) {
        win.document.write(html);
        win.document.close();
        // Slight delay so styles render before auto-print
        setTimeout(() => win.print(), 800);
      } else {
        toast.error('Popup blocked. Please allow popups for this site.');
      }
    } catch (err) {
      toast.error('Could not load invoice data. Please try again.');
    }
  };

  const handleApprove = async (id: number) => {
    setLoadingAction(id);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(`${API}/api/order-items/${id}/author-approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order Approved â€” Stock reserved!');
      onRefresh();
      // Auto-open invoice after approval
      setTimeout(() => generateAndPrintInvoice(id), 800);
    } catch (e) {
      toast.error('Failed to approve order');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectItemId) return;
    setLoadingAction(rejectItemId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/order-items/${rejectItemId}/author-reject`, { reason: rejectReason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order Rejected');
      setRejectItemId(null);
      setRejectReason('');
      onRefresh();
    } catch (e) {
      toast.error('Failed to reject order');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDispatch = async (id: number) => {
    const trackingNumber = prompt("Enter tracking number for dispatch:");
    if (!trackingNumber) return;

    setLoadingAction(id);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/order-items/${id}/dispatch`, { trackingNumber }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order Dispatched');
      onRefresh();
    } catch (e) {
      toast.error('Failed to dispatch order');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div>
      {/* Reject Reason Modal */}
      {rejectItemId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-md w-full rounded shadow-xl">
            <h2 className="text-xl font-serif text-paa-navy mb-3">Reason for Rejection</h2>
            <p className="text-sm text-gray-500 mb-4">Please provide a reason to inform the customer.</p>
            <textarea
              className="w-full border p-2 text-sm mb-4 resize-none"
              rows={4}
              placeholder="e.g. Out of stock, wrong edition requested..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setRejectItemId(null); setRejectReason(''); }} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
              <button onClick={handleRejectSubmit} disabled={!rejectReason.trim() || loadingAction !== null} className="bg-red-600 text-white px-4 py-2 text-sm font-bold rounded disabled:opacity-50">Reject Order</button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-4xl font-serif text-paa-navy mb-4 text-center uppercase">MY WEB ORDERS</h1>
      <p className="text-center text-sm text-gray-500 mb-8">New orders appear here immediately. You must <strong>Approve</strong> or <strong>Reject</strong> each order. Once approved, dispatch the book with a tracking number.</p>
      <div className="bg-white border border-paa-navy/10 overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
             <thead className="bg-[#b3d4ff] text-paa-navy uppercase text-xs font-bold tracking-widest">
                <tr>
                   <th className="p-3 border-r border-[#8faadc]">Order ID & Date</th>
                   <th className="p-3 border-r border-[#8faadc]">Buyer Details</th>
                   <th className="p-3 border-r border-[#8faadc]">Book Title</th>
                   <th className="p-3 border-r border-[#8faadc] text-center">Qty</th>
                   <th className="p-3 border-r border-[#8faadc] text-center">Amount</th>
                   <th className="p-3 border-r border-[#8faadc]">Receipt</th>
                   <th className="p-3 border-r border-[#8faadc] text-center">Status</th>
                   <th className="p-3 text-center">Action</th>
                </tr>
             </thead>
             <tbody>
               {orders.length === 0 ? <tr><td colSpan={8} className="p-4 text-center">No orders received yet.</td></tr> : orders.map((ord, idx) => (
                 <tr key={idx} className="border-b border-paa-navy/5 even:bg-gray-50 bg-white hover:bg-gray-100 transition-colors">
                    <td className="p-3 border-r border-paa-navy/5">
                      <p className="font-bold text-paa-navy">ORD-{ord.orderId}</p>
                      <p className="text-xs text-paa-gray-text">{ord.date}</p>
                    </td>
                    <td className="p-3 border-r border-paa-navy/5">
                      <p className="font-medium">{ord.customerName}</p>
                      <p className="text-[10px] text-gray-500">{ord.address}</p>
                      {ord.customerPhone && <p className="text-[10px] text-blue-600">{ord.customerPhone}</p>}
                    </td>
                    <td className="p-3 border-r border-paa-navy/5">{ord.bookTitle}</td>
                    <td className="p-3 border-r border-paa-navy/5 text-center font-bold text-paa-navy">{ord.quantity}</td>
                    <td className="p-3 border-r border-paa-navy/5 text-center bg-gray-50 font-bold text-paa-navy">â‚¹{ord.amount}</td>
                    <td className="p-3 border-r border-paa-navy/5">
                      {ord.paymentScreenshot ? (
                        <div className="flex flex-col gap-1">
                          <a
                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${ord.paymentScreenshot}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-bold text-paa-navy underline tracking-widest uppercase"
                          >
                            View Screenshot
                          </a>
                          {ord.paymentVerified && (
                            <span className="text-[10px] font-bold text-green-600 tracking-widest uppercase flex items-center gap-1"><Check size={10}/> Verified</span>
                          )}
                        </div>
                      ) : <span className="text-[10px] text-gray-400">No screenshot</span>}
                    </td>
                    <td className="p-3 text-center border-r border-paa-navy/5">
                       <span className={`inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${
                         ord.status === 'Completed' ? 'bg-[#5cb85c] text-white border-[#4cae4c]'
                         : ord.status === 'Dispatched' ? 'bg-[#5bc0de] text-white border-[#46b8da]'
                         : ord.status === 'Accepted' ? 'bg-[#337ab7] text-white border-[#2e6da4]'
                         : ord.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-200'
                         : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                       }`}>
                         {ord.status}
                       </span>
                       {ord.status === 'Rejected' && ord.rejectionReason && (
                         <div className="mt-1 text-[10px] text-red-600">Reason: {ord.rejectionReason}</div>
                       )}
                    </td>
                    <td className="p-3 text-center">
                      {/* Author must Approve / Reject any Pending order regardless of payment verification */}
                      {ord.status === 'Pending Verification' || ord.status === 'Pending' ? (
                        <div className="flex flex-col gap-1 items-center">
                          <button
                            onClick={() => handleApprove(ord.id)}
                            disabled={loadingAction === ord.id}
                            className="bg-[#337ab7] text-white px-3 py-1 text-xs rounded shadow font-bold disabled:opacity-50 w-20"
                          >
                            {loadingAction === ord.id ? '...' : 'APPROVE'}
                          </button>
                          <button
                            onClick={() => { setRejectItemId(ord.id); setRejectReason(''); }}
                            disabled={loadingAction === ord.id}
                            className="bg-red-500 text-white px-3 py-1 text-xs rounded shadow font-bold disabled:opacity-50 w-20"
                          >
                            REJECT
                          </button>
                        </div>
                      ) : null}
                      {/* Invoice button for all approved/dispatched orders */}
                      {(ord.status === 'Accepted' || ord.status === 'Dispatched' || ord.status === 'Completed') && (
                        <div className="flex flex-col gap-1 items-center mt-1">
                          <button
                            onClick={() => generateAndPrintInvoice(ord.id)}
                            className="bg-paa-navy text-white px-3 py-1 text-[10px] rounded font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors w-20"
                            title="Download printable delivery invoice"
                          >
                            📄 Invoice
                          </button>
                          {ord.status === 'Accepted' && (
                            <button
                              onClick={() => handleDispatch(ord.id)}
                              disabled={loadingAction === ord.id}
                              className="bg-[#5bc0de] text-white px-3 py-1 text-xs rounded shadow font-bold disabled:opacity-50 w-20"
                            >
                              DISPATCH
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FormsWrapper() {
  const [forms, setForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('Literary Events');
  const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const fetchForms = async () => {
    try {
      const res = await axios.get(`${API}/api/author/forms`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      setForms(res.data);
    } catch(err) {}
  };

  useEffect(() => { fetchForms(); }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const answers: any = {};
    for (let [key, value] of formData.entries()) {
      answers[key] = value;
    }
    try {
      await axios.post(`${API}/api/author/forms/${selectedForm.id}/submit`, { answers }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      alert("Form submitted successfully!");
      setSelectedForm(null);
      fetchForms();
    } catch(err: any) {
      alert(err.response?.data?.error || "Error submitting form");
    }
  };

  const tabs = ['Literary Events', 'Book Fairs', 'Flybraries', 'Book CafÃ©'];
  const filteredForms = forms.filter(f => f.type === activeTab);




  return (
    <div>
      <h1 className="text-4xl font-serif text-paa-navy mb-8">Registration Forms</h1>
      <p className="text-sm mb-4 text-gray-500">Available forms published by administration for you to complete.</p>

      {!selectedForm && (
        <div className="flex gap-4 mb-8 border-b border-paa-navy/10 pb-4 overflow-x-auto">
          {tabs.map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold tracking-widest uppercase transition-colors whitespace-nowrap ${
                activeTab === tab ? 'bg-paa-navy text-paa-cream' : 'text-paa-navy border border-paa-navy hover:bg-paa-navy/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {selectedForm ? (
        <div className="bg-white p-6 border border-paa-navy/10 max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-2xl font-bold text-paa-navy">{selectedForm.title}</h2>
             <button onClick={() => setSelectedForm(null)} className="text-sm font-bold uppercase tracking-widest text-paa-gray-text hover:text-paa-navy">Cancel</button>
          </div>
          <p className="text-sm text-gray-500 mb-8">{selectedForm.description}</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            {selectedForm.fields.map((field: any, i: number) => (
              <div key={i}>
                <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-2">{field.name}</label>
                {field.type === 'textarea' ? (
                  <textarea name={field.name} required className="w-full p-3 border border-gray-300 rounded focus:border-paa-navy focus:outline-none" rows={4}></textarea>
                ) : field.type === 'select' ? (
                  <select name={field.name} required className="w-full p-3 border border-gray-300 rounded focus:border-paa-navy focus:outline-none bg-white">
                    <option value="">Select...</option>
                    {field.options?.map((opt: string, j: number) => <option key={j} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input type="text" name={field.name} required className="w-full p-3 border border-gray-300 rounded focus:border-paa-navy focus:outline-none" />
                )}
              </div>
            ))}
            <button type="submit" className="w-full bg-paa-navy text-paa-cream font-bold uppercase tracking-widest py-4 hover:bg-paa-gold transition-colors mt-8">
              Submit Form
            </button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredForms.map((f: any) => (
            <div key={f.id} className="bg-white p-6 border border-paa-navy/10 flex flex-col items-start gap-4 hover:shadow-lg transition-shadow">
               <h3 className="text-xl font-bold text-paa-navy">{f.title}</h3>
               <p className="text-sm text-gray-500 flex-1">{f.description}</p>
               {f.submitted ? (
                 <span className="px-4 py-2 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-widest border border-green-200">
                   Submitted
                 </span>
               ) : (
                 <button 
                   onClick={() => setSelectedForm(f)}
                   className="px-6 py-2 bg-paa-navy text-paa-cream text-xs font-bold uppercase tracking-widest hover:bg-paa-gold transition-colors"
                 >
                   Fill Form
                 </button>
               )}
            </div>
          ))}
          {filteredForms.length === 0 && (
            <div className="col-span-full p-12 text-center border border-dashed border-gray-300 text-gray-500">
              No {activeTab} forms currently available.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Mock pages for Distribution, Book Fair, Events that User provided to keep structure
function DistributionRecord({ books, orders, authorName }: { books: any[], orders: any[], authorName: string }) {



  return (
    <div>
      <h1 className="text-4xl font-serif text-paa-navy mb-8 text-center uppercase">BOOKS DISTRIBUTION RECORD</h1>
      <p className="text-center text-gray-500 mb-8">Data populated upon administrative dispatch</p>
      <div className="bg-white border border-paa-navy/10 overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
             <thead className="bg-[#5bc0de] text-white uppercase text-xs">
                <tr>
                   <th className="p-3 border-r border-white/20">S.No</th>
                   <th className="p-3 border-r border-white/20">TITLE</th>
                   <th className="p-3 border-r border-white/20">AUTHOR</th>
                   <th className="p-3 border-r border-white/20 text-center">QTY SOLD</th>
                   <th className="p-3 border-r border-white/20 text-center">QTY SENT TO AIRPORT</th>
                   <th className="p-3 border-r border-white/20 text-center">QTY SENT FOR BOOK FAIR</th>
                   <th className="p-3 border-r border-white/20 text-center">IN STOCK</th>
                </tr>
             </thead>
             <tbody>
               {books.length === 0 ? <tr><td colSpan={7} className="p-4 text-center">No distribution records found.</td></tr> : books.map((book, index) => {
                 const qtySold = orders.filter((o: any) => o.bookTitle === book.title && (o.status === 'Completed' || o.status === 'Dispatched')).reduce((acc: number, curr: any) => acc + curr.quantity, 0);
                 return (
                 <tr key={book.id} className="border-b border-paa-navy/5 even:bg-gray-50">
                   <td className="p-3 border-r border-paa-navy/5 text-center">{index + 1}</td>
                   <td className="p-3 border-r border-paa-navy/5 font-bold text-paa-navy">{book.title}</td>
                   <td className="p-3 border-r border-paa-navy/5">{authorName}</td>
                   <td className="p-3 border-r border-paa-navy/5 text-center font-bold text-green-700">{qtySold}</td>
                   <td className="p-3 border-r border-paa-navy/5 text-center">{book.airportStock || 0}</td>
                   <td className="p-3 border-r border-paa-navy/5 text-center">{book.fairStock || 0}</td>
                   <td className="p-3 border-r border-paa-navy/5 text-center font-bold">{book.stock}</td>
                 </tr>
               )})}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BookFairDashboard({ registrations, books }: { registrations: any[], books: any[] }) {
  const fairRegs = registrations.filter(r => r.activity?.type.includes('Fair') && r.status === 'Approved');




  return (
    <div>
      <h1 className="text-4xl font-serif text-paa-navy mb-8 text-center uppercase">BOOK FAIR DASHBOARD</h1>
      
      {fairRegs.length === 0 ? (
        <div className="bg-white border text-sm border-paa-navy/10 overflow-hidden mb-12">
          <div className="p-8 text-center text-gray-500">
            You have not participated in any approved Book Fairs yet.
          </div>
        </div>
      ) : (
        fairRegs.map(reg => {
          const bookIds = JSON.parse(reg.booksIds || '[]');
          const registeredBooks = books.filter(b => bookIds.includes(b.id));
          return (
            <div key={reg.id} className="bg-white border text-sm border-paa-navy/10 overflow-hidden mb-8">
              <div className="bg-green-100 p-3 font-bold text-center border-b text-green-900 uppercase tracking-widest text-xs">
                BOOKS FOR {reg.activity.name} ({reg.activity.city})
              </div>
              <div className="p-6">
                <table className="w-full text-left">
                  <thead className="border-b">
                    <tr>
                      <th className="pb-2 text-gray-500">Title</th>
                      <th className="pb-2 text-gray-500 text-center">Genre</th>
                      <th className="pb-2 text-gray-500 text-center">MRP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registeredBooks.map(b => (
                      <tr key={b.id} className="border-b last:border-0 border-gray-100">
                        <td className="py-3 font-bold text-paa-navy">{b.title}</td>
                        <td className="py-3 text-center">{b.genre}</td>
                        <td className="py-3 text-center text-green-700">â‚¹{b.mrp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function EventsDashboard() {
  const [invites, setInvites] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [listedBooks, setListedBooks] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [optInEventId, setOptInEventId] = useState<number | null>(null);
  const [settleEventId, setSettleEventId] = useState<number | null>(null);
  const [settlementData, setSettlementData] = useState<any[]>([]);
  const [selectedBooksToLink, setSelectedBooksToLink] = useState<{bookId: string, stock: string}[]>([]);

  useEffect(() => {
    fetchAuthorEvents();
  }, []);

  const fetchAuthorEvents = async () => {
    try {
       const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/events`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
       });
       setInvites(res.data.eventInvites || []);
       setBooks(res.data.books || []);
       setListedBooks(res.data.listedBooks || []);
       setPastEvents(res.data.pastEvents || []);
    } catch(err) {
       toast.error('Failed to load events');
    } finally {
       setLoading(false);
    }
  };


  const handleOpenSettlement = (eventId: number) => {
     const relevantBooks = listedBooks.filter((lb: any) => lb.eventId === eventId);
     setSettlementData(relevantBooks.map((lb: any) => ({
        eventBookId: lb.id,
        bookId: lb.bookId,
        listedStock: lb.listedStock,
        soldStock: lb.soldStock || 0,
        returnedStock: lb.returnedStock || 0,
        isSettled: lb.listedStock === (lb.soldStock || 0) + (lb.returnedStock || 0)
     })));
     setSettleEventId(eventId);
  };

  const handleSubmitSettlement = async (e: React.FormEvent) => {
     e.preventDefault();
     try {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/events/${settleEventId}/settle`, {
           settlements: settlementData
        }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
        toast.success("Inventory settled successfully! Remaining stock added back to your inventory.");
        setSettleEventId(null);
        fetchAuthorEvents(); // Reload to reflect settled status
        setTimeout(() => window.location.reload(), 1500); // Reload the whole page to update the root dashboardData state!
     } catch (err) {
        toast.error("Failed to submit settlement");
     }
  };

  useEffect(() => {
     const pending = invites.find((inv: any) => inv.optInStatus === 'Opted-In' && inv.event.status === 'Past' && listedBooks.some((lb: any) => lb.eventId === inv.eventId && lb.listedStock !== (lb.soldStock || 0) + (lb.returnedStock || 0)));
     if (pending && !settleEventId) {
        handleOpenSettlement(pending.eventId);
     }
  }, [invites, listedBooks]);

  const submitOptIn = async (eventId: number) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/events/${eventId}/opt-in`, {
        booksToLink: selectedBooksToLink
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success("Successfully opted in to Event!");
      setOptInEventId(null);
      fetchAuthorEvents();
    } catch (err) {
      toast.error('Opt-in failed');
    }
  };

  if (loading) return <div>Loading events...</div>;




  return (
    <div>

      {/* Settlement Modal */}
      {settleEventId && (
        <div className="fixed inset-0 bg-paa-navy/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-paa-navy/10 flex justify-between items-center bg-[#f8fafc]">
               <div>
                 <h2 className="text-xl font-serif text-paa-navy">Settle Event Inventory</h2>
                 <p className="text-xs text-gray-500 mt-1">Please enter the exact number of books sold and returned. (Sold + Returned must equal Listed)</p>
               </div>
               {invites.some((inv: any) => inv.eventId === settleEventId && inv.event.status === 'Past' && listedBooks.some((lb: any) => lb.eventId === settleEventId && lb.listedStock !== (lb.soldStock || 0) + (lb.returnedStock || 0))) ? null : (
                  <button onClick={() => setSettleEventId(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
               )}
            </div>
            <form onSubmit={handleSubmitSettlement} className="p-6 overflow-y-auto">
               <div className="space-y-4">
                  {settlementData.map((sd, idx) => {
                     const bookName = books.find((b: any) => b.id === sd.bookId)?.title || "Unknown Book";
                     return (
                        <div key={sd.eventBookId} className="p-4 border border-paa-navy/10 rounded bg-gray-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                           <div className="flex-1">
                              <h4 className="font-bold text-paa-navy text-sm">{bookName}</h4>
                              <p className="text-xs text-gray-500 mt-1 font-bold tracking-widest uppercase">Listed: {sd.listedStock}</p>
                           </div>
                           {sd.isSettled ? (
                              <div className="text-sm font-bold text-green-700 bg-green-50 px-4 py-2 border border-green-200">Already Settled</div>
                           ) : (
                              <div className="flex gap-4">
                                 <div className="w-24">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Sold</label>
                                    <input type="number" required min="0" max={sd.listedStock} value={sd.soldStock} onChange={e => {
                                       const sold = parseInt(e.target.value) || 0;
                                       if (sold > sd.listedStock) return;
                                       const newSd = [...settlementData];
                                       newSd[idx].soldStock = sold;
                                       newSd[idx].returnedStock = newSd[idx].listedStock - sold;
                                       setSettlementData(newSd);
                                    }} className="w-full p-2 text-sm border border-paa-navy/20 focus:border-paa-navy outline-none" />
                                 </div>
                                 <div className="w-24">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Returned</label>
                                    <input type="number" required min="0" max={sd.listedStock} value={sd.returnedStock} readOnly className="w-full p-2 text-sm border border-paa-navy/20 outline-none bg-gray-100 text-gray-500" />
                                 </div>
                              </div>
                           )}
                        </div>
                     )
                  })}
               </div>
               <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-paa-navy/10">
                  {invites.some((inv: any) => inv.eventId === settleEventId && inv.event.status === 'Past' && listedBooks.some((lb: any) => lb.eventId === settleEventId && lb.listedStock !== (lb.soldStock || 0) + (lb.returnedStock || 0))) ? null : (
                     <button type="button" onClick={() => setSettleEventId(null)} className="px-6 py-2 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-widest hover:bg-gray-200">Cancel</button>
                  )}
                  <button type="submit" disabled={settlementData.every(s => s.isSettled) || settlementData.some(s => s.listedStock !== s.soldStock + s.returnedStock)} className="px-6 py-2 bg-paa-navy text-paa-cream text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy disabled:opacity-50">Submit Settlement</button>
               </div>
            </form>
          </div>
        </div>
      )}

      <h1 className="text-4xl font-serif text-paa-navy mb-8 text-center uppercase">EVENTS ECOSYSTEM</h1>
      
      {invites.length === 0 ? (
         <div className="p-8 text-center text-gray-500 bg-white border border-gray-100 shadow-sm">
            You do not have any active event invitations right now.
         </div>
      ) : (
         <div className="grid md:grid-cols-2 gap-6">
            {[...invites].sort((a: any, b: any) => {
               if (a.event.status === 'Past' && b.event.status !== 'Past') return -1;
               if (a.event.status !== 'Past' && b.event.status === 'Past') return 1;
               return new Date(b.event.date).getTime() - new Date(a.event.date).getTime();
            }).map((invite) => {
               const evt = invite.event;
               const isOptedIn = invite.optInStatus === 'Opted-In';
               const myBooksForEvent = listedBooks.filter(lb => lb.eventId === evt.id);
               
               return (
                 <div key={invite.id} className={`bg-white border shadow-sm relative overflow-hidden ${isOptedIn ? 'border-green-300' : 'border-paa-navy/20'}`}>
                    <div className={`px-4 py-2 text-white font-bold text-xs uppercase tracking-widest flex justify-between items-center ${isOptedIn ? 'bg-green-600' : 'bg-blue-600'}`}>
                       <span>{evt.status}</span>
                       <span>{isOptedIn ? 'Opted In' : 'Action Required'}</span>
                    </div>
                    <div className="p-6">
                       <h4 className="text-xl font-serif font-medium text-paa-navy mb-3">{evt.name}</h4>
                       <p className="text-sm font-medium text-gray-600 mb-1">ðŸ“… {evt.date} &bull; {evt.duration}</p>
                       <p className="text-sm font-medium text-gray-600 mb-6">ðŸ“ {evt.location}</p>
                       
                       {isOptedIn ? (
                          <div className="bg-green-50 p-4 border border-green-200">
                             <p className="text-xs font-bold uppercase tracking-widest text-green-800 mb-2 border-b border-green-200 pb-1">Your Listed Inventory</p>
                             <ul className="space-y-1">
                               {myBooksForEvent.map(mb => {
                                  const bDetails = books.find(b => b.id === mb.bookId);
                                  return (
                                     <li key={mb.id} className="text-sm flex justify-between text-green-900">
                                        <span>{bDetails?.title || 'Unknown Book'}</span>
                                        <span className="font-bold">{mb.listedStock} units</span>
                                     </li>
                                  )
                               })}
                             </ul>
                             {evt.status === 'Past' && (
                                <button onClick={() => handleOpenSettlement(evt.id)} className="w-full mt-4 py-2 bg-paa-navy text-paa-cream font-bold text-xs uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors shadow">Settle Inventory</button>
                             )}
                          </div>
                       ) : (
                          <div className="pt-4 border-t border-gray-100">
                             {optInEventId === evt.id ? (
                               <div className="space-y-4">
                                  <p className="text-xs font-bold uppercase text-paa-navy mb-2">Select Books to List:</p>
                                  {books.map(b => {
                                     const isSelected = selectedBooksToLink.find(sb => sb.bookId === String(b.id));
                                     return (
                                        <div key={b.id} className="flex items-center gap-3 bg-gray-50 p-2 border border-gray-200">
                                           <input type="checkbox" checked={!!isSelected} onChange={(e) => {
                                              if (e.target.checked) setSelectedBooksToLink([...selectedBooksToLink, {bookId: String(b.id), stock: '5'}])
                                              else setSelectedBooksToLink(selectedBooksToLink.filter(sb => sb.bookId !== String(b.id)))
                                           }} />
                                           <span className="text-sm flex-1">{b.title}</span>
                                           {isSelected && (
                                              <input type="number" min="1" className="w-20 p-1 text-sm border outline-none" value={isSelected.stock} onChange={(e) => {
                                                 setSelectedBooksToLink(selectedBooksToLink.map(sb => sb.bookId === String(b.id) ? {...sb, stock: e.target.value} : sb))
                                              }} placeholder="Qty" />
                                           )}
                                        </div>
                                     );
                                  })}
                                  <div className="flex gap-2 pt-2">
                                     <button onClick={() => setOptInEventId(null)} className="flex-1 py-2 bg-gray-200 text-gray-700 text-xs font-bold uppercase transition-colors">Cancel</button>
                                     <button onClick={() => submitOptIn(evt.id)} className="flex-1 py-2 bg-paa-navy hover:bg-paa-navy/90 text-white text-xs font-bold uppercase transition-colors">Confirm</button>
                                  </div>
                               </div>
                             ) : (
                               <button onClick={() => { setOptInEventId(evt.id); setSelectedBooksToLink([]); }} className="w-full py-2 bg-paa-navy hover:bg-paa-navy/90 text-white text-xs font-bold uppercase tracking-widest transition-colors">
                                  Opt-In & List Books
                               </button>
                             )}
                          </div>
                       )}
                    </div>
                 </div>
               )
            })}
         </div>
      )}

      {/* Past Events History */}
      {pastEvents.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-serif text-paa-navy mb-6 text-center uppercase">Past Events History</h2>
          <div className="bg-white border border-paa-navy/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#1a1a2e] text-white text-xs uppercase tracking-widest">
                  <tr>
                    <th className="p-3 border-r border-white/10">S.No</th>
                    <th className="p-3 border-r border-white/10">Event Name</th>
                    <th className="p-3 border-r border-white/10">Date</th>
                    <th className="p-3 border-r border-white/10">Location</th>
                    <th className="p-3 border-r border-white/10 text-center">Authors Participated</th>
                    <th className="p-3 border-r border-white/10 text-center">Books Listed</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pastEvents.map((evt: any, idx: number) => (
                    <tr key={evt.id} className="border-b border-paa-navy/5 even:bg-gray-50">
                      <td className="p-3 border-r border-paa-navy/5 text-center text-gray-500">{idx + 1}</td>
                      <td className="p-3 border-r border-paa-navy/5 font-bold text-paa-navy">{evt.name}</td>
                      <td className="p-3 border-r border-paa-navy/5">{evt.date}</td>
                      <td className="p-3 border-r border-paa-navy/5">{evt.location}</td>
                      <td className="p-3 border-r border-paa-navy/5 text-center font-bold">{evt._count?.eventAuthors ?? 0}</td>
                      <td className="p-3 border-r border-paa-navy/5 text-center font-bold">{evt._count?.eventBooks ?? 0}</td>
                      <td className="p-3 text-center">
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded">Completed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// â”€â”€ PAA Catalogue Books List â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import fictionData from './data/fiction_catalogue.json';
import nonFictionData from './data/non_fiction_catalogue.json';
import { Search } from 'lucide-react';

function AuthorCatalogueTab() {
  const [search, setSearch] = useState('');

  const allCatalogueBooks = [
    ...(nonFictionData as any).non_fiction_catalogue.flatMap((entry: any) =>
      entry.books.map((b: any) => ({ ...b, authorName: entry.author, genre: "Non-Fiction", bio: entry.bio }))
    ),
    ...(fictionData as any).fiction_catalogue.flatMap((entry: any) =>
      entry.books.map((b: any) => ({ ...b, authorName: entry.author, genre: "Fiction/Children", bio: entry.bio }))
    ),
  ];

  const filtered = allCatalogueBooks.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.authorName.toLowerCase().includes(search.toLowerCase())
  );




  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-serif text-paa-navy">PAA Public Catalogue</h1>
      </div>
      <p className="text-sm text-gray-600 mb-6 max-w-3xl">
        This tab displays the static PAA book catalogue shown on the public website. 
        If your books are missing or incorrect here, you can verify it and contact the Operations team 
        to update the main JSON catalogue. Your personal uploaded books are managed in the Overview tab.
      </p>

      <div className="bg-white border text-sm border-paa-navy/10 overflow-hidden mb-12">
        <div className="p-4 border-b border-paa-navy/10 flex items-center justify-between">
           <h2 className="font-bold tracking-widest text-paa-navy uppercase">Static Catalogue Entries</h2>
           <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search Title or Author..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border rounded text-xs w-64 outline-none focus:border-paa-gold" 
              />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b text-paa-navy text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Author</th>
                <th className="p-4">Genre</th>
                <th className="p-4 text-center">MRP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 font-bold text-paa-navy">{b.title}</td>
                  <td className="p-4">{b.authorName}</td>
                  <td className="p-4 text-xs">{b.genre}</td>
                  <td className="p-4 text-center">â‚¹{parseFloat((b.mrp || "0").replace(/[^\d.]/g, "")) || 0}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">No books found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


