import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router';
import { Home, Check, AlertCircle, Upload, Loader2, LogOut, User, Bell, Search, ShoppingCart, BookOpen, CalendarIcon, BarChart3, Package, TrendingUp, TrendingDown, X, MapPin, Menu, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import { toast } from 'sonner';
import { bookCategories } from '../data/categories';
import qrCode from './data/qr_code.jpeg';
import { LivePosDashboard } from './LivePosDashboard';
import fictionData from './data/fiction_catalogue.json';
import nonFictionData from './data/non_fiction_catalogue.json';


export function AuthorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [extraDataState, setExtraDataState] = useState<any>({});
  const [hasNewQueries, setHasNewQueries] = useState(false);
  const [showReapply, setShowReapply] = useState(false);
  const [reapplyForm, setReapplyForm] = useState({ name: '', phone: '', bio: '', whatsapp: '', transactionId: '' });
  const [isSubmittingReapply, setIsSubmittingReapply] = useState(false);
  const [buttonStates, setButtonStates] = useState<{[key: string]: boolean}>({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const prevQueryAnsCountRef = useRef(0);
  const navigate = useNavigate();
  const location = useLocation();

  const unreadEventInvites = dashboardData?.eventInvites?.filter((inv: any) => inv.optInStatus === 'Pending') || [];
  const hasUnreadInvites = unreadEventInvites.length > 0;


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
    if (dashboardData?.authorProfile) {
      if (dashboardData.authorProfile.extraData) {
        setExtraDataState(dashboardData.authorProfile.extraData);
      }
      setReapplyForm({
        name: dashboardData.authorProfile.name || '',
        phone: dashboardData.authorProfile.phone || '',
        bio: dashboardData.authorProfile.bio || '',
        whatsapp: dashboardData.authorProfile.whatsapp || '',
        transactionId: dashboardData.authorProfile.transactionId || ''
      });
    }
  }, [dashboardData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen font-sans" style={{background:'#f5f5f3'}}>
        <div className="author-topnav">
          <div className="max-w-7xl mx-auto px-6 h-[60px] flex items-center gap-6">
            {[...Array(6)].map((_,i) => <div key={i} className="h-5 w-20 dash-skeleton rounded-lg"></div>)}
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[...Array(3)].map((_,i) => <div key={i} className="h-28 dash-skeleton rounded-2xl"></div>)}
          </div>
          <div className="h-72 dash-skeleton rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const { status, rejectionReason, name, email, phone, bio, photoUrl, transactionId, paymentScreenshot, extraData } = dashboardData.authorProfile;
  const dynamicFields = dashboardData.dynamicFields || [];

  const missingFields = dynamicFields.filter((f: any) => !extraDataState[f.name]);

  const handleSaveExtraData = async () => {
    setButtonStates(prev => ({...prev, saveExtra: true}));
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
      <div className="min-h-screen bg-paa-cream animate-fade-in-up font-sans flex items-center justify-center p-6">
        <div className="bg-white max-w-lg w-full p-8 rounded-3xl-2xl border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out">
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
          <button onClick={handleSaveExtraData} disabled={buttonStates.saveExtra} className="w-full py-3 bg-paa-navy text-paa-cream text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors disabled:opacity-50 rounded-full active:scale-95 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out">{buttonStates.saveExtra ? 'Saving...' : 'Save & Continue'}</button>
        </div>
      </div>
    );
  }

  if (status === 'Pending' || status === 'Rejected') {
    return (
      <div className="min-h-screen bg-paa-cream animate-fade-in-up font-sans flex items-center justify-center p-6">
        <div className="bg-white max-w-2xl w-full p-8 rounded-xl shadow border border-paa-navy/5">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-serif text-paa-navy">Author Application Status</h1>
            <button onClick={handleLogout} className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-bold uppercase rounded-full active:scale-95 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out"><LogOut size={16}/> Logout</button>
          </div>
          
          <div className={`p-4 mb-8 rounded-3xl-2xl border ${status === 'Pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <h2 className="text-xl font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              {status === 'Pending' ? <AlertCircle size={20} /> : <AlertCircle size={20} />}
              Status: {status}
            </h2>
            {status === 'Pending' ? (
              <p className="text-sm">Your author application has been submitted and is currently pending review by the admin team. You will be notified via email once approved. Check back here for updates.</p>
            ) : (
              <div>
                <p className="text-sm mb-2">Unfortunately, your author application has been rejected.</p>
                {rejectionReason && <p className="text-sm font-bold bg-white p-3 rounded-3xl-2xl border border-red-100">Reason: {rejectionReason}</p>}
                {!showReapply && (
                  <button onClick={() => setShowReapply(true)} className="mt-4 bg-paa-navy text-white px-4 py-2 rounded-3xl-2xl text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors">
                    Reapply with Correct Details
                  </button>
                )}
              </div>
            )}
          </div>

          {showReapply ? (
            <div className="mb-8 p-4 border border-paa-navy/20 rounded-3xl-2xl bg-gray-50">
              <h3 className="text-lg font-bold text-paa-navy border-b pb-2 mb-4 uppercase tracking-widest">Update Your Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Name</label>
                  <input className="w-full border p-2 rounded-3xl-2xl" value={reapplyForm.name} onChange={e => setReapplyForm({...reapplyForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Phone</label>
                  <input className="w-full border p-2 rounded-3xl-2xl" value={reapplyForm.phone} onChange={e => setReapplyForm({...reapplyForm, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">WhatsApp</label>
                  <input className="w-full border p-2 rounded-3xl-2xl" value={reapplyForm.whatsapp} onChange={e => setReapplyForm({...reapplyForm, whatsapp: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Transaction ID</label>
                  <input className="w-full border p-2 rounded-3xl-2xl" value={reapplyForm.transactionId} onChange={e => setReapplyForm({...reapplyForm, transactionId: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Bio</label>
                  <textarea rows={3} className="w-full border p-2 rounded-3xl-2xl" value={reapplyForm.bio} onChange={e => setReapplyForm({...reapplyForm, bio: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowReapply(false)} className="px-4 py-2 text-gray-500 text-sm">Cancel</button>
                <button 
                  disabled={isSubmittingReapply}
                  onClick={async () => {
                    setIsSubmittingReapply(true);
                    try {
                      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/reapply`, reapplyForm, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
                      toast.success('Application updated and resubmitted!');
                      setShowReapply(false);
                      fetchDashboardData(true);
                    } catch(err) {
                      toast.error('Failed to reapply');
                    } finally {
                      setIsSubmittingReapply(false);
                    }
                  }} 
                  className="bg-paa-navy text-white px-4 py-2 rounded-3xl-2xl text-xs font-bold uppercase hover:bg-paa-gold hover:text-paa-navy transition-colors disabled:opacity-50"
                >
                  {isSubmittingReapply ? 'Submitting...' : 'Submit Reapplication'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-bold text-paa-navy border-b pb-2 mb-4 uppercase tracking-widest">Submitted Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div><span className="text-gray-500 block text-xs uppercase font-bold">Name</span> {name}</div>
                <div><span className="text-gray-500 block text-xs uppercase font-bold">Email</span> {email}</div>
                <div><span className="text-gray-500 block text-xs uppercase font-bold">Phone</span> {phone}</div>
                <div><span className="text-gray-500 block text-xs uppercase font-bold">Transaction ID</span> {transactionId || 'N/A'}</div>
              </div>
              
              <div className="mb-4">
                <span className="text-gray-500 block text-xs uppercase font-bold mb-1">Bio</span>
                <p className="text-sm bg-gray-50 p-3 rounded-3xl-2xl">{bio}</p>
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
            </>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6">
            {photoUrl && (
              <div>
                <span className="text-gray-500 block text-xs uppercase font-bold mb-2">Profile Photo</span>
                <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${photoUrl}`} alt="Profile" className="w-24 h-24 object-cover rounded-3xl-2xl shadow" />
              </div>
            )}
            {paymentScreenshot && (
              <div>
                <span className="text-gray-500 block text-xs uppercase font-bold mb-2">Payment Screenshot</span>
                <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${paymentScreenshot}`} alt="Payment" className="w-full max-w-xs object-contain border rounded-3xl-2xl shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out" />
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

    <div className="min-h-screen font-sans" style={{background:'#f5f5f3'}}>
      {/* TOP NAV */}
      <div className="author-topnav">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 flex items-center h-[60px] justify-between w-full">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden mr-2 p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
               {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <img 
              src="/logo.png" 
              alt="PAA Logo" 
              className="h-8 w-auto object-contain" 
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} 
            />
            <div className="hidden w-8 h-8 rounded-full bg-[#b44d28] flex items-center justify-center text-white text-sm font-bold">
              P
            </div>
            <span className="font-serif font-bold text-lg tracking-tight hidden sm:block text-paa-navy ml-1">Author Portal</span>
          </div>

          {/* Right items */}
          <div className="flex items-center gap-2 relative shrink-0">
             <button onClick={() => setShowNotifications(!showNotifications)} className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 text-paa-gray-text hover:text-paa-navy transition-colors">
                <Bell size={16} />
                {hasUnreadInvites && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
             </button>
             {showNotifications && (
                <div className="dash-notification-panel">
                   <div className="px-4 py-3 border-b border-black/6 bg-gray-50 flex justify-between items-center">
                     <p className="text-xs font-bold uppercase tracking-widest text-paa-navy">Notifications</p>
                     <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-paa-navy"><X size={14}/></button>
                   </div>
                   <div className="max-h-64 overflow-y-auto">
                      {hasUnreadInvites ? unreadEventInvites.map((inv: any) => (
                         <button key={inv.id} onClick={() => { setShowNotifications(false); navigate('/dashboard/events'); }} className="w-full text-left px-4 py-3 hover:bg-black/3 border-b flex items-start gap-3 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-violet-500 mt-1.5 shrink-0"></div>
                            <div>
                               <p className="text-sm font-semibold text-paa-navy">New Event: {inv.event.name}</p>
                               <p className="text-xs text-paa-gray-text">You are invited to participate!</p>
                            </div>
                         </button>
                      )) : (
                         <div className="px-4 py-6 text-center text-paa-gray-text text-xs">No new notifications.</div>
                      )}
                   </div>
                </div>
             )}
             <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors whitespace-nowrap">
               <LogOut size={13}/> Logout
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6 relative">
        <div className={`author-profile-sidebar w-full md:w-[240px] p-4 flex-col gap-2 md:sticky md:top-[80px] h-fit bg-white border border-paa-navy/5 shadow-premium transition-all duration-500 ease-out z-20 md:z-0 ${isMobileMenuOpen ? 'flex absolute top-4 left-4 right-4 md:static shadow-2xl' : 'hidden md:flex'}`}>
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname === '/dashboard' ? 'active' : ''}`}><BarChart3 className="w-4 h-4"/> Overview</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/orders" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/orders') ? 'active' : ''}`}><ShoppingCart className="w-4 h-4"/> Web Orders</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/inventory" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/inventory') ? 'active' : ''}`}><BookOpen className="w-4 h-4"/> Inventory & Distribution</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/events" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/events') ? 'active' : ''}`}><CalendarIcon className="w-4 h-4"/> Events Ecosystem</Link>
        </div>

        <div className="flex-1 bg-white border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out p-6 md:p-8">
          <Routes>
            <Route path="/" element={<OverviewTab data={dashboardData} onRefresh={() => fetchDashboardData(true)} buttonStates={buttonStates} setButtonStates={setButtonStates} />} />
            <Route path="/orders" element={<AuthorOrders orders={dashboardData.authorOrders} onRefresh={() => fetchDashboardData(true)} />} />
            <Route path="/forms/*" element={<FormsWrapper />} />
            <Route path="/inventory" element={<InventoryPage books={dashboardData.authorProfile.books} onRefresh={() => fetchDashboardData(true)} dashboardData={dashboardData} />} />
            <Route path="/events" element={<EventsDashboard registrations={dashboardData.authorProfile.eventRegistrations} />} />
            <Route path="/pos/:eventId" element={<LivePosDashboard />} />
          </Routes>
        </div>
      </div>
    </div>
    </>
  );
}

