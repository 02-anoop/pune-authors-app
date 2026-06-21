import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router';
import { ShoppingCart, Plus, Minus, ArrowLeft, CheckCircle, QrCode } from 'lucide-react';
import { toast } from 'sonner';

export function LivePosDashboard() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [salesSummary, setSalesSummary] = useState<any>(null);

  const fetchInventory = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/events/${eventId}/pos-inventory`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAuthor(res.data.author);
      setInventory(res.data.eventBooks);
    } catch (err) {
      toast.error('Failed to load POS inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/events/${eventId}/pos-sales-summary`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSalesSummary(res.data);
    } catch (err) {
      toast.error('Failed to load summary');
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [eventId]);

  const addToCart = (book: any, maxQty: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.bookId === book.id);
      if (existing) {
        if (existing.quantity >= maxQty) {
           toast.error('Not enough stock!');
           return prev;
        }
        return prev.map(i => i.bookId === book.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { bookId: book.id, title: book.title, price: book.mrp, quantity: 1, maxQty }];
    });
  };

  const updateCartQty = (bookId: number, delta: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.bookId === bookId);
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) return prev.filter(i => i.bookId !== bookId);
      if (newQty > existing.maxQty) {
         toast.error('Not enough stock!');
         return prev;
      }
      return prev.map(i => i.bookId === bookId ? { ...i, quantity: newQty } : i);
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/events/${eventId}/pos-checkout`, {
        cart: cart.map(c => ({ bookId: c.bookId, quantity: c.quantity, price: c.price })),
        paymentMethod,
        totalAmount
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Sale recorded successfully!');
      setCart([]);
      setShowPaymentModal(false);
      fetchInventory();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans fixed inset-0 z-[200]">
        <div className="bg-paa-navy h-16 shrink-0 w-full animate-pulse"></div>
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row p-4 gap-4">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[280px] bg-white rounded animate-pulse border border-gray-200"></div>
            ))}
          </div>
          <div className="w-full md:w-[350px] lg:w-[400px] h-[45%] md:h-full bg-white rounded animate-pulse border border-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans fixed inset-0 z-[200]">
      {/* Header */}
      <div className="bg-white border-b border-paa-navy/5 px-6 py-4 flex justify-between items-center shrink-0 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard/events')} className="w-10 h-10 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-full transition-colors flex items-center justify-center shadow-sm hover:shadow">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-serif text-paa-navy tracking-tight leading-tight font-bold">Live POS Dashboard</h1>
            <p className="text-xs font-bold uppercase tracking-widest text-paa-gray-text mt-1">Book Fair Fast Checkout</p>
          </div>
        </div>
        <button 
          onClick={() => { fetchSummary(); setShowSummary(true); }}
          className="dash-btn dash-btn-primary"
        >
          Day Summary
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row relative z-0">
        {/* Left Side - Inventory Grid */}
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar bg-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:pb-0">
            {inventory.map((eb: any) => {
              const available = eb.listedStock - eb.soldStock;
              return (
                <div key={eb.id} className="bg-white border border-paa-navy/5 rounded-xl p-5 flex flex-col shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out h-[300px]">
                  <div className="h-36 bg-gray-100 mb-4 rounded-lg flex items-center justify-center overflow-hidden shrink-0 w-full relative">
                    {eb.book.coverUrl ? (
                      <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${eb.book.coverUrl}`} className="h-full w-full object-cover" alt={eb.book.title} />
                    ) : (
                      <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">No Cover</span>
                    )}
                    {available <= 0 && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <span className="bg-red-100 text-red-800 px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-3xl-2xl border border-red-200 shadow-sm">Sold Out</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-lg text-paa-navy leading-tight mb-2 line-clamp-2" title={eb.book.title}>{eb.book.title}</h3>
                  <div className="flex justify-between items-center mt-auto pt-3 border-t border-paa-navy/5">
                    <div>
                       <div className="text-paa-navy font-black text-xl leading-none">₹{eb.book.mrp}</div>
                       <div className="text-[10px] text-paa-gray-text font-bold uppercase tracking-widest mt-1">{available} left</div>
                    </div>
                    <button 
                      onClick={() => addToCart(eb.book, available)}
                      disabled={available <= 0}
                      className="w-10 h-10 bg-paa-navy/5 text-paa-navy border border-paa-navy/10 rounded-full flex items-center justify-center hover:bg-paa-navy hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side - Cart */}
        <div className="w-full md:w-[350px] lg:w-[400px] bg-white border-t md:border-t-0 md:border-l border-paa-navy/5 flex flex-col shrink-0 h-[45%] md:h-full shadow-[-4px_0_20px_rgba(0,0,0,0.04)] md:shadow-none z-20">
          <div className="p-6 bg-white border-b border-paa-navy/5 flex items-center justify-between shrink-0 hidden md:flex">
             <h2 className="text-xl font-serif text-paa-navy font-bold flex items-center gap-2"><ShoppingCart size={20} /> Current Order</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <ShoppingCart size={48} className="mb-4 opacity-20" />
                <p>Cart is empty</p>
                <p className="text-xs mt-1 text-gray-500">Add items from the grid</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.bookId} className="flex justify-between items-center border-b border-paa-navy/5 pb-3">
                    <div className="flex-1 pr-2 min-w-0">
                      <div className="text-sm font-bold text-paa-navy line-clamp-1">{item.title}</div>
                      <div className="text-xs text-paa-gray-text font-bold">₹{item.price}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button onClick={() => updateCartQty(item.bookId, -1)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-paa-navy transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-sm w-4 text-center text-paa-navy">{item.quantity}</span>
                      <button onClick={() => updateCartQty(item.bookId, 1)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-paa-navy transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50 border-t border-paa-navy/5 space-y-4 shrink-0 relative z-10">
            <div className="flex justify-between items-center text-xs font-bold text-paa-gray-text uppercase tracking-widest mb-1">
               <span>Total Books</span>
               <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between items-center text-lg border-t border-paa-navy/5 pt-3">
              <span className="font-bold text-paa-gray-text uppercase tracking-widest text-xs">Total Amount</span>
              <span className="font-serif font-bold text-paa-navy text-2xl">₹{totalAmount}</span>
            </div>
            <button 
              onClick={() => setShowPaymentModal(true)}
              disabled={cart.length === 0}
              className="dash-btn dash-btn-primary w-full justify-center bg-green-600 border-none hover:bg-green-700 text-white py-3 shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              Charge Customer (₹{totalAmount})
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm md:max-w-md w-full overflow-hidden flex flex-col max-h-[95vh] animate-fade-in-up">
            <div className="bg-paa-navy text-white p-4 md:p-5 flex justify-between items-center shrink-0">
              <h2 className="font-bold uppercase tracking-widest text-sm md:text-base">Complete Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-full"><ArrowLeft size={18} /></button>
            </div>
            <div className="p-5 md:p-8 flex-1 overflow-y-auto text-center space-y-6 md:space-y-8">
              <div className="text-5xl md:text-6xl font-serif font-bold text-paa-navy drop-shadow-sm">₹{totalAmount}</div>
              
              <div className="flex gap-3 justify-center border-b pb-6">
                 <button onClick={() => setPaymentMethod('UPI')} className={`flex-1 py-3 border-2 font-bold uppercase tracking-widest text-xs rounded-xl transition-all duration-300 ${paymentMethod === 'UPI' ? 'bg-[#e4ebf5] border-paa-navy text-paa-navy shadow-inner' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>UPI QR</button>
                 <button onClick={() => setPaymentMethod('Cash')} className={`flex-1 py-3 border-2 font-bold uppercase tracking-widest text-xs rounded-xl transition-all duration-300 ${paymentMethod === 'Cash' ? 'bg-[#e4ebf5] border-paa-navy text-paa-navy shadow-inner' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Cash</button>
              </div>

              {paymentMethod === 'UPI' && (
                <div className="flex flex-col items-center animate-fade-in-up">
                  {author?.qrCodeUrl ? (
                    <>
                      <p className="text-xs md:text-sm text-gray-500 mb-4 font-medium px-4">Ask customer to scan this QR code to pay directly to you.</p>
                      <div className="p-2 md:p-3 bg-white border-2 border-gray-100 rounded-2xl shadow-premium">
                        <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${author.qrCodeUrl}`} alt="QR Code" className="w-full max-w-[200px] md:max-w-[240px] aspect-square object-contain rounded-xl" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full max-w-[240px] aspect-square border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 bg-gray-50 p-6">
                       <QrCode size={48} className="mb-3 opacity-40 text-gray-500" />
                       <span className="text-xs text-center font-medium">No QR Code uploaded in your profile.</span>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'Cash' && (
                <div className="py-6 md:py-8 text-paa-navy font-bold flex flex-col items-center animate-fade-in-up">
                   <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-5 border-4 border-green-100 shadow-sm">
                      <span className="text-3xl font-serif">₹</span>
                   </div>
                   <span className="text-lg">Receive <span className="text-green-700">₹{totalAmount}</span> in cash.</span>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="w-1/3 py-4 bg-gray-200 text-gray-700 font-bold uppercase tracking-widest rounded hover:bg-gray-300 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="flex-1 bg-paa-navy text-paa-cream py-4 rounded font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-paa-gold hover:text-paa-navy transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isProcessing ? 'Processing...' : <><CheckCircle size={18} /> Payment Received</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-paa-navy text-white p-4 flex justify-between items-center shrink-0">
              <h2 className="font-bold uppercase tracking-widest">Day Summary</h2>
              <button onClick={() => setShowSummary(false)} className="text-white/80 hover:text-white transition-colors"><ArrowLeft size={20} /></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              {!salesSummary ? (
                 <div className="text-center py-8">Loading...</div>
              ) : (
                 <>
                   <div className="grid grid-cols-3 gap-3 mb-8">
                     <div className="bg-[#e4ebf5] p-3 rounded text-center border border-paa-navy/10 shadow-sm">
                        <div className="text-[10px] font-bold text-paa-navy uppercase tracking-widest mb-1">Revenue</div>
                        <div className="text-xl font-serif text-paa-navy">₹{salesSummary.summary.totalRevenue}</div>
                     </div>
                     <div className="bg-[#e4ebf5] p-3 rounded text-center border border-paa-navy/10 shadow-sm">
                        <div className="text-[10px] font-bold text-paa-navy uppercase tracking-widest mb-1">Txns</div>
                        <div className="text-xl font-bold text-paa-navy">{salesSummary.summary.totalTransactions}</div>
                     </div>
                     <div className="bg-[#e4ebf5] p-3 rounded text-center border border-paa-navy/10 shadow-sm">
                        <div className="text-[10px] font-bold text-paa-navy uppercase tracking-widest mb-1">Books Sold</div>
                        <div className="text-xl font-bold text-paa-navy">{salesSummary.summary.totalBooksSold}</div>
                     </div>
                   </div>

                   <h3 className="font-bold text-sm uppercase tracking-widest text-gray-500 mb-3 border-b pb-2">Recent Transactions</h3>
                   <div className="space-y-3">
                     {salesSummary.posOrders.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No sales recorded yet today.</p>
                     ) : (
                       salesSummary.posOrders.map((o: any) => (
                         <div key={o.id} className="border border-gray-200 p-3 rounded bg-white flex justify-between items-center shadow-sm">
                           <div>
                              <div className="text-xs font-bold text-paa-navy uppercase tracking-widest flex items-center gap-1">
                                #{o.id} • {o.paymentMethod} {o.paymentMethod === 'UPI' && <CheckCircle size={10} className="text-green-600"/>}
                              </div>
                              <div className="text-[10px] text-gray-500 font-medium">{new Date(o.createdAt).toLocaleTimeString()}</div>
                           </div>
                           <div className="text-right">
                              <div className="font-bold text-green-700">₹{o.totalAmount}</div>
                              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{o.items.reduce((acc: number, curr: any) => acc + curr.quantity, 0)} items</div>
                           </div>
                         </div>
                       ))
                     )}
                   </div>

                   {salesSummary.eventBooks && salesSummary.eventBooks.length > 0 && (
                     <>
                       <h3 className="font-bold text-sm uppercase tracking-widest text-gray-500 mt-6 mb-3 border-b pb-2">Inventory Status</h3>
                       <div className="space-y-3">
                         {salesSummary.eventBooks.map((eb: any) => (
                           <div key={eb.id} className="border border-gray-200 p-3 rounded bg-white flex justify-between items-center shadow-sm">
                             <div className="flex-1 pr-2">
                               <div className="text-xs font-bold text-paa-navy line-clamp-1">{eb.book.title}</div>
                               <div className="text-[10px] text-gray-500 font-medium">₹{eb.book.mrp}</div>
                             </div>
                             <div className="text-right flex gap-3">
                               <div className="text-center">
                                 <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Sold</div>
                                 <div className="font-bold text-paa-navy">{eb.soldStock}</div>
                               </div>
                               <div className="text-center">
                                 <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Left</div>
                                 <div className={`font-bold ${eb.listedStock - eb.soldStock > 0 ? 'text-green-700' : 'text-red-500'}`}>{eb.listedStock - eb.soldStock}</div>
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                     </>
                   )}
                 </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
