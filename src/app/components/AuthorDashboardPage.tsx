import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router';
import { Home, Check, AlertCircle, Upload, Download, Loader2, LogOut, User, Bell, Search, ShoppingCart, BookOpen, CalendarIcon, BarChart3, Package, TrendingUp, TrendingDown, X, MapPin, Menu, ChevronDown, ChevronUp, DollarSign, CheckCircle2, FileText, Image as ImageIcon, Star, Plus, Minus, Eye, Edit2, Mail, Phone, Clock, Trash2, MessageSquare, ExternalLink, Send } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import { toast } from 'sonner';
import { bookCategories } from '../data/categories';
import qrCode from './data/qr_code.jpeg';
import { LivePosDashboard } from './LivePosDashboard';
import fictionData from './data/fiction_catalogue.json';
import nonFictionData from './data/non_fiction_catalogue.json';
import { AuthorRegistrationPage } from './AuthorRegistrationPage';
import { NavBar } from './NavBar';
import { Footer } from './Footer';
import { QueryThreadDisplay } from './QueryThreadDisplay';
import { AuthorDonationsTab } from './AuthorDonationsTab';

export function AuthorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [extraDataState, setExtraDataState] = useState<any>({});
  const [hasNewQueries, setHasNewQueries] = useState(false);
  const [showReapply, setShowReapply] = useState(false);
  const [reapplyDone, setReapplyDone] = useState(false);
  const [reapplyForm, setReapplyForm] = useState({
    name: '',
    penName: '',
    phone: '',
    whatsapp: '',
    bio: '',
    transactionId: '',
    city: '',
    state: '',
    address: '',
    aadharNumber: '',
    qualification: '',
    age: '',
    experience: '',
    skills: '',
    hobbies: '',
    instagram: '',
    facebook: ''
  });
  const [isSubmittingReapply, setIsSubmittingReapply] = useState(false);
  const [buttonStates, setButtonStates] = useState<{ [key: string]: boolean }>({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedToastId, setDismissedToastId] = useState<string | null>(() => localStorage.getItem('paa_dismissed_toast'));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [fineScreenshot, setFineScreenshot] = useState<File | null>(null);
  const [isSubmittingFine, setIsSubmittingFine] = useState(false);
  const [showFineModal, setShowFineModal] = useState(false);
  const prevQueryAnsCountRef = useRef(0);
  const navigate = useNavigate();

  const unreadEventInvites = dashboardData?.eventInvites?.filter((inv: any) => inv.optInStatus === 'Pending') || [];
  const notifications = dashboardData?.notifications || [];
  const hasUnread = unreadEventInvites.length > 0 || notifications.length > 0;


  const fetchQueriesAlert = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/queries`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const answeredCount = res.data.filter((q: any) => q.status === 'Answered').length;
      if (prevQueryAnsCountRef.current > 0 && answeredCount > prevQueryAnsCountRef.current && !location.pathname.includes('/queries')) {
        setHasNewQueries(true);
      }
      prevQueryAnsCountRef.current = answeredCount;
    } catch (err) { }
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
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        // Author profile doesn't exist yet, redirect to complete registration
        navigate('/register');
      } else {
        toast.error('Failed to load dashboard data');
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayFine = async () => {
    if (!fineScreenshot) return toast.error('Please upload a screenshot of your payment');
    setIsSubmittingFine(true);
    try {
      const formData = new FormData();
      formData.append('paymentScreenshot', fineScreenshot);
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/fine/pay`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Payment submitted for review!');
      setFineScreenshot(null);
      await fetchDashboardData(true);
    } catch (err) {
      toast.error('Failed to submit payment');
    } finally {
      setIsSubmittingFine(false);
    }
  };


  // Auto-refresh mechanism
  useEffect(() => {
    const fetchCurrentTabData = async () => {
      setIsRefreshing(true);
      try {
        await fetchDashboardData();
      } finally {
        setTimeout(() => setIsRefreshing(false), 800);
      }
    };

    // Refresh immediately when route/tab changes
    fetchCurrentTabData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchCurrentTabData, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);


  useEffect(() => {
    if (dashboardData?.authorProfile) {
      if (dashboardData.authorProfile.extraData) {
        setExtraDataState(dashboardData.authorProfile.extraData);
      }
      setReapplyForm(prev => ({
        ...prev,
        name: dashboardData.authorProfile.name || '',
        phone: dashboardData.authorProfile.phone || '',
        whatsapp: dashboardData.authorProfile.whatsapp || '',
        bio: dashboardData.authorProfile.bio || '',
        penName: dashboardData.authorProfile.penName || '',
        city: dashboardData.authorProfile.city || '',
        state: dashboardData.authorProfile.state || '',
        address: dashboardData.authorProfile.address || '',
        aadharNumber: dashboardData.authorProfile.aadharNumber || '',
        qualification: dashboardData.authorProfile.qualification || '',
        institution: dashboardData.authorProfile.institution || '',
        subject: dashboardData.authorProfile.subject || '',
        age: dashboardData.authorProfile.age || '',
        experience: dashboardData.authorProfile.experience || '',
        skills: dashboardData.authorProfile.skills || '',
        hobbies: dashboardData.authorProfile.hobbies || '',
        instagram: dashboardData.authorProfile.instagram || '',
        facebook: dashboardData.authorProfile.facebook || '',
        linkedin: (() => {
          try {
            return JSON.parse(dashboardData.authorProfile.extraData || '{}').linkedin || '';
          } catch {
            return '';
          }
        })(),
        transactionId: dashboardData.authorProfile.transactionId || ''
      }));
    }
  }, [dashboardData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen font-sans" style={{ background: '#f5f5f3' }}>
        <div className="author-topnav">
          <div className="max-w-7xl mx-auto px-6 h-[60px] flex items-center gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-5 w-20 dash-skeleton rounded-lg"></div>)}
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => <div key={i} className="h-28 dash-skeleton rounded-2xl"></div>)}
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
    setButtonStates(prev => ({ ...prev, saveExtra: true }));
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
                  <input type="number" className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" value={extraDataState[f.name] || ''} onChange={e => setExtraDataState({ ...extraDataState, [f.name]: e.target.value })} />
                ) : f.type === 'date' ? (
                  <input type="date" className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" value={extraDataState[f.name] || ''} onChange={e => setExtraDataState({ ...extraDataState, [f.name]: e.target.value })} />
                ) : (
                  <input type="text" className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" value={extraDataState[f.name] || ''} onChange={e => setExtraDataState({ ...extraDataState, [f.name]: e.target.value })} />
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
    if (showReapply) {
      return (
        <div className="flex flex-col min-h-screen">
          <NavBar />
          <AuthorRegistrationPage
            initialData={dashboardData?.authorProfile}
            isReapply={true}
            onReapplySuccess={() => {
              setReapplyDone(true);
              setShowReapply(false);
              fetchDashboardData(true);
            }}
          />
        </div>
      );
    }

    if (reapplyDone) {
      return (
        <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
          <NavBar />
          <main className="flex-1 flex items-center justify-center p-6 py-20">
            <div className="bg-white max-w-md w-full p-10 rounded-3xl shadow-premium border border-paa-navy/5 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-100">
                <Check className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="font-serif text-2xl font-medium text-paa-navy mb-3">Reapplication Submitted!</h2>
              <p className="text-sm text-gray-500 leading-relaxed">Your updated application is now under review by our editorial team. We will notify you by email once a decision has been made (within 5–7 working days).</p>
            </div>
          </main>
        </div>
      );
    }

    return (
      <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
        <NavBar />
        <main className="flex-1 flex items-center justify-center p-6 py-20 animate-fade-in-up">
          <div className="bg-white max-w-lg w-full p-8 md:p-12 rounded-3xl-2xl shadow-premium border border-paa-navy/5 text-center relative overflow-hidden">
            {/* Background flourish */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-paa-gold/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-paa-navy/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative">
              <div className="flex justify-end mb-6">
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-red-600 hover:text-red-700 text-xs font-bold uppercase tracking-widest rounded-full transition-colors hover:bg-red-50 px-3 py-1.5"><LogOut size={14} /> Logout</button>
              </div>

              <div className="mb-6 flex justify-center">
                {status === 'Pending' ? (
                  <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center border border-yellow-200">
                    <AlertCircle className="w-10 h-10 text-yellow-500" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center border border-red-200">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                  </div>
                )}
              </div>

              <h1 className="text-3xl font-serif text-paa-navy mb-4">
                {status === 'Pending' ? 'Application Under Review' : 'Application Rejected'}
              </h1>

              <div className="mx-auto max-w-sm">
                {status === 'Pending' ? (
                  <p className="text-sm text-gray-600 leading-relaxed">Your author application has been submitted and is currently pending review by the admin team. You will be notified via email once approved. Check back here for updates.</p>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">Unfortunately, your author application has been rejected.</p>
                    {rejectionReason && (
                      <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-red-800 text-sm text-left mb-8 shadow-sm">
                        <strong className="uppercase tracking-widest text-[10px] block mb-1 opacity-80">Reason for Rejection</strong>
                        {rejectionReason}
                      </div>
                    )}
                    <button
                      onClick={() => setShowReapply(true)}
                      className="bg-paa-navy text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy shadow-premium hover:-translate-y-0.5 transition-all duration-300 w-full"
                    >
                      Edit & Reapply Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const fineDateStr = dashboardData?.authorProfile?.extraData?.fineDate;
  const fineAmount = dashboardData?.authorProfile?.extraData?.lateFines || 0;
  let isFineOverdue = false;
  if (fineDateStr && fineAmount > 0) {
    const diffDays = (new Date().getTime() - new Date(fineDateStr).getTime()) / (1000 * 3600 * 24);
    if (diffDays > 3) isFineOverdue = true;
  }

  let hasLateOrders = false;
  if (dashboardData?.authorOrders) {
    dashboardData.authorOrders.forEach((o: any) => {
      if ((o.status === 'Pending Verification' || o.status === 'Pending') && o.createdAt) {
        const hours = (new Date().getTime() - new Date(o.createdAt).getTime()) / (1000 * 3600);
        if (hours > 24) hasLateOrders = true;
      }
    });
  }

  return (
    <>
      {/* Late Delivery Fine Overlay */}
      {(isFineOverdue || showFineModal) && fineAmount > 0 && (
        <div className="fixed inset-0 bg-[#1a1a2e]/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-white p-8 rounded-3xl-2xl shadow-premium max-w-md w-full border border-red-100 text-center relative overflow-hidden animate-fade-in-up">
            {!isFineOverdue && (
              <button onClick={() => setShowFineModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                <X size={16} />
              </button>
            )}
            <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-paa-navy mb-2">{isFineOverdue ? 'Account Restricted' : 'Pay Late Fine'}</h2>
            <p className="text-sm text-gray-600 mb-6">You have an outstanding late delivery fine of <strong className="text-red-600">₹{dashboardData.authorProfile.extraData.lateFines}</strong>. {isFineOverdue ? 'Your dashboard access has been temporarily suspended until the fine is cleared.' : 'Please pay it to avoid dashboard suspension.'}</p>

            <div className="bg-orange-50 p-6 rounded-xl border border-orange-200 mb-6 relative">
              <img src={qrCode} alt="Payment QR" className="w-40 h-40 mx-auto rounded-xl shadow-sm mb-3 border border-orange-300" />
              <p className="text-xs font-bold text-orange-900 uppercase tracking-widest">Scan to pay ₹{dashboardData.authorProfile.extraData.lateFines}</p>
            </div>

            <div className="text-left mb-6">
              <label className="text-[10px] font-bold uppercase tracking-widest text-paa-navy mb-2 block">Upload Payment Screenshot *</label>
              <input type="file" accept="image/*" className="w-full border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-paa-navy bg-white" onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFineScreenshot(e.target.files[0]);
                } else {
                  setFineScreenshot(null);
                }
              }} />
            </div>

            <button onClick={handlePayFine} disabled={isSubmittingFine || !fineScreenshot} className="w-full dash-btn dash-btn-primary bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white border-none py-3">
              {isSubmittingFine ? 'Submitting...' : 'Submit Payment Screenshot'}
            </button>
          </div>
        </div>
      )}





      <div className="min-h-screen font-sans bg-paa-cream flex flex-col md:flex-row">

      {/* SIDEBAR — matches admin layout */}
      <aside className={`w-64 flex flex-col shrink-0 h-screen fixed md:sticky top-0 bg-paa-cream z-50 transform transition-transform duration-300 border-r border-paa-navy/5 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 md:p-6 h-20 flex items-center justify-between shrink-0 border-b border-paa-navy/5">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="PAA Logo" className="h-8 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
            <div className="hidden w-8 h-8 rounded-full bg-[#b44d28] flex items-center justify-center text-white text-sm font-bold">P</div>
            <span className="font-serif font-bold text-lg tracking-tight text-paa-navy ml-1">Author Portal</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 text-paa-navy"><X size={20} /></button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname === '/dashboard' ? 'active' : ''}`}><BarChart3 className="w-4 h-4 shrink-0" /> <span className="flex-1 truncate">Overview</span></Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/orders" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/orders') ? 'active' : ''}`}><ShoppingCart className="w-4 h-4 shrink-0" /> <span className="flex-1 truncate">Web Orders</span></Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/sales" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/sales') ? 'active' : ''}`}><TrendingUp className="w-4 h-4 shrink-0" /> <span className="flex-1 truncate">Sales Report</span></Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/inventory" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/inventory') ? 'active' : ''}`}><BookOpen className="w-4 h-4 shrink-0" /> <span className="flex-1 truncate">Inventory & Distribution</span></Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/events" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/events') ? 'active' : ''}`}><CalendarIcon className="w-4 h-4 shrink-0" /> <span className="flex-1 truncate">Events Ecosystem</span></Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/donations" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/donations') ? 'active' : ''}`}><MapPin className="w-4 h-4 shrink-0" /> <span className="flex-1 truncate">Library Donations</span></Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/reviews" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/reviews') ? 'active' : ''}`}><Star className="w-4 h-4 shrink-0" /> <span className="flex-1 truncate">Reviews & Ratings</span></Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/queries" className={`author-profile-nav-btn flex items-center gap-3 relative ${location.pathname.includes('/queries') ? 'active' : ''}`}><MessageSquare className="w-4 h-4 shrink-0" /> <span className="flex-1 truncate">Queries & Issues</span>{hasNewQueries && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 shadow-sm"></span>}</Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/gallery" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/gallery') ? 'active' : ''}`}><ImageIcon className="w-4 h-4 shrink-0" /> <span className="flex-1 truncate">Event Gallery</span></Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/profile" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/profile') ? 'active' : ''}`}><User className="w-4 h-4 shrink-0" /> <span className="flex-1 truncate">Profile Settings</span></Link>
        </nav>

        <div className="p-4 shrink-0">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-paa-navy/5 bg-white text-xs font-bold uppercase hover:bg-red-50 text-red-600 transition-colors rounded-full">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative" style={{ background: '#f5f5f3' }}>

        {/* Top Header — breadcrumb */}
        <header className="dash-header h-[68px] flex items-center justify-between px-6 md:px-8 shrink-0 relative z-50">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-paa-navy rounded-lg hover:bg-black/5 transition-colors mr-1">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="text-paa-gray-text">Author Portal</span>
              <span className="text-paa-navy/20">/</span>
              <span className="font-semibold text-paa-navy capitalize">{
                location.pathname === '/dashboard' ? 'Overview' :
                location.pathname.includes('/orders') ? 'Web Orders' :
                location.pathname.includes('/sales') ? 'Sales Report' :
                location.pathname.includes('/inventory') ? 'Inventory & Distribution' :
                location.pathname.includes('/events') ? 'Events Ecosystem' :
                location.pathname.includes('/donations') ? 'Library Donations' :
                location.pathname.includes('/reviews') ? 'Reviews & Ratings' :
                location.pathname.includes('/queries') ? 'Queries & Issues' :
                location.pathname.includes('/gallery') ? 'Event Gallery' :
                location.pathname.includes('/profile') ? 'Profile Settings' : 'Overview'
              }</span>
            </div>
          </div>
          <div className="flex items-center gap-2 relative shrink-0">
            <button onClick={() => { setShowNotifications(!showNotifications); }} className={`relative w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-black/8 text-paa-navy hover:bg-black/4 transition-colors ${hasUnread && dismissedToastId !== String(notifications[0]?.id || unreadEventInvites[0]?.id || 'toast') ? 'animate-pulse' : ''}`}>
              <Bell size={16} />
              {hasUnread && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>
            {hasUnread && !showNotifications && dismissedToastId !== String(notifications[0]?.id || unreadEventInvites[0]?.id || 'toast') && (
              <div className="animate-pulse" style={{ position: 'absolute', top: '100%', right: '100%', marginRight: 12, marginTop: -8, width: 280, background: '#1a1a2e', borderRadius: 12, padding: '12px 16px', color: '#fff', zIndex: 9999, display: 'flex', gap: 12, alignItems: 'flex-start', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => { setShowNotifications(true); const latestId = String(notifications[0]?.id || unreadEventInvites[0]?.id || 'toast'); setDismissedToastId(latestId); localStorage.setItem('paa_dismissed_toast', latestId); }}>
                  <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#3b82f6', marginBottom: 2 }}>New Message</p>
                  <p style={{ fontSize: 12, color: '#f3f4f6', lineHeight: 1.4 }}>{notifications[0]?.message || (unreadEventInvites.length > 0 ? `New Event: ${unreadEventInvites[0].event.name}` : 'You have unread notifications.')}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); const latestId = String(notifications[0]?.id || unreadEventInvites[0]?.id || 'toast'); setDismissedToastId(latestId); localStorage.setItem('paa_dismissed_toast', latestId); }} style={{ color: '#9ca3af', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}><X size={14} /></button>
                <div style={{ position: 'absolute', top: 12, right: -6, width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '6px solid #1a1a2e' }}></div>
              </div>
            )}
            {showNotifications && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 12, width: 340, background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', zIndex: 9999, overflow: 'hidden', transformOrigin: 'top right', animation: 'scaleIn 0.2s ease-out' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1a1a2e' }}>Notifications</p>
                  <button onClick={() => setShowNotifications(false)} style={{ color: '#9ca3af', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}><X size={14} /></button>
                </div>
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {hasUnread ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {unreadEventInvites.map((inv: any) => (
                        <button key={`inv-${inv.id}`} onClick={() => { setShowNotifications(false); navigate('/dashboard/events'); }} style={{ width: '100%', textAlign: 'left', padding: '16px 20px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', marginTop: 6, flexShrink: 0 }}></div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', marginBottom: 2 }}>New Event: {inv.event.name}</p>
                            <p style={{ fontSize: 12, color: '#6b6b80', lineHeight: 1.4 }}>You are invited to participate!</p>
                          </div>
                        </button>
                      ))}
                      {notifications.map((notif: any) => (
                        <div key={`notif-${notif.id}`} style={{ width: '100%', textAlign: 'left', padding: '16px 20px', background: 'transparent', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', marginTop: 6, flexShrink: 0 }}></div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', lineHeight: 1.4 }}>{notif.message}</p>
                            <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>{new Date(notif.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '32px 20px', textAlign: 'center', color: '#6b6b80', fontSize: 12 }}>No new notifications.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Warning Banners */}
        {(() => {
          const notifyDateStr = dashboardData?.authorProfile?.extraData?.lateNotificationDate;
          const fineAmt = dashboardData?.authorProfile?.extraData?.lateFines || 0;
          if (fineAmt === 0 && notifyDateStr && hasLateOrders) {
            const diffDays = (new Date().getTime() - new Date(notifyDateStr).getTime()) / (1000 * 3600 * 24);
            if (diffDays >= 0 && diffDays <= 3) {
              const daysLeft = Math.max(0, 3 - Math.floor(diffDays));
              return (
                <div className="bg-[#b44d28] text-white px-6 py-2.5 flex items-center justify-center gap-2 shadow-sm relative z-[100] border-b border-[#963c1e]">
                  <AlertCircle size={14} className="text-white/90" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/90">
                    Action Required: You have unaccepted late orders. {daysLeft} day(s) remaining to dispatch before catalogue suspension.
                  </span>
                </div>
              );
            }
          } else if (fineAmt > 0 && dashboardData?.authorProfile?.extraData?.fineDate) {
            const diffDays = (new Date().getTime() - new Date(dashboardData.authorProfile.extraData.fineDate).getTime()) / (1000 * 3600 * 24);
            if (diffDays >= 0 && diffDays <= 3) {
              const daysLeft = Math.max(0, 3 - Math.floor(diffDays));
              return (
                <div className="bg-[#1a1a2e] text-white px-6 py-2 flex items-center justify-between shadow-sm relative z-[100] border-b border-[#0f0f1c]">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} className="text-red-400" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-red-100">
                      Urgent: Outstanding late fine of ₹{fineAmt}. {daysLeft} day(s) remaining before account suspension.
                    </span>
                  </div>
                  <button onClick={() => setShowFineModal(true)} className="bg-red-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-colors shrink-0">
                    Pay Fine Now
                  </button>
                </div>
              );
            }
          }
          return null;
        })()}

        {(() => {
          const activeDonations = dashboardData?.activeDonations || [];
          const donationRegistrations = dashboardData?.authorProfile?.donationRegistrations || [];
          const unregisteredDonations = activeDonations.filter((ad: any) => !donationRegistrations.find((dr: any) => dr.announcementId === ad.id));
          if (unregisteredDonations.length > 0) {
            return (
              <div className="bg-gradient-to-r from-indigo-900 to-paa-navy text-white px-6 py-3 flex flex-col md:flex-row items-center justify-between shadow-sm relative z-[99] border-b border-indigo-950 gap-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-indigo-300" />
                  <span className="text-sm font-semibold tracking-wide text-indigo-50">
                    You have been invited to participate in a new Airport Library Donation Campaign.
                  </span>
                </div>
                <button onClick={() => navigate('/dashboard/donations')} className="bg-white text-paa-navy px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-indigo-50 transition-colors shrink-0 shadow-sm">
                  Register Now
                </button>
              </div>
            );
          }
          return null;
        })()}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <Routes>
            <Route path="/" element={<OverviewTab data={dashboardData} onRefresh={() => fetchDashboardData(true)} buttonStates={buttonStates} setButtonStates={setButtonStates} />} />
            <Route path="/orders" element={<AuthorOrders orders={dashboardData.authorOrders} onRefresh={() => fetchDashboardData(true)} dashboardData={dashboardData} />} />
            <Route path="/sales" element={<AuthorSalesReport data={dashboardData} />} />
            <Route path="/forms/*" element={<FormsWrapper />} />
            <Route path="/inventory" element={<InventoryPage onRefresh={() => fetchDashboardData(true)} dashboardData={dashboardData} />} />
            <Route path="/events" element={<EventsDashboard registrations={dashboardData.authorProfile.eventRegistrations} />} />
            <Route path="/donations" element={<AuthorDonationsTab dashboardData={dashboardData} onRefresh={() => fetchDashboardData(true)} />} />
            <Route path="/reviews" element={<AuthorReviews books={dashboardData.authorProfile.books} />} />
            <Route path="/gallery" element={<AuthorGallery dashboardData={dashboardData} />} />
            <Route path="/profile" element={<AuthorProfile data={dashboardData} onRefresh={() => fetchDashboardData(true)} buttonStates={buttonStates} setButtonStates={setButtonStates} />} />
            <Route path="/pos/:eventId" element={<LivePosDashboard />} />
            <Route path="/bundle-offers" element={<BundleOffersTab data={dashboardData} />} />
            <Route path="/queries" element={<AuthorQueries />} />
          </Routes>
        </div>
      </main>
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
    stock: '',
    language: '',
    isbn: '',
    publisher: '',
    publicationDate: '',
    edition: '',
    format: '',
    printFormat: '',
    purpose: ''
  });
  const [cover, setCover] = useState<File | null>(null);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [reapplyForm, setReapplyForm] = useState({ name: '', phone: '', whatsapp: '', bio: '', penName: '', city: '', state: '', address: '', aadharNumber: '', qualification: '', institution: '', subject: '', age: '', experience: '', skills: '', hobbies: '', instagram: '', facebook: '', transactionId: '', extraData: {} });
  const [editProfileForm, setEditProfileForm] = useState({ name: '', phone: '', whatsapp: '', bio: '', penName: '', city: '', state: '', instagram: '', facebook: '', linkedin: '', address: '', pincode: '', aadharNumber: '', qualification: '', institution: '', subject: '', age: '', experience: '', skills: '', hobbies: '', whyJoining: '' });
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [editCoverBookId, setEditCoverBookId] = useState<number | null>(null);
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [dismissedActions, setDismissedActions] = useState<string[]>(() => {
    const saved = localStorage.getItem('paa_author_dismissed');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedGalleryEvent, setSelectedGalleryEvent] = useState<any>(null);
  const [galleryUploadFile, setGalleryUploadFile] = useState<File | null>(null);
  const [galleryUploadCaption, setGalleryUploadCaption] = useState('');
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [showFineNotification, setShowFineNotification] = useState(true);
  const navigate = useNavigate();

  const authorProfile = data.authorProfile;
  const authorBooks = authorProfile.books;
  const authorOrders = data.authorOrders;

  const titlesData = authorBooks.map((b: any, index: number) => {
    const webSales = authorOrders.filter((o: any) => o.bookTitle === b.title && o.paymentVerified).reduce((acc: number, curr: any) => acc + curr.quantity, 0);
    const eventSales = (data.listedBooks || []).filter((lb: any) => lb.bookId === b.id).reduce((acc: number, curr: any) => acc + (curr.soldStock || 0), 0);
    const totalSold = webSales + eventSales;
    return {
      sno: index + 1,
      id: b.id,
      title: b.title,
      date: new Date(b.createdAt).toLocaleDateString('en-GB'),
      mrp: `₹${b.mrp}`,
      overpriced: b.overpriced ? 'Yes' : 'No',
      pub: 'Self-Published',
      genre: b.genre,
      sold: { total: totalSold, web: webSales, events: eventSales },
      status: b.status,
      rejectionReason: b.rejectionReason,
      stock: b.stock
    };
  });

  const filteredTitles = filter === 'all' ? titlesData : titlesData.filter((t: any) => t.genre === filter);

  const chartData = titlesData.map((t: any) => ({ name: t.title.substring(0, 15) + '...', sold: t.sold.total }));
  const webOrdersPieData = titlesData.filter((t: any) => t.sold.web > 0).map((t: any) => ({ name: t.title.substring(0, 15) + '...', value: t.sold.web }));

  const activityData = [
    { name: 'Events Part.', count: data.eventInvites?.filter((inv: any) => inv.optInStatus === 'Registered').length || 0 },
    { name: 'Total Web Orders', count: authorOrders.length || 0 },
    { name: 'Completed Orders', count: authorOrders.filter((o: any) => o.status === 'Completed').length || 0 },
  ];

  const completedOrders = authorOrders.filter((o: any) => o.paymentVerified);
  const webSalesAmount = completedOrders.reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const posSalesAmount = (data.posOrders || []).reduce((acc: number, o: any) => acc + (o.totalAmount || 0), 0);
  const grossSales = webSalesAmount + posSalesAmount;

  const lowStockCount = authorBooks.filter((b: any) => b.stock < 5).length;


  const successfulOrders = completedOrders.length;
  const avgOrderValue = completedOrders.length > 0 ? (webSalesAmount / completedOrders.length).toFixed(0) : '0';
  let totalDeliveryTime = 0;
  let deliveredCount = 0;
  authorOrders.forEach((o: any) => {
    if (o.status === 'Delivered' && o.dispatchedAt && o.deliveredAt) {
      const time = new Date(o.deliveredAt).getTime() - new Date(o.dispatchedAt).getTime();
      totalDeliveryTime += time;
      deliveredCount++;
    }
  });
  const avgDeliveryDays = deliveredCount > 0 ? (totalDeliveryTime / deliveredCount / (1000 * 3600 * 24)).toFixed(1) : 0;

  const toApproveOrders = authorOrders.filter((o: any) => o.status === 'Pending Verification' || o.status === 'Processing').length;
  const underDeliveryOrders = authorOrders.filter((o: any) => o.status === 'Dispatched').length;

  const donationRegistrations = data?.authorProfile?.donationRegistrations || [];
  const pendingRegistrations = donationRegistrations.filter((dr: any) => dr.status === 'Registered').length;
  const approvedDonations = donationRegistrations.filter((dr: any) => dr.status === 'Approved').length;
  const uniqueLibraries = new Set(donationRegistrations.filter((dr: any) => dr.announcement?.libraryId).map((dr: any) => dr.announcement.libraryId)).size;
  const totalBooksDonated = donationRegistrations.reduce((acc: number, curr: any) => 
    acc + (curr.books || []).reduce((bAcc: number, book: any) => bAcc + book.quantityDonated, 0), 0);

  const totalEventFees = (data.eventInvites || []).filter((inv: any) => inv.optInStatus === 'Registered').reduce((acc: number, inv: any) => {
    const evt = inv.event;
    if (!evt) return acc;
    if (evt.feeType === 'Flat Fee' || evt.feeType === 'Per Author') {
      return acc + (evt.registrationFee || 0);
    } else if (evt.feeType === 'Per Title') {
      const titlesCount = (data.listedBooks || []).filter((lb: any) => lb.eventId === evt.id).length;
      return acc + ((evt.registrationFee || 0) * titlesCount);
    }
    return acc;
  }, 0);
  const totalFeesPaid = 1000 + totalEventFees;

  const actionItems: any[] = [];

  const unapprovedOrders = toApproveOrders;
  if (unapprovedOrders > 0 && !dismissedActions.includes('act-orders')) {
    actionItems.push({ id: 'act-orders', text: `Approve and fulfill ${unapprovedOrders} new web order${unapprovedOrders > 1 ? 's' : ''}`, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-[#eef2f6]', link: '/dashboard/orders' });
  }

  const unreadEventInvites = data.eventInvites?.filter((inv: any) => inv.optInStatus === 'Pending') || [];
  if (unreadEventInvites.length > 0 && !dismissedActions.includes('act-events')) {
    actionItems.push({ id: 'act-events', text: `You have been invited to ${unreadEventInvites.length} new event${unreadEventInvites.length > 1 ? 's' : ''}. Register now!`, icon: CalendarIcon, color: 'text-purple-600', bg: 'bg-purple-100', link: '/dashboard/events' });
  }

  const unsettledEvents = data.eventInvites?.filter((inv: any) => inv.optInStatus === 'Registered' && inv.event.status === 'Past' && data.listedBooks?.some((lb: any) => lb.eventId === inv.eventId && lb.listedStock !== (lb.soldStock || 0) + (lb.returnedStock || 0))) || [];
  if (unsettledEvents.length > 0 && !dismissedActions.includes('act-settle')) {
    actionItems.push({ id: 'act-settle', text: `Settle your inventory for ${unsettledEvents.length} past event${unsettledEvents.length > 1 ? 's' : ''}`, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100', link: '/dashboard/events' });
  }

  const lowStockAlerts = authorProfile.extraData?.lowStockAlerts || [];
  const activeAlerts = lowStockAlerts.filter((a: any) => !a.read && (Date.now() - a.timestamp < 24 * 60 * 60 * 1000));
  if (activeAlerts.length > 0 && !dismissedActions.includes('act-lowstock')) {
    actionItems.push({ id: 'act-lowstock', text: `Admin Notification: ${activeAlerts.length} of your books have critically low stock!`, icon: Package, color: 'text-red-600', bg: 'bg-red-100', link: '/dashboard/inventory' });
  }

  if (actionItems.length === 0) {
    actionItems.push({ id: 'act-none', text: 'All caught up! No pending actions.', icon: Check, color: 'text-gray-600', bg: 'bg-gray-100', link: '' });
  }

  const handleAddBook = async (e: React.FormEvent | null, addAnother: boolean = false) => {
    if (e) e.preventDefault();
    if (!newBook.pages || parseInt(newBook.pages) <= 0) {
      toast.error('Number of pages is mandatory and must be greater than 0.');
      return;
    }
    if (!newBook.printFormat) {
      toast.error('Print format is mandatory.');
      return;
    }
    if (!newBook.isbn) {
      toast.error('ISBN number is mandatory.');
      return;
    }
    if (!newBook.mrp || parseFloat(newBook.mrp) <= 0) {
      toast.error('MRP is mandatory and must be greater than 0.');
      return;
    }
    if (!newBook.stock || parseInt(newBook.stock) < 0) {
      toast.error('Initial Stock is mandatory and must be 0 or greater.');
      return;
    }
    if (newBook.synopsis.split(/\s+/).filter(Boolean).length > 100) {
      toast.error('Synopsis cannot exceed 100 words.');
      return;
    }
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
      formData.append('printFormat', newBook.printFormat || '');
      formData.append('purpose', newBook.purpose || '');

      let maxFairPrice = 0;
      if (newBook.pages && newBook.printFormat) {
        const pages = parseInt(newBook.pages, 10);
        if (!isNaN(pages)) {
          if (newBook.printFormat === 'Black & White') { maxFairPrice = (pages * 0.50) + 250; }
          else if (newBook.printFormat === 'Colored') { maxFairPrice = (pages * 2.40) + 250; }
        }
      }
      formData.append('isOverpriced', (maxFairPrice > 0 && parseFloat(newBook.mrp) > maxFairPrice) ? 'true' : 'false');
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
          title: '', subtitle: '', genre: '', subcategory: '', subSubcategory: '', synopsis: '', pages: '', mrp: '', stock: '', language: '', isbn: '', publisher: '', publicationDate: '', edition: '', format: '', printFormat: '', purpose: ''
        });
        setCover(null);
      } else {
        setShowAddBook(false);
      }
    } catch (err) {
      toast.error('Failed to add book');
    } finally {
      setButtonStates(prev => ({ ...prev, addBook: false }));
    }
  };

  const handleEditProfileOpen = () => {
    navigate('/dashboard/profile');
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
        alert('Image uploaded successfully! It will appear in the gallery.');
        setGalleryUploadFile(null);
        setGalleryUploadCaption('');
        setSelectedGalleryEvent(null);
      } else {
        alert('Failed to upload image.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    if (!editProfileForm.name?.trim()) errors.push('Name is required');
    if (!editProfileForm.phone?.trim()) errors.push('Phone is required');
    if (editProfileForm.phone && !/^\d{10}$/.test(editProfileForm.phone.replace(/\D/g, ''))) errors.push('Phone must be 10 digits');
    if (editProfileForm.linkedin && !/^(https?:\/\/|www\.)/.test(editProfileForm.linkedin)) errors.push('Enter valid url starting with www.');
    const bioWordCount = editProfileForm.bio.split(/\s+/).filter(Boolean).length;
    if (bioWordCount < 100 || bioWordCount > 150) errors.push(`Bio must be 100-150 words (currently ${bioWordCount})`);
    // Validate qualifications
    try {
      const qArr = JSON.parse(editProfileForm.qualification || '[]');
      if (Array.isArray(qArr)) {
        qArr.forEach((q: any, i: number) => {
          if (!q.qualification?.trim()) errors.push(`Qualification ${i + 1}: Degree/Title is required`);
          if (!q.institution?.trim()) errors.push(`Qualification ${i + 1}: Institution is required`);
        });
      }
    } catch (e) { }
    if (errors.length > 0) {
      toast.error(`Please fix: ${errors.join(', ')}`);
      return;
    }
    try {
      const formData = new FormData();
      Object.entries(editProfileForm).forEach(([key, val]) => {
        if (key === 'age') formData.append('dob', val);
        else if (key === 'skills') formData.append('skills', JSON.stringify(val.split(',').map((s: any) => s.trim()).filter(Boolean)));
        else if (key === 'hobbies') formData.append('hobbies', JSON.stringify(val.split(',').map((s: any) => s.trim()).filter(Boolean)));
        else formData.append(key, val);
      });
      if (editPhoto) formData.append('photo', editPhoto);
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/profile/bio`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Profile updated and submitted for admin review!');
      setShowEditProfile(false);
      onRefresh();
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setButtonStates(prev => ({ ...prev, editProfile: false }));
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
      setButtonStates(prev => ({ ...prev, updateCover: false }));
    }
  };

  const handleEditBookOpen = (bookId: number) => {
    const book = authorBooks.find((b: any) => b.id === bookId);
    if (!book) return;
    setEditingBook({
      id: book.id,
      title: book.title,
      subtitle: book.subtitle || '',
      genre: book.genre,
      subGenre: book.subGenre || '',
      mrp: book.mrp,
      stock: book.stock,
      synopsis: book.synopsis || '',
      pages: book.pages || '',
      language: book.language || '',
      isbn: book.isbn || '',
      publisher: book.publisher || '',
      publicationDate: book.publicationDate || '',
      edition: book.edition || '',
      format: book.format || '',
      printFormat: book.printFormat || '',
      purpose: book.purpose || ''
    });
  };

  const handleEditBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    if (!editingBook.title?.trim()) { toast.error('Book title is required.'); return; }
    if (!editingBook.genre?.trim()) { toast.error('Genre is required.'); return; }
    if (!editingBook.pages || parseInt(editingBook.pages) <= 0) {
      toast.error('Number of pages is mandatory and must be greater than 0.');
      return;
    }
    if (!editingBook.mrp || parseFloat(editingBook.mrp) <= 0) { toast.error('MRP is required.'); return; }
    if (!editingBook.language?.trim()) { toast.error('Language is required.'); return; }
    if (!editingBook.format?.trim()) { toast.error('Format is required.'); return; }
    if (!editingBook.printFormat) {
      toast.error('Print format is mandatory.');
      return;
    }
    if (!editingBook.isbn) {
      toast.error('ISBN number is mandatory.');
      return;
    }
    if (editingBook.synopsis.split(/\s+/).filter(Boolean).length > 100) {
      toast.error('Synopsis cannot exceed 100 words.');
      return;
    }
    setButtonStates(prev => ({ ...prev, updateBook: true }));
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/books/${editingBook.id}`, {
        title: editingBook.title,
        genre: editingBook.genre,
        subGenre: editingBook.subGenre,
        subtitle: editingBook.subtitle,
        mrp: parseFloat(editingBook.mrp),
        stock: parseInt(editingBook.stock),
        synopsis: editingBook.synopsis,
        pages: editingBook.pages,
        language: editingBook.language,
        isbn: editingBook.isbn,
        publisher: editingBook.publisher,
        publicationDate: editingBook.publicationDate,
        edition: editingBook.edition,
        format: editingBook.format,
        printFormat: editingBook.printFormat,
        purpose: editingBook.purpose
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (newCoverFile) {
        const formData = new FormData();
        formData.append('cover', newCoverFile);
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/books/${editingBook.id}/cover`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      toast.success('Book updated and submitted for review!');
      setEditingBook(null);
      setNewCoverFile(null);
      onRefresh();
    } catch (err) {
      toast.error('Failed to update book');
    } finally {
      setButtonStates(prev => ({ ...prev, updateBook: false }));
    }
  };




  return (
    <div>
      {/* ── Page Header ── */}
      <div className="flex justify-between items-start mb-7 flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
            {authorProfile.photoUrl ? (
              <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${authorProfile.photoUrl}`} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={24} className="text-gray-400" />
            )}
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-paa-gray-text mb-1">Author Portal &middot; Dashboard</p>
            <h1 className="text-3xl font-serif font-bold text-paa-navy tracking-tight mb-1">{authorProfile.name || 'My Dashboard'}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500 font-medium">
              <span className="flex items-center gap-1.5"><Mail size={12} /> {authorProfile.email}</span>
              <span className="flex items-center gap-1.5"><Phone size={12} /> {authorProfile.phone}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleEditProfileOpen} className="dash-btn dash-btn-ghost">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: 'inline', marginRight: 5 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            Edit Profile
          </button>
          <button onClick={() => navigate('/dashboard/bundle-offers')} className="dash-btn dash-btn-primary bg-indigo-600 hover:bg-indigo-700 !border-indigo-600">
            Bundle Offers
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        {[
          { label: 'Total Titles', value: authorBooks.length, colorClass: 'blue' },
          { label: 'Total Stock', value: authorBooks.reduce((a: number, b: any) => a + b.stock, 0), colorClass: 'green' },
          { label: 'Gross Sales', value: '\u20b9' + grossSales.toFixed(0), colorClass: 'amber' },
          { label: 'Total Fees Paid', value: '\u20b9' + totalFeesPaid, colorClass: 'red' },
          { label: 'Web Sales', value: '\u20b9' + webSalesAmount.toFixed(0), colorClass: 'blue' },
          { label: 'POS/Event Sales', value: '\u20b9' + posSalesAmount.toFixed(0), colorClass: 'amber' },
          { label: 'Avg Order Value', value: '\u20b9' + avgOrderValue, colorClass: 'blue' },
          { label: 'Avg Delivery', value: Number(avgDeliveryDays) > 0 ? `${avgDeliveryDays} Days` : 'N/A', colorClass: 'teal' },
          { label: 'Pending Web Orders', value: toApproveOrders, colorClass: 'amber' },
          { label: 'Low Stock Titles', value: lowStockCount, colorClass: 'red' },
        ].map((kpi, i) => (
          <div key={i} className={`dash-kpi-card ${kpi.colorClass}`}>
            <p className="text-[10px] font-bold tracking-widest uppercase text-paa-gray-text mb-1">{kpi.label}</p>
            <h3 className="text-2xl font-bold text-paa-navy">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* ── Library Donations KPI Cards ── */}
      {data?.activeDonations?.length > 0 || donationRegistrations.length > 0 ? (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-paa-navy">Library Donations Overview</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {[
              { label: 'Active Campaigns', value: data?.activeDonations?.length || 0, colorClass: 'blue' },
              { label: 'Pending Registrations', value: pendingRegistrations, colorClass: 'amber' },
              { label: 'Approved Donations', value: approvedDonations, colorClass: 'green' },
              { label: 'Libraries Reached', value: uniqueLibraries, colorClass: 'teal' },
              { label: 'Books Donated', value: totalBooksDonated, colorClass: 'blue' },
            ].map((kpi, i) => (
              <div key={i} className={`dash-kpi-card ${kpi.colorClass}`}>
                <p className="text-[10px] font-bold tracking-widest uppercase text-paa-gray-text mb-1">{kpi.label}</p>
                <h3 className="text-2xl font-bold text-paa-navy">{kpi.value}</h3>
              </div>
            ))}
          </div>
        </div>
      ) : null}



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
                  <button onClick={(e) => {
                    e.stopPropagation();
                    const next = [...dismissedActions, action.id];
                    setDismissedActions(next);
                    localStorage.setItem('paa_author_dismissed', JSON.stringify(next));
                  }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Dismiss">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )
          })}
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
          <div className="dash-modal !max-w-[95vw] !w-full">
            <div className="dash-modal-header">
              <h3 className="text-sm font-bold uppercase tracking-widest text-paa-navy">Edit My Profile</h3>
              <button onClick={() => setShowEditProfile(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/6 text-paa-gray-text transition-colors">&#x2715;</button>
            </div>
            <div className="dash-modal-body">
              <h2 className="sr-only">Edit My Profile</h2>
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto px-1 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Full Name</label>
                    <input className="dash-input w-full" value={editProfileForm.name} onChange={e => setEditProfileForm({ ...editProfileForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Pen Name</label>
                    <input className="dash-input w-full" value={editProfileForm.penName} onChange={e => setEditProfileForm({ ...editProfileForm, penName: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Phone</label>
                    <input className="dash-input w-full" value={editProfileForm.phone} onChange={e => setEditProfileForm({ ...editProfileForm, phone: e.target.value.replace(/\D/g, '') })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">WhatsApp</label>
                    <input className="dash-input w-full" value={editProfileForm.whatsapp} onChange={e => setEditProfileForm({ ...editProfileForm, whatsapp: e.target.value.replace(/\D/g, '') })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Full Address</label>
                  <input className="dash-input w-full" value={editProfileForm.address} onChange={e => setEditProfileForm({ ...editProfileForm, address: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Pincode</label>
                  <input className="dash-input w-full" value={editProfileForm.pincode} onChange={e => setEditProfileForm({ ...editProfileForm, pincode: e.target.value.replace(/\D/g, '') })} maxLength={6} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">City</label>
                    <input className="dash-input w-full" value={editProfileForm.city} onChange={e => setEditProfileForm({ ...editProfileForm, city: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">State</label>
                    <input className="dash-input w-full" value={editProfileForm.state} onChange={e => setEditProfileForm({ ...editProfileForm, state: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Aadhar/Voter ID/DL</label>
                    <input className="dash-input w-full" value={editProfileForm.aadharNumber} onChange={e => setEditProfileForm({ ...editProfileForm, aadharNumber: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Instagram</label>
                    <input className="dash-input w-full" value={editProfileForm.instagram} onChange={e => setEditProfileForm({ ...editProfileForm, instagram: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Facebook</label>
                    <input className="dash-input w-full" value={editProfileForm.facebook} onChange={e => setEditProfileForm({ ...editProfileForm, facebook: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">LinkedIn</label>
                    <input className="dash-input w-full" value={editProfileForm.linkedin} onChange={e => setEditProfileForm({ ...editProfileForm, linkedin: e.target.value })} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-2">Qualifications</label>
                  {(() => {
                    let qArr: any[] = [];
                    try { qArr = JSON.parse(editProfileForm.qualification || '[]'); } catch (e) { }
                    if (!Array.isArray(qArr)) qArr = [{ qualification: editProfileForm.qualification || '', institution: '', subject: '' }];
                    return (
                      <>
                        {qArr.map((q: any, i: number) => (
                          <div key={i} className="grid grid-cols-3 gap-2 mb-2 bg-gray-50 p-3 rounded-lg border border-gray-100 relative group">
                            {qArr.length > 1 && (
                              <button type="button" onClick={() => {
                                const newQ = qArr.filter((_: any, idx: number) => idx !== i);
                                setEditProfileForm({ ...editProfileForm, qualification: JSON.stringify(newQ) });
                              }} className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full border border-red-200 w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">✕</button>
                            )}
                            <div>
                              <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Degree / Title</span>
                              <input type="text" className="dash-input w-full text-xs" value={q.qualification || ''} onChange={ev => {
                                const newQ = [...qArr]; newQ[i] = { ...newQ[i], qualification: ev.target.value };
                                setEditProfileForm({ ...editProfileForm, qualification: JSON.stringify(newQ) });
                              }} />
                            </div>
                            <div>
                              <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Institution</span>
                              <input type="text" className="dash-input w-full text-xs" value={q.institution || ''} onChange={ev => {
                                const newQ = [...qArr]; newQ[i] = { ...newQ[i], institution: ev.target.value };
                                setEditProfileForm({ ...editProfileForm, qualification: JSON.stringify(newQ) });
                              }} />
                            </div>
                            <div>
                              <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Subject</span>
                              <input type="text" className="dash-input w-full text-xs" value={q.subject || ''} onChange={ev => {
                                const newQ = [...qArr]; newQ[i] = { ...newQ[i], subject: ev.target.value };
                                setEditProfileForm({ ...editProfileForm, qualification: JSON.stringify(newQ) });
                              }} />
                            </div>
                          </div>
                        ))}
                        <button type="button" onClick={() => {
                          const newQ = [...qArr, { qualification: '', institution: '', subject: '' }];
                          setEditProfileForm({ ...editProfileForm, qualification: JSON.stringify(newQ) });
                        }} className="text-[10px] font-bold text-paa-navy uppercase tracking-widest hover:text-paa-gold mt-1">+ Add Qualification</button>
                      </>
                    );
                  })()}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Date of Birth</label>
                    <input type="date" className="dash-input w-full" value={editProfileForm.age} onChange={e => setEditProfileForm({ ...editProfileForm, age: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Experience</label>
                    <input className="dash-input w-full" value={editProfileForm.experience} onChange={e => setEditProfileForm({ ...editProfileForm, experience: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Skills</label>
                    <input className="dash-input w-full" value={editProfileForm.skills} onChange={e => setEditProfileForm({ ...editProfileForm, skills: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Hobbies</label>
                    <input className="dash-input w-full" value={editProfileForm.hobbies} onChange={e => setEditProfileForm({ ...editProfileForm, hobbies: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Why did you join the group? (Published Authors)</label>
                  <textarea className="dash-input w-full resize-y" rows={2} value={editProfileForm.whyJoining} onChange={e => setEditProfileForm({ ...editProfileForm, whyJoining: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Author Bio (100-150 words)</label>
                  <textarea required className={`dash-input w-full ${(() => {
                    const c = editProfileForm.bio.split(/\s+/).filter(Boolean).length;
                    return (c > 0 && (c < 100 || c > 150)) ? '!border-red-500' : '';
                  })()}`} rows={5} value={editProfileForm.bio} onChange={e => setEditProfileForm({ ...editProfileForm, bio: e.target.value })} />
                  {(() => {
                    const count = editProfileForm.bio.split(/\s+/).filter(Boolean).length;
                    if (count > 0 && count < 100) return <div className="text-red-500 text-xs mt-1 font-medium">Bio must be at least 100 words.</div>;
                    if (count > 150) return <div className="text-red-500 text-xs mt-1 font-medium">Bio cannot exceed 150 words.</div>;
                    return null;
                  })()}
                  <div className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mt-1 text-right">
                    {editProfileForm.bio.split(/\s+/).filter(Boolean).length} / 150 words (min 100)
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Update Profile Photo</label>
                  <input type="file" accept="image/*" className="border border-paa-navy/20 p-2 text-xs w-full rounded-lg" onChange={e => setEditPhoto(e.target.files?.[0] || null)} />
                </div>
                <div className="flex justify-end gap-2 mt-4 border-t pt-4 sticky bottom-0 bg-white">
                  <button type="button" onClick={() => setShowEditProfile(false)} className="dash-btn dash-btn-ghost">Cancel</button>
                  <button type="submit" disabled={buttonStates.editProfile} className="dash-btn dash-btn-primary disabled:opacity-50">{buttonStates.editProfile ? 'Saving...' : 'Save & Submit for Review'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {editCoverBookId !== null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setEditCoverBookId(null)}>
          <div className="dash-modal" style={{ maxWidth: 400 }}>
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
        <div className="absolute inset-0 z-50 bg-white p-6 md:p-8 overflow-y-auto animate-fade-in-up">
          <div className="flex justify-between items-center mb-6 border-b border-paa-navy/5 pb-4">
            <div>
              <h2 className="text-2xl font-serif text-paa-navy tracking-tight">Add New Title</h2>
              <p className="text-sm text-paa-gray-text mt-1">Register a new book to the platform.</p>
            </div>
            <button type="button" onClick={() => setShowAddBook(false)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-paa-gray-text hover:text-paa-navy transition-colors">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
          <form onSubmit={handleAddBook} className="flex flex-col gap-6 max-w-4xl">

            {/* Book Title & Subtitle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="dash-label">Book Title *</label>
                <input required className="dash-input" placeholder="Title" value={newBook.title} onChange={e => setNewBook({ ...newBook, title: e.target.value })} />
              </div>
              <div>
                <label className="dash-label">Subtitle</label>
                <input className="dash-input" placeholder="Subtitle" value={newBook.subtitle} onChange={e => setNewBook({ ...newBook, subtitle: e.target.value })} />
              </div>
            </div>

            {/* Category, Subcategory, Specific Genre */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="dash-label">Category *</label>
                <select required className="dash-input" value={newBook.genre} onChange={e => setNewBook({ ...newBook, genre: e.target.value, subcategory: '', subSubcategory: '' })}>
                  <option value="">Select Category</option>
                  {Object.keys(bookCategories).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="dash-label">Subcategory</label>
                <select className="dash-input" disabled={!newBook.genre || Object.keys(bookCategories[newBook.genre as keyof typeof bookCategories] || {}).length === 0} value={newBook.subcategory} onChange={e => setNewBook({ ...newBook, subcategory: e.target.value, subSubcategory: '' })}>
                  <option value="">Select Sub</option>
                  {newBook.genre && Object.keys(bookCategories[newBook.genre as keyof typeof bookCategories] || {}).map(sc => <option key={sc} value={sc}>{sc}</option>)}
                </select>
              </div>
              <div>
                <label className="dash-label">Specific Genre</label>
                <select className="dash-input" disabled={!newBook.subcategory || !((bookCategories[newBook.genre as keyof typeof bookCategories] as any)[newBook.subcategory] || []).length} value={newBook.subSubcategory} onChange={e => setNewBook({ ...newBook, subSubcategory: e.target.value })}>
                  <option value="">Select Genre</option>
                  {newBook.genre && newBook.subcategory && ((bookCategories[newBook.genre as keyof typeof bookCategories] as any)[newBook.subcategory] || []).map((ssc: string) => <option key={ssc} value={ssc}>{ssc}</option>)}
                </select>
              </div>
            </div>

            {/* Synopsis */}
            <div>
              <label className="dash-label">Synopsis (Max 100 words) *</label>
              <textarea required className={`dash-input ${newBook.synopsis.split(/\s+/).filter(Boolean).length > 100 ? '!border-red-500' : ''}`} rows={3} placeholder="Brief description of the book" value={newBook.synopsis} onChange={e => setNewBook({ ...newBook, synopsis: e.target.value })} />
              {newBook.synopsis.split(/\s+/).filter(Boolean).length > 100 && (
                <div className="text-red-500 text-xs mt-1 font-medium">Synopsis cannot exceed 100 words.</div>
              )}
              <div className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mt-1 text-right">
                {newBook.synopsis.split(/\s+/).filter(Boolean).length} / 100 words
              </div>
            </div>

            {/* Language, Publisher, Publication Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="dash-label">Language *</label>
                <input required className="dash-input" placeholder="e.g. English" value={newBook.language} onChange={e => setNewBook({ ...newBook, language: e.target.value })} />
              </div>
              <div>
                <label className="dash-label">Publisher *</label>
                <input required className="dash-input" placeholder="e.g. Self-Published" value={newBook.publisher} onChange={e => setNewBook({ ...newBook, publisher: e.target.value })} />
              </div>
              <div>
                <label className="dash-label">Pub Date *</label>
                <input required type="date" className="dash-input text-xs" value={newBook.publicationDate} onChange={e => setNewBook({ ...newBook, publicationDate: e.target.value })} />
              </div>
            </div>

            {/* ISBN, Edition, Format */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="dash-label">ISBN *</label>
                <input required className="dash-input" placeholder="e.g. 978..." value={newBook.isbn} onChange={e => setNewBook({ ...newBook, isbn: e.target.value })} />
              </div>
              <div>
                <label className="dash-label">Edition</label>
                <input className="dash-input" placeholder="e.g. 1st Edition" value={newBook.edition} onChange={e => setNewBook({ ...newBook, edition: e.target.value })} />
              </div>
              <div>
                <label className="dash-label">Format *</label>
                <select required className="dash-input" value={newBook.format} onChange={e => setNewBook({ ...newBook, format: e.target.value })}>
                  <option value="">Select Format</option>
                  <option value="Paperback">Paperback</option>
                  <option value="Hardcover">Hardcover</option>
                  <option value="Ebook">Ebook</option>
                </select>
              </div>
              <div>
                <label className="dash-label">Print Format *</label>
                <select required className="dash-input" value={(newBook as any).printFormat || ''} onChange={e => setNewBook({ ...newBook, printFormat: e.target.value })}>
                  <option value="">Select Print Format</option>
                  <option value="Black & White">Black & White</option>
                  <option value="Colored">Colored</option>
                </select>
              </div>
              <div>
                <label className="dash-label">Purpose of Writing *</label>
                <select required className="dash-input" value={(newBook as any).purpose || ''} onChange={e => setNewBook({ ...newBook, purpose: e.target.value })}>
                  <option value="">Select Purpose</option>
                  <option value="Hobby">Hobby</option>
                  <option value="Professional/Academic">Professional/Academic</option>
                  <option value="Commercial/Revenue">Commercial/Revenue</option>
                  <option value="Social Cause/Awareness">Social Cause/Awareness</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Pages, MRP, Initial Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="dash-label">Pages *</label>
                <input required type="number" className="dash-input" placeholder="250" value={newBook.pages} onChange={e => setNewBook({ ...newBook, pages: e.target.value })} />
              </div>
              <div>
                <label className="dash-label">MRP (₹) *</label>
                <input required type="number" className="dash-input" placeholder="Price" value={newBook.mrp} onChange={e => setNewBook({ ...newBook, mrp: e.target.value })} />
              </div>
              <div>
                <label className="dash-label">Initial Stock *</label>
                <input required type="number" className="dash-input" placeholder="Qty" value={newBook.stock} onChange={e => setNewBook({ ...newBook, stock: e.target.value })} />
              </div>
            </div>

            {/* Cover upload */}
            <div>
              <label className="dash-label">Cover Image *</label>
              <input required type="file" accept="image/*" className="dash-input text-xs" onChange={e => setCover(e.target.files?.[0] || null)} />
            </div>

            {(() => {
              const pages = Number(newBook.pages);
              const mrp = Number(newBook.mrp);
              if (pages > 0 && newBook.printFormat && mrp > 0) {
                const rate = newBook.printFormat === 'Colored' ? 2.40 : 0.50;
                const maxPrice = (pages * rate) + 250;
                if (mrp > maxPrice) {
                  return <div className="text-yellow-700 text-xs font-bold bg-yellow-50 p-2 rounded border border-yellow-200 mt-3 mb-2">Warning: Your MRP (₹{mrp}) exceeds the recommended max price of ₹{maxPrice} based on your pages and format.</div>;
                }
              }
              return null;
            })()}

            <div className="flex justify-end gap-2 pt-6 border-t mt-4">
              <button type="button" onClick={() => setShowAddBook(false)} className="dash-btn dash-btn-ghost">Cancel</button>
              <button type="button" onClick={(e) => { const f = e.currentTarget.closest('form'); if (f && f.checkValidity()) { handleAddBook(null, true); } else if (f) { f.reportValidity(); } }} className="dash-btn dash-btn-ghost">Save &amp; Add Another</button>
              <button type="submit" disabled={buttonStates.addBook} className="dash-btn dash-btn-primary disabled:opacity-50 px-8">{buttonStates.addBook ? 'Adding...' : 'Add Book'}</button>
            </div>
          </form>
        </div>
      )}


      {/* ── Books Table ── */}
      <div className="dash-panel overflow-hidden mb-7">
        <div className="dash-panel-header">
          <h2 className="dash-panel-title">Your Titles</h2>
          <div className="flex items-center gap-4">
            <span className="dash-badge info">{filteredTitles.length} titles</span>
            <button onClick={() => navigate('/dashboard/profile', { state: { action: 'add_book' } })} className="dash-btn dash-btn-primary py-1 px-3 text-xs">Add new Book</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="dash-table">
            <thead><tr>
              <th>#</th><th>Cover</th><th>Title</th><th>Status</th>
              <th>Genre</th><th>MRP</th><th>Current Stock</th><th>Sold Details</th><th>Listing Date</th><th className="text-center">Actions</th>
            </tr></thead>
            <tbody>
              {filteredTitles.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-10 text-paa-gray-text italic text-sm">No titles for this filter.</td></tr>
              ) : filteredTitles.map((row: any, idx: number) => (
                <tr key={row.id}>
                  <td className="text-paa-gray-text text-xs">{idx + 1}</td>
                  <td>{authorBooks.find((b: any) => b.id === row.id)?.coverUrl
                    ? <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${authorBooks.find((b: any) => b.id === row.id)?.coverUrl}`} alt="cover" className="w-9 h-12 object-cover rounded-lg shadow-sm" />
                    : <div className="w-9 h-12 bg-gray-100 rounded-lg border flex items-center justify-center text-[9px] text-gray-400">No cover</div>}
                  </td>
                  <td className="font-semibold text-paa-navy">{row.title}</td>
                  <td><span className={`dash-badge ${row.status === 'Approved' ? 'approved' : row.status === 'Rejected' ? 'rejected' : 'pending'}`}>{row.status}</span>
                    {row.status === 'Rejected' && row.rejectionReason && <div className="mt-1 text-[10px] text-red-600">{row.rejectionReason}</div>}
                  </td>
                  <td className="text-paa-gray-text text-xs">{row.genre}</td>
                  <td className="font-semibold">{row.mrp}</td>
                  <td><span className={`font-bold ${row.stock < 10 ? 'text-red-500' : 'text-paa-navy'}`}>{row.stock}</span>{row.stock < 10 && <div className="text-[9px] text-red-400 font-bold">LOW</div>}</td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-semibold text-emerald-700 text-sm">{row.sold.total} Total</span>
                      <span className="text-[10px] text-paa-gray-text font-bold uppercase tracking-widest">{row.sold.events} Events | {row.sold.web} Web</span>
                    </div>
                  </td>
                  <td className="text-paa-gray-text text-xs whitespace-nowrap">{row.date}</td>
                  <td>
                    <div className="flex items-center justify-center">
                      <button onClick={() => navigate('/dashboard/profile', { state: { action: 'edit_book', bookId: row.id } })} className="p-2 text-paa-navy hover:text-paa-gold bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200" title="Edit Details">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        <div className="dash-panel">
          <div className="dash-panel-header"><h3 className="dash-panel-title">Books Sold per Title</h3></div>
          <div className="h-[250px] p-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={10} tick={{ fill: '#71717A' }} />
                <YAxis fontSize={10} tick={{ fill: '#71717A' }} />
                <Tooltip cursor={{ fill: 'rgba(24,24,27,0.03)' }} contentStyle={{ borderRadius: 10, border: '1px solid rgba(24,24,27,0.08)', fontSize: 12 }} />
                <Bar dataKey="sold" fill="#18181B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dash-panel">
          <div className="dash-panel-header"><h3 className="dash-panel-title">Web Orders Distribution</h3></div>
          <div className="h-[250px] p-5">
            <ResponsiveContainer width="100%" height="100%">
              {webOrdersPieData.length > 0 ? (
                <PieChart>
                  <Pie data={webOrdersPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {webOrdersPieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip wrapperClassName="shadow-premium border-none rounded-lg" />
                </PieChart>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">No web orders yet.</div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dash-panel">
          <div className="dash-panel-header"><h3 className="dash-panel-title">Activity Participation</h3></div>
          <div className="h-[250px] p-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" fontSize={10} tick={{ fill: '#71717A' }} />
                <YAxis dataKey="name" type="category" width={90} fontSize={10} tick={{ fill: '#71717A' }} />
                <Tooltip cursor={{ fill: 'rgba(24,24,27,0.03)' }} contentStyle={{ borderRadius: 10, border: '1px solid rgba(24,24,27,0.08)', fontSize: 12 }} />
                <Bar dataKey="count" fill="#C0A062" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Edit Book Modal (Reapply) ── */}
      {editingBook && (
        <div className="absolute inset-0 z-50 bg-white p-6 md:p-8 overflow-y-auto animate-fade-in-up">
          <div className="flex justify-between items-center mb-6 border-b border-paa-navy/5 pb-4">
            <div>
              <h2 className="text-2xl font-serif text-paa-navy tracking-tight">Edit Book Details & Reapply</h2>
              <p className="text-sm text-paa-gray-text mt-1">Update your book information below.</p>
            </div>
            <button type="button" onClick={() => setEditingBook(null)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-paa-gray-text hover:text-paa-navy transition-colors">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
          <form onSubmit={handleEditBookSubmit} className="space-y-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 bg-gray-50 border border-gray-200 p-4 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <label className="dash-label mb-1">Update Book Cover (Optional)</label>
                  <p className="text-[10px] text-paa-gray-text">Upload a new image to replace the current cover.</p>
                </div>
                <input type="file" accept="image/*" className="dash-input bg-white w-64 text-xs" onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setNewCoverFile(e.target.files[0]);
                  }
                }} />
              </div>
              <div>
                <label className="dash-label">Title</label>
                <input required type="text" className="dash-input" value={editingBook.title} onChange={e => setEditingBook({ ...editingBook, title: e.target.value })} />
              </div>
              <div>
                <label className="dash-label">Subtitle (Optional)</label>
                <input type="text" className="dash-input" value={editingBook.subtitle} onChange={e => setEditingBook({ ...editingBook, subtitle: e.target.value })} />
              </div>
              <div>
                <label className="dash-label">Genre</label>
                <select required className="dash-input" value={editingBook.genre} onChange={e => setEditingBook({ ...editingBook, genre: e.target.value })}>
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
                <input type="text" className="dash-input" value={editingBook.subGenre} onChange={e => setEditingBook({ ...editingBook, subGenre: e.target.value })} />
              </div>
              <div>
                <label className="dash-label">Pages *</label>
                <input required type="number" className="dash-input" value={editingBook.pages} onChange={e => setEditingBook({ ...editingBook, pages: e.target.value })} />
              </div>
              <div>
                <label className="dash-label">MRP (₹)</label>
                <input required type="number" className="dash-input" value={editingBook.mrp} onChange={e => setEditingBook({ ...editingBook, mrp: e.target.value })} />
              </div>
              <div>
                <label className="dash-label">Initial Stock</label>
                <input required type="number" className="dash-input" value={editingBook.stock} onChange={e => setEditingBook({ ...editingBook, stock: e.target.value })} />
              </div>
              <div>
                <label className="dash-label">Language *</label>
                <select required className="dash-input" value={editingBook.language} onChange={e => setEditingBook({ ...editingBook, language: e.target.value })}>
                  <option value="">Select Language</option>
                  <option value="ENG">ENG</option>
                  <option value="MAR">MAR</option>
                  <option value="HIN">HIN</option>
                </select>
              </div>
              <div>
                <label className="dash-label">ISBN *</label>
                <input required type="text" className="dash-input" value={editingBook.isbn} onChange={e => setEditingBook({ ...editingBook, isbn: e.target.value })} />
              </div>
              <div>
                <label className="dash-label">Publisher</label>
                <input type="text" className="dash-input" value={editingBook.publisher} onChange={e => setEditingBook({ ...editingBook, publisher: e.target.value })} />
              </div>
              <div>
                <label className="dash-label">Publication Date</label>
                <input type="date" className="dash-input" value={editingBook.publicationDate} onChange={e => setEditingBook({ ...editingBook, publicationDate: e.target.value })} />
              </div>
              <div>
                <label className="dash-label">Edition</label>
                <input type="text" className="dash-input" value={editingBook.edition} onChange={e => setEditingBook({ ...editingBook, edition: e.target.value })} />
              </div>
              <div>
                <label className="dash-label">Format *</label>
                <select required className="dash-input" value={editingBook.format} onChange={e => setEditingBook({ ...editingBook, format: e.target.value })}>
                  <option value="">Select Format</option>
                  <option value="Paperback">Paperback</option>
                  <option value="Hardcover">Hardcover</option>
                  <option value="Ebook">Ebook</option>
                </select>
              </div>
              <div>
                <label className="dash-label">Print Format *</label>
                <select required className="dash-input" value={editingBook.printFormat || ''} onChange={e => setEditingBook({ ...editingBook, printFormat: e.target.value })}>
                  <option value="">Select Format</option>
                  <option value="Black & White">Black & White (₹1/page)</option>
                  <option value="Colored">Colored (₹3/page)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="dash-label">Synopsis (Max 100 words) *</label>
              <textarea required className={`dash-input ${editingBook.synopsis.split(/\s+/).filter(Boolean).length > 100 ? '!border-red-500' : ''}`} rows={4} value={editingBook.synopsis} onChange={e => setEditingBook({ ...editingBook, synopsis: e.target.value })}></textarea>
              {editingBook.synopsis.split(/\s+/).filter(Boolean).length > 100 && (
                <div className="text-red-500 text-xs mt-1 font-medium">Synopsis cannot exceed 100 words.</div>
              )}
              <div className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mt-1 text-right">
                {editingBook.synopsis.split(/\s+/).filter(Boolean).length} / 100 words
              </div>
            </div>
            {(() => {
              const pages = Number(editingBook.pages);
              const mrp = Number(editingBook.mrp);
              const isColored = editingBook.printFormat === 'Colored';
              const rate = isColored ? 2.40 : 0.50;
              const maxPrice = (pages * rate) + 250;
              if (pages > 0 && mrp > maxPrice) {
                return <div className="text-yellow-700 text-xs font-bold bg-yellow-50 p-2 rounded border border-yellow-200 mt-3">Warning: Your MRP (₹{mrp}) exceeds the recommended max price of ₹{maxPrice} based on your pages and format.</div>;
              }
              return null;
            })()}
            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <button type="button" onClick={() => setEditingBook(null)} className="dash-btn dash-btn-ghost">Cancel</button>
              <button type="submit" disabled={buttonStates.updateBook} className="dash-btn dash-btn-primary bg-paa-gold hover:bg-yellow-500 text-paa-navy px-8 disabled:opacity-50">
                {buttonStates.updateBook ? 'Submitting...' : 'Submit & Reapply'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function InventoryPage({ onRefresh, dashboardData }: { onRefresh: () => void, dashboardData: any }) {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const token = () => localStorage.getItem('token');

  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [newStocks, setNewStocks] = useState<{ [key: number]: string }>({});
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/author/inventory`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      setInventory(res.data);
      // Keep selected book in sync after refresh
      if (selectedBook) {
        const updated = res.data.find((b: any) => b.id === selectedBook.id);
        if (updated) setSelectedBook(updated);
      }
    } catch (err) {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    let csv = 'S.No,Title,Author,MRP,QTY Sold (Web),QTY to Airport,QTY for Book Fair,Current Stock\n';
    inventory.forEach((b, i) => {
      const title = b.title ? b.title.replace(/"/g, '""') : '';
      const author = b.authorName ? b.authorName.replace(/"/g, '""') : '';
      csv += `${i + 1},"${title}","${author}",${b.mrp || 0},${b.webSold || 0},${b.airportQty || 0},${b.eventQty || 0},${b.currentStock || 0}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Author_Inventory.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => { fetchInventory(); }, []);

  const handleUpdateStock = async (bookId: number) => {
    const addQty = parseInt(newStocks[bookId] || '0');
    if (!addQty || isNaN(addQty)) return toast.error('Please enter a non-zero value (+/- quantity)');
    setUpdatingId(bookId);
    try {
      await axios.put(`${API}/api/author/books/${bookId}/stock`,
        { addQty },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      toast.success(addQty > 0 ? `Added ${addQty} copies to inventory` : `Removed ${Math.abs(addQty)} copies from inventory`);
      setNewStocks(prev => ({ ...prev, [bookId]: '' }));
      await fetchInventory();
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to update stock');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRowClick = (book: any) => {
    setSelectedBook(book);
    setSidebarVisible(true);
  };

  // Stat card totals
  const totalWebSold = inventory.reduce((s, b) => s + (b.webSold || 0), 0);
  const totalAirport = inventory.reduce((s, b) => s + (b.airportQty || 0), 0);
  const totalEvent = inventory.reduce((s, b) => s + (b.eventQty || 0), 0);
  const lowStockCount = inventory.filter(b => b.isLowStock).length;

  if (loading) {
    return (
      <div style={{ padding: '32px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, borderBottom: '1px solid rgba(26,26,46,0.05)', paddingBottom: 16 }}>
          <div>
            <div style={{ height: 28, width: 260, background: '#e5e7eb', borderRadius: 6, marginBottom: 8 }} className="dash-skeleton" />
            <div style={{ height: 14, width: 340, background: '#e5e7eb', borderRadius: 4 }} className="dash-skeleton" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ height: 88, borderRadius: 12, background: '#e5e7eb' }} className="dash-skeleton" />)}
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: '0 0 65%', height: 360, borderRadius: 12, background: '#e5e7eb' }} className="dash-skeleton" />
          <div style={{ flex: '0 0 35%', height: 360, borderRadius: 12, background: '#e5e7eb' }} className="dash-skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: '100%', boxSizing: 'border-box' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(26,26,46,0.06)', paddingBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontFamily: 'var(--font-serif, Georgia)', fontWeight: 700, color: '#1a1a2e', margin: 0, letterSpacing: '-0.3px' }}>
            Inventory &amp; Distribution
          </h2>
          <p style={{ fontSize: 13, color: '#6b6b80', marginTop: 4 }}>
            Track web orders, airport library donations, and book fair allocations. Click any row to view the granular distribution breakdown.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={exportCsv}
            disabled={inventory.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#fff', color: '#1a1a2e', border: '1px solid rgba(26,26,46,0.15)', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: inventory.length === 0 ? 'not-allowed' : 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase' }}
          >
            Export CSV
          </button>
          <button
            onClick={fetchInventory}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase' }}
          >
            <Loader2 size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Global Summary: Stat Cards + Inventory Pie Chart side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>

        {/* Stat Cards (2x2 grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[
            { label: 'Total Titles', value: inventory.length, icon: <BookOpen size={18} />, color: '#6366f1', bg: '#eef2ff' },
            { label: 'QTY Sold (Web)', value: totalWebSold, icon: <ShoppingCart size={18} />, color: '#16a34a', bg: '#f0fdf4' },
            { label: 'QTY to Airport', value: totalAirport, icon: <MapPin size={18} />, color: '#0284c7', bg: '#f0f9ff' },
            { label: 'QTY to Book Fairs', value: totalEvent, icon: <CalendarIcon size={18} />, color: '#9333ea', bg: '#fdf4ff' },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid rgba(26,26,46,0.07)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {icon}
              </div>
              <div>
                <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', margin: '0 0 2px' }}>{label}</p>
                <p style={{ fontSize: 22, fontWeight: 900, color: '#1a1a2e', lineHeight: 1, margin: 0 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Inventory Pie Chart — current stock per book */}
        {inventory.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid rgba(26,26,46,0.07)', borderRadius: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', padding: '14px 18px', width: 280, flexShrink: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', margin: '0 0 8px' }}>Current Stock Split</p>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventory.map(b => ({ name: b.title.length > 14 ? b.title.substring(0, 14) + '…' : b.title, value: b.currentStock, fullTitle: b.title }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {inventory.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['#6366f1','#16a34a','#0284c7','#9333ea','#f59e0b','#ef4444','#06b6d4','#ec4899'][index % 8]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, _: any, props: any) => [`${value} copies`, props.payload?.fullTitle || props.name]}
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid rgba(26,26,46,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
              {inventory.map((b: any, i: number) => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: ['#6366f1','#16a34a','#0284c7','#9333ea','#f59e0b','#ef4444','#06b6d4','#ec4899'][i % 8], flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }} title={b.title}>{b.title}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#1a1a2e', marginLeft: 'auto', flexShrink: 0 }}>{b.currentStock}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockCount > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '1px solid #f59e0b', borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={16} style={{ color: '#b45309', flexShrink: 0 }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: '#78350f', margin: 0 }}>
            <strong>{lowStockCount} title{lowStockCount > 1 ? 's' : ''}</strong> {lowStockCount > 1 ? 'are' : 'is'} running low (below 10 copies). Update stock immediately to avoid order disruptions.
          </p>
        </div>
      )}

      {/* Flex Layout for Table and Sidebar */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', minWidth: 0 }}>

        {/* LEFT — Main Table */}
        <div style={{ flex: 1, minWidth: 0, background: '#fff', border: '1px solid rgba(26,26,46,0.07)', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f0f4f8', borderBottom: '1px solid rgba(26,26,46,0.07)' }}>
                  {['S.No', 'Title', 'Author', 'MRP', 'QTY Sold (Web)', 'QTY to Airport', 'QTY for Book Fair', 'Current Stock', 'Last Updated', 'Update Stock'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', fontWeight: 800, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1a1a2e', whiteSpace: 'nowrap', textAlign: h === 'Title' || h === 'Author' ? 'left' : 'center' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '48px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 13, fontStyle: 'italic' }}>
                      No books in your inventory yet. Add books from your Overview tab.
                    </td>
                  </tr>
                ) : inventory.map((book, idx) => {
                  const isSelected = selectedBook?.id === book.id;
                  return (
                    <tr
                      key={book.id}
                      onClick={() => handleRowClick(book)}
                      style={{
                        borderBottom: '1px solid rgba(0,0,0,0.04)',
                        background: isSelected ? 'rgba(99,102,241,0.06)' : (idx % 2 === 0 ? '#fff' : '#fafafa'),
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        outline: isSelected ? '2px solid rgba(99,102,241,0.3)' : 'none',
                        outlineOffset: -2
                      }}
                      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#f8f9ff'; }}
                      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? '#fff' : '#fafafa'; }}
                    >
                      {/* S.No */}
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#9ca3af', fontWeight: 700, fontSize: 12 }}>{idx + 1}</td>
                      {/* Title */}
                      <td style={{ padding: '12px 14px', maxWidth: 160 }}>
                        <p style={{ fontWeight: 700, color: '#1a1a2e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }} title={book.title}>{book.title}</p>
                        <p style={{ fontSize: 10, color: '#9ca3af', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{book.genre}</p>
                      </td>
                      {/* Author */}
                      <td style={{ padding: '12px 14px', color: '#374151', fontWeight: 500, whiteSpace: 'nowrap' }}>{book.authorName}</td>
                      {/* MRP */}
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: '#1a1a2e' }}>₹{book.mrp}</td>
                      {/* QTY Web */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{ fontWeight: 800, color: '#16a34a', fontSize: 15 }}>{book.webSold}</span>
                      </td>
                      {/* QTY Airport */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{ fontWeight: 800, color: '#0284c7', fontSize: 15 }}>{book.airportQty}</span>
                      </td>
                      {/* QTY Book Fair */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{ fontWeight: 800, color: '#9333ea', fontSize: 15 }}>{book.eventQty}</span>
                      </td>
                      {/* Current Stock */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontWeight: 900, fontSize: 17, color: book.isLowStock ? '#dc2626' : '#1a1a2e', lineHeight: 1 }}>
                            {book.currentStock}
                          </span>
                          {book.isLowStock && (
                            <span style={{
                              fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                              color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca',
                              borderRadius: 4, padding: '2px 6px', animation: 'pulse 2s infinite'
                            }}>⚠ LOW STOCK</span>
                          )}
                        </div>
                      </td>
                      {/* Last Updated */}
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#6b7280', fontSize: 12 }}>
                        {book.lastActivity ? new Date(book.lastActivity).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      {/* Update Stock */}
                      <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input
                            id={`stock-input-${book.id}`}
                            type="number"
                            placeholder="+/- Qty"
                            title="Enter a positive number to add stock, or a negative number to remove stock"
                            value={newStocks[book.id] || ''}
                            onChange={e => setNewStocks(prev => ({ ...prev, [book.id]: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') handleUpdateStock(book.id); }}
                            style={{ width: 68, padding: '6px 8px', border: '1px solid rgba(26,26,46,0.15)', borderRadius: 6, fontSize: 12, textAlign: 'center', outline: 'none', background: '#fff', color: '#1a1a2e' }}
                          />
                          <button
                            id={`stock-update-btn-${book.id}`}
                            onClick={() => handleUpdateStock(book.id)}
                            disabled={!newStocks[book.id] || updatingId === book.id}
                            style={{
                              padding: '6px 10px', background: newStocks[book.id] ? (parseInt(newStocks[book.id] || '0') < 0 ? '#dc2626' : '#1a1a2e') : '#e5e7eb',
                              color: newStocks[book.id] ? '#fff' : '#9ca3af', border: 'none',
                              borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: newStocks[book.id] ? 'pointer' : 'not-allowed',
                              textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                              transition: 'all 0.15s'
                            }}
                          >
                            {updatingId === book.id ? '...' : (parseInt(newStocks[book.id] || '0') < 0 ? 'Remove' : 'Add')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT — Distribution Breakdown Sidebar */}
        <div style={{
          flex: '0 0 320px', minWidth: 0, background: '#fff', border: '1px solid rgba(26,26,46,0.07)',
          borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden',
          transition: 'opacity 0.2s', opacity: selectedBook ? 1 : 0.5
        }}>
          {/* Sidebar Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(26,26,46,0.06)', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6366f1', margin: '0 0 2px' }}>Distribution Breakdown</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                {selectedBook ? selectedBook.title : 'Select a book row'}
              </p>
            </div>
            {selectedBook && (
              <button onClick={() => { setSelectedBook(null); setSidebarVisible(false); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* Sidebar Body */}
          <div style={{ padding: '16px 20px' }}>
            {!selectedBook ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: '#d1d5db' }}>
                <Package size={40} style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontSize: 13, margin: 0 }}>Click any book row to see where copies are distributed.</p>
              </div>
            ) : (
              <>
                {/* Book meta */}
                <div style={{ background: '#f8f9ff', borderRadius: 10, padding: '12px 14px', marginBottom: 16, border: '1px solid rgba(99,102,241,0.1)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { label: 'Current Stock', value: selectedBook.currentStock, color: selectedBook.isLowStock ? '#dc2626' : '#16a34a' },
                      { label: 'Web Sold', value: selectedBook.webSold, color: '#16a34a' },
                      { label: 'Airport Donated', value: selectedBook.airportQty, color: '#0284c7' },
                      { label: 'Book Fairs', value: selectedBook.eventQty, color: '#9333ea' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', margin: '0 0 2px' }}>{label}</p>
                        <p style={{ fontSize: 20, fontWeight: 900, color, margin: 0, lineHeight: 1 }}>{value}</p>
                      </div>
                    ))}
                  </div>
                  {selectedBook.isLowStock && (
                    <div style={{ marginTop: 10, borderTop: '1px solid rgba(220,38,38,0.15)', paddingTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertCircle size={13} style={{ color: '#dc2626', flexShrink: 0 }} />
                      <p style={{ fontSize: 11, color: '#dc2626', fontWeight: 600, margin: 0 }}>Low stock — replenish immediately</p>
                    </div>
                  )}
                </div>

                {/* Distribution items */}
                <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', margin: '0 0 10px' }}>Location Detail</p>
                {selectedBook.distributionBreakdown.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>No active distribution records for this title.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedBook.distributionBreakdown.map((item: any, i: number) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 14px', borderRadius: 8,
                        background: item.type === 'airport' ? '#f0f9ff' : '#fdf4ff',
                        border: `1px solid ${item.type === 'airport' ? 'rgba(2,132,199,0.12)' : 'rgba(147,51,234,0.12)'}`
                      }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <span style={{
                              fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                              color: item.type === 'airport' ? '#0284c7' : '#9333ea',
                              background: item.type === 'airport' ? '#e0f2fe' : '#f3e8ff',
                              borderRadius: 4, padding: '1px 5px'
                            }}>
                              {item.type === 'airport' ? '✈ Airport' : '📚 Book Fair'}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.label}>
                            {item.label}
                          </p>
                          {item.location && (
                            <p style={{ fontSize: 10, color: '#9ca3af', margin: '1px 0 0' }}>{item.location}</p>
                          )}
                          {item.type === 'event' && item.sold !== undefined && (
                            <p style={{ fontSize: 10, color: '#6b7280', margin: '2px 0 0' }}>Sold: {item.sold} / Listed: {item.quantity}</p>
                          )}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                          <span style={{ fontSize: 18, fontWeight: 900, color: item.type === 'airport' ? '#0284c7' : '#9333ea', lineHeight: 1 }}>
                            {item.quantity}
                          </span>
                          <p style={{ fontSize: 9, color: '#9ca3af', margin: '2px 0 0', textTransform: 'uppercase' }}>copies</p>
                        </div>
                      </div>
                    ))}

                    {/* Cumulative Total */}
                    <div style={{ borderTop: '2px solid rgba(26,26,46,0.08)', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1a1a2e' }}>Total Distributed</span>
                      <span style={{ fontSize: 20, fontWeight: 900, color: '#1a1a2e' }}>
                        {selectedBook.distributionBreakdown.reduce((s: number, i: any) => s + i.quantity, 0)}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityRegistration({ activities, books, onRefresh, registrations }: { activities: any[], books: any[], onRefresh: () => void, registrations: any[] }) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAct, setSelectedAct] = useState<any>(null);
  const [selectedBooks, setSelectedBooks] = useState<{ id: number, qty: number }[]>([]);
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
                          <span className="bg-green-100 text-green-800 text-[10px] px-2 py-1 rounded-full font-bold mb-1 flex items-center gap-1"><Check size={12} /> Registered</span>
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
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Author Orders
function AuthorOrders({ orders, onRefresh, dashboardData }: { orders: any[], onRefresh: () => void, dashboardData: any }) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [rejectItemId, setRejectItemId] = useState<number[] | null>(null);
  const [rejectReasons, setRejectReasons] = useState<string[]>(['Item out of stock']);
  const [otherRejectReason, setOtherRejectReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [viewBuyerInfoOrder, setViewBuyerInfoOrder] = useState<any | null>(null);
  const [editingStatusOrderId, setEditingStatusOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
      <span>ðŸ“… Order Date: <strong style="color:#1a1a2e">${new Date(inv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
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

  const handleApprove = async (itemIds: number[]) => {
    setLoadingAction(String(itemIds[0]));
    try {
      const token = localStorage.getItem('token');
      await Promise.all(itemIds.map(id => axios.put(`${API}/api/order-items/${id}/author-approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })));
      toast.success('Order Approved — Stock reserved!');
      onRefresh();
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
    const itemIds = Array.isArray(rejectItemId) ? rejectItemId : [rejectItemId];
    setLoadingAction(String(itemIds[0]));
    try {
      const token = localStorage.getItem('token');
      await Promise.all(itemIds.map(id => axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/order-items/${id}/author-reject`, { reason: finalReason }, {
        headers: { Authorization: `Bearer ${token}` }
      })));
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


  const handleStatusChange = async (itemIds: number[], newStatus: string) => {
    setLoadingAction(String(itemIds[0]));
    try {
      const token = localStorage.getItem('token');
      if (newStatus === 'Dispatched') {
        const trackingNumber = prompt("Enter tracking number for dispatch (optional):");
        await Promise.all(itemIds.map(id => axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/order-items/${id}/dispatch`, { trackingNumber: trackingNumber || 'N/A' }, {
          headers: { Authorization: `Bearer ${token}` }
        })));
      } else {
        await Promise.all(itemIds.map(id => axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/order-items/${id}/status`, { status: newStatus }, {
          headers: { Authorization: `Bearer ${token}` }
        })));
      }
      toast.success('Order status updated to ' + newStatus);
      onRefresh();
    } catch (e) {
      toast.error('Failed to update status');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDispatch = async (id: number) => {
    const trackingNumber = prompt("Enter tracking number for dispatch:");
    if (!trackingNumber) return;

    setLoadingAction(String(id));
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

  const filteredOrders = (filterStatus === 'All'
    ? orders
    : filterStatus === 'Pending'
      ? orders.filter((o: any) => o.status === 'Pending Verification' || o.status === 'Pending' || o.status === 'Processing')
      : orders.filter((o: any) => o.status === filterStatus)).filter((o: any) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return o.customerName?.toLowerCase().includes(q) ||
          o.customerEmail?.toLowerCase().includes(q) ||
          String(o.orderId).includes(q) ||
          o.bookTitle?.toLowerCase().includes(q) ||
          o.title?.toLowerCase().includes(q);
      });

  const groupedOrdersObj: Record<string, any> = {};
  filteredOrders.forEach((o: any) => {
    if (!groupedOrdersObj[o.orderId]) {
      groupedOrdersObj[o.orderId] = {
        ...o,
        itemIds: [o.id],
        books: [{ title: o.bookTitle || o.title, quantity: o.quantity, amount: o.amount }],
        totalQuantity: o.quantity,
        totalAmount: o.amount,
      };
    } else {
      groupedOrdersObj[o.orderId].itemIds.push(o.id);
      groupedOrdersObj[o.orderId].books.push({ title: o.bookTitle || o.title, quantity: o.quantity, amount: o.amount });
      groupedOrdersObj[o.orderId].totalQuantity += o.quantity;
      groupedOrdersObj[o.orderId].totalAmount += o.amount;
    }
  });
  const groupedOrdersList = Object.values(groupedOrdersObj).sort((a: any, b: any) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());

  if (viewBuyerInfoOrder !== null) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-paa-navy/5 p-6 md:p-10 mb-12">
        <button onClick={() => setViewBuyerInfoOrder(null)} className="text-gray-400 hover:text-paa-navy mb-8 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors">
          <X size={18} /> Back to Web Orders
        </button>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column: Details & Timeline */}
          <div className="flex-1">
            <h2 className="text-3xl font-serif text-paa-navy mb-2">Order Details</h2>
            <p className="text-sm text-gray-500 uppercase tracking-widest mb-8 border-b border-paa-navy/10 pb-4">ORD-{viewBuyerInfoOrder.orderId}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Customer Name</p>
                <p className="font-bold text-paa-navy text-lg">{viewBuyerInfoOrder.customerName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Contact Number</p>
                <p className="font-bold text-[#4a90e2] text-lg">{viewBuyerInfoOrder.customerPhone || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Delivery Address</p>
                <p className="text-gray-700 leading-relaxed text-base">{viewBuyerInfoOrder.address}</p>
              </div>
            </div>

            <div className="border-t border-paa-navy/10 pt-8 mb-8">
              <p className="text-xs font-bold text-paa-navy uppercase tracking-widest mb-6">Order Timeline</p>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Placed On</span>
                  <span className="font-bold text-paa-navy">{new Date(viewBuyerInfoOrder.createdAt || viewBuyerInfoOrder.date).toLocaleString('en-IN')}</span>
                </div>
                {viewBuyerInfoOrder.acceptedAt && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Accepted</span>
                    <span className="font-bold text-paa-navy">{new Date(viewBuyerInfoOrder.acceptedAt).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {viewBuyerInfoOrder.dispatchedAt && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Dispatched</span>
                    <span className="font-bold text-paa-navy">{new Date(viewBuyerInfoOrder.dispatchedAt).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {(viewBuyerInfoOrder.deliveredAt || viewBuyerInfoOrder.status === 'Completed' || viewBuyerInfoOrder.status === 'Delivered') && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Delivered</span>
                    <span className="font-bold text-green-600">{viewBuyerInfoOrder.deliveredAt ? new Date(viewBuyerInfoOrder.deliveredAt).toLocaleString('en-IN') : 'Delivered'}</span>
                  </div>
                )}
                {(viewBuyerInfoOrder.deliveredAt || viewBuyerInfoOrder.status === 'Completed' || viewBuyerInfoOrder.status === 'Delivered') && (
                  <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-center font-bold text-green-600 bg-green-50 py-3 rounded-lg">
                    Took {Math.max(1, Math.ceil(((viewBuyerInfoOrder.deliveredAt ? new Date(viewBuyerInfoOrder.deliveredAt).getTime() : new Date().getTime()) - new Date(viewBuyerInfoOrder.createdAt || viewBuyerInfoOrder.date).getTime()) / (1000 * 3600 * 24)))} Days to Deliver
                  </div>
                )}
              </div>
            </div>
            
            {(viewBuyerInfoOrder.feedbackCondition || viewBuyerInfoOrder.feedbackRating) && (
              <div className="border-t border-paa-navy/10 pt-8">
                <p className="text-xs font-bold text-paa-navy uppercase tracking-widest mb-4">Customer Feedback</p>
                <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Condition</span>
                    <span className={`font-bold ${viewBuyerInfoOrder.feedbackCondition === 'Damaged' ? 'text-red-600' : 'text-paa-navy'}`}>{viewBuyerInfoOrder.feedbackCondition}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Delivery Rating</span>
                    <span className="font-medium text-yellow-500 text-lg">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>{i < (viewBuyerInfoOrder.feedbackRating || 0) ? '★' : '☆'}</span>
                      ))}
                    </span>
                  </div>
                  {viewBuyerInfoOrder.feedbackComments && (
                    <div className="text-sm italic text-gray-600 border-t border-gray-200 mt-4 pt-4">
                      "{viewBuyerInfoOrder.feedbackComments}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column: Bill/Breakdown */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden sticky top-6">
              <div className="bg-paa-navy text-white px-6 py-4">
                <p className="text-sm font-bold uppercase tracking-widest">Order Bill</p>
              </div>
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {viewBuyerInfoOrder.books.map((b: any, idx: number) => {
                    const allBooks = [
                      ...(fictionData.fiction_catalogue || []).flatMap((a: any) => a.books || []),
                      ...(nonFictionData.non_fiction_catalogue || []).flatMap((a: any) => a.books || [])
                    ];
                    const matchedBook = allBooks.find(item => item.title === b.title);
                    return (
                      <div key={idx} className="flex justify-between items-start text-sm">
                        <div className="flex items-start gap-3 pr-4">
                          {matchedBook && matchedBook.cover_image_url ? (
                            <img src={matchedBook.cover_image_url} alt={b.title} className="w-12 h-16 object-cover rounded shadow-sm border border-gray-200 shrink-0" />
                          ) : (
                            <div className="w-12 h-16 bg-gray-100 rounded shadow-sm border border-gray-200 flex items-center justify-center shrink-0">
                              <BookOpen size={16} className="text-gray-400" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            {matchedBook ? (
                              <Link to={`/book/${matchedBook.id}`} className="text-gray-700 font-bold hover:text-[#4a90e2] transition-colors leading-tight mb-1" target="_blank">
                                {b.title}
                              </Link>
                            ) : (
                              <span className="text-gray-700 font-bold leading-tight mb-1">{b.title}</span>
                            )}
                            <span className="text-gray-400 text-xs font-medium uppercase tracking-widest">Qty: {b.quantity}</span>
                          </div>
                        </div>
                        <span className="font-bold text-paa-navy whitespace-nowrap mt-1">₹{b.amount}</span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="border-t border-gray-200 pt-4 space-y-3 mb-6">
                  {viewBuyerInfoOrder.deliveryCharges !== undefined && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Delivery Charges</span>
                      <span className="font-bold text-paa-navy">{viewBuyerInfoOrder.deliveryCharges === 0 ? 'FREE' : `₹${viewBuyerInfoOrder.deliveryCharges}`}</span>
                    </div>
                  )}
                  {viewBuyerInfoOrder.bundleDiscount > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span className="font-medium">Bundle Discount</span>
                      <span className="font-bold">-₹{viewBuyerInfoOrder.bundleDiscount}</span>
                    </div>
                  )}
                </div>
                
                <div className="bg-paa-navy/5 -mx-6 -mb-6 p-6 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-paa-navy font-bold uppercase tracking-widest">Total Paid</span>
                    <span className="text-2xl font-bold text-paa-navy">₹{viewBuyerInfoOrder.totalAmount || viewBuyerInfoOrder.orderAmount}</span>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 border-b border-gray-100 pb-2">Payment Info</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Transaction ID</span>
                      <span className="font-bold font-mono text-paa-navy">{viewBuyerInfoOrder.transactionId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Status</span>
                      <span className={`font-bold ${viewBuyerInfoOrder.paymentVerified ? 'text-green-600' : viewBuyerInfoOrder.paymentFailed ? 'text-red-600' : 'text-yellow-600'}`}>
                        {viewBuyerInfoOrder.paymentVerified ? 'Verified' : viewBuyerInfoOrder.paymentFailed ? 'Failed' : 'Pending Verification'}
                      </span>
                    </div>
                    {viewBuyerInfoOrder.paymentScreenshot && (
                      <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-100">
                        <span className="text-gray-500">Receipt</span>
                        <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${viewBuyerInfoOrder.paymentScreenshot}`} target="_blank" rel="noreferrer" className="font-bold text-[#4a90e2] underline uppercase tracking-widest text-[10px]">View Image</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-paa-navy/5 pb-4">
        <div>
          <h2 className="text-2xl font-serif text-paa-navy tracking-tight">My Web Orders</h2>
          <p className="text-sm text-paa-gray-text mt-1">Manage pending orders and track dispatched shipments.</p>
        </div>
        <button onClick={() => {
          const headers = ['Order ID', 'Date', 'Book', 'Customer Name', 'Customer Email', 'Customer Phone', 'Address', 'Status', 'Quantity', 'Amount'];
          const rows = filteredOrders.map((o: any) => [
            o.orderId,
            `"${o.date}"`,
            `"${o.title}"`,
            `"${o.customerName}"`,
            o.customerEmail,
            o.customerPhone,
            `"${o.address?.replace(/\n/g, ' ')}"`,
            o.status,
            o.quantity,
            o.total
          ]);
          const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement('a');
          link.setAttribute('href', encodedUri);
          link.setAttribute('download', 'author_orders_export.csv');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }} className="flex items-center gap-2 bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow transition-colors shrink-0">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* ── Order Tracking KPIs ── */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="dash-kpi-card green" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
            <Check size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-paa-gray-text mb-1">Successful Orders</p>
            <h3 className="text-2xl font-bold text-paa-navy">{orders.filter((o: any) => o.status === 'Completed' || o.status === 'Delivered').length}</h3>
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
        <div className="dash-kpi-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Package size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-paa-gray-text mb-1">To Be Dispatched</p>
            <h3 className="text-2xl font-bold text-paa-navy">{orders.filter((o: any) => o.status === 'Accepted').length}</h3>
          </div>
        </div>
        <div className="dash-kpi-card blue" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <MapPin size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-paa-gray-text mb-1">Under Delivery</p>
            <h3 className="text-2xl font-bold text-paa-navy">{orders.filter((o: any) => o.status === 'Dispatched').length}</h3>
          </div>
        </div>
        <div className="dash-kpi-card border border-red-500/20" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#fef2f2' }}>
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-red-500 mb-1">Late Deliveries</p>
            <h3 className="text-2xl font-bold text-red-600">{orders.filter((o: any) => o.dispatchedAt && (new Date(o.dispatchedAt).getTime() - new Date(o.createdAt).getTime() > 24 * 60 * 60 * 1000)).length}</h3>
          </div>
        </div>
        <div className="dash-kpi-card border border-red-500/20" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#fef2f2' }}>
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <TrendingDown size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-red-500 mb-1">Late Fines</p>
            <h3 className="text-2xl font-bold text-red-600">₹{dashboardData?.authorProfile?.extraData?.lateFines || 0}</h3>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar max-w-full">
          {['All', 'Pending', 'Accepted', 'Dispatched', 'Delivered', 'Completed', 'Rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${filterStatus === status ? 'bg-paa-navy text-paa-cream' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64 shrink-0">
          <input
            type="text"
            placeholder="Search Orders..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-paa-navy/10 rounded-full text-sm outline-none focus:border-paa-navy transition-colors"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="bg-white border border-paa-navy/5 rounded-xl shadow-sm overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#f0f4f8] text-paa-navy uppercase tracking-widest text-[10px] border-b border-paa-navy/5">
              <tr>
                <th className="px-5 py-4 font-bold">Order Details</th>
                <th className="px-5 py-4 font-bold">Buyer Information</th>
                <th className="px-5 py-4 font-bold">Book Title</th>
                <th className="px-5 py-4 font-bold text-center">Qty</th>
                <th className="px-5 py-4 font-bold text-center">Amount</th>
                <th className="px-5 py-4 font-bold text-center">Payment</th>
                <th className="px-5 py-4 font-bold text-center w-32">Status</th>
                <th className="px-5 py-4 font-bold text-center w-32">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groupedOrdersList.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500 italic">No orders found.</td></tr> : groupedOrdersList.map((ord: any, idx: number) => {
                const orderDate = new Date(ord.createdAt || ord.date);
                const isSlaBreached = (new Date().getTime() - orderDate.getTime()) / (1000 * 60 * 60) > 24 && ['Pending Verification', 'Pending'].includes(ord.status);
                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-paa-navy tracking-wide text-xs">ORD-{ord.orderId}</p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">{ord.date}</p>
                      {isSlaBreached && <span className="text-[9px] font-bold text-white bg-red-600 px-2 py-0.5 rounded uppercase tracking-widest mt-1.5 inline-block animate-pulse">SLA Breached</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-paa-navy text-xs truncate">{ord.customerName}</p>
                          <p className="text-[10px] text-gray-500 truncate mt-0.5" title={ord.address}>{ord.address}</p>
                        </div>
                      </div>
                      {ord.customerPhone && <p className="text-[9px] font-bold text-[#4a90e2] mt-1">{ord.customerPhone}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-2 max-w-[200px]">
                        {ord.books.map((b: any, i: number) => (
                          <div key={i} className="border-b border-gray-100 last:border-0 pb-1 last:pb-0">
                            <p className="font-medium text-paa-navy text-xs truncate" title={b.title}>{b.title}</p>
                            <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">Qty: {b.quantity} &nbsp;&middot;&nbsp; ₹{b.amount}</p>
                          </div>
                        ))}
                        {ord.order?.totalDiscount > 0 && <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded inline-block w-max mt-1">Discount Applied</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center font-bold text-paa-navy">{ord.totalQuantity}</td>
                    <td className="px-5 py-4 text-center font-bold text-paa-navy">₹{ord.totalAmount}</td>
                    <td className="px-5 py-4 text-center align-middle">
                      {ord.paymentScreenshot ? (
                        <div className="flex flex-col items-center gap-2">
                          <a
                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${ord.paymentScreenshot}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[9px] font-bold text-paa-navy bg-gray-50 border border-gray-200 hover:border-[#4a90e2] hover:text-[#4a90e2] px-2.5 py-1 rounded transition-colors tracking-widest uppercase"
                          >
                            <ExternalLink size={10} /> Receipt
                          </a>
                          {ord.paymentVerified && (
                            <span className="text-[9px] font-bold text-green-600 tracking-widest uppercase flex items-center gap-1"><Check size={12} className="text-green-500" /> Verified</span>
                          )}
                        </div>
                      ) : <span className="text-[9px] text-gray-400 italic">N/A</span>}
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex flex-col gap-2 items-center w-full max-w-[120px] mx-auto">
                        
                        {/* Status Badge */}
                        {ord.status === 'Pending Verification' || ord.status === 'Pending' ? (
                          <span className="inline-flex items-center justify-center w-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-full border bg-yellow-50 text-yellow-800 border-yellow-200">
                            Pending
                          </span>
                        ) : (
                          <>
                            {editingStatusOrderId === String(ord.orderId) ? (
                              <select
                                className={`text-[9px] py-1.5 px-2 uppercase font-bold w-full text-center rounded-full border shadow-sm outline-none cursor-pointer ${ord.status === 'Completed' ? 'bg-[#43a047] text-white border-[#4cae4c]'
                                    : ord.status === 'Dispatched' ? 'bg-blue-100 text-blue-800 border-blue-200'
                                      : ord.status === 'Accepted' ? 'bg-[#eef2f6] text-paa-navy border-[#8faadc]'
                                        : ord.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200'
                                          : 'bg-yellow-50 text-yellow-800 border-yellow-200'
                                  }`}
                                value={ord.status === 'Completed' ? 'Delivered' : ord.status}
                                disabled={loadingAction !== null}
                                onChange={(e) => {
                                  handleStatusChange(ord.itemIds, e.target.value);
                                  setEditingStatusOrderId(null);
                                }}
                                onBlur={() => setEditingStatusOrderId(null)}
                                autoFocus
                              >
                                <option value="Accepted">Accepted</option>
                                <option value="Dispatched">Dispatched</option>
                              </select>
                            ) : (
                              <button
                                onClick={() => {
                                  if (ord.status !== 'Rejected' && ord.status !== 'Completed' && ord.status !== 'Delivered') {
                                    setEditingStatusOrderId(String(ord.orderId));
                                  }
                                }}
                                disabled={ord.status === 'Rejected' || ord.status === 'Completed' || ord.status === 'Delivered'}
                                className={`group flex items-center justify-between w-full px-3 py-1.5 rounded-full border transition-all ${
                                  ord.status === 'Completed' ? 'bg-[#43a047] text-white border-[#4cae4c] cursor-default'
                                  : ord.status === 'Dispatched' ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 cursor-pointer'
                                  : ord.status === 'Accepted' ? 'bg-gray-50 text-paa-navy border-gray-200 hover:bg-gray-100 cursor-pointer'
                                  : ord.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200 cursor-default'
                                  : 'bg-yellow-50 text-yellow-800 border-yellow-200 cursor-default'
                                }`}
                                title={ord.status !== 'Rejected' && ord.status !== 'Completed' && ord.status !== 'Delivered' ? 'Click to Edit Status' : ''}
                              >
                                <span className="text-[9px] font-bold uppercase tracking-widest mx-auto">{ord.status}</span>
                                {ord.status !== 'Rejected' && ord.status !== 'Completed' && ord.status !== 'Delivered' && (
                                  <Edit2 size={10} className="opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
                                )}
                              </button>
                            )}
                          </>
                        )}
                        
                        {/* Rejection Reason Text */}
                        {ord.status === 'Rejected' && ord.rejectionReason && (
                          <div className="mt-0.5 text-[9px] text-red-600 truncate w-full text-center" title={ord.rejectionReason}>
                            Reason: {ord.rejectionReason}
                          </div>
                        )}

                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex flex-col gap-2 items-center w-full max-w-[120px] mx-auto">
                        {/* Approve / Reject Actions */}
                        {(ord.status === 'Pending Verification' || ord.status === 'Pending') && (
                          <div className="flex w-full gap-1.5">
                            <button
                              onClick={() => handleApprove(ord.itemIds)}
                              disabled={loadingAction !== null}
                              className="flex-1 flex items-center justify-center text-[9px] font-bold uppercase tracking-widest py-1.5 bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 rounded border border-green-700 shadow-sm"
                            >
                              {loadingAction === String(ord.itemIds[0]) ? '...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => { setRejectItemId(ord.itemIds); setRejectReasons(['Item out of stock']); setOtherRejectReason(''); }}
                              disabled={loadingAction !== null}
                              className="flex-1 flex items-center justify-center text-[9px] font-bold uppercase tracking-widest py-1.5 bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50 rounded shadow-sm"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {/* View Button */}
                        <button
                          onClick={() => setViewBuyerInfoOrder(ord)}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-paa-navy hover:bg-gray-50 text-gray-600 rounded transition-colors text-[9px] font-bold uppercase tracking-widest shadow-sm"
                        >
                          <Eye size={12} className="text-gray-400" /> View Details
                        </button>
                        
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {loadingAction !== null && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-paa-navy">
          <div className="w-12 h-12 border-4 border-paa-navy border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-serif text-2xl font-medium">Processing Order...</p>
        </div>
      )}
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
      const res = await axios.get(`${API}/api/author/forms`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setForms(res.data);
    } catch (err) { }
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
      await axios.post(`${API}/api/author/forms/${selectedForm.id}/submit`, { answers }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      alert("Form submitted successfully!");
      setSelectedForm(null);
      fetchForms();
    } catch (err: any) {
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
              className={`px-4 py-2 text-xs font-bold tracking-widest uppercase transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-paa-navy text-paa-cream' : 'text-paa-navy border border-paa-navy hover:bg-paa-navy/5'
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


function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: React.ReactNode, children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl-2xl max-w-2xl w-full shadow-premium overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-paa-navy">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-gray-500 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

function EventsDashboard({ registrations }: any) {
  const [isOptInModalOpen, setIsOptInModalOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<any>(null);
  const [optInBooks, setOptInBooks] = useState<any[]>([]);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | number | null>(null);
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);

  const handleOpenOptIn = (evt: any) => {
    setSelectedInvite(evt);
    // Initialize all books as included with default stock 10
    setOptInBooks(books.map((b: any) => ({ bookId: b.id.toString(), title: b.title, stock: 10, included: true })));
    setPaymentScreenshot(null);
    setIsOptInModalOpen(true);
  };

  const handleOptInSubmit = async (action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        const fd = new FormData();
        const includedBooks = optInBooks.filter(b => b.included);
        fd.append('booksToLink', JSON.stringify(includedBooks));
        if (paymentScreenshot) {
          fd.append('paymentScreenshot', paymentScreenshot);
        }
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/events/${selectedInvite.id}/opt-in`, fd, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Successfully opted into event!');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/events/${selectedInvite.id}/opt-out`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Event invite declined.');
      }
      setIsOptInModalOpen(false);
      fetchAuthorEvents(); // refresh
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to process event invite');
    }
  };
  const [activeTab, setActiveTab] = useState('events');
  const [bpSort, setBpSort] = useState('revenue_desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('ALL');
  const [invites, setInvites] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [listedBooks, setListedBooks] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab 2 State
  const [selectedEventId, setSelectedEventId] = useState<string>('ALL');

  // Tab 3 State
  const [t3EventFilter, setT3EventFilter] = useState('ALL');
  const [t3YearFilter, setT3YearFilter] = useState('ALL');
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);

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
      setAvailableEvents(res.data.availableEvents || []);
      if (res.data.books && res.data.books.length > 0) {
        setSelectedBookIds(res.data.books.map((b: any) => b.id.toString()));
      }
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  // Combine invites and past events for the events list
  const allEvents = [
    ...(registrations || []).map((r: any) => ({
      id: 'act_' + r.activityId,
      name: r.activity?.name || 'Unknown Event',
      startDate: r.activity?.date,
      location: r.activity?.city,
      type: r.activity?.type || 'Activity',
      registration: r.status,
      paymentStatus: r.amount > 0 ? 'Paid' : 'Unpaid',
      amountPaid: r.amount || 0,
      isActivity: true
    })),
    ...invites.map((inv: any) => {
      const eventBooks = listedBooks.filter((lb: any) => lb.eventId === (inv.eventId || inv.event?.id));
      const hasGranular = eventBooks.some((lb: any) => (lb.soldStock > 0 || lb.returnedStock > 0));
      let calcPaid = 0;
      if (inv.optInStatus === 'Registered' || inv.optInStatus === 'Approved' || inv.optInStatus === 'Pending Approval') {
         if (inv.event?.feeType === 'Per Title') {
             calcPaid = (inv.event?.registrationFee || 0) * eventBooks.length;
         } else {
             calcPaid = (inv.event?.registrationFee || 0);
         }
      }
      return {
        ...inv.event,
        amountPaid: calcPaid,
        registration: inv.optInStatus,
        paymentStatus: inv.paymentStatus,
        transactionId: inv.transactionId,
        paymentProofUrl: inv.paymentProofUrl || inv.paymentScreenshotUrl || inv.paymentProof,
        manualTotalSold: inv.manualTotalSold,
        manualTotalRevenue: inv.manualTotalRevenue,
        isPast: inv.event?.status === 'Past' || inv.event?.status === 'Legacy Archive' || (inv.event?.date && new Date(inv.event.date) < new Date()),
        isInvite: true,
        isDataUpdated: inv.manualTotalSold !== null || hasGranular || inv.event?.broadcastStatus === 'Published',
        aggSold: inv.event?.aggSold || 0,
        aggRevenue: inv.event?.aggRevenue || 0,
        aggAuthors: inv.event?.aggAuthors || 0
      };
    }),
    ...availableEvents.map((evt: any) => ({
      ...evt,
      registration: 'Pending',
      paymentStatus: '-',
      isPast: evt.status === 'Past' || (evt.date && new Date(evt.date) < new Date()),
      isInvite: true
    })),
    ...pastEvents.filter((pe: any) => pe.broadcastStatus === 'Published' && !invites.some((inv: any) => inv.eventId === pe.id)).map((evt: any) => ({
      ...evt,
      registration: 'Not Participated',
      paymentStatus: '-',
      manualTotalSold: evt.aggSold || 0,
      manualTotalRevenue: evt.aggRevenue || 0,
      aggAuthors: evt.aggAuthors || 0,
      isPast: true,
      isInvite: false,
      isDataUpdated: true
    }))
  ].filter((evt: any) => {
     if (evt.status === 'Legacy Archive' && evt.broadcastStatus !== 'Published') {
         return false;
     }
     return true;
  });

  const getEventBooks = (eventId: number) => listedBooks.filter((lb: any) => lb.eventId === eventId);
  const getPastEventBooks = (eventId: number) => {
const pe = pastEvents.find(p => p.eventId === eventId);
    return pe?.books || [];
  };

  const validParticipations = allEvents.filter((evt: any) => {
    if (evt.registration === 'Registered' || evt.registration === 'Approved' || evt.registration === 'Pending Approval') return true;
    if (evt.status === 'Legacy Archive') return false;
    if (evt.isPast) {
      if (evt.isDataUpdated && (evt.isInvite ? getEventBooks(evt.id).length > 0 : getPastEventBooks(evt.id).length > 0)) return true;
    }
    return false;
  });

  const filteredEvents = allEvents.filter((evt: any) => {
    const isLegacy = evt.status === 'Legacy Archive';
    
    if (eventFilter === 'UPCOMING' && (evt.isPast || isLegacy)) return false;
    if (eventFilter === 'PAST' && (!evt.isPast || isLegacy)) return false;
    if (eventFilter === 'INVITES' && (evt.isPast || isLegacy || evt.registration !== 'Pending')) return false;
    if (eventFilter === 'LEGACY ARCHIVE' && !isLegacy) return false;
    if (eventFilter === 'PARTICIPATED' && (evt.registration !== 'Registered' && evt.registration !== 'Approved')) return false;
    
    if (searchTerm) {
        return (evt.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
               (evt.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  }).sort((a: any, b: any) => {
    const getRev = (evt: any) => {
        if (evt.status === 'Legacy Archive') return evt.aggRevenue || 0;
        if (evt.manualTotalRevenue != null) return evt.manualTotalRevenue;
        let r = 0;
        (evt.isInvite ? getEventBooks(evt.id) : (evt.books || [])).forEach((bk: any) => r += (bk.soldStock || 0) * (bk.mrp || bk.book?.mrp || 0));
        return r;
    };
    const getSold = (evt: any) => {
        if (evt.status === 'Legacy Archive') return evt.aggSold || 0;
        if (evt.manualTotalSold != null) return evt.manualTotalSold;
        let s = 0;
        (evt.isInvite ? getEventBooks(evt.id) : (evt.books || [])).forEach((bk: any) => s += (bk.soldStock || 0));
        return s;
    };
    
    if (bpSort === 'revenue_desc') return getRev(b) - getRev(a);
    if (bpSort === 'revenue_asc') return getRev(a) - getRev(b);
    if (bpSort === 'sold_desc') return getSold(b) - getSold(a);
    if (bpSort === 'date_desc') return new Date(b.date || b.startDate).getTime() - new Date(a.date || a.startDate).getTime();
    if (bpSort === 'date_asc') return new Date(a.date || a.startDate).getTime() - new Date(b.date || b.startDate).getTime();
    return 0;
  });

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(n => <div key={n} className="h-24 bg-gray-100 animate-pulse rounded-xl"></div>)}
      </div>
      <div className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>
      <div className="space-y-4">
        {[1,2,3].map(n => <div key={n} className="h-16 bg-gray-100 animate-pulse rounded-xl"></div>)}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl">
      <div className="flex border-b border-gray-200 mb-6">
        <button onClick={() => setActiveTab('events')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'events' ? 'bg-paa-navy text-white shadow-sm' : 'bg-white text-gray-500 hover:text-paa-navy hover:bg-paa-navy/5 border border-transparent'}`}>Events Overview</button>
        <button onClick={() => setActiveTab('performance')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'performance' ? 'bg-paa-navy text-white shadow-sm' : 'bg-white text-gray-500 hover:text-paa-navy hover:bg-paa-navy/5 border border-transparent'}`}>Book Performance</button>
        <button onClick={() => setActiveTab('payments')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'payments' ? 'bg-paa-navy text-white shadow-sm' : 'bg-white text-gray-500 hover:text-paa-navy hover:bg-paa-navy/5 border border-transparent'}`}>Payments History</button>
      </div>

      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-sm flex flex-col justify-center">
              <div className="text-[10px] font-bold text-paa-gray-text uppercase tracking-widest mb-2 flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-indigo-500" /> Total Events</div>
              <div className="text-3xl font-serif font-bold text-paa-navy">{validParticipations.length}</div>
              <div className="text-xs text-gray-500 mt-2 font-mono font-medium">Fairs: {validParticipations.filter((evt: any) => (evt.type || evt.eventType) === 'Book Fair').length} • Events: {validParticipations.filter((evt: any) => (evt.type || evt.eventType) !== 'Book Fair').length}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-sm flex flex-col justify-center">
              <div className="text-[10px] font-bold text-paa-gray-text uppercase tracking-widest mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4 text-emerald-500" /> Total Books Sold</div>
             <div className="text-3xl font-serif font-bold text-emerald-700">
                 {validParticipations.reduce((acc: number, evt: any) => {
                    let sold = 0;
                    if (evt.manualTotalSold !== null && evt.manualTotalSold !== undefined) {
                       sold = evt.manualTotalSold;
                    } else if (evt.isInvite) {
                       getEventBooks(evt.id).forEach((b: any) => sold += (b.soldStock || 0));
                    } else if (evt.isPast && evt.isDataUpdated) {
                       evt.books?.forEach((b: any) => sold += (b.soldStock || 0));
                    }
                    return acc + sold;
                 }, 0)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-sm flex flex-col justify-center">
              <div className="text-[10px] font-bold text-paa-gray-text uppercase tracking-widest mb-2 flex items-center gap-2"><DollarSign className="w-4 h-4 text-blue-500" /> Total Revenue</div>
              <div className="text-3xl font-serif font-bold text-blue-700">
                 ₹{validParticipations.reduce((acc: number, evt: any) => {
                    let rev = 0;
                    if (evt.manualTotalRevenue !== null && evt.manualTotalRevenue !== undefined) {
                       rev = evt.manualTotalRevenue;
                    } else if (evt.isInvite) {
                       getEventBooks(evt.id).forEach((b: any) => rev += (b.soldStock || 0) * (b.overrideMrp || b.mrp || b.book?.mrp || 0));
                    } else if (evt.isPast && evt.isDataUpdated) {
                       evt.books?.forEach((b: any) => rev += (b.soldStock || 0) * (b.overrideMrp || b.mrp || b.book?.mrp || 0));
                    }
                    return acc + rev;
                 }, 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col justify-center cursor-pointer hover:border-orange-200 transition-all group" onClick={() => setActiveTab('payments')}>
              <div className="text-[10px] font-bold text-paa-gray-text uppercase tracking-widest mb-2 flex items-center gap-2 group-hover:text-orange-500 transition-colors"><CheckCircle2 className="w-4 h-4 text-orange-500" /> Total Payments Done</div>
              <div className="text-3xl font-serif font-bold text-orange-700">₹{validParticipations.reduce((sum: number, evt: any) => sum + (evt.amountPaid || 0), 0).toLocaleString()}</div>
              <div className="text-[10px] text-orange-400 mt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Click to view details &rarr;</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-sm flex flex-col justify-center">
              <div className="text-[10px] font-bold text-paa-gray-text uppercase tracking-widest mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-indigo-500" /> Net Gain/Loss</div>
              <div className="text-3xl font-serif font-bold text-indigo-700">
                 {(() => {
                    const totalRev = validParticipations.reduce((acc: number, evt: any) => {
                       let rev = 0;
                       if (evt.manualTotalRevenue !== null && evt.manualTotalRevenue !== undefined) {
                          rev = evt.manualTotalRevenue;
                       } else if (evt.isInvite) {
                          getEventBooks(evt.id).forEach((b: any) => rev += (b.soldStock || 0) * (b.overrideMrp || b.mrp || b.book?.mrp || 0));
                       } else if (evt.isPast && evt.isDataUpdated) {
                          evt.books?.forEach((b: any) => rev += (b.soldStock || 0) * (b.overrideMrp || b.mrp || b.book?.mrp || 0));
                       }
                       return acc + rev;
                    }, 0);
                    const totalPaid = validParticipations.reduce((sum: number, evt: any) => sum + (evt.amountPaid || 0), 0);
                    const net = totalRev - totalPaid;
                    return <span className={net >= 0 ? "text-emerald-700" : "text-red-600"}>{net >= 0 ? '+' : '-'}₹{Math.abs(net).toLocaleString()}</span>;
                 })()}
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium mt-6 mb-8">
            <h4 className="text-sm font-serif font-semibold text-paa-navy mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-indigo-500" /> Event Profitability (Net Gain/Loss)</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {(() => {
                   const profitData = allEvents
                     .filter((evt: any) => evt.status !== 'Legacy Archive' && evt.name !== 'Unknown Event')
                     .map((evt: any) => {
                      let rev = 0;
                      if (evt.manualTotalRevenue !== null && evt.manualTotalRevenue !== undefined) {
                          rev = evt.manualTotalRevenue;
                      } else if (evt.isInvite) {
                          getEventBooks(evt.id).forEach((b: any) => rev += (b.soldStock || 0) * (b.overrideMrp || b.mrp || b.book?.mrp || 0));
                      } else if (evt.isPast && evt.isDataUpdated) {
                          evt.books?.forEach((b: any) => rev += (b.soldStock || 0) * (b.overrideMrp || b.mrp || b.book?.mrp || 0));
                      }
                      const cost = evt.amountPaid || 0;
                      return { name: evt.name || evt.title || 'Unknown', profit: rev - cost };
                   });
                   
                   if (profitData.length === 0) return <div className="flex items-center justify-center h-full text-sm text-gray-400 italic">No profitability data available.</div>;
                   
                   return (
                     <BarChart data={profitData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={10} tickFormatter={(v) => v.length > 15 ? v.substring(0, 15) + '...' : v} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                       <Tooltip cursor={{ fill: '#F3F4F6' }} formatter={(value: number) => `₹${value.toLocaleString()}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                       <Bar dataKey="profit" name="Net Profit/Loss" radius={[4, 4, 0, 0]} maxBarSize={40}>
                         {profitData.map((entry: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#059669' : '#dc2626'} />
                         ))}
                       </Bar>
                     </BarChart>
                   );
                })()}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
             <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
               {['ALL', 'PARTICIPATED', 'UPCOMING', 'PAST', 'INVITES', 'LEGACY ARCHIVE'].map((f) => (
                 <button key={f} onClick={() => setEventFilter(f)} className={`px-5 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${eventFilter === f ? 'bg-white text-paa-navy shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>{f === 'ALL' ? 'All Events' : (f === 'PARTICIPATED' ? 'Participated' : (f === 'UPCOMING' ? 'Upcoming & Live' : (f === 'PAST' ? 'Past Events' : (f === 'LEGACY ARCHIVE' ? 'Legacy Archive' : 'Invites'))))}</button>
               ))}
             </div>
             <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Search events..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" />
             </div>
          </div>
          
          <div className="mb-6 p-4 bg-indigo-50/50 rounded-xl border border-dashed border-indigo-200 flex items-start gap-3">
             <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
             <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                <strong className="block mb-1 text-sm">Legacy Archive Data Notice</strong>
                For events marked as <span className="bg-white px-1.5 py-0.5 rounded text-indigo-800 font-bold shadow-sm">LEGACY ARCHIVE</span>, the sales and revenue numbers shown are <b>cumulative across all participating authors</b>, not your individual sales.
             </p>
          </div>
          
          <div className="flex justify-between items-end mb-4">
            <h4 className="font-bold text-paa-navy text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-500" /> Event Performance Breakdown</h4>
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sort By:</span>
                <select className="border border-gray-200 rounded-lg text-sm font-bold text-paa-navy p-2 outline-none cursor-pointer bg-white" value={bpSort} onChange={e => setBpSort(e.target.value)}>
                    <option value="revenue_desc">Highest Revenue</option>
                    <option value="revenue_asc">Lowest Revenue</option>
                    <option value="sold_desc">Most Copies Sold</option>
                    <option value="date_desc">Newest Events</option>
                    <option value="date_asc">Oldest Events</option>
                </select>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-premium border border-paa-navy/5 overflow-hidden mb-8">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#f0f4f8] text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">
                  <th className="px-6 py-4 w-12 text-center"></th>
                  <th className="px-4 py-4 w-1/4">Event Name</th>
                  <th className="px-4 py-4 w-32">Date</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4 text-right">Books Sold</th>
                  <th className="px-4 py-4 text-right">Revenue</th>
                  {eventFilter === 'LEGACY ARCHIVE' ? (
                    <th className="px-4 py-4 text-center">Authors</th>
                  ) : (
                    <>
                      <th className="px-4 py-4 text-right">Payment</th>
                      <th className="px-4 py-4 text-right">Gain/Loss</th>
                    </>
                  )}
                  <th className="px-4 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEvents.length === 0 && <tr><td colSpan={10} className="p-8 text-center text-sm text-paa-gray-text italic">No events found.</td></tr>}
                {filteredEvents.map((evt: any, i: number) => {
                  let sold = 0;
                  let rev = 0;
                  if (evt.status === 'Legacy Archive') {
                    sold = evt.aggSold || 0;
                    rev = evt.aggRevenue || 0;
                  } else if (evt.manualTotalSold !== null && evt.manualTotalSold !== undefined) {
                    sold = evt.manualTotalSold;
                    rev = evt.manualTotalRevenue || 0;
                  } else if (evt.isInvite) {
                    const evtBooks = getEventBooks(evt.id);
                    evtBooks.forEach((b: any) => {
                      sold += (b.soldStock || 0);
                      rev += (b.soldStock || 0) * (b.overrideMrp || b.mrp || b.book?.mrp || 0);
                    });
                  } else if (evt.isPast && evt.isDataUpdated) {
                    evt.books?.forEach((b: any) => {
                      sold += (b.soldStock || 0);
                      rev += (b.soldStock || 0) * (b.overrideMrp || b.mrp || b.book?.mrp || 0);
                    });
                  }

                  return (
                    <React.Fragment key={i}>
                    <tr className={`hover:bg-gray-50 transition-colors ${expandedEventId === evt.id ? 'bg-gray-50' : ''}`}>
                      <td className="pl-6 pr-2 py-3 text-center cursor-pointer" onClick={() => { 
                         setExpandedEventId(expandedEventId === evt.id ? null : evt.id);
                         if (expandedEventId !== evt.id && evt.isInvite && evt.registration === 'Pending' && !evt.isPast) {
                            setSelectedInvite(evt);
                            setOptInBooks(books.map((b: any) => ({ bookId: b.id.toString(), title: b.title, stock: 10, included: true })));
                            setPaymentScreenshot(null);
                         }
                      }}>
                         <button className="text-gray-400 hover:text-paa-navy transition-colors">
                            {expandedEventId === evt.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                         </button>
                      </td>
                      <td className="px-4 py-3">
                         <div className="text-sm font-semibold text-paa-navy">{evt.name}</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-paa-gray-text">{new Date(evt.startDate || evt.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm font-semibold">
                         <div className="flex flex-col items-start gap-1">
                             <div className="flex gap-1 mb-1 flex-wrap">
                                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${evt.status === 'Legacy Archive' ? 'bg-indigo-100 text-indigo-800' : (evt.isPast ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800')}`}>
                                   {evt.status === 'Legacy Archive' ? 'Legacy Archive' : (evt.type || (evt.isPast ? 'Past Event' : 'Upcoming/Live'))}
                                 </span>
                                 {evt.eventType && (
                                     <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-700">
                                       {evt.eventType}
                                     </span>
                                 )}
                             </div>
                             {(evt.status === 'Legacy Archive' || evt.registration === 'Not Participated') && evt.aggAuthors > 0 && (
                               <div className="text-[10px] text-gray-500 font-mono mt-1">{evt.aggAuthors} Authors</div>
                             )}
                         </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-paa-navy text-right">{sold > 0 || (evt.manualTotalSold !== null && evt.manualTotalSold !== undefined) ? sold : '-'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-700 text-right">{rev > 0 || (evt.manualTotalRevenue !== null && evt.manualTotalRevenue !== undefined) ? `₹${rev}` : '-'}</td>
                      {eventFilter === 'LEGACY ARCHIVE' ? (
                        <td className="px-4 py-3 text-sm font-bold text-paa-navy text-center">
                           {evt.aggAuthors || '-'}
                        </td>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-sm font-bold text-orange-700 text-right">
                             {evt.amountPaid ? `₹${evt.amountPaid}` : (evt.isPast ? '-' : (evt.registrationFee ? `₹${evt.registrationFee}${evt.feeType === 'Per Title' ? '/title' : ''}` : '-'))}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-right">
                             {(() => {
                                 let gain = 0;
                                 if (evt.status === 'Legacy Archive') return <span className="text-gray-400 font-bold">NA</span>;
                                 if (evt.isPast) {
                                     let eventRev = 0;
                                     if (evt.manualTotalRevenue !== null && evt.manualTotalRevenue !== undefined) {
                                         eventRev = evt.manualTotalRevenue;
                                     } else {
                                         (evt.isInvite ? getEventBooks(evt.id) : (evt.books || [])).forEach((b: any) => eventRev += (b.soldStock || 0) * (b.overrideMrp || b.mrp || b.book?.mrp || 0));
                                     }
                                     gain = eventRev - (evt.amountPaid || 0);
                                     return <span className={`px-2 py-0.5 rounded text-[10px] font-bold shadow-sm inline-block ${gain >= 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>{gain >= 0 ? '+' : '-'}₹{Math.abs(gain).toLocaleString()}</span>;
                                 }
                                 return <span className="text-gray-400">-</span>;
                             })()}
                          </td>
                        </>
                      )}
                      <td className="px-4 py-3 text-center">
                          {(() => {
                              let statusText = evt.registration;
                              let statusColors = 'bg-gray-100 text-gray-700';
                              
                              if (evt.registration === 'Registered' || evt.registration === 'Approved') {
                                  statusText = evt.isPast ? 'Participated' : 'Registered';
                                  statusColors = 'bg-emerald-100 text-emerald-700 border border-emerald-200';
                              } else if (evt.status === 'Legacy Archive') {
                                  const isFuture = evt.startDate || evt.date ? new Date(evt.startDate || evt.date) > new Date() : false;
                                  statusText = isFuture ? 'Upcoming' : 'Completed';
                                  statusColors = isFuture ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-600 border border-gray-200';
                              } else if (evt.isPast && !evt.isDataUpdated) {
                                  statusText = 'Completed';
                                  statusColors = 'bg-gray-100 text-gray-600 border border-gray-200';
                              } else if (evt.registration === 'Pending Approval') {
                                  statusText = 'Wait for Approval';
                                  statusColors = 'bg-yellow-100 text-yellow-700 border border-yellow-200';
                              } else if (evt.registration === 'Pending') {
                                  statusText = 'Pending Registration';
                                  statusColors = 'bg-orange-100 text-orange-700 border border-orange-200';
                              }
                              
                              return (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${statusColors}`}>
                                  {statusText}
                                </span>
                              );
                          })()}
                      </td>
                    </tr>
                    {expandedEventId === evt.id && (
                       <tr className="bg-[#f8fafc] border-b border-gray-100 shadow-inner">
                          <td colSpan={10} className="p-0">
                             <div className="flex flex-col xl:flex-row gap-8 px-8 py-6 border-l-4 border-indigo-400 ml-6 my-4 bg-white rounded-r-xl shadow-sm mr-6">
                                <div className="flex-1 min-w-[300px] flex flex-col gap-5">
                                   <div className="flex gap-6">
                                      <div className="w-40 shrink-0">
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1"><ImageIcon className="w-3 h-3"/> Event Banner</p>
                                          {evt.bannerUrl ? (
                                             <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-video relative group">
                                               <img src={evt.bannerUrl.startsWith('http') ? evt.bannerUrl : `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${evt.bannerUrl}`} alt="Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                             </div>
                                          ) : (
                                             <div className="aspect-video bg-gray-50 rounded-lg border border-gray-200 border-dashed flex items-center justify-center text-[10px] text-gray-400 italic">No Banner</div>
                                          )}
                                      </div>
                                      <div className="flex flex-col gap-4">
                                         <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Location</p>
                                            <p className="text-sm text-paa-navy font-semibold">{evt.location || evt.venue || 'TBA'}</p>
                                         </div>
                                         <div className="flex gap-6">
                                            <div>
                                               <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> Date & Timings</p>
                                               <p className="text-sm text-paa-navy font-semibold">{new Date(evt.startDate || evt.date).toLocaleDateString()} • {(evt.startTime && evt.endTime) ? `${evt.startTime}-${evt.endTime}` : 'TBA'}</p>
                                            </div>
                                            <div>
                                               <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1">Fee</p>
                                               <p className="text-sm text-emerald-700 font-bold">₹{evt.amountPaid || 0}</p>
                                            </div>

                                         </div>
                                      </div>
                                   </div>
                                   <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
                                      {evt.livePosEnabled && !evt.isPast && (
                                        <button onClick={() => window.open('/pos/' + evt.id, '_blank')} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-bold transition-colors shadow-sm whitespace-nowrap">
                                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Launch POS
                                        </button>
                                      )}
                                   </div>
                                </div>
                                <div className="w-px bg-gray-100 hidden xl:block"></div>
                                {evt.isInvite && evt.registration === 'Pending' && !evt.isPast ? (
                                    <div className="flex-1 min-w-[300px] flex flex-col animate-fade-in-up">
                                        <h4 className="font-bold text-sm text-gray-700 mb-3 border-b pb-2 flex items-center gap-2"><BookOpen className="w-4 h-4"/> Opt-In: Select Books</h4>
                                        <div className="flex-1 overflow-y-auto max-h-[250px] space-y-2 mb-4 pr-2">
                                            {optInBooks.map((b, idx) => (
                                              <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-200">
                                                <input type="checkbox" checked={b.included} onChange={e => { const newB = [...optInBooks]; newB[idx].included = e.target.checked; setOptInBooks(newB); }} className="text-paa-navy focus:ring-paa-navy rounded" />
                                                <span className="flex-1 text-sm font-medium text-gray-800 truncate">{b.title}</span>
                                                <input type="number" disabled={!b.included} value={b.stock} onChange={e => { const newB = [...optInBooks]; newB[idx].stock = parseInt(e.target.value) || 0; setOptInBooks(newB); }} className="w-16 p-1 text-xs border border-gray-300 rounded disabled:bg-gray-100 disabled:text-gray-400" min="0" />
                                              </div>
                                            ))}
                                        </div>
                                        {evt.registrationFee > 0 && (() => {
                                          const selectedBooksCount = optInBooks.filter((b: any) => b.included).length;
                                          const totalFee = evt.feeType === 'Per Title' ? evt.registrationFee * selectedBooksCount : evt.registrationFee;
                                          return (
                                          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 shadow-sm">
                                            <div className="flex justify-between items-center mb-1">
                                              <div className="font-bold">Total Registration Fee:</div>
                                              <div className="text-xl font-black text-paa-navy">₹{totalFee}</div>
                                            </div>
                                            {evt.feeType === 'Per Title' && <div className="text-xs text-yellow-700 mb-3">(₹{evt.registrationFee} per title × {selectedBooksCount} selected)</div>}
                                            
                                            {totalFee > 0 && (
                                              <div className="flex flex-col sm:flex-row gap-4 mt-4 border-t border-yellow-200 pt-4">
                                                <div>
                                                   <div className="text-[10px] font-bold mb-2 uppercase tracking-widest text-yellow-900">Scan to Pay</div>
                                                   <img src={qrCode} alt="Payment QR" className="w-24 h-24 object-contain bg-white p-1 border border-yellow-300 rounded shadow-sm" />
                                                </div>
                                                <div className="flex-1 flex flex-col justify-center">
                                                   <label className="block text-[10px] font-bold mb-2 uppercase tracking-widest text-yellow-900">Upload Screenshot</label>
                                                   <input type="file" accept="image/*" onChange={(e) => setPaymentScreenshot(e.target.files?.[0] || null)} className="text-xs bg-white p-2 rounded border border-yellow-300 w-full" />
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                          );
                                        })()}
                                        <div className="flex gap-2 shrink-0 mt-auto">
                                            <button onClick={() => handleOptInSubmit('reject')} className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">Decline</button>
                                            <button onClick={() => handleOptInSubmit('approve')} className="flex-1 px-4 py-2 bg-paa-navy text-paa-cream rounded-lg text-sm font-bold hover:bg-paa-gold hover:text-paa-navy transition-colors shadow-sm">Submit Opt-In</button>
                                        </div>
                                    </div>
                                ) : (
                                <div className="flex-1 min-w-[300px] flex flex-col">
                                   <h4 className="font-bold text-sm text-gray-700 mb-4 flex items-center gap-2 border-b pb-2">
                                      {evt.isPast ? <><Package className="w-4 h-4" /> Sales Breakdown</> : <><BookOpen className="w-4 h-4" /> Book Inventory</>}
                                   </h4>
                                   <div className="flex-1 overflow-y-auto max-h-[250px] pr-1 space-y-2">
                                      {(() => {
                                         if (evt.status === 'Legacy Archive') {
                                             return (
                                                <div className="p-3">
                                                   <p className="text-xs text-gray-500 font-medium italic">Legacy aggregate data (no granular details available).</p>
                                                </div>
                                             );
                                         }
                                         if (evt.isPast && !evt.isDataUpdated) {
                                            return (
                                               <div className="text-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                                  <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                                  <p className="text-xs text-gray-500 font-medium">Data Pending. Sales records have not been published yet.</p>
                                               </div>
                                            );
                                         }
                                         const currentBooks = evt.isInvite ? getEventBooks(evt.id) : (evt.isPast ? getPastEventBooks(evt.id) : []);
                                         if (currentBooks.length === 0) return <p className="text-sm text-gray-500 italic">No inventory recorded.</p>;
                                         return currentBooks.map((b: any, j: number) => {
                                            const bDetails = books.find(book => book.id === b.bookId);
                                            return (
                                              <React.Fragment key={j}>
                                               <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm border border-gray-100">
                                                  <span className="font-semibold text-gray-800 line-clamp-1 flex-1 pr-2">{b.title || bDetails?.title || 'Unknown'}</span>
                                                  {evt.isPast ? (
                                                     <div className="flex items-center gap-3 text-[10px] font-mono shrink-0">
                                                        <div className="flex flex-col items-center"><span className="text-gray-400 font-bold">SENT</span><span className="text-gray-600">{b.listedStock || b.sent || 0}</span></div>
                                                        <div className="flex flex-col items-center"><span className="text-paa-navy font-bold">SOLD</span><span className="text-paa-navy text-xs font-black">{b.soldStock || b.sold || 0}</span></div>
                                                        <div className="flex flex-col items-end"><span className="text-emerald-600 font-bold">REV</span><span className="text-emerald-600 font-bold bg-emerald-50 px-1 rounded">₹{(b.soldStock || b.sold || 0) * (b.overrideMrp || b.mrp || b.book?.mrp || bDetails?.mrp || 0)}</span></div>
                                                     </div>
                                                  ) : (
                                                     <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                                                        <span className="text-gray-500" title="Listed">L: {b.listedStock}</span>
                                                        <span className="text-indigo-600 font-bold" title="Sold">S: {b.soldStock || 0}</span>
                                                     </div>
                                                  )}
                                               </div>
                                              </React.Fragment>
                                            )
                                         });
                                      })()}
                                   </div>
                                </div>
                                )}
                             </div>
                          </td>
                       </tr>
                    )}
                  </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}



      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-premium border border-paa-navy/5 overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                 <CheckCircle2 className="w-5 h-5 text-orange-500" />
                 <h3 className="text-lg font-bold text-paa-navy">Payments History</h3>
             </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-[#f0f4f8] text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">
                        <th className="px-6 py-4 w-1/4">Event Name</th>
                        <th className="px-4 py-4 w-48">Date & Location</th>
                        <th className="px-4 py-4">Transaction ID</th>
                        <th className="px-4 py-4 text-right">Amount Paid</th>
                        <th className="px-4 py-4 text-center">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {validParticipations.filter((e: any) => e.amountPaid > 0).length === 0 ? (
                          <tr><td colSpan={5} className="p-8 text-center text-sm text-paa-gray-text italic">No payment records found.</td></tr>
                      ) : (
                          validParticipations.filter((e: any) => e.amountPaid > 0).map((evt: any, idx: number) => (
                              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4">
                                      <div className="text-sm font-semibold text-paa-navy">{evt.name}</div>
                                  </td>
                                  <td className="px-4 py-4">
                                      <div className="text-sm font-medium text-paa-gray-text">{new Date(evt.startDate || evt.date).toLocaleDateString()}</div>
                                      <div className="text-[10px] text-gray-400 mt-1 truncate max-w-[200px]">{evt.location || evt.venue || 'TBA'}</div>
                                  </td>
                                  <td className="px-4 py-4 text-sm font-mono text-indigo-600">
                                      {evt.transactionId ? <span className="bg-indigo-50 px-2 py-1 rounded inline-block">{evt.transactionId}</span> : <span className="text-gray-400 italic text-[10px]">-</span>}
                                  </td>
                                  <td className="px-4 py-4 text-sm font-black text-orange-700 text-right">
                                      ₹{evt.amountPaid.toLocaleString()}
                                  </td>
                                  <td className="px-4 py-4 text-center">
                                      {(evt.paymentProofUrl || evt.paymentScreenshotUrl) ? (
                                          <a href={(evt.paymentProofUrl || evt.paymentScreenshotUrl).startsWith('http') ? (evt.paymentProofUrl || evt.paymentScreenshotUrl) : `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${evt.paymentProofUrl || evt.paymentScreenshotUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-xs font-bold shadow-sm">
                                              <ImageIcon className="w-3 h-3" /> View Proof
                                          </a>
                                      ) : (
                                          <span className="text-xs text-gray-400 italic">No Screenshot</span>
                                      )}
                                  </td>
                              </tr>
                          ))
                      )}
                    </tbody>
                 </table>
             </div>
          </div>
        </div>
      )}

            {activeTab === 'performance' && (() => {
                 let totalSent = 0;
                 let totalSold = 0;
                 let totalReturned = 0;
                 let totalRev = 0;
                 let bestEvent = { name: '-', rev: 0 };
                 let eventsWithSales = 0;
                 let eventStats: any[] = [];
                 let bookStats: Record<string, { sold: number, rev: number, title: string, sent: number, events: any[] }> = {};
                 
                 validParticipations.forEach(evt => {
                     let evtSent = 0;
                     let evtSold = 0;
                     let evtReturned = 0;
                     let evtRev = 0;
                     
                     let evtBooks: any[] = [];
                     if (evt.isInvite) evtBooks = getEventBooks(evt.id);
                     else if (evt.isPast && evt.isDataUpdated) evtBooks = evt.books || [];
                     
                     evtBooks.forEach((b: any) => {
                         const bId = b.bookId?.toString() || b.id?.toString();
                         if (selectedBookIds.length === 0 || selectedBookIds.includes(bId)) {
                             const listed = (b.listedStock || b.sent || 0);
                             const sold = (b.soldStock || b.sold || 0);
                             const returned = (b.returnedStock || b.returned || 0);
                             const rev = sold * (b.overrideMrp || b.mrp || b.book?.mrp || 0);
                             
                             evtSent += listed;
                             evtSold += sold;
                             evtReturned += returned;
                             evtRev += rev;
                             
                             if (bId && bId !== 'undefined') {
                                 if (!bookStats[bId]) {
                                     const bDetails = books.find(book => book.id.toString() === bId);
                                     bookStats[bId] = { sold: 0, rev: 0, sent: 0, title: b.title || bDetails?.title || 'Unknown', events: [] };
                                 }
                                 bookStats[bId].sold += sold;
                                 bookStats[bId].sent += listed;
                                 bookStats[bId].rev += rev;
                                 if (listed > 0 || sold > 0) {
                                     bookStats[bId].events.push({
                                         name: evt.name || 'Unknown Event',
                                         date: evt.date || evt.startDate,
                                         sent: listed,
                                         sold: sold,
                                         rev: rev
                                     });
                                 }
                             }
                         }
                     });
                     
                     totalSent += evtSent;
                     totalSold += evtSold;
                     totalReturned += evtReturned;
                     totalRev += evtRev;
                     
                     if (evtRev > 0) {
                         eventsWithSales++;
                         eventStats.push({ name: evt.name, rev: evtRev, date: evt.date || evt.startDate, sold: evtSold });
                     }
                 });
                 
                 const sellThroughNum = totalSent > 0 ? ((totalSold / totalSent) * 100) : 0;
                 const sellThrough = sellThroughNum.toFixed(1);
                 const returnRate = totalSent > 0 ? Math.max(0, 100 - sellThroughNum).toFixed(1) : 0;
                 
                 const avgRev = validParticipations.length > 0 ? Math.round(totalRev / validParticipations.length) : 0;
                 
                 let fastestMover = { title: '-', rate: 0 };
                 
                 const sortedEvents = eventStats.sort((a, b) => b.rev - a.rev);
                 bestEvent = sortedEvents[0] || { name: '-', rev: 0 };
                 const secondBestEvent = sortedEvents[1];
                 
                 const sortedBooks = Object.values(bookStats).sort((a, b) => b.rev - a.rev);
                 let bestBook = sortedBooks[0] || { title: '-', rev: 0, sold: 0 };
                 const secondBestBook = sortedBooks[1];
                 
                 Object.values(bookStats).forEach(bs => {
                     if (bs.sent > 0) {
                         const rate = (bs.sold / bs.sent) * 100;
                         if (rate >= fastestMover.rate && bs.sold > 0) {
                             if (rate > fastestMover.rate || bs.sold > (fastestMover.rate > 0 ? 0 : -1)) {
                                 fastestMover = { title: bs.title, rate };
                             }
                         }
                     }
                 });

                return (
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="mb-2">
              <label className="text-sm font-semibold text-gray-700 block mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-500" /> Analyze Specific Books:</label>
              <div className="flex flex-wrap gap-4">
                {books.map((b: any) => (
                  <label key={b.id} className="flex items-center gap-2 text-sm cursor-pointer bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm hover:border-indigo-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedBookIds.includes(b.id.toString())}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedBookIds([...selectedBookIds, b.id.toString()]);
                        else setSelectedBookIds(selectedBookIds.filter(id => id !== b.id.toString()));
                      }}
                      className="text-paa-navy focus:ring-paa-navy rounded border-gray-300"
                    />
                    <span className="font-medium text-gray-700">{b.title}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4">
                       <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col justify-center relative group cursor-default">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-indigo-400" /> Sell-Through Rate</div>
                          <div className="text-3xl font-serif font-bold text-indigo-700">{sellThrough}%</div>
                          <div className="text-[10px] text-orange-500 font-bold mt-1">Returns: {returnRate}%</div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none text-center shadow-lg">Percentage of the inventory you sent that successfully sold vs returned.</div>
                       </div>
                       <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col justify-center relative group cursor-default">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3 text-purple-400" /> Best Book</div>
                          <div className="text-lg font-serif font-bold text-purple-700" title={bestBook.title}>{bestBook.title}</div>
                          <div className="text-[10px] text-purple-500 font-bold mt-1">₹{bestBook.rev.toLocaleString()} • {bestBook.sold} Sold</div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none text-center shadow-lg">The specific title that generated the most gross revenue across all events.</div>
                       </div>
                       <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col justify-center relative group cursor-default">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-blue-400" /> Fastest Mover</div>
                          <div className="text-lg font-serif font-bold text-blue-700 truncate" title={fastestMover.title}>{fastestMover.title}</div>
                          <div className="text-[10px] text-blue-500 font-bold mt-1">{fastestMover.rate > 0 ? fastestMover.rate.toFixed(1) : 0}% Sold</div>
                          <div className="absolute top-full right-0 md:left-1/2 md:-translate-x-1/2 mt-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none text-center shadow-lg">The book with the highest sell-through rate overall.</div>
                       </div>

          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h4 className="font-bold text-paa-navy mb-4">Book Sales Performance Over Time</h4>
            <div className="w-full overflow-x-auto pb-4">
              <div className="h-64" style={{ minWidth: `${Math.max(100, validParticipations.length * 150)}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                {(() => {
                    const uniqueBooks = new Set<string>();
                    const chartData = validParticipations.map((evt: any) => {
                      let evtData: any = { name: evt.name.length > 15 ? evt.name.substring(0, 15) + '...' : evt.name };
                      let evtBooks: any[] = [];
                      if (evt.isInvite) evtBooks = getEventBooks(evt.id);
                      else if (evt.isPast && evt.isDataUpdated) evtBooks = evt.books || [];
                      evtBooks.forEach((b: any) => {
                        if (selectedBookIds.length === 0 || selectedBookIds.includes(b.bookId?.toString() || b.id?.toString())) {
                          const bTitle = b.title || b.book?.title || 'Unknown Book';
                          uniqueBooks.add(bTitle);
                          evtData[bTitle] = (evtData[bTitle] || 0) + (b.soldStock || b.sold || 0);
                        }
                      });
                      return evtData;
                    });
                    
                    const bookTitles = Array.from(uniqueBooks);
                    const colors = ['#1e3a8a', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0891b2', '#c026d3', '#ea580c', '#65a30d', '#4f46e5'];
                    
                    return (
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                          <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }} />
                          {bookTitles.map((title, idx) => (
                             <Bar key={idx} dataKey={title} name={title} fill={colors[idx % colors.length]} radius={[4, 4, 0, 0]} maxBarSize={30} />
                          ))}
                        </BarChart>
                    );
                })()}
              </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end mb-4">
            <h4 className="font-bold text-paa-navy text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-500" /> Book Performance Breakdown</h4>
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sort By:</span>
                <select className="border border-gray-200 rounded-lg text-sm font-bold text-paa-navy p-2 outline-none cursor-pointer bg-white" value={bpSort} onChange={e => setBpSort(e.target.value)}>
                    <option value="revenue_desc">Highest Revenue</option>
                    <option value="revenue_asc">Lowest Revenue</option>
                    <option value="sold_desc">Most Copies Sold</option>
                    <option value="rate_desc">Highest Sell-Through</option>
                </select>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-premium border border-paa-navy/5 overflow-hidden mb-8">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#f0f4f8] text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">
                  <th className="px-6 py-4 w-1/3">Book Title</th>
                  <th className="px-4 py-4 text-right">Copies Sent</th>
                  <th className="px-4 py-4 text-right">Copies Sold</th>
                  <th className="px-4 py-4 text-right">Sell-Through Rate</th>
                  <th className="px-4 py-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.keys(bookStats).length === 0 && <tr><td colSpan={5} className="p-8 text-center text-sm text-paa-gray-text italic">No books found.</td></tr>}
                {(() => {
                   const statsArray = Object.values(bookStats).map(bs => ({
                       ...bs,
                       rate: bs.sent > 0 ? (bs.sold / bs.sent) * 100 : 0
                   }));
                   
                   statsArray.sort((a, b) => {
                       if (bpSort === 'revenue_desc') return b.rev - a.rev;
                       if (bpSort === 'revenue_asc') return a.rev - b.rev;
                       if (bpSort === 'sold_desc') return b.sold - a.sold || b.rev - a.rev;
                       if (bpSort === 'rate_desc') return b.rate - a.rate || b.rev - a.rev;
                       return b.rev - a.rev;
                   });
                   
                   return statsArray.map((bs: any, i: number) => {
                  const isExpanded = expandedBookId === bs.title;
                  return (
                    <React.Fragment key={i}>
                      <tr onClick={() => setExpandedBookId(isExpanded ? null : bs.title)} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                        <td className="px-6 py-4 text-sm font-semibold text-paa-navy whitespace-normal flex items-center gap-2">
                           <div className={`transform transition-transform text-gray-400 group-hover:text-paa-navy ${isExpanded ? 'rotate-180' : ''}`}>▼</div>
                           {bs.title}
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-gray-700 text-right">{bs.sent > 0 ? bs.sent : '-'}</td>
                        <td className="px-4 py-4 text-sm font-bold text-paa-navy text-right">{bs.sold > 0 ? bs.sold : '-'}</td>
                        <td className="px-4 py-4 text-sm font-bold text-indigo-600 text-right">{bs.rate > 0 ? `${bs.rate.toFixed(1)}%` : '-'}</td>
                        <td className="px-4 py-4 text-sm font-black text-emerald-700 text-right">{bs.rev > 0 ? `₹${bs.rev.toLocaleString()}` : '-'}</td>
                      </tr>
                      {isExpanded && (
                          <tr>
                            <td colSpan={5} className="p-0 bg-gray-50 border-b border-gray-200">
                                <div className="p-4 pl-12">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <BookOpen className="w-3 h-3" /> Event Breakdown for {bs.title}
                                    </div>
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-200">
                                                <th className="pb-2 font-bold w-1/2">Event Name</th>
                                                <th className="pb-2 font-bold text-right">Date</th>
                                                <th className="pb-2 font-bold text-right">Sent</th>
                                                <th className="pb-2 font-bold text-right">Sold</th>
                                                <th className="pb-2 font-bold text-right">Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {bs.events?.length > 0 ? bs.events.map((ev: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-white transition-colors">
                                                    <td className="py-3 text-xs font-semibold text-paa-navy">{ev.name}</td>
                                                    <td className="py-3 text-[10px] text-gray-500 text-right">{new Date(ev.date).toLocaleDateString()}</td>
                                                    <td className="py-3 text-xs font-bold text-gray-700 text-right">{ev.sent > 0 ? ev.sent : '-'}</td>
                                                    <td className="py-3 text-xs font-bold text-paa-navy text-right">{ev.sold > 0 ? ev.sold : '-'}</td>
                                                    <td className="py-3 text-xs font-black text-emerald-700 text-right">{ev.rev > 0 ? `₹${ev.rev.toLocaleString()}` : '-'}</td>
                                                </tr>
                                            )) : <tr><td colSpan={5} className="py-4 text-center text-xs text-gray-400 italic">No events recorded.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                          </tr>
                      )}
                    </React.Fragment>
                  );
                })})()}
              </tbody>
            </table>
          </div>

        </div>
        );
      })()}
      
      <Modal isOpen={isOptInModalOpen} onClose={() => setIsOptInModalOpen(false)} title={`Review Invite: ${selectedInvite?.name}`}>
    {selectedInvite && (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="font-bold text-blue-900 mb-1">Event Invitation</h3>
          <p className="text-sm text-blue-800 mb-3">You have been invited to participate in this event. Please select the books you want to bring.</p>
          <details className="bg-white rounded-lg p-3 text-sm text-gray-700 border border-blue-200 cursor-pointer shadow-sm mb-4">
            <summary className="font-bold text-paa-navy focus:outline-none">View Event Details ▼</summary>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div><span className="font-semibold">Date:</span> {new Date(selectedInvite.startDate || selectedInvite.date).toLocaleDateString()}</div>
              <div><span className="font-semibold">Location:</span> {selectedInvite.location || selectedInvite.venue || 'TBA'}</div>
              <div><span className="font-semibold">Duration:</span> {selectedInvite.durationDays ? `${selectedInvite.durationDays} Days` : 'N/A'}</div>
              <div><span className="font-semibold">Type:</span> {selectedInvite.type || 'N/A'}</div>
              {selectedInvite.description && <div className="col-span-2"><span className="font-semibold">Description:</span> {selectedInvite.description}</div>}
            </div>
          </details>
          {selectedInvite.registrationFee > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 font-medium">
              Registration Fee: ₹{selectedInvite.registrationFee}
              <div className="mt-2">
                <label className="block text-xs font-bold mb-1">Upload Payment Screenshot</label>
                <input type="file" accept="image/*" onChange={(e) => setPaymentScreenshot(e.target.files?.[0] || null)} className="text-xs" />
              </div>
            </div>
          )}
        </div>

        <div>
          <h4 className="font-bold text-gray-800 mb-3 border-b pb-2">Select Books for Event</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {optInBooks.map((b, idx) => (
              <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${b.included ? 'border-paa-navy bg-paa-navy/5' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const newBooks = [...optInBooks];
                      newBooks[idx].included = !newBooks[idx].included;
                      setOptInBooks(newBooks);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${b.included ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                  >
                    {b.included ? '-' : '+'}
                  </button>
                  <div>
                    <div className={`font-semibold ${b.included ? 'text-paa-navy' : 'text-gray-400 line-through'}`}>{b.title}</div>
                    {b.included && <div className="text-xs text-gray-500">Status: Selected</div>}
                  </div>
                </div>
                {b.included && (
                  <div className="flex flex-col items-end">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Stock</label>
                    <input
                      type="number"
                      min="1"
                      value={b.stock}
                      onChange={(e) => {
                        const newBooks = [...optInBooks];
                        newBooks[idx].stock = parseInt(e.target.value) || 0;
                        setOptInBooks(newBooks);
                      }}
                      className="w-20 border border-gray-300 rounded p-1 text-center font-mono text-sm"
                    />
                  </div>
                )}
              </div>
            ))}
            {optInBooks.length === 0 && <p className="text-sm text-gray-500 italic">No approved books found in your catalog.</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button onClick={() => handleOptInSubmit('reject')} className="px-6 py-2 rounded-lg font-bold text-red-700 bg-red-50 hover:bg-red-100 transition-colors border border-red-200">Decline Invite</button>
          <button onClick={() => handleOptInSubmit('approve')} className="px-6 py-2 rounded-lg font-bold text-white bg-paa-navy hover:brightness-110 transition-all shadow-md">Accept & Register</button>
        </div>
      </div>
    )}
  </Modal>
    </div>
  );
}

function AuthorSalesReport({ data }: { data: any }) {
  const [reportPeriod, setReportPeriod] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customMonth, setCustomMonth] = useState(new Date().getMonth().toString());
  const [customYear, setCustomYear] = useState(new Date().getFullYear().toString());

  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const filterByDate = (date: Date) => {
    const now = new Date();
    if (reportPeriod === 'today') return date.toDateString() === now.toDateString();
    if (reportPeriod === 'week') {
      const startOfWeek = getStartOfWeek(now);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return date >= startOfWeek && date <= endOfWeek;
    }
    if (reportPeriod === 'month') {
      return date.getMonth() === parseInt(customMonth) && date.getFullYear() === parseInt(customYear);
    }
    if (reportPeriod === 'custom') {
      if (!customStartDate || !customEndDate) return true;
      const s = new Date(customStartDate);
      s.setHours(0, 0, 0, 0);
      const e = new Date(customEndDate);
      e.setHours(23, 59, 59, 999);
      return date >= s && date <= e;
    }
    return true; // lifetime
  };

  const webOrders = (data.authorOrders || []).filter((o: any) => o.paymentVerified && filterByDate(new Date(o.createdAt)));
  const posOrders = (data.posOrders || []).filter((o: any) => o.paymentStatus === 'CONFIRMED' && filterByDate(new Date(o.createdAt)));

  // Daily Aggregation
  const salesByDate: Record<string, { date: string, webSales: number, posSales: number, totalRevenue: number, totalBooks: number }> = {};

  const now = new Date();
  let rangeStart: Date | null = null;
  let rangeEnd: Date | null = null;

  if (reportPeriod === 'today') {
    rangeStart = new Date(now);
    rangeEnd = new Date(now);
  } else if (reportPeriod === 'week') {
    rangeStart = getStartOfWeek(now);
    rangeEnd = new Date(rangeStart);
    rangeEnd.setDate(rangeStart.getDate() + 6);
  } else if (reportPeriod === 'month') {
    rangeStart = new Date(parseInt(customYear), parseInt(customMonth), 1);
    rangeEnd = new Date(parseInt(customYear), parseInt(customMonth) + 1, 0);
  } else if (reportPeriod === 'custom' && customStartDate && customEndDate) {
    rangeStart = new Date(customStartDate);
    rangeEnd = new Date(customEndDate);
  }

  if (rangeStart && rangeEnd) {
    const curr = new Date(rangeStart);
    curr.setHours(0, 0, 0, 0);
    const end = new Date(rangeEnd);
    end.setHours(23, 59, 59, 999);
    while (curr <= end) {
      const d = curr.toLocaleDateString('en-GB');
      salesByDate[d] = { date: d, webSales: 0, posSales: 0, totalRevenue: 0, totalBooks: 0 };
      curr.setDate(curr.getDate() + 1);
    }
  }

  webOrders.forEach((o: any) => {
    const d = new Date(o.createdAt).toLocaleDateString('en-GB');
    if (!salesByDate[d]) salesByDate[d] = { date: d, webSales: 0, posSales: 0, totalRevenue: 0, totalBooks: 0 };
    salesByDate[d].webSales += o.amount;
    salesByDate[d].totalRevenue += o.amount;
    salesByDate[d].totalBooks += o.quantity;
  });

  posOrders.forEach((o: any) => {
    const d = new Date(o.createdAt).toLocaleDateString('en-GB');
    if (!salesByDate[d]) salesByDate[d] = { date: d, webSales: 0, posSales: 0, totalRevenue: 0, totalBooks: 0 };
    salesByDate[d].posSales += o.totalAmount;
    salesByDate[d].totalRevenue += o.totalAmount;

    const qty = o.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
    salesByDate[d].totalBooks += qty;
  }); const chartData = Object.values(salesByDate).sort((a, b) => {
    const [d1, m1, y1] = a.date.split('/');
    const [d2, m2, y2] = b.date.split('/');
    return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime();
  });

  const totalWebRevenue = webOrders.reduce((acc: number, o: any) => acc + o.amount, 0);
  const totalPosRevenue = posOrders.reduce((acc: number, o: any) => acc + o.totalAmount, 0);
  const totalBooksSold = chartData.reduce((acc, curr) => acc + curr.totalBooks, 0);
  const totalRevenue = totalWebRevenue + totalPosRevenue;
  const eventsParticipated = (data.eventInvites || []).filter((inv: any) => inv.optInStatus === 'Registered' || inv.optInStatus === 'Approved').length;

  const totalEventFees = (data.eventInvites || []).filter((inv: any) => inv.optInStatus === 'Registered').reduce((acc: number, inv: any) => {
    const evt = inv.event;
    if (!evt) return acc;
    if (evt.feeType === 'Flat Fee' || evt.feeType === 'Per Author') {
      return acc + (evt.registrationFee || 0);
    } else if (evt.feeType === 'Per Title') {
      const titlesCount = (data.listedBooks || []).filter((lb: any) => lb.eventId === evt.id).length;
      return acc + ((evt.registrationFee || 0) * titlesCount);
    }
    return acc;
  }, 0);
  const platformFeePaid = 1000;
  const totalFeesPaid = platformFeePaid + totalEventFees;

  const allTransactions = [
    ...webOrders.map((o: any) => ({
      rawDate: new Date(o.createdAt).getTime(),
      type: 'Web',
      date: new Date(o.createdAt).toLocaleString('en-GB'),
      id: `WEB-${o.orderId}`,
      customer: o.customerName || 'N/A',
      email: o.customerEmail || 'N/A',
      phone: o.customerPhone || 'N/A',
      address: (o.address || 'N/A').replace(/,/g, ' '),
      items: `${o.bookTitle} (x${o.quantity})`,
      quantity: o.quantity,
      amount: o.amount,
      status: o.status
    })),
    ...posOrders.map((o: any) => ({
      rawDate: new Date(o.createdAt).getTime(),
      type: 'POS',
      date: new Date(o.createdAt).toLocaleString('en-GB'),
      id: `POS-${o.id}`,
      customer: 'Walk-in',
      email: 'N/A',
      phone: 'N/A',
      address: 'N/A',
      items: o.items.map((i: any) => `${i.book.title} (x${i.quantity})`).join('; '),
      quantity: o.items.reduce((acc: number, i: any) => acc + i.quantity, 0),
      amount: o.totalAmount,
      status: o.paymentMethod
    }))
  ].sort((a, b) => b.rawDate - a.rawDate);

  const exportCSV = () => {
    let csv = 'Transaction Date,Order Type,Order ID,Customer Name,Email,Phone,Delivery Address,Books Included,Total Quantity,Total Amount,Status/Payment Method\n';
    allTransactions.forEach(tx => {
      csv += `"${tx.date}","${tx.type}","${tx.id}","${tx.customer}","${tx.email}","${tx.phone}","${tx.address}","${tx.items}","${tx.quantity}","₹${tx.amount}","${tx.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `detailed_sales_report_${reportPeriod}.csv`;
    a.click();
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-serif text-paa-navy font-bold tracking-tight">Sales & Revenue Report</h2>
          <p className="text-xs text-paa-gray-text font-bold uppercase tracking-widest mt-1">Track your earnings across platforms</p>
        </div>
        <button onClick={exportCSV} className="dash-btn dash-btn-primary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
          Export CSV
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6 bg-gray-50 p-2 rounded-xl border border-gray-200 inline-flex flex-wrap">
        {['today', 'week', 'month', 'lifetime', 'custom'].map(p => (
          <button key={p} onClick={() => setReportPeriod(p)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${reportPeriod === p ? 'bg-white shadow-sm text-paa-navy border border-gray-200' : 'text-gray-500 hover:text-paa-navy'}`}>
            {p === 'today' ? 'Today' : p === 'week' ? 'Week' : p === 'month' ? 'Month' : p === 'lifetime' ? 'Lifetime' : 'Custom'}
          </button>
        ))}

        {reportPeriod === 'custom' && (
          <div className="flex items-center gap-2 px-2 border-l border-gray-300 ml-2">
            <input type="date" className="border-none bg-white px-3 py-1.5 rounded text-xs shadow-sm" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} />
            <span className="text-gray-400">to</span>
            <input type="date" className="border-none bg-white px-3 py-1.5 rounded text-xs shadow-sm" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} />
          </div>
        )}

        {reportPeriod === 'month' && (
          <div className="flex items-center gap-2 px-2 border-l border-gray-300 ml-2">
            <select className="border-none bg-white px-3 py-1.5 rounded text-xs shadow-sm" value={customMonth} onChange={e => setCustomMonth(e.target.value)}>
              <option value="0">January</option>
              <option value="1">February</option>
              <option value="2">March</option>
              <option value="3">April</option>
              <option value="4">May</option>
              <option value="5">June</option>
              <option value="6">July</option>
              <option value="7">August</option>
              <option value="8">September</option>
              <option value="9">October</option>
              <option value="10">November</option>
              <option value="11">December</option>
            </select>
            <select className="border-none bg-white px-3 py-1.5 rounded text-xs shadow-sm" value={customYear} onChange={e => setCustomYear(e.target.value)}>
              <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
              <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
              <option value={new Date().getFullYear() - 2}>{new Date().getFullYear() - 2}</option>
            </select>
          </div>
        )}</div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Total Revenue</p>
          <div className="text-2xl font-bold text-paa-navy">₹{totalRevenue}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col justify-between relative group">
          <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Total Fees Paid</p>
          <div className="text-2xl font-bold text-red-600">₹{totalFeesPaid}</div>
          <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 w-max bg-gray-900 text-white text-xs p-2 rounded shadow-lg z-50">
            Platform Fee: ₹{platformFeePaid}<br />
            Event Fees: ₹{totalEventFees}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Web Sales</p>
          <div className="text-2xl font-bold text-blue-600">₹{totalWebRevenue}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">POS Sales</p>
          <div className="text-2xl font-bold text-purple-600">₹{totalPosRevenue}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Books Sold</p>
          <div className="text-2xl font-bold text-paa-navy">{totalBooksSold}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Events Attended</p>
          <div className="text-2xl font-bold text-emerald-600">{eventsParticipated}</div>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-6 mb-8">
        <h3 className="font-serif font-bold text-lg mb-6">Revenue Trend</h3>
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip cursor={{ fill: '#f8f9fa' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="webSales" name="Web Sales" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                <Bar dataKey="posSales" name="POS Sales" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">No sales data for this period.</div>
          )}
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b">
          <h3 className="font-serif font-bold text-lg">Daily Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Web Sales</th>
                <th>POS Sales</th>
                <th>Total Revenue</th>
                <th>Books Sold</th>
              </tr>
            </thead>
            <tbody>
              {chartData.length === 0 && (
                <tr><td colSpan={5} className="text-center py-6 text-gray-400">No data available</td></tr>
              )}
              {chartData.reverse().map((row, i) => (
                <tr key={i}>
                  <td className="font-semibold">{row.date}</td>
                  <td className="text-blue-600 font-semibold">₹{row.webSales}</td>
                  <td className="text-purple-600 font-semibold">₹{row.posSales}</td>
                  <td className="font-bold text-paa-navy">₹{row.totalRevenue}</td>
                  <td>{row.totalBooks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-serif font-bold text-lg">Detailed Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Books Included</th>
                <th>Amount</th>
                <th>Status / Mode</th>
              </tr>
            </thead>
            <tbody>
              {allTransactions.length === 0 && (
                <tr><td colSpan={7} className="text-center py-6 text-gray-400">No transactions found</td></tr>
              )}
              {allTransactions.map((tx, i) => (
                <tr key={i}>
                  <td className="text-xs text-gray-500 whitespace-nowrap">{tx.date}</td>
                  <td><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${tx.type === 'Web' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{tx.type}</span></td>
                  <td className="font-mono text-xs">{tx.id}</td>
                  <td className="font-semibold text-paa-navy">{tx.customer}</td>
                  <td className="text-sm max-w-xs truncate" title={tx.items}>{tx.items}</td>
                  <td className="font-bold text-emerald-600 whitespace-nowrap">₹{tx.amount}</td>
                  <td><span className="text-xs text-gray-500 font-bold uppercase tracking-widest bg-gray-100 px-2 py-1 rounded">{tx.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



export function AuthorProfile({ data, onRefresh, buttonStates, setButtonStates }: { data: any, onRefresh: () => void, buttonStates: any, setButtonStates: any }) {
  const authorProfile = data.authorProfile;
  const authorOrders = data.authorOrders || [];
  const location = useLocation();
  const { action: targetAction, bookId: targetBookId } = location.state || {};

  const [editProfileForm, setEditProfileForm] = useState({
    name: authorProfile.name || '',
    penName: authorProfile.penName || '',
    city: authorProfile.city || '',
    state: authorProfile.state || '',
    instagram: authorProfile.instagram || '',
    facebook: authorProfile.facebook || '',
    address: authorProfile.address || '',
    aadharNumber: authorProfile.aadharNumber || '',
    qualification: authorProfile.qualification || '',
    age: authorProfile.age || '',
    experience: authorProfile.experience || '',
    skills: authorProfile.skills || '',
    hobbies: authorProfile.hobbies || '',
    whyJoining: authorProfile.whyJoining || '',
    bio: authorProfile.bio || '',
    phone: authorProfile.phone || '',
    whatsapp: authorProfile.whatsapp || ''
  });
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [selectedGalleryEvent, setSelectedGalleryEvent] = useState<any>(null);
  const [galleryUploadFile, setGalleryUploadFile] = useState<File | null>(null);
  const [galleryUploadCaption, setGalleryUploadCaption] = useState('');
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);


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
        alert('Image uploaded successfully! It will appear in the gallery.');
        setGalleryUploadFile(null);
        setGalleryUploadCaption('');
        setSelectedGalleryEvent(null);
      } else {
        alert('Failed to upload image.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingGallery(false);
    }
  };

  return (
    <>
      <div className="animate-fade-in-up">
        <div className="flex justify-between items-center mb-6 border-b border-paa-navy/5 pb-4">
          <div>
            <h2 className="text-2xl font-serif text-paa-navy tracking-tight">Edit My Profile</h2>
            <p className="text-sm text-paa-gray-text mt-1">Keep your author bio, books, and details up to date.</p>
          </div>
        </div>

        {(() => {
          let hasPending = authorProfile.status === 'Edited';
          if (!hasPending && authorProfile.extraData) {
            try {
              const ed = typeof authorProfile.extraData === 'string' ? JSON.parse(authorProfile.extraData) : authorProfile.extraData;
              if (ed.hasPendingEdits) hasPending = true;
            } catch (e) { }
          }

          if (hasPending) {
            return (
              <div className="bg-white rounded-xl shadow-sm border border-paa-navy/5 p-12 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-blue-100">
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-serif text-paa-navy font-medium mb-3">Edits Pending Approval</h3>
                <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
                  You have already submitted profile updates that are currently under review by our editorial team.
                  You will be able to edit your profile again once these changes are approved.
                </p>
              </div>
            );
          }

          return (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <AuthorRegistrationPage
                initialData={authorProfile}
                isAuthorEdit={true}
                hideNavbar={true}
                targetAction={targetAction}
                targetBookId={targetBookId}
                onReapplySuccess={() => {
                  alert("Profile updated successfully! It is now pending admin approval.");
                  onRefresh();
                }}
              />
            </div>
          );
        })()}
      </div>

    </>
  );
}

function BundleOffersTab({ data }: { data: any }) {
  const authorProfile = data?.authorProfile || {};

  const initialRules = authorProfile?.extraData?.bundleRules || [];
  if (initialRules.length === 0 && authorProfile?.extraData?.bundleRule) {
    initialRules.push({
      id: 1,
      buyCount: authorProfile.extraData.bundleRule.buyCount,
      discount: authorProfile.extraData.bundleRule.discount,
      enabled: authorProfile.extraData.bundleRule.enabled
    });
  }

  const [bundleRules, setBundleRules] = useState<any[]>(initialRules.length > 0 ? initialRules : [
    { id: Date.now(), buyCount: 3, discount: 50, enabled: false }
  ]);
  const [bundleSaving, setBundleSaving] = useState(false);

  const handleSaveBundle = async () => {
    setBundleSaving(true);
    try {
      const extraData = authorProfile?.extraData || {};
      extraData.bundleRules = bundleRules;
      if (bundleRules.length > 0) {
        extraData.bundleRule = bundleRules[0];
      }
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/profile/extra`, { extraData }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Bundle Offers updated successfully!');
    } catch (err) {
      toast.error('Failed to update Bundle Offers');
    } finally {
      setBundleSaving(false);
    }
  };

  const addRule = () => {
    setBundleRules([...bundleRules, { id: Date.now(), buyCount: 2, discount: 20, enabled: true }]);
  };

  const removeRule = (id: number) => {
    setBundleRules(bundleRules.filter(r => r.id !== id));
  };

  const updateRule = (id: number, field: string, value: any) => {
    setBundleRules(bundleRules.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-paa-navy/5 shadow-sm">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-serif font-bold text-paa-navy tracking-tight">Dynamic Bundle Offers</h2>
          <p className="text-sm text-gray-500 mt-1">Configure automated discount rules for customers buying multiple books.</p>
        </div>
        <button onClick={addRule} className="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors uppercase tracking-widest flex items-center gap-1">
          <Plus size={14} /> Add Offer
        </button>
      </div>

      <div className="space-y-4">
        {bundleRules.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500 bg-gray-50 rounded-xl border border-gray-100">No active bundle offers. Click "Add Offer" to create one.</div>
        ) : bundleRules.map((rule, idx) => (
          <div key={rule.id} className="relative bg-white border border-gray-200 rounded-xl p-5 hover:border-paa-navy/20 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`bundleEnabled-${rule.id}`}
                  checked={rule.enabled}
                  onChange={e => updateRule(rule.id, 'enabled', e.target.checked)}
                  className="w-5 h-5 accent-paa-navy cursor-pointer"
                />
                <label htmlFor={`bundleEnabled-${rule.id}`} className={`text-sm font-bold ${rule.enabled ? 'text-paa-navy' : 'text-gray-400'} cursor-pointer`}>
                  {rule.enabled ? 'Active Offer' : 'Offer Disabled'}
                </label>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Buy Qty</label>
                  <input
                    type="number" min="2"
                    className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-semibold outline-none focus:border-paa-navy"
                    value={rule.buyCount}
                    onChange={e => updateRule(rule.id, 'buyCount', Number(e.target.value))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Discount (₹)</label>
                  <input
                    type="number" min="0"
                    className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-semibold outline-none focus:border-paa-navy"
                    value={rule.discount}
                    onChange={e => updateRule(rule.id, 'discount', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <p className="text-xs text-gray-500 bg-blue-50 px-3 py-1.5 rounded-full text-blue-800 font-medium">
                <strong>Preview:</strong> "Buy {rule.buyCount}+ books by this author, get ₹{rule.discount} off!"
              </p>
              <button onClick={() => removeRule(rule.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors" title="Remove Offer">
                <Minus size={16} />
              </button>
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-6 mt-6 border-t border-gray-100">
          <button
            onClick={handleSaveBundle}
            disabled={bundleSaving}
            className="dash-btn dash-btn-primary min-w-[200px]"
          >
            {bundleSaving ? 'Saving...' : 'Save Bundle Offers'}
          </button>
        </div>
      </div>
    </div>
  );
}




class GalleryErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Gallery Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 m-4 bg-red-50 border border-red-200 rounded-xl">
          <h2 className="text-xl font-bold text-red-700 mb-2">Gallery Component Crashed</h2>
          <p className="text-red-600 font-mono text-sm whitespace-pre-wrap">{this.state.error?.toString()}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AuthorGallery({ dashboardData }: { dashboardData: any }) {
  return (
    <GalleryErrorBoundary>
      <AuthorGalleryInner dashboardData={dashboardData} />
    </GalleryErrorBoundary>
  );
}

function AuthorGalleryInner({ dashboardData }: { dashboardData: any }) {
  const [galleries, setGalleries] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedGalleryEvent, setSelectedGalleryEvent] = React.useState<any>(null);
  const [galleryUploadFiles, setGalleryUploadFiles] = React.useState<File[]>([]);
  const [galleryUploadCaption, setGalleryUploadCaption] = React.useState('');
  const [isUploadingGallery, setIsUploadingGallery] = React.useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterType, setFilterType] = React.useState('');
  const [filterDate, setFilterDate] = React.useState('');
  const [sortBy, setSortBy] = React.useState('date_desc');

  React.useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/gallery/events`);
      setGalleries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadGalleryImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGalleryEvent || galleryUploadFiles.length === 0) return;
    try {
      setIsUploadingGallery(true);
      const token = localStorage.getItem('token');

      const promises = galleryUploadFiles.map(file => {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('caption', galleryUploadCaption);
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/gallery/${selectedGalleryEvent.id}/images`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
      });

      const responses = await Promise.all(promises);
      const newImages: any[] = [];
      for (const r of responses) {
        if (r.ok) {
          try { newImages.push(await r.json()); } catch (_) {}
        }
      }

      if (newImages.length > 0) {
        toast.success(`${newImages.length} image(s) uploaded successfully!`);
      } else {
        toast.error('Failed to upload images.');
      }
      setGalleryUploadFiles([]);
      setGalleryUploadCaption('');
      
      // Re-fetch galleries and update selectedGalleryEvent from fresh data
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/gallery/events`);
        setGalleries(res.data);
        const updatedEvent = res.data.find((ge: any) => ge.id === selectedGalleryEvent.id);
        if (updatedEvent) {
          setSelectedGalleryEvent(updatedEvent);
        }
      } catch (_) {
        fetchGalleries();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload image.');
    } finally {
      setIsUploadingGallery(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-paa-navy" /></div>;

  const filteredGalleries = galleries.filter(ge => {
    const matchSearch = (ge.type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                        (ge.location?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                        (ge.city?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchType = filterType ? ge.type === filterType : true;
    const matchDate = filterDate ? new Date(ge.date).toISOString().startsWith(filterDate) : true;
    return matchSearch && matchType && matchDate;
  }).sort((a: any, b: any) => {
    if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortBy === 'name_asc') return (a.event?.name || a.type || '').localeCompare(b.event?.name || b.type || '');
    if (sortBy === 'name_desc') return (b.event?.name || b.type || '').localeCompare(a.event?.name || a.type || '');
    return 0;
  });

  if (selectedGalleryEvent) {
    return (
        <div className="dash-panel animate-fade-in-up">
          <div className="dash-panel-header flex justify-between items-center">
            <div>
              <h3 className="dash-panel-title">{(selectedGalleryEvent.event?.name || selectedGalleryEvent.type) + ' @ ' + selectedGalleryEvent.location}</h3>
              <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest font-bold text-[10px]">Gallery Management</p>
            </div>
            <button onClick={() => { setSelectedGalleryEvent(null); setGalleryUploadFiles([]); }} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors">
              &larr; Back to Events
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-gray-50/30">
            {/* Upload Section */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-sm h-fit">
              <h4 className="text-sm font-bold uppercase tracking-widest text-paa-navy mb-4 border-b border-gray-100 pb-2">Upload New Photos</h4>
              <form onSubmit={handleUploadGalleryImage} className="flex flex-col gap-4">
                <div>
                  <label className="dash-label">Photos (Select Multiple) *</label>
                  <input type="file" multiple accept="image/*" className="dash-input text-xs w-full" onChange={e => {
                      if (e.target.files && e.target.files.length > 0) {
                          const selected = Array.from(e.target.files);
                          setGalleryUploadFiles(prev => [...prev, ...selected]);
                      }
                  }} />
                </div>
                {galleryUploadFiles.length > 0 && (
                   <div className="flex gap-2 overflow-x-auto py-2 px-1">
                      {galleryUploadFiles.map((file, i) => (
                         <div key={i} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-gray-200 group shadow-sm">
                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Preview" />
                            <button type="button" onClick={() => setGalleryUploadFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all">
                               <X size={12} />
                            </button>
                         </div>
                      ))}
                   </div>
                )}
                <div>
                  <label className="dash-label">Caption (Optional)</label>
                  <input className="dash-input w-full" placeholder="e.g., Book signing moment..." value={galleryUploadCaption} onChange={e => setGalleryUploadCaption(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setGalleryUploadFiles([])} className="px-6 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100">Clear</button>
                  <button type="submit" disabled={isUploadingGallery} className="dash-btn dash-btn-primary disabled:opacity-50">{isUploadingGallery ? 'Uploading...' : 'Upload Image'}</button>
                </div>
              </form>
            </div>

             {/* Existing Images Section */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-sm">
              <h4 className="text-sm font-bold uppercase tracking-widest text-paa-navy mb-4 border-b border-gray-100 pb-2">
                Your Uploaded Photos ({(selectedGalleryEvent.images?.filter((img: any) => String(img.caption || '').includes(`(Uploaded by ${dashboardData?.authorProfile?.name || ''})`)) || []).length})
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                 {(selectedGalleryEvent.images?.filter((img: any) => String(img.caption || '').includes(`(Uploaded by ${dashboardData?.authorProfile?.name || ''})`)) || []).map((img: any) => (
                    <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group bg-gray-100 border border-gray-200 shadow-sm">
                       <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${img.url || ''}`} className="w-full h-full object-cover" alt="Gallery photo" />
                       
                       <div className="absolute top-2 left-2 z-10">
                         <span className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-sm shadow-md ${img.status === 'Approved' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                           {img.status || 'Pending'}
                         </span>
                       </div>

                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-20">
                          <div className="flex justify-end items-start">
                             <button onClick={async () => {
                               if(window.confirm('Delete this photo completely?')) {
                                  try {
                                    await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/gallery/images/${img.id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                                    toast.success('Photo deleted.');
                                    setSelectedGalleryEvent({...selectedGalleryEvent, images: selectedGalleryEvent.images.filter((i: any) => i.id !== img.id)});
                                  } catch (err) { toast.error('Failed to delete photo.'); }
                               }
                            }} className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-sm">
                              <Trash2 size={12} />
                            </button>
                          </div>
                          
                          {img.caption && (
                             <p className="text-white text-xs line-clamp-2 mt-auto pb-1 px-1 font-medium leading-tight drop-shadow-md">
                               {String(img.caption).replace(/\(Uploaded by .*?\)/, '').trim()}
                             </p>
                          )}
                       </div>
                    </div>
                 ))}
                 {(!selectedGalleryEvent.images || selectedGalleryEvent.images.length === 0) && (
                    <div className="col-span-full py-16 text-center text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                       <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                       You haven't uploaded any photos for this event yet.
                    </div>
                 )}
              </div>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="dash-panel">
        <div className="dash-panel-header">
          <h2 className="dash-panel-title">Event Galleries</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-6">Select an event below to upload your photos. They will be shared in the public gallery instantly!</p>

          <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl border border-paa-navy/5 shadow-sm">
            <div className="flex-[3] min-w-[300px] relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="text" placeholder="Search by event, location, or city..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="dash-input w-full h-full min-w-[280px]" style={{ paddingLeft: '2.5rem' }} />
            </div>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="dash-input md:w-48">
              <option value="">All Types</option>
              {Array.from(new Set(galleries.map(g => g.type))).filter(Boolean).map((t: any) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="dash-input md:w-40" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="dash-input md:w-48">
              <option value="date_desc">Latest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGalleries.map(ge => (
              <div key={ge.id} className="group relative bg-white border border-paa-navy/10 rounded-xl overflow-hidden shadow-sm hover:shadow-premium transition-all duration-500 ease-out flex flex-col">
                <div className="relative h-48 w-full overflow-hidden bg-paa-navy/5 shrink-0">
                  {ge.images && ge.images.length > 0 ? (
                     <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${ge.images[0].url}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" alt="Event cover" />
                  ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-paa-navy/40 group-hover:scale-105 transition-transform duration-700 ease-in-out bg-gradient-to-br from-paa-cream to-gray-200">
                        <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                        <span className="text-xs font-bold uppercase tracking-widest text-paa-navy/60">No Photos Yet</span>
                     </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-paa-navy/90 via-paa-navy/40 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-serif font-bold text-white text-xl leading-tight line-clamp-1">{ge.event?.name || ge.type}</h3>
                    <p className="text-[10px] font-bold tracking-widest text-paa-gold uppercase mt-1 flex items-center gap-1.5">
                       <CalendarIcon size={12} /> {new Date(ge.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1 bg-white">
                  <div className="flex items-center justify-between mb-4">
                     <div>
                       <p className="text-sm font-bold text-paa-navy">{ge.location}</p>
                       <p className="text-xs text-gray-500 line-clamp-1">{ge.description || 'No description available'}</p>
                     </div>
                     <div className="text-right">
                       <span className="text-xl font-black text-paa-navy leading-none">{ge.images?.filter((i: any) => i.status === 'Approved').length || 0}</span>
                       <p className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Approved</p>
                     </div>
                  </div>

                  {ge.images && ge.images.length > 0 ? (
                    <div className="flex -space-x-2 overflow-hidden mb-5">
                      {ge.images.filter((img: any) => img.status === 'Approved').slice(0, 5).map((img: any, idx: number) => (
                        <div key={img.id} className="relative z-10 inline-block h-10 w-10 rounded-full ring-2 ring-white overflow-hidden bg-gray-100" style={{ zIndex: 10 - idx }}>
                          <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${img.url}`} className="w-full h-full object-cover" alt="Preview" />
                        </div>
                      ))}
                      {ge.images.filter((img: any) => img.status === 'Approved').length > 5 && (
                        <div className="relative z-0 flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-white bg-gray-50 border border-gray-200">
                          <span className="text-[10px] font-bold text-gray-500">+{ge.images.filter((img: any) => img.status === 'Approved').length - 5}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-10 mb-5 flex items-center">
                       <p className="text-xs text-gray-400 font-medium italic">Be the first to upload photos!</p>
                    </div>
                  )}

                  <div className="mt-auto">
                    <button onClick={() => setSelectedGalleryEvent(ge)} className="w-full dash-btn dash-btn-primary flex justify-center items-center gap-2 py-3 bg-paa-navy hover:bg-paa-gold hover:text-paa-navy hover:border-paa-gold transition-colors shadow-sm rounded-xl">
                       <Upload className="w-4 h-4" /> Upload Photos
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredGalleries.length === 0 && (
            <div className="py-20 text-center bg-gray-50 rounded-3xl-2xl border border-gray-100 shadow-inner mt-4">
               <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
               <p className="text-paa-navy font-serif text-xl">No active galleries found.</p>
               <p className="text-gray-500 text-sm mt-2">Adjust your filters to discover events.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




function AuthorReviews({ books }: { books: any[] }) {
  const booksWithReviews = books.filter(b => b.reviews && b.reviews.length > 0);

  if (booksWithReviews.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl-2xl border border-gray-100 border-dashed">
        <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-serif text-paa-navy">No reviews yet</h3>
        <p className="text-gray-500 text-sm mt-1">Your books haven't received any customer reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-2xl font-serif text-paa-navy tracking-tight">Customer Reviews & Ratings</h2>
        <p className="text-sm text-gray-500 mt-1">See what readers are saying about your published works.</p>
      </div>

      {booksWithReviews.map(book => {
        const avgRating = book.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / book.reviews.length;
        return (
          <div key={book.id} className="bg-white rounded-3xl-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-paa-navy text-lg">{book.title}</h3>
              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl shadow-sm border border-gray-100">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-bold text-paa-navy">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-gray-500">({book.reviews.length} reviews)</span>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {book.reviews.map((r: any) => (
                <div key={r.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-sm text-paa-navy">{r.reviewerName}</div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-3 h-3 ${star <= r.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 italic">"{r.comment}"</p>
                  <div className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AuthorQueries() {
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [isReplying, setIsReplying] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/queries`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setQueries(res.data);
    } catch (err) {
      toast.error('Failed to load queries');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (id: number) => {
    if (!replyText[id]?.trim()) return;
    setIsReplying({ ...isReplying, [id]: true });
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/queries/${id}/reply`, { reply: replyText[id] }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Reply sent!');
      setReplyText({ ...replyText, [id]: '' });
      fetchQueries();
    } catch (err) {
      toast.error('Failed to send reply');
    } finally {
      setIsReplying({ ...isReplying, [id]: false });
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-paa-navy" /></div>;

  return (
    <div className="dash-panel animate-fade-in-up min-h-full">
      <div className="dash-panel-header bg-white sticky top-0 z-10 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="dash-panel-title flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Queries & Issues</h3>
          <p className="dash-panel-subtitle">View issues reported by your buyers</p>
        </div>
      </div>
      <div className="p-6">
        {queries.length === 0 ? (
          <div className="py-16 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No queries or issues reported yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {queries.map(q => (
              <div key={q.id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        q.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
                        q.status === 'Answered' ? 'bg-blue-100 text-blue-800' : 
                        'bg-orange-100 text-orange-800'
                      }`}>
                        #TKT-{q.id.toString().padStart(4, '0')}
                      </span>
                      <h4 className="font-bold text-paa-navy text-sm">{q.subject}</h4>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(q.createdAt).toLocaleString()}</span>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                    q.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
                    q.status === 'Answered' ? 'bg-blue-100 text-blue-800' : 
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {q.status === 'Resolved' ? 'Closed' : q.status === 'Answered' ? 'Opened' : 'New'}
                  </span>
                </div>
                <QueryThreadDisplay query={q} currentUserType="Author" />
                
                {q.status !== 'Resolved' && (
                  <div className="pt-4 border-t border-gray-100 mt-4">
                    <div className="flex items-center gap-2 bg-white rounded-full border border-gray-200 px-4 py-2 shadow-sm focus-within:border-paa-navy focus-within:ring-1 focus-within:ring-paa-navy/20 transition-all">
                      <input
                        type="text"
                        placeholder="Type reply..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 placeholder:text-gray-400"
                        value={replyText[q.id] || ''}
                        onChange={e => setReplyText({ ...replyText, [q.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && replyText[q.id]?.trim() && !isReplying[q.id]) {
                            handleReply(q.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleReply(q.id)}
                        disabled={isReplying[q.id] || !replyText[q.id]?.trim()}
                        className="p-2 bg-paa-navy text-white rounded-full hover:bg-paa-gold transition-colors disabled:opacity-50 disabled:hover:bg-paa-navy flex shrink-0 items-center justify-center"
                        title="Send Reply"
                      >
                        <Send size={16} className={isReplying[q.id] ? "opacity-50" : ""} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