function OverviewTab({ data, onRefresh, buttonStates, setButtonStates }: { data: any, onRefresh: () => void, buttonStates: any, setButtonStates: any }) {
  const [filter, setFilter] = useState('all');
  const [showAddBook, setShowAddBook] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    subtitle: '',
    genre: '',
    subcategory: '',
    subSubcategory: '',
    synopsis: '',
    pages: '',
    mrp: '',
    stock: '0',
    language: '',
    isbn: '',
    publisher: '',
    publicationDate: '',
    edition: '',
    format: ''
  });
  const [cover, setCover] = useState<File | null>(null);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [editCoverBookId, setEditCoverBookId] = useState<number | null>(null);
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [dismissedActions, setDismissedActions] = useState<string[]>([]);
  const navigate = useNavigate();

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
      mrp: `₹${b.mrp}`,
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
    { name: 'Events Part.', count: data.eventInvites?.filter((inv: any) => inv.optInStatus === 'Opted-In').length || 0 },
    { name: 'Total Web Orders', count: authorOrders.length || 0 },
    { name: 'Completed Orders', count: authorOrders.filter((o: any) => o.status === 'Completed').length || 0 },
  ];

  const completedOrders = authorOrders.filter((o: any) => o.status === 'Completed');
  const grossSales = completedOrders.reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const netEarnings = grossSales * 0.7;

  const successfulOrders = completedOrders.length;
  const toApproveOrders = authorOrders.filter((o: any) => o.status === 'Pending Verification' || o.status === 'Processing').length;
  const underDeliveryOrders = authorOrders.filter((o: any) => o.status === 'Dispatched').length;

  const actionItems: any[] = [];
  
  const unapprovedOrders = toApproveOrders;
  if (unapprovedOrders > 0 && !dismissedActions.includes('act-orders')) {
    actionItems.push({ id: 'act-orders', text: `Approve and fulfill ${unapprovedOrders} new web order${unapprovedOrders > 1 ? 's' : ''}`, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-[#eef2f6]', link: '/dashboard/orders' });
  }

  const unreadEventInvites = data.eventInvites?.filter((inv: any) => inv.optInStatus === 'Pending') || [];
  if (unreadEventInvites.length > 0 && !dismissedActions.includes('act-events')) {
    actionItems.push({ id: 'act-events', text: `You have been invited to ${unreadEventInvites.length} new event${unreadEventInvites.length > 1 ? 's' : ''}. Register now!`, icon: CalendarIcon, color: 'text-purple-600', bg: 'bg-purple-100', link: '/dashboard/events' });
  }

  const unsettledEvents = data.eventInvites?.filter((inv: any) => inv.optInStatus === 'Opted-In' && inv.event.status === 'Past' && data.listedBooks?.some((lb: any) => lb.eventId === inv.eventId && lb.listedStock !== (lb.soldStock || 0) + (lb.returnedStock || 0))) || [];
  if (unsettledEvents.length > 0 && !dismissedActions.includes('act-settle')) {
    actionItems.push({ id: 'act-settle', text: `Settle your inventory for ${unsettledEvents.length} past event${unsettledEvents.length > 1 ? 's' : ''}`, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100', link: '/dashboard/events' });
  }

  if (actionItems.length === 0) {
    actionItems.push({ id: 'act-none', text: 'All caught up! No pending actions.', icon: Check, color: 'text-gray-600', bg: 'bg-gray-100', link: '' });
  }

  const handleAddBook = async (e: React.FormEvent | null, addAnother: boolean = false) => {
    if (e) e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', newBook.title);
      formData.append('subtitle', newBook.subtitle);
      formData.append('genre', newBook.genre);
      let subGenre = newBook.subcategory;
      if (newBook.subSubcategory) subGenre += ' > ' + newBook.subSubcategory;
      if (subGenre) formData.append('subGenre', subGenre);
      formData.append('synopsis', newBook.synopsis);
      formData.append('mrp', newBook.mrp);
      formData.append('stock', newBook.stock);
      formData.append('language', newBook.language);
      formData.append('isbn', newBook.isbn);
      formData.append('publisher', newBook.publisher);
      formData.append('publicationDate', newBook.publicationDate);
      formData.append('edition', newBook.edition);
      formData.append('format', newBook.format);
      formData.append('pages', newBook.pages);
      if (cover) formData.append('cover', cover);

      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/books`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Book added successfully! Pending admin approval.');
      onRefresh();
      
      if (addAnother) {
        setNewBook({
          title: '',
          subtitle: '',
          genre: '',
          subcategory: '',
          subSubcategory: '',
          synopsis: '',
          pages: '',
          mrp: '',
          stock: '0',
          language: '',
          isbn: '',
          publisher: '',
          publicationDate: '',
          edition: '',
          format: ''
        });
        setCover(null);
      } else {
        setShowAddBook(false);
      }
    } catch (err) {
      toast.error('Failed to add book');
    } finally {
      setButtonStates(prev => ({...prev, addBook: false}));
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
    } finally {
      setButtonStates(prev => ({...prev, editProfile: false}));
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
    } finally {
      setButtonStates(prev => ({...prev, updateCover: false}));
    }
  };

  const handleEditBookOpen = (bookId: number) => {
    const book = authorBooks.find((b: any) => b.id === bookId);
    if (!book) return;
    setEditingBook({
      id: book.id,
      title: book.title,
      genre: book.genre,
      subGenre: book.subGenre || '',
      mrp: book.mrp,
      stock: book.stock,
      synopsis: book.synopsis || '',
      pages: book.pages || ''
    });
  };

  const handleEditBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    setButtonStates(prev => ({...prev, updateBook: true}));
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/books/${editingBook.id}`, {
        title: editingBook.title,
        genre: editingBook.genre,
        subGenre: editingBook.subGenre,
        mrp: parseFloat(editingBook.mrp),
        stock: parseInt(editingBook.stock),
        synopsis: editingBook.synopsis,
        pages: editingBook.pages
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Book updated and submitted for review!');
      setEditingBook(null);
      onRefresh();
    } catch (err) {
      toast.error('Failed to update book');
    } finally {
      setButtonStates(prev => ({...prev, updateBook: false}));
    }
  };




  return (
    <div>
      {/* ── Page Header ── */}
      <div className="flex justify-between items-start mb-7 flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-paa-gray-text mb-1">Author Portal</p>
          <h1 className="text-3xl font-serif font-bold text-paa-navy tracking-tight">My Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={handleEditProfileOpen} className="dash-btn dash-btn-ghost">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{display:'inline',marginRight:5}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit Profile
          </button>
          <button onClick={() => setShowAddBook(true)} className="dash-btn dash-btn-primary">
            + Add New Book
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[
          { label: 'Total Titles', value: authorBooks.length, colorClass: 'blue' },
          { label: 'Total Stock', value: authorBooks.reduce((a: number, b: any) => a + b.stock, 0), colorClass: 'green' },
          { label: 'Gross Sales', value: '\u20b9' + grossSales.toFixed(0), colorClass: 'amber' },
          { label: 'Net Earnings 70%', value: '\u20b9' + netEarnings.toFixed(0), colorClass: 'red' },
        ].map((kpi, i) => (
          <div key={i} className={`dash-kpi-card ${kpi.colorClass}`}>
            <p className="text-[10px] font-bold tracking-widest uppercase text-paa-gray-text mb-1">{kpi.label}</p>
            <h3 className="text-2xl font-bold text-paa-navy">{kpi.value}</h3>
          </div>
        ))}
      </div>



      {/* ── Pending Actions ── */}
      <div className="dash-panel flex flex-col mb-6">
        <div className="dash-panel-header">
           <h3 className="dash-panel-title">Pending Actions</h3>
        </div>
        <div className="p-5 space-y-5 overflow-auto max-h-[300px]">
          {actionItems.map((action) => {
            const Icon = action.icon;
            return (
            <div key={action.id} className="flex gap-4 items-center group">
              <div className="flex-1 flex items-center gap-4 cursor-pointer" onClick={() => { if (action.link) navigate(action.link); }}>
                <div className={`w-10 h-10 flex items-center justify-center shrink-0 ${action.bg} ${action.color} border border-paa-navy/5 rounded-full transition-transform group-hover:scale-110`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-paa-navy group-hover:underline">{action.text}</p>
                </div>
                {action.id !== 'act-none' && (
                  <ChevronDown className="w-4 h-4 text-paa-gray-text -rotate-90 group-hover:text-paa-navy transition-colors mr-2" />
                )}
              </div>
              {action.id !== 'act-none' && (
                <button onClick={(e) => { e.stopPropagation(); setDismissedActions([...dismissedActions, action.id]); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Dismiss">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )})}
        </div>
      </div>

      {/* ── Genre Filter Pills ── */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <span className="text-[10px] font-bold tracking-widest uppercase text-paa-gray-text mr-1">Filter:</span>
        {['all', 'Fiction', 'Non-Fiction', 'Children', 'Poetry'].map(g => (
          <button key={g} onClick={() => setFilter(g)} className={`dash-pill ${filter === g ? 'active' : ''}`}>
            {g === 'all' ? 'All Genres' : g}
          </button>
        ))}
      </div>

      {/* ── Edit Profile Modal ── */}
      {showEditProfile && (
        <div className="dash-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowEditProfile(false)}>
          <div className="dash-modal">
            <div className="dash-modal-header">
              <h3 className="text-sm font-bold uppercase tracking-widest text-paa-navy">Edit My Profile</h3>
              <button onClick={() => setShowEditProfile(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/6 text-paa-gray-text transition-colors">&#x2715;</button>
            </div>
            <div className="dash-modal-body">
            <h2 className="sr-only">Edit My Profile</h2>
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
                <button type="button" onClick={() => setShowEditProfile(false)} className="dash-btn dash-btn-ghost">Cancel</button>
                <button type="submit" disabled={buttonStates.editProfile} className="dash-btn dash-btn-primary disabled:opacity-50">{buttonStates.editProfile ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {editCoverBookId !== null && (
        <div className="dash-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setEditCoverBookId(null)}>
          <div className="dash-modal" style={{maxWidth:400}}>
            <div className="dash-modal-header">
              <h3 className="text-sm font-bold uppercase tracking-widest text-paa-navy">Update Book Cover</h3>
              <button onClick={() => { setEditCoverBookId(null); setNewCoverFile(null); }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/6 text-paa-gray-text transition-colors">&#x2715;</button>
            </div>
            <div className="dash-modal-body flex flex-col gap-4">
              <label className="text-[10px] font-bold tracking-widest uppercase text-paa-gray-text">Select New Cover Image</label>
              <input type="file" accept="image/*" className="dash-input text-xs" onChange={e => setNewCoverFile(e.target.files?.[0] || null)} />
              <div className="flex justify-end gap-2">
                <button onClick={() => { setEditCoverBookId(null); setNewCoverFile(null); }} className="dash-btn dash-btn-ghost">Cancel</button>
                <button onClick={() => handleUpdateCover(editCoverBookId)} disabled={buttonStates.updateCover} className="dash-btn dash-btn-primary disabled:opacity-50">{buttonStates.updateCover ? 'Uploading...' : 'Upload Cover'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showAddBook && (
        <div className="dash-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowAddBook(false)}>
          <div className="dash-modal max-w-lg">
            <div className="dash-modal-header">
              <h3 className="text-sm font-bold uppercase tracking-widest text-paa-navy">Add New Title</h3>
              <button onClick={() => setShowAddBook(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/6 text-paa-gray-text transition-colors">&#x2715;</button>
            </div>
            <div className="dash-modal-body max-h-[75vh] overflow-y-auto">
              <form onSubmit={handleAddBook} className="flex flex-col gap-4">
                
                {/* Book Title & Subtitle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="dash-label">Book Title *</label>
                    <input required className="dash-input" placeholder="Title" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="dash-label">Subtitle</label>
                    <input className="dash-input" placeholder="Subtitle" value={newBook.subtitle} onChange={e => setNewBook({...newBook, subtitle: e.target.value})} />
                  </div>
                </div>

                {/* Category, Subcategory, Specific Genre */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="dash-label">Category *</label>
                    <select required className="dash-input" value={newBook.genre} onChange={e => setNewBook({...newBook, genre: e.target.value, subcategory: '', subSubcategory: ''})}>
                      <option value="">Select Category</option>
                      {Object.keys(bookCategories).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="dash-label">Subcategory</label>
                    <select className="dash-input" disabled={!newBook.genre || Object.keys(bookCategories[newBook.genre as keyof typeof bookCategories] || {}).length === 0} value={newBook.subcategory} onChange={e => setNewBook({...newBook, subcategory: e.target.value, subSubcategory: ''})}>
                      <option value="">Select Sub</option>
                      {newBook.genre && Object.keys(bookCategories[newBook.genre as keyof typeof bookCategories] || {}).map(sc => <option key={sc} value={sc}>{sc}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="dash-label">Specific Genre</label>
                    <select className="dash-input" disabled={!newBook.subcategory || !((bookCategories[newBook.genre as keyof typeof bookCategories] as any)[newBook.subcategory] || []).length} value={newBook.subSubcategory} onChange={e => setNewBook({...newBook, subSubcategory: e.target.value})}>
                      <option value="">Select Genre</option>
                      {newBook.genre && newBook.subcategory && ((bookCategories[newBook.genre as keyof typeof bookCategories] as any)[newBook.subcategory] || []).map((ssc: string) => <option key={ssc} value={ssc}>{ssc}</option>)}
                    </select>
                  </div>
                </div>

                {/* Synopsis */}
                <div>
                  <label className="dash-label">Synopsis *</label>
                  <textarea required className="dash-input" rows={3} placeholder="Brief description of the book" value={newBook.synopsis} onChange={e => setNewBook({...newBook, synopsis: e.target.value})} />
                </div>

                {/* Language, Publisher, Publication Date */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="dash-label">Language *</label>
                    <input required className="dash-input" placeholder="e.g. English" value={newBook.language} onChange={e => setNewBook({...newBook, language: e.target.value})} />
                  </div>
                  <div>
                    <label className="dash-label">Publisher *</label>
                    <input required className="dash-input" placeholder="e.g. Self-Published" value={newBook.publisher} onChange={e => setNewBook({...newBook, publisher: e.target.value})} />
                  </div>
                  <div>
                    <label className="dash-label">Pub Date *</label>
                    <input required type="date" className="dash-input text-xs" value={newBook.publicationDate} onChange={e => setNewBook({...newBook, publicationDate: e.target.value})} />
                  </div>
                </div>

                {/* ISBN, Edition, Format */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="dash-label">ISBN</label>
                    <input className="dash-input" placeholder="e.g. 978..." value={newBook.isbn} onChange={e => setNewBook({...newBook, isbn: e.target.value})} />
                  </div>
                  <div>
                    <label className="dash-label">Edition</label>
                    <input className="dash-input" placeholder="e.g. 1st Edition" value={newBook.edition} onChange={e => setNewBook({...newBook, edition: e.target.value})} />
                  </div>
                  <div>
                    <label className="dash-label">Format *</label>
                    <select required className="dash-input" value={newBook.format} onChange={e => setNewBook({...newBook, format: e.target.value})}>
                      <option value="">Select Format</option>
                      <option value="Paperback">Paperback</option>
                      <option value="Hardcover">Hardcover</option>
                      <option value="Ebook">Ebook</option>
                    </select>
                  </div>
                </div>

                {/* Pages, MRP, Initial Stock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="dash-label">Pages</label>
                    <input type="number" className="dash-input" placeholder="250" value={newBook.pages} onChange={e => setNewBook({...newBook, pages: e.target.value})} />
                  </div>
                  <div>
                    <label className="dash-label">MRP (₹) *</label>
                    <input required type="number" className="dash-input" placeholder="Price" value={newBook.mrp} onChange={e => setNewBook({...newBook, mrp: e.target.value})} />
                  </div>
                  <div>
                    <label className="dash-label">Initial Stock</label>
                    <input type="number" className="dash-input" placeholder="Qty" value={newBook.stock} onChange={e => setNewBook({...newBook, stock: e.target.value})} />
                  </div>
                </div>

                {/* Cover upload */}
                <div>
                  <label className="dash-label">Cover Image *</label>
                  <input required key={newBook.title + newBook.mrp} type="file" accept="image/*" className="dash-input text-xs" onChange={e => setCover(e.target.files?.[0] || null)} />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                  <button type="button" onClick={() => setShowAddBook(false)} className="dash-btn dash-btn-ghost">Cancel</button>
                  <button type="button" onClick={(e) => { const f = e.currentTarget.closest('form'); if (f && f.checkValidity()) { handleAddBook(null, true); } else if (f) { f.reportValidity(); } }} className="dash-btn dash-btn-ghost">Save &amp; Add Another</button>
                  <button type="submit" disabled={buttonStates.addBook} className="dash-btn dash-btn-primary disabled:opacity-50">{buttonStates.addBook ? 'Adding...' : 'Add Book'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* ── Books Table ── */}
      <div className="dash-panel overflow-hidden mb-7">
        <div className="dash-panel-header">
          <h2 className="dash-panel-title">Your Titles</h2>
          <span className="dash-badge info">{filteredTitles.length} titles</span>
        </div>
        <div className="overflow-x-auto">
          <table className="dash-table">
            <thead><tr>
              <th>#</th><th>Cover</th><th>Title</th><th>Status</th>
              <th>Genre</th><th>MRP</th><th>Stock</th><th>Sold</th><th>Date</th><th>Cover</th>
            </tr></thead>
            <tbody>
              {filteredTitles.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-10 text-paa-gray-text italic text-sm">No titles for this filter.</td></tr>
              ) : filteredTitles.map((row: any, idx: number) => (
                <tr key={row.id}>
                  <td className="text-paa-gray-text text-xs">{idx + 1}</td>
                  <td>{authorBooks.find((b: any) => b.id === row.id)?.coverUrl
                    ? <img src={authorBooks.find((b: any) => b.id === row.id)?.coverUrl?.startsWith('http') ? authorBooks.find((b: any) => b.id === row.id)?.coverUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${authorBooks.find((b: any) => b.id === row.id)?.coverUrl}`} alt="cover" className="w-9 h-12 object-cover rounded-lg shadow-sm" />
                    : <div className="w-9 h-12 bg-gray-100 rounded-lg border flex items-center justify-center text-[9px] text-gray-400">No cover</div>}
                  </td>
                  <td className="font-semibold text-paa-navy">{row.title}</td>
                  <td><span className={`dash-badge ${row.status === 'Approved' ? 'approved' : row.status === 'Rejected' ? 'rejected' : 'pending'}`}>{row.status}</span>
                    {row.status === 'Rejected' && row.rejectionReason && <div className="mt-1 text-[10px] text-red-600">{row.rejectionReason}</div>}
                  </td>
                  <td className="text-paa-gray-text text-xs">{row.genre}</td>
                  <td className="font-semibold">₹{row.mrp}</td>
                  <td><span className={`font-bold ${row.stock < 10 ? 'text-red-500' : 'text-paa-navy'}`}>{row.stock}</span>{row.stock < 10 && <div className="text-[9px] text-red-400 font-bold">LOW</div>}</td>
                  <td className="font-semibold text-emerald-700">{row.sold}</td>
                  <td className="text-paa-gray-text text-xs whitespace-nowrap">{row.date}</td>
                  <td>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => { setEditCoverBookId(row.id); setNewCoverFile(null); }} className="dash-btn dash-btn-ghost text-[10px] px-2 py-1">Change Cover</button>
                      {row.status === 'Rejected' && (
                        <button onClick={() => handleEditBookOpen(row.id)} className="dash-btn dash-btn-primary bg-paa-gold hover:bg-yellow-500 text-paa-navy text-[10px] px-2 py-1">Edit & Reapply</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="grid lg:grid-cols-2 gap-5 mb-6">
        <div className="dash-panel">
          <div className="dash-panel-header"><h3 className="dash-panel-title">Books Sold per Title</h3></div>
          <div className="h-[250px] p-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={10} tick={{fill:'#71717A'}} />
                <YAxis fontSize={10} tick={{fill:'#71717A'}} />
                <Tooltip cursor={{fill:'rgba(24,24,27,0.03)'}} contentStyle={{borderRadius:10,border:'1px solid rgba(24,24,27,0.08)',fontSize:12}} />
                <Bar dataKey="sold" fill="#18181B" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="dash-panel">
          <div className="dash-panel-header"><h3 className="dash-panel-title">Activity Participation</h3></div>
          <div className="h-[250px] p-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" fontSize={10} tick={{fill:'#71717A'}} />
                <YAxis dataKey="name" type="category" width={90} fontSize={10} tick={{fill:'#71717A'}} />
                <Tooltip cursor={{fill:'rgba(24,24,27,0.03)'}} contentStyle={{borderRadius:10,border:'1px solid rgba(24,24,27,0.08)',fontSize:12}} />
                <Bar dataKey="count" fill="#C0A062" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Edit Book Modal (Reapply) ── */}
      {editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-paa-navy/60 p-4 backdrop-blur-sm">
          <div className="bg-white border border-paa-navy/5 shadow-xl w-full max-w-2xl rounded-2xl overflow-hidden">
            <div className="bg-paa-navy p-4 font-bold text-xs tracking-widest uppercase flex justify-between items-center text-white">
              Edit Book Details & Reapply
              <button type="button" onClick={() => setEditingBook(null)} className="hover:text-paa-gold">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleEditBookSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="dash-label">Title</label>
                    <input required type="text" className="dash-input" value={editingBook.title} onChange={e => setEditingBook({...editingBook, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="dash-label">Genre</label>
                    <select required className="dash-input" value={editingBook.genre} onChange={e => setEditingBook({...editingBook, genre: e.target.value})}>
                      <option value="">Select Genre</option>
                      <option value="Fiction">Fiction</option>
                      <option value="Non-Fiction">Non-Fiction</option>
                      <option value="Poetry">Poetry</option>
                      <option value="Children">Children</option>
                      <option value="Academic">Academic</option>
                    </select>
                  </div>
                  <div>
                    <label className="dash-label">Sub-Genre</label>
                    <input type="text" className="dash-input" value={editingBook.subGenre} onChange={e => setEditingBook({...editingBook, subGenre: e.target.value})} />
                  </div>
                  <div>
                    <label className="dash-label">Pages</label>
                    <input type="number" className="dash-input" value={editingBook.pages} onChange={e => setEditingBook({...editingBook, pages: e.target.value})} />
                  </div>
                  <div>
                    <label className="dash-label">MRP (₹)</label>
                    <input required type="number" className="dash-input" value={editingBook.mrp} onChange={e => setEditingBook({...editingBook, mrp: e.target.value})} />
                  </div>
                  <div>
                    <label className="dash-label">Initial Stock</label>
                    <input required type="number" className="dash-input" value={editingBook.stock} onChange={e => setEditingBook({...editingBook, stock: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="dash-label">Synopsis</label>
                  <textarea required className="dash-input" rows={4} value={editingBook.synopsis} onChange={e => setEditingBook({...editingBook, synopsis: e.target.value})}></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                  <button type="button" onClick={() => setEditingBook(null)} className="dash-btn dash-btn-ghost">Cancel</button>
                  <button type="submit" disabled={buttonStates.updateBook} className="dash-btn dash-btn-primary bg-paa-gold hover:bg-yellow-500 text-paa-navy disabled:opacity-50">
                    {buttonStates.updateBook ? 'Submitting...' : 'Submit & Reapply'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InventoryPage({ books, onRefresh, dashboardData }: { books: any[], onRefresh: () => void, dashboardData: any }) {
  const [newStocks, setNewStocks] = useState<{[key: number]: string}>({});
  const orders = dashboardData?.authorOrders || [];
  const listedBooks = dashboardData?.listedBooks || [];

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
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6 border-b border-paa-navy/5 pb-4">
        <div>
          <h2 className="text-2xl font-serif text-paa-navy tracking-tight">Inventory & Distribution</h2>
          <p className="text-sm text-paa-gray-text mt-1">Track your web orders, event distributions, and available stock levels.</p>
        </div>
      </div>

      {(() => {
        const totalWebSold = orders.filter((o: any) => o.status === 'Completed' || o.status === 'Dispatched' || o.status === 'Accepted').reduce((acc: number, curr: any) => acc + curr.quantity, 0);
        const totalEventSold = listedBooks.reduce((acc: number, curr: any) => acc + curr.soldStock, 0);
        const lowStockCount = books.filter(b => b.stock < 10).length;

        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-paa-navy/5 p-5 rounded-xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
               <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><TrendingUp size={24}/></div>
               <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Total Copies Sold</p>
                  <p className="text-2xl font-black text-paa-navy leading-none">{totalWebSold + totalEventSold}</p>
               </div>
            </div>
            <div className="bg-white border border-paa-navy/5 p-5 rounded-xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
               <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600"><ShoppingCart size={24}/></div>
               <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Web Channel Sales</p>
                  <p className="text-2xl font-black text-paa-navy leading-none">{totalWebSold}</p>
               </div>
            </div>
            <div className="bg-white border border-paa-navy/5 p-5 rounded-xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
               <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600"><CalendarIcon size={24}/></div>
               <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Event Channel Sales</p>
                  <p className="text-2xl font-black text-paa-navy leading-none">{totalEventSold}</p>
               </div>
            </div>
            <div className="bg-white border border-paa-navy/5 p-5 rounded-xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
               <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600"><AlertCircle size={24}/></div>
               <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Low Stock Alerts</p>
                  <p className="text-2xl font-black text-paa-navy leading-none">{lowStockCount}</p>
               </div>
            </div>
          </div>
        );
      })()}
      
      <div className="bg-white border border-paa-navy/5 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
             <thead className="bg-[#f0f4f8] text-paa-navy uppercase tracking-widest text-xs border-b border-paa-navy/5">
                <tr>
                   <th className="px-4 py-3 font-bold">Title</th>
                   <th className="px-4 py-3 font-bold text-center">Web Sold</th>
                   <th className="px-4 py-3 font-bold text-center">Events Listed</th>
                   <th className="px-4 py-3 font-bold text-center">Events Sold</th>
                   <th className="px-4 py-3 font-bold text-center">Current Stock</th>
                   <th className="px-4 py-3 font-bold">Manage Stock</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {books.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500 italic">No books listed in your inventory yet.</td></tr> : books.map((item, index) => {
                 const webSold = orders.filter((o: any) => o.bookTitle === item.title && (o.status === 'Completed' || o.status === 'Dispatched' || o.status === 'Accepted')).reduce((acc: number, curr: any) => acc + curr.quantity, 0);
                 const bookEvents = listedBooks.filter((lb: any) => lb.bookId === item.id);
                 const eventListed = bookEvents.reduce((acc: number, curr: any) => acc + curr.listedStock, 0);
                 const eventSold = bookEvents.reduce((acc: number, curr: any) => acc + curr.soldStock, 0);
                 const eventInvites = dashboardData?.eventInvites || [];
                 const resolveEventName = (eventId: number) => {
                    const inv = eventInvites.find((i: any) => i.eventId === eventId);
                    return inv?.event?.name || `Event #${eventId}`;
                 };
                 
                 return (
                 <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-paa-navy">{item.title}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">MRP: ₹{item.mrp}</p>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-green-700">{webSold}</td>
                    <td className="px-4 py-3 text-center text-gray-600 font-medium">{eventListed}</td>
                    <td className="px-4 py-3 text-center">
                       <span className="font-bold text-blue-700 block">{eventSold}</span>
                       {bookEvents.length > 0 && (
                         <div className="text-[10px] text-left mt-2 border-t border-gray-100 pt-1 space-y-1">
                           {bookEvents.map((be: any) => (
                             <div key={be.id} className="flex justify-between text-gray-500 gap-4">
                                <span className="truncate w-24 font-medium" title={resolveEventName(be.eventId)}>{resolveEventName(be.eventId)}</span>
                                <span title="Sold / Listed">{be.soldStock}/{be.listedStock}</span>
                             </div>
                           ))}
                         </div>
                       )}
                    </td>
                    <td className="px-4 py-3 text-center">
                       <div className="flex flex-col items-center">
                         <span className="font-bold text-lg text-paa-navy">{item.stock}</span>
                         {item.stock < 10 && (
                           <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 mt-1 border border-red-200">LOW STOCK</span>
                         )}
                       </div>
                    </td>
                    <td className="px-4 py-3">
                       <div className="flex items-center gap-2">
                         <input 
                           type="number" 
                           min="1"
                           className="dash-input w-20 text-center" 
                           placeholder="Qty"
                           value={newStocks[item.id] || ''}
                           onChange={(e) => setNewStocks({...newStocks, [item.id]: e.target.value})}
                         />
                         <button 
                           onClick={() => handleUpdateStock(item.id)}
                           disabled={!newStocks[item.id]}
                           className="dash-btn-primary px-4 py-2 disabled:opacity-50"
                         >
                           Add
                         </button>
                       </div>
                    </td>
                 </tr>
               )})}
             </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mt-6">
         <div className="bg-white p-6 border border-paa-navy/5 rounded-xl shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-paa-navy mb-4 border-b border-paa-navy/5 pb-2">Stock Distribution</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={books}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="stock"
                    nameKey="title"
                    label={({ name, percent }) => `${name.substring(0,10)}... (${(percent * 100).toFixed(0)}%)`}
                  >
                    {books.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#C0A062', '#1a1a2e', '#e2e8f0', '#94a3b8'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip wrapperClassName="shadow-premium border-none rounded-lg" />
                </PieChart>
              </ResponsiveContainer>
            </div>
         </div>
         
         <div className="flex flex-col gap-4">
             <div className="bg-white p-6 border border-paa-navy/5 rounded-xl shadow-sm flex items-center gap-5">
                 <div className="w-14 h-14 bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-bold text-2xl">
                    {books.filter(i => i.stock < 10).length}
                 </div>
                 <div>
                    <div className="font-bold text-paa-navy text-sm uppercase tracking-widest">Needs Restocking</div>
                    <div className="text-xs text-gray-500 mt-1">Titles with less than 10 copies available</div>
                 </div>
             </div>
             
             <div className="bg-white p-6 border border-paa-navy/5 rounded-xl shadow-sm flex items-center gap-5">
                 <div className="w-14 h-14 bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-2xl">
                    {books.reduce((acc, curr) => acc + curr.stock, 0)}
                 </div>
                 <div>
                    <div className="font-bold text-paa-navy text-sm uppercase tracking-widest">Total Copies</div>
                    <div className="text-xs text-gray-500 mt-1">Available across all titles in inventory</div>
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
      <div className="bg-white border border-paa-navy/5 overflow-hidden relative">
        {showDialog && (
           <div className="fixed inset-0 bg-paa-navy/80 z-50 flex items-center justify-center p-4">
              <div className="bg-white max-w-md w-full p-6 rounded-3xl-2xl shadow-xl max-h-[90vh] overflow-y-auto">
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
                   <p className="text-sm font-bold text-paa-navy mb-2">2. Payment (₹{selectedAct?.charges})</p>
                   {selectedAct?.charges > 0 ? (
                     <div className="border border-paa-navy/20 p-4 bg-gray-50 text-center">
                       <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=puneauthors@upi&pn=PuneAuthors&am=10" alt="QR Code" className="mx-auto mb-2 w-32 h-32" />
                       <p className="text-xs text-gray-500 mb-4">Scan QR to pay ₹{selectedAct.charges}</p>
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
                    <button onClick={confirmParticipation} disabled={isSubmitting} className="bg-paa-gold text-paa-navy px-6 py-2 rounded-3xl-2xl text-sm font-bold disabled:opacity-50 rounded-full active:scale-95 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out">
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
                const statusColor = row.type.includes('Event') ? 'bg-[#4a90e2]' : row.type.includes('Fair') ? 'bg-[#e74c3c]' : 'bg-[#43a047]';

                return (
                <tr key={row.id} className="border-b border-paa-navy/5 even:bg-gray-100">
                  <td className="p-3 border-r border-paa-navy/5 text-center bg-[#f0f4f8]">{index + 1}</td>
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
  const [rejectReasons, setRejectReasons] = useState<string[]>(['Item out of stock']);
  const [otherRejectReason, setOtherRejectReason] = useState('');

  const ORDER_REJECTION_REASONS = [
    'Item out of stock',
    'Inventory is damaged',
    'Customer address is unserviceable',
    'Pricing error',
    'Wrong edition requested'
  ];
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
    const reasons = [...rejectReasons];
    if (otherRejectReason.trim()) reasons.push(otherRejectReason.trim());
    if (reasons.length === 0) { alert('Please select or enter at least one reason.'); return; }
    
    const finalReason = reasons.join('; ');
    setLoadingAction(rejectItemId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/order-items/${rejectItemId}/author-reject`, { reason: finalReason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRejectItemId(null);
      setRejectReasons(['Item out of stock']);
      setOtherRejectReason('');
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
        <div className="fixed inset-0 bg-paa-navy/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-serif text-paa-navy mb-3">Reason for Rejection</h2>
            <p className="text-sm text-gray-500 mb-4">Please provide a reason to inform the customer.</p>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto bg-gray-50 p-3 border border-paa-navy/5">
                {ORDER_REJECTION_REASONS.map((reason) => (
                  <label key={reason} className="flex items-start gap-3 cursor-pointer text-sm font-medium text-paa-navy hover:text-paa-gold">
                    <input
                      type="checkbox"
                      className="mt-0.5 accent-paa-navy"
                      checked={rejectReasons.includes(reason)}
                      onChange={(e) => {
                        if (e.target.checked) setRejectReasons([...rejectReasons, reason]);
                        else setRejectReasons(rejectReasons.filter(r => r !== reason));
                      }}
                    />
                    {reason}
                  </label>
                ))}
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-2">Other (specify):</label>
                <input
                  type="text"
                  value={otherRejectReason}
                  onChange={(e) => setOtherRejectReason(e.target.value)}
                  placeholder="Enter additional reason..."
                  className="w-full border border-paa-navy/20 p-2 text-sm outline-none focus:border-paa-navy"
                />
              </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setRejectItemId(null); setRejectReasons(['Item out of stock']); setOtherRejectReason(''); }} className="px-4 py-2 text-sm text-gray-500 hover:text-paa-navy transition-colors font-bold uppercase tracking-widest">Cancel</button>
              <button onClick={handleRejectSubmit} disabled={loadingAction !== null} className="dash-btn-primary bg-red-600 hover:bg-red-700 disabled:opacity-50">Reject Order</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6 border-b border-paa-navy/5 pb-4">
        <div>
          <h2 className="text-2xl font-serif text-paa-navy tracking-tight">My Web Orders</h2>
          <p className="text-sm text-paa-gray-text mt-1">Manage pending orders and track dispatched shipments.</p>
        </div>
      </div>

      {/* ── Order Tracking KPIs ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="dash-kpi-card green" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
            <Check size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-paa-gray-text mb-1">Successful Orders</p>
            <h3 className="text-2xl font-bold text-paa-navy">{orders.filter((o: any) => o.status === 'Completed').length}</h3>
          </div>
        </div>
        <div className="dash-kpi-card amber" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-paa-gray-text mb-1">To Be Approved</p>
            <h3 className="text-2xl font-bold text-paa-navy">{orders.filter((o: any) => o.status === 'Pending Verification' || o.status === 'Processing').length}</h3>
          </div>
        </div>
        <div className="dash-kpi-card blue" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Package size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-paa-gray-text mb-1">Under Delivery</p>
            <h3 className="text-2xl font-bold text-paa-navy">{orders.filter((o: any) => o.status === 'Dispatched').length}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white border border-paa-navy/5 rounded-xl shadow-sm overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
             <thead className="bg-[#f0f4f8] text-paa-navy uppercase tracking-widest text-xs border-b border-paa-navy/5">
                <tr>
                   <th className="px-4 py-3 font-bold">Order Details</th>
                   <th className="px-4 py-3 font-bold">Buyer Information</th>
                   <th className="px-4 py-3 font-bold">Book Title</th>
                   <th className="px-4 py-3 font-bold text-center">Qty</th>
                   <th className="px-4 py-3 font-bold text-center">Amount</th>
                   <th className="px-4 py-3 font-bold text-center">Payment</th>
                   <th className="px-4 py-3 font-bold text-center">Status</th>
                   <th className="px-4 py-3 font-bold text-center">Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {orders.length === 0 ? <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500 italic">No orders received yet.</td></tr> : orders.map((ord, idx) => (
                 <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-paa-navy tracking-wide">ORD-{ord.orderId}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">{ord.date}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-paa-navy">{ord.customerName}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]" title={ord.address}>{ord.address}</p>
                      {ord.customerPhone && <p className="text-[10px] text-[#4a90e2] mt-0.5">{ord.customerPhone}</p>}
                    </td>
                    <td className="px-4 py-3 font-medium text-paa-navy max-w-[200px] truncate" title={ord.bookTitle}>{ord.bookTitle}</td>
                    <td className="px-4 py-3 text-center font-bold text-paa-navy">{ord.quantity}</td>
                    <td className="px-4 py-3 text-center font-bold text-paa-navy">₹{ord.amount}</td>
                    <td className="px-4 py-3 text-center">
                      {ord.paymentScreenshot ? (
                        <div className="flex flex-col items-center gap-1">
                          <a
                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${ord.paymentScreenshot}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-bold text-[#4a90e2] hover:text-paa-navy underline tracking-widest uppercase transition-colors"
                          >
                            View Receipt
                          </a>
                          {ord.paymentVerified && (
                            <span className="text-[10px] font-bold text-green-600 tracking-widest uppercase flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-100"><Check size={10}/> Verified</span>
                          )}
                        </div>
                      ) : <span className="text-[10px] text-gray-400 italic">No receipt</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                       <span className={`inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                         ord.status === 'Completed' ? 'bg-[#43a047] text-white border-[#4cae4c]'
                         : ord.status === 'Dispatched' ? 'bg-blue-100 text-blue-800 border-blue-200'
                         : ord.status === 'Accepted' ? 'bg-[#eef2f6] text-paa-navy border-[#8faadc]'
                         : ord.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200'
                         : 'bg-yellow-50 text-yellow-800 border-yellow-200'
                       }`}>
                         {ord.status}
                       </span>
                       {ord.status === 'Rejected' && ord.rejectionReason && (
                         <div className="mt-1 text-[10px] text-red-600 truncate max-w-[120px]" title={ord.rejectionReason}>Reason: {ord.rejectionReason}</div>
                       )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {/* Author must Approve / Reject any Pending order regardless of payment verification */}
                      {ord.status === 'Pending Verification' || ord.status === 'Pending' ? (
                        <div className="flex gap-2 items-center justify-center">
                          <button
                            onClick={() => handleApprove(ord.id)}
                            disabled={loadingAction === ord.id}
                            className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 rounded w-20"
                          >
                            {loadingAction === ord.id ? '...' : 'Approve'}
                          </button>
                          <button
                             onClick={() => { setRejectItemId(ord.id); setRejectReasons(['Item out of stock']); setOtherRejectReason(''); }}
                             disabled={loadingAction === ord.id}
                             className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 rounded w-20"
                           >
                             Reject
                           </button>
                        </div>
                      ) : null}
                      {/* Invoice button for all approved/dispatched orders */}
                      {(ord.status === 'Accepted' || ord.status === 'Dispatched' || ord.status === 'Completed') && (
                        <div className="flex flex-col gap-2 items-center">
                          {ord.status === 'Accepted' && (
                            <button
                              onClick={() => handleDispatch(ord.id)}
                              disabled={loadingAction === ord.id}
                              className="dash-btn-primary bg-[#4a90e2] hover:bg-[#357abd] py-1 px-3 w-20 disabled:opacity-50"
                            >
                              DISPATCH
                            </button>
                          )}
                          <button
                            onClick={() => generateAndPrintInvoice(ord.id)}
                            className="text-[10px] font-bold text-paa-navy hover:text-paa-gold uppercase tracking-widest transition-colors w-20"
                            title="Download printable delivery invoice"
                          >
                            📄 INVOICE
                          </button>
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
        <div className="flex gap-4 mb-8 border-b border-paa-navy/5 pb-4 overflow-x-auto">
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
        <div className="bg-white p-8 border border-paa-navy/5 max-w-2xl mx-auto">
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
                  <textarea name={field.name} required className="w-full p-3 border border-gray-300 rounded-3xl-2xl focus:border-paa-navy focus:outline-none" rows={4}></textarea>
                ) : field.type === 'select' ? (
                  <select name={field.name} required className="w-full p-3 border border-gray-300 rounded-3xl-2xl focus:border-paa-navy focus:outline-none bg-white">
                    <option value="">Select...</option>
                    {field.options?.map((opt: string, j: number) => <option key={j} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input type="text" name={field.name} required className="w-full p-3 border border-gray-300 rounded-3xl-2xl focus:border-paa-navy focus:outline-none" />
                )}
              </div>
            ))}
            <button type="submit" className="w-full bg-paa-navy text-paa-cream font-bold uppercase tracking-widest py-4 hover:bg-paa-gold transition-colors mt-8 rounded-full active:scale-95 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out">
              Submit Form
            </button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredForms.map((f: any) => (
            <div key={f.id} className="bg-white p-8 border border-paa-navy/5 flex flex-col items-start gap-4 hover:shadow-lg transition-shadow">
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

function EventsDashboard({ registrations }: any) {
  const [invites, setInvites] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [listedBooks, setListedBooks] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [optInEventId, setOptInEventId] = useState<number | null>(null);
  const [settleEventId, setSettleEventId] = useState<number | null>(null);
  const [settlementData, setSettlementData] = useState<any[]>([]);
  const [selectedBooksToLink, setSelectedBooksToLink] = useState<{bookId: string, stock: string}[]>([]);
  const [paymentScreenshotBlob, setPaymentScreenshotBlob] = useState<File | null>(null);
  const [catalogueEventData, setCatalogueEventData] = useState<any>(null);
  const [buttonStates, setButtonStates] = useState<{[key: string]: boolean}>({});

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
  const handleViewCatalogue = async (eventId: number) => {
     try {
         const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/events/${eventId}/catalogue`);
         
         const event = res.data.event;
         const listedBooks = res.data.catalogue;
         
         const authorsMap: any = {};
         let totalBooksListed = 0;
         
         listedBooks.forEach((eb: any) => {
             const aid = eb.authorId;
             if (!authorsMap[aid]) {
                 authorsMap[aid] = {
                     id: aid,
                     name: eb.author.name,
                     bio: eb.author.bio,
                     photoUrl: eb.author.photoUrl,
                     books: []
                 };
             }
             authorsMap[aid].books.push({
                 title: eb.book.title,
                 category: eb.book.genre || eb.book.category || 'Uncategorized',
                 mrp: eb.book.mrp,
                 listedStock: eb.listedStock
             });
             totalBooksListed += eb.listedStock;
         });
         
         setCatalogueEventData({
             event,
             totalAuthorsRegistered: Object.keys(authorsMap).length,
             totalBooksListed,
             authors: Object.values(authorsMap)
         });
     } catch (e) {
         toast.error("Failed to load catalogue");
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

  const [isSubmittingSettlement, setIsSubmittingSettlement] = useState(false);

  const handleSubmitSettlement = async (e: React.FormEvent) => {
     e.preventDefault();
     if (isSubmittingSettlement) return;
     setIsSubmittingSettlement(true);
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
     } finally {
        setIsSubmittingSettlement(false);
     }
  };

  useEffect(() => {
     const pending = invites.find((inv: any) => inv.optInStatus === 'Opted-In' && inv.event.status === 'Past' && listedBooks.some((lb: any) => lb.eventId === inv.eventId && lb.listedStock !== (lb.soldStock || 0) + (lb.returnedStock || 0)));
     if (pending && !settleEventId) {
        handleOpenSettlement(pending.eventId);
     }
  }, [invites, listedBooks]);

  const submitOptIn = async (eventId: number, evt: any) => {
    let calculatedFee = 0;
    if (evt.feeType === 'Flat Fee') calculatedFee = evt.registrationFee;
    else if (evt.feeType === 'Per Author') calculatedFee = evt.registrationFee;
    else if (evt.feeType === 'Per Title') calculatedFee = evt.registrationFee * selectedBooksToLink.length;

    if (calculatedFee > 0 && !paymentScreenshotBlob) {
      toast.error('Please upload your payment screenshot.');
      return;
    }

    setButtonStates(prev => ({...prev, ['optIn_' + eventId]: true}));
    try {
      const formData = new FormData();
      formData.append('booksToLink', JSON.stringify(selectedBooksToLink));
      if (paymentScreenshotBlob) {
        formData.append('paymentScreenshot', paymentScreenshotBlob);
      }

      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/events/${eventId}/opt-in`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Successfully opted in to Event!");
      setOptInEventId(null);
      setPaymentScreenshotBlob(null);
      fetchAuthorEvents();
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Opt-in failed';
      toast.error(msg);
    } finally {
      setButtonStates(prev => ({...prev, ['optIn_' + eventId]: false}));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="w-1/3 h-8 dash-skeleton rounded-lg mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 dash-skeleton rounded-2xl border border-gray-100 shadow-sm"></div>
          ))}
        </div>
      </div>
    );
  }




  return (
    <div>

      {/* Settlement Modal */}
      {settleEventId && (
        <div className="fixed inset-0 bg-paa-navy/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-8 border-b border-paa-navy/5 flex justify-between items-center bg-[#f8fafc]">
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
                        <div key={sd.eventBookId} className="p-4 border border-paa-navy/5 rounded-3xl-2xl bg-gray-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
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
               <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-paa-navy/5">
                  {invites.some((inv: any) => inv.eventId === settleEventId && inv.event.status === 'Past' && listedBooks.some((lb: any) => lb.eventId === settleEventId && lb.listedStock !== (lb.soldStock || 0) + (lb.returnedStock || 0))) ? null : (
                     <button type="button" onClick={() => setSettleEventId(null)} className="px-6 py-2 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-widest hover:bg-gray-200">Cancel</button>
                  )}
                  <button type="submit" disabled={isSubmittingSettlement || settlementData.every(s => s.isSettled) || settlementData.some(s => s.listedStock !== s.soldStock + s.returnedStock)} className="px-6 py-2 bg-paa-navy text-paa-cream text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy disabled:opacity-50">{isSubmittingSettlement ? 'Submitting...' : 'Submit Settlement'}</button>
               </div>
            </form>
          </div>
        </div>
      )}

      <h1 className="text-4xl font-serif text-paa-navy mb-8 text-center uppercase">EVENTS ECOSYSTEM</h1>
      
      {invites.length === 0 ? (
         <div className="p-8 text-center text-gray-500 bg-white border border-gray-100 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out">
            You do not have any active event invitations right now.
         </div>
      ) : (
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...invites].sort((a: any, b: any) => {
               if (a.event.status === 'Past' && b.event.status !== 'Past') return -1;
               if (a.event.status !== 'Past' && b.event.status === 'Past') return 1;
               return new Date(b.event.date).getTime() - new Date(a.event.date).getTime();
            }).map((invite) => {
               const evt = invite.event;
               const isOptedIn = invite.optInStatus === 'Opted-In';
               const isAwaitingApproval = invite.optInStatus === 'Awaiting Approval';
               const myBooksForEvent = listedBooks.filter(lb => lb.eventId === evt.id);
               
               return (
                 <div key={invite.id} className="bg-white border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out flex flex-col relative overflow-hidden h-full">
                    <div className={`${evt.status === 'Upcoming' ? 'bg-blue-600' : 'bg-gray-500'} px-4 py-2 text-white font-bold text-xs uppercase tracking-widest flex justify-between items-center z-10 relative`}>
                       <span>{evt.status}</span>
                       <div className="flex gap-2 items-center">
                         <span className="bg-white/20 px-2 py-0.5 rounded-3xl-2xl text-[10px]">
                            {isOptedIn ? 'Opted In' : (isAwaitingApproval ? 'Awaiting Approval' : 'Action Required')}
                         </span>
                       </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                       {evt.bannerUrl ? (
                         <div className="w-full h-32 mb-4 rounded-xl overflow-hidden shrink-0 border border-paa-navy/5 bg-gray-100">
                           <img src={`${import.meta.env.VITE_API_URL || "http://localhost:3001"}${evt.bannerUrl}`} alt="Event Poster" className="w-full h-full object-cover opacity-85" />
                         </div>
                       ) : (
                         <div className="w-full h-32 mb-4 rounded-xl overflow-hidden shrink-0 border border-paa-navy/5 flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100">
                            <CalendarIcon className="w-8 h-8 text-gray-300" />
                         </div>
                       )}
                       <h4 className="text-xl font-serif font-medium text-paa-navy mb-4">{evt.name}</h4>
                       <div className="space-y-3 mb-6 flex-1 text-sm font-medium text-paa-gray-text">
                          <p className="flex items-center gap-3"><CalendarIcon className="w-4 h-4 text-paa-navy/50"/> {evt.date} &bull; {evt.duration}</p>
                          <p className="flex items-center gap-3"><MapPin className="w-4 h-4 text-paa-navy/50"/> {evt.location}</p>
                       </div>

                       <div className="pt-4 border-t border-paa-navy/5 flex flex-col gap-2 mt-auto">
                          <button onClick={() => handleViewCatalogue(evt.id)} className="dash-btn dash-btn-ghost w-full justify-center border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                             View Participants Catalogue
                          </button>
                          
                          {isOptedIn && evt.status !== 'Past' && (
                             <button onClick={() => navigate(`/dashboard/pos/${evt.id}`)} className="dash-btn dash-btn-ghost w-full justify-center border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800">
                                Launch Live POS
                             </button>
                          )}
                       </div>
                       
                       {isOptedIn ? (
                          <div className="bg-green-50 p-4 border border-green-200 rounded-xl mt-4">
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
                                <button onClick={() => handleOpenSettlement(evt.id)} className="dash-btn dash-btn-primary w-full justify-center mt-4">Settle Inventory</button>
                             )}
                          </div>
                       ) : (
                          <div className="pt-4 border-t border-gray-100">
                             {optInEventId === evt.id ? (
                               <div className="space-y-4">
                                  <p className="text-xs font-bold uppercase text-paa-navy mb-2">Select Books to List:</p>
                                  {books.map(b => {
                                     const isSelected = selectedBooksToLink.find(sb => sb.bookId === String(b.id));
                                     const availableStock = b.stock ?? 0;
                                     const enteredQty = isSelected ? parseInt(isSelected.stock) || 0 : 0;
                                     const isOverStock = enteredQty > availableStock;
                                     return (
                                        <div key={b.id} className={`flex items-center gap-3 p-2 border rounded-lg ${isOverStock ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'}`}>
                                           <input type="checkbox" checked={!!isSelected} onChange={(e) => {
                                              if (e.target.checked) setSelectedBooksToLink([...selectedBooksToLink, {bookId: String(b.id), stock: String(Math.min(5, availableStock))}])
                                              else setSelectedBooksToLink(selectedBooksToLink.filter(sb => sb.bookId !== String(b.id)))
                                           }} disabled={availableStock === 0} />
                                           <div className="flex-1 min-w-0">
                                              <span className="text-sm block truncate">{b.title}</span>
                                              <span className={`text-[10px] font-bold uppercase tracking-wider ${availableStock === 0 ? 'text-red-500' : availableStock < 10 ? 'text-orange-500' : 'text-green-600'}`}>
                                                 {availableStock === 0 ? 'Out of stock' : `${availableStock} available`}
                                              </span>
                                           </div>
                                           {isSelected && (
                                              <div className="flex flex-col items-end gap-1">
                                                 <input
                                                    type="number" min="1" max={availableStock}
                                                    className={`w-20 p-1 text-sm border outline-none rounded ${isOverStock ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-300'}`}
                                                    value={isSelected.stock}
                                                    onChange={(e) => {
                                                       setSelectedBooksToLink(selectedBooksToLink.map(sb => sb.bookId === String(b.id) ? {...sb, stock: e.target.value} : sb))
                                                    }}
                                                    placeholder="Qty"
                                                 />
                                                 {isOverStock && (
                                                    <span className="text-[10px] text-red-600 font-bold">Exceeds stock!</span>
                                                 )}
                                              </div>
                                           )}
                                        </div>
                                     );
                                  })}
                                  {(() => {
                                      let calculatedFee = 0;
                                      if (evt.feeType === 'Flat Fee') calculatedFee = evt.registrationFee;
                                      else if (evt.feeType === 'Per Author') calculatedFee = evt.registrationFee;
                                      else if (evt.feeType === 'Per Title') calculatedFee = evt.registrationFee * selectedBooksToLink.length;

                                      if (calculatedFee > 0) {
                                         return (
                                            <div className="bg-orange-50 p-4 border border-orange-200 rounded-3xl-2xl mt-4">
                                               <p className="text-sm font-bold text-orange-900 mb-2">Registration Fee: ₹{calculatedFee}</p>
                                               <p className="text-xs text-orange-800 mb-4">Please pay the registration fee using the QR code below and upload a screenshot of the successful payment.</p>
                                               
                                               <div className="flex flex-col items-center mb-4">
                                                  <img src={qrCode} alt="Payment QR" className="w-32 h-32 rounded-3xl-2xl border shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out mb-2" />
                                                  <p className="text-xs font-bold text-gray-600">Scan to pay ₹{calculatedFee}</p>
                                               </div>

                                               <div>
                                                  <label className="text-[10px] font-bold uppercase tracking-widest text-paa-navy mb-1 block">Upload Payment Screenshot *</label>
                                                  <input type="file" accept="image/*" className="w-full border border-gray-300 rounded-lg p-2 text-xs outline-none bg-white focus:border-paa-navy" onChange={(e) => {
                                                     if (e.target.files && e.target.files[0]) {
                                                        setPaymentScreenshotBlob(e.target.files[0]);
                                                     } else {
                                                        setPaymentScreenshotBlob(null);
                                                     }
                                                  }} />
                                               </div>
                                            </div>
                                         );
                                      }
                                      return null;
                                   })()}
                                   <div className="flex gap-2 pt-2 mt-4">
                                      <button onClick={() => { setOptInEventId(null); setPaymentScreenshotBlob(null); }} className="dash-btn dash-btn-ghost flex-1 justify-center border-gray-300 text-gray-600">Cancel</button>
                                      <button
                                         onClick={() => submitOptIn(evt.id, evt)}
                                         disabled={buttonStates['optIn_' + evt.id] || selectedBooksToLink.length === 0 || selectedBooksToLink.some(sb => { const book = books.find(b => String(b.id) === sb.bookId); return parseInt(sb.stock) > (book?.stock ?? 0); })}
                                         className="dash-btn dash-btn-primary flex-1 justify-center disabled:opacity-50"
                                      >
                                         {buttonStates['optIn_' + evt.id] ? 'Confirming...' : 'Confirm'}
                                      </button>
                                   </div>
                               </div>
                             ) : (
                               <button onClick={() => { setOptInEventId(evt.id); setSelectedBooksToLink([]); setPaymentScreenshotBlob(null); }} className="dash-btn dash-btn-primary w-full justify-center">
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
          <h2 className="text-2xl font-serif text-paa-navy mb-6 tracking-tight">Past Events History</h2>
          <div className="bg-white border border-paa-navy/5 rounded-xl shadow-sm overflow-hidden mb-12">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#f0f4f8] text-paa-navy uppercase tracking-widest text-xs border-b border-paa-navy/5">
                  <tr>
                    <th className="px-4 py-3 font-bold">Event Name</th>
                    <th className="px-4 py-3 font-bold">Date & Location</th>
                    <th className="px-4 py-3 font-bold text-center">Authors Participated</th>
                    <th className="px-4 py-3 font-bold text-center">Books Listed</th>
                    <th className="px-4 py-3 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pastEvents.map((evt: any, idx: number) => (
                    <tr key={evt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-paa-navy">{evt.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">EVT-{evt.id}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-paa-navy">{evt.date}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]" title={evt.location}>{evt.location}</p>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-paa-navy">{evt._count?.eventAuthors ?? 0}</td>
                      <td className="px-4 py-3 text-center font-bold text-paa-navy">{evt._count?.eventBooks ?? 0}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border border-gray-200">Completed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {catalogueEventData && (
        <div className="fixed inset-0 bg-paa-navy/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-3xl-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-8 border-b border-paa-navy/5 flex justify-between items-center bg-[#f8fafc]">
              <h2 className="text-2xl font-serif text-paa-navy">Event Participants Catalogue</h2>
              <button onClick={() => setCatalogueEventData(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={24} className="text-gray-500" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
               <div className="text-center mb-6">
                  <h3 className="text-2xl font-serif text-paa-navy">{catalogueEventData.event.name}</h3>
                  <p className="text-sm font-medium text-gray-500">{catalogueEventData.event.date} • {catalogueEventData.event.location}</p>
               </div>
               
               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-3xl-2xl text-center border border-blue-100">
                     <p className="text-xs font-bold uppercase tracking-widest text-blue-800 mb-1">Authors Participating</p>
                     <p className="text-3xl font-black text-paa-navy">{catalogueEventData.totalAuthorsRegistered}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-3xl-2xl text-center border border-green-100">
                     <p className="text-xs font-bold uppercase tracking-widest text-green-800 mb-1">Total Books Listed</p>
                     <p className="text-3xl font-black text-paa-navy">{catalogueEventData.totalBooksListed}</p>
                  </div>
               </div>

               <div>
                  <h4 className="text-lg font-serif text-paa-navy mb-4 border-b border-paa-navy/5 pb-2">Author Catalogue</h4>
                  <div className="space-y-6">
                     {catalogueEventData.authors.map((author: any) => (
                        <div key={author.id} className="border border-gray-200 rounded-3xl-2xl p-4 bg-white shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out">
                           <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                 {author.photoUrl ? <img src={author.photoUrl} alt={author.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={24} /></div>}
                              </div>
                              <div>
                                 <h5 className="font-bold text-paa-navy text-lg">{author.name}</h5>
                                 <p className="text-xs text-gray-500 line-clamp-1">{author.bio || 'No bio available.'}</p>
                              </div>
                           </div>
                           <div className="bg-gray-50 rounded-3xl-2xl border border-gray-200 p-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Books Showcased</p>
                              <div className="space-y-2">
                                 {author.books.map((b: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                       <div>
                                          <span className="font-medium text-paa-navy">{b.title}</span>
                                          <span className="ml-2 text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded-3xl-2xl">{b.category}</span>
                                       </div>
                                       <span className="text-xs font-bold text-gray-400">{b.listedStock} Copies</span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}




