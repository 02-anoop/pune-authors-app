import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { BookOpen, TrendingUp, Calendar, MapPin, Coffee, Award, ChevronDown, Check, User, LogOut } from "lucide-react";

const genreConfig = {
  NF: { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  F: { color: "#db2777", bg: "#fdf2f8", border: "#fbcfe8" },
  P: { color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  C: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
};

type Genre = keyof typeof genreConfig;

const activityMatrix = [
  { label: "Events Participated", value: 0, icon: <Calendar size={20} />, color: "#2563eb" },
  { label: "Fairs Attended", value: 0, icon: <Award size={20} />, color: "#db2777" },
  { label: "Flybraries Donated", value: 0, icon: <MapPin size={20} />, color: "#d97706" },
  { label: "Café Share Status", value: "Active", icon: <Coffee size={20} />, color: "#16a34a" },
];

const upcomingEvents = [
  { id: "E1", name: "Pune Winter Literary Fest 2025", date: "2025-12-14", type: "Literary Events", fee: 500 },
  { id: "E2", name: "Pune Book Fair — Spring Edition", date: "2025-03-22", type: "Book Fairs", fee: 800 },
  { id: "E3", name: "Mumbai Airport Flybrary Drive", date: "2025-02-10", type: "Airport Flybraries", fee: 0 },
  { id: "E4", name: "Goa Café Author Weekend", date: "2025-04-05", type: "Goa Book Café Hub", fee: 1200 },
  { id: "E5", name: "AFMC Author Activation", date: "2025-03-01", type: "Literary Events", fee: 300 },
];

export function AuthorDashboardPage() {
  const [eventType, setEventType] = useState("All");
  const [registered, setRegistered] = useState<string[]>([]);
  const [authorProfile, setAuthorProfile] = useState<any>(null);
  const [authorOrders, setAuthorOrders] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setUserData(res.data.user);
        setAuthorProfile(res.data.authorProfile);
        setAuthorOrders(res.data.authorOrders || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  const handleStatusUpdate = async (orderId: number, status: string) => {
    setUpdatingId(orderId);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}/api/order-items/${orderId}/status`, { status });
      setAuthorOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div style={{ padding: "4rem", textAlign: "center", fontFamily: "var(--font-body)" }}>Loading dashboard...</div>;

  const authorBooks = authorProfile?.books || [];
  const eventTypes = ["All", "Literary Events", "Book Fairs", "Airport Flybraries", "Goa Book Café Hub"];
  const filteredEvents = upcomingEvents.filter((e) => eventType === "All" || e.type === eventType);

  // Compute real sales from orders
  const verifiedOrders = authorOrders.filter(o => o.status === "Completed" || o.status === "Dispatched");
  const totalSold = verifiedOrders.length; 
  // Author's revenue is 70% of total verified orders amount
  const totalRevenue = verifiedOrders.reduce((acc, o) => acc + (o.amount * 0.7), 0);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };


  return (
    <main style={{ fontFamily: "var(--font-body)", minHeight: "100vh", background: "#f7f7f9" }}>
      {/* Header */}
      <section style={{ background: "#1a1a2e", padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,0.2)" }}>
              <User size={28} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Author Central</div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{userData?.name || "Author"}</h1>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: "0.2rem" }}>Member since {new Date(userData?.createdAt || Date.now()).getFullYear()} · {authorBooks.length} titles</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ textAlign: "right", marginRight: "1rem" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 800, color: "#fff" }}>{totalSold}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Total Books Sold</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 800, color: "#16a34a" }}>₹{Math.floor(totalRevenue).toLocaleString()}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Lifetime Earnings</div>
              </div>
              <button onClick={handleLogout} style={{ marginLeft: "1rem", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "0.5rem", borderRadius: 8, cursor: "pointer" }} title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>
        
        {/* Manage Orders Section */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.07)", overflow: "hidden", marginBottom: "1.5rem" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Package size={18} color="#2563eb" />
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "#1a1a2e" }}>Manage Orders</h2>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f7f7f9", borderBottom: "1px solid rgba(0,0,0,0.05)", textAlign: "left" }}>
                  <th style={{ padding: "0.65rem 1rem", fontSize: 11, fontWeight: 700, color: "#6b6b80", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>Order ID</th>
                  <th style={{ padding: "0.65rem 1rem", fontSize: 11, fontWeight: 700, color: "#6b6b80", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>Customer</th>
                  <th style={{ padding: "0.65rem 1rem", fontSize: 11, fontWeight: 700, color: "#6b6b80", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>Book</th>
                  <th style={{ padding: "0.65rem 1rem", fontSize: 11, fontWeight: 700, color: "#6b6b80", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>Qty</th>
                  <th style={{ padding: "0.65rem 1rem", fontSize: 11, fontWeight: 700, color: "#6b6b80", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>Payment</th>
                  <th style={{ padding: "0.65rem 1rem", fontSize: 11, fontWeight: 700, color: "#6b6b80", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {authorOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#6b6b80", fontSize: 14 }}>No orders placed yet.</td>
                  </tr>
                ) : (
                  authorOrders.map((o, i) => (
                    <tr key={o.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: 13, color: "#1a1a2e" }}>#PAA-{o.orderId?.toString().padStart(4, '0') || o.id.toString().padStart(4, '0')}</td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>{o.customerName}</div>
                        <div style={{ fontSize: 12, color: "#6b6b80" }}>{o.address}</div>
                      </td>
                      <td style={{ padding: "1rem", fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>{o.bookTitle}</td>
                      <td style={{ padding: "1rem", fontSize: 13, color: "#1a1a2e" }}>{o.quantity || 1}</td>
                      <td style={{ padding: "1rem" }}>
                        {o.paymentScreenshot ? (
                          <a href={`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}${o.paymentScreenshot}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>View Screenshot</a>
                        ) : (
                          <span style={{ fontSize: 12, color: "#6b6b80" }}>No Image</span>
                        )}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <select
                          disabled={updatingId === o.id}
                          value={o.status}
                          onChange={(e) => handleStatusUpdate(o.id, e.target.value)}
                          style={{
                            padding: "0.4rem 0.6rem",
                            borderRadius: 6,
                            border: "1px solid rgba(0,0,0,0.15)",
                            fontSize: 12,
                            fontWeight: 600,
                            background: o.status.includes('Pending') ? '#fffbeb' : o.status === 'Completed' ? '#f0fdf4' : '#eff6ff',
                            color: o.status.includes('Pending') ? '#d97706' : o.status === 'Completed' ? '#16a34a' : '#2563eb',
                            outline: "none",
                            cursor: "pointer"
                          }}
                        >
                          <option value="Pending Verification">Pending Verification</option>
                          <option value="Approved">Approved</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top row: Books + Activity */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }} className="dash-top">
          {/* LEFT — Books Status Grid */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <BookOpen size={18} color="#2563eb" />
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "#1a1a2e" }}>My Books</h2>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6b6b80" }}>{authorBooks.length} titles</span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f7f7f9" }}>
                    {["Title", "Join Date", "Genre", "MRP", "Sold", "Status"].map((h) => (
                      <th key={h} style={{ padding: "0.65rem 1rem", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b6b80", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {authorBooks.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#6b6b80", fontSize: 13 }}>
                        No books published yet. Please register your titles.
                      </td>
                    </tr>
                  ) : authorBooks.map((book: any, i: number) => {
                    const gConf = genreConfig[book.genre as Genre] || genreConfig["NF"];
                    const bSold = verifiedOrders.filter(o => o.bookId === book.id).length;
                    return (
                      <tr key={book.id} style={{ borderTop: "1px solid rgba(0,0,0,0.05)", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={{ padding: "0.85rem 1rem", fontSize: 13, fontWeight: 600, color: "#1a1a2e", maxWidth: 200 }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.title}</div>
                        </td>
                        <td style={{ padding: "0.85rem 1rem", fontFamily: "var(--font-mono)", fontSize: 12, color: "#6b6b80", whiteSpace: "nowrap" }}>
                          {new Date(book.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <span style={{ background: gConf.bg, color: gConf.color, border: "1px solid " + gConf.border, fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: 5 }}>
                            {book.genre}
                          </span>
                        </td>
                        <td style={{ padding: "0.85rem 1rem", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>₹{book.mrp}</td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{ flex: 1, height: 6, background: "#f0f0f4", borderRadius: 3, minWidth: 60 }}>
                              <div style={{ height: "100%", width: Math.min(100, (bSold / 50) * 100) + "%", background: gConf.color, borderRadius: 3 }} />
                            </div>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#1a1a2e", minWidth: 30 }}>{bSold}</span>
                          </div>
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <span style={{ background: "#f0fdf4", color: "#16a34a", fontSize: 11, fontWeight: 600, padding: "0.2rem 0.5rem", borderRadius: 5 }}>{book.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT — Activity Matrix */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.07)", padding: "1.25rem 1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <TrendingUp size={18} color="#db2777" />
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "#1a1a2e" }}>Activity Matrix</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {activityMatrix.map((item) => (
                <div key={item.label} style={{ background: "#f7f7f9", borderRadius: 12, padding: "1.1rem", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: item.color, marginBottom: "0.6rem" }}>
                    {item.icon}
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: typeof item.value === "number" ? 30 : 18, fontWeight: 800, color: "#1a1a2e", lineHeight: 1 }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b6b80", marginTop: "0.3rem", lineHeight: 1.3 }}>{item.label}</div>
                </div>
              ))}
            </div>

            {/* Mini chart simulation */}
            <div style={{ marginTop: "1.25rem" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6b6b80", marginBottom: "0.5rem" }}>Monthly Sales Trend</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "0.3rem", height: 60 }}>
                {[12, 18, 9, 24, 20, 28, 15, 32, 25, 30, 22, 35].map((val, i) => (
                  <div key={i} style={{ flex: 1, height: (val / 35) * 100 + "%", background: `hsl(${220 + i * 5}, 70%, ${50 + i}%)`, borderRadius: "2px 2px 0 0", opacity: 0.8 }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.3rem" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#9ca3af" }}>Jan</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#9ca3af" }}>Dec</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM — Event Booking Registry */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Calendar size={18} color="#d97706" />
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "#1a1a2e" }}>Event Booking Registry</h2>
            </div>
            {/* Filter dropdown */}
            <div style={{ position: "relative" }}>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                style={{ appearance: "none", padding: "0.45rem 2rem 0.45rem 0.9rem", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 13, color: "#1a1a2e", background: "#f7f7f9", cursor: "pointer", outline: "none" }}
              >
                {eventTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown size={14} color="#6b6b80" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f7f7f9" }}>
                  {["Event Name", "Type", "Date", "Fee", "Action"].map((h) => (
                    <th key={h} style={{ padding: "0.65rem 1.25rem", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b6b80", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event, i) => {
                  const isRegistered = registered.includes(event.id);
                  const typeColor = {
                    "Literary Events": "#2563eb",
                    "Book Fairs": "#db2777",
                    "Airport Flybraries": "#d97706",
                    "Goa Book Café Hub": "#16a34a",
                  }[event.type] || "#6b6b80";

                  return (
                    <tr key={event.id} style={{ borderTop: "1px solid rgba(0,0,0,0.05)", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={{ padding: "1rem 1.25rem", fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>{event.name}</td>
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <span style={{ background: typeColor + "15", color: typeColor, fontSize: 11, fontWeight: 600, padding: "0.25rem 0.6rem", borderRadius: 6 }}>{event.type}</span>
                      </td>
                      <td style={{ padding: "1rem 1.25rem", fontFamily: "var(--font-mono)", fontSize: 12, color: "#6b6b80" }}>
                        {new Date(event.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "1rem 1.25rem", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: event.fee === 0 ? "#16a34a" : "#1a1a2e" }}>
                        {event.fee === 0 ? "Free" : `₹${event.fee}`}
                      </td>
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <button
                          onClick={() => {
                            if (!isRegistered) {
                              setRegistered((prev) => [...prev, event.id]);
                            }
                          }}
                          style={{
                            display: "flex", alignItems: "center", gap: "0.4rem",
                            background: isRegistered ? "#f0fdf4" : "#1a1a2e",
                            color: isRegistered ? "#16a34a" : "#fff",
                            border: isRegistered ? "1px solid #bbf7d0" : "none",
                            padding: "0.45rem 0.9rem",
                            borderRadius: 8, fontSize: 12, fontWeight: 600,
                            cursor: isRegistered ? "default" : "pointer",
                            fontFamily: "var(--font-body)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {isRegistered ? <><Check size={13} /> Registered</> : "Register & Pay"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dash-top { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
