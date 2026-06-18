import { Calendar, MapPin } from "lucide-react";

export function EventsPage() {
  const upcomingEvents = [
    { title: "Indie Authors Meetup", date: "August 15, 2026", location: "Pune Authors' Hub", type: "Literary Event" },
    { title: "Children's Storytelling Weekend", date: "September 2, 2026", location: "Goa Book Café", type: "Workshop" },
    { title: "National Book Fair Pavilion", date: "October 10-14, 2026", location: "New Delhi", type: "Exhibition" },
  ];

  return (
    <main style={{ fontFamily: "var(--font-body)", background: "#fafafa", minHeight: "calc(100vh - 72px)", padding: "4rem 1.5rem" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, color: "#111827", marginBottom: "1rem" }}>Upcoming Events</h1>
          <p style={{ fontSize: 16, color: "#4b5563" }}>Join our physical reading circles, book fairs, and intimate author panels.</p>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {upcomingEvents.map((e, i) => (
            <div key={i} style={{ background: "#fff", padding: "2rem", borderRadius: 8, boxShadow: "0 2px 10px rgba(0,0,0,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#b44d28", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>{e.type}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>{e.title}</h3>
                <div style={{ display: "flex", gap: "1.5rem", fontSize: 14, color: "#6b7280" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><Calendar size={14}/> {e.date}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><MapPin size={14}/> {e.location}</span>
                </div>
              </div>
              <button style={{ background: "#111827", color: "#fff", padding: "0.7rem 1.4rem", borderRadius: 4, fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer" }}>
                RSVP Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
