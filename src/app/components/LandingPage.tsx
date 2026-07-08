import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import axios from "axios";
import { ArrowRight, Book, BookOpen, Megaphone, Store, Mic, Sparkles, Users, Plane, Library, PenTool, Palette, Printer, FileText, Mail, Phone, MapPin, Download, ExternalLink, Heart, Search, Landmark, Rocket, Feather } from "lucide-react";
import { toast } from "sonner";

// --- ANIMATED COUNTER ---
function CountUp({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    // Don't animate if there's no data yet, wait for the live update
    if (end === 0) {
      setCount(0);
      return;
    }

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      setCount(Math.floor(easeProgress * end));
      
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    
    animationFrameId = window.requestAnimationFrame(step);
    
    return () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [end, duration, isVisible]);

  return (
    <div ref={ref} style={{ display: "inline-block" }}>
      {count}
      {suffix}
    </div>
  );
}

// --- FADE IN ON SCROLL ---
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(18px)",
        transition: `all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// --- COLOR PALETTE ---
const C = {
  gold: "#d4a017",
  goldLight: "#f5e6b8",
  goldBg: "#fffdf5",
  amber: "#b44d28",
  dark: "#1a1a1a",
  darkCard: "#222",
  text: "#333",
  muted: "#777",
  border: "#e8e0d0",
  white: "#fff",
  cream: "#faf7f0",
  greenDark: "#1b5e20",
  greenLight: "#e8f5e9",
  blueDark: "#0d47a1",
};

const topGenres = [
  { name: "Romance", icon: <Heart color="#ef4444" size={28} />, bg: "#fee2e2", cat: "Fiction", subcat: "Romance" },
  { name: "Mystery", icon: <Search color="#eab308" size={28} />, bg: "#fef9c3", cat: "Fiction", subcat: "Mystery & Thriller" },
  { name: "Historical", icon: <Landmark color="#d97706" size={28} />, bg: "#ffedd5", cat: "Fiction", subcat: "Historical Fiction" },
  { name: "Fantasy", icon: <Sparkles color="#a855f7" size={28} />, bg: "#f3e8ff", cat: "Fiction", subcat: "Fantasy" },
  { name: "Sci-Fi", icon: <Rocket color="#3b82f6" size={28} />, bg: "#dbeafe", cat: "Fiction", subcat: "Science Fiction" },
  { name: "Poetry", icon: <Feather color="#ec4899" size={28} />, bg: "#fce7f3", cat: "Poetry", subcat: "All" },
];

const topLanguages = [
  { name: "Marathi", letter: "म", bg: "#fee2e2", color: "#ef4444" },
  { name: "English", letter: "A", bg: "#dbeafe", color: "#3b82f6" },
  { name: "Hindi", letter: "हिं", bg: "#fef9c3", color: "#eab308" },
  { name: "Sanskrit", letter: "सं", bg: "#ffedd5", color: "#f97316" },
  { name: "Kannada", letter: "ಕ", bg: "#e0f2fe", color: "#0ea5e9" },
  { name: "Tamil", letter: "த", bg: "#fef3c7", color: "#d97706" },
];

export function LandingPage() {
  const [activeGenre, setActiveGenre] = useState<string>("All Books");
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [stats, setStats] = useState({
    events: 0, fairs: 0, airportLibraries: 0, authors: 0, books: 0, categories: 0,
  });

  // Contact State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/books`)
      .then((res) => {
        const mapped = res.data.map((b: any) => ({
          ...b,
          originalGenre: b.genre,
          authorName: b.author?.name || "Unknown",
          genre: b.genre?.includes("Children") ? "C" : b.genre?.includes("Non-Fiction") || b.genre === "NF" ? "NF" : "F",
          description: b.synopsis,
        }));
        setGalleryItems(mapped);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingBooks(false));

    axios
      .get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/public-stats`)
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));
  }, []);

  const mappedGenre = activeGenre === "All Books" ? null : activeGenre === "Non-Fiction" ? "NF" : activeGenre === "Fiction" ? "F" : activeGenre === "Children's corner" ? "C" : null;
  const filteredGallery = mappedGenre ? galleryItems.filter((b: any) => b.genre === mappedGenre) : galleryItems;

  const allSubCategories = Array.from(new Set(galleryItems.map((b: any) => {
    if (b.subGenre && b.subGenre.trim() !== "All" && b.subGenre.trim() !== "") {
       const parts = b.subGenre.split(">").map((s: string) => s.trim());
       return parts[0];
    }
    return b.originalGenre;
  }).filter(Boolean)));

  const availableGenres = allSubCategories.map(catName => {
    const isNA = catName.toUpperCase() === "NA" || catName.toUpperCase() === "N/A";
    const displayName = isNA ? "Others" : catName;

    const curated = topGenres.find(g => g.subcat.toLowerCase() === catName.toLowerCase() || g.name.toLowerCase() === catName.toLowerCase());
    if (curated && !isNA) return curated;
    
    const colors = [
      { bg: "#fee2e2", color: "#ef4444" },
      { bg: "#dbeafe", color: "#3b82f6" },
      { bg: "#fef9c3", color: "#eab308" },
      { bg: "#e0f2fe", color: "#0ea5e9" },
      { bg: "#f3e8ff", color: "#a855f7" },
      { bg: "#ffedd5", color: "#f97316" },
      { bg: "#fce7f3", color: "#ec4899" },
      { bg: "#dcfce7", color: "#22c55e" },
    ];
    let hash = 0;
    for (let i = 0; i < displayName.length; i++) { hash = displayName.charCodeAt(i) + ((hash << 5) - hash); }
    const c = colors[Math.abs(hash) % colors.length];

    return {
      name: displayName,
      icon: <BookOpen color={c.color} size={28} />,
      bg: c.bg,
      cat: "All",
      subcat: catName
    };
  }).sort((a, b) => {
    if (a.name === "Others") return 1;
    if (b.name === "Others") return -1;
    return a.name.localeCompare(b.name);
  });

  const allLanguageNames = Array.from(new Set(galleryItems.map((b: any) => b.language?.trim()).filter(Boolean)));
  
  const availableLanguages = allLanguageNames.map(langName => {
    const isNA = langName.toUpperCase() === "NA" || langName.toUpperCase() === "N/A";
    const displayName = isNA ? "Others" : langName;

    const curated = topLanguages.find(l => l.name.toLowerCase() === langName.toLowerCase());
    if (curated && !isNA) return { ...curated, searchParam: langName };
    
    const colors = [
      { bg: "#fce7f3", color: "#ec4899" },
      { bg: "#dcfce7", color: "#22c55e" },
      { bg: "#ede9fe", color: "#8b5cf6" },
      { bg: "#ffedd5", color: "#f97316" },
      { bg: "#ccfbf1", color: "#14b8a6" },
      { bg: "#fee2e2", color: "#ef4444" },
      { bg: "#dbeafe", color: "#3b82f6" },
      { bg: "#fef9c3", color: "#eab308" },
    ];
    let hash = 0;
    for (let i = 0; i < displayName.length; i++) { hash = displayName.charCodeAt(i) + ((hash << 5) - hash); }
    const c = colors[Math.abs(hash) % colors.length];
    
    return {
      name: displayName,
      searchParam: langName,
      letter: displayName.charAt(0).toUpperCase(),
      bg: c.bg,
      color: c.color
    };
  }).sort((a, b) => {
    if (a.name === "Others") return 1;
    if (b.name === "Others") return -1;
    return a.name.localeCompare(b.name);
  });

  return (
    <main style={{ fontFamily: "var(--font-body)", background: C.cream, color: C.dark, overflowX: "hidden" }}>

      {/* ════════════════════════════════════════════
          HERO — GOLDEN GRADIENT BANNER
      ════════════════════════════════════════════ */}
      <section
        style={{
          background: `linear-gradient(135deg, #262319 0%, #242217 100%)`,
          position: "relative",
          overflow: "hidden",
          borderTop: "3px solid #d9ac42"
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "3rem 2rem",
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: "4rem",
            alignItems: "center",
          }}
          className="hero-grid"
        >
          <FadeIn>
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  background: "#353023",
                  border: `1px solid #d9ac42`,
                  borderRadius: 50,
                  padding: "0.4rem 1.2rem",
                  marginBottom: "2rem",
                }}
              >
                <Sparkles size={14} color="#d9ac42" />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#d9ac42", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Est. December 2024
                </span>
              </div>

              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
                  fontWeight: 400,
                  color: "#ffffff",
                  lineHeight: 1.15,
                  marginBottom: "1.5rem",
                  letterSpacing: "-0.01em",
                }}
              >
                Helping indie{" "}
                <span style={{ fontStyle: "italic", color: "#d9ac42" }}>authors</span>
                <br />
                publish, promote and sell.
              </h1>

              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, marginBottom: "2.5rem", maxWidth: 480 }}>
                A dedicated, self-governing independent collective built to publish, distribute, promote, and establish high visibility for modern Indian writers.
              </p>

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link
                  to="/register"
                  className="hero-btn-primary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "#dbab3f",
                    color: "#242217",
                    padding: "0.85rem 2rem",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    borderRadius: 6,
                    transition: "all 0.3s ease",
                  }}
                >
                  <Users size={16} /> New Authors — Join Us
                </Link>
                <Link
                  to="/gallery"
                  className="hero-btn-outline"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "transparent",
                    color: "#d9ac42",
                    border: `1px solid #d9ac42`,
                    padding: "0.85rem 2rem",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    borderRadius: 6,
                    transition: "all 0.3s ease",
                  }}
                >
                  Gallery <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </FadeIn>

          {/* Right side — 4 Pillars */}
          <FadeIn delay={200}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              {[
                { icon: <PenTool size={22} />, label: "We Publish", color: "#b84b3f" },
                { icon: <Megaphone size={22} />, label: "We Promote", color: "#385c40" },
                { icon: <Store size={22} />, label: "We Sell", color: "#b38d33" },
                { icon: <BookOpen size={22} />, label: "We Revive", color: "#36546b" },
              ].map((p, i) => (
                <div
                  key={i}
                  className="pillar-card"
                  style={{
                    background: "#312c20",
                    borderRadius: 12,
                    padding: "2.5rem 1.5rem",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    cursor: "default",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: p.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1.5rem",
                      color: "#ffffff",
                    }}
                  >
                    {p.icon}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", letterSpacing: "0.02em" }}>{p.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          IMPACT STATS — GOLD ACCENT BAR
      ════════════════════════════════════════════ */}
      <section style={{ background: C.white, borderBottom: `1px solid ${C.border}` }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "3rem 2rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "2rem",
          }}
          className="stats-grid"
        >
          {[
            { num: stats.events, suffix: "+", label: "Literary Events" },
            { num: stats.fairs, suffix: "+", label: "Book Fairs" },
            { num: stats.airportLibraries, suffix: "", label: "Airport Libraries" },
            { num: stats.authors, suffix: "+", label: "Authors" },
            { num: stats.books, suffix: "+", label: "Books" },
            { num: stats.categories, suffix: "+", label: "Categories" },
          ].map((stat, i) => (
            <FadeIn key={i} delay={i * 60}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: 400, color: C.dark, lineHeight: 1 }}>
                  <CountUp end={stat.num} suffix={stat.suffix} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.gold, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "0.4rem" }}>
                  {stat.label}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>


      {/* ════════════════════════════════════════════
          BUY OUR BOOKS — HORIZONTAL SCROLL
      ════════════════════════════════════════════ */}
      <section style={{ background: "#ffffff", padding: "3rem 2rem" }} id="buy-books">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        {isLoadingBooks ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            {[1, 2, 3].map((row) => (
              <div key={row}>
                <div style={{ width: 150, height: 24, background: "#f1f5f9", borderRadius: 4, marginBottom: "1rem" }} className="skeleton-pulse" />
                <div style={{ display: "flex", gap: "1.2rem", overflow: "hidden" }}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} style={{ flex: "0 0 160px", width: 160 }}>
                      <div style={{ width: "100%", paddingTop: "133.33%", background: "#f1f5f9", borderRadius: 12, marginBottom: "0.6rem" }} className="skeleton-pulse" />
                      <div style={{ width: "80%", height: 16, background: "#f1f5f9", borderRadius: 4, marginBottom: "0.4rem" }} className="skeleton-pulse" />
                      <div style={{ width: "50%", height: 12, background: "#f1f5f9", borderRadius: 4, marginBottom: "0.4rem" }} className="skeleton-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
        {/* New Releases Row */}
        {galleryItems.length > 0 && (
          <FadeIn delay={50}>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: C.dark }}>New Releases</h3>
              </div>
              
              <div className="horizontal-scroll" style={{ display: "flex", gap: "1.2rem", overflowX: "auto", paddingBottom: "1.5rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", alignItems: "flex-start" }}>
                 {[...galleryItems].reverse().slice(0, 8).map((book, i) => (
                    <div key={`new-${book.id || i}`} className="book-card group" style={{ flex: "0 0 160px", width: 160, display: "flex", flexDirection: "column" }}>
                      <Link to={`/book/${book.id}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", width: "100%" }}>
                        <div style={{ width: "100%", paddingTop: "133.33%", borderRadius: 12, overflow: "hidden", marginBottom: "0.6rem", background: C.goldBg, position: "relative" }}>
                          <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${book.coverUrl}`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop"} alt={book.title} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", color: "transparent" }} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <h4 style={{ fontSize: 14, fontWeight: 600, color: C.dark, margin: "0 0 0.1rem 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.title}</h4>
                          <span style={{ fontSize: 13, color: C.muted, marginBottom: "0.3rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.authorName}</span>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.dark }}>{book.mrp != null ? `₹${book.mrp}` : book.mrpRaw || "Price TBD"}</div>
                        </div>
                      </Link>
                    </div>
                 ))}
                 {galleryItems.length > 8 && (
                    <div className="book-card group" style={{ flex: "0 0 160px", width: 160, display: "flex", flexDirection: "column" }}>
                      <Link to={`/catalogue?category=All`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", width: "100%" }}>
                        <div style={{ width: "100%", paddingTop: "133.33%", borderRadius: 12, overflow: "hidden", marginBottom: "0.6rem", background: C.cream, border: `2px solid ${C.border}`, position: "relative" }}>
                           <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.8rem" }}>
                              <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.white, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                                <ArrowRight size={20} color={C.amber} />
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>View all</span>
                           </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <h4 style={{ fontSize: 14, fontWeight: 600, color: "transparent", margin: "0 0 0.1rem 0", userSelect: "none" }}>_</h4>
                          <span style={{ fontSize: 13, color: "transparent", marginBottom: "0.3rem", userSelect: "none" }}>_</span>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "transparent", userSelect: "none" }}>_</div>
                        </div>
                      </Link>
                    </div>
                 )}
              </div>
            </div>
          </FadeIn>
        )}

             {/* Fiction Row */}
        {galleryItems.filter(b => b.genre === "F").length > 0 && (
          <FadeIn delay={100}>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: C.dark }}>Fiction Books</h3>
              </div>
              
              <div className="horizontal-scroll" style={{ display: "flex", gap: "1.2rem", overflowX: "auto", paddingBottom: "1.5rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", alignItems: "flex-start" }}>
                 {galleryItems.filter(b => b.genre === "F").slice(0, 8).map((book, i) => (
                    <div key={`fic-${book.id || i}`} className="book-card group" style={{ flex: "0 0 160px", width: 160, display: "flex", flexDirection: "column" }}>
                      <Link to={`/book/${book.id}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", width: "100%" }}>
                        <div style={{ width: "100%", paddingTop: "133.33%", borderRadius: 12, overflow: "hidden", marginBottom: "0.6rem", background: C.goldBg, position: "relative" }}>
                          <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${book.coverUrl}`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop"} alt={book.title} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", color: "transparent" }} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <h4 style={{ fontSize: 14, fontWeight: 600, color: C.dark, margin: "0 0 0.1rem 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.title}</h4>
                          <span style={{ fontSize: 13, color: C.muted, marginBottom: "0.3rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.authorName}</span>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.dark }}>{book.mrp != null ? `₹${book.mrp}` : book.mrpRaw || "Price TBD"}</div>
                        </div>
                      </Link>
                    </div>
                 ))}
                 {galleryItems.filter(b => b.genre === "F").length > 8 && (
                    <div className="book-card group" style={{ flex: "0 0 160px", width: 160, display: "flex", flexDirection: "column" }}>
                      <Link to={`/catalogue?category=Fiction`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", width: "100%" }}>
                        <div style={{ width: "100%", paddingTop: "133.33%", borderRadius: 12, overflow: "hidden", marginBottom: "0.6rem", background: C.cream, border: `2px solid ${C.border}`, position: "relative" }}>
                           <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.8rem" }}>
                              <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.white, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                                <ArrowRight size={20} color={C.amber} />
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>View all</span>
                           </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <h4 style={{ fontSize: 14, fontWeight: 600, color: "transparent", margin: "0 0 0.1rem 0", userSelect: "none" }}>_</h4>
                          <span style={{ fontSize: 13, color: "transparent", marginBottom: "0.3rem", userSelect: "none" }}>_</span>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "transparent", userSelect: "none" }}>_</div>
                        </div>
                      </Link>
                    </div>
                 )}
              </div>
            </div>
          </FadeIn>
        )}

        {/* Non-Fiction Row */}
        {galleryItems.filter(b => b.genre === "NF").length > 0 && (
          <FadeIn delay={200}>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: C.dark }}>Non-Fiction Books</h3>
              </div>
              
              <div className="horizontal-scroll" style={{ display: "flex", gap: "1.2rem", overflowX: "auto", paddingBottom: "1.5rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", alignItems: "flex-start" }}>
                 {galleryItems.filter(b => b.genre === "NF").slice(0, 8).map((book, i) => (
                    <div key={`nf-${book.id || i}`} className="book-card group" style={{ flex: "0 0 160px", width: 160, display: "flex", flexDirection: "column" }}>
                      <Link to={`/book/${book.id}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", width: "100%" }}>
                        <div style={{ width: "100%", paddingTop: "133.33%", borderRadius: 12, overflow: "hidden", marginBottom: "0.6rem", background: C.goldBg, position: "relative" }}>
                          <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${book.coverUrl}`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop"} alt={book.title} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", color: "transparent" }} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <h4 style={{ fontSize: 14, fontWeight: 600, color: C.dark, margin: "0 0 0.1rem 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.title}</h4>
                          <span style={{ fontSize: 13, color: C.muted, marginBottom: "0.3rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.authorName}</span>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.dark }}>{book.mrp != null ? `₹${book.mrp}` : book.mrpRaw || "Price TBD"}</div>
                        </div>
                      </Link>
                    </div>
                 ))}
                 {galleryItems.filter(b => b.genre === "NF").length > 8 && (
                    <div className="book-card group" style={{ flex: "0 0 160px", width: 160, display: "flex", flexDirection: "column" }}>
                      <Link to={`/catalogue?category=Non-Fiction`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", width: "100%" }}>
                        <div style={{ width: "100%", paddingTop: "133.33%", borderRadius: 12, overflow: "hidden", marginBottom: "0.6rem", background: C.cream, border: `2px solid ${C.border}`, position: "relative" }}>
                           <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.8rem" }}>
                              <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.white, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                                <ArrowRight size={20} color={C.amber} />
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>View all</span>
                           </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <h4 style={{ fontSize: 14, fontWeight: 600, color: "transparent", margin: "0 0 0.1rem 0", userSelect: "none" }}>_</h4>
                          <span style={{ fontSize: 13, color: "transparent", marginBottom: "0.3rem", userSelect: "none" }}>_</span>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "transparent", userSelect: "none" }}>_</div>
                        </div>
                      </Link>
                    </div>
                 )}
              </div>
            </div>
          </FadeIn>
        )}

        {/* Children's Row */}
        {galleryItems.filter(b => b.genre === "C").length > 0 && (
          <FadeIn delay={300}>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: C.dark }}>Children's Books</h3>
              </div>
              
              <div className="horizontal-scroll" style={{ display: "flex", gap: "1.2rem", overflowX: "auto", paddingBottom: "1.5rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", alignItems: "flex-start" }}>
                 {galleryItems.filter(b => b.genre === "C").slice(0, 8).map((book, i) => (
                    <div key={`child-${book.id || i}`} className="book-card group" style={{ flex: "0 0 160px", width: 160, display: "flex", flexDirection: "column" }}>
                      <Link to={`/book/${book.id}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", width: "100%" }}>
                        <div style={{ width: "100%", paddingTop: "133.33%", borderRadius: 12, overflow: "hidden", marginBottom: "0.6rem", background: C.goldBg, position: "relative" }}>
                          <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${book.coverUrl}`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop"} alt={book.title} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", color: "transparent" }} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <h4 style={{ fontSize: 14, fontWeight: 600, color: C.dark, margin: "0 0 0.1rem 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.title}</h4>
                          <span style={{ fontSize: 13, color: C.muted, marginBottom: "0.3rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.authorName}</span>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.dark }}>{book.mrp != null ? `₹${book.mrp}` : book.mrpRaw || "Price TBD"}</div>
                        </div>
                      </Link>
                    </div>
                 ))}
                 {galleryItems.filter(b => b.genre === "C").length > 8 && (
                    <div className="book-card group" style={{ flex: "0 0 160px", width: 160, display: "flex", flexDirection: "column" }}>
                      <Link to={`/catalogue?category=Children's corner`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", width: "100%" }}>
                        <div style={{ width: "100%", paddingTop: "133.33%", borderRadius: 12, overflow: "hidden", marginBottom: "0.6rem", background: C.cream, border: `2px solid ${C.border}`, position: "relative" }}>
                           <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.8rem" }}>
                              <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.white, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                                <ArrowRight size={20} color={C.amber} />
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>View all</span>
                           </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <h4 style={{ fontSize: 14, fontWeight: 600, color: "transparent", margin: "0 0 0.1rem 0", userSelect: "none" }}>_</h4>
                          <span style={{ fontSize: 13, color: "transparent", marginBottom: "0.3rem", userSelect: "none" }}>_</span>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "transparent", userSelect: "none" }}>_</div>
                        </div>
                      </Link>
                    </div>
                 )}
              </div>
            </div>
          </FadeIn>
        )}
          </>
        )}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          BOOKS BY GENRE & LANGUAGE
      ════════════════════════════════════════════ */}
      {(isLoadingBooks || availableGenres.length > 0 || availableLanguages.length > 0) && (
      <section style={{ background: C.white, padding: "3rem 2rem", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          
          {isLoadingBooks ? (
             <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
                {[1, 2].map((row) => (
                  <div key={row}>
                    <div style={{ width: 200, height: 24, background: "#f1f5f9", borderRadius: 4, marginBottom: "1.5rem" }} className="skeleton-pulse" />
                    <div style={{ display: "flex", gap: "1rem", overflow: "hidden" }}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} style={{ flex: "0 0 220px", width: 220, height: 76, background: "#f1f5f9", borderRadius: 12 }} className="skeleton-pulse" />
                      ))}
                    </div>
                  </div>
                ))}
             </div>
          ) : (
             <>
          {availableGenres.length > 0 && (
          <FadeIn delay={100}>
            <div style={{ marginBottom: "3rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: C.dark }}>Books by Genre</h3>
                <Link to="/catalogue" style={{ fontSize: 13, fontWeight: 600, color: C.amber, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              <div className="horizontal-scroll" style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "1rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
                {availableGenres.map((g, i) => (
                  <Link key={i} to={`/catalogue?category=${g.cat}&subcategory=${g.subcat}`} style={{ flex: "0 0 220px", width: 220, display: "flex", alignItems: "center", gap: "1rem", background: g.bg, padding: "1rem 1.2rem", borderRadius: 12, textDecoration: "none", transition: "transform 0.2s" }} className="hover-scale">
                    <div style={{ width: 44, height: 44, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {g.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: "0.2rem" }}>{g.name}</div>
                      <div style={{ fontSize: 11, color: "rgba(0,0,0,0.5)", fontWeight: 500 }}>Explore Books</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </FadeIn>
          )}

          {availableLanguages.length > 0 && (
          <FadeIn delay={200}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: C.dark }}>Books by Language</h3>
                <Link to="/catalogue" style={{ fontSize: 13, fontWeight: 600, color: C.amber, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              <div className="horizontal-scroll" style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "1rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
                {availableLanguages.map((l, i) => (
                  <Link key={i} to={`/catalogue?search=${l.searchParam}`} style={{ flex: "0 0 220px", width: 220, display: "flex", alignItems: "center", gap: "1rem", background: l.bg, padding: "1rem 1.2rem", borderRadius: 12, textDecoration: "none", transition: "transform 0.2s" }} className="hover-scale">
                    <div style={{ width: 44, height: 44, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 600, color: l.color }}>
                      {l.letter}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: "0.2rem" }}>{l.name}</div>
                      <div style={{ fontSize: 11, color: "rgba(0,0,0,0.5)", fontWeight: 500 }}>Explore Books</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </FadeIn>
          )}

             </>
          )}
        </div>
      </section>
      )}

      {/* ════════════════════════════════════════════
          THE BOOK SHOP, CAFÉ & LIBRARY
      ════════════════════════════════════════════ */}
      <section style={{ background: `linear-gradient(135deg, ${C.dark} 0%, #2a2215 100%)`, padding: "3rem 2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }} className="hero-grid">
          <FadeIn>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>
                Coming Soon
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2.4rem", fontWeight: 400, color: C.white, lineHeight: 1.15, marginBottom: "1.5rem" }}>
                The Book Shop,{" "}
                <span style={{ fontStyle: "italic", color: C.gold }}>Café & Library</span>
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.8, marginBottom: "2rem", maxWidth: 450 }}>
                A curated literary haven where readers can discover, browse, and enjoy books alongside artisanal refreshments in a warm, inviting atmosphere.
              </p>
              <Link
                to="/book-cafe"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(212,160,23,0.15)",
                  border: `1px solid rgba(212,160,23,0.3)`,
                  color: C.gold,
                  padding: "0.75rem 1.8rem",
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: "none",
                  borderRadius: 6,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Explore <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
              <img
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=500&fit=crop"
                alt="Book Café & Library"
                style={{ width: "100%", height: 340, objectFit: "cover", display: "block" }}
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          ABOUT + REVIVING READING
      ════════════════════════════════════════════ */}
      <section style={{ background: C.white, borderTop: `1px solid ${C.border}`, padding: "3rem 2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }} className="hero-grid">
          <FadeIn>
            <div style={{ borderRadius: 12, overflow: "hidden" }}>
              <img
                src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=600&fit=crop"
                alt="Library"
                style={{ width: "100%", height: 380, objectFit: "cover", display: "block" }}
              />
            </div>
          </FadeIn>

          <FadeIn delay={150}>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 400, color: C.dark, marginBottom: "1.5rem", lineHeight: 1.2 }}>
                Reviving the{" "}
                <span style={{ fontStyle: "italic", color: C.amber }}>culture of reading.</span>
              </h2>
              <div style={{ width: 40, height: 2, background: C.gold, marginBottom: "1.5rem" }} />
              <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: "1.2rem" }}>
                Founded in December 2024, our association operates as a highly refined collaborative ecosystem. We grant independent authors access to premium production and strategic promotion traditionally reserved for corporate publishing.
              </p>
              <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: "2rem" }}>
                Through tailored physical touchpoints—from curated airport library shelves to intimate community spaces—we bridge the gap between discerning readers and exceptional independent literature.
              </p>
              <Link
                to="/about"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: C.dark,
                  color: C.gold,
                  padding: "0.75rem 1.8rem",
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: "none",
                  borderRadius: 6,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                About the Group <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CONTACT SECTION
      ════════════════════════════════════════════ */}
      <section style={{ background: C.cream, borderTop: `1px solid ${C.border}`, padding: "3rem 2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "4rem" }} className="hero-grid">
          <FadeIn>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 400, color: C.dark, marginBottom: "1rem" }}>Get in Touch</h2>
              <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: "2rem" }}>
                Whether you're an author seeking representation, a reader looking for bulk curation, or a partner institution, we are here to collaborate.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${C.gold}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Mail size={16} color={C.gold} />
                  </div>
                  <span style={{ fontSize: 13, color: C.dark, fontWeight: 500 }}>info@puneauthorsassociation.org</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${C.gold}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Phone size={16} color={C.gold} />
                  </div>
                  <span style={{ fontSize: 13, color: C.dark, fontWeight: 500 }}>+91 79770 97397</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${C.gold}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MapPin size={16} color={C.gold} />
                  </div>
                  <span style={{ fontSize: 13, color: C.dark, fontWeight: 500, lineHeight: 1.6 }}>
                    Pune Authors' Association,
                    <br />
                    Pune, Maharashtra, India
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={150}>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                try {
                  await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/contact`, {
                    name: contactName,
                    email: contactEmail,
                    message: contactMessage,
                  });
                  toast.success("Thank you! Your message has been received.");
                  setContactName("");
                  setContactEmail("");
                  setContactMessage("");
                } catch (err) {
                  console.error(err);
                  toast.error("Failed to send message. Please try again.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
              style={{ background: C.white, padding: "2.5rem", borderRadius: 12, border: `1px solid ${C.border}` }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: "1.5rem" }}>Send a Message</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", marginBottom: "1.5rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Full Name</label>
                  <input
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    type="text"
                    style={{ width: "100%", padding: "0.7rem 0.9rem", background: C.cream, border: `1px solid ${C.border}`, borderRadius: 6, outline: "none", fontSize: 14, color: C.dark, transition: "border-color 0.3s" }}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Email Address</label>
                  <input
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    type="email"
                    style={{ width: "100%", padding: "0.7rem 0.9rem", background: C.cream, border: `1px solid ${C.border}`, borderRadius: 6, outline: "none", fontSize: 14, color: C.dark, transition: "border-color 0.3s" }}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Your Message</label>
                  <textarea
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    rows={3}
                    style={{ width: "100%", padding: "0.7rem 0.9rem", background: C.cream, border: `1px solid ${C.border}`, borderRadius: 6, outline: "none", fontSize: 14, color: C.dark, resize: "none", transition: "border-color 0.3s" }}
                    className="form-input"
                  />
                </div>
              </div>

              <button
                disabled={isSubmitting}
                type="submit"
                style={{
                  background: C.gold,
                  color: C.dark,
                  border: "none",
                  padding: "0.85rem 2.5rem",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  borderRadius: 6,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.7 : 1,
                  transition: "all 0.3s",
                }}
              >
                {isSubmitting ? "Sending..." : "Submit Inquiry"}
              </button>
            </form>
          </FadeIn>
        </div>
      </section>

      {/* ── STYLES ── */}
      <style>{`
        .hero-btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .hero-btn-outline:hover { background: rgba(212,160,23,0.1) !important; }
        .pillar-card:hover { background: rgba(255,255,255,0.1) !important; transform: translateY(-4px); border-color: rgba(212,160,23,0.25) !important; }
        .svc-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
        .book-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
        .browse-link:hover { border-color: #d4a017 !important; background: #fffdf5 !important; }
        .form-input:focus { border-color: #d4a017 !important; }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .stats-grid { grid-template-columns: 1fr 1fr 1fr !important; gap: 1.5rem !important; }
        }
      `}</style>
    </main>
  );
}