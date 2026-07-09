import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search, Download, Bell, BellRing, Loader2, ChevronDown, ChevronUp, ChevronRight, CheckCircle2,
  BookOpen, Users, AlertTriangle, AlertCircle, RefreshCw, Package
} from 'lucide-react';
import { toast } from 'sonner';

interface GlobalStats {
  totalTitles: number;
  totalCirculation: number;
  globalLowStock: number;
  staleInventory: number;
  pendingRestocks: number;
}

export function AdminInventoryTab() {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const token = localStorage.getItem('token');
  const [data, setData] = useState<any[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({ totalTitles: 0, totalCirculation: 0, globalLowStock: 0, staleInventory: 0, pendingRestocks: 0 });
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
    <div className="space-y-6">

      {/* GLOBAL SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div title="The total number of unique book titles currently registered and managed in the inventory." className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 rounded-xl shadow-sm flex items-center justify-between cursor-help hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-indigo-100 uppercase">Total Titles Active</p>
            <p className="text-2xl font-bold mt-1">{globalStats.totalTitles || 0}</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
        </div>

        <div title="Number of titles that currently have fewer than 10 copies in stock and need restocking." className="bg-gradient-to-br from-rose-500 to-rose-600 text-white p-4 rounded-xl shadow-sm flex items-center justify-between cursor-help hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-rose-100 uppercase">Global Low Stock</p>
            <p className="text-2xl font-bold mt-1">{globalStats.globalLowStock || 0}</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
        </div>

        <div title="Titles that have not had any sales, distributions, or inventory movement in the last 30 days." className="bg-gradient-to-br from-amber-500 to-orange-500 text-white p-4 rounded-xl shadow-sm flex items-center justify-between cursor-help hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-orange-100 uppercase">Stale Inventory</p>
            <p className="text-2xl font-bold mt-1">{globalStats.staleInventory || 0}</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
        </div>

        <div title="Authors who were sent a low-stock warning in the last 14 days but have not replenished their stock yet." className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-4 rounded-xl shadow-sm flex items-center justify-between cursor-help hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-emerald-100 uppercase">Pending Restocks</p>
            <p className="text-2xl font-bold mt-1">{globalStats.pendingRestocks || 0}</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* UTILITY BAR */}
      <div className="bg-white p-3 rounded-xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by book title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border focus:border-paa-navy focus:ring-1 focus:ring-paa-navy outline-none transition-all text-sm"
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
              <div className={`block w-8 h-5 rounded-full transition-colors ${lowStockOnly ? 'bg-red-500' : 'bg-gray-200'}`}></div>
              <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${lowStockOnly ? 'transform translate-x-3' : ''}`}></div>
            </div>
            <span className="text-xs font-bold text-paa-navy">Show Low Stock Only</span>
          </label>

          <button
            onClick={exportCsv}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 bg-paa-navy text-paa-cream rounded-lg font-bold tracking-wide text-xs hover:bg-[#0c1e30] transition-colors disabled:opacity-70"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* DATA TABLE */}
      <div>
        <table className="dash-table w-full text-left table-fixed text-[11px]">
          <thead className="bg-indigo-50 border-b-2 border-indigo-100">
            <tr>
              <th className="px-1 py-3 w-[5%] text-center text-[9px] font-bold uppercase tracking-wider text-indigo-800">S.No</th>
              <th className="px-1 py-3 w-[22%] text-[9px] font-bold uppercase tracking-wider text-indigo-800">Title</th>
              <th className="px-1 py-3 w-[15%] text-[9px] font-bold uppercase tracking-wider text-indigo-800">Author</th>
              <th className="px-1 py-3 w-[8%] text-center text-[9px] font-bold uppercase tracking-wider text-indigo-800">Master Stock</th>
              <th className="px-1 py-3 w-[7%] text-center text-[9px] font-bold uppercase tracking-wider text-indigo-800">Qty Web</th>
              <th className="px-1 py-3 w-[7%] text-center text-[9px] font-bold uppercase tracking-wider text-indigo-800">Qty Airport</th>
              <th className="px-1 py-3 w-[7%] text-center text-[9px] font-bold uppercase tracking-wider text-indigo-800">Qty Fairs</th>
              <th className="px-1 py-3 w-[9%] text-center text-[9px] font-bold uppercase tracking-wider text-indigo-800">Current Stock</th>
              <th className="px-1 py-3 w-[10%] text-center text-[9px] font-bold uppercase tracking-wider text-indigo-800">Last Activity</th>
              <th className="px-1 py-3 w-[10%] text-center text-[9px] font-bold uppercase tracking-wider text-indigo-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(10)].map((_, i) => (
                <tr key={i} className="animate-pulse bg-white/50 border-b border-black/5 last:border-0">
                  <td className="py-4"><div className="h-4 bg-gray-200 rounded w-6 mx-auto"></div></td>
                  <td className="px-1">
                    <div className="flex items-center gap-3">
                      <div className="w-6"></div>
                      <div className="w-8 h-10 bg-gray-200 rounded shrink-0"></div>
                      <div className="h-4 bg-gray-200 rounded w-full max-w-[150px]"></div>
                    </div>
                  </td>
                  <td className="px-1"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                  <td className="px-1">
                    <div className="flex items-center justify-center gap-1">
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                    </div>
                  </td>
                  <td className="px-1"><div className="h-4 bg-gray-200 rounded w-4 mx-auto"></div></td>
                  <td className="px-1"><div className="h-4 bg-gray-200 rounded w-4 mx-auto"></div></td>
                  <td className="px-1"><div className="h-4 bg-gray-200 rounded w-4 mx-auto"></div></td>
                  <td className="px-1"><div className="h-5 bg-gray-200 rounded w-6 mx-auto"></div></td>
                  <td className="px-1"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                  <td className="px-1"><div className="h-8 bg-gray-200 rounded-lg w-full"></div></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-gray-400 text-sm italic">
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
                    <tr className={isExpanded ? 'bg-gray-50' : ''}>
                      <td className="text-gray-500 text-center px-1 py-2">{sNo}</td>
                      <td className="px-1 py-2">
                        <div className="flex items-center gap-3">
                          {hasDistribution ? (
                            <button
                              onClick={() => setExpandedRow(isExpanded ? null : book.id)}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/5 text-paa-navy"
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          ) : (
                            <div className="w-6"></div>
                          )}
                          {book.coverUrl && (
                            <img src={book.coverUrl} alt="Cover" className="w-8 h-10 object-cover rounded shadow-sm border border-black/5" />
                          )}
                          <div className="font-bold text-paa-navy truncate" title={book.title}>
                            {book.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-1 py-2 font-medium text-gray-700 truncate" title={book.authorName}>{book.authorName}</td>
                      <td className="px-1 py-2 text-center">{book.masterStock}</td>
                      <td className="px-1 py-2 text-center">{book.webSold}</td>
                      <td className="px-1 py-2 text-center">{book.airportQty}</td>
                      <td className="px-1 py-2 text-center">{book.eventQty}</td>
                      <td className="px-1 py-2 text-center">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <span className="font-bold text-paa-navy">{book.currentStock}</span>
                          {book.isLowStock && (
                            <span className="text-[9px] font-bold uppercase tracking-widest text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.5 animate-pulse mt-0.5">
                              LOW STOCK
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-1 py-2 text-center text-gray-500 text-[10px]">
                        {new Date(book.lastActivity).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-1 py-2 text-center">
                        {book.isLowStock ? (
                          <button
                            onClick={() => pingAuthor(book.id, book.authorId)}
                            disabled={isPinged || isPinging}
                            className={`flex items-center justify-center gap-1.5 w-full py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all ${isPinged
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                              }`}
                          >
                            {isPinging ? <Loader2 size={12} className="animate-spin" /> :
                              isPinged ? <CheckCircle2 size={12} /> : <BellRing size={12} />}
                            {isPinged ? 'Pinged' : 'Restock'}
                          </button>
                        ) : (
                          <span className="text-gray-300 text-[10px]">-</span>
                        )}
                      </td>
                    </tr>
                    {/* EXPANDED ROW */}
                    {isExpanded && (
                      <tr className="bg-gray-50/80 border-b border-black/5">
                        <td colSpan={7} className="p-0">
                          <div className="pl-20 pr-4 py-4">
                            {hasDistribution && (
                              <>
                                <h4 className="text-xs font-bold text-paa-gray-text uppercase tracking-wider mb-3">Detailed Location Breakdown</h4>
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
                              </>
                            )}
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
        <div className="mt-auto p-4 flex items-center justify-between">
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
  );
}
