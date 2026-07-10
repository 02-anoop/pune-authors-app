import React, { useState, useEffect } from 'react';
import { Plane, MapPin, BookOpen, Clock } from 'lucide-react';
import axios from 'axios';

const airports = [
  { name: 'Kolkata Airport', location: 'Netaji Subhash Chandra Bose International Airport, Kolkata', books: '250+' },
  { name: 'Chennai Airport', location: 'Chennai International Airport, Chennai', books: '250+' },
  { name: 'Pune Airport', location: 'Pune International Airport, Pune', books: '200+' },
  { name: 'Thiruvananthapuram Airport', location: 'Trivandrum International Airport', books: '200+' },
  { name: 'Mangaluru Airport', location: 'Mangaluru International Airport', books: '200+' },
  { name: 'Bhubaneshwar Airport', location: 'Biju Patnaik International Airport, Bhubaneshwar', books: '200+' },
];

export function FlybrariesPage() {
  const [flybraries, setFlybraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlybraries = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/public/libraries`);
        const flys = res.data.filter((lib: any) => lib.type === 'Airport Library');
        setFlybraries(flys);
      } catch (error) {
        console.error("Failed to fetch flybraries:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlybraries();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const displayedLibraries = flybraries.length > 0 ? flybraries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) : airports;
  const totalPages = flybraries.length > 0 ? Math.ceil(flybraries.length / itemsPerPage) : 1;
  const getEventBanner = (event: any) => {
    let url = event.bannerUrl;
    if (url) {
      return url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${url}`;
    }
    return null;
  };

  return (
    <main style={{ fontFamily: "var(--font-body)", background: "#2C1B18", color: "#fff", minHeight: "calc(100vh - 64px)", overflowX: "hidden" }}>
      {/* ── HERO ── */}
      <section style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", background: "url('/crumbled-paper.png') center/cover", color: "#111", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.7)" }}></div>
        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", padding: "8rem 1.5rem" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3D2622", marginBottom: "2rem" }}>
            Taking Books to the Skies
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 5vw, 4rem)", fontWeight: 400, color: "#111", lineHeight: 1.1, letterSpacing: "-0.01em", maxWidth: 800 }}>
            The <span style={{ fontStyle: "italic", color: "#D84315" }}>Flybraries</span> Project.
          </h1>
          <p style={{ fontSize: 15, color: "#2C1B18", lineHeight: 1.8, marginTop: "2rem", maxWidth: 600, fontWeight: 500 }}>
            We believe that great stories should travel. Through the Flybraries initiative, the Pune Authors' Association has set up free libraries at six major airports across India, donating over 1,400 books to enrich the journeys of millions of travelers.
          </p>
        </div>
      </section>

      {/* ── LOCATIONS GRID ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "6rem 1.5rem" }}>
        {loading ? (
          <div className="events-grid">
             {[1, 2, 3].map((i) => (
               <div key={i} style={{ height: "300px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", padding: "2rem" }} className="animate-pulse flex flex-col">
                 <div style={{ height: "16px", background: "rgba(255,255,255,0.1)", width: "100px", marginBottom: "1.5rem" }} />
                 <div style={{ height: "24px", background: "rgba(255,255,255,0.1)", width: "80%", marginBottom: "1rem" }} />
                 <div style={{ height: "16px", background: "rgba(255,255,255,0.1)", width: "60%", marginBottom: "2rem" }} />
                 <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", width: "100%", margin: "auto 0 1rem" }} />
                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                   <div style={{ height: "32px", background: "rgba(255,255,255,0.1)" }} />
                   <div style={{ height: "32px", background: "rgba(255,255,255,0.1)" }} />
                 </div>
               </div>
             ))}
          </div>
        ) : (
          <div className="events-grid">
            {flybraries.length > 0 ? (
              displayedLibraries.map((event, index) => (
                <div key={index} className="event-card" style={{ display: "flex", flexDirection: "column", height: "100%", border: "1px solid rgba(255,255,255,0.1)", background: "#fff", padding: "2rem", transition: "transform 0.4s ease, box-shadow 0.4s ease" }}>
                  <div style={{ height: 200, overflow: "hidden", marginBottom: "1.5rem", border: "1px solid #eaeaea", background: "#f9f9f9", padding: "0.25rem" }}>
                    {getEventBanner(event) ? (
                       <img src={getEventBanner(event)} alt={event.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                       <div style={{ width: "100%", height: "100%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", textAlign: "center" }}>
                          <Plane size={32} color="#ccc" style={{ marginBottom: "0.5rem" }} />
                       </div>
                    )}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#b44d28" }}>
                      {new Date(event.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <div style={{ 
                      width: "36px", height: "36px", borderRadius: "50%", background: "rgba(180, 77, 40, 0.08)", 
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <Plane size={18} color="#b44d28" />
                    </div>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 600, color: "#111", margin: "0 0 0.5rem", flexGrow: 1 }}>{event.name}</h3>
                  <p style={{ fontSize: 13, color: "#666", fontWeight: 400, display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "2rem", lineHeight: 1.4 }}>
                    <MapPin size={14} style={{ marginTop: "0.2rem", flexShrink: 0 }} />
                    <span>{event.airportName ? `${event.airportName}, ${event.city}` : event.city}</span>
                  </p>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#f9fafb", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid #f3f4f6" }}>
                    <BookOpen size={16} color="#4b5563" />
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {event.booksDonated || '250+'} Books Donated
                    </span>
                  </div>
                </div>
              ))
            ) : (
              displayedLibraries.map((airport, index) => (
                <div key={index} className="event-card" style={{ display: "flex", flexDirection: "column", height: "100%", border: "1px solid rgba(255,255,255,0.1)", background: "#fff", padding: "2rem", transition: "transform 0.4s ease, box-shadow 0.4s ease" }}>
                  <div style={{ height: 200, overflow: "hidden", marginBottom: "1.5rem", border: "1px solid #eaeaea", background: "#f9f9f9", padding: "0.25rem" }}>
                    <div style={{ width: "100%", height: "100%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", textAlign: "center" }}>
                      <Plane size={32} color="#ccc" style={{ marginBottom: "0.5rem" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#b44d28" }}>
                      Ongoing
                    </span>
                    <div style={{ 
                      width: "36px", height: "36px", borderRadius: "50%", background: "rgba(180, 77, 40, 0.08)", 
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <Plane size={18} color="#b44d28" />
                    </div>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 600, color: "#111", margin: "0 0 0.5rem", flexGrow: 1 }}>{airport.name}</h3>
                  <p style={{ fontSize: 13, color: "#666", fontWeight: 400, display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "2rem", lineHeight: 1.4 }}>
                    <MapPin size={14} style={{ marginTop: "0.2rem", flexShrink: 0 }} />
                    <span>{airport.location}</span>
                  </p>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#f9fafb", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid #f3f4f6" }}>
                    <BookOpen size={16} color="#4b5563" />
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {airport.books} Books Donated
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem', gap: '1rem' }}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 1rem', background: currentPage === 1 ? 'transparent' : '#fff', 
                color: currentPage === 1 ? 'rgba(255,255,255,0.3)' : '#2C1B18', border: '1px solid',
                borderColor: currentPage === 1 ? 'rgba(255,255,255,0.1)' : '#fff', borderRadius: '4px', cursor: currentPage === 1 ? 'default' : 'pointer', fontWeight: 600
              }}
            >
              Previous
            </button>
            <span style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.5rem 1rem', background: currentPage === totalPages ? 'transparent' : '#fff', 
                color: currentPage === totalPages ? 'rgba(255,255,255,0.3)' : '#2C1B18', border: '1px solid',
                borderColor: currentPage === totalPages ? 'rgba(255,255,255,0.1)' : '#fff', borderRadius: '4px', cursor: currentPage === totalPages ? 'default' : 'pointer', fontWeight: 600
              }}
            >
              Next
            </button>
          </div>
        )}
      </section>

      <style>{`
        .flybrary-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.06);
        }
        .event-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
        .events-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 3rem; }
        @media (min-width: 768px) { .events-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .events-grid { grid-template-columns: repeat(3, 1fr); } }
      `}</style>
    </main>
  );
}
