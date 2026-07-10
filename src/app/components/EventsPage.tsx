import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Users, BookOpen, Clock, TrendingUp, Search, Download } from 'lucide-react';

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

export function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pastEventsData, setPastEventsData] = useState<any[]>([]);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/public/events`);
        const now = new Date();
        now.setHours(0,0,0,0);
        
        const up = res.data.filter((e: any) => new Date(e.date).getTime() >= now.getTime() && e.eventType !== 'Flybraries').sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const past = res.data.filter((e: any) => new Date(e.date).getTime() < now.getTime() && e.eventType !== 'Flybraries').sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setUpcomingEvents(up);
        setPastEventsData(past);
      } catch (error) {
        console.error("Failed to fetch upcoming events:", error);
      }
    };
    fetchUpcomingEvents();
  }, []);

  const filteredPastEvents = pastEventsData.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (e.location || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEventBanner = (event: any) => {
    let url = event.bannerUrl;
    if (url) {
      return url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${url}`;
    }
    return null;
  };

  return (
    <main style={{ fontFamily: "var(--font-body)", background: "#fafafa", color: "#111", minHeight: "calc(100vh - 64px)", overflowX: "hidden" }}>
      
      {/* ── HERO ── */}
      <section style={{ borderBottom: "1px solid #eaeaea", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "8rem 1.5rem" }}>
          <FadeIn>
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#333", marginBottom: "2rem" }}>
              PAA Community
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 5vw, 4rem)", fontWeight: 400, color: "#111", lineHeight: 1.1, letterSpacing: "-0.01em", maxWidth: 800 }}>
              Literary Events <span style={{ fontStyle: "italic", color: "#b44d28" }}>& Book Fairs.</span>
            </h1>
            <p style={{ fontSize: 15, color: "#333", lineHeight: 1.8, marginTop: "2rem", maxWidth: 600, fontWeight: 400 }}>
              Discover our upcoming book fairs, reading sessions, and literary festivals across India. Join the movement and celebrate the written word.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── TABS & SEARCH (MINIMALIST) ── */}
      <section style={{ borderBottom: "1px solid #eaeaea", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "2rem" }}>
          <div style={{ display: "flex", gap: "2rem" }}>
            <button 
              onClick={() => setActiveTab('upcoming')}
              className="tab-btn"
              style={{
                background: "transparent", border: "none", padding: 0,
                color: activeTab === 'upcoming' ? "#111" : "#888",
                fontSize: 13, fontWeight: activeTab === 'upcoming' ? 500 : 400,
                letterSpacing: "0.05em", textTransform: "uppercase",
                cursor: "pointer", transition: "color 0.2s ease", position: "relative"
              }}
            >
              Upcoming ({upcomingEvents.length})
            </button>
            <button 
              onClick={() => setActiveTab('past')}
              className="tab-btn"
              style={{
                background: "transparent", border: "none", padding: 0,
                color: activeTab === 'past' ? "#111" : "#888",
                fontSize: 13, fontWeight: activeTab === 'past' ? 500 : 400,
                letterSpacing: "0.05em", textTransform: "uppercase",
                cursor: "pointer", transition: "color 0.2s ease", position: "relative"
              }}
            >
              Past ({filteredPastEvents.length})
            </button>
          </div>
          
          <div style={{ position: "relative", width: "100%", maxWidth: 300 }}>
            <Search size={14} color="#888" style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)" }} />
            <input 
              type="text" 
              placeholder="SEARCH EVENTS..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="minimal-input"
              style={{
                width: "100%", padding: "0.5rem 0 0.5rem 1.8rem",
                background: "transparent", border: "none", borderBottom: "1px solid #ccc",
                outline: "none", fontSize: 12, color: "#111", letterSpacing: "0.05em", textTransform: "uppercase",
                transition: "border-color 0.3s"
              }}
            />
          </div>
        </div>
      </section>

      {/* ── CONTENT (ELEGANT GRID) ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "6rem 1.5rem" }}>
        {activeTab === 'upcoming' ? (
          upcomingEvents.length === 0 ? (
            <FadeIn>
              <div style={{ padding: "6rem 0", textAlign: "center", borderTop: "1px solid #eaeaea", borderBottom: "1px solid #eaeaea" }}>
                <Calendar size={32} color="#ccc" style={{ margin: "0 auto 1.5rem" }} />
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 400, color: "#111", marginBottom: "1rem" }}>No Upcoming Events</h2>
                <p style={{ fontSize: 14, color: "#333", fontWeight: 400, maxWidth: 400, margin: "0 auto" }}>
                  Our event coordinators are busy planning the next big literary gathering. Check back soon or join our mailing list.
                </p>
              </div>
            </FadeIn>
          ) : (
            <div className="events-grid">
              {upcomingEvents.map((event, i) => (
                <FadeIn key={event.id} delay={i * 100}>
                  <div className="event-card" style={{ display: "flex", flexDirection: "column", height: "100%", border: "1px solid #eaeaea", background: "#fff", padding: "2rem", transition: "transform 0.4s ease, box-shadow 0.4s ease" }}>
                    <div style={{ height: 200, overflow: "hidden", marginBottom: "1.5rem", border: "1px solid #eaeaea", background: "#f9f9f9", padding: "0.25rem" }}>
                      {getEventBanner(event) ? (
                         <img src={getEventBanner(event)} alt={event.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                         <div style={{ width: "100%", height: "100%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", textAlign: "center" }}>
                            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "#888", margin: 0, lineHeight: 1.2 }}>{event.name}</h3>
                         </div>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                      <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#b44d28" }}>
                        {event.date}
                      </span>
                      <span style={{ fontSize: 10, color: "#555", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Clock size={12} /> {event.duration}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 400, color: "#111", marginBottom: "1rem", flexGrow: 1 }}>{event.name}</h3>
                    <p style={{ fontSize: 13, color: "#333", fontWeight: 400, display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "2rem" }}>
                      <MapPin size={14} color="#ccc" style={{ marginTop: "0.2rem", flexShrink: 0 }} /> {event.location}
                    </p>
                    
                    {((event._count?.eventAuthors > 0) || (event._count?.eventBooks > 0)) && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", borderTop: "1px solid #eaeaea", paddingTop: "1.5rem", marginBottom: "2rem" }}>
                        {event._count?.eventAuthors > 0 ? (
                          <div>
                            <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.3rem" }}>Authors</div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#111" }}>{event._count.eventAuthors}</div>
                          </div>
                        ) : <div />}
                        {event._count?.eventBooks > 0 ? (
                          <div>
                            <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.3rem" }}>Books</div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#111" }}>{event._count.eventBooks}</div>
                          </div>
                        ) : <div />}
                      </div>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          )
        ) : (
          <div>
            {filteredPastEvents.length === 0 ? (
              <FadeIn>
                <div style={{ padding: "6rem 0", textAlign: "center", borderTop: "1px solid #eaeaea", borderBottom: "1px solid #eaeaea" }}>
                  <Search size={32} color="#ccc" style={{ margin: "0 auto 1.5rem" }} />
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 400, color: "#111", marginBottom: "1rem" }}>No Events Found</h2>
                  <p style={{ fontSize: 14, color: "#333", fontWeight: 400 }}>Try adjusting your search criteria.</p>
                </div>
              </FadeIn>
            ) : (
              <div className="events-grid">
                {filteredPastEvents.map((event, i) => (
                  <FadeIn key={event.id} delay={i * 50}>
                    <div className="event-card" style={{ display: "flex", flexDirection: "column", height: "100%", border: "1px solid #eaeaea", background: "#fff", padding: "2rem", transition: "transform 0.4s ease, box-shadow 0.4s ease" }}>
                      <div style={{ height: 200, overflow: "hidden", marginBottom: "1.5rem", border: "1px solid #eaeaea", background: "#f9f9f9", padding: "0.25rem" }}>
                        {getEventBanner(event) ? (
                           <img src={getEventBanner(event)} alt={event.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                           <div style={{ width: "100%", height: "100%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", textAlign: "center" }}>
                              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "#888", margin: 0, lineHeight: 1.2 }}>{event.name}</h3>
                           </div>
                        )}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                        <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#b44d28" }}>
                          {event.date}
                        </span>
                        <span style={{ fontSize: 10, color: "#555", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Clock size={12} /> {event.duration}
                        </span>
                      </div>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 400, color: "#111", marginBottom: "1rem", flexGrow: 1 }}>{event.name}</h3>
                      <p style={{ fontSize: 13, color: "#333", fontWeight: 400, display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "2rem" }}>
                        <MapPin size={14} color="#ccc" style={{ marginTop: "0.2rem", flexShrink: 0 }} /> {event.location}
                      </p>
                      
                      {((event._count?.eventAuthors > 0) || (event._count?.eventBooks > 0)) && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", borderTop: "1px solid #eaeaea", paddingTop: "1.5rem", marginBottom: "0rem" }}>
                          {event._count?.eventAuthors > 0 ? (
                            <div>
                              <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.3rem" }}>Authors</div>
                              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#111" }}>{event._count.eventAuthors}</div>
                            </div>
                          ) : <div />}
                          {event._count?.eventBooks > 0 ? (
                            <div>
                              <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.3rem" }}>Books</div>
                              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#111" }}>{event._count.eventBooks}</div>
                            </div>
                          ) : <div />}
                        </div>
                      )}
                    </div>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <style>{`
        .tab-btn::after { content: ''; position: absolute; width: 100%; height: 1px; bottom: -2rem; left: 0; background-color: transparent; transition: background-color 0.2s ease; }
        .tab-btn:hover { color: #111 !important; }
        .tab-btn:hover::after { background-color: #111; }
        .minimal-input:focus { border-bottom-color: #111 !important; }

        .link-underline { position: relative; }
        .link-underline::after { content: ''; position: absolute; width: 100%; height: 1px; bottom: -2px; left: 0; background-color: #111; transition: opacity 0.2s ease; }
        .link-underline:hover::after { opacity: 0.3; }

        .event-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
        .report-hover:hover span { color: #b44d28 !important; }
        .report-hover:hover .report-icon { color: #b44d28 !important; }
        .events-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 3rem; }
        @media (min-width: 768px) { .events-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .events-grid { grid-template-columns: repeat(3, 1fr); } }
      `}</style>
    </main>
  );
}
