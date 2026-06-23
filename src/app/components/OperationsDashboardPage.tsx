import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  RefreshCw, Users, BookOpen, Calendar as CalendarIcon, Settings, Plus, Search, 
  Eye, Edit, Trash2, X, BarChart3, Filter, CheckCircle2, XCircle, 
  TrendingUp, Bell, MapPin, MoreVertical, Check, CreditCard, Menu,
  ShoppingCart, Package, LogOut, ArrowLeft, ClipboardList, Image as ImageIcon, ChevronDown, Loader2, FileText, AlertCircle,
  LayoutDashboard, LayoutGrid, CheckCircle, Clock, ChevronRight, Download, BarChart2, DollarSign, ExternalLink, HelpCircle, Key, Globe, Mail, PieChart, Activity, Printer, FileDown, CheckSquare, Lock, MessageSquare
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart as RechartsPieChart, Pie
} from 'recharts';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import pastEventsData from './data/past_events.json';

// Automatically attach token to all admin requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    if (config.headers && typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else if (config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

// Automatically handle 401 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const AuthorFullProfileView = ({ author, onBack }: { author: any, onBack: () => void }) => {
  const [activeProfileTab, setActiveProfileTab] = useState<'profile' | 'inventory' | 'orders' | 'events' | 'distribution' | 'forms'>('profile');
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API}/api/admin/authors/${author.id}/dashboard-data`);
        setProfileData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [author.id]);

  if (loading) return (
    <div className="p-8 bg-white border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out space-y-6">
       <div className="flex gap-4 items-center">
          <div className="w-14 h-14 bg-gray-200 animate-pulse rounded-3xl-2xl"></div>
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-3xl-2xl"></div>
       </div>
       <div className="h-64 bg-gray-200 animate-pulse rounded-3xl-2xl w-full"></div>
    </div>
  );
  if (!profileData) return <div className="p-8 text-center text-red-500 font-bold bg-white border border-red-200">Error loading author details.</div>;

  const { authorProfile, authorOrders } = profileData;

  return (
    <div className="bg-white border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out flex flex-col">
      <div className="p-8 border-b border-paa-navy/5 bg-[#f0f4f8] flex items-start justify-between">
         <div className="flex gap-4 items-center">
            <button onClick={onBack} className="p-2 bg-white border border-paa-navy/20 hover:bg-gray-50 rounded-3xl-2xl shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out transition-colors rounded-full active:scale-95 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out">
               <ArrowLeft className="w-5 h-5 text-paa-navy" />
            </button>
            <div className="w-14 h-14 bg-white border border-paa-navy/5 text-paa-navy flex items-center justify-center font-bold font-serif text-3xl shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out">
              {authorProfile.name.charAt(0)}
            </div>
            <div>
               <h2 className="text-2xl font-bold text-paa-navy uppercase tracking-widest">{authorProfile.name}</h2>
               <p className="text-sm font-medium text-paa-gray-text">{authorProfile.email} | {authorProfile.phone}</p>
               <p className="text-xs text-paa-navy mt-1 uppercase tracking-widest font-bold bg-[#eef2f6] inline-block px-2 py-0.5">Joined: {new Date(authorProfile.createdAt).toLocaleDateString()}</p>
            </div>
         </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1">
        <div className="author-profile-sidebar w-full md:w-[220px] p-4 flex flex-col gap-2 md:sticky md:top-0 h-fit">
           <button onClick={() => setActiveProfileTab('profile')} className={`author-profile-nav-btn ${activeProfileTab === 'profile' ? 'active' : ''}`}>Registration Profile</button>
           <button onClick={() => setActiveProfileTab('inventory')} className={`author-profile-nav-btn ${activeProfileTab === 'inventory' ? 'active' : ''}`}>Inventory</button>
           <button onClick={() => setActiveProfileTab('orders')} className={`author-profile-nav-btn ${activeProfileTab === 'orders' ? 'active' : ''}`}>Web Orders</button>
           <button onClick={() => setActiveProfileTab('events')} className={`author-profile-nav-btn ${activeProfileTab === 'events' ? 'active' : ''}`}>Events</button>
           <button onClick={() => setActiveProfileTab('distribution')} className={`author-profile-nav-btn ${activeProfileTab === 'distribution' ? 'active' : ''}`}>Distribution</button>
        </div>
        
        <div className="flex-1 p-6 bg-gray-50/50 min-h-[500px]">
        {activeProfileTab === 'profile' && (
        <div id="profile" className="space-y-6">
          <div className="bg-white border border-paa-navy/5 p-6 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out">
            <h3 className="text-2xl font-serif font-semibold text-paa-navy tracking-tight mb-4 border-l-4 border-paa-navy pl-2">Author Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div><span className="text-xs font-bold text-paa-gray-text uppercase block mb-1">Full Name</span><span className="text-sm text-paa-navy font-medium">{authorProfile.name}</span></div>
              <div><span className="text-xs font-bold text-paa-gray-text uppercase block mb-1">Pen Name</span><span className="text-sm text-paa-navy font-medium">{authorProfile.penName || '-'}</span></div>
              <div><span className="text-xs font-bold text-paa-gray-text uppercase block mb-1">Email</span><span className="text-sm text-paa-navy font-medium">{authorProfile.email}</span></div>
              <div><span className="text-xs font-bold text-paa-gray-text uppercase block mb-1">Phone / WhatsApp</span><span className="text-sm text-paa-navy font-medium">{authorProfile.phone} {authorProfile.whatsapp ? `/ ${authorProfile.whatsapp}` : ''}</span></div>
              <div><span className="text-xs font-bold text-paa-gray-text uppercase block mb-1">Location</span><span className="text-sm text-paa-navy font-medium">{authorProfile.city ? `${authorProfile.city}, ${authorProfile.state}` : '-'}</span></div>
              <div><span className="text-xs font-bold text-paa-gray-text uppercase block mb-1">Social Profiles</span>
                <span className="text-sm text-paa-navy font-medium block">{authorProfile.instagram && <a href={authorProfile.instagram} target="_blank" className="text-blue-600 hover:underline">Instagram</a>} {authorProfile.facebook && <a href={authorProfile.facebook} target="_blank" className="text-blue-600 hover:underline ml-2">Facebook/LinkedIn</a>} {!authorProfile.instagram && !authorProfile.facebook && '-'}</span>
              </div>
              <div className="md:col-span-2"><span className="text-xs font-bold text-paa-gray-text uppercase block mb-1">Bio</span><span className="text-sm text-paa-navy font-medium block whitespace-pre-wrap">{authorProfile.bio || '-'}</span></div>
            </div>
          </div>
          
          <div className="bg-white border border-paa-navy/5 p-6 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out">
            <h3 className="text-2xl font-serif font-semibold text-paa-navy tracking-tight mb-4 border-l-4 border-paa-navy pl-2">Submitted Books</h3>
            <div className="space-y-4">
              {authorProfile.books.length === 0 ? <p className="text-sm text-paa-gray-text">No books found.</p> : authorProfile.books.map((b: any, idx: number) => (
                <div key={b.id} className="border border-paa-navy/5 p-4 bg-gray-50 flex flex-col md:flex-row gap-4">
                  {b.coverUrl && <img src={b.coverUrl.startsWith('http') ? b.coverUrl : `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${b.coverUrl}`} alt="Cover" className="w-20 h-28 object-cover border border-paa-navy/20" />}
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-paa-navy">{b.title}</h4>
                    {b.subtitle && <p className="text-sm text-paa-gray-text font-medium mb-1">{b.subtitle}</p>}
                    <p className="text-xs font-bold text-paa-navy uppercase tracking-widest mb-2 bg-[#f0f4f8] inline-block px-2 py-0.5">{b.genre} {b.subGenre && `> ${b.subGenre}`}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      <div><span className="text-[10px] uppercase text-paa-gray-text block">MRP</span><span className="text-sm font-bold text-green-700">₹{b.mrp}</span></div>
                      <div><span className="text-[10px] uppercase text-paa-gray-text block">Language</span><span className="text-sm font-bold text-paa-navy">{b.language || '-'}</span></div>
                      <div><span className="text-[10px] uppercase text-paa-gray-text block">Format</span><span className="text-sm font-bold text-paa-navy">{b.format || '-'}</span></div>
                      <div><span className="text-[10px] uppercase text-paa-gray-text block">Pages</span><span className="text-sm font-bold text-paa-navy">{b.pages || '-'}</span></div>
                      <div><span className="text-[10px] uppercase text-paa-gray-text block">Publisher</span><span className="text-sm font-bold text-paa-navy">{b.publisher || '-'}</span></div>
                      <div><span className="text-[10px] uppercase text-paa-gray-text block">Pub Date</span><span className="text-sm font-bold text-paa-navy">{b.publicationDate || '-'}</span></div>
                      <div><span className="text-[10px] uppercase text-paa-gray-text block">ISBN</span><span className="text-sm font-bold text-paa-navy">{b.isbn || '-'}</span></div>
                      <div><span className="text-[10px] uppercase text-paa-gray-text block">Initial Stock</span><span className="text-sm font-bold text-paa-navy">{b.stock}</span></div>
                    </div>
                    
                    <div className="mt-4"><span className="text-[10px] uppercase text-paa-gray-text block mb-1">Synopsis</span><p className="text-sm text-paa-navy font-medium whitespace-pre-wrap leading-relaxed">{b.synopsis}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white border border-paa-navy/5 p-6 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out">
            <h3 className="text-2xl font-serif font-semibold text-paa-navy tracking-tight mb-4 border-l-4 border-paa-navy pl-2">Payment Details</h3>
            <div className="flex gap-8 items-start">
               <div>
                  <span className="text-xs font-bold text-paa-gray-text uppercase block mb-1">Transaction ID</span>
                  <span className="text-sm text-paa-navy font-bold bg-gray-100 px-2 py-1">{authorProfile.transactionId || '-'}</span>
               </div>
               {authorProfile.paymentScreenshot && (
                 <div>
                    <span className="text-xs font-bold text-paa-gray-text uppercase block mb-1">Receipt</span>
                    <a href={import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + authorProfile.paymentScreenshot : "http://localhost:3001" + authorProfile.paymentScreenshot} target="_blank" className="text-sm text-blue-600 underline font-bold">View Screenshot</a>
                 </div>
               )}
            </div>
          </div>
        </div>
        )}

        {activeProfileTab === 'inventory' && (
        <div id="inventory">
          <h3 className="text-2xl font-serif font-semibold text-paa-navy tracking-tight mb-4 border-l-4 border-paa-navy pl-2">Books & Inventory</h3>
          <div className="overflow-x-auto">
            <table className="dash-table">
               <thead>
                 <tr>
                   <th>Title</th>
                   <th style={{textAlign: 'center'}}>MRP</th>
                   <th style={{textAlign: 'center'}}>Stock</th>
                   <th style={{textAlign: 'center'}}>Status</th>
                 </tr>
               </thead>
               <tbody>
                 {authorProfile.books.length === 0 ? <tr><td colSpan={4} className="text-center py-4 text-paa-gray-text">No books published.</td></tr> : authorProfile.books.map((b: any) => (
                   <tr key={b.id}>
                     <td className="font-bold text-paa-navy">{b.title} <span className="text-xs text-gray-500 font-medium block">{b.genre}</span></td>
                     <td style={{textAlign: 'center'}} className="font-bold text-paa-navy">₹{b.mrp}</td>
                     <td style={{textAlign: 'center'}} className="font-bold text-paa-navy">{b.stock}</td>
                     <td style={{textAlign: 'center'}}>
                        <span className={`dash-badge ${b.status === 'Approved' ? 'approved' : 'pending'}`}>
                          {b.status}
                        </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </div>
        )}

        {activeProfileTab === 'orders' && (
        <div id="orders">
          <h3 className="text-2xl font-serif font-semibold text-paa-navy tracking-tight mb-4 border-l-4 border-paa-navy pl-2">Web Orders</h3>
          <div className="overflow-x-auto bg-white border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out">
            <table className="dash-table">
               <thead>
                 <tr>
                   <th>Order ID</th>
                   <th>Customer</th>
                   <th>Book</th>
                   <th style={{textAlign: 'center'}}>Qty / Amt</th>
                   <th style={{textAlign: 'center'}}>Status</th>
                   <th style={{textAlign: 'center'}}>Payment</th>
                 </tr>
               </thead>
               <tbody>
                 {authorOrders.length === 0 ? <tr><td colSpan={6} className="text-center py-4 text-paa-gray-text">No web orders yet.</td></tr> : authorOrders.map((o: any) => (
                   <tr key={o.id}>
                     <td className="font-bold text-paa-navy">ORD-{o.orderId}<span className="text-[10px] block text-gray-500">{o.date}</span></td>
                     <td className="font-medium text-paa-navy">{o.customerName}</td>
                     <td className="font-medium text-paa-navy">{o.bookTitle}</td>
                     <td style={{textAlign: 'center'}} className="font-bold text-paa-navy">{o.quantity} <span className="text-gray-400 font-medium px-1">/</span> ₹{o.amount}</td>
                     <td style={{textAlign: 'center'}}>
                        <span className={`dash-badge ${o.status === 'Completed' ? 'approved' : 'pending'}`}>
                          {o.status}
                        </span>
                     </td>
                     <td style={{textAlign: 'center'}}>
                        {o.paymentVerified ? <span className="dash-badge approved"><Check size={10}/> Verified</span> : o.paymentFailed ? <span className="dash-badge rejected"><XCircle size={10}/> Failed</span> : <span className="dash-badge pending">Pending</span>}
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </div>
        )}

        {activeProfileTab === 'events' && (
        <div id="events">
          <h3 className="text-2xl font-serif font-semibold text-paa-navy tracking-tight mb-4 border-l-4 border-paa-navy pl-2">Event Participations</h3>
          <div className="overflow-x-auto bg-white border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out">
            <table className="dash-table">
               <thead>
                 <tr>
                   <th>Event Name</th>
                   <th>City</th>
                   <th style={{textAlign: 'center'}}>Amount Paid</th>
                   <th style={{textAlign: 'center'}}>Date</th>
                 </tr>
               </thead>
               <tbody>
                 {authorProfile.eventRegistrations.length === 0 ? <tr><td colSpan={4} className="text-center py-4 text-paa-gray-text">No events attended.</td></tr> : authorProfile.eventRegistrations.map((e: any) => (
                   <tr key={e.id}>
                     <td className="font-bold text-paa-navy">{e.activity?.name}</td>
                     <td className="font-medium text-paa-navy">{e.activity?.city}</td>
                     <td style={{textAlign: 'center'}} className="font-bold text-green-700">₹{e.amount}</td>
                     <td style={{textAlign: 'center'}} className="font-medium text-paa-gray-text">{e.activity?.date}</td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </div>
        )}

        {activeProfileTab === 'distribution' && (
        <div id="distribution">
          <h3 className="text-2xl font-serif font-semibold text-paa-navy tracking-tight mb-4 border-l-4 border-paa-navy pl-2">Books Distribution Record</h3>
          <div className="overflow-x-auto bg-white border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out">
            <table className="dash-table">
               <thead>
                 <tr>
                   <th>Title</th>
                   <th style={{textAlign: 'center'}}>Qty Sold</th>
                   <th style={{textAlign: 'center'}}>Airport Stock</th>
                   <th style={{textAlign: 'center'}}>Fair Stock</th>
                   <th style={{textAlign: 'center'}}>In Stock</th>
                 </tr>
               </thead>
               <tbody>
                 {authorProfile.books.length === 0 ? <tr><td colSpan={5} className="text-center py-4 text-paa-gray-text">No distribution records.</td></tr> : authorProfile.books.map((b: any) => {
                   const qtySold = authorOrders.filter((o: any) => o.bookTitle === b.title && (o.status === 'Completed' || o.status === 'Dispatched')).reduce((acc: number, curr: any) => acc + curr.quantity, 0);
                   return (
                   <tr key={b.id}>
                     <td className="font-bold text-paa-navy">{b.title}</td>
                     <td style={{textAlign: 'center'}} className="font-bold text-green-700">{qtySold}</td>
                     <td style={{textAlign: 'center'}}>{b.airportStock || 0}</td>
                     <td style={{textAlign: 'center'}}>{b.fairStock || 0}</td>
                     <td style={{textAlign: 'center'}} className="font-bold">{b.stock}</td>
                   </tr>
                 )})}
               </tbody>
            </table>
          </div>
        </div>
        )}

        </div>
      </div>
    </div>
  );
};

export function OperationsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'web_orders' | 'sales_report' | 'authors' | 'books' | 'events' | 'forms' | 'gallery' | 'author_data' | 'helpdesk' | 'settings'>((localStorage.getItem('adminActiveTab') as any) || 'overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedBookDetails, setSelectedBookDetails] = useState<any>(null);
  const [pendingAlerts, setPendingAlerts] = useState({ orders: false, queries: false, authors: false, books: false });

  useEffect(() => {
    setPendingAlerts(prev => {
      const next = { ...prev };
      if (activeTab === 'orders' || activeTab === 'web_orders') next.orders = false;
      if (activeTab === 'helpdesk') next.queries = false;
      if (activeTab === 'authors') next.authors = false;
      if (activeTab === 'books') next.books = false;
      return next;
    });
  }, [activeTab]);

  const prevCountsRef = React.useRef({ orders: 0, queries: 0, authors: 0, books: 0 });
  const prevQueryCountRef = useRef<number>(0);
  const prevOrderCountRef = useRef<number>(0);
  const [dismissedActions, setDismissedActions] = useState<string[]>([]);
  useEffect(() => {
    
  }, [activeTab]);
  const [searchTerm, setSearchTerm] = useState('');
  const [authorStatusFilter, setAuthorStatusFilter] = useState('All');
  const [bookStatusFilter, setBookStatusFilter] = useState('All');
  const navigate = useNavigate();
  
  // State for data
  const [stats, setStats] = useState<any>({ totalAuthors: 0, totalBooks: 0, eventParticipations: 0, totalRevenue: 0, revenueData: [], recentActivities: [], salesByAuthor: [], salesByGenre: [], topSellingBooks: [], topCustomers: [], lowStockAlerts: [] });
  const [authors, setAuthors] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Modals state
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [reportEventId, setReportEventId] = useState<number | null>(null);
  const [eventReportData, setEventReportData] = useState<any>(null);
  const [pendingReportStatus, setPendingReportStatus] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<any>(null);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [isEditBookModalOpen, setIsEditBookModalOpen] = useState(false);
  const [rejectAuthorTarget, setRejectAuthorTarget] = useState<any>(null);
  const [rejectReasons, setRejectReasons] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState('');
  const [editingAuthor, setEditingAuthor] = useState<any>(null);
  const [isEditAuthorModalOpen, setIsEditAuthorModalOpen] = useState(false);
  
  const [forms, setForms] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [selectedFormResponses, setSelectedFormResponses] = useState<any>(null);
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  
  const [selectedGalleryEvent, setSelectedGalleryEvent] = useState<any>(null);
  const [isEditGalleryModalOpen, setIsEditGalleryModalOpen] = useState(false);
  const [editingGalleryEvent, setEditingGalleryEvent] = useState<any>(null);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [viewingRegistrationsEventId, setViewingRegistrationsEventId] = useState<number | null>(null);
  const [eventRegistrations, setEventRegistrations] = useState<any[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [registrationsFilter, setRegistrationsFilter] = useState('All');
  const [registrationsPage, setRegistrationsPage] = useState(1);

  const fetchEventRegistrations = async (eventId: number) => {
    setLoadingRegistrations(true);
    setViewingRegistrationsEventId(eventId);
    try {
      const res = await axios.get(`${API}/api/admin/events/${eventId}/registrations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEventRegistrations(res.data);
    } catch (err) {
      toast.error('Failed to load registrations');
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleApproveRegistration = async (eventId: number, authorId: number) => {
    try {
      await axios.post(`${API}/api/admin/events/${eventId}/author/${authorId}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Registration approved');
      fetchEventRegistrations(eventId);
      fetchEvents();
    } catch (err) {
      toast.error('Failed to approve registration');
    }
  };

  const handleRejectRegistration = async (eventId: number, authorId: number) => {
    try {
      await axios.post(`${API}/api/admin/events/${eventId}/author/${authorId}/reject`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Registration rejected');
      fetchEventRegistrations(eventId);
    } catch (err) {
      toast.error('Failed to reject registration');
    }
  };

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const fetchOverview = async () => {
    setIsRefreshing(true);
    try {
      const res = await axios.get(`${API}/api/admin/dashboard-stats`);
      setStats(res.data);
    } catch(err) {} finally { setIsRefreshing(false); }
  };

  const fetchAuthors = async () => {
    setIsRefreshing(true);
    try {
      const res = await axios.get(`${API}/api/admin/authors`);
      setAuthors(res.data);
      const c = res.data.filter((a: any) => a.status === 'Pending').length; if (c > prevCountsRef.current.authors) setPendingAlerts(prev => ({ ...prev, authors: true })); prevCountsRef.current.authors = c;
    } catch(err) {} finally { setIsRefreshing(false); }
  };

  const fetchBooks = async () => {
    setIsRefreshing(true);
    try {
      const res = await axios.get(`${API}/api/admin/books`);
      setBooks(res.data);
      const c = res.data.filter((b: any) => b.status === 'Pending').length; if (c > prevCountsRef.current.books) setPendingAlerts(prev => ({ ...prev, books: true })); prevCountsRef.current.books = c;
    } catch(err) {} finally { setIsRefreshing(false); }
  };

  const fetchEvents = async () => {
    setIsRefreshing(true);
    try {
      const res = await axios.get(`${API}/api/admin/events`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setEvents(res.data);
    } catch(err) {} finally { setIsRefreshing(false); }
  };

  

  const handleNotifySettlement = async () => {
     try {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/events/${reportEventId}/notify-settlement`, {}, {
           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success("Notification emails sent to all pending authors!");
     } catch (err) {
        toast.error("Failed to notify authors");
     }
  };

  const fetchEventReport = async (eventId: any) => {
    if (typeof eventId === 'string' && eventId.startsWith('legacy_')) {
      const legacyId = parseInt(eventId.split('_')[1]);
      const legacyEvt = pastEventsData.find(e => e.id === legacyId);
      if (!legacyEvt) return;
      
      // Only show existing data for legacy events
      setEventReportData([{
         isLegacySummary: true,
         authorsParticipated: legacyEvt.authorsParticipated || 0,
         booksSold: legacyEvt.booksSold || 0
      }]);
      setReportEventId(Number(eventId));
      return;
    }
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/events/${eventId}/report`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.status === 'live') {
         setEventReportData(res.data);
         setPendingReportStatus(null);
      } else if (res.data.status === 'pending') {
         setPendingReportStatus(res.data);
         setEventReportData(res.data.data || []);
      } else {
         setPendingReportStatus(null);
         setEventReportData(res.data.data);
      }
      setReportEventId(eventId);
    } catch (err) {
      toast.error('Failed to load event report');
    }
  };

  const handleBroadcastEvent = async (eventId: number, target: 'Authors' | 'Customers') => {
    try {
      const res = await axios.post(`${API}/api/admin/events/${eventId}/broadcast`, { target }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success(res.data.message);
      fetchEvents();
    } catch(err) {
      toast.error('Failed to broadcast event');
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(`${API}/api/admin/events/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch(err) {
      toast.error('Failed to delete event');
    }
  };

  const handleEditEventClick = (event: any) => {
    setEditingEvent({ 
      id: event.id, 
      name: event.name, 
      date: event.date, 
      duration: event.duration, 
      location: event.location, 
      status: event.status,
      eventType: event.eventType || 'Book Fair',
      registrationFee: event.registrationFee || 0,
      feeType: event.feeType || 'Per Author'
    });
    setIsEditEventModalOpen(true);
  };

  const handleEditEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    try {
      const form = e.target as HTMLFormElement;
      
      const eType = (form.elements.namedItem('eventType') as HTMLSelectElement).value === 'Other' 
          ? (form.elements.namedItem('customEventType') as HTMLInputElement).value 
          : editingEvent.eventType;
          
      const fd = new FormData();
      fd.append('name', editingEvent.name);
      fd.append('date', editingEvent.date);
      fd.append('location', editingEvent.location);
      fd.append('duration', editingEvent.duration);
      fd.append('eventType', eType);
      fd.append('registrationFee', editingEvent.registrationFee.toString());
      fd.append('feeType', editingEvent.feeType);
      fd.append('status', editingEvent.status);
      
      const descVal = (form.elements.namedItem('description') as HTMLTextAreaElement)?.value;
      if (descVal) fd.append('description', descVal);
      
      const bannerInput = form.elements.namedItem('banner') as HTMLInputElement;
      if (bannerInput && bannerInput.files && bannerInput.files[0]) {
          fd.append('banner', bannerInput.files[0]);
      }

      await axios.put(`${API}/api/admin/events/${editingEvent.id}`, fd, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Event updated successfully');
      setIsEditEventModalOpen(false);
      fetchEvents();
    } catch(err) {
      toast.error('Failed to update event');
    }
  };

  const fetchOrders = async (background = false) => {
    if (!background) setIsRefreshing(true);
    try {
      const w = window as any;
      w.__apiCache = w.__apiCache || {};
      if (!background && w.__apiCache.adminOrders) {
         setOrders(w.__apiCache.adminOrders);
         prevOrderCountRef.current = w.__apiCache.adminOrders.length;
      }
      
      const res = await axios.get(`${API}/api/admin/orders`);
      const newCount = res.data.length;
      
      if (background && prevOrderCountRef.current > 0 && newCount > prevOrderCountRef.current && activeTab !== 'orders') {
         setPendingAlerts(prev => ({ ...prev, orders: true }));
      }
      prevOrderCountRef.current = newCount;
      w.__apiCache.adminOrders = res.data;
      
      setOrders(res.data);
      const c = res.data.filter((o: any) => o.status === 'Pending').length; if (c > prevCountsRef.current.orders) setPendingAlerts(prev => ({ ...prev, orders: true })); prevCountsRef.current.orders = c;
    } catch(err) {} finally { if (!background) setIsRefreshing(false); }
  };


  const fetchQueriesAlert = async (silent?: boolean) => {
    try {
      const res = await axios.get(`${API}/api/admin/queries`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      const c = res.data.filter((q: any) => q.status === 'Pending').length; if (c > prevCountsRef.current.queries) setPendingAlerts(prev => ({ ...prev, queries: true })); prevCountsRef.current.queries = c;
    } catch(err) {}
  };

  const fetchForms = async () => {
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/admin/forms`, { headers: { Authorization: `Bearer ${token}` }});
      setForms(res.data);
    } catch(err) {} finally { setIsRefreshing(false); }
  };

  const fetchGallery = async () => {
    setIsRefreshing(true);
    try {
      const res = await axios.get(`${API}/api/gallery`);
      setGallery(res.data);
    } catch(err) {} finally { setIsRefreshing(false); }
  };

  const handleUploadGalleryImage = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    if (!selectedGalleryEvent) return;
    
    const formData = new FormData();
    formData.append('photo', target.photo.files[0]);
    formData.append('caption', target.caption.value);
    formData.append('dateTaken', target.dateTaken.value);

    try {
      await axios.post(`${API}/api/admin/gallery/${selectedGalleryEvent.id}/images`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      toast.success('Image added to gallery');
      const updatedRes = await axios.get(`${API}/api/gallery`);
      setGallery(updatedRes.data);
      setSelectedGalleryEvent(updatedRes.data.find((g: any) => g.id === selectedGalleryEvent.id));
      target.reset();
    } catch (err) {
      toast.error('Failed to upload image');
    }
  };

  const handleDeleteGalleryImage = async (imageId: number) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await axios.delete(`${API}/api/admin/gallery/images/${imageId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      toast.success('Image deleted');
      const updatedRes = await axios.get(`${API}/api/gallery`);
      setGallery(updatedRes.data);
      setSelectedGalleryEvent(updatedRes.data.find((g: any) => g.id === selectedGalleryEvent.id));
    } catch(err) {
      toast.error('Failed to delete image');
    }
  };

  useEffect(() => {
    const fetchCurrentTabData = async () => {
      setIsRefreshing(true);
      try {
        await Promise.all([
          fetchOverview(),
          fetchAuthors(),
          fetchBooks(),
          fetchEvents(),
          fetchOrders(true),
          fetchForms(),
          fetchGallery(),
          fetchQueriesAlert(true)
        ]);
        setLastRefreshTime(Date.now());
      } finally {
        setTimeout(() => setIsRefreshing(false), 800);
        setLoading(false);
      }
    };

    fetchCurrentTabData();

    const interval = setInterval(fetchCurrentTabData, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);


  // Handlers
  const handleDeleteAuthor = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this author?')) {
      try {
        await axios.delete(`${API}/api/admin/authors/${id}`);
        toast.success('Author Removed');
        fetchAuthors();
        fetchOverview();
      } catch(err) {
        toast.error('Failed to remove author');
      }
    }
  };

  const handleApproveAuthor = async (id: number) => {
    try {
      setLoadingAction('approveAuthor_' + id);
      await axios.post(`${API}/api/admin/authors/${id}/approve`);
      toast.success('Author Approved!');
      fetchAuthors();
    } catch(err) {
      toast.error('Failed to approve author');
    } finally {
      setLoadingAction(null);
    }
  };

  const AUTHOR_REJECTION_REASONS = [
    'Book cover image not provided or incorrect',
    'Book title is missing or unclear',
    'Author bio is too short or missing',
    'Incomplete registration details',
    'Duplicate registration detected',
    'Book synopsis not provided',
    'Contact information incorrect',
    'Payment not verified',
    'Content policy violation',
  ];

  const BOOK_REJECTION_REASONS = [
    'Cover image is blurry, low quality, or inappropriate',
    'Synopsis is missing, unclear, or too short',
    'Book pricing is missing or incorrect',
    'Content violates platform guidelines',
    'Formatting, language, or metadata issues',
    'Duplicate book entry detected',
    'ISBN or Publication details are invalid'
  ];

  const [rejectBookTarget, setRejectBookTarget] = useState<any>(null);
  const [rejectBookReasons, setRejectBookReasons] = useState<string[]>([]);
  const [otherBookReason, setOtherBookReason] = useState('');

  const openRejectAuthorModal = (author: any) => {
    setRejectAuthorTarget(author);
    setRejectReasons([]);
    setOtherReason('');
  };

  const handleRejectAuthorSubmit = async () => {
    const reasons = [...rejectReasons];
    if (otherReason.trim()) reasons.push(otherReason.trim());
    if (reasons.length === 0) { alert('Please select or enter at least one reason.'); return; }
    const reason = reasons.join('; ');
    setLoadingAction('rejectAuthor');
    try {
      await axios.post(`${API}/api/admin/authors/${rejectAuthorTarget.id}/reject`, { reason });
      toast.success('Author Rejected');
      setRejectAuthorTarget(null);
      fetchAuthors();
    } catch (err) {
      toast.error('Failed to reject author');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEditAuthorClick = (author: any) => {
    setEditingAuthor({ id: author.id, name: author.name, bio: author.bio || '', phone: author.phone || '', whatsapp: author.whatsapp || '' });
    setIsEditAuthorModalOpen(true);
  };

  const handleUpdateAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAuthor) return;
    setLoadingAction('updateAuthor');
    try {
      await axios.put(`${API}/api/admin/authors/${editingAuthor.id}`, {
        name: editingAuthor.name,
        bio: editingAuthor.bio,
        phone: editingAuthor.phone,
        whatsapp: editingAuthor.whatsapp,
      });
      setIsEditAuthorModalOpen(false);
      setEditingAuthor(null);
      fetchAuthors();
      alert('Author profile updated!');
    } catch (err) {
      alert('Failed to update author');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteBook = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this book?')) {
      await axios.delete(`${API}/api/admin/books/${id}`);
      fetchBooks();
      fetchOverview();
    }
  };

  const handleApproveBook = async (id: number) => {
    setLoadingAction('approveBook_' + id);
    try {
      await axios.post(`${API}/api/admin/books/${id}/approve`);
      fetchBooks();
    } catch (err) {
      alert("Failed to approve book");
    } finally { setLoadingAction(null); }
  };

  const handleRejectBook = (bookId: number) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    setRejectBookTarget(book);
    setRejectBookReasons([]);
    setOtherBookReason('');
  };

  const handleRejectBookSubmit = async () => {
    if (!rejectBookTarget) return;
    const reasons = [...rejectBookReasons];
    if (otherBookReason.trim()) reasons.push(otherBookReason.trim());
    if (reasons.length === 0) { alert('Please select or enter at least one reason.'); return; }
    
    const finalReason = reasons.join('; ');
    setLoadingAction('rejectBook_' + rejectBookTarget.id);
    try {
      await axios.post(`${API}/api/admin/books/${rejectBookTarget.id}/reject`, { reason: finalReason });
      fetchBooks();
      setRejectBookTarget(null);
    } catch (err) {
      alert("Failed to reject book");
    } finally { setLoadingAction(null); }
  };

  const handleEditBookClick = (book: any) => {
    setEditingBook({
      id: book.id,
      title: book.title,
      genre: book.genre,
      subGenre: book.subGenre || '',
      mrp: book.mrp,
      stock: book.stock,
      synopsis: book.synopsis || ''
    });
    setIsEditBookModalOpen(true);
  };

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    setLoadingAction('updateBook');
    try {
      await axios.put(`${API}/api/admin/books/${editingBook.id}`, {
        title: editingBook.title,
        genre: editingBook.genre,
        subGenre: editingBook.subGenre,
        mrp: parseFloat(editingBook.mrp),
        stock: parseInt(editingBook.stock),
        synopsis: editingBook.synopsis
      });
      setIsEditBookModalOpen(false);
      setEditingBook(null);
      fetchBooks();
      alert("Book updated successfully!");
    } catch (err) {
      alert("Failed to update book details");
    } finally { setLoadingAction(null); }
  };

  const handleVerifyOrder = async (id: number) => {
    if (window.confirm('Are you sure you want to verify this payment?')) {
      setLoadingAction('verifyOrder_' + id);
      try {
        await axios.post(`${API}/api/admin/orders/${id}/verify`);
      fetchOrders();
        setSelectedOrder(null);
      } finally { setLoadingAction(null); }
    }
  };

  const handleRejectOrder = async (id: number) => {
    if (window.confirm('Are you sure you want to mark this payment as not received?')) {
      setLoadingAction('rejectOrder_' + id);
      try {
        await axios.post(`${API}/api/admin/orders/${id}/reject-payment`);
      fetchOrders();
        setSelectedOrder(null);
      } finally { setLoadingAction(null); }
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/orders/export`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'orders_export.csv');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const OverviewTab = ({ refreshTrigger }: { refreshTrigger: number }) => {
    const [localDismissed, setLocalDismissed] = useState<string[]>(() => {
       const saved = localStorage.getItem('paa_dismissed_actions');
       return saved ? JSON.parse(saved) : [];
    });
    const [notifiedBooks, setNotifiedBooks] = useState<Record<string, number>>(() => {
       const saved = localStorage.getItem('paa_notified_lowstock');
       return saved ? JSON.parse(saved) : {};
    });

    const handleDismiss = (e: React.MouseEvent, id: string) => {
       e.stopPropagation();
       setLocalDismissed(prev => {
          const next = [...prev, id];
          localStorage.setItem('paa_dismissed_actions', JSON.stringify(next));
          return next;
       });
    };

    // Low stock books (threshold < 15)
    // Only exclude if the inventory HAS NOT changed since we notified them.
    const lowStockBooks = books.filter((b: any) => {
       const inv = b.inventory || 0;
       const id = b.id || b.dbId;
       if (inv >= 15 || b.status !== 'Approved') return false;
       if (notifiedBooks[id] !== undefined && notifiedBooks[id] === inv) return false;
       return true;
    });

    const handleNotifyAllLowStock = () => {
       setNotifiedBooks(prev => {
          const next = { ...prev };
          lowStockBooks.forEach((b: any) => {
             next[b.id || b.dbId] = b.inventory || 0;
          });
          localStorage.setItem('paa_notified_lowstock', JSON.stringify(next));
          return next;
       });
       toast.success(`Notified ${lowStockBooks.length} authors about low stock!`);
    };

    const handleNotifySingleBook = (id: string, currentInventory: number) => {
       setNotifiedBooks(prev => {
          const next = { ...prev, [id]: currentInventory };
          localStorage.setItem('paa_notified_lowstock', JSON.stringify(next));
          return next;
       });
       toast.success('Author notified about low stock!');
    };

    // KPIs & Insights
    const pendingAuthors = authors.filter((a: any) => a.status === 'Pending').length;
    const pendingEvents = authors.filter((a: any) => a.eventParticipation && a.eventParticipation.length > 0 && a.eventParticipation.some((e: any) => e.status === 'Pending')).length;
    const pendingOrders = orders.filter((o: any) => o.status === 'Pending Verification' || o.status === 'Processing').length;
    const pendingQueries = prevCountsRef.current?.queries || 0;

    const totalOrders = orders.length;
    const completedOrders = orders.filter((o: any) => o.status === 'Completed' || o.status === 'Dispatched').length;
    const orderCompletionRate = totalOrders ? Math.round((completedOrders / totalOrders) * 100) : 0;

    const totalAuthorsCount = authors.length;
    const eventAuthors = authors.filter((a: any) => a.eventParticipation && a.eventParticipation.length > 0).length;
    const eventAdoptionRate = totalAuthorsCount ? Math.round((eventAuthors / totalAuthorsCount) * 100) : 0;

    // Chart Data 1: Category Sales
    const categorySalesMap: Record<string, number> = {};
    orders.forEach((o: any) => {
       if (o.status === 'Completed' || o.status === 'Dispatched') {
          o.items?.forEach((item: any) => {
             const book = books.find((b: any) => b.title === item.title || b.id === item.bookId);
             const cat = book && book.category ? book.category : 'Unknown';
             categorySalesMap[cat] = (categorySalesMap[cat] || 0) + (item.qty || 1);
          });
       }
    });
    const categoryChartData = Object.entries(categorySalesMap)
      .filter(([name]) => name !== 'Others' && name !== 'Uncategorized' && name !== 'N/A' && name !== 'Unknown')
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 6);

    // Chart Data 2: Order Status
    const orderStatusMap: Record<string, number> = {};
    orders.forEach((o: any) => {
      const s = o.status || 'Pending';
      orderStatusMap[s] = (orderStatusMap[s] || 0) + 1;
    });
    const orderStatusData = Object.entries(orderStatusMap).map(([name, value]) => ({ name, value }));

    // Chart Data 3: Top Authors
    const authorSalesMap: Record<string, number> = {};
    orders.forEach((o: any) => {
      if (o.status === 'Completed' || o.status === 'Dispatched') {
        o.items?.forEach((it: any) => {
          const aName = it.authorName || 'Unknown Author';
          authorSalesMap[aName] = (authorSalesMap[aName] || 0) + (it.qty || 1);
        });
      }
    });
    const topAuthorsData = Object.entries(authorSalesMap)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // Chart Data 4: Revenue Trend
    const revenueTrendMap: Record<string, number> = {};
    orders.forEach((o: any) => {
      if (o.status === 'Completed' || o.status === 'Dispatched') {
        const d = o.date || 'Unknown';
        if (d !== 'Unknown') {
           revenueTrendMap[d] = (revenueTrendMap[d] || 0) + (o.total || 0);
        }
      }
    });
    const uniqueDates = Array.from(new Set(orders.filter((o: any) => o.date).map((o: any) => o.date)));
    const recentDates = uniqueDates.slice(0, 7).reverse();
    const revenueTrendData = recentDates.map(d => ({ date: d, revenue: revenueTrendMap[d] || 0 }));

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const totalBooksSoldWeb = Object.values(categorySalesMap).reduce((a: number,b: number) => a+b, 0);
    const totalRevenueWeb = orders.reduce((sum: number, o: any) => (o.status === 'Completed' || o.status === 'Dispatched') ? sum + (o.total || 0) : sum, 0);
    const avgOrderValue = completedOrders > 0 ? Math.round(totalRevenueWeb / completedOrders) : 0;

    const insights = [
      { label: 'Avg Order Value', value: `₹${avgOrderValue}`, desc: 'Avg revenue per successful order', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Order Completion', value: `${orderCompletionRate}%`, desc: 'Of all web orders', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Web Books Sold', value: totalBooksSoldWeb, desc: 'Total physical copies sold online', icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Event Adoption', value: `${eventAdoptionRate}%`, desc: 'Authors in live events', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' }
    ];

    return (
    <div className="space-y-6">
      {/* ── High Level KPIs ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Authors', value: stats?.totalAuthors || 0, icon: Users, colorClass: 'blue' },
          { label: 'Books Published', value: stats?.totalBooks || 0, icon: BookOpen, colorClass: 'green' },
          { label: 'Event Participations', value: stats?.eventParticipations || 0, icon: CalendarIcon, colorClass: 'amber' },
          { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, colorClass: 'red' },
        ].map((kpi, i) => (
          <div key={i} className={`dash-kpi-card ${kpi.colorClass}`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`dash-kpi-icon ${kpi.colorClass}`}><kpi.icon className="w-5 h-5" /></div>
            </div>
            <p className="text-xs font-semibold tracking-wide uppercase text-paa-gray-text mb-1">{kpi.label}</p>
            <h3 className="text-3xl font-bold text-paa-navy tracking-tight">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Visual Data Insights (col-span-2) ── */}
        <div className="lg:col-span-2 space-y-6">
           {/* Mini Insight Cards */}
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
             {insights.map((insight, idx) => (
               <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${insight.bg} ${insight.color}`}>
                     <insight.icon size={16} />
                  </div>
                  <h4 className="text-2xl font-bold text-paa-navy mb-1">{insight.value}</h4>
                  <p className="text-xs font-semibold text-gray-800 mb-1">{insight.label}</p>
                  <p className="text-[10px] text-paa-gray-text">{insight.desc}</p>
               </div>
             ))}
           </div>

           {/* Charts Row 1 */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-sm">
               <h3 className="text-sm font-serif font-semibold text-paa-navy mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Recent Revenue Trend
               </h3>
               <div className="h-48 w-full">
                 {revenueTrendData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={revenueTrendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                       <defs>
                         <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                       <XAxis dataKey="date" fontSize={10} tick={{fill:'#6B7280'}} axisLine={false} tickLine={false} />
                       <YAxis fontSize={10} tick={{fill:'#6B7280'}} axisLine={false} tickLine={false} />
                       <RechartsTooltip cursor={{stroke: '#10b981', strokeWidth: 1, strokeDasharray: '3 3'}} contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}} />
                       <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Revenue (₹)" />
                     </AreaChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="h-full flex items-center justify-center text-gray-400 text-xs">No revenue data.</div>
                 )}
               </div>
             </div>

             <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-sm">
               <h3 className="text-sm font-serif font-semibold text-paa-navy mb-4 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-indigo-500" /> Order Status Distribution
               </h3>
               <div className="h-48 w-full">
                 {orderStatusData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <RechartsPieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                       <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                         {orderStatusData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                       <RechartsTooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}} />
                     </RechartsPieChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="h-full flex items-center justify-center text-gray-400 text-xs">No orders.</div>
                 )}
               </div>
             </div>
           </div>

           {/* Charts Row 2 */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-sm">
               <h3 className="text-sm font-serif font-semibold text-paa-navy mb-4 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-blue-500" /> Most Popular Categories
               </h3>
               <div className="h-56 w-full">
                 {categoryChartData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={categoryChartData} layout="vertical" margin={{ top: 5, right: 10, left: 40, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                       <XAxis type="number" fontSize={10} tick={{fill:'#6B7280'}} axisLine={false} tickLine={false} />
                       <YAxis dataKey="name" type="category" fontSize={10} tick={{fill:'#4B5563', fontWeight: 600}} axisLine={false} tickLine={false} width={80} />
                       <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}} />
                       <Bar dataKey="sales" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Books Sold">
                          {categoryChartData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                       </Bar>
                     </BarChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="h-full flex items-center justify-center text-gray-400 text-xs">No category data.</div>
                 )}
               </div>
             </div>

             <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-sm">
               <h3 className="text-sm font-serif font-semibold text-paa-navy mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500" /> Top Performing Authors
               </h3>
               <div className="h-56 w-full">
                 {topAuthorsData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={topAuthorsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                       <XAxis dataKey="name" fontSize={10} tick={{fill:'#6B7280'}} axisLine={false} tickLine={false} />
                       <YAxis fontSize={10} tick={{fill:'#6B7280'}} axisLine={false} tickLine={false} />
                       <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}} />
                       <Bar dataKey="sales" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Books Sold">
                          {topAuthorsData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'][index % 5]} />
                          ))}
                       </Bar>
                     </BarChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="h-full flex items-center justify-center text-gray-400 text-xs">No author sales data.</div>
                 )}
               </div>
             </div>
           </div>
        </div>

        {/* ── Pending Actions & Low Stock (col-span-1) ── */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-sm">
             <h3 className="text-lg font-serif font-semibold text-paa-navy mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" /> Pending Actions
             </h3>
             <div className="space-y-3">
                {!localDismissed.includes('authors') && pendingAuthors > 0 && (
                  <div className="group relative flex items-center justify-between p-3 rounded-xl border border-paa-navy/10 hover:bg-paa-navy/5 transition-colors text-left cursor-pointer" onClick={() => setActiveTab('authors')}>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                           <Users size={18} />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-paa-navy">Approve New Authors</p>
                           <p className="text-xs text-paa-gray-text">{pendingAuthors} authors waiting for approval</p>
                        </div>
                     </div>
                     <button onClick={(e) => handleDismiss(e, 'authors')} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                        <X size={16} />
                     </button>
                  </div>
                )}

                {!localDismissed.includes('events') && pendingEvents > 0 && (
                  <div className="group relative flex items-center justify-between p-3 rounded-xl border border-paa-navy/10 hover:bg-paa-navy/5 transition-colors text-left cursor-pointer" onClick={() => setActiveTab('events')}>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                           <CalendarIcon size={18} />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-paa-navy">Event Registrations</p>
                           <p className="text-xs text-paa-gray-text">{pendingEvents} new event participations pending</p>
                        </div>
                     </div>
                     <button onClick={(e) => handleDismiss(e, 'events')} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                        <X size={16} />
                     </button>
                  </div>
                )}

                {!localDismissed.includes('orders') && pendingOrders > 0 && (
                  <div className="group relative flex items-center justify-between p-3 rounded-xl border border-paa-navy/10 hover:bg-paa-navy/5 transition-colors text-left cursor-pointer" onClick={() => setActiveTab('web_orders')}>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                           <ShoppingCart size={18} />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-paa-navy">Fulfill Web Orders</p>
                           <p className="text-xs text-paa-gray-text">{pendingOrders} orders pending verification or dispatch</p>
                        </div>
                     </div>
                     <button onClick={(e) => handleDismiss(e, 'orders')} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                        <X size={16} />
                     </button>
                  </div>
                )}
                
                {!localDismissed.includes('helpdesk') && pendingQueries > 0 && (
                  <div className="group relative flex items-center justify-between p-3 rounded-xl border border-paa-navy/10 hover:bg-paa-navy/5 transition-colors text-left cursor-pointer" onClick={() => setActiveTab('helpdesk')}>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                           <MessageSquare size={18} />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-paa-navy">Author Queries</p>
                           <p className="text-xs text-paa-gray-text">{pendingQueries} unread helpdesk queries</p>
                        </div>
                     </div>
                     <button onClick={(e) => handleDismiss(e, 'helpdesk')} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                        <X size={16} />
                     </button>
                  </div>
                )}

                {((localDismissed.includes('authors') || pendingAuthors === 0) &&
                  (localDismissed.includes('events') || pendingEvents === 0) &&
                  (localDismissed.includes('orders') || pendingOrders === 0) &&
                  (localDismissed.includes('helpdesk') || pendingQueries === 0)) && (
                   <div className="text-center py-6 text-sm text-paa-gray-text">No pending actions to display.</div>
                )}
             </div>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-sm flex flex-col h-[500px]">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif font-semibold text-paa-navy flex items-center gap-2">
                   <Package className="w-5 h-5 text-red-500" /> Low Stock Books Alert
                </h3>
                {lowStockBooks.length > 0 && (
                   <button onClick={handleNotifyAllLowStock} className="text-xs flex items-center gap-1 font-bold text-paa-navy bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors uppercase tracking-wider">
                      <Bell size={12} className="text-amber-500" /> Notify All
                   </button>
                )}
             </div>
             {lowStockBooks.length === 0 ? (
                <div className="text-center py-8 text-sm text-paa-gray-text my-auto">All books have sufficient inventory or authors notified.</div>
             ) : (
                <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                   {lowStockBooks.map((b: any) => (
                      <div key={b.dbId || b.id} className="flex items-center justify-between p-3 rounded-xl border border-red-100 bg-red-50/30 group">
                         <div className="flex-1 min-w-0 pr-4">
                            <p className="text-sm font-bold text-paa-navy line-clamp-1">{b.title}</p>
                            <p className="text-xs text-paa-gray-text">by {b.authorName}</p>
                         </div>
                         <div className="flex items-center gap-3 shrink-0">
                            <button onClick={() => handleNotifySingleBook(b.id || b.dbId, b.inventory || 0)} className="opacity-0 group-hover:opacity-100 p-1.5 bg-white text-gray-400 hover:text-amber-500 rounded-full shadow-sm transition-all" title="Notify Author">
                               <Bell size={14} />
                            </button>
                            <div className="text-right">
                               <span className="text-lg font-black text-red-600">{b.inventory || 0}</span>
                               <p className="text-[10px] uppercase tracking-widest font-bold text-red-400">Left</p>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             )}
           </div>
        </div>
      </div>
    </div>
    );
  };


  const SalesReportTab = ({ refreshTrigger }: { refreshTrigger?: number }) => {
    const [reportPeriod, setReportPeriod] = useState('daily');
    const [isExporting, setIsExporting] = useState(false);
    const [salesChartData, setSalesChartData] = useState<any[]>([]);
    const [salesTableData, setSalesTableData] = useState<any[]>([]);
    const [isLoadingTable, setIsLoadingTable] = useState(false);
    const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
      const fetchChartData = async () => {
        try {
          const res = await axios.get(`${API}/api/admin/reports/chart?period=${reportPeriod}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setSalesChartData(res.data);
        } catch (err) {
          toast.error('Failed to load chart data');
        }
      };
      const fetchTableData = async () => {
        setIsLoadingTable(true);
        try {
          const res = await axios.get(`${API}/api/admin/reports/sales?period=${reportPeriod}&format=json`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setSalesTableData(res.data);
        } catch (err) {
          setSalesTableData([]);
        } finally {
          setIsLoadingTable(false);
        }
      };
      fetchChartData();
      fetchTableData();
    }, [reportPeriod, API, refreshTrigger]);

    const handleExportSalesReport = async () => {
      setIsExporting(true);
      try {
        const res = await axios.get(`${API}/api/admin/reports/sales?period=${reportPeriod}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        const today = new Date().toISOString().split('T')[0];
        link.href = url;
        link.setAttribute('download', `sales_report_${reportPeriod}_${today}.csv`);
        document.body.appendChild(link);
        link.click();
        toast.success('Sales report exported successfully');
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          toast.error('No sales data found for this period format.');
        } else {
          toast.error('Failed to export sales report');
        }
      } finally {
        setIsExporting(false);
      }
    };
    const successfulOrders = orders.filter((o: any) => o.status === 'Completed').length;
    const toApproveOrders = orders.filter((o: any) => o.status === 'Pending Verification' || o.status === 'Processing').length;
    const underDeliveryOrders = orders.filter((o: any) => o.status === 'Dispatched').length;

    return (
    <div className="space-y-6">
      {/* Ã¢â€â‚¬Ã¢â€â‚¬ High Level KPIs Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Authors', value: stats?.totalAuthors || 0, icon: Users, colorClass: 'blue' },
          { label: 'Books Published', value: stats?.totalBooks || 0, icon: BookOpen, colorClass: 'green' },
          { label: 'Event Participations', value: stats?.eventParticipations || 0, icon: CalendarIcon, colorClass: 'amber' },
          { label: 'Total Revenue', value: `Ã¢â€šÂ¹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, colorClass: 'red' },
        ].map((kpi, i) => (
          <div key={i} className={`dash-kpi-card ${kpi.colorClass}`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`dash-kpi-icon ${kpi.colorClass}`}><kpi.icon className="w-5 h-5" /></div>
            </div>
            <p className="text-xs font-semibold tracking-wide uppercase text-paa-gray-text mb-1">{kpi.label}</p>
            <h3 className="text-3xl font-bold text-paa-navy tracking-tight">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Order Tracking KPIs Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="dash-kpi-card green" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
            <Check size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-paa-gray-text mb-1">Successful Orders</p>
            <h3 className="text-2xl font-bold text-paa-navy">{successfulOrders}</h3>
          </div>
        </div>
        <div className="dash-kpi-card amber" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-paa-gray-text mb-1">To Be Approved</p>
            <h3 className="text-2xl font-bold text-paa-navy">{toApproveOrders}</h3>
          </div>
        </div>
        <div className="dash-kpi-card blue" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Package size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-paa-gray-text mb-1">Under Delivery</p>
            <h3 className="text-2xl font-bold text-paa-navy">{underDeliveryOrders}</h3>
          </div>
        </div>
      </div>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Sales & Revenue Reports Ã¢â€â‚¬Ã¢â€â‚¬ */}
       <div className="bg-white p-4 md:p-8 border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out rounded-3xl-2xl mt-8">
          <div className="mb-6 border-b border-paa-navy/5 pb-4">
             <h3 className="text-xl font-serif font-medium text-paa-navy mb-1 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Sales & Revenue Reports
             </h3>
             <p className="text-paa-gray-text text-sm">Generate comprehensive reports on books sold through all channels (Web & Live Events).</p>
          </div>
          
          {salesChartData.length > 0 && (
            <div className="mb-8 border border-paa-navy/5 p-4 rounded-xl overflow-x-auto">
               <h4 className="text-sm font-bold text-paa-navy uppercase tracking-widest mb-4">Books Sold By Channel</h4>
               <div className="h-64 min-w-[500px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={salesChartData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                     <XAxis dataKey="name" fontSize={10} tick={{fill:'#6B7280'}} axisLine={false} tickLine={false} />
                     <YAxis fontSize={10} tick={{fill:'#6B7280'}} axisLine={false} tickLine={false} />
                     <RechartsTooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                     <Area type="monotone" dataKey="Web" stackId="1" stroke="#3b82f6" fill="#bfdbfe" name="Online Orders (Web)" />
                     <Area type="monotone" dataKey="POS" stackId="1" stroke="#10b981" fill="#a7f3d0" name="Event Sales (POS)" />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 w-full">
              <label className="dash-label">Report Grouping Period</label>
              <select className="dash-input w-full" value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)}>
                <option value="daily">Daily (Group by Day)</option>
                <option value="weekly">Weekly (Group by Week)</option>
                <option value="monthly">Monthly (Group by Month)</option>
                <option value="yearly">Yearly (Group by Year)</option>
                <option value="lifelong">Lifelong (All Time)</option>
              </select>
            </div>
            <button 
              onClick={handleExportSalesReport}
              disabled={isExporting}
              className="dash-btn dash-btn-primary whitespace-nowrap h-12 px-8 w-full md:w-auto"
            >
              {isExporting ? 'Generating Report...' : 'Download CSV Report'}
            </button>
          </div>
          <div className="mt-8 border border-paa-navy/5 rounded-2xl overflow-hidden shadow-sm">
             <div className="overflow-x-auto">
               <table className="dash-table w-full text-left min-w-[600px]">
                  <thead className="bg-[#f0f4f8]">
                     <tr>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-paa-navy/5">Period</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-paa-navy/5">Channel</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-paa-navy/5">Author</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-paa-navy/5">Book Title</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-paa-navy/5 text-right">Qty</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-paa-navy/5 text-right">Revenue</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-paa-navy/5 bg-white">
                     {isLoadingTable ? (
                        <tr><td colSpan={6} className="text-center py-6 text-sm text-paa-gray-text"><Loader2 className="w-5 h-5 animate-spin mx-auto text-paa-navy" /></td></tr>
                     ) : salesTableData.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-6 text-sm text-paa-gray-text italic">No sales data found for this period.</td></tr>
                     ) : salesTableData.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                           <td className="px-4 py-3 text-sm font-medium text-paa-navy">{row.Period}</td>
                           <td className="px-4 py-3 text-sm text-paa-gray-text"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${row.Channel === 'Web' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{row.Channel}</span></td>
                           <td className="px-4 py-3 text-sm font-semibold text-paa-navy">{row.Author}</td>
                           <td className="px-4 py-3 text-sm text-paa-navy">{row.BookTitle}</td>
                           <td className="px-4 py-3 text-sm font-bold text-paa-navy text-right">{row.QuantitySold}</td>
                           <td className="px-4 py-3 text-sm font-bold text-green-700 text-right">Ã¢â€šÂ¹{row.Revenue}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
             </div>
          </div>
       </div>
    </div>
  );
  };

  const WebOrdersTab = ({ refreshTrigger }: { refreshTrigger?: number }) => {
    const successfulOrders = orders.filter((o: any) => o.status === 'Completed').length;
    const toApproveOrders = orders.filter((o: any) => o.status === 'Pending Verification' || o.status === 'Processing').length;
    const underDeliveryOrders = orders.filter((o: any) => o.status === 'Dispatched').length;

    // Additional Insights
    const authorSalesMap: Record<string, number> = {};
    const bookSalesMap: Record<string, number> = {};
    
    orders.forEach((o: any) => {
      if (o.status === 'Completed' || o.status === 'Dispatched') {
        o.items?.forEach((it: any) => {
          const aName = it.authorName || 'Unknown Author';
          const bTitle = it.title || 'Unknown Book';
          authorSalesMap[aName] = (authorSalesMap[aName] || 0) + (it.qty || 1);
          bookSalesMap[bTitle] = (bookSalesMap[bTitle] || 0) + (it.qty || 1);
        });
      }
    });

    const topAuthorsData = Object.entries(authorSalesMap)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 3);

    const topBooksData = Object.entries(bookSalesMap)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 3);

    return (
      <div className="space-y-6">
        {/* ── Order Tracking KPIs ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="dash-kpi-card green" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
              <Check size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-paa-gray-text mb-1">Successful Orders</p>
              <h3 className="text-2xl font-bold text-paa-navy">{successfulOrders}</h3>
            </div>
          </div>
          <div className="dash-kpi-card amber" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-paa-gray-text mb-1">To Be Verified</p>
              <h3 className="text-2xl font-bold text-paa-navy">{toApproveOrders}</h3>
            </div>
          </div>
          <div className="dash-kpi-card blue" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Package size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-paa-gray-text mb-1">Under Delivery</p>
              <h3 className="text-2xl font-bold text-paa-navy">{underDeliveryOrders}</h3>
            </div>
          </div>
        </div>

        {/* ── Order Insights Row ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
           <div className="bg-white p-5 rounded-2xl border border-paa-navy/5 shadow-sm">
             <h3 className="text-sm font-serif font-semibold text-paa-navy mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" /> Top Selling Authors
             </h3>
             <div className="space-y-3">
                {topAuthorsData.length > 0 ? topAuthorsData.map((a, idx) => (
                   <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">#{idx + 1}</div>
                         <p className="text-sm font-bold text-paa-navy line-clamp-1">{a.name}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                         <span className="text-sm font-black text-indigo-600">{a.sales}</span>
                         <span className="text-[10px] text-gray-500 ml-1">Sold</span>
                      </div>
                   </div>
                )) : <p className="text-xs text-gray-400">No completed sales yet.</p>}
             </div>
           </div>

           <div className="bg-white p-5 rounded-2xl border border-paa-navy/5 shadow-sm">
             <h3 className="text-sm font-serif font-semibold text-paa-navy mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500" /> Highest Selling Books
             </h3>
             <div className="space-y-3">
                {topBooksData.length > 0 ? topBooksData.map((b, idx) => (
                   <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-3 min-w-0 pr-4">
                         <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">#{idx + 1}</div>
                         <p className="text-sm font-bold text-paa-navy line-clamp-1">{b.name}</p>
                      </div>
                      <div className="text-right shrink-0">
                         <span className="text-sm font-black text-emerald-600">{b.sales}</span>
                         <span className="text-[10px] text-gray-500 ml-1">Sold</span>
                      </div>
                   </div>
                )) : <p className="text-xs text-gray-400">No completed sales yet.</p>}
             </div>
           </div>
        </div>


        <div className="bg-white border border-paa-navy/5 shadow-premium hover:shadow-premium-hover transition-all duration-500 ease-out flex flex-col">
          <div className="p-4 border-b border-paa-navy/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f0f4f8]">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-serif font-semibold text-paa-navy tracking-tight">Web Orders</h3>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-paa-gray-text" />
                <input type="text" placeholder="SEARCH ORDERS..." className="pl-9 pr-4 py-2 bg-white border border-paa-navy/20 text-xs font-bold tracking-widest uppercase outline-none focus:border-paa-navy transition-colors w-full sm:w-64" />
              </div>
              <button onClick={handleExportCSV} className="flex items-center justify-center gap-2 px-4 py-2 bg-[#5cb85c] text-white text-xs font-bold tracking-widest uppercase hover:bg-green-600 transition-colors shadow-premium rounded-full">
                <ClipboardList className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>
          
          <div className="hidden md:block overflow-x-auto">
            <table className="dash-table w-full">
              <thead>
                <tr>
                  <th>Order ID & Date</th>
                  <th>Customer</th>
                  <th>Items / Books</th>
                  <th style={{textAlign: 'center'}}>Amount</th>
                  <th style={{textAlign: 'center'}}>Status</th>
                  <th style={{textAlign: 'center'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord: any) => (
                  <tr key={ord.dbId}>
                    <td>
                      <p className="font-bold text-paa-navy mb-1">{ord.id}</p>
                      <p className="text-xs text-paa-gray-text flex items-center gap-1 font-medium"><CalendarIcon className="w-3 h-3"/> {ord.date}</p>
                    </td>
                    <td className="font-bold text-paa-navy">{ord.customer}</td>
                    <td>
                      <ul className="text-xs text-paa-gray-text font-medium space-y-1">
                        {ord.items.map((it: any, idx: number) => (
                          <li key={idx} className="flex gap-2"><span className="text-paa-navy font-bold">{it.qty}x</span> <span>{it.title} <span className="text-gray-400 italic">by {it.authorName}</span></span></li>
                        ))}
                      </ul>
                    </td>
                    <td style={{textAlign: 'center'}} className="font-bold text-paa-navy">₹{ord.total}</td>
                    <td style={{textAlign: 'center'}}>
                      <span className={`dash-badge ${ord.status === 'Completed' ? 'active' : ord.status === 'Payment Not Received' ? 'rejected' : 'pending'}`}>
                        {ord.status === 'Completed' ? 'Payment Verified' : ord.status === 'Payment Not Received' ? 'Payment Failed' : 'Pending Verification'}
                      </span>
                    </td>
                    <td style={{textAlign: 'center'}}>
                      <button onClick={() => setSelectedOrder(ord)} className="dash-btn dash-btn-ghost">Details</button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan={6} className="text-center py-8">No orders yet.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col gap-4 p-4 bg-gray-50">
            {orders.map((ord: any) => (
              <div key={ord.dbId} className="bg-white p-4 rounded-xl shadow-sm border border-paa-navy/10 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-paa-navy text-sm">{ord.id}</p>
                    <p className="text-[10px] text-paa-gray-text flex items-center gap-1 font-medium"><CalendarIcon className="w-3 h-3"/> {ord.date}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest ${ord.status === 'Completed' ? 'bg-green-100 text-green-700' : ord.status === 'Payment Not Received' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {ord.status === 'Completed' ? 'Verified' : ord.status === 'Payment Not Received' ? 'Failed' : 'Pending'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-paa-gray-text font-bold uppercase tracking-widest mb-1">Customer</p>
                  <p className="text-sm font-semibold text-paa-navy">{ord.customer}</p>
                </div>
                <div>
                  <p className="text-xs text-paa-gray-text font-bold uppercase tracking-widest mb-1">Items</p>
                  <ul className="text-xs text-paa-gray-text font-medium space-y-1">
                    {ord.items.map((it: any, idx: number) => (
                      <li key={idx} className="flex gap-2"><span className="text-paa-navy font-bold">{it.qty}x</span> <span>{it.title}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-1">
                  <div className="text-sm font-bold text-paa-navy">₹{ord.total}</div>
                  <button onClick={() => setSelectedOrder(ord)} className="text-xs font-bold text-paa-gold hover:text-paa-navy uppercase tracking-widest">Details</button>
                </div>
              </div>
            ))}
            {orders.length === 0 && <div className="text-center py-8 text-sm text-gray-500">No orders yet.</div>}
          </div>
        </div>
      </div>
    );
  };

  const renderAuthorsTab = ({ refreshTrigger }: any) => {
    if (selectedAuthor) {
      return <AuthorFullProfileView author={selectedAuthor} onBack={() => setSelectedAuthor(null)} />;
    }

    return (
    <div className="bg-white border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out flex flex-col">
       <div className="p-4 border-b border-paa-navy/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f0f4f8]">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-serif font-semibold text-paa-navy tracking-tight">Authors Directory</h3>
            <span className="bg-white text-paa-navy border border-paa-navy/20 py-0.5 px-2 text-xs font-bold shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out">{authors.length} Total</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 rounded-3xl-2xl p-1">
                  {['All', 'Pending', 'Active', 'Rejected'].map(status => (
                    <button 
                      key={status}
                      onClick={() => setAuthorStatusFilter(status)}
                      className={`px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-colors rounded-3xl-2xl ${authorStatusFilter === status ? 'bg-white text-paa-navy shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out' : 'text-gray-500 hover:text-paa-navy'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-paa-gray-text" />
                  <input 
                    type="text" 
                    placeholder="SEARCH AUTHORS..." 
                    className="pl-9 pr-4 py-2 bg-white border border-paa-navy/20 text-xs font-bold tracking-widest uppercase outline-none focus:border-paa-navy transition-colors w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
             </div>
          </div>
       </div>
       
       <div className="overflow-x-auto">
         <table className="dash-table">
           <thead>
              <tr>
                <th>Author Details</th>
                <th>Contact</th>
                <th>Payment Info</th>
                <th style={{textAlign: 'center'}}>Status</th>
                <th style={{textAlign: 'center'}}>Books</th>
                <th style={{textAlign: 'center'}}>Events</th>
                <th style={{textAlign: 'center'}}>Actions</th>
              </tr>
           </thead>
           <tbody>
              {authors.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) && (authorStatusFilter === 'All' || a.status === authorStatusFilter)).sort((a, b) => {
                if (a.status === 'Pending' && b.status !== 'Pending') return -1;
                if (a.status !== 'Pending' && b.status === 'Pending') return 1;
                return 0;
              }).map((author) => (
                <tr key={author.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#f0f4f8] border border-paa-navy/5 text-paa-navy flex items-center justify-center font-bold font-serif text-lg">
                        {author.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-paa-navy">{author.name}</p>
                        <p className="text-xs text-paa-gray-text flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3"/> Joined {author.joined}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="text-paa-navy font-medium">{author.email}</p>
                    <p className="text-paa-gray-text text-xs mt-0.5 font-medium">{author.phone}</p>
                  </td>
                  <td>
                    {author.transactionId ? (
                      <div>
                        <p className="text-[10px] font-bold text-paa-navy uppercase bg-gray-100 inline-block px-1 mb-1">TXN: {author.transactionId}</p>
                        <br />
                        {author.paymentScreenshot ? (
                           <a href={import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + author.paymentScreenshot : "http://localhost:3001" + author.paymentScreenshot} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline font-medium mt-1 inline-block hover:text-blue-800">View Receipt</a>
                        ) : (
                           <span className="text-[10px] text-red-500 font-bold uppercase block mt-1">No Receipt</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-bold uppercase">No Payment Info</span>
                    )}
                  </td>
                  <td style={{textAlign: 'center'}}>
                    <span className={`dash-badge ${author.status === 'Active' ? 'active' : author.status === 'Rejected' ? 'rejected' : 'pending'}`}>
                      {author.status}
                    </span>
                  </td>
                  <td style={{textAlign: 'center'}} className="font-bold text-paa-navy">
                    {author.totalBooks}
                  </td>
                  <td style={{textAlign: 'center'}} className="font-bold text-paa-navy">
                    {author.eventsPart}
                  </td>
                  <td style={{textAlign: 'center'}}>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                       {author.status === 'Pending' && (
                         <>
                           <button onClick={() => handleApproveAuthor(author.id)} className="dash-btn dash-btn-success" title="Approve">
                             {loadingAction === 'approveAuthor_' + author.id ? '...' : <Check className="w-4 h-4" />} Approve
                           </button>
                           <button onClick={() => openRejectAuthorModal(author)} className="dash-btn dash-btn-danger" title="Reject">
                             <X className="w-4 h-4" /> Reject
                           </button>
                         </>
                       )}
                       <button onClick={() => handleEditAuthorClick(author)} className="dash-btn dash-btn-ghost dash-btn-icon" title="Edit Profile">
                         <Edit className="w-4 h-4" />
                       </button>
                       <button onClick={() => setSelectedAuthor(author)} className="dash-btn dash-btn-ghost dash-btn-icon" title="Details">
                         <Eye className="w-4 h-4" />
                       </button>
                       <button onClick={() => handleDeleteAuthor(author.id)} className="dash-btn dash-btn-danger dash-btn-icon" title="Delete">
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                    {author.status === 'Rejected' && author.rejectionReason && (
                      <div className="mt-2 text-[10px] text-red-600 font-medium max-w-[200px] mx-auto text-left leading-tight bg-red-50 p-2 rounded-lg">
                        Reason: {author.rejectionReason}
                      </div>
                    )}
                  </td>
                </tr>
             ))}
             {authors.length === 0 && (
               <tr>
                 <td colSpan={7} className="text-center py-8 text-paa-gray-text bg-white">No authors found.</td>
               </tr>
             )}
           </tbody>
         </table>
       </div>
    </div>
    );
  };

  const BooksTab = () => {
    if (selectedBookDetails) {
      return (
        <div className="bg-white border border-paa-navy/5 p-8 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out">
          <button onClick={() => setSelectedBookDetails(null)} className="mb-6 p-2 bg-white border border-paa-navy/20 hover:bg-gray-50 rounded-full active:scale-95 transition-all duration-300 shadow-sm">
             <ArrowLeft className="w-5 h-5 text-paa-navy" />
          </button>
          
          <div className="space-y-6">
             <div className="flex gap-6">
               {selectedBookDetails.coverUrl && (
                 <img src={selectedBookDetails.coverUrl.startsWith('http') ? selectedBookDetails.coverUrl : `${API}${selectedBookDetails.coverUrl}`} alt="Cover" className="w-40 h-56 object-cover border border-paa-navy/20 shadow-md" />
               )}
               <div className="flex-1">
                  <h3 className="text-3xl font-serif font-bold text-paa-navy mb-1">{selectedBookDetails.title}</h3>
                  {selectedBookDetails.subtitle && <p className="text-lg font-medium text-paa-gray-text mb-2">{selectedBookDetails.subtitle}</p>}
                  <p className="text-base font-medium mb-2">Author: <span className="font-bold text-paa-navy">{selectedBookDetails.authorName}</span></p>
                  <p className="text-xs font-bold uppercase tracking-widest text-paa-navy mt-2 bg-[#eef2f6] inline-block px-3 py-1">{selectedBookDetails.genre} {selectedBookDetails.subGenre && `> ${selectedBookDetails.subGenre}`}</p>
               </div>
             </div>
             
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 border-t border-paa-navy/5 pt-6 mt-6">
               <div><span className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text block mb-1">MRP</span><span className="text-lg font-black text-green-700">Γé╣{selectedBookDetails.mrp}</span></div>
               <div><span className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text block mb-1">Language</span><span className="text-base font-bold text-paa-navy">{selectedBookDetails.language || '-'}</span></div>
               <div><span className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text block mb-1">Format</span><span className="text-base font-bold text-paa-navy">{selectedBookDetails.format || '-'}</span></div>
               <div><span className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text block mb-1">Pages</span><span className="text-base font-bold text-paa-navy">{selectedBookDetails.pages || '-'}</span></div>
               <div><span className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text block mb-1">Publisher</span><span className="text-base font-bold text-paa-navy">{selectedBookDetails.publisher || '-'}</span></div>
               <div><span className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text block mb-1">Pub Date</span><span className="text-base font-bold text-paa-navy">{selectedBookDetails.publicationDate || '-'}</span></div>
               <div><span className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text block mb-1">ISBN</span><span className="text-base font-bold text-paa-navy">{selectedBookDetails.isbn || '-'}</span></div>
               <div><span className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text block mb-1">Current Stock</span><span className="text-lg font-black text-paa-navy">{selectedBookDetails.stock}</span></div>
               <div><span className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text block mb-1">Total Sales</span><span className="text-lg font-black text-paa-navy">{selectedBookDetails.sales}</span></div>
             </div>
             
             <div className="border-t border-paa-navy/5 pt-6 mt-6">
               <span className="text-sm font-bold uppercase tracking-widest text-paa-navy block mb-3">Synopsis</span>
               <p className="text-sm text-paa-gray-text leading-relaxed whitespace-pre-wrap">{selectedBookDetails.synopsis || 'No synopsis provided.'}</p>
             </div>
          </div>
        </div>
      );
    }

    return (
    <div className="bg-white border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out flex flex-col">
       <div className="p-4 border-b border-paa-navy/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#e6f2eb]">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-serif font-semibold text-paa-navy tracking-tight">Inventory Management</h3>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 rounded-3xl-2xl p-1">
                  {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                    <button 
                      key={status}
                      onClick={() => setBookStatusFilter(status)}
                      className={`px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-colors rounded-3xl-2xl ${bookStatusFilter === status ? 'bg-white text-paa-navy shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out' : 'text-gray-500 hover:text-paa-navy'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-paa-gray-text" />
                  <input type="text" placeholder="SEARCH BOOKS..." className="pl-9 pr-4 py-2 bg-white border border-paa-navy/20 text-xs font-bold tracking-widest uppercase outline-none focus:border-paa-navy transition-colors w-64" />
                </div>
             </div>
             {/* <button onClick={() => setIsBookModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-paa-navy text-paa-cream text-xs font-bold tracking-widest uppercase hover:bg-paa-gold hover:text-paa-navy border border-paa-navy hover:border-paa-gold transition-colors">
               <Plus className="w-4 h-4" /> Add Book
             </button> */}
          </div>
       </div>
       
       <div className="overflow-x-auto">
         <table className="dash-table">
            <thead>
              <tr>
                <th>Book Info</th>
                <th>Author</th>
                <th style={{textAlign: 'center'}}>Status</th>
                <th style={{textAlign: 'center'}}>Price</th>
                <th style={{textAlign: 'center'}}>Stock</th>
                <th style={{textAlign: 'center'}}>Sales</th>
                <th style={{textAlign: 'center'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
             {books.filter(b => (bookStatusFilter === 'All' || b.status === bookStatusFilter)).map((book) => (
               <tr key={book.id}>
                 <td>
                   <p className="font-bold text-paa-navy mb-1">{book.title}</p>
                   <div className="flex items-center gap-2 text-xs font-medium">
                     <span className="text-[#5bc0de] font-bold uppercase">{book.genre}</span>
                   </div>
                 </td>
                 <td>
                    <p className="text-paa-navy font-bold">{book.authorName}</p>
                 </td>
                 <td style={{textAlign: 'center'}}>
                    <span className={`dash-badge ${book.status === 'Approved' ? 'approved' : book.status === 'Rejected' ? 'rejected' : 'pending'}`}>
                      {book.status}
                    </span>
                 </td>
                 <td style={{textAlign: 'center'}} className="font-bold text-paa-navy">
                    Γé╣{book.mrp}
                 </td>
                 <td style={{textAlign: 'center'}}>
                    {book.stock >= 10 ? (
                      <span className="dash-badge active">OK: {book.stock}</span>
                    ) : book.stock > 0 ? (
                      <span className="dash-badge pending"><AlertCircle className="w-3 h-3"/> {book.stock} LEFT</span>
                    ) : (
                      <span className="dash-badge rejected"><AlertCircle className="w-3 h-3"/> OUT OF STOCK</span>
                    )}
                 </td>
                 <td style={{textAlign: 'center'}} className="font-bold text-paa-navy">
                    {book.sales}
                 </td>
                 <td style={{textAlign: 'center'}}>
                    <div className="flex items-center justify-center gap-2">
                       {book.status === 'Pending' && (
                         <button onClick={() => handleApproveBook(book.id)} className="dash-btn dash-btn-success dash-btn-icon" title="Approve">
                           <Check className="w-4 h-4" />
                         </button>
                       )}
                       {book.status !== 'Rejected' && (
                         <button onClick={() => handleRejectBook(book.id)} className="dash-btn dash-btn-danger dash-btn-icon" title="Reject">
                           <X className="w-4 h-4" />
                         </button>
                       )}
                       <button onClick={() => setSelectedBookDetails(book)} className="dash-btn dash-btn-ghost dash-btn-icon" title="View Details">
                         <Eye className="w-4 h-4" />
                       </button>
                       <button onClick={() => handleEditBookClick(book)} className="dash-btn dash-btn-ghost dash-btn-icon" title="Edit Details">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteBook(book.id)} className="dash-btn dash-btn-danger dash-btn-icon" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                 </td>
               </tr>
             ))}
             {books.length === 0 && (
               <tr>
                 <td colSpan={7} className="text-center py-8 text-paa-gray-text bg-white">No books found.</td>
               </tr>
             )}
           </tbody>
         </table>
       </div>
    </div>
    );
  };

  const EventsTab = () => (
    <div className="space-y-6">
       <div className="flex items-center justify-between border-b border-paa-navy/5 pb-4">
          <h3 className="text-lg font-serif font-medium text-paa-navy">Events & Fairs Ecosystem</h3>
          <button onClick={() => setIsEventModalOpen(true)} className="dash-btn dash-btn-primary">
            <Plus className="w-4 h-4" /> Create Event
          </button>
       </div>

       <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 border-b pb-2">Active / Upcoming Events</h4>
       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {events.filter(e => e.status === 'Upcoming').map((evt) => (
             <div key={evt.id} className="bg-white border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out hover:shadow-md flex flex-col relative overflow-hidden h-full">
                <div className={`${evt.status === 'Upcoming' ? 'bg-blue-600' : 'bg-gray-500'} px-4 py-2 text-white font-bold text-xs uppercase tracking-widest flex justify-between items-center z-10 relative`}>
                   <span>{evt.status}</span>
                   <div className="flex gap-2 items-center">
                     {evt.broadcastStatus === 'AuthorsOnly' && <span className="bg-white/20 px-2 py-0.5 rounded-3xl-2xl text-[10px]">Authors Notified</span>}
                     {evt.broadcastStatus === 'CustomersAlso' && <span className="bg-white/20 px-2 py-0.5 rounded-3xl-2xl text-[10px]">Public</span>}
                     <button onClick={() => handleEditEventClick(evt)} className="p-1 hover:bg-white/20 rounded-3xl-2xl transition-colors" title="Edit Event"><Edit className="w-3 h-3" /></button>
                     <button onClick={() => handleDeleteEvent(evt.id)} className="p-1 hover:bg-white/20 text-red-200 hover:text-red-100 rounded-3xl-2xl transition-colors" title="Delete Event"><Trash2 className="w-3 h-3" /></button>
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
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                     <div className="bg-gray-50 p-2 text-center rounded-3xl-2xl border border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Authors</p>
                        <p className="text-lg font-black text-paa-navy">{evt._count?.eventAuthors || 0}</p>
                     </div>
                     <div className="bg-gray-50 p-2 text-center rounded-3xl-2xl border border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Books Linked</p>
                        <p className="text-lg font-black text-paa-navy">{evt._count?.eventBooks || 0}</p>
                     </div>
                  </div>

                  <div className="pt-4 border-t border-paa-navy/5 flex flex-col gap-2 mt-auto">
                     <button onClick={() => fetchEventRegistrations(evt.id)} className="dash-btn dash-btn-ghost w-full justify-center border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800">
                        View Author Registrations
                     </button>
                     <button onClick={() => fetchEventReport(evt.id)} className="dash-btn dash-btn-ghost w-full justify-center border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800">
                        View Live Event Report
                     </button>
                  </div>
                </div>
             </div>
          ))}
          {events.filter(e => e.status === 'Upcoming').length === 0 && (
             <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-3xl-2xl border border-dashed border-gray-200">
                No upcoming events.
             </div>
          )}
       </div>

       <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 border-b pb-2 mt-12">Past Events Archive</h4>
       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastEventsData.map((evt: any) => (
             <div key={'legacy_'+evt.id} className="bg-gray-50 border border-gray-200 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out flex flex-col relative overflow-hidden opacity-90">
                <div className="bg-gray-800 px-4 py-2 text-white font-bold text-xs uppercase tracking-widest flex justify-between items-center">
                   <span>Legacy Archive</span>
                </div>
                <div className="p-6 flex-1">
                  <h4 className="text-xl font-serif font-medium text-paa-navy mb-4">{evt.name}</h4>
                  <div className="space-y-3 mb-6 flex-1 text-sm font-medium text-gray-500">
                     <p className="flex items-center gap-3"><CalendarIcon className="w-4 h-4 text-gray-400"/> {evt.date} &bull; {evt.duration}</p>
                     <p className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-400"/> {evt.address || evt.location}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                     <div className="bg-white p-2 text-center rounded-3xl-2xl border border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Authors</p>
                        <p className="text-lg font-black text-gray-700">{evt.authorsParticipated || 0}</p>
                     </div>
                     <div className="bg-white p-2 text-center rounded-3xl-2xl border border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Books Sold</p>
                        <p className="text-lg font-black text-gray-700">{evt.booksSold || 0}</p>
                     </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200 flex flex-col gap-2 mt-auto">
                     <button onClick={() => fetchEventReport('legacy_' + evt.id)} className="dash-btn dash-btn-ghost w-full justify-center border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800">
                        View Legacy Settlement Report
                     </button>
                  </div>
                </div>
             </div>
          ))}
          {events.filter(e => e.status === 'Past').map((evt) => (
             <div key={evt.id} className="bg-gray-50 border border-gray-200 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out flex flex-col relative overflow-hidden opacity-90 h-full">
                <div className="bg-gray-500 px-4 py-2 text-white font-bold text-xs uppercase tracking-widest flex justify-between items-center z-10 relative">
                   <span>{evt.status}</span>
                   <div className="flex gap-2 items-center">
                     <button onClick={() => handleEditEventClick(evt)} className="p-1 hover:bg-white/20 rounded-3xl-2xl transition-colors" title="Edit Event"><Edit className="w-3 h-3" /></button>
                     <button onClick={() => handleDeleteEvent(evt.id)} className="p-1 hover:bg-white/20 text-red-200 hover:text-red-100 rounded-3xl-2xl transition-colors" title="Delete Event"><Trash2 className="w-3 h-3" /></button>
                   </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  {evt.bannerUrl ? (
                    <div className="w-full h-32 mb-4 rounded-xl overflow-hidden shrink-0 border border-gray-200 bg-gray-100">
                      <img src={`${import.meta.env.VITE_API_URL || "http://localhost:3001"}${evt.bannerUrl}`} alt="Event Poster" className="w-full h-full object-cover opacity-85" />
                    </div>
                  ) : (
                    <div className="w-full h-32 mb-4 rounded-xl overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-50">
                       <CalendarIcon className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  <h4 className="text-xl font-serif font-medium text-paa-navy mb-4">{evt.name}</h4>
                  <div className="space-y-3 mb-6 flex-1 text-sm font-medium text-gray-500">
                     <p className="flex items-center gap-3"><CalendarIcon className="w-4 h-4 text-gray-400"/> {evt.date} &bull; {evt.duration}</p>
                     <p className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-400"/> {evt.location}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                     <div className="bg-white p-2 text-center rounded-3xl-2xl border border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Authors</p>
                        <p className="text-lg font-black text-gray-700">{evt._count?.eventAuthors || 0}</p>
                     </div>
                     <div className="bg-white p-2 text-center rounded-3xl-2xl border border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Books Linked</p>
                        <p className="text-lg font-black text-gray-700">{evt._count?.eventBooks || 0}</p>
                     </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 flex flex-col gap-2 mt-auto">
                     <button onClick={() => fetchEventReport(evt.id)} className="dash-btn dash-btn-ghost w-full justify-center border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800">
                        View Sales & Settlement Report
                     </button>
                  </div>
                </div>
             </div>
          ))}
          {events.filter(e => e.status === 'Past').length === 0 && (
             <div className="col-span-full py-8 text-center text-gray-400 bg-gray-50 rounded-3xl-2xl border border-dashed border-gray-200">
                No past events archived yet.
             </div>
          )}
       </div>
       </div>
    </div>
  );

  const SettingsTab = () => {


    return (
    <div className="space-y-8 max-w-2xl">
      <div className="bg-white p-8 border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out">
         <div className="border-b border-paa-navy/5 pb-4 mb-8">
            <h2 className="text-xl font-serif font-medium text-paa-navy mb-1">System Settings</h2>
            <p className="text-paa-gray-text text-sm">Configure global application parameters, notification rules, and access control here.</p>
         </div>
         
         <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-paa-navy mb-2">Platform Name</label>
              <input type="text" defaultValue="Pune Authors' Association" className="w-full border border-paa-navy/20 bg-gray-50 rounded-3xl-2xl-none p-3 text-sm outline-none focus:border-paa-navy focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-paa-navy mb-2">Support Email</label>
              <input type="email" defaultValue="support@puneauthors.com" className="w-full border border-paa-navy/20 bg-gray-50 rounded-3xl-2xl-none p-3 text-sm outline-none focus:border-paa-navy focus:bg-white transition-colors" />
            </div>
            
            <div className="pt-6 border-t border-paa-navy/5">
              <h3 className="text-xs font-bold tracking-widest uppercase text-paa-navy mb-4">Default Email Notifications</h3>
              <div className="space-y-4 bg-gray-50 p-4 border border-paa-navy/5">
                 <label className="flex items-center gap-3 text-sm font-medium text-paa-navy cursor-pointer">
                   <input type="checkbox" defaultChecked className="w-4 h-4 accent-paa-navy" /> New Author Registered Alert
                 </label>
                 <label className="flex items-center gap-3 text-sm font-medium text-paa-navy cursor-pointer">
                   <input type="checkbox" defaultChecked className="w-4 h-4 accent-paa-navy" /> Book Out of Stock Alert
                 </label>
                 <label className="flex items-center gap-3 text-sm font-medium text-paa-navy cursor-pointer">
                   <input type="checkbox" defaultChecked className="w-4 h-4 accent-paa-navy" /> Event Registration Alert
                 </label>
              </div>
            </div>
         </div>
      </div>


    </div>
    );
  };

  const Modal = ({ isOpen, onClose, title, children }: any) => {
    if (!isOpen) return null;
    return (
      <div className="dash-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="dash-modal">
          <div className="dash-modal-header">
            <h3 className="text-sm font-bold uppercase tracking-widest text-paa-navy">{title}</h3>
            <button type="button" onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/6 text-paa-gray-text hover:text-paa-navy transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="dash-modal-body space-y-4">
            {children}
          </div>
        </div>
      </div>
    );
  };

  const AuthorDataTab = ({ refreshTrigger }: any) => {
    const [fields, setFields] = useState<any[]>([]);
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [showColumnsMenu, setShowColumnsMenu] = useState(false);
    
    // Get all unique extraData keys from all authors to form table columns
    const dynamicKeys = Array.from(new Set<string>(
      authors.reduce((acc: string[], author: any) => {
        if (author.extraData) {
          acc = acc.concat(Object.keys(author.extraData));
        }
        return acc;
      }, [])
    ));

    useEffect(() => {
      axios.get(`${API}/api/admin/author-fields`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        .then(res => setFields(res.data));
    }, []);

    // Initialize all columns as selected
    useEffect(() => {
      if (selectedColumns.length === 0 && dynamicKeys.length > 0) {
        setSelectedColumns(dynamicKeys);
      }
    }, [dynamicKeys.length]);

    const [newField, setNewField] = useState({ name: '', type: 'text', requiredForRegistration: false });

    
    const saveFields = () => {
      axios.post(`${API}/api/admin/author-fields`, { fields }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        .then(() => toast.success('Fields saved successfully!'))
        .catch(() => toast.error('Failed to save fields'));
    };

    const handleColumnToggle = (col: string) => {
      if (selectedColumns.includes(col)) {
        setSelectedColumns(selectedColumns.filter(c => c !== col));
      } else {
        setSelectedColumns([...selectedColumns, col]);
      }
    };

    const handleExportCSV = () => {
      let csv = 'Author Name,Email';
      selectedColumns.forEach(col => csv += `,${col}`);
      csv += '\n';

      authors.forEach(author => {
        csv += `"${author.name}","${author.email}"`;
        selectedColumns.forEach(col => {
          const val = author.extraData && author.extraData[col] ? String(author.extraData[col]).replace(/"/g, '""') : '';
          csv += `,"${val}"`;
        });
        csv += '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'author_extra_data_report.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div className="space-y-8 max-w-6xl">
        <div className="bg-white p-8 border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out rounded-3xl-2xl">
          <h3 className="text-xl font-serif font-medium text-paa-navy mb-1">Author Dynamic Fields Management</h3>
          <p className="text-paa-gray-text text-sm mb-6 border-b border-paa-navy/5 pb-4">Define extra information that all authors must provide. This will appear on their dashboard until filled.</p>
          
          <div className="flex flex-wrap gap-3 mb-6">
            {fields.map((f, i) => (
               <div key={i} className="flex items-center gap-2 bg-gray-50 border border-paa-navy/20 px-3 py-1.5 rounded-3xl-2xl shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out text-sm">
                  <span className="font-bold text-paa-navy">{f.name}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">({f.type})</span>
                  {f.requiredForRegistration && <span className="text-[9px] bg-paa-navy text-white px-1.5 py-0.5 rounded-3xl-2xl uppercase tracking-widest font-bold">Registration</span>}
                  <button onClick={() => setFields(fields.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 ml-2" title="Remove Field">
                     <X className="w-3.5 h-3.5" />
                  </button>
               </div>
            ))}
            {fields.length === 0 && <p className="text-sm text-gray-500 italic w-full">No dynamic fields created yet.</p>}
          </div>

          <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-4 rounded-3xl-2xl mb-6 flex flex-col md:flex-row gap-4 items-center">
            <input 
               type="text" 
               placeholder="New Field Name (e.g. Aadhar Number)" 
               className="border border-paa-navy/20 p-2 text-sm flex-1 outline-none focus:border-paa-navy bg-white rounded-3xl-2xl w-full md:w-auto"
               value={newField.name}
               onChange={e => setNewField({...newField, name: e.target.value})}
            />
            <select 
               className="border border-paa-navy/20 p-2 text-sm outline-none focus:border-paa-navy bg-white rounded-3xl-2xl"
               value={newField.type}
               onChange={e => setNewField({...newField, type: e.target.value})}
            >
               <option value="text">Text</option>
               <option value="number">Number</option>
               <option value="date">Date</option>
            </select>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-paa-navy cursor-pointer">
               <input 
                 type="checkbox" 
                 className="accent-paa-navy w-4 h-4"
                 checked={newField.requiredForRegistration}
                 onChange={e => setNewField({...newField, requiredForRegistration: e.target.checked})}
               />
               Require on Reg.
            </label>
            <button 
               onClick={() => {
                 if (!newField.name) return;
                 setFields([...fields, { ...newField, required: true }]);
                 setNewField({ name: '', type: 'text', requiredForRegistration: false });
               }} 
               className="px-4 py-2 border border-paa-navy text-paa-navy bg-white text-xs font-bold uppercase tracking-widest hover:bg-paa-navy hover:text-white transition-colors rounded-3xl-2xl shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out whitespace-nowrap"
            >
               Add Field
            </button>
          </div>
          
          <div className="flex">
            <button onClick={saveFields} className="px-6 py-2 bg-paa-navy text-white text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors rounded-3xl-2xl shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out rounded-full active:scale-95 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out">Save Fields Settings</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl-2xl border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-paa-navy uppercase tracking-widest flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-paa-gold" />
                Author Data Report
              </h2>
              <p className="text-sm text-paa-gray-text mt-1">View and export the custom fields data filled out by authors.</p>
            </div>
            <div className="flex gap-3 items-center">
               {dynamicKeys.length > 0 && (
                 <div className="relative">
                   <button 
                     onClick={() => setShowColumnsMenu(!showColumnsMenu)}
                     className="px-3 py-2 border border-paa-navy/20 bg-gray-50 hover:bg-gray-100 rounded-3xl-2xl text-paa-navy transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-1"
                   >
                     Columns <ChevronDown className="w-4 h-4" />
                   </button>
                   {showColumnsMenu && (
                     <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-3xl-2xl z-20 py-2">
                        {dynamicKeys.map(key => (
                          <label key={key} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-xs font-bold uppercase tracking-widest text-paa-navy cursor-pointer whitespace-nowrap">
                            <input 
                              type="checkbox" 
                              className="accent-paa-navy"
                              checked={selectedColumns.includes(key)} 
                              onChange={() => handleColumnToggle(key)} 
                            />
                            {key}
                          </label>
                        ))}
                     </div>
                   )}
                 </div>
               )}
               <button onClick={handleExportCSV} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-widest rounded-3xl-2xl transition-colors shadow rounded-full active:scale-95 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out">
                  Export CSV
               </button>
               <button onClick={fetchAuthors} className="p-2 border border-paa-navy/20 bg-gray-50 hover:bg-gray-100 rounded-3xl-2xl text-paa-navy transition-colors shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out rounded-full active:scale-95 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out">
                  <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
               </button>
            </div>
          </div>

          <div className="border border-paa-navy/5 rounded-3xl-2xl shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out overflow-hidden">
            <div className="overflow-x-auto">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Author Name</th>
                    <th>Email</th>
                    {dynamicKeys.filter(k => selectedColumns.includes(k)).map(key => (
                      <th key={key} className="text-paa-gold">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {authors.length === 0 ? (
                    <tr><td colSpan={selectedColumns.length + 2} className="px-6 py-8 text-center text-gray-500 italic">No authors found.</td></tr>
                  ) : authors.map(author => (
                    <tr key={author.id}>
                      <td className="font-medium text-paa-navy">{author.name}</td>
                      <td className="text-gray-500">{author.email}</td>
                      {dynamicKeys.filter(k => selectedColumns.includes(k)).map(key => (
                        <td key={key} className="text-gray-700">
                          {author.extraData && author.extraData[key] ? String(author.extraData[key]) : <span className="text-gray-300 italic">-</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };


  const FormsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-serif font-semibold text-paa-navy tracking-tight border-l-4 border-paa-navy pl-2">Forms Management</h3>
        <button 
          onClick={() => setIsFormModalOpen(true)}
          className="px-4 py-2 bg-paa-navy text-paa-cream text-xs font-bold uppercase transition hover:bg-paa-gold"
        >
          Create Form
        </button>
      </div>

      {selectedFormResponses ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedFormResponses(null)}
              className="text-paa-navy hover:text-paa-gold"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h4 className="font-bold text-paa-navy">Responses for: {selectedFormResponses.formTitle}</h4>
          </div>
          <div className="overflow-x-auto bg-white border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Author</th>
                  <th>Date</th>
                  <th>Answers</th>
                </tr>
              </thead>
              <tbody>
                {selectedFormResponses.responses.map((r: any) => (
                  <tr key={r.id}>
                    <td><p className="font-bold text-paa-navy">{r.author?.name}</p></td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="max-w-sm truncate text-xs text-paa-gray-text font-medium">
                      {JSON.stringify(r.answers)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forms.map((f: any) => (
            <div key={f.id} className="p-4 bg-white border border-paa-navy/5 flex flex-col gap-2 hover:shadow-md transition">
              <div className="font-bold text-paa-navy text-lg">{f.title}</div>
              <div className="text-sm text-paa-gray-text">{f.description}</div>
              <div className="text-xs text-paa-gray-text">Fields: {f.fields.length}</div>
              <div className="flex gap-2 mt-4">
                <button 
                  className="px-3 py-1.5 bg-paa-navy/10 text-paa-navy text-xs font-bold uppercase hover:bg-paa-navy hover:text-white transition rounded-full active:scale-95 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out"
                  onClick={() => {
                    axios.get(`${API}/api/admin/forms/${f.id}/responses`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }})
                      .then(res => setSelectedFormResponses({ formTitle: f.title, responses: res.data }));
                  }}
                >
                  View Responses
                </button>
                <button 
                  className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold uppercase hover:bg-red-600 hover:text-white transition rounded-full active:scale-95 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out"
                  onClick={() => {
                    if (window.confirm("Delete this form and all its responses?")) {
                      axios.delete(`${API}/api/admin/forms/${f.id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }})
                        .then(() => fetchForms());
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const GalleryTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-serif font-semibold text-paa-navy tracking-tight border-l-4 border-paa-navy pl-2">Gallery Management</h3>
        <button 
          onClick={() => setIsGalleryModalOpen(true)}
          className="px-4 py-2 bg-paa-navy text-paa-cream text-xs font-bold uppercase transition hover:bg-paa-gold"
        >
          Add Gallery Event
        </button>
      </div>

      <div className="overflow-x-auto bg-white border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Location</th>
              <th>City</th>
              <th>Type</th>
              <th>Date</th>
              <th style={{textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {gallery.map((g: any) => (
              <tr key={g.id}>
                <td>
                  <img src={g.photoUrl ? (g.photoUrl.startsWith('http') ? g.photoUrl : `${API}${g.photoUrl}`) : ''} alt="img" className="w-10 h-10 object-cover rounded-3xl-2xl" />
                </td>
                <td className="font-bold text-paa-navy">{g.location}</td>
                <td>{g.city}</td>
                <td>{g.type}</td>
                <td>{new Date(g.date).toLocaleDateString()}</td>
                <td style={{textAlign: 'right'}}>
                  <button 
                    onClick={() => setSelectedGalleryEvent(g)}
                    className="dash-btn dash-btn-ghost mr-2"
                  >
                    Images ({g.images?.length || 0})
                  </button>
                  <button 
                    onClick={() => {
                      setEditingGalleryEvent(g);
                      setIsEditGalleryModalOpen(true);
                    }}
                    className="dash-btn dash-btn-ghost mr-2"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm("Delete this gallery event?")) {
                        axios.delete(`${API}/api/admin/gallery/${g.id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }})
                          .then(() => fetchGallery());
                      }
                    }}
                    className="dash-btn dash-btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex font-sans" style={{background:'#f8f8f6'}}>
        <div className="w-64 shrink-0 h-screen hidden md:flex flex-col p-5 gap-3 dash-sidebar">
          <div className="h-14 mb-4 dash-skeleton opacity-20 rounded-xl"></div>
          {[...Array(7)].map((_,i) => <div key={i} className="h-10 dash-skeleton opacity-10 rounded-xl"></div>)}
        </div>
        <div className="flex-1 p-8 space-y-6">
          <div className="h-16 dash-skeleton w-full rounded-2xl"></div>
          <div className="grid grid-cols-4 gap-5">
            {[...Array(4)].map((_,i) => <div key={i} className="h-28 dash-skeleton rounded-2xl"></div>)}
          </div>
          <div className="h-80 dash-skeleton rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paa-cream animate-fade-in-up flex flex-col md:flex-row font-sans text-paa-navy selection:bg-paa-gold selection:text-white">
      
      {/* SIDEBAR */}
      <aside className={`w-64 flex flex-col shrink-0 h-screen fixed md:sticky top-0 bg-paa-cream z-50 transform transition-transform duration-300 border-r border-paa-navy/5 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 md:p-6 h-20 flex items-center justify-between shrink-0 border-b border-paa-navy/5">
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="PAA Logo" 
              className="h-8 w-auto object-contain" 
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} 
            />
            <div className="hidden w-8 h-8 rounded-full bg-[#b44d28] flex items-center justify-center text-white text-sm font-bold">
              P
            </div>
            <span className="font-serif font-bold text-lg tracking-tight hidden md:block text-paa-navy ml-1">Admin Portal</span>
          </div>
          <span className="font-serif font-bold text-lg md:hidden text-paa-navy">Menu</span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 text-paa-navy"><X size={20} /></button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
           {[
             { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
             { id: 'web_orders', label: 'Web Orders', icon: ShoppingCart, hasAlert: pendingAlerts.orders },
             { id: 'authors', label: 'Authors Menu', icon: Users, hasAlert: pendingAlerts.authors },
             { id: 'books', label: 'Inventory / Books', icon: BookOpen, hasAlert: pendingAlerts.books },
             { id: 'events', label: 'Events & Fairs', icon: CalendarIcon },
             { id: 'gallery', label: 'Gallery Management', icon: ImageIcon },
             { id: 'author_data', label: 'Author Extra Data', icon: ClipboardList },
             { id: 'helpdesk', label: 'Helpdesk / Queries', icon: Users, hasAlert: pendingAlerts.queries },
             { id: 'settings', label: 'System Settings', icon: Settings },
           ].map((item) => (
              <button 
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  localStorage.setItem('adminActiveTab', item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-start text-left gap-3 px-4 py-3 text-xs font-bold tracking-widest uppercase transition-all duration-300 rounded-xl border ${
                  activeTab === item.id 
                  ? 'bg-paa-navy text-paa-cream border-paa-navy shadow-premium' 
                  : 'text-paa-navy border-[transparent] hover:bg-black/5 hover:border-black/5'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" /> 
                <span className="flex-1 truncate">{item.label}</span>
                {item.hasAlert && (
                   <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                )}
              </button>
           ))}
        </nav>

        <div className="p-4 shrink-0 flex gap-2">
           <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-paa-navy/5 bg-white text-xs font-bold uppercase hover:bg-red-50 text-red-600 transition-colors rounded-full active:scale-95 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out">
              <LogOut size={14} /> Logout
           </button>
        </div>
      </aside>



      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative" style={{background:'#f5f5f3'}}>
        
        {/* Top Header */}
        <header className="dash-header h-[68px] flex items-center justify-between px-6 md:px-8 shrink-0 relative z-50">
           <div className="flex items-center gap-2">
             <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-paa-navy rounded-lg hover:bg-black/5 transition-colors mr-1">
               <Menu className="w-5 h-5" />
             </button>
             <div className="flex items-center gap-2 text-xs font-medium">
               <span className="text-paa-gray-text">Admin Portal</span>
               <span className="text-paa-navy/20">/</span>
               <span className="font-semibold text-paa-navy capitalize">{activeTab.replace(/_/g,' ')}</span>
             </div>
           </div>
           
           <div className="flex items-center gap-3 relative">
              {/* Refresh spinner */}
              {isRefreshing && <RefreshCw className="w-3.5 h-3.5 text-paa-gray-text animate-spin" />}

              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-black/8 text-paa-navy hover:bg-black/4 transition-colors"
              >
                 <Bell className="w-4 h-4" />
                 {(pendingAlerts.orders || pendingAlerts.queries || pendingAlerts.authors || pendingAlerts.books) && (
                   <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                 )}
              </button>
              
              {showNotifications && (
                 <div className="dash-notification-panel">
                    <div className="px-4 py-3 border-b border-black/6 bg-gray-50">
                      <p className="text-xs font-bold uppercase tracking-widest text-paa-navy">Notifications</p>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-black/5">
                       {pendingAlerts.authors && (
                          <button onClick={() => { setActiveTab('authors'); localStorage.setItem('adminActiveTab', 'authors'); setShowNotifications(false); }} className="w-full text-left px-4 py-3 hover:bg-black/3 flex items-start gap-3 transition-colors">
                             <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                             <div><p className="text-sm font-semibold text-paa-navy">Authors Pending</p><p className="text-xs text-paa-gray-text mt-0.5">Authors waiting for approval</p></div>
                          </button>
                       )}
                       {pendingAlerts.books && (
                          <button onClick={() => { setActiveTab('books'); localStorage.setItem('adminActiveTab', 'books'); setShowNotifications(false); }} className="w-full text-left px-4 py-3 hover:bg-black/3 flex items-start gap-3 transition-colors">
                             <div className="w-2 h-2 rounded-full bg-violet-500 mt-1.5 shrink-0"></div>
                             <div><p className="text-sm font-semibold text-paa-navy">Books Pending</p><p className="text-xs text-paa-gray-text mt-0.5">New books listed for review</p></div>
                          </button>
                       )}
                       {pendingAlerts.orders && (
                          <button onClick={() => { setActiveTab('orders'); localStorage.setItem('adminActiveTab', 'orders'); setShowNotifications(false); }} className="w-full text-left px-4 py-3 hover:bg-black/3 flex items-start gap-3 transition-colors">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                             <div><p className="text-sm font-semibold text-paa-navy">Orders Pending</p><p className="text-xs text-paa-gray-text mt-0.5">Pending customer web orders</p></div>
                          </button>
                       )}
                       {pendingAlerts.queries && (
                          <button onClick={() => { setActiveTab('helpdesk'); localStorage.setItem('adminActiveTab', 'helpdesk'); setShowNotifications(false); }} className="w-full text-left px-4 py-3 hover:bg-black/3 flex items-start gap-3 transition-colors">
                             <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                             <div><p className="text-sm font-semibold text-paa-navy">Unanswered Queries</p><p className="text-xs text-paa-gray-text mt-0.5">Helpdesk tickets need response</p></div>
                          </button>
                       )}
                       {!(pendingAlerts.orders || pendingAlerts.queries || pendingAlerts.authors || pendingAlerts.books) && (
                          <div className="px-4 py-6 text-center text-paa-gray-text text-xs">All clear â€” no new notifications.</div>
                       )}
                    </div>
                 </div>
              )}
           </div>
        </header>
        {/* Thin refresh sweep bar */}
        <div className="dash-refresh-bar shrink-0">
           {isRefreshing && <div className="sweep" />}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-7">
           {activeTab === 'overview' && <OverviewTab refreshTrigger={lastRefreshTime} />}
           {activeTab === 'web_orders' && <WebOrdersTab refreshTrigger={lastRefreshTime} />}
           {activeTab === 'sales_report' && <SalesReportTab refreshTrigger={lastRefreshTime} />}
           {activeTab === 'authors' && renderAuthorsTab({ refreshTrigger: lastRefreshTime })}
           {activeTab === 'books' && <BooksTab />}
           {activeTab === 'events' && <EventsTab />}
           {activeTab === 'forms' && <FormsTab />}
           {activeTab === 'gallery' && <GalleryTab />}
           {activeTab === 'author_data' && <AuthorDataTab refreshTrigger={lastRefreshTime} />}
           {activeTab === 'helpdesk' && <HelpdeskTab refreshTrigger={lastRefreshTime} />}
           {activeTab === 'settings' && (
             <div className="p-8 text-center text-gray-500">
               <h2 className="text-2xl font-bold mb-2">System Settings</h2>
               <p>Settings panel coming soon...</p>
             </div>
           )}
        </div>
      </main>

      {/* Event Registrations Modal */}
      <Modal isOpen={viewingRegistrationsEventId !== null} onClose={() => { setViewingRegistrationsEventId(null); setEventRegistrations([]); setRegistrationsFilter('All'); setRegistrationsPage(1); }} title="Author Event Registrations">
        {loadingRegistrations ? (
          <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-paa-navy" /></div>
        ) : (
          <div className="space-y-6 max-h-[70vh] min-h-[60vh] overflow-y-auto pr-2 flex flex-col">
            
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 shrink-0">
              {['All', 'Awaiting Approval', 'Opted-In', 'Rejected'].map(status => {
                const count = status === 'All' ? eventRegistrations.length : eventRegistrations.filter(r => r.optInStatus === status).length;
                return (
                <button key={status} onClick={() => { setRegistrationsFilter(status); setRegistrationsPage(1); }} className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap rounded-full border transition-colors ${registrationsFilter === status ? 'bg-paa-navy text-white border-paa-navy' : 'bg-white text-gray-500 border-gray-200 hover:border-paa-navy'}`}>
                  {status} ({count})
                </button>
              )})}
            </div>

            {(() => {
              const filteredRegistrations = eventRegistrations.filter(r => registrationsFilter === 'All' || r.optInStatus === registrationsFilter);
              const PAGE_SIZE = 5;
              const totalPages = Math.ceil(filteredRegistrations.length / PAGE_SIZE);
              const paginatedRegistrations = filteredRegistrations.slice((registrationsPage - 1) * PAGE_SIZE, registrationsPage * PAGE_SIZE);

              if (filteredRegistrations.length === 0) {
                return <div className="flex-1 flex items-center justify-center"><p className="text-gray-500 text-center py-8">No registrations found for this filter.</p></div>;
              }

              return (
                <>
                  <div className="space-y-4">
                    {paginatedRegistrations.map((reg) => (
                      <div key={reg.id} className="bg-white border border-paa-navy/5 p-4 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out flex flex-col gap-4">
                  
                  <div className="flex justify-between items-start border-b pb-3">
                    <div>
                      <h4 className="font-bold text-paa-navy text-lg">{reg.author.name}</h4>
                      <p className="text-xs text-gray-500">{reg.author.email} | {reg.author.phone}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest text-white ${reg.optInStatus === 'Awaiting Approval' ? 'bg-orange-500' : reg.optInStatus === 'Opted-In' ? 'bg-green-500' : 'bg-red-500'}`}>
                      {reg.optInStatus}
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Books Registered</p>
                      <ul className="space-y-1">
                        {reg.books.map((b: any) => (
                          <li key={b.id} className="text-sm flex justify-between bg-white px-2 py-1 border border-gray-100">
                            <span className="truncate pr-2">{b.book.title}</span>
                            <span className="font-bold whitespace-nowrap">{b.listedStock} units</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                       <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Category Breakdown</p>
                       <div className="flex flex-wrap gap-2">
                         {Object.entries(reg.categoryCounts || {}).map(([cat, count]: [string, any]) => (
                           <span key={cat} className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-1 rounded-3xl-2xl">
                             {cat}: {count}
                           </span>
                         ))}
                       </div>
                    </div>
                  </div>

                  {reg.paymentScreenshot && (
                    <div className="mt-2 border-t pt-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Payment Screenshot</p>
                      <a href={`${API}${reg.paymentScreenshot}`} target="_blank" rel="noopener noreferrer">
                        <img src={`${API}${reg.paymentScreenshot}`} alt="Payment Proof" className="w-32 h-auto border shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out hover:opacity-80 transition-opacity" />
                      </a>
                    </div>
                  )}

                  {reg.optInStatus === 'Awaiting Approval' && (
                    <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-black/5">
                      <button onClick={() => handleRejectRegistration(reg.eventId, reg.authorId)} className="dash-btn dash-btn-danger">
                        Reject
                      </button>
                      <button onClick={() => handleApproveRegistration(reg.eventId, reg.authorId)} className="dash-btn dash-btn-success">
                        Approve Registration
                      </button>
                    </div>
                  )}

                </div>
              ))}
              </div>
              
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 font-medium">Page {registrationsPage} of {totalPages}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setRegistrationsPage(p => Math.max(1, p - 1))} disabled={registrationsPage === 1} className="px-3 py-1 bg-white border border-gray-300 text-xs font-bold uppercase disabled:opacity-50 hover:bg-gray-50 transition-colors">Prev</button>
                    <button onClick={() => setRegistrationsPage(p => Math.min(totalPages, p + 1))} disabled={registrationsPage === totalPages} className="px-3 py-1 bg-white border border-gray-300 text-xs font-bold uppercase disabled:opacity-50 hover:bg-gray-50 transition-colors">Next</button>
                  </div>
                </div>
              )}
            </>
            );
          })()}
          </div>
        )}
      </Modal>

      <Modal isOpen={!!selectedBookDetails} onClose={() => setSelectedBookDetails(null)} title="Book Details">
        {selectedBookDetails && (
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
             <div className="flex gap-4">
               {selectedBookDetails.coverUrl && (
                 <img src={selectedBookDetails.coverUrl.startsWith('http') ? selectedBookDetails.coverUrl : `${API}${selectedBookDetails.coverUrl}`} alt="Cover" className="w-32 h-44 object-cover border border-paa-navy/20 shadow-sm" />
               )}
               <div>
                  <h3 className="text-xl font-bold text-paa-navy">{selectedBookDetails.title}</h3>
                  {selectedBookDetails.subtitle && <p className="text-sm font-medium text-paa-gray-text">{selectedBookDetails.subtitle}</p>}
                  <p className="text-sm font-medium mt-1">Author: <span className="font-bold">{selectedBookDetails.authorName}</span></p>
                  <p className="text-xs font-bold uppercase tracking-widest text-paa-navy mt-2 bg-[#eef2f6] inline-block px-2 py-0.5">{selectedBookDetails.genre} {selectedBookDetails.subGenre && `> ${selectedBookDetails.subGenre}`}</p>
               </div>
             </div>
             
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-paa-navy/5 pt-4">
               <div><span className="text-[10px] uppercase text-paa-gray-text block">MRP</span><span className="text-sm font-bold text-green-700">₹{selectedBookDetails.mrp}</span></div>
               <div><span className="text-[10px] uppercase text-paa-gray-text block">Language</span><span className="text-sm font-bold text-paa-navy">{selectedBookDetails.language || '-'}</span></div>
               <div><span className="text-[10px] uppercase text-paa-gray-text block">Format</span><span className="text-sm font-bold text-paa-navy">{selectedBookDetails.format || '-'}</span></div>
               <div><span className="text-[10px] uppercase text-paa-gray-text block">Pages</span><span className="text-sm font-bold text-paa-navy">{selectedBookDetails.pages || '-'}</span></div>
               <div><span className="text-[10px] uppercase text-paa-gray-text block">Publisher</span><span className="text-sm font-bold text-paa-navy">{selectedBookDetails.publisher || '-'}</span></div>
               <div><span className="text-[10px] uppercase text-paa-gray-text block">Pub Date</span><span className="text-sm font-bold text-paa-navy">{selectedBookDetails.publicationDate || '-'}</span></div>
               <div><span className="text-[10px] uppercase text-paa-gray-text block">ISBN</span><span className="text-sm font-bold text-paa-navy">{selectedBookDetails.isbn || '-'}</span></div>
               <div><span className="text-[10px] uppercase text-paa-gray-text block">Current Stock</span><span className="text-sm font-bold text-paa-navy">{selectedBookDetails.stock}</span></div>
               <div><span className="text-[10px] uppercase text-paa-gray-text block">Total Sales</span><span className="text-sm font-bold text-paa-navy">{selectedBookDetails.sales}</span></div>
             </div>
             
             <div className="border-t border-paa-navy/5 pt-4">
               <span className="text-[10px] uppercase text-paa-gray-text block mb-1">Synopsis</span>
               <p className="text-sm text-paa-navy whitespace-pre-wrap">{selectedBookDetails.synopsis || 'No synopsis provided.'}</p>
             </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title="Create Event">
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          const target = e.target as any;
          setIsSubmittingEvent(true);
          try {
            const eType = target.eventType.value === 'Other' ? target.customEventType.value : target.eventType.value;
            
            const fd = new FormData();
            fd.append('name', target.name.value);
            fd.append('date', target.date.value);
            fd.append('location', target.location.value);
            fd.append('duration', target.duration.value);
            fd.append('eventType', eType);
            fd.append('registrationFee', target.registrationFee.value);
            fd.append('feeType', target.feeType.value);
            if (target.description.value) fd.append('description', target.description.value);
            if (target.banner.files[0]) fd.append('banner', target.banner.files[0]);

            await axios.post(`${API}/api/admin/events`, fd, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            fetchEvents();
            setIsEventModalOpen(false);
          } catch (err: any) {
            alert(err.response?.data?.error || err.message);
          } finally {
            setIsSubmittingEvent(false);
          }
        }}>
          <div><label className="dash-label">Event Name</label><input required name="name" type="text" className="dash-input" /></div>
          <div><label className="dash-label">Event Description</label><textarea name="description" rows={2} className="dash-input" placeholder="Short details about the event..."></textarea></div>
          <div><label className="dash-label">Event Banner (Optional)</label><input name="banner" type="file" accept="image/*" className="dash-input" /></div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="dash-label">Event Type</label>
              <select name="eventType" className="dash-input" onChange={(e) => {
                const customInput = document.getElementById('customEventTypeContainer');
                if (customInput) customInput.style.display = e.target.value === 'Other' ? 'block' : 'none';
              }}>
                <option value="Book Fair">Book Fair</option>
                <option value="Literature Festival">Literature Festival</option>
                <option value="Book Launch">Book Launch</option>
                <option value="Workshop">Workshop</option>
                <option value="Online Event">Online Event</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div id="customEventTypeContainer" style={{display: 'none'}}>
               <label className="dash-label">Specify Type</label>
               <input name="customEventType" type="text" placeholder="Enter custom type" className="dash-input" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="dash-label">Date (e.g. 15 Aug 2026)</label><input required name="date" type="date" className="dash-input" /></div>
            <div><label className="dash-label">Duration (e.g. 3 days)</label><input required name="duration" type="text" className="dash-input" /></div>
          </div>
          <div><label className="dash-label">Location</label><input required name="location" type="text" className="dash-input" /></div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="dash-label">Registration Fee (₹)</label>
              <input required name="registrationFee" type="number" min="0" step="0.01" defaultValue="0" className="dash-input" />
            </div>
            <div>
              <label className="dash-label">Fee Type</label>
              <select name="feeType" className="dash-input">
                <option value="Per Author">Per Author</option>
                <option value="Per Title">Per Title</option>
                <option value="Flat Fee">Flat Fee</option>
              </select>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-paa-navy/5 flex justify-end">
            <button type="submit" disabled={isSubmittingEvent} className="bg-paa-navy text-paa-cream px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors disabled:opacity-50 rounded-full active:scale-95 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out">
              {isSubmittingEvent ? "Creating Event..." : "Create Event"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditEventModalOpen} onClose={() => setIsEditEventModalOpen(false)} title="Edit Event">
        {editingEvent && (
          <form className="space-y-4" onSubmit={handleEditEventSubmit}>
            <div><label className="dash-label">Event Name</label><input required type="text" className="dash-input" value={editingEvent.name} onChange={e => setEditingEvent({...editingEvent, name: e.target.value})} /></div>
            <div><label className="dash-label">Event Description</label><textarea name="description" rows={2} className="dash-input" defaultValue={editingEvent.description || ''}></textarea></div>
            <div><label className="dash-label">Event Banner (Leave empty to keep existing)</label><input name="banner" type="file" accept="image/*" className="dash-input" /></div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="dash-label">Event Type</label>
                <select name="eventType" className="dash-input" value={editingEvent.eventType} onChange={e => setEditingEvent({...editingEvent, eventType: e.target.value})}>
                  <option value="Book Fair">Book Fair</option>
                  <option value="Literature Festival">Literature Festival</option>
                  <option value="Book Launch">Book Launch</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Online Event">Online Event</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {editingEvent.eventType === 'Other' && (
                <div>
                   <label className="dash-label">Specify Type</label>
                   <input required name="customEventType" type="text" placeholder="Enter custom type" className="dash-input" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className="dash-label">Date</label><input required type="date" className="dash-input" value={editingEvent.date} onChange={e => setEditingEvent({...editingEvent, date: e.target.value})} /></div>
              <div><label className="dash-label">Duration</label><input required type="text" className="dash-input" value={editingEvent.duration} onChange={e => setEditingEvent({...editingEvent, duration: e.target.value})} /></div>
            </div>
            <div><label className="dash-label">Location</label><input required type="text" className="dash-input" value={editingEvent.location} onChange={e => setEditingEvent({...editingEvent, location: e.target.value})} /></div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="dash-label">Registration Fee (₹)</label>
                <input required type="number" min="0" step="0.01" className="dash-input" value={editingEvent.registrationFee} onChange={e => setEditingEvent({...editingEvent, registrationFee: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="dash-label">Fee Type</label>
                <select className="dash-input" value={editingEvent.feeType} onChange={e => setEditingEvent({...editingEvent, feeType: e.target.value})}>
                  <option value="Per Author">Per Author</option>
                  <option value="Per Title">Per Title</option>
                  <option value="Flat Fee">Flat Fee</option>
                </select>
              </div>
            </div>

            <div>
              <label className="dash-label">Status</label>
              <select className="dash-input" value={editingEvent.status} onChange={e => setEditingEvent({...editingEvent, status: e.target.value})}>
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Past">Past</option>
              </select>
            </div>

            <div className="pt-4 mt-4 border-t border-paa-navy/5 flex justify-end gap-2">
              <button type="button" onClick={() => setIsEditEventModalOpen(false)} className="bg-gray-100 text-paa-navy px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">Cancel</button>
              <button type="submit" className="bg-paa-navy text-paa-cream px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors rounded-full active:scale-95 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Gallery Images Management Modal */}
      <Modal isOpen={!!selectedGalleryEvent} onClose={() => setSelectedGalleryEvent(null)} title={`Manage Images: ${selectedGalleryEvent?.location}`}>
        {selectedGalleryEvent && (
          <div className="space-y-6">
            <form onSubmit={handleUploadGalleryImage} className="space-y-4 bg-gray-50 p-4 border border-paa-navy/5 rounded-3xl-2xl">
              <h4 className="text-xs font-bold uppercase tracking-widest text-paa-navy mb-2">Upload New Image</h4>
              <div>
                <input required type="file" name="photo" accept="image/*" className="w-full text-sm text-paa-gray-text file:mr-4 file:py-2 file:px-4 file:rounded-3xl-2xl file:border-0 file:text-xs file:font-bold file:bg-paa-navy/10 file:text-paa-navy hover:file:bg-paa-navy/20 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1 block">Caption (Optional)</label><input type="text" name="caption" className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-white focus:border-paa-navy" placeholder="E.g. Audience cheering" /></div>
                <div><label className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1 block">Date Taken (Optional)</label><input type="date" name="dateTaken" className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-white focus:border-paa-navy" /></div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="bg-paa-navy text-paa-cream px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-paa-gold transition-colors rounded-full active:scale-95 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out">Upload</button>
              </div>
            </form>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-paa-navy mb-4 border-b border-paa-navy/5 pb-2">Uploaded Images ({selectedGalleryEvent.images?.length || 0})</h4>
              {(!selectedGalleryEvent.images || selectedGalleryEvent.images.length === 0) ? (
                <div className="text-center py-8 text-paa-gray-text text-sm">No additional images uploaded for this event.</div>
              ) : (
                <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                  {selectedGalleryEvent.images.map((img: any) => (
                    <div key={img.id} className="relative group rounded-3xl-2xl overflow-hidden border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out bg-white">
                      <img src={img.url.startsWith('http') ? img.url : `${API}${img.url}`} alt={img.caption || 'Event Image'} className="w-full h-32 object-cover" />
                      <button 
                        onClick={() => handleDeleteGalleryImage(img.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-3xl-2xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow"
                        title="Delete Image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      {(img.caption || img.dateTaken) && (
                        <div className="p-2 text-xs">
                          {img.caption && <p className="font-medium text-paa-navy truncate" title={img.caption}>{img.caption}</p>}
                          {img.dateTaken && <p className="text-[10px] text-paa-gray-text mt-0.5">{new Date(img.dateTaken).toLocaleDateString()}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      
      {/* Event Report Modal */}
      {reportEventId && (
        <div className="fixed inset-0 bg-paa-navy/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-3xl-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-y-auto">
            <div className="p-8 border-b border-paa-navy/5 flex justify-between items-center bg-[#f8fafc]">
              <div>
                 <h2 className="text-2xl font-serif text-paa-navy">Event Settlement Report</h2>
                 <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">Full breakdown of all author sales and revenue.</p>
              </div>
              <div className="flex gap-4 items-center">
                 <button onClick={() => {
                    if (!eventReportData || !eventReportData.authors) return;
                    let csv = "Author Name,Email,Phone,Book Title,Category,MRP,Listed Stock,Sold Stock,Available Stock,Returned Stock,Revenue\n";
                    eventReportData.authors.forEach((author: any) => {
                        if (author.books && author.books.length > 0) {
                            author.books.forEach((b: any) => {
                                csv += `"${author.name}","${author.email}","${author.phone}","${b.title}","${b.category}",${b.mrp},${b.listedStock},${b.soldStock},${b.availableStock},${b.returnedStock},${b.revenue}\n`;
                            });
                        } else {
                            csv += `"${author.name}","${author.email}","${author.phone}","No Books Listed",,,,,,,,\n`;
                        }
                    });
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `event_sales_report_${reportEventId}.csv`;
                    a.click();
                 }} className="bg-paa-navy text-paa-cream px-4 py-2 font-bold text-xs uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors rounded-3xl-2xl shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out">
                    Download CSV Report
                 </button>
                 <button onClick={() => setReportEventId(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={24} className="text-gray-500" /></button>
              </div>
            </div>
            <div className="p-6 flex-1">
               {pendingReportStatus && (
                  <div className="text-center p-8 bg-gray-50 border border-paa-navy/5 rounded-3xl-2xl mb-6">
                     <h3 className="text-2xl font-serif text-paa-navy mb-2">Awaiting Author Settlements</h3>
                     <p className="text-sm text-gray-500 mb-6">The detailed report is partially complete. The following authors have not yet submitted their post-event inventory counts:</p>
                     <div className="flex flex-wrap gap-2 justify-center mb-8">
                        {pendingReportStatus.missingAuthors.map((a: any) => (
                           <span key={a.id} className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200">{a.name}</span>
                        ))}
                     </div>
                     <button onClick={handleNotifySettlement} className="bg-paa-navy text-paa-cream px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors no-print rounded-full active:scale-95 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out">Notify Pending Authors</button>
                  </div>
               )}
               {eventReportData && Array.isArray(eventReportData) && eventReportData[0]?.isLegacySummary ? (
                  <div className="text-center p-8 bg-gray-50 border border-paa-navy/5 rounded-3xl-2xl">
                     <h3 className="text-2xl font-serif text-paa-navy mb-2">Legacy Event Overview</h3>
                     <p className="text-sm text-gray-500 mb-8">Granular transaction records are not available for this archived event.</p>
                     <div className="flex justify-center gap-12">
                        <div className="bg-white p-6 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out border border-gray-100 rounded-3xl-2xl min-w-[150px]">
                           <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Total Authors</p>
                           <p className="text-4xl font-black text-paa-navy">{eventReportData[0].authorsParticipated}</p>
                        </div>
                        <div className="bg-white p-6 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out border border-gray-100 rounded-3xl-2xl min-w-[150px]">
                           <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Books Sold</p>
                           <p className="text-4xl font-black text-paa-navy">{eventReportData[0].booksSold}</p>
                        </div>
                     </div>
                  </div>
               ) : eventReportData && eventReportData.status === 'live' ? (
                  <div className="space-y-8">
                     {/* OVERALL STATS */}
                     <div className="grid grid-cols-4 gap-4">
                        <div className="bg-white p-4 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out border border-gray-100 rounded-3xl-2xl">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Revenue</p>
                           <p className="text-2xl font-black text-green-700">₹{eventReportData.overallStats.totalRevenue.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out border border-gray-100 rounded-3xl-2xl">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Books Sold</p>
                           <p className="text-2xl font-black text-paa-navy">{eventReportData.overallStats.totalBooksSold}</p>
                        </div>
                        <div className="bg-white p-4 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out border border-gray-100 rounded-3xl-2xl">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Books Listed</p>
                           <p className="text-2xl font-black text-paa-navy">{eventReportData.overallStats.totalBooksListed}</p>
                        </div>
                        <div className="bg-white p-4 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out border border-gray-100 rounded-3xl-2xl">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Authors Registered</p>
                           <p className="text-2xl font-black text-paa-navy">{eventReportData.overallStats.totalAuthorsRegistered}</p>
                        </div>
                     </div>

                     {/* CATEGORY SALES */}
                     <div>
                        <h3 className="text-lg font-serif text-paa-navy mb-3">Sales by Category</h3>
                        <div className="grid grid-cols-3 gap-4">
                           {Object.entries(eventReportData.categorySales).map(([cat, stats]: any) => (
                              <div key={cat} className="bg-[#f8fafc] p-3 border border-gray-200 rounded-3xl-2xl flex justify-between items-center">
                                 <span className="font-bold text-xs text-paa-navy">{cat}</span>
                                 <div className="text-right">
                                    <p className="text-sm font-bold text-green-700">₹{stats.revenue.toFixed(2)}</p>
                                    <p className="text-[10px] text-gray-500">{stats.sold} sold</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* AUTHORS DETAIL */}
                     <div>
                        <h3 className="text-lg font-serif text-paa-navy mb-3">Author Sales Breakdown</h3>
                        <div className="space-y-6">
                           {eventReportData.authors.map((author: any) => (
                              <div key={author.id} className="border border-paa-navy/5 rounded-3xl-2xl overflow-hidden">
                                 <div className="bg-[#f0f4f8] p-3 flex justify-between items-center border-b border-paa-navy/5">
                                    <div>
                                       <p className="font-bold text-paa-navy flex items-center gap-2">
                                          {author.name}
                                          {author.optInStatus === 'Awaiting Approval' && <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-[10px] rounded-full">Pending</span>}
                                       </p>
                                       <p className="text-[10px] text-gray-500">{author.email} â€¢ {author.phone}</p>
                                    </div>
                                    <div className="text-right flex gap-6">
                                       <div>
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Sold</p>
                                          <p className="font-bold text-paa-navy">{author.totalSold} / {author.totalListed}</p>
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Revenue</p>
                                          <p className="font-bold text-green-700">₹{author.totalRevenue.toFixed(2)}</p>
                                       </div>
                                    </div>
                                 </div>
                                 <table className="w-full text-left text-xs whitespace-nowrap bg-white">
                                    <thead className="bg-gray-50 text-gray-500 uppercase tracking-widest">
                                       <tr>
                                          <th className="px-3 py-2">Book Title</th>
                                          <th className="px-3 py-2 text-center">Listed</th>
                                          <th className="px-3 py-2 text-center">Sold</th>
                                          <th className="px-3 py-2 text-center">Available</th>
                                          <th className="px-3 py-2 text-right">Revenue</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                       {author.books.map((b: any) => (
                                          <tr key={b.id} className="hover:bg-gray-50">
                                             <td className="px-3 py-2 font-medium">{b.title} <span className="text-[9px] text-gray-400 block">{b.category}</span></td>
                                             <td className="px-3 py-2 text-center">{b.listedStock}</td>
                                             <td className="px-3 py-2 text-center font-bold">{b.soldStock}</td>
                                             <td className="px-3 py-2 text-center">{b.availableStock}</td>
                                             <td className="px-3 py-2 text-right text-green-700 font-bold">₹{b.revenue.toFixed(2)}</td>
                                          </tr>
                                       ))}
                                       {author.books.length === 0 && (
                                          <tr>
                                             <td colSpan={5} className="px-3 py-4 text-center text-gray-400 italic">No books listed</td>
                                          </tr>
                                       )}
                                    </tbody>
                                 </table>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               ) : Array.isArray(eventReportData) && eventReportData.length === 0 && !pendingReportStatus ? (
                  <p className="text-center text-gray-500 italic">No books were listed for this event.</p>
               ) : Array.isArray(eventReportData) && eventReportData.length > 0 ? (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                     <thead className="bg-[#f0f4f8] text-paa-navy uppercase tracking-widest text-xs border-b border-paa-navy/5">
                        <tr>
                           <th className="px-4 py-3 font-bold">Author</th>
                           <th className="px-4 py-3 font-bold">Book Title</th>
                           <th className="px-4 py-3 font-bold text-center">Listed</th>
                           <th className="px-4 py-3 font-bold text-center">Sold</th>
                           <th className="px-4 py-3 font-bold text-center">Returned</th>
                           <th className="px-4 py-3 font-bold text-right">Revenue</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {eventReportData.map((row: any) => {
                           const price = row?.book?.mrp || 0;
                           const sold = row?.soldStock || 0;
                           const revenue = price * sold;
                           return (
                              <tr key={row.id} className="hover:bg-gray-50">
                                 <td className="px-4 py-3">{row?.author?.name || 'N/A'}</td>
                                 <td className="px-4 py-3 font-medium text-paa-navy">{row?.book?.title || 'N/A'}</td>
                                 <td className="px-4 py-3 text-center">{row?.listedStock || 0}</td>
                                 <td className="px-4 py-3 text-center font-bold">{sold}</td>
                                 <td className="px-4 py-3 text-center text-gray-500">{row?.returnedStock || 0}</td>
                                 <td className="px-4 py-3 text-right font-bold text-green-700">₹{revenue.toFixed(2)}</td>
                              </tr>
                           )
                        })}
                     </tbody>
                  </table>
               ) : null}
            </div>
            {Array.isArray(eventReportData) && eventReportData.length > 0 && !eventReportData[0]?.isLegacySummary && (
              <div className="p-4 border-t border-paa-navy/5 bg-gray-50 flex justify-between items-center">
                 <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Total Event Revenue: <span className="text-paa-navy text-sm">₹{eventReportData.reduce((sum, r) => sum + ((r?.book?.mrp || 0) * (r?.soldStock || 0)), 0).toFixed(2)}</span>
                 </div>
                 <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Total Author Payouts: <span className="text-green-700 text-sm">₹{eventReportData.reduce((sum, r) => sum + ((r?.book?.mrp || 0) * (r?.soldStock || 0)), 0).toFixed(2)}</span>
                 </div>
              </div>
            )}
            {eventReportData && eventReportData.status === 'live' && (
              <div className="p-4 border-t border-paa-navy/5 bg-gray-50 flex justify-between items-center">
                 <div className="text-xs font-bold uppercase tracking-widest text-green-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live POS Connection Active
                 </div>
                 <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Total Author Payouts: <span className="text-green-700 text-sm">₹{(eventReportData.overallStats.totalRevenue).toFixed(2)}</span>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order Details: ${selectedOrder?.id}`}>
        {selectedOrder && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 border border-paa-navy/5 flex justify-between items-start">
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-paa-gray-text mb-1">Customer Details</p>
                <p className="font-bold text-paa-navy">{selectedOrder.customer}</p>
                <p className="text-sm font-medium text-paa-gray-text mt-1">Placed on: {selectedOrder.date}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold tracking-widest uppercase text-paa-gray-text mb-1">Total Amount</p>
                <p className="font-bold text-xl text-paa-navy">₹{selectedOrder.total}</p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-serif font-semibold text-paa-navy tracking-tight mb-3">Ordered Books</h3>
              <ul className="space-y-2">
                {selectedOrder.items.map((it: any, idx: number) => {
                  let processingDays = null;
                  let deliveryDays = null;
                  if (it.createdAt && it.dispatchedAt) {
                     processingDays = Math.max(0, Math.round((new Date(it.dispatchedAt).getTime() - new Date(it.createdAt).getTime()) / (1000 * 3600 * 24)));
                  }
                  if (it.dispatchedAt && it.deliveredAt) {
                     deliveryDays = Math.max(0, Math.round((new Date(it.deliveredAt).getTime() - new Date(it.dispatchedAt).getTime()) / (1000 * 3600 * 24)));
                  }
                  
                  return (
                  <li key={idx} className="flex flex-col border-b border-paa-navy/5 pb-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm text-paa-navy">{it.title} <span className="text-gray-400 italic font-normal text-xs ml-1">by {it.authorName}</span></span>
                      <span className="font-bold text-paa-navy text-sm">Qty: {it.qty}</span>
                    </div>
                    {(processingDays !== null || deliveryDays !== null) && (
                      <div className="flex gap-4 mt-1 text-[10px] uppercase font-bold tracking-widest text-paa-gray-text">
                         {processingDays !== null && <span>Processing Time: <span className="text-paa-navy">{processingDays} {processingDays === 1 ? 'day' : 'days'}</span></span>}
                         {deliveryDays !== null && <span>Delivery Time: <span className="text-paa-navy">{deliveryDays} {deliveryDays === 1 ? 'day' : 'days'}</span></span>}
                      </div>
                    )}
                  </li>
                )})}
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-serif font-semibold text-paa-navy tracking-tight mb-3">Payment Information</h3>
              {selectedOrder.payment === 'Paid' ? (
                <div className="bg-[#f0f4f8] p-4 border border-paa-navy/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-paa-navy mb-1 uppercase tracking-widest">Payment Uploaded</p>
                    <a href={`${API}${selectedOrder.paymentScreenshot}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">View Screenshot</a>
                  </div>
                  {selectedOrder.status === 'Completed' ? (
                    <div className="flex items-center gap-2 text-green-700 bg-green-100 px-3 py-1 border border-green-300">
                      <CheckCircle2 className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-widest">Verified</span>
                    </div>
                  ) : selectedOrder.status === 'Payment Not Received' ? (
                    <div className="flex items-center gap-2 text-red-700 bg-red-100 px-3 py-1 border border-red-300">
                      <XCircle className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-widest">Rejected</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => handleVerifyOrder(selectedOrder.dbId)} disabled={loadingAction === 'verifyOrder_' + selectedOrder.dbId} className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-4 py-2 text-xs font-bold uppercase tracking-widest shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out transition-colors disabled:opacity-50">
                        {loadingAction === 'verifyOrder_' + selectedOrder.dbId ? 'Verifying...' : 'Verify'}
                      </button>
                      <button onClick={() => handleRejectOrder(selectedOrder.dbId)} disabled={loadingAction === 'rejectOrder_' + selectedOrder.dbId} className="bg-white border border-[#d9534f] text-[#d9534f] hover:bg-[#d9534f] hover:text-white px-4 py-2 text-xs font-bold uppercase tracking-widest shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out transition-colors disabled:opacity-50">
                        {loadingAction === 'rejectOrder_' + selectedOrder.dbId ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 p-4 border border-red-200 text-red-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    <span className="text-sm font-bold">No payment screenshot uploaded</span>
                  </div>
                  {selectedOrder.status !== 'Payment Not Received' && (
                    <button onClick={() => handleRejectOrder(selectedOrder.dbId)} disabled={loadingAction === 'rejectOrder_' + selectedOrder.dbId} className="bg-[#d9534f] hover:bg-[#c9302c] text-white px-4 py-2 text-xs font-bold uppercase tracking-widest shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out transition-colors disabled:opacity-50">
                      {loadingAction === 'rejectOrder_' + selectedOrder.dbId ? 'Updating...' : 'Mark Failed'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title="Create New Form">
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          const target = e.target as any;
          setLoadingAction('createForm');
          const title = target.formTitle.value;
          const type = target.formType.value;
          const description = target.formDescription.value;
          const fieldsJson = target.formFields.value;
          let fields = [];
          try { 
            fields = JSON.parse(fieldsJson || "[]"); 
          } catch(e) { 
            alert("Invalid fields JSON. Please provide a valid JSON array."); 
            return; 
          }
          try {
            await axios.post(`${API}/api/admin/forms`, { title, type, description, fields }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
            fetchForms();
            setIsFormModalOpen(false);
          } catch (err) {
            alert("Error creating form");
          } finally { setLoadingAction(null); }
        }}>
          <div>
            <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Form Title</label>
            <input name="formTitle" required className="w-full p-2 border border-paa-navy/20" />
          </div>
          <div>
            <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Category / Type</label>
            <select name="formType" required className="w-full p-2 border border-paa-navy/20 bg-white">
              <option value="Literary Events">Literary Events</option>
              <option value="Book Fairs">Book Fairs</option>
              <option value="Flybraries">Flybraries</option>
              <option value="Book CafÃ©">Book CafÃ©</option>
            </select>
          </div>
          <div>
            <label className="dash-label">Description (Optional)</label>
            <textarea name="formDescription" className="dash-input" rows={2}></textarea>
          </div>
          <div>
            <label className="dash-label">Fields Config (JSON array)</label>
            <textarea name="formFields" required className="dash-input font-mono" rows={6} placeholder={`[{"label": "Name", "type": "text", "required": true}]`}></textarea>
          </div>
          <button type="submit" disabled={loadingAction === 'createForm'} className="dash-btn dash-btn-primary w-full justify-center py-3">
            {loadingAction === 'createForm' ? 'Creating...' : 'Create Form'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={isGalleryModalOpen} onClose={() => setIsGalleryModalOpen(false)} title="Add Gallery Event">
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          const target = e.target as any;
          const file = target.photo.files[0];
          if (!file) {
            alert("Photo is required");
            return;
          }
          const fd = new FormData();
          setLoadingAction('addGalleryEvent');
          fd.append('photo', file);
          fd.append('location', target.loc.value);
          fd.append('place', target.place.value);
          fd.append('city', target.city.value);
          fd.append('type', target.type.value);
          fd.append('date', target.date.value);
          fd.append('description', target.description.value);
          fd.append('duration', target.duration.value || '1 Day');
          fd.append('authors', target.authors.value || '0');
          fd.append('booksSold', target.booksSold.value || '0');
          
          try {
            await axios.post(`${API}/api/admin/gallery`, fd, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
            fetchGallery();
            setIsGalleryModalOpen(false);
          } catch(err) {
            alert("Error adding gallery event");
          } finally { setLoadingAction(null); }
        }}>
          <div>
            <label className="dash-label">Event Title / Location</label>
            <input name="loc" required className="dash-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="dash-label">Place</label>
              <input name="place" required className="dash-input" />
            </div>
            <div>
              <label className="dash-label">City</label>
              <input name="city" required className="dash-input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="dash-label">Date</label>
              <input type="date" name="date" required className="dash-input" />
            </div>
            <div>
              <label className="dash-label">Type</label>
              <select name="type" required className="dash-input">
                <option value="Literary Event">Literary Event</option>
                <option value="Book Fair">Book Fair</option>
                <option value="Corporate Activation">Corporate Activation</option>
                <option value="Airport Library">Airport Library</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="dash-label">Duration</label>
              <input name="duration" placeholder="e.g. 2 Days" className="dash-input" />
            </div>
            <div>
              <label className="dash-label">Authors</label>
              <input type="number" name="authors" placeholder="Count" className="dash-input" />
            </div>
            <div>
              <label className="dash-label">Books Sold</label>
              <input type="number" name="booksSold" placeholder="Count" className="dash-input" />
            </div>
          </div>
          <div>
            <label className="dash-label">Description</label>
            <textarea name="description" required className="dash-input" rows={2}></textarea>
          </div>
          <div>
            <label className="dash-label">Photo</label>
            <input type="file" accept="image/*" name="photo" required className="dash-input" />
          </div>
          <button type="submit" disabled={loadingAction === 'addGalleryEvent'} className="dash-btn dash-btn-primary w-full justify-center py-3">
            {loadingAction === 'addGalleryEvent' ? 'Adding...' : 'Add Gallery Event'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={isEditGalleryModalOpen} onClose={() => setIsEditGalleryModalOpen(false)} title="Edit Gallery Event">
        {editingGalleryEvent && (
          <form className="space-y-4" onSubmit={async (e) => {
            e.preventDefault();
            const target = e.target as any;
            setLoadingAction('editGalleryEvent');
            const fd = new FormData();
            if (target.photo.files[0]) {
              fd.append('photo', target.photo.files[0]);
            }
            fd.append('location', target.loc.value);
            fd.append('place', target.place.value);
            fd.append('city', target.city.value);
            fd.append('type', target.type.value);
            fd.append('date', target.date.value);
            fd.append('description', target.description.value);
            fd.append('duration', target.duration.value);
            fd.append('authors', target.authors.value);
            fd.append('booksSold', target.booksSold.value);
            
            try {
              await axios.put(`${API}/api/admin/gallery/${editingGalleryEvent.id}`, fd, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
              toast.success("Gallery event updated!");
              fetchGallery();
              setIsEditGalleryModalOpen(false);
            } catch(err) {
              toast.error("Error updating gallery event");
            } finally { setLoadingAction(null); }
          }}>
            <div>
              <label className="dash-label">Event Title / Location</label>
              <input name="loc" defaultValue={editingGalleryEvent.location} required className="dash-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="dash-label">Place</label>
                <input name="place" defaultValue={editingGalleryEvent.place} required className="dash-input" />
              </div>
              <div>
                <label className="dash-label">City</label>
                <input name="city" defaultValue={editingGalleryEvent.city} required className="dash-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="dash-label">Date</label>
                <input type="date" name="date" defaultValue={editingGalleryEvent.date.split('T')[0]} required className="dash-input" />
              </div>
              <div>
                <label className="dash-label">Type</label>
                <select name="type" defaultValue={editingGalleryEvent.type} required className="dash-input">
                  <option value="Literary Event">Literary Event</option>
                  <option value="Book Fair">Book Fair</option>
                  <option value="Corporate Activation">Corporate Activation</option>
                  <option value="Airport Library">Airport Library</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="dash-label">Duration</label>
                <input name="duration" defaultValue={editingGalleryEvent.duration} placeholder="e.g. 2 Days" className="dash-input" />
              </div>
              <div>
                <label className="dash-label">Authors</label>
                <input type="number" name="authors" defaultValue={editingGalleryEvent.authors} placeholder="Count" className="dash-input" />
              </div>
              <div>
                <label className="dash-label">Books Sold</label>
                <input type="number" name="booksSold" defaultValue={editingGalleryEvent.booksSold} placeholder="Count" className="dash-input" />
              </div>
            </div>
            <div>
              <label className="dash-label">Description</label>
              <textarea name="description" defaultValue={editingGalleryEvent.description} required className="dash-input" rows={2}></textarea>
            </div>
            <div>
              <label className="dash-label">Update Cover Photo (Optional)</label>
              <input type="file" name="photo" accept="image/*" className="dash-input" />
            </div>
            <button type="submit" disabled={loadingAction === 'editGalleryEvent'} className="dash-btn dash-btn-primary w-full justify-center py-3">
              {loadingAction === 'editGalleryEvent' ? 'Updating...' : 'Save Changes'}
            </button>
          </form>
        )}
      </Modal>

      <Modal isOpen={isEditBookModalOpen} onClose={() => { setIsEditBookModalOpen(false); setEditingBook(null); }} title="Edit Book Details">
        {editingBook && (
          <form className="space-y-4" onSubmit={handleUpdateBook}>
            <div>
              <label className="dash-label">Title</label>
              <input required type="text" value={editingBook.title} onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })} className="dash-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="dash-label">Genre</label>
                <select value={editingBook.genre} onChange={(e) => setEditingBook({ ...editingBook, genre: e.target.value })} className="dash-input">
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Children's corner">Children's corner</option>
                </select>
              </div>
              <div>
                <label className="dash-label">Subgenre</label>
                <input type="text" value={editingBook.subGenre} onChange={(e) => setEditingBook({ ...editingBook, subGenre: e.target.value })} className="dash-input" placeholder="e.g. Thriller, Biography" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="dash-label">MRP (Price in ₹)</label>
                <input required type="number" step="any" value={editingBook.mrp} onChange={(e) => setEditingBook({ ...editingBook, mrp: e.target.value })} className="dash-input" />
              </div>
              <div>
                <label className="dash-label">Stock</label>
                <input required type="number" value={editingBook.stock} onChange={(e) => setEditingBook({ ...editingBook, stock: e.target.value })} className="dash-input" />
              </div>
            </div>
            <div>
              <label className="dash-label">Synopsis</label>
              <textarea value={editingBook.synopsis} onChange={(e) => setEditingBook({ ...editingBook, synopsis: e.target.value })} className="dash-input" rows={4}></textarea>
            </div>
            <button type="submit" disabled={loadingAction === 'updateBook'} className="dash-btn dash-btn-primary w-full justify-center py-3">
              {loadingAction === 'updateBook' ? 'Updating...' : 'Save Changes'}
            </button>
          </form>
        )}
      </Modal>

      {/* Reject Author Modal */}
      {rejectAuthorTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-paa-navy/60 p-4 backdrop-blur-sm">
          <div className="bg-white border border-paa-navy/5 shadow-xl w-full max-w-lg">
            <div className="bg-[#d9534f] p-4 font-bold text-xs tracking-widest uppercase flex justify-between items-center border-b border-paa-navy/5 text-white">
              Reject Author: {rejectAuthorTarget.name}
              <button type="button" onClick={() => setRejectAuthorTarget(null)} className="hover:opacity-70">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-paa-navy mb-4">Select rejection reason(s):</p>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto bg-gray-50 p-3 border border-paa-navy/5">
                {AUTHOR_REJECTION_REASONS.map((reason) => (
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
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Enter additional reason..."
                  className="w-full border border-paa-navy/20 p-2 text-sm outline-none focus:border-paa-navy"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setRejectAuthorTarget(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-paa-navy font-bold uppercase tracking-widest">
                  Cancel
                </button>
                <button onClick={handleRejectAuthorSubmit} disabled={loadingAction === 'rejectAuthor'} className="px-6 py-2 bg-[#d9534f] hover:bg-[#c9302c] text-white text-xs font-bold uppercase tracking-widest shadow transition-colors disabled:opacity-50 rounded-full active:scale-95 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out">
                  {loadingAction === 'rejectAuthor' ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Book Modal */}
      {rejectBookTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-paa-navy/60 p-4 backdrop-blur-sm">
          <div className="bg-white border border-paa-navy/5 shadow-xl w-full max-w-lg">
            <div className="bg-[#d9534f] p-4 font-bold text-xs tracking-widest uppercase flex justify-between items-center border-b border-paa-navy/5 text-white">
              Reject Book: {rejectBookTarget.title}
              <button type="button" onClick={() => setRejectBookTarget(null)} className="hover:opacity-70">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-paa-navy mb-4">Select rejection reason(s):</p>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto bg-gray-50 p-3 border border-paa-navy/5">
                {BOOK_REJECTION_REASONS.map((reason) => (
                  <label key={reason} className="flex items-start gap-3 cursor-pointer text-sm font-medium text-paa-navy hover:text-paa-gold">
                    <input
                      type="checkbox"
                      className="mt-0.5 accent-paa-navy"
                      checked={rejectBookReasons.includes(reason)}
                      onChange={(e) => {
                        if (e.target.checked) setRejectBookReasons([...rejectBookReasons, reason]);
                        else setRejectBookReasons(rejectBookReasons.filter(r => r !== reason));
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
                  value={otherBookReason}
                  onChange={(e) => setOtherBookReason(e.target.value)}
                  placeholder="Enter additional reason..."
                  className="w-full border border-paa-navy/20 p-2 text-sm outline-none focus:border-paa-navy"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setRejectBookTarget(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-paa-navy font-bold uppercase tracking-widest">
                  Cancel
                </button>
                <button onClick={handleRejectBookSubmit} disabled={loadingAction === `rejectBook_${rejectBookTarget.id}`} className="px-6 py-2 bg-[#d9534f] hover:bg-[#c9302c] text-white text-xs font-bold uppercase tracking-widest shadow transition-colors disabled:opacity-50 rounded-full active:scale-95 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out">
                  {loadingAction === `rejectBook_${rejectBookTarget.id}` ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Author Modal */}
      <Modal isOpen={isEditAuthorModalOpen} onClose={() => { setIsEditAuthorModalOpen(false); setEditingAuthor(null); }} title="Edit Author Profile">
        {editingAuthor && (
          <form className="space-y-4" onSubmit={handleUpdateAuthor}>
            <div>
              <label className="dash-label">Full Name</label>
              <input required type="text" value={editingAuthor.name} onChange={(e) => setEditingAuthor({ ...editingAuthor, name: e.target.value })} className="dash-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="dash-label">Phone</label>
                <input type="text" value={editingAuthor.phone} onChange={(e) => setEditingAuthor({ ...editingAuthor, phone: e.target.value })} className="dash-input" />
              </div>
              <div>
                <label className="dash-label">WhatsApp</label>
                <input type="text" value={editingAuthor.whatsapp} onChange={(e) => setEditingAuthor({ ...editingAuthor, whatsapp: e.target.value })} className="dash-input" />
              </div>
            </div>
            <div>
              <label className="dash-label">Author Bio</label>
              <textarea required value={editingAuthor.bio} onChange={(e) => setEditingAuthor({ ...editingAuthor, bio: e.target.value })} className="dash-input" rows={5} />
            </div>
            <button type="submit" disabled={loadingAction === 'updateAuthor'} className="dash-btn dash-btn-primary w-full justify-center py-3">
              {loadingAction === 'updateAuthor' ? 'Updating...' : 'Save Author Profile'}
            </button>
          </form>
        )}
      </Modal>

    </div>
  );
}


const HelpdeskTab = ({ refreshTrigger }: any) => {
  const [queries, setQueries] = useState<any[]>([]);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [isReplying, setIsReplying] = useState<{ [key: number]: boolean }>({});

  const fetchQueries = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/queries`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setQueries(res.data);
    } catch (e) {
      toast.error('Failed to load queries');
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleReply = async (id: number) => {
    if (!replyText[id]) return;
    setIsReplying({ ...isReplying, [id]: true });
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/queries/${id}/reply`, { reply: replyText[id] }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Reply sent successfully!');
      fetchQueries();
    } catch (err) {
      toast.error('Failed to send reply');
    } finally {
      setIsReplying({ ...isReplying, [id]: false });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
       <div className="bg-white p-8 border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out rounded-3xl-2xl">
          <div className="flex justify-between items-center mb-6 border-b border-paa-navy/5 pb-4">
             <div>
                <h3 className="text-xl font-serif font-medium text-paa-navy mb-1 flex items-center gap-2">
                   <Users className="w-5 h-5" /> Support Helpdesk
                </h3>
                <p className="text-paa-gray-text text-sm">Manage and respond to author queries.</p>
             </div>
             <button onClick={fetchQueries} className="p-2 border border-paa-navy/20 bg-gray-50 hover:bg-gray-100 rounded-3xl-2xl text-paa-navy transition-colors shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out rounded-full active:scale-95 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out">
                <RefreshCw size={18} />
             </button>
          </div>
          
          <div className="space-y-6">
             {queries.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-8">No queries found.</p>
             ) : queries.map(q => (
                <div key={q.id} className="border border-gray-200 rounded-3xl-2xl p-6 bg-gray-50 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out">
                   <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                      <div>
                         <h4 className="font-bold text-paa-navy text-lg">{q.subject}</h4>
                         <p className="text-xs text-gray-500 mt-1">From: <span className="font-bold">{q.author?.name}</span> ({q.author?.email})</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-3xl-2xl ${q.status === 'Answered' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                        {q.status}
                      </span>
                   </div>
                   <div className="bg-white p-4 rounded-3xl-2xl border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap mb-4 shadow-inner">
                      {q.message}
                   </div>

                   {q.status === 'Pending' ? (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                         <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-2">Write a Reply</label>
                         <textarea 
                           rows={3} 
                           placeholder="Type your reply here..." 
                           className="w-full border border-paa-navy/20 p-3 text-sm outline-none focus:border-paa-navy bg-white rounded-3xl-2xl resize-y mb-3 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out"
                           value={replyText[q.id] || ''}
                           onChange={e => setReplyText({ ...replyText, [q.id]: e.target.value })}
                         />
                         <button 
                           onClick={() => handleReply(q.id)} 
                           disabled={isReplying[q.id]}
                           className="px-6 py-2 bg-paa-navy text-white text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors rounded-3xl-2xl shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out"
                         >
                           {isReplying[q.id] ? 'Sending...' : 'Send Reply'}
                         </button>
                      </div>
                   ) : (
                      <div className="mt-4 pt-4 border-t border-gray-200 bg-green-50/50 p-4 rounded-3xl-2xl">
                         <p className="text-xs font-bold uppercase tracking-widest text-paa-gold mb-2">Your Reply:</p>
                         <p className="text-sm text-gray-800 whitespace-pre-wrap">{q.reply}</p>
                      </div>
                   )}
                </div>
             ))}
          </div>
       </div>
    </div>
   );
};

export default OperationsDashboardPage;

