import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Download, Bell, BellRing, Loader2, ChevronDown, ChevronUp, ChevronRight, CheckCircle2,
  BookOpen, Users, AlertTriangle, AlertCircle, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminInventoryTab() {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const token = localStorage.getItem('token');
  const [data, setData] = useState<any[]>([]);
  const [globalStats, setGlobalStats] = useState({ totalTitles: 0, totalCirculation: 0, globalLowStock: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [pinging, setPinging] = useState<Record<number, boolean>>({});
  const [pinged, setPinged] = useState<Record<number, boolean>>({});

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 50;

  // Expanded Rows
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchInventory();
  }, [debouncedSearch, lowStockOnly, page]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/admin/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit,
          search: debouncedSearch,
          lowStock: lowStockOnly
        }
      });
      setData(res.data.data);
      setTotalRecords(res.data.meta.total);
      setGlobalStats(res.data.meta.globalStats);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await axios.get(`${API}/api/admin/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: debouncedSearch,
          lowStock: lowStockOnly,
          export: true
        },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Export successful');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const pingAuthor = async (bookId: number, authorId: number) => {
    setPinging(prev => ({ ...prev, [bookId]: true }));
    try {
      await axios.post(`${API}/api/admin/inventory/ping-author`, { bookId, authorId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Restock request sent to author');
      setPinged(prev => ({ ...prev, [bookId]: true }));
    } catch (err) {
      console.error(err);
      toast.error('Failed to ping author');
    } finally {
      setPinging(prev => ({ ...prev, [bookId]: false }));
    }
  };

  const totalPages = Math.ceil(totalRecords / limit);

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] min-h-[85vh] p-4 lg:p-8 space-y-6">
      
      {/* GLOBAL SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-premium flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-paa-gray-text uppercase">Total Titles Active</p>
            <p className="text-3xl font-bold text-paa-navy mt-1">{globalStats.totalTitles}</p>
          </div>
          <div className="w-12 h-12 bg-paa-navy/5 text-paa-navy rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-premium flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-paa-gray-text uppercase">Total in Circulation</p>
            <p className="text-3xl font-bold text-paa-navy mt-1">{globalStats.totalCirculation}</p>
          </div>
          <div className="w-12 h-12 bg-paa-navy/5 text-paa-navy rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-red-500/10 shadow-premium flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-red-500 uppercase">Global Low Stock</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{globalStats.globalLowStock}</p>
          </div>
          <div className="w-12 h-12 bg-red-500/10 text-red-600 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* UTILITY BAR */}
      <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by book title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 focus:border-paa-navy focus:ring-1 focus:ring-paa-navy outline-none transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
              />
              <div className={`block w-12 h-7 rounded-full transition-colors ${lowStockOnly ? 'bg-red-500' : 'bg-gray-200'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${lowStockOnly ? 'transform translate-x-5' : ''}`}></div>
            </div>
            <span className="text-sm font-bold text-paa-navy">Show Low Stock Only</span>
          </label>

          <button
            onClick={exportCsv}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-paa-navy text-paa-cream rounded-xl font-bold tracking-wide hover:bg-[#0c1e30] transition-colors disabled:opacity-70"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-premium overflow-hidden flex-1 flex flex-col min-h-[400px]">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
            <thead className="bg-paa-gray-bg border-b border-black/5 text-xs font-bold tracking-widest text-paa-gray-text uppercase">
              <tr>
                <th className="p-4 w-12">S.No</th>
                <th className="p-4">Title</th>
                <th className="p-4">Author</th>
                <th className="p-4 text-center">Master Stock</th>
                <th className="p-4 text-center">Qty Web</th>
                <th className="p-4 text-center">Qty Airport</th>
                <th className="p-4 text-center">Qty Fairs</th>
                <th className="p-4 text-center border-x border-black/5 bg-gray-50/50">Current Stock</th>
                <th className="p-4">Last Activity</th>
                <th className="p-4 text-center w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading inventory...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-400">
                    No books found matching the criteria.
                  </td>
                </tr>
              ) : (
                data.map((book, idx) => {
                  const sNo = (page - 1) * limit + idx + 1;
                  const isExpanded = expandedRow === book.id;
                  const hasDistribution = book.distributionBreakdown && book.distributionBreakdown.length > 0;
                  const isPinged = pinged[book.id];
                  const isPinging = pinging[book.id];
                  
                  return (
                    <React.Fragment key={book.id}>
                      <tr className={`group hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-gray-50' : ''}`}>
                        <td className="p-4 text-gray-500">{sNo}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {hasDistribution ? (
                              <button 
                                onClick={() => setExpandedRow(isExpanded ? null : book.id)}
                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/5 text-paa-navy"
                              >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
                              </button>
                            ) : (
                              <div className="w-6"></div>
                            )}
                            {book.coverUrl && (
                              <img src={book.coverUrl} alt="Cover" className="w-8 h-10 object-cover rounded border" />
                            )}
                            <div className="font-bold text-paa-navy max-w-[200px] truncate" title={book.title}>
                              {book.title}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-gray-700 max-w-[150px] truncate" title={book.authorName}>{book.authorName}</td>
                        <td className="p-4 text-center">{book.masterStock}</td>
                        <td className="p-4 text-center">{book.webSold}</td>
                        <td className="p-4 text-center">{book.airportQty}</td>
                        <td className="p-4 text-center">{book.eventQty}</td>
                        <td className="p-4 text-center border-x border-black/5 bg-gray-50/50">
                          <div className="flex flex-col items-center justify-center">
                            <span className="font-bold text-paa-navy text-base">{book.currentStock}</span>
                            {book.isLowStock && (
                              <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full mt-1">LOW STOCK</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-gray-500 text-xs">
                          {new Date(book.lastActivity).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-center">
                          {book.isLowStock ? (
                            <button
                              onClick={() => pingAuthor(book.id, book.authorId)}
                              disabled={isPinged || isPinging}
                              className={`flex items-center justify-center gap-1.5 w-full py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                                isPinged 
                                  ? 'bg-green-100 text-green-700 border border-green-200' 
                                  : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                              }`}
                            >
                              {isPinging ? <Loader2 size={14} className="animate-spin" /> : 
                               isPinged ? <CheckCircle2 size={14} /> : <BellRing size={14} />}
                              {isPinged ? 'Pinged' : 'Request Restock'}
                            </button>
                          ) : (
                            <span className="text-gray-300 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                      {/* EXPANDED ROW */}
                      {isExpanded && hasDistribution && (
                        <tr className="bg-gray-50/80 border-b border-black/5">
                          <td colSpan={10} className="p-0">
                            <div className="pl-20 pr-4 py-4">
                              <h4 className="text-xs font-bold text-paa-gray-text uppercase tracking-wider mb-3">Detailed Distribution</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {book.distributionBreakdown.map((item: any, i: number) => (
                                  <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-black/5 shadow-sm">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'airport' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                      <BookOpen size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-paa-navy truncate">{item.label}</p>
                                      <p className="text-xs text-gray-500">
                                        {item.type === 'airport' ? 'Airport Library' : `Fairs & Events • ${item.status}`}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg font-bold text-paa-navy">{item.quantity}</p>
                                      {item.type === 'event' && (
                                        <p className="text-[10px] text-gray-400">Sold: {item.sold}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
          <div className="mt-auto p-4 border-t border-black/5 flex items-center justify-between bg-gray-50/50">
            <p className="text-sm text-gray-500">
              Showing <span className="font-bold">{(page - 1) * limit + 1}</span> to <span className="font-bold">{Math.min(page * limit, totalRecords)}</span> of <span className="font-bold">{totalRecords}</span> entries
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border border-black/10 rounded-lg text-sm font-medium hover:bg-black/5 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border border-black/10 rounded-lg text-sm font-medium hover:bg-black/5 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
