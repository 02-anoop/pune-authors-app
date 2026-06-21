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

  if (loading) return <div className="flex h-screen items-center justify-center text-paa-navy font-bold text-xl">Loading POS...</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans fixed inset-0 z-[200]">
      {/* Header */}
      <div className="bg-paa-navy text-white px-4 py-3 flex justify-between items-center shrink-0 shadow-sm relative z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard/events')} className="p-2 bg-white/10 hover:bg-white/20 rounded transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold uppercase tracking-widest leading-tight">Live POS</h1>
            <p className="text-xs text-blue-200">Book Fair Fast Checkout</p>
          </div>
        </div>
        <button 
          onClick={() => { fetchSummary(); setShowSummary(true); }}
          className="bg-paa-gold text-paa-navy px-4 py-2 font-bold uppercase tracking-widest text-xs rounded shadow hover:bg-yellow-400 transition-colors"
        >
          Day Summary
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row relative z-0">
        {/* Left Side - Inventory Grid */}
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar bg-gray-100">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-24 md:pb-0">
            {inventory.map((eb: any) => {
              const available = eb.listedStock - eb.soldStock;
              return (
                <div key={eb.id} className="bg-white border border-gray-200 rounded p-3 flex flex-col shadow-sm hover:border-paa-navy transition-colors h-[280px]">
                  <div className="h-40 bg-gray-100 mb-3 rounded flex items-center justify-center overflow-hidden shrink-0 w-full relative">
                    {eb.book.coverUrl ? (
                      <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${eb.book.coverUrl}`} className="h-full w-full object-cover" alt={eb.book.title} />
                    ) : (
                      <span className="text-gray-400 text-xs">No Cover</span>
                    )}
                    {available <= 0 && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <span className="bg-red-100 text-red-800 px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded border border-red-200">Sold Out</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-paa-navy leading-tight mb-1 line-clamp-2" title={eb.book.title}>{eb.book.title}</h3>
                  <div className="flex justify-between items-center mt-auto">
                    <div>
                       <div className="text-green-700 font-bold">₹{eb.book.mrp}</div>
                       <div className="text-[10px] text-gray-500 font-bold uppercase">{available} left</div>
                    </div>
                    <button 
                      onClick={() => addToCart(eb.book, available)}
                      disabled={available <= 0}
                      className="w-10 h-10 bg-[#e4ebf5] text-paa-navy rounded-full flex items-center justify-center hover:bg-paa-navy hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
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
        <div className="w-full md:w-[350px] lg:w-[400px] bg-white border-t md:border-t-0 md:border-l border-gray-200 flex flex-col shrink-0 h-1/2 md:h-full absolute md:relative bottom-0 left-0 right-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none">
          <div className="p-4 bg-[#f8fafc] border-b flex items-center gap-2 text-paa-navy shrink-0 hidden md:flex">
            <ShoppingCart size={20} />
            <h2 className="font-bold uppercase tracking-widest text-sm">Current Cart</h2>
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
                  <div key={item.bookId} className="flex justify-between items-center border-b pb-3">
                    <div className="flex-1 pr-2 min-w-0">
                      <div className="text-sm font-bold text-paa-navy line-clamp-1">{item.title}</div>
                      <div className="text-xs text-gray-500">₹{item.price}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button onClick={() => updateCartQty(item.bookId, -1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-paa-navy transition-colors">
                        <Minus size={16} />
                      </button>
                      <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateCartQty(item.bookId, 1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-paa-navy transition-colors">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t space-y-4 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] relative z-10">
            <div className="flex justify-between items-center text-sm font-bold text-gray-500 mb-1">
               <span>Total Books</span>
               <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between items-center text-lg border-t pt-2">
              <span className="font-bold text-gray-600 uppercase tracking-widest text-xs">Total Amount</span>
              <span className="font-serif font-bold text-paa-navy text-2xl">₹{totalAmount}</span>
            </div>
            <button 
              onClick={() => setShowPaymentModal(true)}
              disabled={cart.length === 0}
              className="w-full bg-[#5cb85c] hover:bg-[#4cae4c] text-white py-4 rounded text-sm font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Charge Customer (₹{totalAmount})
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-paa-navy text-white p-4 flex justify-between items-center shrink-0">
              <h2 className="font-bold uppercase tracking-widest">Complete Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-white/80 hover:text-white transition-colors"><ArrowLeft size={20} /></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto text-center space-y-6">
              <div className="text-4xl font-serif font-bold text-paa-navy">₹{totalAmount}</div>
              
              <div className="flex gap-2 justify-center border-b pb-6">
                 <button onClick={() => setPaymentMethod('UPI')} className={`flex-1 py-3 border font-bold uppercase tracking-widest text-xs rounded transition-colors ${paymentMethod === 'UPI' ? 'bg-[#e4ebf5] border-paa-navy text-paa-navy' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>UPI QR</button>
                 <button onClick={() => setPaymentMethod('Cash')} className={`flex-1 py-3 border font-bold uppercase tracking-widest text-xs rounded transition-colors ${paymentMethod === 'Cash' ? 'bg-[#e4ebf5] border-paa-navy text-paa-navy' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Cash</button>
              </div>

              {paymentMethod === 'UPI' && (
                <div className="flex flex-col items-center">
                  {author?.qrCodeUrl ? (
                    <>
                      <p className="text-sm text-gray-600 mb-4">Ask customer to scan to pay directly to you.</p>
                      <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${author.qrCodeUrl}`} alt="QR Code" className="w-48 h-48 border rounded shadow-sm object-contain" />
                    </>
                  ) : (
                    <div className="w-48 h-48 border border-dashed rounded flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                       <QrCode size={40} className="mb-2 opacity-50" />
                       <span className="text-xs text-center px-4">No QR Code uploaded in your profile.</span>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'Cash' && (
                <div className="py-8 text-paa-navy font-bold flex flex-col items-center">
                   <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl font-serif">₹</span>
                   </div>
                   Receive ₹{totalAmount} from customer.
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
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
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
