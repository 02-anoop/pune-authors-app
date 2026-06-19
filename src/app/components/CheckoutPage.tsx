import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import axios from "axios";
import { CheckCircle, Circle, Package, MessageSquare, Truck, CheckSquare, BarChart2, CreditCard, MapPin, Minus, Plus, User, Phone, Mail } from "lucide-react";

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartIds: number[] = Array.isArray(location.state?.cart) 
    ? location.state.cart.map((id: string | number) => typeof id === 'string' ? parseInt(id) : id) 
    : [1]; // Fallback to book 1 if directly navigated

  const [books, setBooks] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>(
    cartIds.reduce((acc, id) => ({ ...acc, [id]: 1 }), {})
  );

  const [form, setForm] = useState({ name: "", phone: "", pincode: "", address: "", city: "", state: "Maharashtra" });
  const [paymentDone, setPaymentDone] = useState(false);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const totalAmount = books.reduce((acc, book) => acc + ((book.mrp || 428) * (quantities[book.id] || 1)), 0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to place an order.");
      navigate("/login?role=CUSTOMER");
      return;
    }
    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const u = res.data.user;
        setForm(prev => ({
          ...prev,
          name: u.name || "",
          phone: u.phone || "",
          address: u.address || "",
        }));
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });

    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/books`)
      .then(res => {
        const cartBooks = res.data.filter((b: any) => cartIds.includes(b.id));
        setBooks(cartBooks.length > 0 ? cartBooks : res.data.slice(0, 1));
      })
      .catch(console.error);
  }, [navigate, cartIds]);

  const updateQty = (id: number, delta: number) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) + delta) }));
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

    setUploading(true);
    try {
      const token = localStorage.getItem("token");

      const itemsPayload = books.map(book => ({
        bookId: book.id,
        quantity: quantities[book.id] || 1
      }));

      const formData = new FormData();
      formData.append("amount", totalAmount.toString());
      formData.append("customerName", form.name);
      formData.append("customerPhone", form.phone);
      formData.append("address", `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`);
      formData.append("items", JSON.stringify(itemsPayload));
      formData.append("paymentScreenshot", paymentFile);

      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/orders`, formData, {
        headers: { 
          "Authorization": `Bearer ${token}`
        }
      });

      setUploading(false);
      setPaymentDone(true);
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
        {paymentDone ? (
          <div style={{ maxWidth: 800, margin: "0 auto", background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 16, padding: "3rem 2rem", textAlign: "center" }}>
            <CheckCircle size={56} color="#16a34a" style={{ margin: "0 auto 1.5rem" }} />
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "#1a1a2e", marginBottom: "1rem" }}>Order Placed Successfully!</h2>
            <p style={{ fontSize: 16, color: "#6b6b80", marginBottom: "1rem" }}>Your order has been sent to the respective authors for payment verification.</p>
            <div style={{ background: "#e8f5e9", border: "1px solid #4caf50", borderRadius: 8, padding: "1rem", marginBottom: "2rem", fontSize: 14, color: "#2e7d32", lineHeight: 1.6 }}>
              <strong>📋 Next Steps:</strong><br/>
              1. Admin will verify your payment within 24 hours<br/>
              2. Author will accept your order<br/>
              3. Author will dispatch with tracking number<br/>
              4. Track your order status in <strong>My Profile → Your Orders</strong>
            </div>
            
            <div style={{ marginBottom: "2.5rem", textAlign: "left" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", marginBottom: "1rem", borderBottom: "1px solid rgba(0,0,0,0.1)", paddingBottom: "0.5rem" }}>Contact The Authors</h3>
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
              Track Your Order Status
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
                    { key: "address", label: "Street Address", placeholder: "e.g., 12B, Rose Apartments" },
                    { key: "city", label: "City", placeholder: "e.g., Pune" },
                    { key: "pincode", label: "PIN Code", placeholder: "e.g., 411001" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.3rem" }}>{field.label}</label>
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        value={form[field.key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                        style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 14, background: "#f7f7f9", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  ))}

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.3rem" }}>State</label>
                    <select
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 14, background: "#f7f7f9", outline: "none" }}
                    >
                      {["Maharashtra", "Goa", "Karnataka", "Delhi", "Tamil Nadu", "Other"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "2rem" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#1a1a2e", marginBottom: "1.25rem" }}>Order Summary</h3>
                <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: "1.25rem", marginBottom: "1.5rem" }}>
                  {books.map(book => (
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
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.75rem" }}>Scan QR to Pay ₹{totalAmount}</p>
                    <div style={{ width: 160, height: 160, background: "#fff", margin: "0 auto", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(0,0,0,0.1)", overflow: "hidden" }}>
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=puneauthors@upi&pn=PuneAuthors&am=${totalAmount}.00&cu=INR`} alt="UPI QR" style={{ width: "90%", height: "90%" }} />
                    </div>
                  </div>
                  
                  <div style={{ background: "#fff", borderRadius: 12, padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "center", border: "1px dashed rgba(0,0,0,0.2)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      <CreditCard size={18} color="#2563eb" />
                      <label style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>Upload Screenshot</label>
                    </div>
                    <p style={{ fontSize: 12, color: "#6b6b80", marginBottom: "1rem" }}>Please upload proof of your ₹{totalAmount} transaction to confirm your order.</p>
                    <input 
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
                    {uploading ? "Processing..." : "Place Order"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <style>{`
        @media (max-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
