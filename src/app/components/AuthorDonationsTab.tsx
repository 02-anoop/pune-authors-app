import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, MapPin, Calendar, Clock, BookOpen, CheckCircle2, Package, Upload, Download, FileText, Landmark, FileSpreadsheet, ShieldCheck, BadgeAlert, Sparkles, ChevronRight, X, User, Phone, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import qrCode from "./data/qr_code.jpeg";

export function AuthorDonationsTab({ dashboardData, onRefresh }: { dashboardData?: any, onRefresh?: () => void }) {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [authorBooks, setAuthorBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState<number | null>(null);
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
  
  // For donation form
  const [selectedBooks, setSelectedBooks] = useState<{ bookId: number, qty: number }[]>([]);
  const [payAsYouWishAmount, setPayAsYouWishAmount] = useState<number>(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Payment upload states
  const [transactionId, setTransactionId] = useState('');
  const [paymentBlob, setPaymentBlob] = useState<File | null>(null);
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string | null>(null);

  const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const fetchMyRegistrations = async () => {
    try {
      const res = await axios.get(`${API}/api/author/donation-registrations`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setMyRegistrations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRegistration = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this donation registration? This action cannot be undone.")) return;
    try {
      await axios.delete(`${API}/api/author/donation-registrations/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success("Donation registration deleted");
      fetchMyRegistrations();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete registration");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [annRes, booksRes, regRes] = await Promise.all([
          axios.get(`${API}/api/author/donation-announcements`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          axios.get(`${API}/api/author/books`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          axios.get(`${API}/api/author/donation-registrations`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        ]);
        setAnnouncements(annRes.data);
        setAuthorBooks(booksRes.data.filter((b: any) => b.status === 'Approved'));
        setMyRegistrations(regRes.data);
      } catch (err) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBookSelect = (bookId: number, qty: string) => {
    const parsedQty = parseInt(qty) || 0;
    const existing = selectedBooks.find(b => b.bookId === bookId);
    
    if (parsedQty <= 0) {
      setSelectedBooks(prev => prev.filter(b => b.bookId !== bookId));
    } else if (existing) {
      setSelectedBooks(prev => prev.map(b => b.bookId === bookId ? { ...b, qty: parsedQty } : b));
    } else {
      setSelectedBooks(prev => [...prev, { bookId, qty: parsedQty }]);
    }
  };

  const calculateFee = (ann: any) => {
    if (!ann || ann.feeType === 'Free') return 0;
    if (ann.feeType === 'Per Author') return ann.feeAmount || 0;
    if (ann.feeType === 'Per Title') return (ann.feeAmount || 0) * selectedBooks.length;
    if (ann.feeType === 'Pay As You Wish') return payAsYouWishAmount || 0;
    return 0;
  };

  const handleRegister = async (announcement: any) => {
    if (selectedBooks.length === 0) {
      toast.error('Please select at least one book to donate');
      return;
    }

    const feeToPay = calculateFee(announcement);
    if (announcement.feeType === 'Pay As You Wish' && feeToPay <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    if (feeToPay > 0) {
      if (!transactionId.trim()) {
        toast.error('UPI Transaction ID is required for paid registrations.');
        return;
      }
      if (!paymentBlob) {
        toast.error('Please upload your payment screenshot.');
        return;
      }
    }

    setIsProcessingPayment(true);
    try {
      const formData = new FormData();
      formData.append('announcementId', announcement.id.toString());
      formData.append('books', JSON.stringify(selectedBooks.map(b => ({ bookId: b.bookId, quantityDonated: b.qty }))));
      formData.append('feePaid', feeToPay.toString());
      formData.append('paymentStatus', feeToPay > 0 ? 'Pending' : 'Completed');
      if (transactionId) {
        formData.append('transactionId', transactionId);
      }
      if (paymentBlob) {
        formData.append('paymentScreenshot', paymentBlob);
      }

      await axios.post(`${API}/api/author/donations`, formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success(feeToPay > 0 
        ? 'Donation registered successfully! Awaiting payment verification by Admin.' 
        : 'Successfully registered for donation drive!'
      );
      
      setIsRegistering(null);
      setSelectedBooks([]);
      setPayAsYouWishAmount(0);
      setTransactionId('');
      setPaymentBlob(null);
      setPaymentScreenshotUrl(null);
      fetchMyRegistrations();
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error('Failed to register donation');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // CSV Report Generator
  const handleExportMyDonationReport = () => {
    const regs = myRegistrations;
    if (regs.length === 0) {
      toast.error('No donation records found to export');
      return;
    }

    let csvContent = 'Date,Campaign,Library Name,Book Title,MRP (₹),Qty Committed,Status,Dispatch Status,Received Status\n';
    
    regs.forEach((reg: any) => {
      const date = new Date(reg.createdAt).toLocaleDateString();
      const campaign = reg.announcement?.title?.replace(/,/g, ' ') || 'Unknown';
      const libraryName = reg.announcement?.library?.name?.replace(/,/g, ' ') || 'Unknown';
      
      reg.books.forEach((b: any) => {
        const title = b.book?.title?.replace(/,/g, ' ') || 'Unknown';
        const mrp = b.book?.mrp || 0;
        const qty = b.quantityDonated || 0;
        const status = reg.status || 'Pending';
        const dispatchStatus = reg.dispatchStatus || 'Pending';
        const receivedStatus = reg.receivedStatus || 'Pending';

        csvContent += `"${date}","${campaign}","${libraryName}","${title}",${mrp},${qty},"${status}","${dispatchStatus}","${receivedStatus}"\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'my_library_donations_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats Calculations
  const statsCampaigns = myRegistrations.length;
  const statsBooksPledged = myRegistrations.reduce(
    (sum: number, reg: any) => sum + reg.books.reduce((acc: number, b: any) => acc + (b.quantityDonated || 0), 0), 0
  ) || 0;
  const statsValue = myRegistrations.reduce(
    (sum: number, reg: any) => sum + reg.books.reduce((acc: number, b: any) => acc + ((b.quantityDonated || 0) * (b.book?.mrp || 0)), 0), 0
  ) || 0;
  const statsPending = myRegistrations.filter((r: any) => r.status === 'Pending' || r.status === 'Registered').length || 0;

  if (loading) return <div className="p-8 text-center text-gray-500">Loading active donation drives...</div>;

  return (
    <div className="space-y-8">
      {/* Header and Report Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-paa-navy to-indigo-950 p-6 rounded-2xl text-white shadow-md border border-white/10">
        <div>
          <h2 className="text-3xl font-serif font-bold text-white flex items-center gap-2">
            Library Donations Ecosystem <Sparkles className="w-5 h-5 text-paa-gold animate-pulse" />
          </h2>
          <p className="text-gray-300 text-sm mt-1">Donate your books to Airport Libraries, Public Libraries, and Cafes</p>
        </div>
        <button
          onClick={handleExportMyDonationReport}
          className="dash-btn bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 active:scale-95 transition-all"
        >
          <Download className="w-4 h-4 text-paa-gold" /> Export Donation Report
        </button>
      </div>

      {/* 3-4 Beautiful Statistical Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border-l-4 border-l-blue-600 border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Campaigns Joined</div>
          <div className="text-3xl font-bold font-serif text-blue-600">{statsCampaigns}</div>
          <p className="text-[10px] text-gray-400 mt-2">Active & legacy campaign involvements</p>
        </div>
        <div className="bg-white rounded-2xl border-l-4 border-l-purple-600 border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Books Donated</div>
          <div className="text-3xl font-bold font-serif text-purple-600">{statsBooksPledged}</div>
          <p className="text-[10px] text-gray-400 mt-2">Total copies committed to collections</p>
        </div>
        <div className="bg-white rounded-2xl border-l-4 border-l-emerald-600 border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Donation Value (MRP)</div>
          <div className="text-3xl font-bold font-serif text-emerald-600">₹{statsValue.toLocaleString('en-IN')}</div>
          <p className="text-[10px] text-gray-400 mt-2">Total value contributed at MRP</p>
        </div>
        <div className="bg-white rounded-2xl border-l-4 border-l-amber-500 border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Awaiting Review</div>
          <div className="text-3xl font-bold font-serif text-amber-500">{statsPending}</div>
          <p className="text-[10px] text-gray-400 mt-2">Pending payment or status verifications</p>
        </div>
      </div>

      {/* Campaigns Listing */}
      <div className="space-y-5">
        <h3 className="text-xl font-bold text-paa-navy font-serif border-b pb-2 flex items-center gap-2">
          Active Donation Campaigns <Megaphone className="w-5 h-5 text-purple-500" />
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {announcements.length === 0 ? (
            <div className="lg:col-span-2 bg-white rounded-2xl p-12 text-center text-gray-500 border border-dashed border-gray-200">
              <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-base font-semibold">No Active Campaigns</p>
              <p className="text-sm text-gray-400 mt-1">We will notify you here when a new donation drive is launched.</p>
            </div>
          ) : announcements.map(ann => (
            <div key={ann.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:border-paa-navy/20 transition-all duration-300">
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3 gap-3">
                  <h4 className="text-lg font-bold text-paa-navy font-serif leading-snug">{ann.title}</h4>
                  {ann.visibility === 'Closed' ? (
                    <span className="shrink-0 px-3 py-1 bg-gray-500 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-sm">
                      Closed
                    </span>
                  ) : (
                    <span className="shrink-0 px-3 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-sm">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3" title={ann.description}>{ann.description}</p>
                
                <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-paa-navy">{ann.library?.name}</p>
                      <p className="text-xs text-gray-500">{ann.library?.city}, {ann.library?.state}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-500 shrink-0" />
                    <p className="text-sm text-gray-700">Deadline: <span className="font-semibold text-purple-700">{new Date(ann.registrationEndDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></p>
                  </div>
                  {ann.feeType && ann.feeType !== 'Free' ? (
                    <div className="flex items-center gap-3">
                      <Landmark className="w-5 h-5 text-amber-500 shrink-0" />
                      <p className="text-sm text-gray-700">Fee: <span className="font-semibold text-amber-700">{ann.feeType}</span> {ann.feeAmount ? `(₹${ann.feeAmount})` : ''}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                      <p className="text-sm text-emerald-700 font-semibold">Free Registration</p>
                    </div>
                  )}
                  {ann.collectionPoint && (
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-indigo-500 shrink-0" />
                      <p className="text-sm text-gray-700">Hub: <span className="font-medium text-indigo-700">{ann.collectionPoint}</span></p>
                    </div>
                  )}
                </div>

                {isRegistering === ann.id ? (
                  <div className="border-t pt-5 space-y-5">
                    <div className="flex items-center justify-between border-b pb-2 mb-2">
                      <h5 className="font-bold text-paa-navy text-sm">Campaign Delivery & Contact Details</h5>
                      <button onClick={() => { setIsRegistering(null); setSelectedBooks([]); }} className="p-1 text-red-500 hover:bg-red-50 rounded-full"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/40 p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-4 animate-in fade-in duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Expected Collection Date</span>
                          <div className="text-gray-900 font-semibold text-xs flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span>
                              {ann.expectedCollectionDate ? (() => {
                                const clean = ann.expectedCollectionDate.split('T')[0];
                                const d = new Date(clean);
                                return isNaN(d.getTime()) ? clean : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                              })() : 'N/A'}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Contact Person</span>
                          <div className="text-gray-900 font-semibold text-xs flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-indigo-600 shrink-0" />
                              <span>{ann.contactPerson || 'N/A'}</span>
                            </div>
                            {ann.contactNumber && (
                              <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                                <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                <span>{ann.contactNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Delivery Address</span>
                          <div className="text-gray-900 font-semibold text-xs flex items-start gap-2 leading-relaxed">
                            <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            <span>
                              {ann.dispatchAddress || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-paa-navy text-sm">1. Select Books & Quantities</h5>
                    </div>
                    {authorBooks.length === 0 ? (
                      <p className="text-xs text-red-500 bg-red-50 border border-red-100 p-3 rounded-lg font-medium">You don't have any approved books in the catalog yet. Only approved books can be donated.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto mb-4 p-2 bg-gray-50 rounded-xl border border-gray-200">
                        {authorBooks.map(book => {
                          const isSelected = selectedBooks.some(b => b.bookId === book.id);
                          return (
                            <div key={book.id} className={`flex justify-between items-center bg-white p-3 rounded-lg border transition-colors ${isSelected ? 'border-paa-navy shadow-sm' : 'border-gray-200'}`}>
                              <div className="flex items-center gap-3 min-w-0">
                                <BookOpen className={`w-4 h-4 ${isSelected ? 'text-paa-navy' : 'text-gray-400'} shrink-0`} />
                                <span className="text-xs font-semibold text-paa-navy truncate" title={book.title}>{book.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Qty:</span>
                                <input 
                                  type="number" 
                                  min="0" 
                                  placeholder="0"
                                  className="w-16 p-1 text-xs border rounded-lg text-center font-bold focus:border-paa-navy focus:ring-1 focus:ring-paa-navy outline-none"
                                  onChange={(e) => handleBookSelect(book.id, e.target.value)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Fee and QR code payment scanner */}
                    {calculateFee(ann) > 0 && (
                      <div className="bg-amber-50/40 border border-amber-200 rounded-xl p-5 space-y-4">
                        <div className="flex justify-between items-center border-b border-amber-200/50 pb-2">
                          <div className="text-xs font-bold text-amber-800 uppercase tracking-widest">2. Pay Application Fee</div>
                          <div className="text-base font-bold text-amber-900">Total: ₹{calculateFee(ann)}</div>
                        </div>

                        {ann.feeType === 'Pay As You Wish' && (
                          <div className="flex items-center justify-between gap-3 bg-white p-2 rounded-lg border border-amber-200">
                            <span className="text-xs font-bold text-amber-800">Enter custom donation amount:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-gray-400">₹</span>
                              <input 
                                type="number" 
                                min="1"
                                value={payAsYouWishAmount || ''}
                                onChange={e => setPayAsYouWishAmount(parseInt(e.target.value) || 0)}
                                className="w-20 p-1 text-xs border rounded text-right border-gray-300 focus:border-paa-navy outline-none font-bold"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col items-center py-2 bg-white rounded-xl border border-amber-100 shadow-sm">
                          <div className="p-1 bg-white border border-gray-100 rounded-lg shadow-sm">
                            <img src={qrCode} alt="Payment QR" className="w-36 h-36 object-cover rounded" />
                          </div>
                          <p className="text-[10px] font-bold tracking-widest text-paa-navy bg-paa-gold/20 px-3 py-1 rounded-full mt-2 uppercase">Scan to pay via UPI</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Transaction ID *</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="UPI Ref No." 
                              value={transactionId} 
                              onChange={e => setTransactionId(e.target.value)} 
                              className="w-full bg-white border border-gray-300 p-2 rounded-lg text-xs font-semibold focus:border-paa-navy outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Screenshot *</label>
                            <div 
                              onClick={() => document.getElementById(`screenshot-uploader-${ann.id}`)?.click()}
                              className="border border-dashed border-gray-300 rounded-lg p-2.5 text-center bg-white hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[52px]"
                            >
                              {paymentScreenshotUrl ? (
                                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">✓ Screenshot Attached</span>
                              ) : (
                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Upload className="w-3 h-3" /> Upload File</span>
                              )}
                            </div>
                            <input 
                              type="file" 
                              id={`screenshot-uploader-${ann.id}`}
                              accept="image/*"
                              className="hidden"
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setPaymentBlob(file);
                                  setPaymentScreenshotUrl(URL.createObjectURL(file));
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-2 pt-3 border-t">
                      <button onClick={() => { setIsRegistering(null); setSelectedBooks([]); setTransactionId(''); setPaymentBlob(null); setPaymentScreenshotUrl(null); }} disabled={isProcessingPayment} className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
                      <button 
                        onClick={() => handleRegister(ann)}
                        disabled={selectedBooks.length === 0 || isProcessingPayment}
                        className="px-5 py-2 bg-paa-navy text-white rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-indigo-950 active:scale-95 flex items-center gap-2 shadow-sm transition-all"
                      >
                        {isProcessingPayment ? 'Processing...' : calculateFee(ann) > 0 ? `Pay ₹${calculateFee(ann)} & Register` : 'Register Donation'}
                      </button>
                    </div>
                  </div>
                ) : ann.visibility === 'Closed' ? (
                  <button 
                    disabled
                    className="w-full py-3 bg-gray-100 border-2 border-gray-300 text-gray-400 font-bold rounded-xl cursor-not-allowed text-center uppercase tracking-wider text-xs"
                  >
                    Campaign Closed
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsRegistering(ann.id)}
                    className="w-full py-3 bg-white border-2 border-paa-navy text-paa-navy font-bold rounded-xl hover:bg-paa-navy hover:text-white transition-colors active:scale-98"
                  >
                    Register / Donate Books
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Donation History Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-paa-navy font-serif">Donation History & Tracker</h3>
            <p className="text-xs text-gray-500 mt-1">Real-time status updates of your library submissions</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap min-w-max">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Campaign / Library</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Book Details</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Qty</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Dispatch Details</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Received Status</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myRegistrations.flatMap((reg: any) => 
                reg.books.map((b: any) => (
                  <tr key={`${reg.id}-${b.bookId}`} className="hover:bg-gray-50/40 transition-colors">
                    <td className="p-4 text-sm text-gray-600">{new Date(reg.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="p-4">
                      <div className="text-sm font-semibold text-paa-navy">{reg.announcement?.title}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {reg.announcement?.library?.name} ({reg.announcement?.library?.city})</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-semibold text-gray-800">{b.book?.title}</div>
                      <div className="text-xs text-gray-400">MRP: ₹{b.book?.mrp}</div>
                    </td>
                    <td className="p-4 text-sm font-bold text-center text-gray-600">{b.quantityDonated}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                        reg.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                        reg.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-gray-400" /> {reg.dispatchStatus}</span>
                        {reg.courierPartner && <span className="text-[10px] text-gray-400 mt-0.5">{reg.courierPartner} {reg.trackingNumber ? `(${reg.trackingNumber})` : ''}</span>}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                        reg.receivedStatus === 'Received' || reg.receivedStatus === 'Delivered' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {reg.receivedStatus}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-right">
                      {reg.status !== 'Approved' ? (
                        <button
                          onClick={() => handleDeleteRegistration(reg.id)}
                          className="px-2 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded transition-all cursor-pointer active:scale-95 inline-flex items-center gap-1 font-bold text-xs shadow-sm"
                          title="Delete Donation Registration"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-200 rounded px-2 py-1 select-none">Approved</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
              {myRegistrations.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400 text-sm">You haven't made any library donations yet. Active campaigns will appear above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

