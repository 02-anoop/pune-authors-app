import { Calendar, MapPin, Clock, Users, BookOpen, Filter, ImageIcon, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { CustomerGallery } from "./CustomerGallery";

interface EventRecord {
  id: number;
  location: string;
  place: string;
  city: string;
  date: string;
  duration: string;
  authors: number;
  booksSold: number;
  type: string;
  description: string;
  photoUrl: string;
  images?: { id: number; url: string; caption?: string; dateTaken?: string }[];
}

const typeColors: Record<string, { color: string; bg: string; border: string }> = {
  "Literary Event": { color: "#111", bg: "#f3f3f3", border: "#eaeaea" },
  "Book Fair": { color: "#111", bg: "#f3f3f3", border: "#eaeaea" },
  "Corporate Activation": { color: "#111", bg: "#f3f3f3", border: "#eaeaea" },
  "Airport Library": { color: "#111", bg: "#f3f3f3", border: "#eaeaea" },
};

// --- FADE IN ON SCROLL (SUBTLE) ---
function FadeIn({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : `translateY(15px)`,
        transition: `all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function EventLogPage() {
  const [filter, setFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"timeline" | "grid">("grid");
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [selectedEventForGallery, setSelectedEventForGallery] = useState<EventRecord | null>(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}/api/gallery`)
      .then(res => setEvents(res.data))
      .catch(console.error);
  }, []);

  const eventTypes = ["All", "Literary Event", "Book Fair", "Corporate Activation", "Airport Library"];
  const filtered = events.filter((e) => filter === "All" || e.type === filter);

  const totalBooksSold = events.reduce((acc, e) => acc + e.booksSold, 0);
  const totalAuthors = new Set(events.map((e) => e.authors)).size;

  return (
    <main style={{ fontFamily: "var(--font-body)", background: "#fafafa", color: "#111", minHeight: "calc(100vh - 64px)", overflowX: "hidden" }}>
      
      {/* ── HERO ── */}
      <section style={{ borderBottom: "1px solid #eaeaea", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "8rem 1.5rem" }}>
          <FadeIn>
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#333", marginBottom: "2rem" }}>
              Archive & Memories
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 5vw, 4rem)", fontWeight: 400, color: "#111", lineHeight: 1.1, letterSpacing: "-0.01em", maxWidth: 800 }}>
              Event <span style={{ fontStyle: "italic", color: "#b44d28" }}>Gallery.</span>
            </h1>
            <p style={{ fontSize: 15, color: "#333", lineHeight: 1.8, marginTop: "2rem", maxWidth: 600, fontWeight: 400 }}>
              A curated record of every PAA literary event, fair, corporate activation, and airport library initiative since our founding.
            </p>

            <div style={{ display: "flex", gap: "3rem", flexWrap: "wrap", marginTop: "4rem", borderTop: "1px solid #eaeaea", paddingTop: "2rem" }}>
              {[
                { label: "Total Events", value: events.length },
                { label: "Books Sold", value: totalBooksSold.toLocaleString() },
                { label: "Unique Participations", value: "150+" },
              ].map((s, i) => (
                <div key={s.label}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 400, color: "#111" }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#555", marginTop: "0.3rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FILTER BAR ── */}
      <section style={{ borderBottom: "1px solid #eaeaea", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "2rem" }}>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {eventTypes.map((t) => {
              const isActive = filter === t;
              return (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className="filter-btn"
                  style={{
                    padding: "0.4rem 1rem",
                    borderRadius: 20,
                    border: isActive ? "1px solid #111" : "1px solid #eaeaea",
                    background: isActive ? "#111" : "transparent",
                    color: isActive ? "#fff" : "#666",
                    fontSize: 11, fontWeight: 500, cursor: "pointer",
                    textTransform: "uppercase", letterSpacing: "0.05em", transition: "all 0.2s"
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {(["grid", "timeline"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: "0.4rem 1rem",
                  borderRadius: 20,
                  border: viewMode === mode ? "1px solid #111" : "1px solid #eaeaea",
                  background: viewMode === mode ? "#111" : "transparent",
                  color: viewMode === mode ? "#fff" : "#666",
                  fontSize: 11, fontWeight: 500, cursor: "pointer",
                  textTransform: "uppercase", letterSpacing: "0.05em", transition: "all 0.2s"
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY CONTENT ── */}
      <section style={{ padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {viewMode === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "4rem" }}>
              {filtered.map((event, i) => (
                <FadeIn key={event.id} delay={i * 50}>
                  <div className="gallery-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ height: 240, overflow: "hidden", marginBottom: "1.5rem", border: "1px solid #eaeaea", background: "#fff", padding: "0.5rem" }}>
                      <img src={event.photoUrl ? (event.photoUrl.startsWith('http') ? event.photoUrl : `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${event.photoUrl}`) : ''} alt={event.location} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} className="gallery-img" />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem" }}>
                        <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#b44d28" }}>{event.type}</span>
                        <span style={{ fontSize: 10, color: "#555", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                          {new Date(event.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 400, color: "#111", lineHeight: 1.3, marginBottom: "0.5rem" }}>{event.location}</h3>
                      <div style={{ fontSize: 12, color: "#333", display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "1rem" }}>
                        <MapPin size={12} /> {event.city}
                      </div>
                    </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", borderTop: "1px solid #eaeaea", paddingTop: "1rem", marginTop: "1rem" }}>
                        <div>
                          <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.2rem" }}>Authors</div>
                          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "#111" }}>{event.authors}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.2rem" }}>Books Sold</div>
                          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "#111" }}>{event.booksSold}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedEventForGallery(event)}
                        style={{ marginTop: "1.5rem", width: "100%", padding: "0.75rem", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                      >
                        <ImageIcon size={14} /> View Gallery
                      </button>
                    </div>
                </FadeIn>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "4rem", maxWidth: 800, margin: "0 auto" }}>
              {filtered.map((event, i) => (
                <FadeIn key={event.id} delay={i * 50}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }} className="timeline-row">
                    <div style={{ height: 300, border: "1px solid #eaeaea", padding: "0.5rem", background: "#fff" }}>
                       <img src={event.photoUrl ? (event.photoUrl.startsWith('http') ? event.photoUrl : `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${event.photoUrl}`) : ''} alt={event.location} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#b44d28", marginBottom: "1rem" }}>
                        {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      </div>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 400, color: "#111", lineHeight: 1.2, marginBottom: "0.5rem" }}>{event.location}</h3>
                      <div style={{ fontSize: 13, color: "#333", marginBottom: "1.5rem" }}>{event.city} — {event.type}</div>
                      <p style={{ fontSize: 14, color: "#222", lineHeight: 1.8, fontWeight: 400, marginBottom: "2rem" }}>{event.description}</p>
                      
                      <div style={{ display: "flex", gap: "2rem" }}>
                        <div>
                          <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.2rem" }}>Authors</div>
                          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#111" }}>{event.authors}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.2rem" }}>Sales</div>
                          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#111" }}>{event.booksSold}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedEventForGallery(event)}
                        style={{ marginTop: "2rem", padding: "0.75rem 1.5rem", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                      >
                        <ImageIcon size={16} /> View Gallery
                      </button>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* GALLERY MODAL */}
      {selectedEventForGallery && (
        <div className="fixed inset-0 z-[5000] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedEventForGallery(null)}>
          <div className="bg-white w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="font-serif text-2xl text-paa-navy font-bold">{selectedEventForGallery.location} Gallery</h3>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">{selectedEventForGallery.city} • {new Date(selectedEventForGallery.date).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setSelectedEventForGallery(null)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors bg-gray-100 text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <CustomerGallery eventId={selectedEventForGallery.id.toString()} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .filter-btn:hover { background: #fafafa !important; border-color: #ccc !important; color: #111 !important; }
        .gallery-card:hover .gallery-img { transform: scale(1.03); }
        @media (max-width: 800px) {
          .timeline-row { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>
    </main>
  );
}
