import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import { ArrowLeft, ArrowRight, Book, BookOpen, Megaphone, Store, Mic, Sparkles, Users, Plane, Library, PenTool, Palette, Printer, FileText, Mail, Phone, MapPin, Download, ExternalLink, Heart, Search, Landmark, Rocket, Feather, ChevronLeft, ChevronRight, Calendar, User } from "lucide-react";
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
  const [heroSearch, setHeroSearch] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Contact State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [languageDrilldown, setLanguageDrilldown] = useState<"Others" | "Foreign" | null>(null);

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
          coverUrl: b.coverUrl?.startsWith("/uploads") ? `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${b.coverUrl}` : b.coverUrl,
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
          HERO — LIGHT BLUE SPLIT LAYOUT
      ════════════════════════════════════════════ */}
      <section
        className="hero-section-bg"
        style={{
          position: "relative",
          overflow: "hidden",
          borderTop: "3px solid #f16522"
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
          }}
          className="hero-grid"
        >
          {/* LEFT SIDE - STATIC */}
          <div style={{ padding: "1.5rem 2rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <FadeIn>
              <h1
                className="hero-title"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.2rem, 3.5vw, 3.2rem)",
                  fontWeight: 800,
                  color: "#1e293b",
                  lineHeight: 1.1,
                  marginBottom: "0.5rem",
                  letterSpacing: "-0.02em",
                }}
              >
                Helping indie <br/>
                <span style={{ color: "#f16522" }}>authors</span> publish, promote and sell.
              </h1>

              <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.5, marginBottom: "1.2rem", maxWidth: 450, fontWeight: 500 }}>
                We provide independent authors with refined publishing assistance, strategic promotion, and curated distribution channels.
              </p>

              {/* Search Bar */}
              <div style={{ display: "flex", background: "#fff", borderRadius: 50, padding: "0.2rem", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom: "1.2rem", maxWidth: 440, border: "1px solid rgba(0,0,0,0.05)" }}>
                <input 
                  type="text" 
                  placeholder="Search books, authors, genres..." 
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/catalogue?q=${heroSearch}`)}
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "0 1.2rem", fontSize: 14, color: "#333" }}
                />
                <button 
                  onClick={() => navigate(`/catalogue?q=${heroSearch}`)}
                  style={{ background: "#f16522", color: "#fff", border: "none", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  <Search size={16} />
                </button>
              </div>

              {/* Stats Row */}
              <div className="hero-stats-row" style={{ display: "flex", gap: "1.2rem", marginBottom: "1.2rem", flexWrap: "wrap" }}>
                {[
                  { icon: <Book size={24}/>, count: stats.books, label: "Books" },
                  { icon: <User size={24}/>, count: stats.authors, label: "Authors" },
                  { icon: <Calendar size={24}/>, count: stats.events, label: "Events" },
                  { icon: <Users size={24}/>, count: stats.categories, label: "Categories" }
                ].map((s, i) => (
                  <div key={i} className="hero-stats-item" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#334155" }}>
                    <div style={{ color: "#0f172a", display: "flex", alignItems: "center" }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}><CountUp end={s.count} suffix="+" /></div>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em", color: "#64748b", marginTop: "0.1rem" }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link
                  to="/catalogue"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "#f16522",
                    color: "#ffffff",
                    padding: "1rem 2.5rem",
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    borderRadius: 50,
                    boxShadow: "0 4px 14px rgba(241,101,34,0.3)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  Browse Books
                </Link>
                <Link
                  to="/gallery"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "#ffffff",
                    color: "#0f172a",
                    border: `2px solid #e2e8f0`,
                    padding: "1rem 2.5rem",
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    borderRadius: 50,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  Gallery
                </Link>
              </div>
            </FadeIn>
          </div>

          {/* RIGHT SIDE - SLIDER */}
          <div className="hero-slider-container">
            
            {/* Carousel Container */}
            <div style={{ flex: 1, position: "relative" }}>
              <div 
                style={{ 
                  display: "flex", 
                  width: "300%", 
                  height: "100%", 
                  transform: `translateX(-${currentSlide * 33.333}%)`, 
                  transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)" 
                }}
              >
                {/* SLIDE 1: Top Books */}
                <div className="hero-slide-content" style={{ width: "33.333%", height: "100%", background: "rgba(255, 255, 255, 0.5)", padding: "2rem 2rem 4rem 6rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                   <h3 style={{ color: "#1e293b", fontSize: "1.8rem", fontWeight: 700, marginBottom: "1.5rem" }}>Trending <span style={{color: "#f16522"}}>Books</span></h3>
                   <div style={{ display: "flex", gap: "1rem" }}>
                     {galleryItems.filter(b => b.coverUrl && b.coverUrl.trim() !== "").slice(0, 3).map((book, i) => (
                       <Link key={i} to={`/book/${book.id}`} style={{ flex: 1, textDecoration: "none" }}>
                         <div style={{ width: "100%", paddingTop: "140%", position: "relative", borderRadius: 6, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", background: "#e2e8f0" }}>
                           <img 
                             src={book.coverUrl} 
                             onError={(e) => { 
                               e.currentTarget.style.display = 'none'; 
                               if (e.currentTarget.nextElementSibling) {
                                 (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'; 
                               }
                             }} 
                             alt="Book Cover" 
                             style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1 }} 
                           />
                           <div style={{ display: "none", position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "#1e293b", color: "white", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "1rem", textAlign: "center", zIndex: 0 }}>
                             <span style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.5rem", lineHeight: 1.2 }}>{book.title}</span>
                             <span style={{ fontSize: "0.85rem", opacity: 0.9, color: "#f16522" }}>{book.authorName}</span>
                           </div>
                         </div>
                       </Link>
                     ))}
                   </div>
                </div>

                {/* SLIDE 2: Pillars */}
                <div className="hero-slide-content" style={{ width: "33.333%", height: "100%", background: "transparent", padding: "2rem 2rem 4rem 6rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    {[
                      { icon: <PenTool size={24} />, label: "We Publish", color: "#f16522" },
                      { icon: <Megaphone size={24} />, label: "We Promote", color: "#385c40" },
                      { icon: <Store size={24} />, label: "We Sell", color: "#d9ac42" },
                      { icon: <BookOpen size={24} />, label: "We Revive", color: "#3b82f6" },
                    ].map((p, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.7)", padding: "1.5rem 1rem", borderRadius: 12, border: "1px solid rgba(255,255,255,0.8)", textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                        <div style={{ width: 48, height: 48, borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.8rem", color: "#fff" }}>
                          {p.icon}
                        </div>
                        <h4 style={{ color: "#1e293b", fontSize: "1.1rem", fontWeight: 700 }}>{p.label}</h4>
                        <h4 className="hero-pillar-label">{p.label}</h4>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SLIDE 3: Categories */}
                <div className="hero-slide-content" style={{ width: "33.333%", height: "100%", background: "rgba(255,255,255,0.3)", padding: "2rem 2rem 4rem 6rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                   <h3 style={{ color: "#1e293b", fontSize: "1.8rem", fontWeight: 700, marginBottom: "1.5rem" }}>Featured <span style={{color: "#f16522"}}>Categories</span></h3>
                   <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
                     {availableGenres.slice(0, 8).map((g, i) => (
                       <Link key={i} to="/catalogue" style={{ padding: "0.6rem 1.2rem", fontSize: 13, background: "#ffffff", borderRadius: 50, color: "#1e293b", textDecoration: "none", fontWeight: 700, border: "1px solid rgba(0,0,0,0.05)", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#f16522"; e.currentTarget.style.color = "#ffffff"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.color = "#1e293b"; }}>
                         {g.name}
                       </Link>
                     ))}
                   </div>
                </div>

              </div>
            </div>

            {/* Slider Controls Area */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4rem", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: "2rem", zIndex: 10 }}>
              <button 
                onClick={() => setCurrentSlide(p => (p - 1 + 3) % 3)}
                style={{ background: "transparent", border: "none", color: "#1e293b", cursor: "pointer", display: "flex", alignItems: "center", padding: "0.5rem" }}
              >
                <ChevronLeft size={20} />
              </button>
              
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {[0, 1, 2].map(idx => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    style={{ 
                      width: currentSlide === idx ? 24 : 8, 
                      height: 8, 
                      borderRadius: 4, 
                      background: currentSlide === idx ? "#f16522" : "rgba(30,41,59,0.2)", 
                      border: "none", 
                      padding: 0, 
                      cursor: "pointer", 
                      transition: "all 0.3s ease" 
                    }} 
                  />
                ))}
              </div>

              <button 
                onClick={() => setCurrentSlide(p => (p + 1) % 3)}
                style={{ background: "transparent", border: "none", color: "#1e293b", cursor: "pointer", display: "flex", alignItems: "center", padding: "0.5rem" }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

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

        {/* New Releases Row */}
        {galleryItems.length > 0 && (
          <FadeIn delay={400}>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: C.dark }}>New Releases</h3>
              </div>
              
              <div className="horizontal-scroll" style={{ display: "flex", gap: "1.2rem", overflowX: "auto", paddingBottom: "1.5rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", alignItems: "flex-start" }}>
                 {[...galleryItems].reverse().slice(0, 8).map((book, i) => (
                    <div key={`new-${book.id || i}`} className="book-card group" style={{ flex: "0 0 160px", width: 160, display: "flex", flexDirection: "column" }}>
                      <Link to={`/book/${book.id}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", width: "100%" }}>
                        <div style={{ width: "100%", paddingTop: "133.33%", borderRadius: 12, overflow: "hidden", marginBottom: "0.6rem", background: C.goldBg, position: "relative" }}>
                           <img 
                             src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${book.coverUrl}`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop"} 
                             onError={(e) => { 
                               e.currentTarget.style.display = 'none'; 
                               if (e.currentTarget.nextElementSibling) {
                                 (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'; 
                               }
                             }} 
                             alt={book.title} 
                             style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1 }} 
                           />
                           <div style={{ display: "none", position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "#1e293b", color: "white", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "1rem", textAlign: "center", zIndex: 0 }}>
                             <span style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.5rem", lineHeight: 1.2 }}>{book.title}</span>
                             <span style={{ fontSize: "0.85rem", opacity: 0.9, color: "#f16522" }}>{book.authorName}</span>
                           </div>
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
                      <Link to={`/catalogue`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", width: "100%" }}>
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
          {/* {availableGenres.length > 0 && (
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
          )} */}

          {availableLanguages.length > 0 && (
          <FadeIn delay={200}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: C.dark }}>
                  {languageDrilldown === "Others" ? "Other Regional Languages" : languageDrilldown === "Foreign" ? "Foreign Languages" : "Books by Language"}
                </h3>
                {languageDrilldown ? (
                  <button onClick={() => setLanguageDrilldown(null)} style={{ fontSize: 13, fontWeight: 600, color: C.amber, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <ArrowLeft size={14} /> Back
                  </button>
                ) : (
                  <Link to="/catalogue" style={{ fontSize: 13, fontWeight: 600, color: C.amber, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    View all <ArrowRight size={14} />
                  </Link>
                )}
              </div>
              <div className="horizontal-scroll" style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "1rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
                {(() => {
                  const indianLangs = ["Hindi", "English", "Marathi", "Sanskrit", "Tamil", "Telugu", "Kannada", "Malayalam", "Gujarati", "Bengali", "Punjabi", "Urdu", "Odia", "Assamese", "Maithili", "Bhojpuri"];
                  const safeParam = (l: any) => l.searchParam ? l.searchParam.toLowerCase() : "";
                  const otherRegional = availableLanguages.filter(l => safeParam(l) !== "english" && safeParam(l) !== "hindi" && indianLangs.some(ind => ind.toLowerCase() === safeParam(l)));
                  const foreign = availableLanguages.filter(l => safeParam(l) !== "english" && safeParam(l) !== "hindi" && !indianLangs.some(ind => ind.toLowerCase() === safeParam(l)) && l.name !== "Others");

                  if (languageDrilldown === "Others") {
                    return otherRegional.length > 0 ? otherRegional.map((l, i) => (
                      <Link key={i} to={`/catalogue?search=${l.searchParam}`} style={{ flex: "0 0 220px", width: 220, display: "flex", alignItems: "center", gap: "1rem", background: l.bg, padding: "1rem 1.2rem", borderRadius: 12, textDecoration: "none", transition: "transform 0.2s" }} className="hover-scale">
                        <div style={{ width: 44, height: 44, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 600, color: l.color }}>{l.letter}</div>
                        <div><div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: "0.2rem" }}>{l.name}</div><div style={{ fontSize: 11, color: "rgba(0,0,0,0.5)", fontWeight: 500 }}>Explore Books</div></div>
                      </Link>
                    )) : <p style={{ fontSize: 14, color: "#64748b" }}>No other regional books available.</p>;
                  }

                  if (languageDrilldown === "Foreign") {
                    return foreign.length > 0 ? foreign.map((l, i) => (
                      <Link key={i} to={`/catalogue?search=${l.searchParam}`} style={{ flex: "0 0 220px", width: 220, display: "flex", alignItems: "center", gap: "1rem", background: l.bg, padding: "1rem 1.2rem", borderRadius: 12, textDecoration: "none", transition: "transform 0.2s" }} className="hover-scale">
                        <div style={{ width: 44, height: 44, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 600, color: l.color }}>{l.letter}</div>
                        <div><div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: "0.2rem" }}>{l.name}</div><div style={{ fontSize: 11, color: "rgba(0,0,0,0.5)", fontWeight: 500 }}>Explore Books</div></div>
                      </Link>
                    )) : <p style={{ fontSize: 14, color: "#64748b" }}>No foreign books available.</p>;
                  }

                  return (
                    <>
                      <Link to="/catalogue?search=English" style={{ flex: "0 0 220px", width: 220, display: "flex", alignItems: "center", gap: "1rem", background: "#fef9c3", padding: "1rem 1.2rem", borderRadius: 12, textDecoration: "none", transition: "transform 0.2s" }} className="hover-scale">
                        <div style={{ width: 44, height: 44, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 600, color: "#eab308" }}>E</div>
                        <div><div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: "0.2rem" }}>English</div><div style={{ fontSize: 11, color: "rgba(0,0,0,0.5)", fontWeight: 500 }}>Explore Books</div></div>
                      </Link>
                      <Link to="/catalogue?search=Hindi" style={{ flex: "0 0 220px", width: 220, display: "flex", alignItems: "center", gap: "1rem", background: "#dcfce7", padding: "1rem 1.2rem", borderRadius: 12, textDecoration: "none", transition: "transform 0.2s" }} className="hover-scale">
                        <div style={{ width: 44, height: 44, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 600, color: "#22c55e" }}>H</div>
                        <div><div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: "0.2rem" }}>Hindi</div><div style={{ fontSize: 11, color: "rgba(0,0,0,0.5)", fontWeight: 500 }}>Explore Books</div></div>
                      </Link>
                      <button onClick={() => setLanguageDrilldown("Others")} style={{ flex: "0 0 220px", width: 220, display: "flex", alignItems: "center", gap: "1rem", background: "#e0f2fe", padding: "1rem 1.2rem", borderRadius: 12, border: "none", cursor: "pointer", textAlign: "left", transition: "transform 0.2s" }} className="hover-scale">
                        <div style={{ width: 44, height: 44, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 600, color: "#0ea5e9" }}>O</div>
                        <div><div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: "0.2rem" }}>Others</div><div style={{ fontSize: 11, color: "rgba(0,0,0,0.5)", fontWeight: 500 }}>Regional Languages</div></div>
                      </button>
                      {foreign.length > 0 && (
                        <button onClick={() => setLanguageDrilldown("Foreign")} style={{ flex: "0 0 220px", width: 220, display: "flex", alignItems: "center", gap: "1rem", background: "#f3e8ff", padding: "1rem 1.2rem", borderRadius: 12, border: "none", cursor: "pointer", textAlign: "left", transition: "transform 0.2s" }} className="hover-scale">
                          <div style={{ width: 44, height: 44, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 600, color: "#a855f7" }}>F</div>
                          <div><div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: "0.2rem" }}>Foreign</div><div style={{ fontSize: 11, color: "rgba(0,0,0,0.5)", fontWeight: 500 }}>International Languages</div></div>
                        </button>
                      )}
                    </>
                  );
                })()}
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
              {/* <Link
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
              </Link> */}
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