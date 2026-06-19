import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router';
import { Home, Check, AlertCircle, Upload, Loader2, LogOut } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import { toast } from 'sonner';

export function AuthorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const [dashRes, actRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/dashboard-data`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/activities`)
      ]);
      setDashboardData(dashRes.data);
      setActivities(actRes.data);
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading || !dashboardData) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-paa-navy" /></div>;
  }

  return (
    <div className="min-h-screen bg-paa-cream font-sans">
      <div className="bg-white border-b border-paa-navy/10 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-6 text-xs font-bold tracking-widest uppercase overflow-x-auto hide-scrollbar items-center">
          <Link to="/dashboard" className={`${location.pathname === '/dashboard' ? 'text-paa-navy border-b-2 border-paa-navy' : 'text-gray-500 hover:text-paa-navy'} pb-1 transition-colors whitespace-nowrap`}>Overview</Link>
          <Link to="/dashboard/activities" className={`${location.pathname.includes('/activities') ? 'text-paa-navy border-b-2 border-paa-navy' : 'text-gray-500 hover:text-paa-navy'} pb-1 transition-colors whitespace-nowrap`}>Activities</Link>
          <Link to="/dashboard/orders" className={`${location.pathname.includes('/orders') ? 'text-paa-navy border-b-2 border-paa-navy' : 'text-gray-500 hover:text-paa-navy'} pb-1 transition-colors whitespace-nowrap`}>My Orders</Link>
          <Link to="/dashboard/forms" className={`${location.pathname.includes('/forms') ? 'text-paa-navy border-b-2 border-paa-navy' : 'text-gray-500 hover:text-paa-navy'} pb-1 transition-colors whitespace-nowrap`}>Forms</Link>
          <Link to="/dashboard/inventory" className={`${location.pathname.includes('/inventory') ? 'text-paa-navy border-b-2 border-paa-navy' : 'text-gray-500 hover:text-paa-navy'} pb-1 transition-colors whitespace-nowrap`}>Inventory</Link>
          <Link to="/dashboard/distribution" className={`${location.pathname.includes('/distribution') ? 'text-paa-navy border-b-2 border-paa-navy' : 'text-gray-500 hover:text-paa-navy'} pb-1 transition-colors whitespace-nowrap`}>Distribution</Link>
          <Link to="/dashboard/book-fair" className={`${location.pathname.includes('/book-fair') ? 'text-paa-navy border-b-2 border-paa-navy' : 'text-gray-500 hover:text-paa-navy'} pb-1 transition-colors whitespace-nowrap`}>Book Fair</Link>
          <Link to="/dashboard/events" className={`${location.pathname.includes('/events') ? 'text-paa-navy border-b-2 border-paa-navy' : 'text-gray-500 hover:text-paa-navy'} pb-1 transition-colors whitespace-nowrap`}>Events</Link>
          <button onClick={handleLogout} className="ml-auto flex items-center gap-1 text-red-600 hover:text-red-700 pb-1 transition-colors whitespace-nowrap"><LogOut size={14}/> Logout</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<DashboardMain data={dashboardData} />} />
          <Route path="/activities" element={<ActivityRegistration activities={activities} books={dashboardData.authorProfile.books} onRefresh={fetchDashboardData} registrations={dashboardData.authorProfile.eventRegistrations} />} />
          <Route path="/orders" element={<AuthorOrders orders={dashboardData.authorOrders} onRefresh={fetchDashboardData} />} />
          <Route path="/forms/*" element={<FormsWrapper />} />
          <Route path="/inventory" element={<InventoryPage books={dashboardData.authorProfile.books} onRefresh={fetchDashboardData} />} />
          <Route path="/distribution" element={<DistributionRecord books={dashboardData.authorProfile.books} orders={dashboardData.authorOrders} authorName={dashboardData.authorProfile.name} />} />
          <Route path="/book-fair" element={<BookFairDashboard registrations={dashboardData.authorProfile.eventRegistrations} books={dashboardData.authorProfile.books} />} />
          <Route path="/events" element={<EventsDashboard registrations={dashboardData.authorProfile.eventRegistrations} />} />
        </Routes>
      </div>
    </div>
  );
}

