import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ShoppingCart, Search, SlidersHorizontal, Star, ChevronRight, X, BookOpen, Info, Download } from "lucide-react";
// ── Category config ─────────────────────────────────────────────────────────
const CATEGORIES = {
  "Non-Fiction": {
    code: "NF",
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    subGenres: ["All", "Spiritual/Self-Help", "Geopolitics", "Historical", "Biographies", "Short Stories"],
  },
  Fiction: {
    code: "F",
    color: "#db2777",
    bg: "#fdf2f8",
    border: "#fbcfe8",
    subGenres: ["All", "Romance", "Thriller", "Mysteries", "Sci-Fi", "Poetry"],
  },
  Children: {
    code: "C",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    subGenres: ["All"],
  },
} as const;
type CategoryName = keyof typeof CATEGORIES;

// ── MRP parser ──────────────────────────────────────────────────────────────
function parseMrp(s: string): number | null {
  if (!s || s === "Not specified") return null;
  const m = s.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : null;
}

// Detect children's category from bio text
function isChildrensAuthor(bio: string): boolean {
  const b = bio.toLowerCase();
  return (
    b.includes("early childhood") ||
    b.includes("children's fiction") ||
    (b.includes("children") && b.includes("storybook")) ||
    b.includes("children's book") ||
    b.includes("young reader")
  );
}

// ── Normalise both JSON files into one flat list ─────────────────────────────
interface CatalogueBook {
  id: string;
  title: string;
  synopsis: string;
  mrp: number | null;
  mrpRaw: string;
  coverUrl: string;
  authorName: string;
  authorBio: string;
  genre: "NF" | "F" | "C";
  subGenre: string;
}


// ── PDF catalogue download ───────────────────────────────────────────────────
function downloadCataloguePDF(label: string, books: CatalogueBook[]) {
  const win = window.open("", "_blank")!;
  const rows = books
    .map(
      (b) => `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">${b.title}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${b.authorName}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${b.mrp != null ? "₹" + b.mrp : b.mrpRaw || "—"}</td>
    </tr>`
    )
    .join("");
  win.document.write(`<!DOCTYPE html><html><head><title>PAA — ${label}</title>
  <style>body{font-family:Georgia,serif;padding:40px;color:#111}h1{color:#b44d28}table{width:100%;border-collapse:collapse}th{background:#1a1a2e;color:#fff;padding:10px 8px;text-align:left}@media print{button{display:none}}</style>
  </head><body>
  <h1>Pune Authors' Association</h1><h2>${label} Catalogue</h2>
  <p style="color:#666">Generated: ${new Date().toLocaleDateString("en-IN")} &nbsp;·&nbsp; ${books.length} title(s)</p>
  <table><thead><tr><th>Title</th><th>Author</th><th>MRP</th></tr></thead><tbody>${rows}</tbody></table>
  <br/><button onclick="window.print()" style="background:#b44d28;color:#fff;border:none;padding:10px 24px;font-size:14px;cursor:pointer;border-radius:4px">Print / Save as PDF</button>
  </body></html>`);
  win.document.close();
}

