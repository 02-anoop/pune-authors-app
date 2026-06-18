import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import axios from "axios";
import { CheckCircle, Circle, Package, MessageSquare, Truck, CheckSquare, BarChart2, CreditCard, MapPin, Minus, Plus } from "lucide-react";

const workflowSteps = [
  { icon: <Package size={18} />, title: "Order Acceptance", desc: "Buyer's order is received and payment confirmed by PAA system.", color: "#2563eb" },
  { icon: <MessageSquare size={18} />, title: "Confirmation to Buyer", desc: "Automated WhatsApp/Email confirmation sent with order details and tracking.", color: "#db2777" },
  { icon: <Truck size={18} />, title: "Order Dispatched", desc: "The author ships your book and a tracking code is shared.", color: "#d97706" },
  { icon: <CheckSquare size={18} />, title: "Delivery Confirmed", desc: "You receive the book safely at your doorstep.", color: "#16a34a" },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartIds: number[] = location.state?.cart || [1]; // Fallback to book 1 if directly navigated

  const [books, setBooks] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>(
    cartIds.reduce((acc, id) => ({ ...acc, [id]: 1 }), {})
  );

  const [activeStep, setActiveStep] = useState(0);
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
    axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
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

    axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}/api/books`)
      .then(res => {
        const cartBooks = res.data.filter((b: any) => cartIds.includes(b.id));
        setBooks(cartBooks.length > 0 ? cartBooks : res.data.slice(0, 1));
      })
      .catch(console.error);
  }, [navigate]);

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

      // We send a SINGLE order containing all items
      const formData = new FormData();
      formData.append("amount", totalAmount.toString());
      formData.append("customerName", form.name);
      formData.append("customerPhone", form.phone);
      formData.append("address", `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`);
      formData.append("paymentScreenshot", paymentFile);
      
      const itemsPayload = books.map(book => ({
        bookId: book.id,
        quantity: quantities[book.id] || 1
      }));
      formData.append("items", JSON.stringify(itemsPayload));

      await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}/api/orders`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        }
      });

      setUploading(false);
      setPaymentDone(true);
      let s = 0;
      const interval = setInterval(() => {
        s++;
        setActiveStep(s);
        if (s >= workflowSteps.length - 1) clearInterval(interval);
      }, 1200);
    } catch (e) {
      setUploading(false);
      console.error(e);
      alert("Payment failed");
    }
  };

  return (
    <main style={{ fontFamily: "var(--font-body)", minHeight: "100vh" }}>
      {/* Header */}
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
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "#1a1a2e", marginBottom: "1rem" }}>Payment Successful!</h2>
            <p style={{ fontSize: 16, color: "#6b6b80", marginBottom: "2rem" }}>Your order has been placed successfully. You can view your order details, address, and payment screenshot in your My Profile section.</p>
            <button onClick={() => navigate("/profile")} style={{ background: "#16a34a", color: "#fff", border: "none", padding: "0.85rem 2rem", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
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

            {/* RIGHT — Payment */}
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
                    <CreditCard size={18} />
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