function DashboardMain({ data }: { data: any }) {
  const [filter, setFilter] = useState('all');
  const [showAddBook, setShowAddBook] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', genre: '', synopsis: '', mrp: '', stock: '' });
  const [cover, setCover] = useState<File | null>(null);

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
      status: b.status
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-serif text-paa-navy">Author Dashboard</h1>
        <button onClick={() => setShowAddBook(true)} className="bg-paa-gold text-paa-navy px-4 py-2 font-bold tracking-widest uppercase text-xs hover:bg-paa-navy hover:text-paa-gold transition-colors">
          + Add New Book
        </button>
      </div>
      
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
              <input required type="number" placeholder="MRP (₹)" className="border p-2" value={newBook.mrp} onChange={e => setNewBook({...newBook, mrp: e.target.value})} />
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
            <div className="text-2xl font-serif text-[#14532d]">₹{grossSales.toFixed(2)}</div>
          </div>
          <div className="bg-[#eff6ff] border border-[#bfdbfe] p-4 rounded flex flex-col justify-center w-48">
            <div className="text-xs font-bold tracking-widest text-[#2563eb] uppercase mb-1">Net Earnings (70%)</div>
            <div className="text-2xl font-serif text-[#1e3a8a]">₹{netEarnings.toFixed(2)}</div>
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
                <th className="p-3 border-r border-[#8faadc]">Title</th>
                <th className="p-3 border-r border-[#8faadc]">Status</th>
                <th className="p-3 border-r border-[#8faadc]">Date Joined</th>
                <th className="p-3 border-r border-[#8faadc]">MRP</th>
                <th className="p-3 border-r border-[#8faadc]">Genre</th>
                <th className="p-3 border-r border-[#8faadc]">Books Sold</th>
              </tr>
            </thead>
            <tbody>
              {filteredTitles.map((row: any) => (
                <tr key={row.id} className="border-b border-paa-navy/5 even:bg-gray-50">
                  <td className="p-3 border-r border-paa-navy/5 text-center">{row.sno}</td>
                  <td className="p-3 border-r border-paa-navy/5 font-medium">{row.title}</td>
                  <td className="p-3 border-r border-paa-navy/5">
                    <span className={`px-2 py-1 text-xs rounded ${row.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{row.status}</span>
                  </td>
                  <td className="p-3 border-r border-paa-navy/5">{row.date}</td>
                  <td className="p-3 border-r border-paa-navy/5">{row.mrp}</td>
                  <td className="p-3 border-r border-paa-navy/5">{row.genre}</td>
                  <td className="p-3 border-r border-paa-navy/5 font-bold text-paa-navy">{row.sold}</td>
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
  const [selectedBooks, setSelectedBooks] = useState<number[]>([]);
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
    setSelectedBooks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
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
                   <p className="text-sm font-bold text-paa-navy mb-2">1. Select Books for this event:</p>
                   <div className="flex flex-col gap-2 max-h-32 overflow-y-auto border p-2 bg-gray-50">
                     {books.map(b => (
                       <label key={b.id} className="flex items-center gap-2 text-sm cursor-pointer">
                         <input type="checkbox" checked={selectedBooks.includes(b.id)} onChange={() => toggleBook(b.id)} />
                         {b.title}
                       </label>
                     ))}
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
                  <td className="p-3 border-r border-paa-navy/5 text-center">₹{row.charges}</td>
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

  const handleAccept = async (id: number) => {
    setLoadingAction(id);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/order-items/${id}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order Accepted');
      onRefresh();
    } catch (e) {
      toast.error('Failed to accept order');
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
      <h1 className="text-4xl font-serif text-paa-navy mb-8 text-center uppercase">MY WEB ORDERS</h1>
      <div className="bg-white border border-paa-navy/10 overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
             <thead className="bg-[#b3d4ff] text-paa-navy uppercase text-xs font-bold tracking-widest">
                <tr>
                   <th className="p-3 border-r border-[#8faadc]">Order ID & Date</th>
                   <th className="p-3 border-r border-[#8faadc]">Buyer Name</th>
                   <th className="p-3 border-r border-[#8faadc]">Book Title</th>
                   <th className="p-3 border-r border-[#8faadc] text-center">Qty</th>
                   <th className="p-3 border-r border-[#8faadc] text-center">Amount</th>
                   <th className="p-3 border-r border-[#8faadc] text-center">Status</th>
                   <th className="p-3 text-center">Action</th>
                </tr>
             </thead>
             <tbody>
               {orders.length === 0 ? <tr><td colSpan={7} className="p-4 text-center">No orders received yet.</td></tr> : orders.map((ord, idx) => (
                 <tr key={idx} className="border-b border-paa-navy/5 even:bg-gray-50 bg-white hover:bg-gray-100 transition-colors">
                    <td className="p-3 border-r border-paa-navy/5">
                      <p className="font-bold text-paa-navy">ORD-{ord.orderId}</p>
                      <p className="text-xs text-paa-gray-text">{ord.date}</p>
                    </td>
                    <td className="p-3 border-r border-paa-navy/5 font-medium">
                      {ord.customerName}<br/>
                      <span className="text-[10px] text-gray-500">{ord.address}</span>
                    </td>
                    <td className="p-3 border-r border-paa-navy/5">{ord.bookTitle}</td>
                    <td className="p-3 border-r border-paa-navy/5 text-center font-bold text-paa-navy">{ord.quantity}</td>
                    <td className="p-3 border-r border-paa-navy/5 text-center bg-gray-50 font-bold text-paa-navy">₹{ord.amount}</td>
                    <td className="p-3 text-center border-r border-paa-navy/5">
                       <span className={`inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${ord.status === 'Completed' ? 'bg-[#5cb85c] text-white border-[#4cae4c]' : ord.status === 'Dispatched' ? 'bg-[#5bc0de] text-white border-[#46b8da]' : ord.status === 'Accepted' ? 'bg-[#337ab7] text-white border-[#2e6da4]' : 'bg-gray-200 text-paa-gray-text border-gray-300'}`}>
                         {ord.status}
                       </span>
                    </td>
                    <td className="p-3 text-center">
                      {ord.paymentScreenshot && (
                        <div className="mb-2">
                          <a 
                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${ord.paymentScreenshot}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[10px] font-bold text-paa-navy underline block tracking-widest uppercase"
                          >
                            View Receipt
                          </a>
                          {ord.paymentVerified && (
                            <span className="text-[10px] font-bold text-green-600 tracking-widest uppercase flex items-center justify-center gap-1 mt-1"><Check size={10}/> Verified</span>
                          )}
                        </div>
                      )}
                      {ord.paymentFailed && (
                        <span className="text-[10px] font-bold text-red-600 tracking-widest uppercase flex items-center justify-center gap-1 mt-1"><AlertCircle size={10}/> Payment Failed</span>
                      )}
                      {ord.status === 'Pending' && ord.paymentVerified && (
                        <button 
                          onClick={() => handleAccept(ord.id)}
                          disabled={loadingAction === ord.id}
                          className="bg-[#337ab7] text-white px-3 py-1 text-xs rounded shadow font-bold disabled:opacity-50 mt-2"
                        >
                          ACCEPT
                        </button>
                      )}
                      {ord.status === 'Pending' && !ord.paymentVerified && !ord.paymentFailed && (
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mt-2 text-center">Awaiting Payment Verification</span>
                      )}
                      {ord.status === 'Accepted' && (
                        <button 
                          onClick={() => handleDispatch(ord.id)}
                          disabled={loadingAction === ord.id}
                          className="bg-[#5bc0de] text-white px-3 py-1 text-xs rounded shadow font-bold disabled:opacity-50 mt-2"
                        >
                          DISPATCH
                        </button>
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

  const tabs = ['Literary Events', 'Book Fairs', 'Flybraries', 'Book Café'];
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
                        <td className="py-3 text-center text-green-700">₹{b.mrp}</td>
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

function EventsDashboard({ registrations }: { registrations: any[] }) {
  const eventRegs = registrations.filter(r => r.activity?.type.includes('Event'));

  return (
    <div>
      <h1 className="text-4xl font-serif text-paa-navy mb-8 text-center uppercase">EVENTS DASHBOARD</h1>
      <div className="bg-white border text-sm border-paa-navy/10 overflow-hidden mb-12">
        <div className="bg-[#5bc0de] text-white p-3 font-bold text-center border-b uppercase tracking-widest text-xs">
           PAST LITERARY EVENTS / STALLS ORGANISED
        </div>
        
        {eventRegs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
             You have not participated in any literary events yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#e0f2f7] border-b text-paa-navy text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4">Event Name</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">City</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {eventRegs.map(reg => (
                  <tr key={reg.id} className="border-b last:border-0 border-gray-100">
                    <td className="p-4 font-bold text-paa-navy">{reg.activity.name}</td>
                    <td className="p-4 text-gray-600">{reg.activity.date}</td>
                    <td className="p-4 text-gray-600">{reg.activity.city}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${reg.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {reg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
