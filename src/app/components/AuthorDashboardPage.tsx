import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router';
import { Home, Check, AlertCircle, Upload, Download, Loader2, LogOut, User, Bell, Search, ShoppingCart, BookOpen, CalendarIcon, BarChart3, Package, TrendingUp, TrendingDown, X, MapPin, Menu, ChevronDown, Image as ImageIcon, Star, Plus, Minus, Eye, Edit2, Mail, Phone } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import { toast } from 'sonner';
import { bookCategories } from '../data/categories';
import qrCode from './data/qr_code.jpeg';
import { LivePosDashboard } from './LivePosDashboard';
import fictionData from './data/fiction_catalogue.json';
import nonFictionData from './data/non_fiction_catalogue.json';
import { AuthorRegistrationPage } from './AuthorRegistrationPage';


export function AuthorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [extraDataState, setExtraDataState] = useState<any>({});
  const [hasNewQueries, setHasNewQueries] = useState(false);
  const [showReapply, setShowReapply] = useState(false);
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
  const [buttonStates, setButtonStates] = useState<{[key: string]: boolean}>({});
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
    if (showReapply) {
      return (
        <AuthorRegistrationPage 
          initialData={dashboardData?.authorProfile} 
          isReapply={true} 
          onReapplySuccess={() => {
            setShowReapply(false);
            fetchDashboardData(true);
          }} 
        />
      );
    }

    return (
      <div className="min-h-screen bg-paa-cream animate-fade-in-up font-sans flex items-center justify-center p-6">
        <div className="bg-white max-w-lg w-full p-8 rounded-3xl-2xl shadow-premium border border-paa-navy/5 text-center">
          <div className="flex justify-end mb-4">
            <button onClick={handleLogout} className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-bold uppercase tracking-widest rounded-full transition-colors"><LogOut size={16}/> Logout</button>
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
        if ((o.status === 'Pending Verification' || o.status === 'Pending' || o.status === 'Accepted') && o.createdAt) {
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
             <button onClick={() => { setShowNotifications(!showNotifications); }} className={`relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 text-paa-gray-text hover:text-paa-navy transition-colors ${hasUnread && dismissedToastId !== String(notifications[0]?.id || unreadEventInvites[0]?.id || 'toast') ? 'animate-pulse' : ''}`}>
                <Bell size={16} />
                {hasUnread && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
             </button>
             {/* Auto-open Blinking Toast */}
             {hasUnread && !showNotifications && dismissedToastId !== String(notifications[0]?.id || unreadEventInvites[0]?.id || 'toast') && (
                <div className="animate-pulse" style={{ position: 'absolute', top: '100%', right: '100%', marginRight: 12, marginTop: -8, width: 280, background: '#1a1a2e', borderRadius: 12, padding: '12px 16px', color: '#fff', zIndex: 9999, display: 'flex', gap: 12, alignItems: 'flex-start', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                   <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => { setShowNotifications(true); const latestId = String(notifications[0]?.id || unreadEventInvites[0]?.id || 'toast'); setDismissedToastId(latestId); localStorage.setItem('paa_dismissed_toast', latestId); }}>
                      <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#3b82f6', marginBottom: 2 }}>New Message</p>
                      <p style={{ fontSize: 12, color: '#f3f4f6', lineHeight: 1.4 }}>{notifications[0]?.message || (unreadEventInvites.length > 0 ? `New Event: ${unreadEventInvites[0].event.name}` : 'You have unread notifications.')}</p>
                   </div>
                   <button onClick={(e) => { e.stopPropagation(); const latestId = String(notifications[0]?.id || unreadEventInvites[0]?.id || 'toast'); setDismissedToastId(latestId); localStorage.setItem('paa_dismissed_toast', latestId); }} style={{ color: '#9ca3af', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}><X size={14}/></button>
                   <div style={{ position: 'absolute', top: 12, right: -6, width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '6px solid #1a1a2e' }}></div>
                </div>
             )}
             {showNotifications && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 12, width: 340, background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', zIndex: 9999, overflow: 'hidden', transformOrigin: 'top right', animation: 'scaleIn 0.2s ease-out' }}>
                   <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1a1a2e' }}>Notifications</p>
                     <button onClick={() => setShowNotifications(false)} style={{ color: '#9ca3af', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}><X size={14}/></button>
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
             <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors whitespace-nowrap">
               <LogOut size={13}/> Logout
             </button>
          </div>
        </div>
      </div>

      {/* GLOBAL 3-DAY WARNING BANNER */}
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

      <div className="max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6 relative">
        <div className={`author-profile-sidebar w-full md:w-[240px] p-4 flex-col gap-2 md:sticky md:top-[80px] h-fit bg-white border border-paa-navy/5 shadow-premium transition-all duration-500 ease-out z-30 ${isMobileMenuOpen ? 'flex fixed inset-0 top-[80px] z-[500] bg-white md:static md:shadow-premium' : 'hidden md:flex'}`}>
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname === '/dashboard' ? 'active' : ''}`}><BarChart3 className="w-4 h-4"/> Overview</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/orders" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/orders') ? 'active' : ''}`}><ShoppingCart className="w-4 h-4"/> Web Orders</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/sales" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/sales') ? 'active' : ''}`}><TrendingUp className="w-4 h-4"/> Sales Report</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/inventory" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/inventory') ? 'active' : ''}`}><BookOpen className="w-4 h-4"/> Inventory & Distribution</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/events" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/events') ? 'active' : ''}`}><CalendarIcon className="w-4 h-4"/> Events Ecosystem</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/reviews" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/reviews') ? 'active' : ''}`}><Star className="w-4 h-4"/> Reviews & Ratings</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/gallery" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/gallery') ? 'active' : ''}`}><ImageIcon className="w-4 h-4"/> Event Gallery</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/profile" className={`author-profile-nav-btn flex items-center gap-3 ${location.pathname.includes('/profile') ? 'active' : ''}`}><User className="w-4 h-4"/> Profile Settings</Link>
        </div>

        <div className="flex-1 bg-white border border-paa-navy/5 shadow-premium p-6 md:p-8 min-h-[calc(100vh-160px)] relative">
          <Routes>
            <Route path="/" element={<OverviewTab data={dashboardData} onRefresh={() => fetchDashboardData(true)} buttonStates={buttonStates} setButtonStates={setButtonStates} />} />
            <Route path="/orders" element={<AuthorOrders orders={dashboardData.authorOrders} onRefresh={() => fetchDashboardData(true)} dashboardData={dashboardData} />} />
            <Route path="/sales" element={<AuthorSalesReport data={dashboardData} />} />
            <Route path="/forms/*" element={<FormsWrapper />} />
            <Route path="/inventory" element={<InventoryPage books={dashboardData.authorProfile.books} onRefresh={() => fetchDashboardData(true)} dashboardData={dashboardData} />} />
            <Route path="/events" element={<EventsDashboard registrations={dashboardData.authorProfile.eventRegistrations} />} />
            <Route path="/reviews" element={<AuthorReviews books={dashboardData.authorProfile.books} />} />
            <Route path="/gallery" element={<AuthorGallery />} />
            <Route path="/profile" element={<AuthorProfile data={dashboardData} onRefresh={() => fetchDashboardData(true)} buttonStates={buttonStates} setButtonStates={setButtonStates} />} />
            <Route path="/pos/:eventId" element={<LivePosDashboard />} />
            <Route path="/bundle-offers" element={<BundleOffersTab data={dashboardData} />} />
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
    format: '',
    printFormat: '', purpose: '',
    purpose: ''
  });
  const [cover, setCover] = useState<File | null>(null);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [reapplyForm, setReapplyForm] = useState({ name: '', phone: '', whatsapp: '', bio: '', penName: '', city: '', state: '', address: '', aadharNumber: '', qualification: '', institution: '', subject: '', age: '', experience: '', skills: '', hobbies: '', instagram: '', facebook: '', transactionId: '', extraData: {} });
  const [editProfileForm, setEditProfileForm] = useState({ name: '', phone: '', whatsapp: '', bio: '', penName: '', city: '', state: '', instagram: '', facebook: '', address: '', aadharNumber: '', qualification: '', institution: '', subject: '', age: '', experience: '', skills: '', hobbies: '', whyJoining: '' });
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
    { name: 'Events Part.', count: data.eventInvites?.filter((inv: any) => inv.optInStatus === 'Opted-In').length || 0 },
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

    const totalEventFees = (data.eventInvites || []).filter((inv: any) => inv.optInStatus === 'Opted-In').reduce((acc: number, inv: any) => {
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

  const unsettledEvents = data.eventInvites?.filter((inv: any) => inv.optInStatus === 'Opted-In' && inv.event.status === 'Past' && data.listedBooks?.some((lb: any) => lb.eventId === inv.eventId && lb.listedStock !== (lb.soldStock || 0) + (lb.returnedStock || 0))) || [];
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
          title: '', subtitle: '', genre: '', subcategory: '', subSubcategory: '', synopsis: '', pages: '', mrp: '', stock: '0', language: '', isbn: '', publisher: '', publicationDate: '', edition: '', format: '', printFormat: ''
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
    } catch(err) {
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
    } catch(e) {}
    if (errors.length > 0) {
      toast.error(`Please fix: ${errors.join(', ')}`);
      return;
    }
    try {
      const formData = new FormData();
      Object.entries(editProfileForm).forEach(([key, val]) => {
        if(key === 'age') formData.append('dob', val);
        else if(key === 'skills') formData.append('skills', JSON.stringify(val.split(',').map((s:any)=>s.trim()).filter(Boolean)));
        else if(key === 'hobbies') formData.append('hobbies', JSON.stringify(val.split(',').map((s:any)=>s.trim()).filter(Boolean)));
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
    setButtonStates(prev => ({...prev, updateBook: true}));
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
      setButtonStates(prev => ({...prev, updateBook: false}));
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
              <span className="flex items-center gap-1.5"><Mail size={12}/> {authorProfile.email}</span>
              <span className="flex items-center gap-1.5"><Phone size={12}/> {authorProfile.phone}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleEditProfileOpen} className="dash-btn dash-btn-ghost">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{display:'inline',marginRight:5}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit Profile
          </button>
          <button onClick={() => navigate('/dashboard/bundle-offers')} className="dash-btn dash-btn-primary bg-indigo-600 hover:bg-indigo-700 !border-indigo-600">
            Bundle Offers
          </button>
          <button onClick={() => setShowAddBook(true)} className="dash-btn dash-btn-primary">
            + Add New Book
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
          { label: 'Avg Delivery', value: avgDeliveryDays > 0 ? `${avgDeliveryDays} Days` : 'N/A', colorClass: 'teal' },
          { label: 'Pending Web Orders', value: toApproveOrders, colorClass: 'amber' },
          { label: 'Low Stock Titles', value: lowStockCount, colorClass: 'red' },
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
                  <input className="dash-input w-full" value={editProfileForm.name} onChange={e => setEditProfileForm({...editProfileForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Pen Name</label>
                  <input className="dash-input w-full" value={editProfileForm.penName} onChange={e => setEditProfileForm({...editProfileForm, penName: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Phone</label>
                  <input className="dash-input w-full" value={editProfileForm.phone} onChange={e => setEditProfileForm({...editProfileForm, phone: e.target.value.replace(/\D/g, '')})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">WhatsApp</label>
                  <input className="dash-input w-full" value={editProfileForm.whatsapp} onChange={e => setEditProfileForm({...editProfileForm, whatsapp: e.target.value.replace(/\D/g, '')})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Full Address</label>
                <input className="dash-input w-full" value={editProfileForm.address} onChange={e => setEditProfileForm({...editProfileForm, address: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Pincode</label>
                <input className="dash-input w-full" value={editProfileForm.pincode} onChange={e => setEditProfileForm({...editProfileForm, pincode: e.target.value.replace(/\D/g, '')})} maxLength={6} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">City</label>
                  <input className="dash-input w-full" value={editProfileForm.city} onChange={e => setEditProfileForm({...editProfileForm, city: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">State</label>
                  <input className="dash-input w-full" value={editProfileForm.state} onChange={e => setEditProfileForm({...editProfileForm, state: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Aadhar Number</label>
                  <input className="dash-input w-full" value={editProfileForm.aadharNumber} onChange={e => setEditProfileForm({...editProfileForm, aadharNumber: e.target.value.replace(/\D/g, '')})} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Instagram</label>
                  <input className="dash-input w-full" value={editProfileForm.instagram} onChange={e => setEditProfileForm({...editProfileForm, instagram: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Facebook</label>
                  <input className="dash-input w-full" value={editProfileForm.facebook} onChange={e => setEditProfileForm({...editProfileForm, facebook: e.target.value})} />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-2">Qualifications</label>
                {(() => {
                  let qArr: any[] = [];
                  try { qArr = JSON.parse(editProfileForm.qualification || '[]'); } catch(e) {}
                  if (!Array.isArray(qArr)) qArr = [{ qualification: editProfileForm.qualification || '', institution: '', subject: '' }];
                  return (
                    <>
                      {qArr.map((q: any, i: number) => (
                        <div key={i} className="grid grid-cols-3 gap-2 mb-2 bg-gray-50 p-3 rounded-lg border border-gray-100 relative group">
                          {qArr.length > 1 && (
                            <button type="button" onClick={() => {
                              const newQ = qArr.filter((_: any, idx: number) => idx !== i);
                              setEditProfileForm({...editProfileForm, qualification: JSON.stringify(newQ)});
                            }} className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full border border-red-200 w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">✕</button>
                          )}
                          <div>
                            <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Degree / Title</span>
                            <input type="text" className="dash-input w-full text-xs" value={q.qualification || ''} onChange={ev => {
                              const newQ = [...qArr]; newQ[i] = {...newQ[i], qualification: ev.target.value};
                              setEditProfileForm({...editProfileForm, qualification: JSON.stringify(newQ)});
                            }} />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Institution</span>
                            <input type="text" className="dash-input w-full text-xs" value={q.institution || ''} onChange={ev => {
                              const newQ = [...qArr]; newQ[i] = {...newQ[i], institution: ev.target.value};
                              setEditProfileForm({...editProfileForm, qualification: JSON.stringify(newQ)});
                            }} />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Subject</span>
                            <input type="text" className="dash-input w-full text-xs" value={q.subject || ''} onChange={ev => {
                              const newQ = [...qArr]; newQ[i] = {...newQ[i], subject: ev.target.value};
                              setEditProfileForm({...editProfileForm, qualification: JSON.stringify(newQ)});
                            }} />
                          </div>
                        </div>
                      ))}
                      <button type="button" onClick={() => {
                        const newQ = [...qArr, { qualification: '', institution: '', subject: '' }];
                        setEditProfileForm({...editProfileForm, qualification: JSON.stringify(newQ)});
                      }} className="text-[10px] font-bold text-paa-navy uppercase tracking-widest hover:text-paa-gold mt-1">+ Add Qualification</button>
                    </>
                  );
                })()}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Date of Birth</label>
                  <input type="date" className="dash-input w-full" value={editProfileForm.age} onChange={e => setEditProfileForm({...editProfileForm, age: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Experience</label>
                  <input className="dash-input w-full" value={editProfileForm.experience} onChange={e => setEditProfileForm({...editProfileForm, experience: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Skills</label>
                  <input className="dash-input w-full" value={editProfileForm.skills} onChange={e => setEditProfileForm({...editProfileForm, skills: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Hobbies</label>
                  <input className="dash-input w-full" value={editProfileForm.hobbies} onChange={e => setEditProfileForm({...editProfileForm, hobbies: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Why did you join the group? (Published Authors)</label>
                <textarea className="dash-input w-full resize-y" rows={2} value={editProfileForm.whyJoining} onChange={e => setEditProfileForm({...editProfileForm, whyJoining: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Author Bio (100-150 words)</label>
                <textarea required className={`dash-input w-full ${(() => {
                   const c = editProfileForm.bio.split(/\s+/).filter(Boolean).length;
                   return (c > 0 && (c < 100 || c > 150)) ? '!border-red-500' : '';
                })()}`} rows={5} value={editProfileForm.bio} onChange={e => setEditProfileForm({...editProfileForm, bio: e.target.value})} />
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
                  <label className="dash-label">Synopsis (Max 100 words) *</label>
                  <textarea required className={`dash-input ${newBook.synopsis.split(/\s+/).filter(Boolean).length > 100 ? '!border-red-500' : ''}`} rows={3} placeholder="Brief description of the book" value={newBook.synopsis} onChange={e => setNewBook({...newBook, synopsis: e.target.value})} />
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="dash-label">ISBN *</label>
                    <input required className="dash-input" placeholder="e.g. 978..." value={newBook.isbn} onChange={e => setNewBook({...newBook, isbn: e.target.value})} />
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
                  <div>
                    <label className="dash-label">Print Format *</label>
                    <select required className="dash-input" value={(newBook as any).printFormat || ''} onChange={e => setNewBook({...newBook, printFormat: e.target.value})}>
                      <option value="">Select Print Format</option>
                      <option value="Black & White">Black & White</option>
                      <option value="Colored">Colored</option>
                    </select>
                  </div>
                  <div>
                    <label className="dash-label">Purpose of Writing *</label>
                    <select required className="dash-input" value={(newBook as any).purpose || ''} onChange={e => setNewBook({...newBook, purpose: e.target.value})}>
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
                    <input required type="number" className="dash-input" placeholder="250" value={newBook.pages} onChange={e => setNewBook({...newBook, pages: e.target.value})} />
                  </div>
                  <div>
                    <label className="dash-label">MRP (₹) *</label>
                    <input required type="number" className="dash-input" placeholder="Price" value={newBook.mrp} onChange={e => setNewBook({...newBook, mrp: e.target.value})} />
                  </div>
                  <div>
                    <label className="dash-label">Initial Stock *</label>
                    <input required type="number" className="dash-input" placeholder="Qty" value={newBook.stock} onChange={e => setNewBook({...newBook, stock: e.target.value})} />
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
          <span className="dash-badge info">{filteredTitles.length} titles</span>
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
                      <button onClick={() => handleEditBookOpen(row.id)} className="p-2 text-paa-navy hover:text-paa-gold bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200" title="Edit Details">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
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
                <XAxis dataKey="name" fontSize={10} tick={{fill:'#71717A'}} />
                <YAxis fontSize={10} tick={{fill:'#71717A'}} />
                <Tooltip cursor={{fill:'rgba(24,24,27,0.03)'}} contentStyle={{borderRadius:10,border:'1px solid rgba(24,24,27,0.08)',fontSize:12}} />
                <Bar dataKey="sold" fill="#18181B" radius={[4,4,0,0]} />
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
                    <input required type="text" className="dash-input" value={editingBook.title} onChange={e => setEditingBook({...editingBook, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="dash-label">Subtitle (Optional)</label>
                    <input type="text" className="dash-input" value={editingBook.subtitle} onChange={e => setEditingBook({...editingBook, subtitle: e.target.value})} />
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
                    <label className="dash-label">Pages *</label>
                    <input required type="number" className="dash-input" value={editingBook.pages} onChange={e => setEditingBook({...editingBook, pages: e.target.value})} />
                  </div>
                  <div>
                    <label className="dash-label">MRP (₹)</label>
                    <input required type="number" className="dash-input" value={editingBook.mrp} onChange={e => setEditingBook({...editingBook, mrp: e.target.value})} />
                  </div>
                  <div>
                    <label className="dash-label">Initial Stock</label>
                    <input required type="number" className="dash-input" value={editingBook.stock} onChange={e => setEditingBook({...editingBook, stock: e.target.value})} />
                  </div>
                  <div>
                    <label className="dash-label">Language *</label>
                    <select required className="dash-input" value={editingBook.language} onChange={e => setEditingBook({...editingBook, language: e.target.value})}>
                      <option value="">Select Language</option>
                      <option value="ENG">ENG</option>
                      <option value="MAR">MAR</option>
                      <option value="HIN">HIN</option>
                    </select>
                  </div>
                  <div>
                    <label className="dash-label">ISBN *</label>
                    <input required type="text" className="dash-input" value={editingBook.isbn} onChange={e => setEditingBook({...editingBook, isbn: e.target.value})} />
                  </div>
                  <div>
                    <label className="dash-label">Publisher</label>
                    <input type="text" className="dash-input" value={editingBook.publisher} onChange={e => setEditingBook({...editingBook, publisher: e.target.value})} />
                  </div>
                  <div>
                    <label className="dash-label">Publication Date</label>
                    <input type="date" className="dash-input" value={editingBook.publicationDate} onChange={e => setEditingBook({...editingBook, publicationDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="dash-label">Edition</label>
                    <input type="text" className="dash-input" value={editingBook.edition} onChange={e => setEditingBook({...editingBook, edition: e.target.value})} />
                  </div>
                  <div>
                    <label className="dash-label">Format *</label>
                    <select required className="dash-input" value={editingBook.format} onChange={e => setEditingBook({...editingBook, format: e.target.value})}>
                      <option value="">Select Format</option>
                      <option value="Paperback">Paperback</option>
                      <option value="Hardcover">Hardcover</option>
                      <option value="Ebook">Ebook</option>
                    </select>
                  </div>
                  <div>
                    <label className="dash-label">Print Format *</label>
                    <select required className="dash-input" value={editingBook.printFormat || ''} onChange={e => setEditingBook({...editingBook, printFormat: e.target.value})}>
                      <option value="">Select Format</option>
                      <option value="Black & White">Black & White (₹1/page)</option>
                      <option value="Colored">Colored (₹3/page)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="dash-label">Synopsis (Max 100 words) *</label>
                  <textarea required className={`dash-input ${editingBook.synopsis.split(/\s+/).filter(Boolean).length > 100 ? '!border-red-500' : ''}`} rows={4} value={editingBook.synopsis} onChange={e => setEditingBook({...editingBook, synopsis: e.target.value})}></textarea>
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

  return (
    <div>
      {/* Buyer Info Modal */}
      {viewBuyerInfoOrder !== null && (
        <div className="fixed inset-0 bg-paa-navy/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 max-w-md w-full shadow-xl relative rounded-xl border border-paa-navy/5">
            <button onClick={() => setViewBuyerInfoOrder(null)} className="absolute top-4 right-4 text-gray-400 hover:text-paa-navy">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-serif text-paa-navy mb-1">Buyer Details</h2>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-6 border-b border-paa-navy/10 pb-4">ORD-{viewBuyerInfoOrder.orderId}</p>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Name</p>
                <p className="font-bold text-paa-navy">{viewBuyerInfoOrder.customerName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                <p className="font-bold text-[#4a90e2]">{viewBuyerInfoOrder.customerPhone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Delivery Address</p>
                <p className="text-gray-700 leading-relaxed">{viewBuyerInfoOrder.address}</p>
              </div>
            </div>
            <div className="mt-6 border-t border-paa-navy/10 pt-4">
              <p className="text-[10px] font-bold text-paa-navy uppercase tracking-widest mb-3">Order Timeline</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                   <span className="text-gray-500">Placed On</span>
                   <span className="font-medium text-paa-navy">{new Date(viewBuyerInfoOrder.createdAt || viewBuyerInfoOrder.date).toLocaleString('en-IN')}</span>
                </div>
                {viewBuyerInfoOrder.acceptedAt && (
                  <div className="flex justify-between items-center text-xs">
                     <span className="text-gray-500">Accepted</span>
                     <span className="font-medium text-paa-navy">{new Date(viewBuyerInfoOrder.acceptedAt).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {viewBuyerInfoOrder.dispatchedAt && (
                  <div className="flex justify-between items-center text-xs">
                     <span className="text-gray-500">Dispatched</span>
                     <span className="font-medium text-paa-navy">{new Date(viewBuyerInfoOrder.dispatchedAt).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {(viewBuyerInfoOrder.deliveredAt || viewBuyerInfoOrder.status === 'Completed' || viewBuyerInfoOrder.status === 'Delivered') && (
                  <div className="flex justify-between items-center text-xs">
                     <span className="text-gray-500">Delivered</span>
                     <span className="font-medium text-green-600">{viewBuyerInfoOrder.deliveredAt ? new Date(viewBuyerInfoOrder.deliveredAt).toLocaleString('en-IN') : 'Delivered'}</span>
                  </div>
                )}
                {(viewBuyerInfoOrder.deliveredAt || viewBuyerInfoOrder.status === 'Completed' || viewBuyerInfoOrder.status === 'Delivered') && (
                  <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-center font-bold text-green-600 bg-green-50 py-1.5 rounded">
                     Took {Math.max(1, Math.ceil(((viewBuyerInfoOrder.deliveredAt ? new Date(viewBuyerInfoOrder.deliveredAt).getTime() : new Date().getTime()) - new Date(viewBuyerInfoOrder.createdAt || viewBuyerInfoOrder.date).getTime()) / (1000 * 3600 * 24)))} Days to Deliver
                  </div>
                )}
              </div>
            </div>
            {(viewBuyerInfoOrder.feedbackCondition || viewBuyerInfoOrder.feedbackRating) && (
              <div className="mt-6 border-t border-paa-navy/10 pt-4">
                <p className="text-[10px] font-bold text-paa-navy uppercase tracking-widest mb-3">Customer Feedback</p>
                <div className="space-y-3 bg-gray-50 p-3 rounded border border-gray-200 text-sm">
                  <div className="flex justify-between items-center text-xs">
                     <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Condition</span>
                     <span className={`font-medium ${viewBuyerInfoOrder.feedbackCondition === 'Damaged' ? 'text-red-600' : 'text-paa-navy'}`}>{viewBuyerInfoOrder.feedbackCondition}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                     <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Delivery Rating</span>
                     <span className="font-medium text-yellow-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                           <span key={i}>{i < (viewBuyerInfoOrder.feedbackRating || 0) ? '★' : '☆'}</span>
                        ))}
                     </span>
                  </div>
                  {viewBuyerInfoOrder.feedbackComments && (
                    <div className="text-xs italic text-gray-600 border-t border-gray-200 mt-2 pt-2">
                      "{viewBuyerInfoOrder.feedbackComments}"
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="mt-6 text-center">
              <button onClick={() => setViewBuyerInfoOrder(null)} className="px-6 py-2 bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors w-full rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                filterStatus === status ? 'bg-paa-navy text-paa-cream' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                   <th className="px-5 py-4 font-bold text-center">Status & Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {groupedOrdersList.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500 italic">No orders found.</td></tr> : groupedOrdersList.map((ord: any, idx: number) => {
                 const orderDate = new Date(ord.createdAt || ord.date);
                 const isSlaBreached = (new Date().getTime() - orderDate.getTime()) / (1000 * 60 * 60) > 24 && ['Pending Verification', 'Pending', 'Accepted', 'Processing'].includes(ord.status);
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
                        <button
                          onClick={() => setViewBuyerInfoOrder(ord)}
                          className="p-1.5 bg-gray-50 border border-gray-200 hover:border-paa-navy hover:bg-paa-navy hover:text-white text-gray-500 rounded transition-colors shrink-0 mt-0.5"
                          title="View Full Details"
                        >
                          <Eye size={12} />
                        </button>
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
                    <td className="px-5 py-4 text-center">
                      {ord.paymentScreenshot ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <a
                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${ord.paymentScreenshot}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[9px] font-bold text-[#4a90e2] hover:text-paa-navy underline tracking-widest uppercase transition-colors"
                          >
                            View Receipt
                          </a>
                          {ord.paymentVerified && (
                            <span className="text-[9px] font-bold text-green-600 tracking-widest uppercase flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-full border border-green-100"><Check size={10}/> Verified</span>
                          )}
                        </div>
                      ) : <span className="text-[9px] text-gray-400 italic">No receipt</span>}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {ord.status === 'Pending Verification' || ord.status === 'Pending' ? (
                        <div className="flex gap-2 items-center justify-center">
                          <button
                            onClick={() => handleApprove(ord.itemIds)}
                            disabled={loadingAction !== null}
                            className="text-[9px] font-bold uppercase tracking-widest px-3 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 rounded shadow-sm"
                          >
                            {loadingAction === String(ord.itemIds[0]) ? '...' : 'Approve'}
                          </button>
                          <button
                             onClick={() => { setRejectItemId(ord.itemIds); setRejectReasons(['Item out of stock']); setOtherRejectReason(''); }}
                             disabled={loadingAction !== null}
                             className="text-[9px] font-bold uppercase tracking-widest px-3 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 rounded shadow-sm"
                           >
                             Reject
                           </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1">
                          {editingStatusOrderId === String(ord.orderId) ? (
                            <select 
                              className={`dash-input text-[9px] py-1.5 px-3 uppercase font-bold w-full max-w-[120px] text-center rounded-full border shadow-sm outline-none ${
                                ord.status === 'Completed' ? 'bg-[#43a047] text-white border-[#4cae4c]'
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
                              <option value="Delivered">Delivered</option>
                            </select>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                               <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full border ${
                                 ord.status === 'Completed' ? 'bg-[#43a047] text-white border-[#4cae4c]'
                                 : ord.status === 'Dispatched' ? 'bg-blue-100 text-blue-800 border-blue-200'
                                 : ord.status === 'Accepted' ? 'bg-[#eef2f6] text-paa-navy border-[#8faadc]'
                                 : ord.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200'
                                 : 'bg-yellow-50 text-yellow-800 border-yellow-200'
                               }`}>
                                 {ord.status}
                               </span>
                               {ord.status !== 'Rejected' && ord.status !== 'Completed' && ord.status !== 'Delivered' && (
                                 <button
                                   onClick={() => setEditingStatusOrderId(String(ord.orderId))}
                                   className="text-gray-400 hover:text-paa-navy transition-colors shrink-0"
                                   title="Edit Status"
                                 >
                                   <Edit2 size={12} />
                                 </button>
                               )}
                            </div>
                          )}
                          {ord.status === 'Rejected' && ord.rejectionReason && (
                            <div className="mt-1 text-[9px] text-red-600 truncate max-w-[120px]" title={ord.rejectionReason}>Reason: {ord.rejectionReason}</div>
                          )}
                        </div>
                      )}
                    </td>
                 </tr>
               )})}
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const location = useLocation();
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
                          
                          {isOptedIn && evt.status !== 'Past' && evt.livePosEnabled !== false && (
                             <button onClick={() => navigate(`/dashboard/pos/${evt.id}`)} className="dash-btn dash-btn-ghost w-full justify-center border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 mt-2">
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
                             ) : isAwaitingApproval ? (
                               <div className="bg-orange-50 text-orange-800 text-sm p-3 rounded-lg text-center font-medium border border-orange-200">
                                  Approval Pending
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
        <div className="fixed inset-0 bg-paa-navy/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
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
    date.setHours(0,0,0,0);
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
     curr.setHours(0,0,0,0);
     const end = new Date(rangeEnd);
     end.setHours(23,59,59,999);
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
  });const chartData = Object.values(salesByDate).sort((a, b) => {
    const [d1, m1, y1] = a.date.split('/');
    const [d2, m2, y2] = b.date.split('/');
    return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime();
  });

  const totalWebRevenue = webOrders.reduce((acc: number, o: any) => acc + o.amount, 0);
  const totalPosRevenue = posOrders.reduce((acc: number, o: any) => acc + o.totalAmount, 0);
  const totalBooksSold = chartData.reduce((acc, curr) => acc + curr.totalBooks, 0);
  const totalRevenue = totalWebRevenue + totalPosRevenue;
  
  const totalEventFees = (data.eventInvites || []).filter((inv: any) => inv.optInStatus === 'Opted-In').reduce((acc: number, inv: any) => {
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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col justify-between">
           <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Total Revenue</p>
           <div className="text-2xl font-bold text-paa-navy">₹{totalRevenue}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col justify-between relative group">
           <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Total Fees Paid</p>
           <div className="text-2xl font-bold text-red-600">₹{totalFeesPaid}</div>
           <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 w-max bg-gray-900 text-white text-xs p-2 rounded shadow-lg z-50">
             Platform Fee: ₹{platformFeePaid}<br/>
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
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-6 mb-8">
         <h3 className="font-serif font-bold text-lg mb-6">Revenue Trend</h3>
         <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="date" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                    <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip cursor={{fill: '#f8f9fa'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
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
    } catch(err) {
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
    const bioWc = editProfileForm.bio.split(/\s+/).filter(Boolean).length;
    if (bioWc < 100 || bioWc > 150) errors.push(`Bio must be 100-150 words (currently ${bioWc})`);
    if (errors.length > 0) { toast.error(`Please fix: ${errors.join(', ')}`); return; }
    try {
      setButtonStates(prev => ({...prev, editProfile: true}));
      const formData = new FormData();
      Object.entries(editProfileForm).forEach(([key, val]) => {
        formData.append(key, val as string);
      });
      if (editPhoto) formData.append('photo', editPhoto);
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/profile/bio`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Profile updated and submitted for admin review!');
      onRefresh();
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setButtonStates(prev => ({...prev, editProfile: false}));
    }
  };

  return (
    <>
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-6 border-b border-paa-navy/5 pb-4">
        <div>
          <h2 className="text-2xl font-serif text-paa-navy tracking-tight">Edit My Profile</h2>
          <p className="text-sm text-paa-gray-text mt-1">Keep your author bio and details up to date.</p>
        </div>
      </div>
      
      <form onSubmit={handleSaveProfile} className="flex flex-col gap-6 max-w-4xl bg-white p-6 rounded-xl border border-paa-navy/5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Full Name</label>
            <input className="dash-input w-full" value={editProfileForm.name} onChange={e => setEditProfileForm({...editProfileForm, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Pen Name</label>
            <input className="dash-input w-full" value={editProfileForm.penName} onChange={e => setEditProfileForm({...editProfileForm, penName: e.target.value})} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Phone</label>
            <input className="dash-input w-full" value={editProfileForm.phone} onChange={e => setEditProfileForm({...editProfileForm, phone: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">WhatsApp</label>
            <input className="dash-input w-full" value={editProfileForm.whatsapp} onChange={e => setEditProfileForm({...editProfileForm, whatsapp: e.target.value})} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Full Address</label>
          <input className="dash-input w-full" value={editProfileForm.address} onChange={e => setEditProfileForm({...editProfileForm, address: e.target.value})} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">City</label>
            <input className="dash-input w-full" value={editProfileForm.city} onChange={e => setEditProfileForm({...editProfileForm, city: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">State</label>
            <input className="dash-input w-full" value={editProfileForm.state} onChange={e => setEditProfileForm({...editProfileForm, state: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Aadhar Number</label>
            <input className="dash-input w-full" value={editProfileForm.aadharNumber} onChange={e => setEditProfileForm({...editProfileForm, aadharNumber: e.target.value})} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Instagram</label>
            <input className="dash-input w-full" value={editProfileForm.instagram} onChange={e => setEditProfileForm({...editProfileForm, instagram: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Facebook</label>
            <input className="dash-input w-full" value={editProfileForm.facebook} onChange={e => setEditProfileForm({...editProfileForm, facebook: e.target.value})} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-2">Qualifications</label>
            {(() => {
              let qArr: any[] = [];
              try { qArr = JSON.parse(editProfileForm.qualification || '[]'); } catch(e) {}
              if (!Array.isArray(qArr)) qArr = [{ qualification: editProfileForm.qualification || '', institution: '', subject: '' }];
              return (
                <>
                  {qArr.map((q: any, i: number) => (
                    <div key={i} className="grid grid-cols-3 gap-2 mb-2 bg-gray-50 p-3 rounded-lg border border-gray-100 relative group">
                      {qArr.length > 1 && (
                        <button type="button" onClick={() => {
                          const newQ = qArr.filter((_: any, idx: number) => idx !== i);
                          setEditProfileForm({...editProfileForm, qualification: JSON.stringify(newQ)});
                        }} className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full border border-red-200 w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">✕</button>
                      )}
                      <div>
                        <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Degree / Title</span>
                        <input type="text" className="dash-input w-full text-xs" value={q.qualification || ''} onChange={ev => {
                          const newQ = [...qArr]; newQ[i] = {...newQ[i], qualification: ev.target.value};
                          setEditProfileForm({...editProfileForm, qualification: JSON.stringify(newQ)});
                        }} />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Institution</span>
                        <input type="text" className="dash-input w-full text-xs" value={q.institution || ''} onChange={ev => {
                          const newQ = [...qArr]; newQ[i] = {...newQ[i], institution: ev.target.value};
                          setEditProfileForm({...editProfileForm, qualification: JSON.stringify(newQ)});
                        }} />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Subject</span>
                        <input type="text" className="dash-input w-full text-xs" value={q.subject || ''} onChange={ev => {
                          const newQ = [...qArr]; newQ[i] = {...newQ[i], subject: ev.target.value};
                          setEditProfileForm({...editProfileForm, qualification: JSON.stringify(newQ)});
                        }} />
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => {
                    const newQ = [...qArr, { qualification: '', institution: '', subject: '' }];
                    setEditProfileForm({...editProfileForm, qualification: JSON.stringify(newQ)});
                  }} className="text-[10px] font-bold text-paa-navy uppercase tracking-widest hover:text-paa-gold mt-1">+ Add Qualification</button>
                </>
              );
            })()}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Date of Birth</label>
            <input type="date" className="dash-input w-full" value={editProfileForm.age} onChange={e => setEditProfileForm({...editProfileForm, age: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Experience</label>
            <input className="dash-input w-full" value={editProfileForm.experience} onChange={e => setEditProfileForm({...editProfileForm, experience: e.target.value})} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Skills</label>
            <input className="dash-input w-full" value={editProfileForm.skills} onChange={e => setEditProfileForm({...editProfileForm, skills: e.target.value})} />
          </div>
          <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Hobbies</label>
                  <input className="dash-input w-full" value={editProfileForm.hobbies} onChange={e => setEditProfileForm({...editProfileForm, hobbies: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Why did you join the group? (Published Authors)</label>
                <textarea className="dash-input w-full resize-y" rows={2} value={editProfileForm.whyJoining} onChange={e => setEditProfileForm({...editProfileForm, whyJoining: e.target.value})} />
              </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Author Bio (150 words)</label>
          <textarea required className="dash-input w-full" rows={5} value={editProfileForm.bio} onChange={e => setEditProfileForm({...editProfileForm, bio: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Update Profile Photo</label>
          <input type="file" accept="image/*" className="border border-paa-navy/20 p-2 text-xs w-full rounded-lg" onChange={e => setEditPhoto(e.target.files?.[0] || null)} />
        </div>
        <div className="flex justify-end gap-3 mt-6 border-t pt-6">
          <button type="submit" disabled={buttonStates.editProfile} className="dash-btn dash-btn-primary px-8 disabled:opacity-50">{buttonStates.editProfile ? 'Saving...' : 'Save & Submit for Review'}</button>
        </div>
      </form>
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




function AuthorGallery() {
  const [galleries, setGalleries] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedGalleryEvent, setSelectedGalleryEvent] = React.useState<any>(null);
  const [galleryUploadFiles, setGalleryUploadFiles] = React.useState<File[]>([]);
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
      
      await Promise.all(promises);
      
      toast.success('Images uploaded successfully!');
      setGalleryUploadFiles([]);
      setGalleryUploadCaption('');
      setSelectedGalleryEvent(null);
      fetchGalleries();
    } catch(err) {
      console.error(err);
      toast.error('Failed to upload image.');
    } finally {
      setIsUploadingGallery(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-paa-navy"/></div>;

  return (
    <div className="space-y-6">
      <div className="dash-panel">
        <div className="dash-panel-header">
          <h2 className="dash-panel-title">Event Galleries</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-6">Select an event below to upload your photos. They will be shared in the public gallery instantly!</p>
          <div className="grid grid-cols-1 gap-6">
            {galleries.map(ge => (
               <div key={ge.id} className="border border-paa-navy/10 rounded-xl overflow-hidden bg-gray-50 flex flex-col hover:shadow-premium-hover transition-all duration-300 ease-out">
                  <div className="p-5 flex justify-between items-start border-b border-paa-navy/5 bg-white">
                    <div>
                      <h3 className="font-serif font-bold text-paa-navy text-xl">{ge.type} @ {ge.location}</h3>
                      <p className="text-[11px] font-bold tracking-widest text-paa-gray-text uppercase mt-1">{new Date(ge.date).toLocaleDateString()} &bull; {ge.city}</p>
                      <p className="text-sm text-gray-600 mt-3 max-w-2xl">{ge.description}</p>
                    </div>
                    <button onClick={() => setSelectedGalleryEvent(ge)} className="dash-btn dash-btn-primary shrink-0"><Upload className="w-4 h-4 inline-block mr-2" />Upload Photos</button>
                  </div>
                  {ge.images && ge.images.length > 0 ? (
                    <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {ge.images.filter((img: any) => img.status === 'Approved').map((img: any) => (
                        <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-paa-navy/10 shadow-sm bg-white">
                          <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${img.url}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={img.caption || 'Event image'} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-xs text-gray-400 font-medium italic text-center">No images uploaded for this event yet. Be the first!</div>
                  )}
               </div>
            ))}
          </div>
          {galleries.length === 0 && <p className="text-gray-500 text-sm">No active galleries found.</p>}
        </div>
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
                   <label className="dash-label">Photos (Select Multiple) *</label>
                   <input type="file" multiple required accept="image/*" className="dash-input text-xs w-full" onChange={e => setGalleryUploadFiles(Array.from(e.target.files || []))} />
                </div>
                <div>
                   <label className="dash-label">Caption (Optional)</label>
                   <input className="dash-input w-full" placeholder="e.g., Book signing moment..." value={galleryUploadCaption} onChange={e => setGalleryUploadCaption(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => { setSelectedGalleryEvent(null); setGalleryUploadFiles([]); }} className="px-6 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
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