// ── Component ────────────────────────────────────────────────────────────────
export function CataloguePage() {
  const [activeCategory, setActiveCategory] = useState<"All" | CategoryName>("All");
  const [activeSubGenre, setActiveSubGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc" | "title">("default");
  const [cart, setCart] = useState<string[]>([]);
  const [tooltip, setTooltip] = useState<{ name: string; bio: string; x: number; y: number } | null>(null);
  const [allBooks, setAllBooks] = useState<CatalogueBook[]>([]);
  const userRole = localStorage.getItem("userRole");

  // Normalize genre string to internal code
  const toGenreCode = (g: string): "NF" | "F" | "C" => {
    const norm = g?.toLowerCase().trim();
    if (norm === "non-fiction" || norm === "nf") return "NF";
    if (norm === "children" || norm === "children's corner" || norm === "c") return "C";
    // fiction, f, p, or anything else → Fiction
    return "F";
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/books`)
      .then(res => res.json())
      .then(data => {
        const mapped: CatalogueBook[] = data.map((b: any) => ({
          id: b.id.toString(),
          title: b.title,
          synopsis: b.synopsis || "",
          mrp: b.mrp,
          mrpRaw: b.mrp?.toString(),
          coverUrl: b.coverUrl || "",
          authorName: b.author?.name || "Unknown",
          authorBio: b.author?.bio || "",
          genre: toGenreCode(b.genre),
          subGenre: b.subGenre || ""
        }));
        setAllBooks(mapped);
      })
      .catch(console.error);
  }, []);

  const catMeta = activeCategory !== "All" ? CATEGORIES[activeCategory as CategoryName] : null;
  const subGenres = catMeta ? catMeta.subGenres : [];

  // Reset subgenre on category change
  const handleCategoryChange = (cat: "All" | CategoryName) => {
    setActiveCategory(cat);
    setActiveSubGenre("All");
  };

  const filteredBooks = useMemo(() => {
    let list = allBooks;

    if (activeCategory !== "All") {
      const code = CATEGORIES[activeCategory as CategoryName].code;
      list = list.filter((b) => b.genre === code);
    }

    if (activeSubGenre !== "All") {
      list = list.filter((b) => b.subGenre.toLowerCase() === activeSubGenre.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.authorName.toLowerCase().includes(q) ||
          b.synopsis.toLowerCase().includes(q)
      );
    }

    if (sortBy === "price_asc") list.sort((a, b) => (a.mrp ?? 0) - (b.mrp ?? 0));
    else if (sortBy === "price_desc") list.sort((a, b) => (b.mrp ?? 0) - (a.mrp ?? 0));
    else if (sortBy === "title") list.sort((a, b) => a.title.localeCompare(b.title));

    return list;
  }, [activeCategory, activeSubGenre, searchQuery, sortBy, allBooks]);

  const addToCart = (id: string) =>
    setCart((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const cartTotal = cart.reduce((acc, id) => {
    const book = allBooks.find((b) => b.id === id);
    return acc + (book?.mrp || 0);
  }, 0);

  const genreLabel = (g: string) =>
    g === "NF" ? "Non-Fiction" : g === "F" ? "Fiction" : "Children";
  const genreColor = (g: string) =>
    g === "NF" ? CATEGORIES["Non-Fiction"] : g === "F" ? CATEGORIES.Fiction : CATEGORIES.Children;

  return (
    <main style={{ fontFamily: "var(--font-body)", minHeight: "100vh", background: "#f8f8fa" }}>
      {/* ── Header ── */}
      <section style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.07)", padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem", marginBottom: "2rem" }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#b44d28", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                PAA Book Catalogue
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>
                Explore &amp; Buy Books
              </h1>
              <p style={{ fontSize: 14, color: "#6b6b80", marginTop: "0.3rem" }}>
                {allBooks.length} titles by Pune Authors' Association members
              </p>
            </div>
            {userRole !== "AUTHOR" && userRole !== "ADMIN" && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#1a1a2e", color: "#fff", padding: "0.6rem 1.1rem", borderRadius: 10 }}>
                <ShoppingCart size={15} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{cart.length} in cart</span>
              </div>
            )}
          </div>

          {/* PDF Catalogue Downloads */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            <a
              href="/catalogues/fiction-catalogue.pdf"
              download="Fiction-Catalogue-PAA.pdf"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#fdf2f8", color: "#db2777", border: "1.5px solid #fbcfe8", borderRadius: 10, padding: "0.55rem 1.1rem", fontSize: 13, fontWeight: 700, textDecoration: "none", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fce7f3")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fdf2f8")}
            >
              <Download size={13} /> Download Fiction Catalogue (PDF)
            </a>
            <a
              href="/catalogues/non-fiction-catalogue.pdf"
              download="Non-Fiction-Catalogue-PAA.pdf"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#eff6ff", color: "#2563eb", border: "1.5px solid #bfdbfe", borderRadius: 10, padding: "0.55rem 1.1rem", fontSize: 13, fontWeight: 700, textDecoration: "none", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#dbeafe")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#eff6ff")}
            >
              <Download size={13} /> Download Non-Fiction Catalogue (PDF)
            </a>
          </div>

          {/* Top-level category tabs (no emojis) */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
            {(["All", "Non-Fiction", "Fiction", "Children"] as Array<"All" | CategoryName>).map((cat) => {
              const meta = cat !== "All" ? CATEGORIES[cat as CategoryName] : null;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  style={{
                    padding: "0.55rem 1.25rem",
                    borderRadius: 10,
                    border: `2px solid ${isActive ? (meta?.color || "#1a1a2e") : "transparent"}`,
                    background: isActive ? (meta?.bg || "#1a1a2e") : "#f3f3f7",
                    color: isActive ? (meta?.color || "#fff") : "#4b5563",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {cat === "All" ? "All Books" : cat}
                </button>
              );
            })}
          </div>

          {/* Sub-genre chips */}
          {subGenres.length > 1 && (
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
              {subGenres.map((sg) => {
                const isActive = activeSubGenre === sg;
                return (
                  <button
                    key={sg}
                    onClick={() => setActiveSubGenre(sg)}
                    style={{
                      padding: "0.35rem 0.9rem",
                      borderRadius: 20,
                      border: `1.5px solid ${isActive ? catMeta!.color : "rgba(0,0,0,0.1)"}`,
                      background: isActive ? catMeta!.color : "#fff",
                      color: isActive ? "#fff" : "#6b6b80",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {sg}
                  </button>
                );
              })}
            </div>
          )}

          {/* Search + Sort + Download */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <Search size={15} color="#6b6b80" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search by title, author or description…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 2.5rem 0.65rem 2.25rem",
                  border: "1.5px solid rgba(0,0,0,0.1)",
                  borderRadius: 10,
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  background: "#fff",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                  <X size={14} color="#6b6b80" />
                </button>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: 13, color: "#666", fontWeight: 600 }}>
              {filteredBooks.length} result{filteredBooks.length !== 1 && "s"}
            </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{ padding: "0.6rem 0.85rem", border: "1.5px solid rgba(0,0,0,0.1)", borderRadius: 10, fontFamily: "var(--font-body)", fontSize: 13, background: "#fff", cursor: "pointer", outline: "none" }}
              >
                <option value="default">Sort: Default</option>
                <option value="title">A → Z</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Results bar */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "1rem 1.5rem 0", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#6b6b80" }}>
          Showing <strong style={{ color: "#1a1a2e" }}>{filteredBooks.length}</strong> book{filteredBooks.length !== 1 ? "s" : ""}
          {searchQuery && <> for "<strong>{searchQuery}</strong>"</>}
        </span>
        {activeCategory !== "All" && catMeta && (
          <span style={{ background: catMeta.bg, color: catMeta.color, border: `1px solid ${catMeta.border}`, borderRadius: 20, padding: "0.2rem 0.7rem", fontSize: 12, fontWeight: 600 }}>
            {activeCategory}
          </span>
        )}
      </div>

      {/* Books Grid */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "1.5rem 1.5rem 4rem" }}>
        {filteredBooks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem", color: "#6b6b80" }}>
            <BookOpen size={40} style={{ margin: "0 auto 1rem", opacity: 0.3, display: "block" }} />
            <p style={{ fontSize: 15, fontWeight: 600 }}>No books found</p>
            <button onClick={() => { setSearchQuery(""); setActiveCategory("All"); setActiveSubGenre("All"); }}
              style={{ marginTop: "1.5rem", background: "#1a1a2e", color: "#fff", border: "none", padding: "0.6rem 1.5rem", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              Clear Filters
            </button>
            <button
                onClick={() => downloadCataloguePDF(activeCategory, filteredBooks)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  padding: "0.6rem 1.1rem",
                  background: catMeta ? catMeta.color : "#1a1a2e",
                  color: "#fff", border: "none", borderRadius: 10,
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  fontFamily: "var(--font-body)", whiteSpace: "nowrap",
                  marginTop: "1rem",
                }}
              >
              <Download size={14} /> Download {activeCategory === "All" ? "Complete" : activeCategory} Catalogue (PDF)
            </button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "2rem"
          }}>
            {filteredBooks.map((book) => {
              const meta = genreColor(book.genre);
              const inCart = cart.includes(book.id);
              return (
                <div
                  key={book.id}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    border: `1px solid ${meta.border}`,
                    overflow: "hidden",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 36px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
                  }}
                >
                  {/* Cover */}
                  <div
                    onClick={() => window.location.href = `/book/${book.id}`}
                    style={{ position: "relative", height: 220, background: "#f7f7f9", overflow: "hidden", flexShrink: 0, cursor: "pointer" }}>
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: meta.bg }}>
                        <BookOpen size={48} color={meta.color} style={{ opacity: 0.3 }} />
                      </div>
                    )}
                    {/* Genre badge */}
                    <div style={{ position: "absolute", top: 10, left: 10, background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, fontSize: 10, fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: 6 }}>
                      {genreLabel(book.genre)}
                    </div>
                    {/* Rating placeholder */}
                    <div style={{ position: "absolute", bottom: 10, right: 10, display: "flex", alignItems: "center", gap: "0.25rem", background: "rgba(0,0,0,0.6)", borderRadius: 6, padding: "0.2rem 0.5rem" }}>
                      <Star size={11} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#fff", fontWeight: 600 }}>4.5</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "1.2rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {/* Author row with bio tooltip trigger */}
                    <div
                      style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
                      onMouseEnter={(e) => {
                        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                        setTooltip({ name: book.authorName, bio: book.authorBio, x: rect.left, y: rect.bottom + 8 });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: meta.bg, border: `2px solid ${meta.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>
                          {book.authorName.charAt(0)}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: "#6b6b80", fontWeight: 500 }}>{book.authorName}</span>
                      <Info size={12} color={meta.color} style={{ marginLeft: "auto", flexShrink: 0, opacity: 0.6 }} />
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => window.location.href = `/book/${book.id}`}
                      style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "#1a1a2e", lineHeight: 1.35, margin: 0, cursor: "pointer" }}
                      title="View book details"
                    >
                      {book.title}
                    </h3>
                    {book.subGenre && (
                      <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, borderRadius: 4, padding: "0.15rem 0.5rem" }}>
                        {book.subGenre}
                      </span>
                    )}

                    {/* Synopsis */}
                    <p style={{ fontSize: 12, color: "#6b6b80", lineHeight: 1.65, flex: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", margin: 0 }}>
                      {book.synopsis}
                    </p>

                    {/* Footer */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                      <div>
                        {book.mrp != null ? (
                          <>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 800, color: "#1a1a2e" }}>₹{book.mrp}</span>
                            <span style={{ fontSize: 10, color: "#9ca3af", marginLeft: 3 }}>MRP</span>
                          </>
                        ) : (
                          <span style={{ fontSize: 12, color: "#9ca3af" }}>{book.mrpRaw || "Price TBD"}</span>
                        )}
                      </div>
                      {userRole !== "AUTHOR" && userRole !== "ADMIN" && book.mrp != null && (
                        <button
                          onClick={() => addToCart(book.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: "0.35rem",
                            background: inCart ? meta.color : "#1a1a2e",
                            color: "#fff", border: "none", padding: "0.5rem 1rem",
                            borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                            fontFamily: "var(--font-body)", transition: "background 0.15s",
                          }}
                        >
                          <ShoppingCart size={12} />
                          {inCart ? "In Cart" : "Buy"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Author Bio Tooltip */}
      {tooltip && (
        <div
          style={{
            position: "fixed",
            left: Math.min(tooltip.x, window.innerWidth - 340),
            top: tooltip.y,
            width: 320,
            background: "#1a1a2e",
            color: "#fff",
            padding: "1rem 1.25rem",
            borderRadius: 12,
            fontSize: 12,
            lineHeight: 1.65,
            zIndex: 2000,
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: "0.5rem", color: "#f59e0b" }}>{tooltip.name}</div>
          <div style={{ opacity: 0.85, maxHeight: 180, overflow: "hidden" }}>{tooltip.bio}</div>
        </div>
      )}

      {/* Floating Cart */}
      {cart.length > 0 && (
        <div style={{
          position: "fixed", bottom: "1.5rem", right: "1.5rem",
          background: "#1a1a2e", color: "#fff", borderRadius: 14,
          padding: "1rem 1.5rem", boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          display: "flex", alignItems: "center", gap: "1rem", zIndex: 100,
        }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700 }}>{cart.length} book{cart.length > 1 ? "s" : ""} selected</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>₹{cartTotal} total</div>
          </div>
          <Link to="/checkout" state={{ cart }}
            style={{ background: "#b44d28", color: "#fff", padding: "0.5rem 1.1rem", borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap" }}>
            Checkout <ChevronRight size={14} style={{ display: "inline", verticalAlign: "middle" }} />
          </Link>
        </div>
      )}

      <style>{`@media(max-width:640px){section{padding-left:1rem!important;padding-right:1rem!important}}`}</style>
    </main>
  );
}
