import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Automatically attach token to all admin requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
import { 
  RefreshCw, Users, BookOpen, Calendar as CalendarIcon, Settings, Plus, Search, 
  Eye, Edit, Trash2, X, BarChart3, Filter, CheckCircle2, XCircle, 
  TrendingUp, Bell, MapPin, MoreVertical, Check, CreditCard, Menu,
  ShoppingCart, Package, LogOut, ArrowLeft, ClipboardList, Image as ImageIcon, ChevronDown
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import pastEventsData from './data/past_events.json';

const AuthorFullProfileView = ({ author, onBack }: { author: any, onBack: () => void }) => {
  const [activeProfileTab, setActiveProfileTab] = useState<'inventory' | 'orders' | 'events' | 'distribution' | 'forms'>('inventory');
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
    <div className="p-8 bg-white border border-paa-navy/10 shadow-sm space-y-6">
       <div className="flex gap-4 items-center">
          <div className="w-14 h-14 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
       </div>
       <div className="h-64 bg-gray-200 animate-pulse rounded w-full"></div>
    </div>
  );
  if (!profileData) return <div className="p-8 text-center text-red-500 font-bold bg-white border border-red-200">Error loading author details.</div>;

  const { authorProfile, authorOrders } = profileData;

  return (
    <div className="bg-white border border-paa-navy/10 shadow-sm flex flex-col">
      <div className="p-6 border-b border-paa-navy/10 bg-[#e4ebf5] flex items-start justify-between">
         <div className="flex gap-4 items-center">
            <button onClick={onBack} className="p-2 bg-white border border-paa-navy/20 hover:bg-gray-50 rounded shadow-sm transition-colors">
               <ArrowLeft className="w-5 h-5 text-paa-navy" />
            </button>
            <div className="w-14 h-14 bg-white border border-paa-navy/10 text-paa-navy flex items-center justify-center font-bold font-serif text-3xl shadow-sm">
              {authorProfile.name.charAt(0)}
            </div>
            <div>
               <h2 className="text-2xl font-bold text-paa-navy uppercase tracking-widest">{authorProfile.name}</h2>
               <p className="text-sm font-medium text-paa-gray-text">{authorProfile.email} | {authorProfile.phone}</p>
               <p className="text-xs text-paa-navy mt-1 uppercase tracking-widest font-bold bg-[#b3d4ff] inline-block px-2 py-0.5">Joined: {new Date(authorProfile.createdAt).toLocaleDateString()}</p>
            </div>
         </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1">
        <div className="w-full md:w-56 bg-white border-b md:border-b-0 md:border-r border-paa-navy/10 p-4 flex flex-col gap-2 shrink-0 md:sticky md:top-0 h-fit text-xs font-bold uppercase tracking-widest">
           <button onClick={() => setActiveProfileTab('inventory')} className={`text-left px-4 py-3 transition-colors ${activeProfileTab === 'inventory' ? 'bg-paa-navy text-white' : 'text-paa-gray-text hover:bg-gray-100 hover:text-paa-navy'}`}>Inventory</button>
           <button onClick={() => setActiveProfileTab('orders')} className={`text-left px-4 py-3 transition-colors ${activeProfileTab === 'orders' ? 'bg-paa-navy text-white' : 'text-paa-gray-text hover:bg-gray-100 hover:text-paa-navy'}`}>Web Orders</button>
           <button onClick={() => setActiveProfileTab('events')} className={`text-left px-4 py-3 transition-colors ${activeProfileTab === 'events' ? 'bg-paa-navy text-white' : 'text-paa-gray-text hover:bg-gray-100 hover:text-paa-navy'}`}>Events</button>
           <button onClick={() => setActiveProfileTab('distribution')} className={`text-left px-4 py-3 transition-colors ${activeProfileTab === 'distribution' ? 'bg-paa-navy text-white' : 'text-paa-gray-text hover:bg-gray-100 hover:text-paa-navy'}`}>Distribution</button>
           <button onClick={() => setActiveProfileTab('forms')} className={`text-left px-4 py-3 transition-colors ${activeProfileTab === 'forms' ? 'bg-paa-navy text-white' : 'text-paa-gray-text hover:bg-gray-100 hover:text-paa-navy'}`}>Forms</button>
        </div>
        
        <div className="flex-1 p-6 bg-gray-50/50 min-h-[500px]">
        {activeProfileTab === 'inventory' && (
        <div id="inventory">
          <h3 className="text-sm font-bold tracking-widest uppercase text-paa-navy mb-4 border-l-4 border-paa-navy pl-2">Books & Inventory</h3>
          <div className="overflow-x-auto bg-white border border-paa-navy/10 shadow-sm">
            <table className="w-full text-left text-sm whitespace-nowrap">
               <thead className="bg-[#b3d4ff] text-paa-navy text-xs uppercase tracking-widest font-bold">
                 <tr>
                   <th className="px-4 py-3">Title</th>
                   <th className="px-4 py-3 text-center">MRP</th>
                   <th className="px-4 py-3 text-center">Stock</th>
                   <th className="px-4 py-3 text-center">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-paa-navy/5">
                 {authorProfile.books.length === 0 ? <tr><td colSpan={4} className="text-center py-4 text-paa-gray-text">No books published.</td></tr> : authorProfile.books.map((b: any) => (
                   <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                     <td className="px-4 py-3 font-bold text-paa-navy">{b.title} <span className="text-xs text-gray-500 font-medium block">{b.genre}</span></td>
                     <td className="px-4 py-3 text-center font-bold text-paa-navy">₹{b.mrp}</td>
                     <td className="px-4 py-3 text-center font-bold text-paa-navy">{b.stock}</td>
                     <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${b.status === 'Approved' ? 'bg-[#5cb85c]/10 text-green-700 border-[#4cae4c]/30' : 'bg-yellow-100 text-yellow-700 border-yellow-300'}`}>
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
          <h3 className="text-sm font-bold tracking-widest uppercase text-paa-navy mb-4 border-l-4 border-paa-navy pl-2">Web Orders</h3>
          <div className="overflow-x-auto bg-white border border-paa-navy/10 shadow-sm">
            <table className="w-full text-left text-sm whitespace-nowrap">
               <thead className="bg-[#ccffcc] text-paa-navy text-xs uppercase tracking-widest font-bold">
                 <tr>
                   <th className="px-4 py-3">Order ID</th>
                   <th className="px-4 py-3">Customer</th>
                   <th className="px-4 py-3">Book</th>
                   <th className="px-4 py-3 text-center">Qty / Amt</th>
                   <th className="px-4 py-3 text-center">Status</th>
                   <th className="px-4 py-3 text-center">Payment</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-paa-navy/5">
                 {authorOrders.length === 0 ? <tr><td colSpan={6} className="text-center py-4 text-paa-gray-text">No web orders yet.</td></tr> : authorOrders.map((o: any) => (
                   <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                     <td className="px-4 py-3 font-bold text-paa-navy">ORD-{o.orderId}<span className="text-[10px] block text-gray-500">{o.date}</span></td>
                     <td className="px-4 py-3 font-medium text-paa-navy">{o.customerName}</td>
                     <td className="px-4 py-3 font-medium text-paa-navy">{o.bookTitle}</td>
                     <td className="px-4 py-3 text-center font-bold text-paa-navy">{o.quantity} <span className="text-gray-400 font-medium px-1">/</span> ₹{o.amount}</td>
                     <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${o.status === 'Completed' ? 'bg-[#5cb85c] text-white border-[#4cae4c]' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                          {o.status}
                        </span>
                     </td>
                     <td className="px-4 py-3 text-center">
                        {o.paymentVerified ? <span className="text-green-600 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1"><Check size={10}/> Verified</span> : o.paymentFailed ? <span className="text-red-600 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1"><XCircle size={10}/> Failed</span> : <span className="text-yellow-600 font-bold text-[10px] uppercase tracking-widest">Pending</span>}
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
          <h3 className="text-sm font-bold tracking-widest uppercase text-paa-navy mb-4 border-l-4 border-paa-navy pl-2">Event Participations</h3>
          <div className="overflow-x-auto bg-white border border-paa-navy/10 shadow-sm">
            <table className="w-full text-left text-sm whitespace-nowrap">
               <thead className="bg-[#e4ebf5] text-paa-navy text-xs uppercase tracking-widest font-bold">
                 <tr>
                   <th className="px-4 py-3">Event Name</th>
                   <th className="px-4 py-3">City</th>
                   <th className="px-4 py-3 text-center">Amount Paid</th>
                   <th className="px-4 py-3 text-center">Date</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-paa-navy/5">
                 {authorProfile.eventRegistrations.length === 0 ? <tr><td colSpan={4} className="text-center py-4 text-paa-gray-text">No events attended.</td></tr> : authorProfile.eventRegistrations.map((e: any) => (
                   <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                     <td className="px-4 py-3 font-bold text-paa-navy">{e.activity?.name}</td>
                     <td className="px-4 py-3 font-medium text-paa-navy">{e.activity?.city}</td>
                     <td className="px-4 py-3 text-center font-bold text-green-700">₹{e.amount}</td>
                     <td className="px-4 py-3 text-center font-medium text-paa-gray-text">{e.activity?.date}</td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </div>
        )}

        {activeProfileTab === 'distribution' && (
        <div id="distribution">
          <h3 className="text-sm font-bold tracking-widest uppercase text-paa-navy mb-4 border-l-4 border-paa-navy pl-2">Books Distribution Record</h3>
          <div className="overflow-x-auto bg-white border border-paa-navy/10 shadow-sm">
            <table className="w-full text-left text-sm whitespace-nowrap">
               <thead className="bg-[#5bc0de] text-white text-xs uppercase tracking-widest font-bold">
                 <tr>
                   <th className="px-4 py-3">Title</th>
                   <th className="px-4 py-3 text-center">Qty Sold</th>
                   <th className="px-4 py-3 text-center">Airport Stock</th>
                   <th className="px-4 py-3 text-center">Fair Stock</th>
                   <th className="px-4 py-3 text-center">In Stock</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-paa-navy/5">
                 {authorProfile.books.length === 0 ? <tr><td colSpan={5} className="text-center py-4 text-paa-gray-text">No distribution records.</td></tr> : authorProfile.books.map((b: any) => {
                   const qtySold = authorOrders.filter((o: any) => o.bookTitle === b.title && (o.status === 'Completed' || o.status === 'Dispatched')).reduce((acc: number, curr: any) => acc + curr.quantity, 0);
                   return (
                   <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                     <td className="px-4 py-3 font-bold text-paa-navy">{b.title}</td>
                     <td className="px-4 py-3 text-center font-bold text-green-700">{qtySold}</td>
                     <td className="px-4 py-3 text-center">{b.airportStock || 0}</td>
                     <td className="px-4 py-3 text-center">{b.fairStock || 0}</td>
                     <td className="px-4 py-3 text-center font-bold">{b.stock}</td>
                   </tr>
                 )})}
               </tbody>
            </table>
          </div>
        </div>
        )}

        {activeProfileTab === 'forms' && (
        <div id="forms">
          <h3 className="text-sm font-bold tracking-widest uppercase text-paa-navy mb-4 border-l-4 border-paa-navy pl-2">Author Registration Data</h3>
          <div className="bg-white border border-paa-navy/10 shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <p className="text-xs font-bold uppercase tracking-widest text-paa-gray-text mb-1">Full Name</p>
                <p className="text-sm font-medium text-paa-navy border-b pb-2">{authorProfile.name}</p>
             </div>
             <div>
                <p className="text-xs font-bold uppercase tracking-widest text-paa-gray-text mb-1">Email Address</p>
                <p className="text-sm font-medium text-paa-navy border-b pb-2">{authorProfile.email}</p>
             </div>
             <div>
                <p className="text-xs font-bold uppercase tracking-widest text-paa-gray-text mb-1">Phone Number</p>
                <p className="text-sm font-medium text-paa-navy border-b pb-2">{authorProfile.phone}</p>
             </div>
             <div>
                <p className="text-xs font-bold uppercase tracking-widest text-paa-gray-text mb-1">WhatsApp Number</p>
                <p className="text-sm font-medium text-paa-navy border-b pb-2">{authorProfile.whatsapp || 'Not Provided'}</p>
             </div>
             <div className="md:col-span-2">
                <p className="text-xs font-bold uppercase tracking-widest text-paa-gray-text mb-1">Author Bio</p>
                <p className="text-sm font-medium text-paa-navy bg-gray-50 p-4 border rounded leading-relaxed">{authorProfile.bio || 'No biography provided.'}</p>
             </div>
             
             {authorProfile.extraData && Object.keys(authorProfile.extraData).length > 0 && (
                <div className="md:col-span-2 mt-4">
                   <p className="text-xs font-bold uppercase tracking-widest text-paa-gray-text mb-2 border-b pb-1">Additional Required Details</p>
                   <div className="grid grid-cols-2 gap-4">
                     {Object.entries(authorProfile.extraData).map(([key, val]) => (
                        <div key={key}>
                           <p className="text-xs font-bold uppercase tracking-widest text-paa-gray-text mb-1">{key}</p>
                           <p className="text-sm font-medium text-paa-navy">{String(val)}</p>
                        </div>
                     ))}
                   </div>
                </div>
             )}

             <div className="md:col-span-2 mt-4">
                <p className="text-xs font-bold uppercase tracking-widest text-paa-gray-text mb-2 border-b pb-1">Registration Payment Details</p>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-paa-gray-text mb-1">Transaction ID</p>
                      <p className="text-sm font-medium text-paa-navy">{authorProfile.transactionId || 'No Transaction ID Provided'}</p>
                   </div>
                   <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-paa-gray-text mb-1">Payment Screenshot</p>
                      {authorProfile.paymentScreenshot ? (
                         <a href={import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + authorProfile.paymentScreenshot : "http://localhost:3001" + authorProfile.paymentScreenshot} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 underline hover:text-blue-800">
                            View Uploaded Receipt
                         </a>
                      ) : (
                         <p className="text-sm font-medium text-red-500">No Receipt Uploaded</p>
                      )}
                   </div>
                </div>
             </div>
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
  const [activeTab, setActiveTab] = useState<'overview' | 'authors' | 'books' | 'events' | 'orders' | 'settings' | 'forms' | 'gallery' | 'author_data' | 'helpdesk'>('overview');
  const [selectedBookDetails, setSelectedBookDetails] = useState<any>(null);
  const [pendingAlerts, setPendingAlerts] = useState({ orders: false, queries: false, authors: false, books: false });
  const prevCountsRef = React.useRef({ orders: 0, queries: 0, authors: 0, books: 0 });
  const prevQueryCountRef = useRef<number>(0);
  const prevOrderCountRef = useRef<number>(0);
  
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
  const [eventReportData, setEventReportData] = useState<any[]>([]);
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
      setReportEventId(eventId);
      return;
    }
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/events/${eventId}/report`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.status === 'pending') {
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
    setEditingEvent({ id: event.id, name: event.name, date: event.date, duration: event.duration, location: event.location, status: event.status });
    setIsEditEventModalOpen(true);
  };

  const handleEditEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    try {
      await axios.put(`${API}/api/admin/events/${editingEvent.id}`, editingEvent, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
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
         setHasNewOrders(true);
      }
      prevOrderCountRef.current = newCount;
      w.__apiCache.adminOrders = res.data;
      
      setOrders(res.data);
      const c = res.data.filter((o: any) => o.status === 'Pending').length; if (c > prevCountsRef.current.orders) setPendingAlerts(prev => ({ ...prev, orders: true })); prevCountsRef.current.orders = c;
    } catch(err) {} finally { if (!background) setIsRefreshing(false); }
  };


  const fetchQueriesAlert = async () => {
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
      await axios.post(`${API}/api/admin/authors/${id}/approve`);
      toast.success('Author Approved!');
      fetchAuthors();
    } catch(err) {
      toast.error('Failed to approve author');
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
    try {
      await axios.post(`${API}/api/admin/authors/${rejectAuthorTarget.id}/reject`, { reason });
      toast.success('Author Rejected');
      setRejectAuthorTarget(null);
      fetchAuthors();
    } catch (err) {
      toast.error('Failed to reject author');
    }
  };

  const handleEditAuthorClick = (author: any) => {
    setEditingAuthor({ id: author.id, name: author.name, bio: author.bio || '', phone: author.phone || '', whatsapp: author.whatsapp || '' });
    setIsEditAuthorModalOpen(true);
  };

  const handleUpdateAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAuthor) return;
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
    try {
      await axios.post(`${API}/api/admin/books/${id}/approve`);
      fetchBooks();
    } catch (err) {
      alert("Failed to approve book");
    }
  };

  const handleRejectBook = async (id: number) => {
    const reason = window.prompt("Please provide a reason for rejecting this book:");
    if (reason === null) return; // User cancelled
    try {
      await axios.post(`${API}/api/admin/books/${id}/reject`, { reason });
      fetchBooks();
    } catch (err) {
      alert("Failed to reject book");
    }
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
    }
  };

  const handleVerifyOrder = async (id: number) => {
    if (window.confirm('Are you sure you want to verify this payment?')) {
      await axios.post(`${API}/api/admin/orders/${id}/verify`);
      fetchOrders();
      setSelectedOrder(null);
    }
  };

  const handleRejectOrder = async (id: number) => {
    if (window.confirm('Are you sure you want to mark this payment as not received?')) {
      await axios.post(`${API}/api/admin/orders/${id}/reject-payment`);
      fetchOrders();
      setSelectedOrder(null);
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

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Authors', value: stats.totalAuthors, trend: '+12%', trendUp: true, icon: Users, color: 'bg-[#5bc0de]' },
          { label: 'Books Published', value: stats.totalBooks, trend: '+8 new', trendUp: true, icon: BookOpen, color: 'bg-[#5cb85c]' },
          { label: 'Event Participations', value: stats.eventParticipations, trend: '+45 this month', trendUp: true, icon: CalendarIcon, color: 'bg-[#f0ad4e]' },
          { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, trend: '+15.3%', trendUp: true, icon: TrendingUp, color: 'bg-[#d9534f]' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 border border-paa-navy/10 flex items-start justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-paa-gray-text mb-1">{kpi.label}</p>
              <h3 className="text-3xl font-serif font-medium text-paa-navy mb-2">{kpi.value}</h3>
              <p className={`text-xs font-bold flex items-center gap-1 ${kpi.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 transform rotate-180" />}
                {kpi.trend}
              </p>
            </div>
            <div className={`w-10 h-10 flex items-center justify-center text-white font-bold ${kpi.color}`}>
              <kpi.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-0 border border-paa-navy/10 shadow-sm flex flex-col">
           <div className="bg-[#e4ebf5] px-6 py-4 border-b border-paa-navy/10 flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-widest uppercase text-paa-navy">Revenue & Registrations</h3>
              <select className="text-xs border border-paa-navy/20 bg-white text-paa-navy px-3 py-1.5 outline-none font-bold uppercase tracking-widest">
                <option>Last 6 Months</option>
                <option>This Year</option>
              </select>
           </div>
           <div className="h-[300px] p-6">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={stats.revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#0b1a2e" stopOpacity={0.1}/>
                     <stop offset="95%" stopColor="#0b1a2e" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(11, 26, 46, 0.1)" />
                 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                 <RechartsTooltip 
                   contentStyle={{ borderRadius: '0px', border: '1px solid rgba(11,26,46,0.1)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   cursor={{ stroke: 'rgba(11,26,46,0.1)', strokeWidth: 2 }}
                 />
                 <Area type="monotone" dataKey="revenue" stroke="#0b1a2e" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-0 border border-paa-navy/10 shadow-sm flex flex-col">
           <div className="bg-[#ffff99] px-6 py-4 border-b border-paa-navy/10 flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-widest uppercase text-paa-navy">Recent Activity</h3>
              <button className="text-xs font-bold text-paa-navy hover:underline uppercase tracking-widest">View All</button>
           </div>
           <div className="p-6 space-y-6 overflow-auto">
             {stats.recentActivities && stats.recentActivities.map((activity: any) => {
               const style = activity.type === 'author' ? { icon: Users, color: 'text-blue-600', bg: 'bg-[#b3d4ff]' } :
                             activity.type === 'order' ? { icon: CreditCard, color: 'text-green-600', bg: 'bg-[#ccffcc]' } :
                             activity.type === 'event' ? { icon: CalendarIcon, color: 'text-purple-600', bg: 'bg-purple-200' } :
                             { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-200' };
               const Icon = style.icon;
               return (
               <div key={activity.id} className="flex gap-4">
                 <div className={`w-10 h-10 flex items-center justify-center shrink-0 ${style.bg} ${style.color} border border-paa-navy/10`}>
                   <Icon className="w-4 h-4" />
                 </div>
                 <div>
                   <p className="text-sm font-bold text-paa-navy">{activity.action}</p>
                   <p className="text-xs text-paa-gray-text mt-0.5 font-medium">{activity.subject}</p>
                   <p className="text-[10px] uppercase tracking-widest text-paa-gray-text mt-1">{new Date(activity.createdAt).toLocaleString()}</p>
                 </div>
               </div>
             )})}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sales by Author */}
        <div className="bg-white p-0 border border-paa-navy/10 shadow-sm flex flex-col">
           <div className="bg-[#ccffcc] px-6 py-4 border-b border-paa-navy/10 flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-widest uppercase text-paa-navy">Top Authors by Sales</h3>
           </div>
           <div className="p-6 space-y-4 overflow-auto max-h-[300px]">
             {stats.salesByAuthor && stats.salesByAuthor.map((author: any, i: number) => (
               <div key={i} className="flex justify-between items-center border-b border-paa-navy/5 pb-2">
                 <div>
                   <p className="text-sm font-bold text-paa-navy">{author.name}</p>
                   <p className="text-xs text-paa-gray-text">{author.units} units sold</p>
                 </div>
                 <p className="text-sm font-bold text-green-700">₹{author.revenue}</p>
               </div>
             ))}
           </div>
        </div>

        {/* Top Selling Books */}
        <div className="bg-white p-0 border border-paa-navy/10 shadow-sm flex flex-col">
           <div className="bg-[#b3d4ff] px-6 py-4 border-b border-paa-navy/10 flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-widest uppercase text-paa-navy">Top Selling Books</h3>
           </div>
           <div className="p-6 space-y-4 overflow-auto max-h-[300px]">
             {stats.topSellingBooks && stats.topSellingBooks.map((book: any, i: number) => (
               <div key={i} className="flex justify-between items-center border-b border-paa-navy/5 pb-2">
                 <div>
                   <p className="text-sm font-bold text-paa-navy truncate max-w-[150px]">{book.title}</p>
                   <p className="text-xs text-paa-gray-text truncate max-w-[150px]">{book.author}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-sm font-bold text-paa-navy">{book.units} units</p>
                   <p className="text-xs text-green-600 font-bold">₹{book.revenue}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-0 border border-paa-navy/10 shadow-sm flex flex-col">
           <div className="bg-[#ffcccc] px-6 py-4 border-b border-paa-navy/10 flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-widest uppercase text-paa-navy">Low Stock Alerts</h3>
           </div>
           <div className="p-6 space-y-4 overflow-auto max-h-[300px]">
             {stats.lowStockAlerts && stats.lowStockAlerts.length > 0 ? stats.lowStockAlerts.map((book: any, i: number) => (
               <div key={i} className="flex justify-between items-center border-b border-paa-navy/5 pb-2">
                 <div>
                   <p className="text-sm font-bold text-paa-navy truncate max-w-[150px]">{book.title}</p>
                   <p className="text-xs text-paa-gray-text truncate max-w-[150px]">{book.author?.name}</p>
                 </div>
                 <span className={`px-2 py-1 text-xs font-bold rounded ${book.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                   {book.stock} left
                 </span>
               </div>
             )) : (
               <p className="text-sm text-paa-gray-text text-center py-8">All books are sufficiently stocked.</p>
             )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales by Genre */}
        <div className="bg-white p-0 border border-paa-navy/10 shadow-sm flex flex-col">
           <div className="bg-[#e4ebf5] px-6 py-4 border-b border-paa-navy/10 flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-widest uppercase text-paa-navy">Sales by Genre</h3>
           </div>
           <div className="p-6 space-y-4 overflow-auto max-h-[300px]">
             {stats.salesByGenre && stats.salesByGenre.map((genre: any, i: number) => (
               <div key={i} className="flex justify-between items-center border-b border-paa-navy/5 pb-2">
                 <div>
                   <p className="text-sm font-bold text-paa-navy">{genre.name}</p>
                   <p className="text-xs text-paa-gray-text">{genre.units} units sold</p>
                 </div>
                 <p className="text-sm font-bold text-paa-navy">₹{genre.revenue}</p>
               </div>
             ))}
           </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white p-0 border border-paa-navy/10 shadow-sm flex flex-col">
           <div className="bg-[#ffff99] px-6 py-4 border-b border-paa-navy/10 flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-widest uppercase text-paa-navy">Top Customers</h3>
           </div>
           <div className="p-6 space-y-4 overflow-auto max-h-[300px]">
             {stats.topCustomers && stats.topCustomers.map((customer: any, i: number) => (
               <div key={i} className="flex justify-between items-center border-b border-paa-navy/5 pb-2">
                 <div>
                   <p className="text-sm font-bold text-paa-navy">{customer.name}</p>
                   <p className="text-xs text-paa-gray-text">{customer.email}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-sm font-bold text-green-700">₹{customer.totalSpent}</p>
                   <p className="text-xs text-paa-gray-text">{customer.ordersCount} orders</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );

  const AuthorsTab = ({ refreshTrigger }: any) => {
    if (selectedAuthor) {
      return <AuthorFullProfileView author={selectedAuthor} onBack={() => setSelectedAuthor(null)} />;
    }
    
    return (
    <div className="bg-white border border-paa-navy/10 shadow-sm flex flex-col">
       <div className="p-4 border-b border-paa-navy/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#e4ebf5]">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold tracking-widest uppercase text-paa-navy">Authors Directory</h3>
            <span className="bg-white text-paa-navy border border-paa-navy/20 py-0.5 px-2 text-xs font-bold shadow-sm">{authors.length} Total</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 rounded p-1">
                  {['All', 'Pending', 'Active', 'Rejected'].map(status => (
                    <button 
                      key={status}
                      onClick={() => setAuthorStatusFilter(status)}
                      className={`px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-colors rounded ${authorStatusFilter === status ? 'bg-white text-paa-navy shadow-sm' : 'text-gray-500 hover:text-paa-navy'}`}
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
             {/* <button onClick={() => setIsAuthorModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-paa-navy text-paa-cream text-xs font-bold tracking-widest uppercase hover:bg-paa-gold hover:text-paa-navy border border-paa-navy hover:border-paa-gold transition-colors">
               <Plus className="w-4 h-4" /> Add Author
             </button> */}
          </div>
       </div>
       
       <div className="overflow-x-auto">
         <table className="w-full text-left text-sm whitespace-nowrap">
           <thead className="bg-[#b3d4ff] text-paa-navy text-xs uppercase tracking-widest font-bold">
             <tr>
               <th className="px-6 py-4">Author Details</th>
               <th className="px-6 py-4">Contact</th>
               <th className="px-6 py-4">Payment Info</th>
               <th className="px-6 py-4 text-center">Status</th>
               <th className="px-6 py-4 text-center">Books</th>
               <th className="px-6 py-4 text-center">Events</th>
               <th className="px-6 py-4 text-center">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-paa-navy/5">
             {authors.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) && (authorStatusFilter === 'All' || a.status === authorStatusFilter)).map((author) => (
               <tr key={author.id} className="hover:bg-gray-50 bg-white transition-colors">
                 <td className="px-6 py-4">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-[#e4ebf5] border border-paa-navy/10 text-paa-navy flex items-center justify-center font-bold font-serif text-lg">
                       {author.name.charAt(0)}
                     </div>
                     <div>
                       <p className="font-bold text-paa-navy">{author.name}</p>
                       <p className="text-xs text-paa-gray-text flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3"/> Joined {author.joined}</p>
                     </div>
                   </div>
                 </td>
                 <td className="px-6 py-4">
                    <p className="text-paa-navy font-medium">{author.email}</p>
                    <p className="text-paa-gray-text text-xs mt-0.5 font-medium">{author.phone}</p>
                 </td>
                 <td className="px-6 py-4">
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
                 <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${author.status === 'Active' ? 'bg-[#5cb85c] text-white border-[#4cae4c]' : author.status === 'Rejected' ? 'bg-[#d9534f] text-white border-[#c9302c]' : 'bg-[#f0ad4e] text-white border-[#eea236]'}`}>
                      {author.status}
                    </span>
                 </td>
                 <td className="px-6 py-4 text-center font-bold text-paa-navy bg-gray-50 border-x border-paa-navy/5">
                    {author.totalBooks}
                 </td>
                 <td className="px-6 py-4 text-center font-bold text-paa-navy">
                    {author.eventsPart}
                 </td>
                 <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                       {author.status === 'Pending' && (
                         <>
                           <button onClick={() => handleApproveAuthor(author.id)} className="p-1.5 text-white bg-[#5cb85c] hover:bg-[#4cae4c] border border-[transparent] shadow" title="Approve">
                             <Check className="w-4 h-4" />
                           </button>
                           <button onClick={() => openRejectAuthorModal(author)} className="p-1.5 text-white bg-orange-500 hover:bg-orange-600 border border-[transparent] shadow" title="Reject">
                             <X className="w-4 h-4" />
                           </button>
                         </>
                       )}
                       <button onClick={() => handleEditAuthorClick(author)} className="p-1.5 text-white bg-blue-500 hover:bg-blue-600 border border-[transparent] shadow" title="Edit Profile">
                         <Edit className="w-4 h-4" />
                       </button>
                       <button onClick={() => setSelectedAuthor(author)} className="p-1.5 text-paa-navy bg-gray-100 hover:bg-gray-200 border border-paa-navy/10 transition-colors shadow" title="Details">
                         <Eye className="w-4 h-4" />
                       </button>
                       <button onClick={() => handleDeleteAuthor(author.id)} className="p-1.5 text-white bg-[#d9534f] hover:bg-[#c9302c] transition-colors shadow" title="Delete">
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                    {author.status === 'Rejected' && author.rejectionReason && (
                      <div className="mt-1 text-[10px] text-red-600 font-medium max-w-[200px] text-left leading-tight">
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

  const BooksTab = () => (
    <div className="bg-white border border-paa-navy/10 shadow-sm flex flex-col">
       <div className="p-4 border-b border-paa-navy/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#ccffcc]">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold tracking-widest uppercase text-paa-navy">Inventory Management</h3>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 rounded p-1">
                  {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                    <button 
                      key={status}
                      onClick={() => setBookStatusFilter(status)}
                      className={`px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-colors rounded ${bookStatusFilter === status ? 'bg-white text-paa-navy shadow-sm' : 'text-gray-500 hover:text-paa-navy'}`}
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
         <table className="w-full text-left text-sm whitespace-nowrap">
           <thead className="bg-[#b3d4ff] text-paa-navy text-xs uppercase tracking-widest font-bold">
             <tr>
               <th className="px-6 py-4">Book Info</th>
               <th className="px-6 py-4">Author</th>
               <th className="px-6 py-4 text-center">Status</th>
               <th className="px-6 py-4 text-center">Price</th>
               <th className="px-6 py-4 text-center bg-yellow-100 border-x border-paa-navy/10">Stock</th>
               <th className="px-6 py-4 text-center bg-green-100">Sales</th>
               <th className="px-6 py-4 text-center">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-paa-navy/5">
             {books.filter(b => (bookStatusFilter === 'All' || b.status === bookStatusFilter)).map((book) => (
               <tr key={book.id} className="hover:bg-gray-50 bg-white transition-colors">
                 <td className="px-6 py-4">
                   <p className="font-bold text-paa-navy mb-1">{book.title}</p>
                   <div className="flex items-center gap-2 text-xs font-medium">
                     <span className="text-[#5bc0de] font-bold uppercase">{book.genre}</span>
                   </div>
                 </td>
                 <td className="px-6 py-4">
                    <p className="text-paa-navy font-bold">{book.authorName}</p>
                 </td>
                 <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${book.status === 'Approved' ? 'bg-[#5cb85c] text-white border-[#4cae4c]' : book.status === 'Rejected' ? 'bg-[#d9534f] text-white border-[#c9302c]' : 'bg-[#f0ad4e] text-white border-[#eea236]'}`}>
                      {book.status}
                    </span>
                 </td>
                 <td className="px-6 py-4 text-center font-bold text-paa-navy">
                    ₹{book.mrp}
                 </td>
                 <td className="px-6 py-4 text-center bg-yellow-50 border-x border-paa-navy/10">
                    {book.stock > 10 ? (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold uppercase border border-green-200">{book.stock} left</span>
                    ) : book.stock > 0 ? (
                      <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase border border-yellow-200">Only {book.stock} left</span>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-[10px] font-bold uppercase border border-red-200">Out of Stock</span>
                    )}
                 </td>
                 <td className="px-6 py-4 text-center font-bold text-paa-navy bg-green-50">
                    {book.sales}
                 </td>
                 <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                       {book.status === 'Pending' && (
                         <button onClick={() => handleApproveBook(book.id)} className="p-1.5 text-white bg-[#5cb85c] hover:bg-[#4cae4c] border border-[transparent] shadow" title="Approve">
                           <Check className="w-4 h-4" />
                         </button>
                       )}
                       {book.status !== 'Rejected' && (
                         <button onClick={() => handleRejectBook(book.id)} className="p-1.5 text-white bg-orange-500 hover:bg-orange-600 border border-[transparent] shadow" title="Reject">
                           <X className="w-4 h-4" />
                         </button>
                       )}
                       <button onClick={() => setSelectedBookDetails(book)} className="p-1.5 text-white bg-purple-500 hover:bg-purple-600 border border-[transparent] shadow" title="View Details">
                         <Eye className="w-4 h-4" />
                       </button>
                       <button onClick={() => handleEditBookClick(book)} className="p-1.5 text-white bg-blue-500 hover:bg-blue-600 border border-[transparent] shadow" title="Edit Details">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteBook(book.id)} className="p-1.5 text-white bg-[#d9534f] hover:bg-[#c9302c] transition-colors shadow" title="Delete">
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

  const EventsTab = () => (
    <div className="space-y-6">
       <div className="flex items-center justify-between border-b border-paa-navy/10 pb-4">
          <h3 className="text-lg font-serif font-medium text-paa-navy">Events & Fairs Ecosystem</h3>
          <button onClick={() => setIsEventModalOpen(true)} className="flex items-center gap-2 px-6 py-2 bg-paa-navy text-paa-cream text-xs font-bold tracking-widest uppercase hover:bg-paa-gold hover:text-paa-navy border border-paa-navy transition-colors">
            <Plus className="w-4 h-4" /> Create Event
          </button>
       </div>

       <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 border-b pb-2">Active / Upcoming Events</h4>
       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {events.filter(e => e.status === 'Upcoming').map((evt) => (
             <div key={evt.id} className="bg-white border border-paa-navy/10 shadow-sm hover:shadow-md transition-shadow flex flex-col relative overflow-hidden">
                <div className={`${evt.status === 'Upcoming' ? 'bg-blue-600' : 'bg-gray-500'} px-4 py-2 text-white font-bold text-xs uppercase tracking-widest flex justify-between items-center`}>
                   <span>{evt.status}</span>
                   <div className="flex gap-2 items-center">
                     {evt.broadcastStatus === 'AuthorsOnly' && <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">Authors Notified</span>}
                     {evt.broadcastStatus === 'CustomersAlso' && <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">Public</span>}
                     <button onClick={() => handleEditEventClick(evt)} className="p-1 hover:bg-white/20 rounded transition-colors" title="Edit Event"><Edit className="w-3 h-3" /></button>
                     <button onClick={() => handleDeleteEvent(evt.id)} className="p-1 hover:bg-white/20 text-red-200 hover:text-red-100 rounded transition-colors" title="Delete Event"><Trash2 className="w-3 h-3" /></button>
                   </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-serif font-medium text-paa-navy mb-4">{evt.name}</h4>
                  <div className="space-y-3 mb-6 flex-1 text-sm font-medium text-paa-gray-text">
                     <p className="flex items-center gap-3"><CalendarIcon className="w-4 h-4 text-paa-navy/50"/> {evt.date} &bull; {evt.duration}</p>
                     <p className="flex items-center gap-3"><MapPin className="w-4 h-4 text-paa-navy/50"/> {evt.location}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                     <div className="bg-gray-50 p-2 text-center rounded border border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Authors</p>
                        <p className="text-lg font-black text-paa-navy">{evt._count?.eventAuthors || 0}</p>
                     </div>
                     <div className="bg-gray-50 p-2 text-center rounded border border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Books Linked</p>
                        <p className="text-lg font-black text-paa-navy">{evt._count?.eventBooks || 0}</p>
                     </div>
                  </div>

                  <div className="pt-4 border-t border-paa-navy/10 flex flex-col gap-2">
                     <button onClick={() => handleBroadcastEvent(evt.id, 'Authors')} className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest transition-colors border border-blue-200">
                        1. Broadcast to Authors
                     </button>
                     <button onClick={() => handleBroadcastEvent(evt.id, 'Customers')} className="w-full py-2 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold uppercase tracking-widest transition-colors border border-green-200">
                        2. Generate Catalogue & Publish
                     </button>
                     <a href={`/events/${evt.id}/catalogue`} target="_blank" rel="noopener noreferrer" className="block text-center w-full py-2 bg-paa-navy hover:bg-paa-navy/90 text-white text-xs font-bold uppercase tracking-widest transition-colors">
                        View Live Catalogue
                     </a>
                     {evt.status === 'Past' && (
                       <button onClick={() => fetchEventReport(evt.id)} className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-widest transition-colors border border-purple-200 mt-2">
                          View Sales & Settlement Report
                       </button>
                     )}
                  </div>
                </div>
             </div>
          ))}
          {events.filter(e => e.status === 'Upcoming').length === 0 && (
             <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded border border-dashed border-gray-200">
                No upcoming events.
             </div>
          )}
       </div>

       <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 border-b pb-2 mt-12">Past Events Archive</h4>
       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastEventsData.map((evt: any) => (
             <div key={'legacy_'+evt.id} className="bg-gray-50 border border-gray-200 shadow-sm flex flex-col relative overflow-hidden opacity-90">
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
                     <div className="bg-white p-2 text-center rounded border border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Authors</p>
                        <p className="text-lg font-black text-gray-700">{evt.authorsParticipated || 0}</p>
                     </div>
                     <div className="bg-white p-2 text-center rounded border border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Books Sold</p>
                        <p className="text-lg font-black text-gray-700">{evt.booksSold || 0}</p>
                     </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200 flex flex-col gap-2">
                     <button onClick={() => fetchEventReport('legacy_' + evt.id)} className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-widest transition-colors border border-purple-200 shadow-sm">
                        View Legacy Settlement Report
                     </button>
                  </div>
                </div>
             </div>
          ))}
          {events.filter(e => e.status === 'Past').map((evt) => (
             <div key={evt.id} className="bg-gray-50 border border-gray-200 shadow-sm flex flex-col relative overflow-hidden opacity-90">
                <div className="bg-gray-500 px-4 py-2 text-white font-bold text-xs uppercase tracking-widest flex justify-between items-center">
                   <span>{evt.status}</span>
                   <div className="flex gap-2 items-center">
                     <button onClick={() => handleEditEventClick(evt)} className="p-1 hover:bg-white/20 rounded transition-colors" title="Edit Event"><Edit className="w-3 h-3" /></button>
                     <button onClick={() => handleDeleteEvent(evt.id)} className="p-1 hover:bg-white/20 text-red-200 hover:text-red-100 rounded transition-colors" title="Delete Event"><Trash2 className="w-3 h-3" /></button>
                   </div>
                </div>
                <div className="p-6 flex-1">
                  <h4 className="text-xl font-serif font-medium text-paa-navy mb-4">{evt.name}</h4>
                  <div className="space-y-3 mb-6 flex-1 text-sm font-medium text-gray-500">
                     <p className="flex items-center gap-3"><CalendarIcon className="w-4 h-4 text-gray-400"/> {evt.date} &bull; {evt.duration}</p>
                     <p className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-400"/> {evt.location}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                     <div className="bg-white p-2 text-center rounded border border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Authors</p>
                        <p className="text-lg font-black text-gray-700">{evt._count?.eventAuthors || 0}</p>
                     </div>
                     <div className="bg-white p-2 text-center rounded border border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Books Linked</p>
                        <p className="text-lg font-black text-gray-700">{evt._count?.eventBooks || 0}</p>
                     </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 flex flex-col gap-2">
                     <a href={`/events/${evt.id}/catalogue`} target="_blank" rel="noopener noreferrer" className="block text-center w-full py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold uppercase tracking-widest transition-colors">
                        View Past Catalogue
                     </a>
                     <button onClick={() => fetchEventReport(evt.id)} className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-widest transition-colors border border-purple-200 mt-2 shadow-sm">
                        View Sales & Settlement Report
                     </button>
                  </div>
                </div>
             </div>
          ))}
          {events.filter(e => e.status === 'Past').length === 0 && (
             <div className="col-span-full py-8 text-center text-gray-400 bg-gray-50 rounded border border-dashed border-gray-200">
                No past events archived yet.
             </div>
          )}
       </div>
       </div>
    </div>
  );

  const OrdersTab = () => (
    <div className="bg-white border border-paa-navy/10 shadow-sm flex flex-col">
       <div className="p-4 border-b border-paa-navy/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#e4ebf5]">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold tracking-widest uppercase text-paa-navy">Web Orders</h3>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-paa-gray-text" />
                <input type="text" placeholder="SEARCH ORDERS..." className="pl-9 pr-4 py-2 bg-white border border-paa-navy/20 text-xs font-bold tracking-widest uppercase outline-none focus:border-paa-navy transition-colors w-64" />
             </div>
             <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-[#5cb85c] text-white text-xs font-bold tracking-widest uppercase hover:bg-green-600 transition-colors shadow-sm">
               <ClipboardList className="w-4 h-4" /> Export CSV
             </button>
          </div>
       </div>
       
       <div className="overflow-x-auto">
         <table className="w-full text-left text-sm whitespace-nowrap">
           <thead className="bg-[#b3d4ff] text-paa-navy text-xs uppercase tracking-widest font-bold">
             <tr>
               <th className="px-6 py-4">Order ID & Date</th>
               <th className="px-6 py-4">Customer</th>
               <th className="px-6 py-4">Items / Books</th>
               <th className="px-6 py-4 text-center">Amount</th>
               <th className="px-6 py-4 text-center">Status</th>
               <th className="px-6 py-4 text-center">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-paa-navy/5">
             {orders.map((ord) => (
               <tr key={ord.dbId} className="hover:bg-gray-50 bg-white transition-colors">
                 <td className="px-6 py-4">
                   <p className="font-bold text-paa-navy mb-1">{ord.id}</p>
                   <p className="text-xs text-paa-gray-text flex items-center gap-1 font-medium"><CalendarIcon className="w-3 h-3"/> {ord.date}</p>
                 </td>
                 <td className="px-6 py-4 font-bold text-paa-navy">
                    {ord.customer}
                 </td>
                 <td className="px-6 py-4">
                    <ul className="text-xs text-paa-gray-text font-medium space-y-1">
                      {ord.items.map((it: any, idx: number) => (
                        <li key={idx} className="flex gap-2"><span className="text-paa-navy font-bold">{it.qty}x</span> <span>{it.title} <span className="text-gray-400 italic">by {it.authorName}</span></span></li>
                      ))}
                    </ul>
                 </td>
                 <td className="px-6 py-4 text-center font-bold text-paa-navy bg-gray-50">
                    ₹{ord.total}
                 </td>
                 <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${ord.status === 'Completed' ? 'bg-[#5cb85c] text-white border-[#4cae4c]' : ord.status === 'Payment Not Received' ? 'bg-[#d9534f] text-white border-[#c9302c]' : 'bg-[#f0ad4e] text-white border-[#eea236]'}`}>
                      {ord.status === 'Completed' ? 'Payment Verified' : ord.status === 'Payment Not Received' ? 'Payment Failed' : 'Pending Verification'}
                    </span>
                 </td>
                 <td className="px-6 py-4 text-center">
                    <button onClick={() => setSelectedOrder(ord)} className="text-[#5bc0de] text-xs font-bold uppercase tracking-widest hover:text-paa-navy transition-colors">Details</button>
                 </td>
               </tr>
             ))}
             {orders.length === 0 && (
               <tr><td colSpan={6} className="text-center py-8">No orders yet.</td></tr>
             )}
           </tbody>
         </table>
       </div>
    </div>
  );

  const SettingsTab = () => {


    return (
    <div className="space-y-8 max-w-2xl">
      <div className="bg-white p-8 border border-paa-navy/10 shadow-sm">
         <div className="border-b border-paa-navy/10 pb-4 mb-8">
            <h2 className="text-xl font-serif font-medium text-paa-navy mb-1">System Settings</h2>
            <p className="text-paa-gray-text text-sm">Configure global application parameters, notification rules, and access control here.</p>
         </div>
         
         <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-paa-navy mb-2">Platform Name</label>
              <input type="text" defaultValue="Pune Authors' Association" className="w-full border border-paa-navy/20 bg-gray-50 rounded-none p-3 text-sm outline-none focus:border-paa-navy focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-paa-navy mb-2">Support Email</label>
              <input type="email" defaultValue="support@puneauthors.com" className="w-full border border-paa-navy/20 bg-gray-50 rounded-none p-3 text-sm outline-none focus:border-paa-navy focus:bg-white transition-colors" />
            </div>
            
            <div className="pt-6 border-t border-paa-navy/10">
              <h3 className="text-xs font-bold tracking-widest uppercase text-paa-navy mb-4">Default Email Notifications</h3>
              <div className="space-y-4 bg-gray-50 p-4 border border-paa-navy/10">
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-paa-navy/60 p-4 backdrop-blur-sm">
        <div className="bg-white border text-paa-navy border-paa-navy/10 shadow-xl w-full max-w-lg">
          <div className="bg-[#b3d4ff] p-4 font-bold text-xs tracking-widest uppercase flex justify-between items-center border-b border-paa-navy/10">
            {title}
            <button type="button" onClick={onClose} className="text-paa-navy hover:text-black">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
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
    const dynamicKeys = Array.from(new Set(
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
        <div className="bg-white p-6 border border-paa-navy/10 shadow-sm rounded">
          <h3 className="text-xl font-serif font-medium text-paa-navy mb-1">Author Dynamic Fields Management</h3>
          <p className="text-paa-gray-text text-sm mb-6 border-b border-paa-navy/10 pb-4">Define extra information that all authors must provide. This will appear on their dashboard until filled.</p>
          
          <div className="flex flex-wrap gap-3 mb-6">
            {fields.map((f, i) => (
               <div key={i} className="flex items-center gap-2 bg-gray-50 border border-paa-navy/20 px-3 py-1.5 rounded shadow-sm text-sm">
                  <span className="font-bold text-paa-navy">{f.name}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">({f.type})</span>
                  {f.requiredForRegistration && <span className="text-[9px] bg-paa-navy text-white px-1.5 py-0.5 rounded uppercase tracking-widest font-bold">Registration</span>}
                  <button onClick={() => setFields(fields.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 ml-2" title="Remove Field">
                     <X className="w-3.5 h-3.5" />
                  </button>
               </div>
            ))}
            {fields.length === 0 && <p className="text-sm text-gray-500 italic w-full">No dynamic fields created yet.</p>}
          </div>

          <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-4 rounded mb-6 flex flex-col md:flex-row gap-4 items-center">
            <input 
               type="text" 
               placeholder="New Field Name (e.g. Aadhar Number)" 
               className="border border-paa-navy/20 p-2 text-sm flex-1 outline-none focus:border-paa-navy bg-white rounded w-full md:w-auto"
               value={newField.name}
               onChange={e => setNewField({...newField, name: e.target.value})}
            />
            <select 
               className="border border-paa-navy/20 p-2 text-sm outline-none focus:border-paa-navy bg-white rounded"
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
               className="px-4 py-2 border border-paa-navy text-paa-navy bg-white text-xs font-bold uppercase tracking-widest hover:bg-paa-navy hover:text-white transition-colors rounded shadow-sm whitespace-nowrap"
            >
               Add Field
            </button>
          </div>
          
          <div className="flex">
            <button onClick={saveFields} className="px-6 py-2 bg-paa-navy text-white text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors rounded shadow-sm">Save Fields Settings</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded border border-paa-navy/10 shadow-sm">
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
                     className="px-3 py-2 border border-paa-navy/20 bg-gray-50 hover:bg-gray-100 rounded text-paa-navy transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-1"
                   >
                     Columns <ChevronDown className="w-4 h-4" />
                   </button>
                   {showColumnsMenu && (
                     <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded z-20 py-2">
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
               <button onClick={handleExportCSV} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-widest rounded transition-colors shadow">
                  Export CSV
               </button>
               <button onClick={fetchAuthors} className="p-2 border border-paa-navy/20 bg-gray-50 hover:bg-gray-100 rounded text-paa-navy transition-colors shadow-sm">
                  <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
               </button>
            </div>
          </div>

          <div className="border border-paa-navy/10 rounded shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#e4ebf5] text-paa-navy uppercase tracking-widest text-xs border-b border-paa-navy/10">
                  <tr>
                    <th className="px-6 py-4 font-bold">Author Name</th>
                    <th className="px-6 py-4 font-bold">Email</th>
                    {dynamicKeys.filter(k => selectedColumns.includes(k)).map(key => (
                      <th key={key} className="px-6 py-4 font-bold text-paa-gold">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-paa-navy/5">
                  {authors.length === 0 ? (
                    <tr><td colSpan={selectedColumns.length + 2} className="px-6 py-8 text-center text-gray-500 italic">No authors found.</td></tr>
                  ) : authors.map(author => (
                    <tr key={author.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-6 py-4 font-medium text-paa-navy">{author.name}</td>
                      <td className="px-6 py-4 text-gray-500">{author.email}</td>
                      {dynamicKeys.filter(k => selectedColumns.includes(k)).map(key => (
                        <td key={key} className="px-6 py-4 text-gray-700">
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
        <h3 className="text-sm font-bold tracking-widest uppercase text-paa-navy border-l-4 border-paa-navy pl-2">Forms Management</h3>
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
          <div className="overflow-x-auto bg-white border border-paa-navy/10 shadow-sm">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-paa-navy/5 text-xs uppercase font-bold text-paa-navy/60">
                <tr>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Answers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paa-navy/10">
                {selectedFormResponses.responses.map((r: any) => (
                  <tr key={r.id} className="hover:bg-paa-navy/5">
                    <td className="px-4 py-3 font-medium text-paa-navy">{r.author?.name}</td>
                    <td className="px-4 py-3 text-paa-gray-text">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-paa-gray-text max-w-sm truncate">
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
            <div key={f.id} className="p-4 bg-white border border-paa-navy/10 flex flex-col gap-2 hover:shadow-md transition">
              <div className="font-bold text-paa-navy text-lg">{f.title}</div>
              <div className="text-sm text-paa-gray-text">{f.description}</div>
              <div className="text-xs text-paa-gray-text">Fields: {f.fields.length}</div>
              <div className="flex gap-2 mt-4">
                <button 
                  className="px-3 py-1.5 bg-paa-navy/10 text-paa-navy text-xs font-bold uppercase hover:bg-paa-navy hover:text-white transition"
                  onClick={() => {
                    axios.get(`${API}/api/admin/forms/${f.id}/responses`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }})
                      .then(res => setSelectedFormResponses({ formTitle: f.title, responses: res.data }));
                  }}
                >
                  View Responses
                </button>
                <button 
                  className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold uppercase hover:bg-red-600 hover:text-white transition"
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
        <h3 className="text-sm font-bold tracking-widest uppercase text-paa-navy border-l-4 border-paa-navy pl-2">Gallery Management</h3>
        <button 
          onClick={() => setIsGalleryModalOpen(true)}
          className="px-4 py-2 bg-paa-navy text-paa-cream text-xs font-bold uppercase transition hover:bg-paa-gold"
        >
          Add Gallery Event
        </button>
      </div>

      <div className="overflow-x-auto bg-white border border-paa-navy/10 shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-paa-navy/5 text-xs uppercase font-bold text-paa-navy/60">
            <tr>
              <th className="px-4 py-3">Photo</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paa-navy/10">
            {gallery.map((g: any) => (
              <tr key={g.id} className="hover:bg-paa-navy/5 transition-colors">
                <td className="px-4 py-3">
                  <img src={g.photoUrl ? (g.photoUrl.startsWith('http') ? g.photoUrl : `${API}${g.photoUrl}`) : ''} alt="img" className="w-10 h-10 object-cover rounded" />
                </td>
                <td className="px-4 py-3 font-medium text-paa-navy">{g.location}</td>
                <td className="px-4 py-3 text-paa-gray-text">{g.city}</td>
                <td className="px-4 py-3 text-paa-gray-text">{g.type}</td>
                <td className="px-4 py-3 text-paa-gray-text">{new Date(g.date).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <button 
                    onClick={() => setSelectedGalleryEvent(g)}
                    className="text-blue-500 hover:text-blue-700 text-xs font-bold uppercase transition"
                  >
                    Manage Images ({g.images?.length || 0})
                  </button>
                  <button 
                    onClick={() => {
                      setEditingGalleryEvent(g);
                      setIsEditGalleryModalOpen(true);
                    }}
                    className="text-gray-500 hover:text-gray-700 text-xs font-bold uppercase ml-4 transition"
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
                    className="text-red-500 hover:text-red-700 text-xs font-bold uppercase ml-4 transition"
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
      <div className="min-h-screen bg-paa-cream flex flex-col md:flex-row p-6 font-sans">
        <div className="w-64 shrink-0 h-screen hidden md:block space-y-4">
          <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="flex-1 space-y-6 md:pl-6">
          <div className="h-16 bg-gray-200 animate-pulse rounded w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="h-32 bg-gray-200 animate-pulse rounded w-full"></div>
            <div className="h-32 bg-gray-200 animate-pulse rounded w-full"></div>
            <div className="h-32 bg-gray-200 animate-pulse rounded w-full"></div>
            <div className="h-32 bg-gray-200 animate-pulse rounded w-full"></div>
          </div>
          <div className="h-96 bg-gray-200 animate-pulse rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paa-cream flex flex-col md:flex-row font-sans text-paa-navy selection:bg-paa-gold selection:text-white">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 flex flex-col hidden md:flex shrink-0 h-screen sticky top-0 bg-paa-cream">
        <div className="p-6 h-20 flex items-center shrink-0">
          {/* Logo Removed */}
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
           {[
             { id: 'overview', label: 'Overview', icon: BarChart3 },
             { id: 'authors', label: 'Authors Menu', icon: Users, hasAlert: pendingAlerts.authors },
             { id: 'books', label: 'Inventory / Books', icon: BookOpen, hasAlert: pendingAlerts.books },
             { id: 'events', label: 'Events & Fairs', icon: CalendarIcon },
             { id: 'orders', label: 'Web Orders', icon: ShoppingCart, hasAlert: pendingAlerts.orders },
             { id: 'gallery', label: 'Gallery Management', icon: ImageIcon },
             { id: 'author_data', label: 'Author Extra Data', icon: ClipboardList },
             { id: 'helpdesk', label: 'Helpdesk / Queries', icon: Users, hasAlert: pendingAlerts.queries },
             { id: 'settings', label: 'System Settings', icon: Settings },
           ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold tracking-widest uppercase transition-colors border ${
                  activeTab === item.id 
                  ? 'bg-paa-navy text-paa-cream border-paa-navy' 
                  : 'text-paa-navy border-[transparent] hover:bg-paa-navy/5 border border-paa-navy/0 hover:border-paa-navy/10'
                }`}
              >
                <item.icon className="w-4 h-4" /> 
                {item.label}
                {item.hasAlert && (
                   <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-auto shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                )}
              </button>
           ))}
        </nav>

        <div className="p-4 shrink-0 flex gap-2">
           <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-paa-navy/10 bg-white text-xs font-bold uppercase hover:bg-red-50 text-red-600 transition-colors">
              <LogOut size={14} /> Logout
           </button>
        </div>
      </aside>



      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-paa-cream relative">
        
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 shrink-0 bg-paa-cream">
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-paa-gray-text">
              <span>Admin Portal</span>
              <span className="text-paa-navy/30">/</span>
              <span className="text-paa-navy">{activeTab.replace('-', ' ')}</span>
           </div>
           
           <div className="flex items-center gap-4">
              <button className="relative p-2 text-paa-navy border border-paa-navy/10 bg-white hover:bg-paa-navy hover:text-paa-cream transition-colors">
                 <Bell className="w-4 h-4" />
                 <span className="absolute top-1 right-1 w-2 h-2 bg-[#d9534f] rounded-full border border-white"></span>
              </button>
              <button className="md:hidden p-2 text-paa-navy border border-paa-navy/10 bg-white hover:bg-paa-navy hover:text-paa-cream transition-colors">
                 <Menu className="w-4 h-4" />
              </button>
           </div>
        </header>
        {/* Blinking under tab name */}
        <div className="h-0.5 w-full bg-gray-200 overflow-hidden shrink-0">
           {isRefreshing && <div className="h-full bg-paa-navy animate-[pulse_0.5s_ease-in-out_infinite] w-full" />}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 pt-0">
           {activeTab === 'overview' && <OverviewTab />}
           {activeTab === 'authors' && <AuthorsTab refreshTrigger={lastRefreshTime} />}
           {activeTab === 'books' && <BooksTab refreshTrigger={lastRefreshTime} />}
           {activeTab === 'events' && <EventsTab refreshTrigger={lastRefreshTime} />}
           {activeTab === 'orders' && <OrdersTab refreshTrigger={lastRefreshTime} />}
           {activeTab === 'forms' && <FormsTab />}
           {activeTab === 'gallery' && <GalleryTab refreshTrigger={lastRefreshTime} />}
                      {activeTab === 'author_data' && <AuthorDataTab refreshTrigger={lastRefreshTime} />}
           {activeTab === 'helpdesk' && <HelpdeskTab refreshTrigger={lastRefreshTime} />}
           {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>

      <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title="Create Event">
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          const target = e.target as any;
          setIsSubmittingEvent(true);
          try {
            await axios.post(`${API}/api/admin/events`, {
              name: target.name.value,
              date: target.date.value,
              location: target.location.value,
              duration: target.duration.value
            }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            fetchEvents();
            setIsEventModalOpen(false);
          } catch (err: any) {
            alert(err.response?.data?.error || err.message);
          } finally {
            setIsSubmittingEvent(false);
          }
        }}>
          <div><label className="text-xs font-bold uppercase tracking-widest text-paa-navy mb-1 block">Event Name</label><input required name="name" type="text" className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-bold uppercase tracking-widest text-paa-navy mb-1 block">Date (e.g. 15 Aug 2026)</label><input required name="date" type="date" className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" /></div>
            <div><label className="text-xs font-bold uppercase tracking-widest text-paa-navy mb-1 block">Duration (e.g. 3 days)</label><input required name="duration" type="text" className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" /></div>
          </div>
          <div><label className="text-xs font-bold uppercase tracking-widest text-paa-navy mb-1 block">Location</label><input required name="location" type="text" className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" /></div>
          <div className="pt-4 mt-4 border-t border-paa-navy/10 flex justify-end">
            <button type="submit" disabled={isSubmittingEvent} className="bg-paa-navy text-paa-cream px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors disabled:opacity-50">
              {isSubmittingEvent ? "Creating Event..." : "Create Event"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditEventModalOpen} onClose={() => setIsEditEventModalOpen(false)} title="Edit Event">
        {editingEvent && (
          <form className="space-y-4" onSubmit={handleEditEventSubmit}>
            <div><label className="text-xs font-bold uppercase tracking-widest text-paa-navy mb-1 block">Event Name</label><input required type="text" className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" value={editingEvent.name} onChange={e => setEditingEvent({...editingEvent, name: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold uppercase tracking-widest text-paa-navy mb-1 block">Date</label><input required type="date" className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" value={editingEvent.date} onChange={e => setEditingEvent({...editingEvent, date: e.target.value})} /></div>
              <div><label className="text-xs font-bold uppercase tracking-widest text-paa-navy mb-1 block">Duration</label><input required type="text" className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" value={editingEvent.duration} onChange={e => setEditingEvent({...editingEvent, duration: e.target.value})} /></div>
            </div>
            <div><label className="text-xs font-bold uppercase tracking-widest text-paa-navy mb-1 block">Location</label><input required type="text" className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" value={editingEvent.location} onChange={e => setEditingEvent({...editingEvent, location: e.target.value})} /></div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-paa-navy mb-1 block">Status</label>
              <select className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" value={editingEvent.status} onChange={e => setEditingEvent({...editingEvent, status: e.target.value})}>
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Past">Past</option>
              </select>
            </div>
            <div className="pt-4 mt-4 border-t border-paa-navy/10 flex justify-end gap-2">
              <button type="button" onClick={() => setIsEditEventModalOpen(false)} className="bg-gray-100 text-paa-navy px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">Cancel</button>
              <button type="submit" className="bg-paa-navy text-paa-cream px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Gallery Images Management Modal */}
      <Modal isOpen={!!selectedGalleryEvent} onClose={() => setSelectedGalleryEvent(null)} title={`Manage Images: ${selectedGalleryEvent?.location}`}>
        {selectedGalleryEvent && (
          <div className="space-y-6">
            <form onSubmit={handleUploadGalleryImage} className="space-y-4 bg-gray-50 p-4 border border-paa-navy/10 rounded">
              <h4 className="text-xs font-bold uppercase tracking-widest text-paa-navy mb-2">Upload New Image</h4>
              <div>
                <input required type="file" name="photo" accept="image/*" className="w-full text-sm text-paa-gray-text file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-paa-navy/10 file:text-paa-navy hover:file:bg-paa-navy/20 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1 block">Caption (Optional)</label><input type="text" name="caption" className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-white focus:border-paa-navy" placeholder="E.g. Audience cheering" /></div>
                <div><label className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1 block">Date Taken (Optional)</label><input type="date" name="dateTaken" className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-white focus:border-paa-navy" /></div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="bg-paa-navy text-paa-cream px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-paa-gold transition-colors">Upload</button>
              </div>
            </form>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-paa-navy mb-4 border-b border-paa-navy/10 pb-2">Uploaded Images ({selectedGalleryEvent.images?.length || 0})</h4>
              {(!selectedGalleryEvent.images || selectedGalleryEvent.images.length === 0) ? (
                <div className="text-center py-8 text-paa-gray-text text-sm">No additional images uploaded for this event.</div>
              ) : (
                <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                  {selectedGalleryEvent.images.map((img: any) => (
                    <div key={img.id} className="relative group rounded overflow-hidden border border-paa-navy/10 shadow-sm bg-white">
                      <img src={img.url.startsWith('http') ? img.url : `${API}${img.url}`} alt={img.caption || 'Event Image'} className="w-full h-32 object-cover" />
                      <button 
                        onClick={() => handleDeleteGalleryImage(img.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow"
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
          <div className="bg-white rounded w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-paa-navy/10 flex justify-between items-center bg-[#f8fafc]">
              <div>
                 <h2 className="text-2xl font-serif text-paa-navy">Event Settlement Report</h2>
                 <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">Full breakdown of all author sales and revenue.</p>
              </div>
              <button onClick={() => setReportEventId(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={24} className="text-gray-500" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
               {pendingReportStatus && (
                  <div className="text-center p-8 bg-gray-50 border border-paa-navy/10 rounded mb-6">
                     <h3 className="text-2xl font-serif text-paa-navy mb-2">Awaiting Author Settlements</h3>
                     <p className="text-sm text-gray-500 mb-6">The detailed report is partially complete. The following authors have not yet submitted their post-event inventory counts:</p>
                     <div className="flex flex-wrap gap-2 justify-center mb-8">
                        {pendingReportStatus.missingAuthors.map((a: any) => (
                           <span key={a.id} className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200">{a.name}</span>
                        ))}
                     </div>
                     <button onClick={handleNotifySettlement} className="bg-paa-navy text-paa-cream px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors">Notify Pending Authors</button>
                  </div>
               )}
               {eventReportData[0]?.isLegacySummary ? (
                  <div className="text-center p-8 bg-gray-50 border border-paa-navy/10 rounded">
                     <h3 className="text-2xl font-serif text-paa-navy mb-2">Legacy Event Overview</h3>
                     <p className="text-sm text-gray-500 mb-8">Granular transaction records are not available for this archived event.</p>
                     <div className="flex justify-center gap-12">
                        <div className="bg-white p-6 shadow-sm border border-gray-100 rounded min-w-[150px]">
                           <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Total Authors</p>
                           <p className="text-4xl font-black text-paa-navy">{eventReportData[0].authorsParticipated}</p>
                        </div>
                        <div className="bg-white p-6 shadow-sm border border-gray-100 rounded min-w-[150px]">
                           <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Books Sold</p>
                           <p className="text-4xl font-black text-paa-navy">{eventReportData[0].booksSold}</p>
                        </div>
                     </div>
                  </div>
               ) : eventReportData.length === 0 && !pendingReportStatus ? (
                  <p className="text-center text-gray-500 italic">No books were listed for this event.</p>
               ) : eventReportData.length > 0 ? (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                     <thead className="bg-[#e4ebf5] text-paa-navy uppercase tracking-widest text-xs border-b border-paa-navy/10">
                        <tr>
                           <th className="px-4 py-3 font-bold">Author</th>
                           <th className="px-4 py-3 font-bold">Book Title</th>
                           <th className="px-4 py-3 font-bold text-center">Listed</th>
                           <th className="px-4 py-3 font-bold text-center">Sold</th>
                           <th className="px-4 py-3 font-bold text-center">Returned</th>
                           <th className="px-4 py-3 font-bold text-right">Admin Cut (30%)</th>
                           <th className="px-4 py-3 font-bold text-right">Author Payout (70%)</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {eventReportData.map((row: any) => {
                           const price = row?.book?.mrp || 0;
                           const sold = row?.soldStock || 0;
                           const revenue = price * sold;
                           const adminCut = revenue * 0.30;
                           const authorPayout = revenue * 0.70;
                           return (
                              <tr key={row.id} className="hover:bg-gray-50">
                                 <td className="px-4 py-3">{row?.author?.name || 'N/A'}</td>
                                 <td className="px-4 py-3 font-medium text-paa-navy">{row?.book?.title || 'N/A'}</td>
                                 <td className="px-4 py-3 text-center">{row?.listedStock || 0}</td>
                                 <td className="px-4 py-3 text-center font-bold">{sold}</td>
                                 <td className="px-4 py-3 text-center text-gray-500">{row?.returnedStock || 0}</td>
                                 <td className="px-4 py-3 text-right text-gray-500">₹{adminCut.toFixed(2)}</td>
                                 <td className="px-4 py-3 text-right font-bold text-green-700">₹{authorPayout.toFixed(2)}</td>
                              </tr>
                           )
                        })}
                     </tbody>
                  </table>
               ) : null}
            </div>
            {eventReportData.length > 0 && !eventReportData[0]?.isLegacySummary && (
              <div className="p-4 border-t border-paa-navy/10 bg-gray-50 flex justify-between items-center">
                 <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Total Event Revenue: <span className="text-paa-navy text-sm">₹{eventReportData.reduce((sum, r) => sum + ((r?.book?.mrp || 0) * (r?.soldStock || 0)), 0).toFixed(2)}</span>
                 </div>
                 <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Total Author Payouts: <span className="text-green-700 text-sm">₹{eventReportData.reduce((sum, r) => sum + (((r?.book?.mrp || 0) * (r?.soldStock || 0)) * 0.70), 0).toFixed(2)}</span>
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
            <div className="bg-gray-50 p-4 border border-paa-navy/10 flex justify-between items-start">
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
              <h3 className="text-sm font-bold tracking-widest uppercase text-paa-navy mb-3">Ordered Books</h3>
              <ul className="space-y-2">
                {selectedOrder.items.map((it: any, idx: number) => (
                  <li key={idx} className="flex justify-between items-center border-b border-paa-navy/5 pb-2">
                    <span className="font-medium text-sm text-paa-navy">{it.title} <span className="text-gray-400 italic font-normal text-xs ml-1">by {it.authorName}</span></span>
                    <span className="font-bold text-paa-navy text-sm">Qty: {it.qty}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold tracking-widest uppercase text-paa-navy mb-3">Payment Information</h3>
              {selectedOrder.payment === 'Paid' ? (
                <div className="bg-[#e4ebf5] p-4 border border-paa-navy/10 flex items-center justify-between">
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
                      <button onClick={() => handleVerifyOrder(selectedOrder.dbId)} className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-4 py-2 text-xs font-bold uppercase tracking-widest shadow-sm transition-colors">
                        Verify
                      </button>
                      <button onClick={() => handleRejectOrder(selectedOrder.dbId)} className="bg-white border border-[#d9534f] text-[#d9534f] hover:bg-[#d9534f] hover:text-white px-4 py-2 text-xs font-bold uppercase tracking-widest shadow-sm transition-colors">
                        Reject
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
                    <button onClick={() => handleRejectOrder(selectedOrder.dbId)} className="bg-[#d9534f] hover:bg-[#c9302c] text-white px-4 py-2 text-xs font-bold uppercase tracking-widest shadow-sm transition-colors">
                      Mark Failed
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
          }
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
              <option value="Book Café">Book Café</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Description (Optional)</label>
            <textarea name="formDescription" className="w-full p-2 border border-paa-navy/20" rows={2}></textarea>
          </div>
          <div>
            <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Fields (JSON Array)</label>
            <textarea name="formFields" required className="w-full p-2 border border-paa-navy/20 font-mono text-xs" rows={4} defaultValue={`[\n  {"name": "Name", "type": "text"},\n  {"name": "Feedback", "type": "textarea"}\n]`}></textarea>
            <p className="text-xs text-gray-500 mt-1">Supported types: text, textarea, select (needs "options": ["A","B"])</p>
          </div>
          <button type="submit" className="w-full py-3 bg-paa-navy text-white text-xs font-bold uppercase hover:bg-paa-gold transition">
            Create Form
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
          }
        }}>
          <div>
            <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Event Title / Location</label>
            <input name="loc" required className="w-full p-2 border border-paa-navy/20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Place</label>
              <input name="place" required className="w-full p-2 border border-paa-navy/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">City</label>
              <input name="city" required className="w-full p-2 border border-paa-navy/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Date</label>
              <input type="date" name="date" required className="w-full p-2 border border-paa-navy/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Type</label>
              <select name="type" required className="w-full p-2 border border-paa-navy/20 bg-white">
                <option value="Literary Event">Literary Event</option>
                <option value="Book Fair">Book Fair</option>
                <option value="Corporate Activation">Corporate Activation</option>
                <option value="Airport Library">Airport Library</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Duration</label>
              <input name="duration" placeholder="e.g. 2 Days" className="w-full p-2 border border-paa-navy/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Authors</label>
              <input type="number" name="authors" placeholder="Count" className="w-full p-2 border border-paa-navy/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Books Sold</label>
              <input type="number" name="booksSold" placeholder="Count" className="w-full p-2 border border-paa-navy/20" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Description</label>
            <textarea name="description" required className="w-full p-2 border border-paa-navy/20" rows={2}></textarea>
          </div>
          <div>
            <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Photo</label>
            <input type="file" accept="image/*" name="photo" required className="w-full p-2 border border-paa-navy/20 bg-white" />
          </div>
          <button type="submit" className="w-full py-3 bg-paa-navy text-white text-xs font-bold uppercase hover:bg-paa-gold transition">
            Add Gallery Event
          </button>
        </form>
      </Modal>

      <Modal isOpen={isEditGalleryModalOpen} onClose={() => setIsEditGalleryModalOpen(false)} title="Edit Gallery Event">
        {editingGalleryEvent && (
          <form className="space-y-4" onSubmit={async (e) => {
            e.preventDefault();
            const target = e.target as any;
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
            }
          }}>
            <div>
              <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Event Title / Location</label>
              <input name="loc" defaultValue={editingGalleryEvent.location} required className="w-full p-2 border border-paa-navy/20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Place</label>
                <input name="place" defaultValue={editingGalleryEvent.place} required className="w-full p-2 border border-paa-navy/20" />
              </div>
              <div>
                <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">City</label>
                <input name="city" defaultValue={editingGalleryEvent.city} required className="w-full p-2 border border-paa-navy/20" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Date</label>
                <input type="date" name="date" defaultValue={editingGalleryEvent.date.split('T')[0]} required className="w-full p-2 border border-paa-navy/20" />
              </div>
              <div>
                <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Type</label>
                <select name="type" defaultValue={editingGalleryEvent.type} required className="w-full p-2 border border-paa-navy/20 bg-white">
                  <option value="Literary Event">Literary Event</option>
                  <option value="Book Fair">Book Fair</option>
                  <option value="Corporate Activation">Corporate Activation</option>
                  <option value="Airport Library">Airport Library</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Duration</label>
                <input name="duration" defaultValue={editingGalleryEvent.duration} className="w-full p-2 border border-paa-navy/20" />
              </div>
              <div>
                <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Authors Participated</label>
                <input type="number" name="authors" defaultValue={editingGalleryEvent.authors} className="w-full p-2 border border-paa-navy/20" />
              </div>
              <div>
                <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Books Sold</label>
                <input type="number" name="booksSold" defaultValue={editingGalleryEvent.booksSold} className="w-full p-2 border border-paa-navy/20" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Description</label>
              <textarea name="description" defaultValue={editingGalleryEvent.description} required className="w-full p-2 border border-paa-navy/20" rows={2}></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Change Main Photo (Optional)</label>
              <input type="file" name="photo" accept="image/*" className="w-full p-2 border border-paa-navy/20 text-xs bg-white" />
            </div>
            <button type="submit" className="w-full py-3 bg-paa-navy text-white text-xs font-bold uppercase hover:bg-paa-gold transition">
              Save Changes
            </button>
          </form>
        )}
      </Modal>

      <Modal isOpen={isEditBookModalOpen} onClose={() => { setIsEditBookModalOpen(false); setEditingBook(null); }} title="Edit Book Details">
        {editingBook && (
          <form className="space-y-4" onSubmit={handleUpdateBook}>
            <div>
              <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Title</label>
              <input required type="text" value={editingBook.title} onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })} className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Genre</label>
                <select value={editingBook.genre} onChange={(e) => setEditingBook({ ...editingBook, genre: e.target.value })} className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy">
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Children's corner">Children's corner</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Subgenre</label>
                <input type="text" value={editingBook.subGenre} onChange={(e) => setEditingBook({ ...editingBook, subGenre: e.target.value })} className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" placeholder="e.g. Thriller, Biography" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">MRP (Price in ₹)</label>
                <input required type="number" step="any" value={editingBook.mrp} onChange={(e) => setEditingBook({ ...editingBook, mrp: e.target.value })} className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" />
              </div>
              <div>
                <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Stock</label>
                <input required type="number" value={editingBook.stock} onChange={(e) => setEditingBook({ ...editingBook, stock: e.target.value })} className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Synopsis</label>
              <textarea value={editingBook.synopsis} onChange={(e) => setEditingBook({ ...editingBook, synopsis: e.target.value })} className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" rows={4}></textarea>
            </div>
            <button type="submit" className="w-full py-3 bg-paa-navy text-white text-xs font-bold uppercase hover:bg-paa-gold hover:text-paa-navy transition shadow">
              Save Changes
            </button>
          </form>
        )}
      </Modal>

      {/* Reject Author Modal */}
      {rejectAuthorTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-paa-navy/60 p-4 backdrop-blur-sm">
          <div className="bg-white border border-paa-navy/10 shadow-xl w-full max-w-lg">
            <div className="bg-[#d9534f] p-4 font-bold text-xs tracking-widest uppercase flex justify-between items-center border-b border-paa-navy/10 text-white">
              Reject Author: {rejectAuthorTarget.name}
              <button type="button" onClick={() => setRejectAuthorTarget(null)} className="hover:opacity-70">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-paa-navy mb-4">Select rejection reason(s):</p>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto bg-gray-50 p-3 border border-paa-navy/10">
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
                <button onClick={handleRejectAuthorSubmit} className="px-6 py-2 bg-[#d9534f] hover:bg-[#c9302c] text-white text-xs font-bold uppercase tracking-widest shadow transition-colors">
                  Confirm Rejection
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
              <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Full Name</label>
              <input required type="text" value={editingAuthor.name} onChange={(e) => setEditingAuthor({ ...editingAuthor, name: e.target.value })} className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Phone</label>
                <input type="text" value={editingAuthor.phone} onChange={(e) => setEditingAuthor({ ...editingAuthor, phone: e.target.value })} className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" />
              </div>
              <div>
                <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">WhatsApp</label>
                <input type="text" value={editingAuthor.whatsapp} onChange={(e) => setEditingAuthor({ ...editingAuthor, whatsapp: e.target.value })} className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-paa-navy mb-1 uppercase">Author Bio</label>
              <textarea required value={editingAuthor.bio} onChange={(e) => setEditingAuthor({ ...editingAuthor, bio: e.target.value })} className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" rows={5} />
            </div>
            <button type="submit" className="w-full py-3 bg-paa-navy text-white text-xs font-bold uppercase hover:bg-paa-gold hover:text-paa-navy transition shadow">
              Save Author Profile
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
       <div className="bg-white p-6 border border-paa-navy/10 shadow-sm rounded">
          <div className="flex justify-between items-center mb-6 border-b border-paa-navy/10 pb-4">
             <div>
                <h3 className="text-xl font-serif font-medium text-paa-navy mb-1 flex items-center gap-2">
                   <Users className="w-5 h-5" /> Support Helpdesk
                </h3>
                <p className="text-paa-gray-text text-sm">Manage and respond to author queries.</p>
             </div>
             <button onClick={fetchQueries} className="p-2 border border-paa-navy/20 bg-gray-50 hover:bg-gray-100 rounded text-paa-navy transition-colors shadow-sm">
                <RefreshCw size={18} />
             </button>
          </div>
          
          <div className="space-y-6">
             {queries.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-8">No queries found.</p>
             ) : queries.map(q => (
                <div key={q.id} className="border border-gray-200 rounded p-6 bg-gray-50 shadow-sm">
                   <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                      <div>
                         <h4 className="font-bold text-paa-navy text-lg">{q.subject}</h4>
                         <p className="text-xs text-gray-500 mt-1">From: <span className="font-bold">{q.author?.name}</span> ({q.author?.email})</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded ${q.status === 'Answered' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                        {q.status}
                      </span>
                   </div>
                   <div className="bg-white p-4 rounded border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap mb-4 shadow-inner">
                      {q.message}
                   </div>

                   {q.status === 'Pending' ? (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                         <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-2">Write a Reply</label>
                         <textarea 
                           rows={3} 
                           placeholder="Type your reply here..." 
                           className="w-full border border-paa-navy/20 p-3 text-sm outline-none focus:border-paa-navy bg-white rounded resize-y mb-3 shadow-sm"
                           value={replyText[q.id] || ''}
                           onChange={e => setReplyText({ ...replyText, [q.id]: e.target.value })}
                         />
                         <button 
                           onClick={() => handleReply(q.id)} 
                           disabled={isReplying[q.id]}
                           className="px-6 py-2 bg-paa-navy text-white text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors rounded shadow-sm"
                         >
                           {isReplying[q.id] ? 'Sending...' : 'Send Reply'}
                         </button>
                      </div>
                   ) : (
                      <div className="mt-4 pt-4 border-t border-gray-200 bg-green-50/50 p-4 rounded">
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
