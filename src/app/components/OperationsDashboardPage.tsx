import { useState, useEffect } from "react";
import axios from "axios";
import { AlertTriangle, TrendingDown, Search, Filter, Download, CheckCircle, Image as ImageIcon } from "lucide-react";

const genreConfig = {
  NF: { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  F: { color: "#db2777", bg: "#fdf2f8", border: "#fbcfe8" },
  P: { color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  C: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
};

type Genre = keyof typeof genreConfig;

interface BookStock {
  id: number;
  title: string;
  author: string;
  genre: Genre;
  qtySold: number;
  qtyAirport1: number;
  qtyAirport2: number;
  qtyAirport3: number;
  qtyPuneFair: number;
  qtyGoaFair: number;
  inStock: number;
}

const stockData: BookStock[] = [
  { id: 1, title: "The Forgotten Equation", author: "Dr. Anita Rao", genre: "NF", qtySold: 187, qtyAirport1: 20, qtyAirport2: 15, qtyAirport3: 10, qtyPuneFair: 25, qtyGoaFair: 12, inStock: 31 },
  { id: 2, title: "Monsoon Letters", author: "Priya Deshmukh", genre: "F", qtySold: 143, qtyAirport1: 18, qtyAirport2: 12, qtyAirport3: 8, qtyPuneFair: 20, qtyGoaFair: 10, inStock: 7 },
  { id: 3, title: "Pebbles on the Ghat", author: "Suresh Kulkarni", genre: "P", qtySold: 98, qtyAirport1: 10, qtyAirport2: 8, qtyAirport3: 5, qtyPuneFair: 15, qtyGoaFair: 8, inStock: 4 },
  { id: 4, title: "Adventures of Tara & Tiger", author: "Meera Shah", genre: "C", qtySold: 204, qtyAirport1: 25, qtyAirport2: 20, qtyAirport3: 15, qtyPuneFair: 30, qtyGoaFair: 18, inStock: 48 },
  { id: 5, title: "Startup India: Real Stories", author: "Rahul Joshi", genre: "NF", qtySold: 92, qtyAirport1: 12, qtyAirport2: 10, qtyAirport3: 6, qtyPuneFair: 15, qtyGoaFair: 8, inStock: 57 },
  { id: 6, title: "The Vermillion Sky", author: "Kavita Nair", genre: "F", qtySold: 76, qtyAirport1: 8, qtyAirport2: 6, qtyAirport3: 4, qtyPuneFair: 10, qtyGoaFair: 5, inStock: 9 },
  { id: 7, title: "Grandmother's Spice Box", author: "Lalita Iyer", genre: "NF", qtySold: 128, qtyAirport1: 15, qtyAirport2: 12, qtyAirport3: 8, qtyPuneFair: 20, qtyGoaFair: 10, inStock: 23 },
  { id: 8, title: "Whispers in Sanskrit", author: "Prof. Vijay Nadkarni", genre: "P", qtySold: 45, qtyAirport1: 6, qtyAirport2: 4, qtyAirport3: 3, qtyPuneFair: 8, qtyGoaFair: 4, inStock: 8 },
  { id: 9, title: "Raju Goes to the Moon", author: "Anjali Wagh", genre: "C", qtySold: 167, qtyAirport1: 20, qtyAirport2: 15, qtyAirport3: 10, qtyPuneFair: 22, qtyGoaFair: 14, inStock: 66 },
  { id: 10, title: "Crossroads at Forty", author: "Deepa Menon", genre: "F", qtySold: 89, qtyAirport1: 10, qtyAirport2: 8, qtyAirport3: 5, qtyPuneFair: 12, qtyGoaFair: 7, inStock: 3 },
  { id: 11, title: "Mindful Mornings", author: "Dr. Sandeep Agarwal", genre: "NF", qtySold: 112, qtyAirport1: 14, qtyAirport2: 11, qtyAirport3: 7, qtyPuneFair: 18, qtyGoaFair: 9, inStock: 39 },
  { id: 12, title: "The River Knows", author: "Chandrika Deshpande", genre: "P", qtySold: 67, qtyAirport1: 8, qtyAirport2: 6, qtyAirport3: 4, qtyPuneFair: 10, qtyGoaFair: 5, inStock: 6 },
  { id: 13, title: "Numbers in Nature", author: "Dr. Anita Rao", genre: "NF", qtySold: 92, qtyAirport1: 10, qtyAirport2: 8, qtyAirport3: 5, qtyPuneFair: 12, qtyGoaFair: 7, inStock: 26 },
  { id: 14, title: "Zero to Infinity", author: "Dr. Anita Rao", genre: "NF", qtySold: 34, qtyAirport1: 4, qtyAirport2: 3, qtyAirport3: 2, qtyPuneFair: 5, qtyGoaFair: 3, inStock: 53 },
];

export function OperationsDashboardPage() {
  const [activeTab, setActiveTab] = useState<"inventory" | "orders" | "gallery">("inventory");
  const [search, setSearch] = useState("");
  const [galleryForm, setGalleryForm] = useState({
    location: "", place: "", city: "", date: "", duration: "", authors: "", booksSold: "", type: "Literary Event", description: ""
  });
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryList, setGalleryList] = useState<any[]>([]);
  const [editingGalleryId, setEditingGalleryId] = useState<number | null>(null);
  const [genreFilter, setGenreFilter] = useState("All");
  const [sortCol, setSortCol] = useState<string>("qtySold");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === "orders") {
      axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}/api/admin/orders`)
        .then(res => setOrders(res.data))
        .catch(console.error);
    } else if (activeTab === "gallery") {
      fetchGallery();
    }
  }, [activeTab]);

  const fetchGallery = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}/api/gallery`);
      setGalleryList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(galleryForm).forEach(([key, value]) => formData.append(key, value));
    if (galleryFile) formData.append("photo", galleryFile);

    try {
      if (editingGalleryId) {
        await axios.put(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}/api/admin/gallery/${editingGalleryId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert("Gallery event updated!");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}/api/admin/gallery`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert("Gallery event uploaded!");
      }
      setGalleryForm({ location: "", place: "", city: "", date: "", duration: "", authors: "", booksSold: "", type: "Literary Event", description: "" });
      setGalleryFile(null);
      setEditingGalleryId(null);
      fetchGallery();
    } catch (err) {
      console.error(err);
      alert("Failed to save gallery event");
    }
  };

  const handleEditGallery = (item: any) => {
    setEditingGalleryId(item.id);
    setGalleryForm({
      location: item.location, place: item.place, city: item.city,
      date: new Date(item.date).toISOString().split('T')[0],
      duration: item.duration, authors: item.authors, booksSold: item.booksSold,
      type: item.type, description: item.description
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteGallery = async (id: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}/api/admin/gallery/${id}`);
      fetchGallery();
    } catch (err) {
      console.error(err);
      alert("Failed to delete event");
    }
  };

  const verifyOrder = async (id: number) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}/api/admin/orders/${id}/verify`);
      setOrders(orders.map(o => o.id === id ? { ...o, status: "Completed" } : o));
    } catch (e) {
      console.error(e);
      alert("Failed to verify order");
    }
  };

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("desc"); }
  };

  const filtered = stockData
    .filter((b) => {
      const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
      const matchGenre = genreFilter === "All" || b.genre === genreFilter;
      return matchSearch && matchGenre;
    })
    .sort((a, b) => {
      const aVal = (a as any)[sortCol];
      const bVal = (b as any)[sortCol];
      if (typeof aVal === "string") return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });

  const lowStockCount = stockData.filter((b) => b.inStock < 10).length;
  const totalSold = stockData.reduce((acc, b) => acc + b.qtySold, 0);

  const SortArrow = ({ col }: { col: string }) => (
    <span style={{ fontSize: 10, opacity: sortCol === col ? 1 : 0.3 }}>{sortDir === "asc" && sortCol === col ? " ↑" : " ↓"}</span>
  );

  const thStyle = {
    padding: "0.65rem 0.9rem",
    textAlign: "left" as const,
    fontSize: 10,
    fontWeight: 700 as const,
    color: "#6b6b80",
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    whiteSpace: "nowrap" as const,
    cursor: "pointer",
    userSelect: "none" as const,
  };

  return (
    <main style={{ fontFamily: "var(--font-body)", minHeight: "100vh", background: "#f7f7f9" }}>
      {/* Header */}
      <section style={{ background: "#1a1a2e", padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Internal Operations</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#fff" }}>Stock Telemetry Dashboard</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: "0.4rem" }}>Live inventory tracking across all PAA distribution channels</p>

          {/* Summary cards */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
            {[
              { label: "Total Books Sold", value: totalSold.toLocaleString(), color: "#16a34a" },
              { label: "Titles Tracked", value: stockData.length, color: "#2563eb" },
              { label: "Low Stock Alerts", value: lowStockCount, color: "#f59e0b" },
            ].map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "0.9rem 1.25rem", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: "0.2rem" }}>{s.label}</div>
              </div>
            ))}
            {lowStockCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(251, 191, 36, 0.15)", borderRadius: 12, padding: "0.9rem 1.25rem", border: "1px solid rgba(251, 191, 36, 0.3)" }}>
                <AlertTriangle size={18} color="#f59e0b" />
                <span style={{ fontSize: 13, color: "#fbbf24", fontWeight: 600 }}>{lowStockCount} titles need urgent restocking</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem" }}>
          <button 
            onClick={() => setActiveTab("inventory")}
            style={{ background: activeTab === "inventory" ? "#fff" : "transparent", color: activeTab === "inventory" ? "#1a1a2e" : "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "0.6rem 1.25rem", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)" }}
          >
            Inventory Telemetry
          </button>
          <button 
            onClick={() => setActiveTab("orders")}
            style={{ background: activeTab === "orders" ? "#fff" : "transparent", color: activeTab === "orders" ? "#1a1a2e" : "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "0.6rem 1.25rem", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)" }}
          >
            Order & Payment Verification
          </button>
          <button 
            onClick={() => setActiveTab("gallery")}
            style={{ background: activeTab === "gallery" ? "#fff" : "transparent", color: activeTab === "gallery" ? "#1a1a2e" : "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "0.6rem 1.25rem", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)" }}
          >
            Gallery Management
          </button>
        </div>
      </section>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {activeTab === "inventory" ? (
          <>
            {/* Filter bar */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={14} color="#6b6b80" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search title or author…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "0.55rem 0.75rem 0.55rem 2rem", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 13, background: "#fff", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {["All", "NF", "F", "P", "C"].map((g) => {
              const gConf = g !== "All" ? genreConfig[g as Genre] : null;
              const isActive = genreFilter === g;
              return (
                <button
                  key={g}
                  onClick={() => setGenreFilter(g)}
                  style={{
                    padding: "0.45rem 0.75rem",
                    borderRadius: 7,
                    border: isActive ? "1.5px solid " + (gConf?.color || "#1a1a2e") : "1px solid rgba(0,0,0,0.1)",
                    background: isActive ? (gConf ? gConf.bg : "#1a1a2e") : "#fff",
                    color: isActive ? (gConf ? gConf.color : "#fff") : "#6b6b80",
                    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-mono)",
                  }}
                >
                  {g}
                </button>
              );
            })}
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "#1a1a2e", color: "#fff", border: "none", padding: "0.55rem 1rem", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}>
            <Download size={14} /> Export CSV
          </button>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.07)", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f7f7f9", borderBottom: "2px solid rgba(0,0,0,0.06)" }}>
                  {[
                    { label: "Title", col: "title" },
                    { label: "Author", col: "author" },
                    { label: "Genre", col: "genre" },
                    { label: "Qty Sold", col: "qtySold" },
                    { label: "Airport 1 (BOM)", col: "qtyAirport1" },
                    { label: "Airport 2 (PNQ)", col: "qtyAirport2" },
                    { label: "Airport 3 (GOI)", col: "qtyAirport3" },
                    { label: "Pune Fair", col: "qtyPuneFair" },
                    { label: "Goa Fair", col: "qtyGoaFair" },
                    { label: "In-Stock", col: "inStock" },
                    { label: "Alert", col: "" },
                  ].map((h) => (
                    <th
                      key={h.label}
                      style={{ ...thStyle }}
                      onClick={() => h.col && handleSort(h.col)}
                    >
                      {h.label}{h.col && <SortArrow col={h.col} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((book, i) => {
                  const gConf = genreConfig[book.genre];
                  const isLowStock = book.inStock < 10;
                  return (
                    <tr
                      key={book.id}
                      style={{
                        borderTop: "1px solid rgba(0,0,0,0.04)",
                        background: isLowStock ? "rgba(251, 191, 36, 0.04)" : (i % 2 === 0 ? "#fff" : "#fafafa"),
                        transition: "background 0.1s",
                      }}
                    >
                      <td style={{ padding: "0.9rem 0.9rem", fontSize: 13, fontWeight: 600, color: "#1a1a2e", maxWidth: 200 }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.title}</div>
                      </td>
                      <td style={{ padding: "0.9rem 0.9rem", fontSize: 12, color: "#6b6b80", whiteSpace: "nowrap" }}>{book.author}</td>
                      <td style={{ padding: "0.9rem 0.9rem" }}>
                        <span style={{ background: gConf.bg, color: gConf.color, border: "1px solid " + gConf.border, fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: 5 }}>
                          {book.genre}
                        </span>
                      </td>
                      <td style={{ padding: "0.9rem 0.9rem", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>{book.qtySold}</td>
                      {["qtyAirport1", "qtyAirport2", "qtyAirport3", "qtyPuneFair", "qtyGoaFair"].map((key) => (
                        <td key={key} style={{ padding: "0.9rem 0.9rem", fontFamily: "var(--font-mono)", fontSize: 13, color: "#444", textAlign: "center" }}>
                          {(book as any)[key]}
                        </td>
                      ))}
                      <td style={{ padding: "0.9rem 0.9rem", textAlign: "center" }}>
                        <span style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 14,
                          fontWeight: 800,
                          color: isLowStock ? "#d97706" : "#16a34a",
                          background: isLowStock ? "#fffbeb" : "#f0fdf4",
                          padding: "0.25rem 0.6rem",
                          borderRadius: 6,
                          border: "1px solid " + (isLowStock ? "#fde68a" : "#bbf7d0"),
                        }}>
                          {book.inStock}
                        </span>
                      </td>
                      <td style={{ padding: "0.9rem 0.9rem" }}>
                        {isLowStock ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: "0.35rem 0.65rem", width: "fit-content" }}>
                            <AlertTriangle size={13} color="#d97706" />
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#d97706", whiteSpace: "nowrap" }}>LOW STOCK</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: "#6b6b80" }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid rgba(0,0,0,0.05)", background: "#f7f7f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#6b6b80" }}>
              Showing {filtered.length} of {stockData.length} titles
            </span>
            <span style={{ fontSize: 12, color: "#6b6b80" }}>Last updated: {new Date().toLocaleString("en-IN")}</span>
          </div>
        </div>

          </>
        ) : activeTab === "orders" ? (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.07)", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f7f7f9", borderBottom: "2px solid rgba(0,0,0,0.06)" }}>
                  <th style={thStyle}>Order ID</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Contact</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Screenshot</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any, i: number) => (
                  <tr key={order.id} style={{ borderTop: "1px solid rgba(0,0,0,0.04)", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600 }}>#{order.id}</td>
                    <td style={{ padding: "1rem", fontSize: 13, fontWeight: 600 }}>{order.customerName}</td>
                    <td style={{ padding: "1rem", fontSize: 12, color: "#6b6b80" }}>
                      <div>{order.customerEmail}</div>
                      <div>{order.customerPhone}</div>
                    </td>
                    <td style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700 }}>₹{order.amount}</td>
                    <td style={{ padding: "1rem" }}>
                      {order.paymentScreenshot ? (
                        <a href={`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}${order.paymentScreenshot}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#2563eb", fontSize: 12, textDecoration: "none", fontWeight: 600 }}>
                          <ImageIcon size={14} /> View
                        </a>
                      ) : (
                        <span style={{ fontSize: 12, color: "#6b6b80" }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "0.3rem 0.6rem", borderRadius: 6, background: order.status === "Completed" ? "#f0fdf4" : "#fffbeb", color: order.status === "Completed" ? "#16a34a" : "#d97706" }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {order.status !== "Completed" ? (
                        <button onClick={() => verifyOrder(order.id)} style={{ background: "#1a1a2e", color: "#fff", border: "none", padding: "0.4rem 0.8rem", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                          Verify Payment
                        </button>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#16a34a", fontSize: 12, fontWeight: 600 }}>
                          <CheckCircle size={14} /> Verified
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#6b6b80", fontSize: 13 }}>No orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === "gallery" ? (
          <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", maxWidth: 800, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#1a1a2e", marginBottom: "1.5rem" }}>Upload Gallery Event</h2>
            <form onSubmit={handleGallerySubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.4rem" }}>Title / Location</label>
                  <input type="text" required value={galleryForm.location} onChange={e => setGalleryForm({...galleryForm, location: e.target.value})} style={{ width: "100%", padding: "0.6rem 0.8rem", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 13, fontFamily: "var(--font-body)", boxSizing: "border-box" }} placeholder="e.g. Pune Book Fair" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.4rem" }}>Event Type</label>
                  <select required value={galleryForm.type} onChange={e => setGalleryForm({...galleryForm, type: e.target.value})} style={{ width: "100%", padding: "0.6rem 0.8rem", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 13, fontFamily: "var(--font-body)", boxSizing: "border-box" }}>
                    <option>Literary Event</option>
                    <option>Book Fair</option>
                    <option>Corporate Activation</option>
                    <option>Airport Library</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.4rem" }}>Venue / Place</label>
                  <input type="text" required value={galleryForm.place} onChange={e => setGalleryForm({...galleryForm, place: e.target.value})} style={{ width: "100%", padding: "0.6rem 0.8rem", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 13, fontFamily: "var(--font-body)", boxSizing: "border-box" }} placeholder="e.g. Bal Gandharva Rang Mandir" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.4rem" }}>City</label>
                  <input type="text" required value={galleryForm.city} onChange={e => setGalleryForm({...galleryForm, city: e.target.value})} style={{ width: "100%", padding: "0.6rem 0.8rem", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 13, fontFamily: "var(--font-body)", boxSizing: "border-box" }} placeholder="e.g. Pune" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.4rem" }}>Date</label>
                  <input type="date" required value={galleryForm.date} onChange={e => setGalleryForm({...galleryForm, date: e.target.value})} style={{ width: "100%", padding: "0.6rem 0.8rem", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 13, fontFamily: "var(--font-body)", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.4rem" }}>Duration</label>
                  <input type="text" required value={galleryForm.duration} onChange={e => setGalleryForm({...galleryForm, duration: e.target.value})} style={{ width: "100%", padding: "0.6rem 0.8rem", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 13, fontFamily: "var(--font-body)", boxSizing: "border-box" }} placeholder="e.g. 2 days or Ongoing" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.4rem" }}>Authors Present</label>
                  <input type="number" required value={galleryForm.authors} onChange={e => setGalleryForm({...galleryForm, authors: e.target.value})} style={{ width: "100%", padding: "0.6rem 0.8rem", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 13, fontFamily: "var(--font-body)", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.4rem" }}>Books Sold</label>
                  <input type="number" required value={galleryForm.booksSold} onChange={e => setGalleryForm({...galleryForm, booksSold: e.target.value})} style={{ width: "100%", padding: "0.6rem 0.8rem", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 13, fontFamily: "var(--font-body)", boxSizing: "border-box" }} />
                </div>
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.4rem" }}>Description</label>
                <textarea required value={galleryForm.description} onChange={e => setGalleryForm({...galleryForm, description: e.target.value})} style={{ width: "100%", padding: "0.6rem 0.8rem", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 13, fontFamily: "var(--font-body)", boxSizing: "border-box", minHeight: 80 }} placeholder="Write a short recap..." />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.4rem" }}>Upload Photo {editingGalleryId && <span style={{ color: "#6b6b80", fontWeight: 400 }}>(Leave empty to keep existing)</span>}</label>
                <input type="file" accept="image/*" onChange={e => setGalleryFile(e.target.files ? e.target.files[0] : null)} style={{ width: "100%", padding: "0.6rem 0.8rem", border: "1px dashed rgba(0,0,0,0.2)", borderRadius: 8, fontSize: 13, fontFamily: "var(--font-body)", boxSizing: "border-box", background: "#f9f9fb" }} />
              </div>

              <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
                <button type="submit" style={{ background: "#2563eb", color: "#fff", border: "none", padding: "0.8rem 1.5rem", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)" }}>
                  {editingGalleryId ? "Update Gallery Event" : "Upload to Gallery"}
                </button>
                {editingGalleryId && (
                  <button type="button" onClick={() => { setEditingGalleryId(null); setGalleryForm({ location: "", place: "", city: "", date: "", duration: "", authors: "", booksSold: "", type: "Literary Event", description: "" }); }} style={{ background: "transparent", color: "#1a1a2e", border: "1px solid rgba(0,0,0,0.2)", padding: "0.8rem 1.5rem", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)" }}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#1a1a2e", marginTop: "3rem", marginBottom: "1rem", borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: "2rem" }}>Existing Gallery Events</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {galleryList.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, background: "#f9f9fb" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    {item.photoUrl && <img src={`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}${item.photoUrl}`} style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6 }} />}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", marginBottom: "0.2rem" }}>{item.location}</div>
                      <div style={{ fontSize: 12, color: "#6b6b80" }}>{item.city} • {new Date(item.date).toLocaleDateString()} • {item.type}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => handleEditGallery(item)} style={{ background: "rgba(37,99,235,0.1)", color: "#2563eb", border: "none", padding: "0.4rem 0.8rem", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Edit</button>
                    <button onClick={() => handleDeleteGallery(item.id)} style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", padding: "0.4rem 0.8rem", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Delete</button>
                  </div>
                </div>
              ))}
              {galleryList.length === 0 && <div style={{ fontSize: 13, color: "#6b6b80", textAlign: "center", padding: "1rem" }}>No events found.</div>}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
