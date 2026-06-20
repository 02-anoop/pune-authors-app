import { Calendar, MapPin, Clock, Users, BookOpen, Filter } from "lucide-react";
import { useState } from "react";

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
  "Literary Event": { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  "Book Fair": { color: "#db2777", bg: "#fdf2f8", border: "#fbcfe8" },
  "Corporate Activation": { color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  "Airport Library": { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
};

import axios from "axios";
import { useEffect } from "react";

export function EventLogPage() {
  const [filter, setFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"timeline" | "grid">("timeline");
  const [events, setEvents] = useState<EventRecord[]>([]);

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
    <main style={{ fontFamily: "var(--font-body)" }}>
      {/* Header */}
      <section style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2d2d50 100%)", padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Archive</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: "0.75rem" }}>
            Historical Event Log<br />&amp; Memories
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", maxWidth: 480, lineHeight: 1.7, marginBottom: "2rem" }}>
            A curated record of every PAA literary event, fair, corporate activation, and airport library initiative since our founding.
          </p>

          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            {[
              { label: "Total Events", value: events.length },
              { label: "Books Sold (All Events)", value: totalBooksSold.toLocaleString() },
              { label: "Cities Reached", value: 3 },
              { label: "Unique Participations", value: "150+" },
            ].map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "0.75rem 1.25rem" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 800, color: "#fff" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: "0.15rem" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "1rem 1.5rem", position: "sticky", top: 64, zIndex: 40 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {eventTypes.map((t) => {
              const tColor = t !== "All" ? typeColors[t] : null;
              const isActive = filter === t;
              return (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  style={{
                    padding: "0.4rem 0.85rem",
                    borderRadius: 8,
                    border: isActive ? "1.5px solid " + (tColor?.color || "#1a1a2e") : "1px solid rgba(0,0,0,0.1)",
                    background: isActive ? (tColor ? tColor.bg : "#1a1a2e") : "#fff",
                    color: isActive ? (tColor ? tColor.color : "#fff") : "#6b6b80",
                    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {(["timeline", "grid"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: "0.4rem 0.85rem",
                  borderRadius: 8,
                  border: viewMode === mode ? "1.5px solid #1a1a2e" : "1px solid rgba(0,0,0,0.1)",
                  background: viewMode === mode ? "#1a1a2e" : "#fff",
                  color: viewMode === mode ? "#fff" : "#6b6b80",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-mono)",
                  textTransform: "capitalize",
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "3rem 1.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {viewMode === "timeline" ? (
            /* Timeline view */
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 2, background: "rgba(0,0,0,0.06)" }} className="timeline-line" />
              <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                {filtered.map((event, i) => {
                  const tColor = typeColors[event.type];
                  return (
                    <div key={event.id} style={{ display: "flex", gap: "2rem", paddingLeft: 52, position: "relative" }}>
                      {/* Timeline dot */}
                      <div style={{
                        position: "absolute", left: 0, top: 24,
                        width: 42, height: 42, borderRadius: "50%",
                        background: tColor?.bg || '#fff', border: "2px solid " + (tColor?.border || '#000'),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        zIndex: 1,
                      }}>
                        <div style={{ width: 14, height: 14, borderRadius: "50%", background: tColor?.color || '#000' }} />
                      </div>

                      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1.5rem", alignItems: "start" }} className="event-card">
                        {/* Image */}
                        <div style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", aspectRatio: "16/9" }}>
                          <img src={event.photoUrl ? (event.photoUrl.startsWith('http') ? event.photoUrl : `${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}${event.photoUrl}`) : ''} alt={event.location} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>

                        {/* Content */}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                            <span style={{ background: tColor?.bg || '#000', color: tColor?.color || '#fff', border: "1px solid " + (tColor?.border || '#000'), fontSize: 10, fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: 5, fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
                              {event.type}
                            </span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6b6b80" }}>
                              {new Date(event.date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                            </span>
                          </div>

                          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#1a1a2e", lineHeight: 1.25, marginBottom: "0.3rem" }}>
                            {event.location}
                          </h3>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: 12, color: "#6b6b80", marginBottom: "0.75rem" }}>
                            <MapPin size={12} /> {event.place}, {event.city}
                          </div>

                          <p style={{ fontSize: 13, color: "#444", lineHeight: 1.7, marginBottom: "1rem" }}>{event.description}</p>

                          {/* Metrics */}
                          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                            {[
                              { icon: <Clock size={12} />, label: "Duration", val: event.duration },
                              { icon: <Users size={12} />, label: "Authors", val: event.authors },
                              { icon: <BookOpen size={12} />, label: "Books Sold", val: event.booksSold },
                            ].map((m) => (
                              <div key={m.label} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "#f7f7f9", borderRadius: 8, padding: "0.4rem 0.75rem" }}>
                                <span style={{ color: "#6b6b80" }}>{m.icon}</span>
                                <span style={{ fontSize: 11, color: "#6b6b80" }}>{m.label}:</span>
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "#1a1a2e" }}>{m.val}</span>
                              </div>
                            ))}
                          </div>

                          {event.images && event.images.length > 0 && (
                            <div style={{ marginTop: "1.5rem" }}>
                              <h4 style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b6b80", marginBottom: "0.75rem" }}>Gallery</h4>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "0.5rem" }}>
                                {event.images.map((img) => (
                                  <div key={img.id} style={{ position: "relative", aspectRatio: "1", borderRadius: 8, overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }} className="group">
                                    <img src={img.url.startsWith('http') ? img.url : `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${img.url}`} alt={img.caption || "Gallery"} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }} className="hover:scale-110" title={img.caption || "Event moment"} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Grid view */
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
              {filtered.map((event) => {
                const tColor = typeColors[event.type];
                return (
                  <div
                    key={event.id}
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      border: "1px solid rgba(0,0,0,0.07)",
                      overflow: "hidden",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div style={{ height: 180, overflow: "hidden", position: "relative" }}>
                      <img src={event.photoUrl ? (event.photoUrl.startsWith('http') ? event.photoUrl : `${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}${event.photoUrl}`) : ''} alt={event.location} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", top: 10, left: 10 }}>
                        <span style={{ background: tColor?.bg || '#000', color: tColor?.color || '#fff', border: "1px solid " + (tColor?.border || '#000'), fontSize: 10, fontWeight: 700, padding: "0.25rem 0.6rem", borderRadius: 5, fontFamily: "var(--font-mono)" }}>
                          {event.type}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: "1.25rem" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6b6b80", marginBottom: "0.4rem" }}>
                        {new Date(event.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#1a1a2e", lineHeight: 1.3, marginBottom: "0.3rem" }}>{event.location}</h3>
                      <div style={{ fontSize: 12, color: "#6b6b80", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <MapPin size={11} /> {event.city}
                      </div>
                      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                        <div style={{ fontSize: 12, color: "#1a1a2e" }}><span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{event.duration}</span> <span style={{ color: "#6b6b80" }}>duration</span></div>
                        <div style={{ fontSize: 12, color: "#1a1a2e" }}><span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{event.authors}</span> <span style={{ color: "#6b6b80" }}>authors</span></div>
                        <div style={{ fontSize: 12, color: "#1a1a2e" }}><span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{event.booksSold}</span> <span style={{ color: "#6b6b80" }}>sold</span></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .timeline-line { display: none; }
          .event-card { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
