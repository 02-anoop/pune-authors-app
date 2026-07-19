import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Users, BookOpen, Clock, TrendingUp, Search, Download } from 'lucide-react';

// --- NEOBRUTALIST COLOR PALETTE ---
const C = {
  primary: "#facc15", 
  red: "#ef4444",     
  blue: "#3b82f6",    
  green: "#16a34a",   
  purple: "#a855f7",
  dark: "#000000",    
  text: "#111827",    
  light: "#f8f9fa",   
  white: "#ffffff",
  cream: "#fdfbf7",
};

// --- FADE IN ON SCROLL ---
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
        transition: `all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`,
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'past') {
      setActiveTab('past');
    }
  }, []);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/public/events`);
        const now = new Date();
        now.setHours(0,0,0,0);
        
        const up = res.data.filter((e: any) => {
          if (e.eventType === 'Flybraries') return false;
          const d = new Date(e.date);
          if (isNaN(d.getTime())) return e.status === 'Upcoming' || e.status === 'Live';
          return d >= now;
        }).sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
        
        const past = res.data.filter((e: any) => {
          if (e.eventType === 'Flybraries') return false;
          const d = new Date(e.date);
          if (isNaN(d.getTime())) return e.status !== 'Upcoming' && e.status !== 'Live';
          return d < now;
        }).sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
        
        setUpcomingEvents(up);
        setPastEventsData(past);
      } catch (error) {
        console.error("Failed to fetch upcoming events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcomingEvents();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const filteredUpcomingEvents = upcomingEvents.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (e.location || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPastEvents = pastEventsData.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (e.location || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedUpcoming = filteredUpcomingEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const displayedPast = filteredPastEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const totalPages = activeTab === 'upcoming' 
    ? Math.ceil(filteredUpcomingEvents.length / itemsPerPage) 
    : Math.ceil(filteredPastEvents.length / itemsPerPage);

  const getEventBanner = (event: any) => {
    let url = event.bannerUrl;
    if (url) {
      return url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${url}`;
    }
    return null;
  };

  return (
    <main style={{ fontFamily: "var(--font-body)", background: C.light, color: C.text, minHeight: "calc(100vh - 64px)", overflowX: "hidden" }}>
      
      {/* -- HERO -- */}
      <section style={{ padding: "11.5rem 2rem 4rem", textAlign: "center", position: "relative" }}>
        <FadeIn>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: "1rem", letterSpacing: "-0.03em", color: C.dark, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem", alignItems: "center" }}>
            <span>Literary</span>
            <span style={{ display: "inline-flex", gap: "0.2rem" }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", color: C.dark, transform: "rotate(-10deg)", border: `2px solid ${C.dark}` }}><Calendar size={24} /></div>
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, transform: "rotate(10deg)", border: `2px solid ${C.dark}` }}><Users size={24} /></div>
            </span>
            <span>Events</span>
          </h1>
          <p style={{ fontSize: "1.2rem", color: "#4b5563", maxWidth: 600, margin: "0 auto 2.5rem", lineHeight: 1.6, fontWeight: 500 }}>
            Discover upcoming book fairs, reading sessions, and literary festivals. Join the movement and celebrate the written word.
          </p>
        </FadeIn>
      </section>

      {/* -- TABS & SEARCH (NEOBRUTALIST) -- */}
      <section style={{ borderBottom: `2px solid ${C.dark}`, borderTop: `2px solid ${C.dark}`, background: C.white }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "2rem" }}>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button 
              onClick={() => setActiveTab('upcoming')}
              className="tab-btn"
              style={{
                background: activeTab === 'upcoming' ? C.primary : C.white,
                border: `2px solid ${C.dark}`,
                padding: "0.5rem 1.5rem",
                borderRadius: "50px",
                color: C.dark,
                boxShadow: activeTab === 'upcoming' ? "3px 3px 0px #000" : "0px 0px 0px #000",
                fontSize: 14, fontWeight: 800,
                cursor: "pointer", transition: "all 0.2s ease",
                transform: activeTab === 'upcoming' ? "translate(-2px, -2px)" : "none"
              }}
            >
              Upcoming ({upcomingEvents.length})
            </button>
            <button 
              onClick={() => setActiveTab('past')}
              className="tab-btn"
              style={{
                background: activeTab === 'past' ? C.blue : C.white,
                border: `2px solid ${C.dark}`,
                padding: "0.5rem 1.5rem",
                borderRadius: "50px",
                color: activeTab === 'past' ? C.white : C.dark,
                boxShadow: activeTab === 'past' ? "3px 3px 0px #000" : "0px 0px 0px #000",
                fontSize: 14, fontWeight: 800,
                cursor: "pointer", transition: "all 0.2s ease",
                transform: activeTab === 'past' ? "translate(-2px, -2px)" : "none"
              }}
            >
              Past ({filteredPastEvents.length})
            </button>
          </div>
          
          <div style={{ position: "relative", width: "100%", maxWidth: 350 }}>
            <Search size={18} color={C.dark} style={{ position: "absolute", left: "1.2rem", top: "50%", transform: "translateY(-50%)" }} />
            <input 
              type="text" 
              placeholder="Search Events..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%", padding: "0.8rem 1rem 0.8rem 3rem",
                background: C.white, border: `2px solid ${C.dark}`, borderRadius: "50px",
                boxShadow: "3px 3px 0px #000",
                outline: "none", fontSize: 14, color: C.dark, fontWeight: 700,
                transition: "all 0.2s"
              }}
            />
          </div>
        </div>
      </section>

      {/* -- CONTENT (NEOBRUTALIST GRID) -- */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "6rem 1.5rem" }}>
        {loading ? (
          <div className="events-grid">
             {[1, 2, 3].map((i) => (
               <div key={i} style={{ height: "300px", border: `2px solid ${C.dark}`, background: C.white, borderRadius: 16, padding: "2rem", boxShadow: "4px 4px 0px #000" }} className="animate-pulse flex flex-col">
                 <div style={{ height: "24px", background: "#e5e7eb", width: "80%", marginBottom: "1rem", borderRadius: 4 }} />
                 <div style={{ height: "16px", background: "#e5e7eb", width: "60%", marginBottom: "2rem", borderRadius: 4 }} />
               </div>
             ))}
          </div>
        ) : activeTab === 'upcoming' ? (
          filteredUpcomingEvents.length === 0 ? (
            <FadeIn>
              <div style={{ padding: "4rem", textAlign: "center", border: `2px solid ${C.dark}`, borderRadius: 24, background: C.white, boxShadow: "6px 6px 0px #000" }}>
                <Calendar size={48} color={C.dark} style={{ margin: "0 auto 1.5rem" }} />
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 900, color: C.dark, marginBottom: "1rem" }}>No Upcoming Events</h2>
                <p style={{ fontSize: 16, color: "#4b5563", fontWeight: 500, maxWidth: 500, margin: "0 auto" }}>
                  Our event coordinators are busy planning the next big literary gathering. Check back soon!
                </p>
              </div>
            </FadeIn>
          ) : (
            <div className="events-grid">
              {displayedUpcoming.map((event, i) => {
                const bgColors = [C.white, C.cream];
                const cardBg = bgColors[i % bgColors.length];
                return (
                <FadeIn key={event.id} delay={i * 50}>
                  <div className="event-card" style={{ display: "flex", flexDirection: "column", height: "100%", border: `2px solid ${C.dark}`, background: cardBg, borderRadius: 24, padding: "2rem", boxShadow: "4px 4px 0px #000", transition: "transform 0.2s ease, box-shadow 0.2s ease", cursor: "pointer" }}
                       onMouseEnter={e => { e.currentTarget.style.transform = "translate(-2px, -2px)"; e.currentTarget.style.boxShadow = "6px 6px 0px #000"; }}
                       onMouseLeave={e => { e.currentTarget.style.transform = "translate(0px, 0px)"; e.currentTarget.style.boxShadow = "4px 4px 0px #000"; }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                      <span style={{ fontSize: 12, fontWeight: 800, background: C.primary, padding: "0.2rem 0.8rem", borderRadius: 50, border: `2px solid ${C.dark}`, color: C.dark }}>
                        {event.date}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Clock size={14} /> {event.duration}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 900, color: C.dark, marginBottom: "1rem", flexGrow: 1, lineHeight: 1.2 }}>{event.name}</h3>
                    <p style={{ fontSize: 14, color: "#4b5563", fontWeight: 600, display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "2rem" }}>
                      <MapPin size={16} color={C.red} style={{ marginTop: "0.1rem", flexShrink: 0 }} /> {event.location}
                    </p>
                    
                    {((event._count?.eventAuthors > 0) || (event._count?.eventBooks > 0)) && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", borderTop: `2px dashed ${C.dark}`, paddingTop: "1.5rem" }}>
                        {event._count?.eventAuthors > 0 ? (
                          <div style={{ background: C.white, border: `2px solid ${C.dark}`, borderRadius: 12, padding: "0.5rem 1rem", textAlign: "center" }}>
                            <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", marginBottom: "0.2rem", color: C.dark }}>Authors</div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 900, color: C.dark }}>{event._count.eventAuthors}</div>
                          </div>
                        ) : <div />}
                        {event._count?.eventBooks > 0 ? (
                          <div style={{ background: C.white, border: `2px solid ${C.dark}`, borderRadius: 12, padding: "0.5rem 1rem", textAlign: "center" }}>
                            <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", marginBottom: "0.2rem", color: C.dark }}>Books</div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 900, color: C.dark }}>{event._count.eventBooks}</div>
                          </div>
                        ) : <div />}
                      </div>
                    )}
                  </div>
                </FadeIn>
              )})}
            </div>
          )
        ) : (
          <div>
            {filteredPastEvents.length === 0 ? (
              <FadeIn>
                <div style={{ padding: "4rem", textAlign: "center", border: `2px solid ${C.dark}`, borderRadius: 24, background: C.white, boxShadow: "6px 6px 0px #000" }}>
                  <Search size={48} color={C.dark} style={{ margin: "0 auto 1.5rem" }} />
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 900, color: C.dark, marginBottom: "1rem" }}>No Events Found</h2>
                  <p style={{ fontSize: 16, color: "#4b5563", fontWeight: 500, maxWidth: 500, margin: "0 auto" }}>Try adjusting your search criteria.</p>
                </div>
              </FadeIn>
            ) : (
              <div className="events-grid">
                {displayedPast.map((event, i) => {
                  return (
                  <FadeIn key={event.id} delay={i * 50}>
                    <div className="event-card" style={{ display: "flex", flexDirection: "column", height: "100%", border: `2px solid ${C.dark}`, background: C.white, borderRadius: 24, padding: "1.5rem", boxShadow: "4px 4px 0px #000", transition: "transform 0.2s ease, box-shadow 0.2s ease", cursor: "pointer" }}
                         onMouseEnter={e => { e.currentTarget.style.transform = "translate(-2px, -2px)"; e.currentTarget.style.boxShadow = "6px 6px 0px #000"; }}
                         onMouseLeave={e => { e.currentTarget.style.transform = "translate(0px, 0px)"; e.currentTarget.style.boxShadow = "4px 4px 0px #000"; }}>
                      <div style={{ height: 200, overflow: "hidden", marginBottom: "1.5rem", border: `2px solid ${C.dark}`, borderRadius: 16, background: C.light }}>
                        {getEventBanner(event) ? (
                           <img src={getEventBanner(event)} alt={event.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                           <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", textAlign: "center" }}>
                              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 900, color: "#9ca3af", margin: 0, lineHeight: 1.2 }}>{event.name}</h3>
                           </div>
                        )}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <span style={{ fontSize: 12, fontWeight: 800, background: C.blue, padding: "0.2rem 0.8rem", borderRadius: 50, border: `2px solid ${C.dark}`, color: C.white }}>
                          {event.date}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Clock size={14} /> {event.duration}
                        </span>
                      </div>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 900, color: C.dark, marginBottom: "1rem", flexGrow: 1, lineHeight: 1.2 }}>{event.name}</h3>
                      <p style={{ fontSize: 14, color: "#4b5563", fontWeight: 600, display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "1.5rem" }}>
                        <MapPin size={16} color={C.red} style={{ marginTop: "0.1rem", flexShrink: 0 }} /> {event.location}
                      </p>
                      
                      {((event._count?.eventAuthors > 0) || (event._count?.eventBooks > 0)) && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", borderTop: `2px dashed ${C.dark}`, paddingTop: "1.5rem" }}>
                          {event._count?.eventAuthors > 0 ? (
                            <div style={{ background: C.light, border: `2px solid ${C.dark}`, borderRadius: 12, padding: "0.5rem 1rem", textAlign: "center" }}>
                              <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", marginBottom: "0.2rem", color: C.dark }}>Authors</div>
                              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 900, color: C.dark }}>{event._count.eventAuthors}</div>
                            </div>
                          ) : <div />}
                          {event._count?.eventBooks > 0 ? (
                            <div style={{ background: C.light, border: `2px solid ${C.dark}`, borderRadius: 12, padding: "0.5rem 1rem", textAlign: "center" }}>
                              <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", marginBottom: "0.2rem", color: C.dark }}>Books</div>
                              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 900, color: C.dark }}>{event._count.eventBooks}</div>
                            </div>
                          ) : <div />}
                        </div>
                      )}
                    </div>
                  </FadeIn>
                )})}
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "4rem", gap: "1rem" }}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: "0.8rem 1.5rem", background: currentPage === 1 ? C.light : C.white, 
                color: currentPage === 1 ? "#9ca3af" : C.dark, border: `2px solid ${C.dark}`,
                borderRadius: "50px", cursor: currentPage === 1 ? "default" : "pointer", fontWeight: 800,
                boxShadow: currentPage === 1 ? "0px 0px 0px #000" : "3px 3px 0px #000",
                transition: "all 0.2s ease",
                transform: currentPage === 1 ? "none" : "translate(-2px, -2px)"
              }}
            >
              Previous
            </button>
            <span style={{ display: "flex", alignItems: "center", color: C.dark, fontSize: "14px", fontWeight: 800 }}>
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: "0.8rem 1.5rem", background: currentPage === totalPages ? C.light : C.white, 
                color: currentPage === totalPages ? "#9ca3af" : C.dark, border: `2px solid ${C.dark}`,
                borderRadius: "50px", cursor: currentPage === totalPages ? "default" : "pointer", fontWeight: 800,
                boxShadow: currentPage === totalPages ? "0px 0px 0px #000" : "3px 3px 0px #000",
                transition: "all 0.2s ease",
                transform: currentPage === totalPages ? "none" : "translate(-2px, -2px)"
              }}
            >
              Next
            </button>
          </div>
        )}
      </section>

      <style>{`
        .events-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 2rem; }
        @media (min-width: 768px) { .events-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .events-grid { grid-template-columns: repeat(3, 1fr); } }
      `}</style>
    </main>
  );
}
