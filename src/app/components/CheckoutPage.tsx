import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import axios from "axios";
import { CheckCircle, Circle, Package, MessageSquare, Truck, CheckSquare, BarChart2, CreditCard, MapPin, Minus, Plus, User, Phone, Mail } from "lucide-react";

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartIds: number[] = useMemo(() => {
    let ids = location.state?.cart;
    if (ids) {
      localStorage.setItem('checkout_cart', JSON.stringify(ids));
    } else {
      const saved = localStorage.getItem('checkout_cart');
      ids = saved ? JSON.parse(saved) : [];
    }
    return ids.map(Number);
  }, [location.state?.cart]);

  const [books, setBooks] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>(
    cartIds.reduce((acc, id) => ({ ...acc, [id]: 1 }), {})
  );

  const [form, setForm] = useState({ name: "", email: "", phone: "", pincode: "", address: "", city: "", state: "", landmark: "", houseNo: "" });
  const [pincodeOptions, setPincodeOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [fetchingLoc, setFetchingLoc] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [currentAuthorIndex, setCurrentAuthorIndex] = useState(0);
  
  
  const authorGroups = useMemo(() => {
    const groups: Record<number, any[]> = {};
    books.forEach(b => {
      const aId = b.author?.id || 0;
      if (!groups[aId]) groups[aId] = [];
      groups[aId].push(b);
    });
    return Object.values(groups);
  }, [books]);

  const currentGroupBooks = authorGroups[currentAuthorIndex] || [];
  const currentAuthor = currentGroupBooks.length > 0 ? currentGroupBooks[0].author : null;
  const currentGroupQty = currentGroupBooks.reduce((acc, b) => acc + (quantities[b.id] || 1), 0);
  
  let bundleDiscount = 0;
  let bundleMessage = "";
  if (currentAuthor?.extraData?.bundleRules && currentAuthor.extraData.bundleRules.length > 0) {
     const rules = currentAuthor.extraData.bundleRules.filter((r: any) => r.enabled);
     rules.sort((a: any, b: any) => b.buyCount - a.buyCount);
     const applicableRule = rules.find((r: any) => currentGroupQty >= r.buyCount);
     if (applicableRule) {
        bundleDiscount = applicableRule.discount;
        bundleMessage = `🎉 Bundle Offer Applied: Buy ${applicableRule.buyCount}+ Books, Get ₹${applicableRule.discount} Off!`;
     }
  }
  if (!bundleDiscount && currentAuthor?.extraData?.bundleRule?.enabled) {
     const rule = currentAuthor.extraData.bundleRule;
     if (currentGroupQty >= rule.buyCount) {
        bundleDiscount = rule.discount;
        bundleMessage = `🎉 Bundle Offer Applied: Buy ${rule.buyCount}+ Books, Get ₹${rule.discount} Off!`;
     }
  }
  
  const currentSubtotal = currentGroupBooks.reduce((acc, book) => acc + ((book.mrp || 428) * (quantities[book.id] || 1)), 0);
  const totalAmount = currentSubtotal - bundleDiscount;


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          const u = res.data.user;
          setForm(prev => ({
            ...prev,
            name: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            address: u.address || "",
          }));
        })
        .catch(() => {
          localStorage.removeItem("token");
        });
    }

    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/books`)
      .then(res => {
        const cartBooks = res.data.filter((b: any) => cartIds.includes(b.id));
        setBooks(cartBooks);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [navigate, cartIds]);

  const updateQty = (id: number, delta: number) => {
    setQuantities(prev => {
      const newQty = (prev[id] || 1) + delta;
      if (newQty <= 0) {
        setBooks(curr => curr.filter(b => b.id !== id));
        const newCartIds = cartIds.filter(cId => cId !== id);
        localStorage.setItem('checkout_cart', JSON.stringify(newCartIds));
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: newQty };
    });
  };

  const handlePay = async () => {
    if (!form.name || !form.address || !form.pincode || !form.phone) {
      alert("Please fill all delivery details");
      return;
    }
    if (!paymentFile) {
      alert("Please upload your payment screenshot to proceed.");
      return;
    }
    if (!transactionId.trim()) {
      alert("Please enter your UPI/Bank Transaction ID.");
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem("token");

      const itemsPayload = currentGroupBooks.map((book: any) => ({
        bookId: book.id,
        quantity: quantities[book.id] || 1
      }));

      const formData = new FormData();
      formData.append("amount", totalAmount.toString());
      formData.append("customerName", form.name);
      formData.append("customerEmail", form.email || "guest@example.com");
      formData.append("customerPhone", form.phone);
      formData.append("address", `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`);
      formData.append("items", JSON.stringify(itemsPayload));
      formData.append("paymentScreenshot", paymentFile);
      formData.append("transactionId", transactionId.trim());

      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/orders`, formData, {
        headers: { 
          "Authorization": `Bearer ${token}`
        }
      });

      setUploading(false);
      setPaymentFile(null);
      setTransactionId("");
      
      if (currentAuthorIndex + 1 < authorGroups.length) {
        setCurrentAuthorIndex(prev => prev + 1);
        alert(`Payment for ${currentAuthor?.name || 'Author'} complete. Proceeding to next author.`);
      } else {
        setPaymentDone(true);
      }
    } catch (e) {
      setUploading(false);
      console.error(e);
      alert("Order placement failed");
    }
  };

  // Extract unique authors for the success screen
  const authors = Array.from(new Map(books.map(b => [b.author?.id, b.author])).values()).filter(Boolean);

  return (
    <main style={{ fontFamily: "var(--font-body)", minHeight: "100vh" }}>
      <section style={{ background: "#f7f7f9", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6b6b80", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Secure Checkout</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "#1a1a2e" }}>Complete Your Order</h1>
        </div>
      </section>

      <section style={{ padding: "3rem 1.5rem" }}>
          {isLoading ? (
            <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "var(--font-body)", color: "#111" }}>
              <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>
                {/* Header Skeleton */}
                <div className="animate-pulse" style={{ display: "flex", gap: "2rem", alignItems: "center", marginBottom: "2rem" }}>
                  <div style={{ width: 200, height: 24, background: "#e5e5e5", borderRadius: 4 }}></div>
                  <div style={{ width: 150, height: 24, background: "#e5e5e5", borderRadius: 4 }}></div>
                </div>
                {/* Order Details Skeleton */}
                <div className="animate-pulse">
                  <div style={{ background: "#fff", padding: "2rem", borderRadius: 8, marginBottom: "1.5rem" }}>
                    <div style={{ height: 20, background: "#e5e5e5", marginBottom: "0.5rem", borderRadius: 4 }}></div>
                    <div style={{ height: 20, width: "80%", background: "#e5e5e5", marginBottom: "1rem", borderRadius: 4 }}></div>
                    {/* Book rows */}
                    {[...Array(3)].map((_, i) => (
                      <div key={i} style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem" }}>
                        <div style={{ width: 60, height: 60, background: "#e5e5e5", borderRadius: 4 }}></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ height: 16, background: "#e5e5e5", marginBottom: "0.25rem", borderRadius: 4 }}></div>
                          <div style={{ height: 12, width: "60%", background: "#e5e5e5", borderRadius: 4 }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Delivery Form Skeleton */}
                  <div style={{ background: "#fff", padding: "2rem", borderRadius: 8 }}>
                    <div style={{ height: 20, background: "#e5e5e5", marginBottom: "1rem", borderRadius: 4 }}></div>
                    {[...Array(4)].map((_, i) => (
                      <div key={i} style={{ height: 16, background: "#e5e5e5", marginBottom: "0.75rem", borderRadius: 4 }}></div>
                    ))}
                    <div style={{ height: 40, background: "#e5e5e5", marginTop: "1rem", borderRadius: 4 }}></div>
                  </div>
                </div>
              </div>
            </div>
          ) : paymentDone ? (
          <div style={{ maxWidth: 800, margin: "0 auto", background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 16, padding: "3rem 2rem", textAlign: "center" }}>
            <CheckCircle size={56} color="#16a34a" style={{ margin: "0 auto 1.5rem" }} />
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "#1a1a2e", marginBottom: "1rem" }}>Order Placed Successfully!</h2>
            <p style={{ fontSize: 16, color: "#6b6b80", marginBottom: "2rem" }}>Your payment screenshots have been uploaded and your orders have been sent to the respective authors. Please contact them below for delivery updates.</p>
            
          <div style={{ marginBottom: "2.5rem", textAlign: "left" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", marginBottom: "1rem", borderBottom: "1px solid rgba(0,0,0,0.1)", paddingBottom: "0.5rem" }}>Contact Authors for Delivery Updates</h3>
              <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                {authors.map((author: any) => (
                  <div key={author.id} style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f0f0f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <User size={20} color="#1a1a2e" />
                      </div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e" }}>{author.name}</div>
                        <div style={{ fontSize: 13, color: "#6b6b80" }}>Author</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                      {author.whatsapp && (
                        <a href={`https://wa.me/${author.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#16a34a", textDecoration: "none", fontSize: 14, fontWeight: 600, background: "#f0fdf4", padding: "0.5rem 1rem", borderRadius: 8 }}>
                          <MessageSquare size={16} /> WhatsApp: {author.whatsapp}
                        </a>
                      )}
                      {author.email && (
                        <a href={`mailto:${author.email}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#2563eb", textDecoration: "none", fontSize: 14, fontWeight: 600, background: "#eff6ff", padding: "0.5rem 1rem", borderRadius: 8 }}>
                          <Mail size={16} /> {author.email}
                        </a>
                      )}
                      {author.phone && !author.whatsapp && (
                        <a href={`tel:${author.phone}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#475569", textDecoration: "none", fontSize: 14, fontWeight: 600, background: "#f8fafc", padding: "0.5rem 1rem", borderRadius: 8 }}>
                          <Phone size={16} /> Call: {author.phone}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => navigate("/profile")} style={{ background: "#1a1a2e", color: "#fff", border: "none", padding: "0.85rem 2rem", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              Go to My Profile
            </button>
          </div>
        ) : (
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" }} className="checkout-grid">
            {/* LEFT — Delivery + Order Summary */}
            <div>
              <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: "1.75rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                  <MapPin size={18} color="#2563eb" />
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>Delivery Address</h2>
                </div>

                <div style={{ display: "grid", gap: "0.85rem" }}>
                  {[
                    { key: "name", label: "Full Name", placeholder: "e.g., Anita Sharma" },
                    { key: "phone", label: "Mobile Number", placeholder: "+91 9876543210" },
                    { key: "houseNo", label: "Building / House No.", placeholder: "e.g., 12B, Rose Apartments" },
                    { key: "address", label: "Street Address", placeholder: "e.g., MG Road, Koregaon Park" },
                    { key: "landmark", label: "Landmark", placeholder: "e.g., Near XYZ Mall" },
                    { key: "city", label: "District / Town", placeholder: "e.g., Pune" },
                    { key: "state", label: "State", placeholder: "e.g., Maharashtra" },
                    { key: "pincode", label: "PIN Code", placeholder: "e.g., 411001" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.3rem" }}>{field.label}</label>
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        value={form[field.key as keyof typeof form] || ""}
                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                        style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 14, background: "#f7f7f9", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "2rem" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#1a1a2e", marginBottom: "1.25rem" }}>
                  Order Summary ({currentAuthorIndex + 1} of {authorGroups.length})
                </h3>
                <p style={{fontSize: 13, color: "#2563eb", marginBottom: "1rem", fontWeight: 600}}>Items by: {currentAuthor?.name}</p>
                
                {bundleDiscount > 0 && (
                   <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "0.75rem", borderRadius: 8, marginBottom: "1rem", fontSize: 13, fontWeight: 700, border: "1px solid #bbf7d0" }}>
                      {bundleMessage}
                   </div>
                )}
                <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: "1.25rem", marginBottom: "1.5rem" }}>
                  {currentGroupBooks.map((book: any) => (
                    <div key={book.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                      <div style={{ flex: 1, paddingRight: "1rem" }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.2rem" }}>{book.title}</div>
                        <div style={{ fontSize: 12, color: "#6b6b80" }}>₹{book.mrp || 428} each</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", background: "#f7f7f9", borderRadius: 8, padding: "0.25rem" }}>
                        <button onClick={() => updateQty(book.id, -1)} style={{ padding: "0.4rem", borderRadius: 6, background: "#fff", border: "1px solid rgba(0,0,0,0.1)", cursor: "pointer", display: "flex" }}>
                          <Minus size={14} color="#1a1a2e" />
                        </button>
                        <span style={{ fontSize: 14, fontWeight: 700, minWidth: "1.5rem", textAlign: "center" }}>{quantities[book.id] || 1}</span>
                        <button onClick={() => updateQty(book.id, 1)} style={{ padding: "0.4rem", borderRadius: 6, background: "#fff", border: "1px solid rgba(0,0,0,0.1)", cursor: "pointer", display: "flex" }}>
                          <Plus size={14} color="#1a1a2e" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Payment Details */}
            <div>
              <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: "1.75rem", position: "sticky", top: 80 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#1a1a2e", marginBottom: "1.25rem" }}>Payment Details</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ background: "#f0f0f4", borderRadius: 12, padding: "1.5rem", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.75rem" }}>Scan Author's QR to Pay ₹{totalAmount}</p>
                    {currentAuthor?.qrCodeUrl ? (
                      <img
                        src={currentAuthor.qrCodeUrl.startsWith('http') ? currentAuthor.qrCodeUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${currentAuthor.qrCodeUrl}`}
                        alt="Author Payment QR"
                        style={{ width: 160, height: 160, objectFit: "contain", margin: "0 auto", display: "block", borderRadius: 10, border: "2px solid rgba(0,0,0,0.08)" }}
                      />
                    ) : (
                      <div style={{ width: 160, height: 160, background: "#fff", margin: "0 auto", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(0,0,0,0.1)", overflow: "hidden" }}>
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=puneauthors@upi&pn=PuneAuthors&am=${totalAmount}.00&cu=INR`} alt="UPI QR" style={{ width: "90%", height: "90%" }} />
                      </div>
                    )}
                    <p style={{ fontSize: 11, color: "#9ca3af", marginTop: "0.5rem" }}>Pay directly to the author using their UPI QR</p>
                  </div>
                  
                  <div style={{ background: "#fff", borderRadius: 12, padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "center", border: "1px dashed rgba(0,0,0,0.2)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      <CreditCard size={18} color="#2563eb" />
                      <label style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>Transaction ID *</label>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter your UPI/Bank Transaction ID"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 14, background: "#f7f7f9", outline: "none", boxSizing: "border-box", marginBottom: "1rem" }}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <CreditCard size={18} color="#2563eb" />
                      <label style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>Upload Screenshot *</label>
                    </div>
                    <p style={{ fontSize: 12, color: "#6b6b80", marginBottom: "1rem" }}>Upload proof of your ₹{totalAmount} payment.</p>
                    <input 
                      key={`file-input-${currentAuthorIndex}`}
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setPaymentFile(e.target.files ? e.target.files[0] : null)}
                      style={{ width: "100%", fontSize: 13, background: "#f7f7f9", padding: "0.5rem", borderRadius: 6, border: "1px solid rgba(0,0,0,0.08)" }} 
                    />
                  </div>
                </div>

                <div style={{ marginTop: "2.5rem", display: "flex", flexDirection: "column", gap: "1rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 14, color: "#6b6b80", fontWeight: 600 }}>Total Amount</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 800, color: "#1a1a2e" }}>₹{totalAmount}.00</div>
                  </div>
                  <button
                    onClick={handlePay}
                    disabled={uploading}
                    style={{
                      width: "100%",
                      background: "#1a1a2e",
                      color: "#fff",
                      border: "none",
                      padding: "1rem",
                      borderRadius: 10,
                      fontFamily: "var(--font-body)",
                      fontSize: 16,
                      fontWeight: 700,
                      cursor: uploading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      opacity: uploading ? 0.7 : 1,
                    }}
                  >
                    <Package size={18} />
                    {uploading ? "Processing..." : `Pay & Continue (${currentAuthorIndex + 1}/${authorGroups.length})`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {uploading && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          zIndex: 9999, color: "#1a1a2e"
        }}>
          <div className="w-12 h-12 border-4 border-paa-navy border-t-transparent rounded-full animate-spin mb-4"></div>
          <p style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-display)" }}>Placing Order...</p>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
