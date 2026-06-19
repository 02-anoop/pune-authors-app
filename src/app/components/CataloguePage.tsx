import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import axios from "axios";
import { ShoppingCart, Search, Filter, Star } from "lucide-react";

const genreConfig = {
  NF: { label: "Non-Fiction", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  F: { label: "Fiction", color: "#db2777", bg: "#fdf2f8", border: "#fbcfe8" },
  P: { label: "Poetry", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  C: { label: "Children's", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
};

type Genre = keyof typeof genreConfig;

export function CataloguePage() {
  const [searchParams] = useSearchParams();
  const initialGenre = searchParams.get("genre") || "All";
  const [activeGenre, setActiveGenre] = useState(initialGenre);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<number[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}/api/books`)
      .then(res => setBooks(res.data))
      .catch(err => console.error(err));
  }, []);

  const genres = ["All", "NF", "F", "P", "C"];

  const filtered = books.filter((b) => {
    const matchGenre = activeGenre === "All" || b.genre === activeGenre;
    const authorName = b.author?.name || "";
    const matchSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGenre && matchSearch;
  });

  const addToCart = (id: number) => {
    setCart((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <main style={{ fontFamily: "var(--font-body)", minHeight: "100vh" }}>
      {/* Header */}
      <section style={{ background: "#f7f7f9", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem" }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6b6b80", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.4rem" }}>PAA Catalogue</div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "#1a1a2e" }}>Explore &amp; Buy Books</h1>
              <p style={{ fontSize: 14, color: "#6b6b80", marginTop: "0.3rem" }}>{books.length} titles by Pune Authors' Association members</p>
            </div>

            {/* Cart indicator */}
            {userRole !== 'AUTHOR' && userRole !== 'ADMIN' && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#1a1a2e", color: "#fff", padding: "0.6rem 1rem", borderRadius: 10, cursor: "pointer" }}>
                <ShoppingCart size={16} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{cart.length} in cart</span>
              </div>
            )}
          </div>

          {/* Search + Filter row */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={15} color="#6b6b80" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search title or author…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem 0.6rem 2.25rem",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: 10,
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  background: "#fff",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Genre tabs */}
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {genres.map((g) => {
                const gMeta = g === "All" ? null : genreConfig[g as Genre];
                const isActive = activeGenre === g;
                return (
                  <button
                    key={g}
                    onClick={() => setActiveGenre(g)}
                    style={{
                      padding: "0.45rem 0.9rem",
                      borderRadius: 8,
                      border: isActive ? "1.5px solid " + (gMeta?.color || "#1a1a2e") : "1.5px solid rgba(0,0,0,0.1)",
                      background: isActive ? (gMeta ? gMeta.bg : "#1a1a2e") : "#fff",
                      color: isActive ? (gMeta ? gMeta.color : "#fff") : "#6b6b80",
                      fontFamily: "var(--font-body)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {g === "All" ? "All Books" : `${g} — ${gMeta?.label}`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Books grid */}
      <section style={{ padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "4rem", color: "#6b6b80" }}>
              <Search size={40} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
              <p style={{ fontSize: 15 }}>No books found. Try a different filter or search.</p>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {filtered.map((book) => {
              const gMeta = genreConfig[book.genre];
              const inCart = cart.includes(book.id);
              return (
                <div
                  key={book.id}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    border: "1px solid rgba(0,0,0,0.07)",
                    overflow: "hidden",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column",
                    transition: "box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"; }}
                >
                  {/* Cover */}
                  <div style={{ position: "relative", height: 220, background: "#f7f7f9", overflow: "hidden" }}>
                    <img src={book.coverUrl ? (book.coverUrl.startsWith('http') ? book.coverUrl : `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${book.coverUrl}`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=420&fit=crop"} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    {gMeta && (
                      <div style={{ position: "absolute", top: 10, left: 10, background: gMeta.bg, color: gMeta.color, border: "1px solid " + gMeta.border, fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: 5, letterSpacing: "0.05em" }}>
                        {book.genre}
                      </div>
                    )}
                    <div style={{ position: "absolute", top: 10, right: 10, display: "flex", alignItems: "center", gap: "0.25rem", background: "rgba(0,0,0,0.6)", borderRadius: 6, padding: "0.25rem 0.5rem" }}>
                      <Star size={11} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#fff", fontWeight: 600 }}>{book.rating || "4.5"}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "1.2rem", flex: 1, display: "flex", flexDirection: "column" }}>
                    {/* Author row */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      <img src={book.author?.photoUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop"} alt={book.author?.name} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: "2px solid " + (gMeta?.border || "#eee") }} />
                      <span style={{ fontSize: 12, color: "#6b6b80" }}>{book.author?.name}</span>
                    </div>

                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#1a1a2e", lineHeight: 1.3, marginBottom: "0.6rem" }}>
                      {book.title}
                    </h3>

                    <p style={{ fontSize: 12, color: "#6b6b80", lineHeight: 1.7, flex: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical" }}>
                      {book.synopsis}
                    </p>

                    {/* Footer */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                      <div>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 800, color: "#1a1a2e" }}>₹{book.mrp}</span>
                        <span style={{ fontSize: 11, color: "#6b6b80", marginLeft: 4 }}>MRP</span>
                      </div>
                      {userRole !== 'AUTHOR' && userRole !== 'ADMIN' && (
                        <button
                          onClick={() => addToCart(book.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            background: inCart ? gMeta.color : "#1a1a2e",
                            color: "#fff",
                            border: "none",
                            padding: "0.5rem 1rem",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "var(--font-body)",
                            transition: "background 0.15s",
                          }}
                        >
                          <ShoppingCart size={13} />
                          {inCart ? "In Cart" : "Click to Buy"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Checkout CTA */}
      {cart.length > 0 && (
        <div style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          background: "#1a1a2e",
          color: "#fff",
          borderRadius: 14,
          padding: "1rem 1.5rem",
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          zIndex: 100,
        }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700 }}>{cart.length} book{cart.length > 1 ? "s" : ""} selected</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>₹{cart.reduce((acc, id) => acc + (books.find(b => b.id === id)?.mrp || 0), 0)} total</div>
          </div>
          <Link to="/checkout" state={{ cart }} style={{ background: "#fff", color: "#1a1a2e", padding: "0.5rem 1rem", borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap" }}>
            Checkout →
          </Link>
        </div>
      )}
    </main>
  );
}
