import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { BookOpen, Users, Calendar, Megaphone, Store, MapPin, Feather, Phone, Mail, Image as ImageIcon, CheckCircle, ArrowRight, Library, Search, UserPlus } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import FocusTrap from 'focus-trap-react';

// --- COLOR PALETTE (Vibrant Bento Theme) ---
const C = {
  primary: "#facc15", // Vibrant Yellow
  red: "#ef4444",     // Vibrant Red
  blue: "#3b82f6",    // Vibrant Blue
  green: "#16a34a",   // Vibrant Green
  dark: "#000000",    // Pure Black for high contrast
  text: "#111827",    // Very dark gray for text
  light: "#f8f9fa",   // Off-white background
  white: "#ffffff",
  cream: "#f3f4f6",
};

// --- FADE IN ON SCROLL ---
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(18px)", transition: `all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms` }}>
      {children}
    </div>
  );
}

// --- WAVY SVG DECORATION ---
const WavyBorder = ({ fill = C.primary }: { fill?: string }) => (
  <svg viewBox="0 0 1000 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 0 }}>
    <path d="M0,50 C150,150 350,0 500,50 C650,100 850,-50 1000,50 L1000,100 L0,100 Z" fill={fill} opacity="0.1" />
  </svg>
);

export function OrganizerLandingPage() {
  const [stats, setStats] = useState({ events: 0, authors: 0, books: 0, airportLibraries: 0 });

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/public-stats`)
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <main style={{ fontFamily: "var(--font-body)", background: C.light, color: C.text, overflowX: "hidden" }}>

      {/* HERO SECTION */}
      <section style={{ padding: "11.5rem 2rem 4rem", textAlign: "center", position: "relative" }}>
        <FadeIn>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: "1.5rem", letterSpacing: "-0.03em", color: C.dark, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem", alignItems: "center" }}>
            <span>Organize Literary</span>
            <span style={{ display: "inline-flex", gap: "0.2rem" }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: C.red, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, transform: "rotate(-10deg)" }}><Users size={24} /></div>
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, transform: "rotate(10deg)" }}><BookOpen size={24} /></div>
            </span>
            <span>Events</span>
          </h1>
          <p style={{ fontSize: "1.2rem", color: "#4b5563", maxWidth: 600, margin: "0 auto 2.5rem", lineHeight: 1.6, fontWeight: 500 }}>
            Partner with Pune Authors. Connect with local writers and readers.
          </p>
          
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/organizers/organize-event" style={{ 
              background: C.primary, color: C.dark, padding: "1rem 2.5rem", borderRadius: "50px", 
              fontWeight: 800, textDecoration: "none", fontSize: "1rem", border: `2px solid ${C.dark}`,
              boxShadow: "4px 4px 0px #000", transition: "all 0.2s ease"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translate(-2px, -2px)"; e.currentTarget.style.boxShadow = "6px 6px 0px #000"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translate(0px, 0px)"; e.currentTarget.style.boxShadow = "4px 4px 0px #000"; }}
            >
              Host an Event
            </Link>
            <Link to="/events?from=organizer&tab=past" style={{ 
              background: C.white, color: C.dark, padding: "1rem 2.5rem", borderRadius: "50px", 
              fontWeight: 800, textDecoration: "none", fontSize: "1rem", border: `2px solid ${C.dark}`,
              transition: "all 0.2s ease"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.cream; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.white; }}
            >
              View Past Events
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* BENTO GRID */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem 6rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
          
          {/* BLOCK 1: Light Green */}
          <FadeIn delay={100}>
            <Link to="/organizers/organize-event" style={{ textDecoration: "none", display: "flex", flexDirection: "column", background: C.green, borderRadius: 24, padding: "1.5rem", border: `2px solid ${C.dark}`, boxShadow: "4px 4px 0px rgba(0,0,0,0.1)", height: "100%", position: "relative", overflow: "hidden", color: C.white, transition: "transform 0.2s ease" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translate(-2px, -2px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translate(0px, 0px)"}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", position: "relative", zIndex: 10 }}>
                <div style={{ background: C.white, color: C.dark, width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, border: `2px solid ${C.dark}`, flexShrink: 0 }}>1</div>
                <h2 style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.03em", color: C.white, margin: 0 }}>Host Literary Events</h2>
              </div>
              <ul style={{ fontSize: "1rem", color: "rgba(255,255,255,0.9)", fontWeight: 500, lineHeight: 1.4, paddingLeft: "1.2rem", margin: 0, listStyleType: "disc", position: "relative", zIndex: 10 }}>
                <li style={{ marginBottom: "0.25rem" }}>Meet the author</li>
                <li style={{ marginBottom: "0.25rem" }}>Story writing competition</li>
                <li style={{ marginBottom: "0.25rem" }}>Author speaks</li>
                <li style={{ marginBottom: "0.25rem" }}>Publishing support</li>
                <li style={{ marginBottom: "0.25rem" }}>Panel discussion</li>
              </ul>
              
              <div style={{ position: "absolute", bottom: "-20px", right: "-20px", opacity: 0.1, zIndex: 0 }}>
                <Calendar size={160} color={C.white} />
              </div>
            </Link>
          </FadeIn>

          {/* BLOCK 2: Sky Blue */}
          <FadeIn delay={200}>
            <Link to="/catalogue" style={{ textDecoration: "none", display: "flex", flexDirection: "column", background: "#0ea5e9", borderRadius: 24, padding: "1.5rem", border: `2px solid ${C.dark}`, boxShadow: "4px 4px 0px rgba(0,0,0,0.2)", height: "100%", position: "relative", overflow: "hidden", color: C.white, transition: "transform 0.2s ease" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translate(-2px, -2px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translate(0px, 0px)"}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", position: "relative", zIndex: 10 }}>
                <div style={{ background: C.white, color: C.dark, width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, border: `2px solid ${C.dark}`, flexShrink: 0 }}>2</div>
                <h2 style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, color: C.white, margin: 0 }}>Browse Authors & Book Catalogue</h2>
              </div>
              <ul style={{ fontSize: "1.1rem", fontWeight: 500, lineHeight: 1.4, opacity: 0.9, color: C.white, paddingLeft: "1.2rem", margin: 0, listStyleType: "disc", position: "relative", zIndex: 10 }}>
                <li style={{ marginBottom: "0.25rem" }}>Explore renowned and emerging authors.</li>
                <li style={{ marginBottom: "0.25rem" }}>Discover books across diverse genres.</li>
                <li style={{ marginBottom: "0.25rem" }}>Find the perfect read from our curated catalogue.</li>
              </ul>
              
              <div style={{ position: "absolute", bottom: "-20px", right: "-20px", opacity: 0.1, zIndex: 0 }}>
                <Library size={160} color={C.white} />
              </div>
            </Link>
          </FadeIn>

        </div>
      </section>
      {/* WHAT WE BRING SECTION */}
      <section style={{ padding: "4rem 2rem 8rem", background: C.cream, borderTop: `2px solid ${C.dark}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <FadeIn>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.03em", color: C.dark, marginBottom: "1rem" }}>
                What We Bring to <span style={{ color: C.red, fontStyle: "italic" }}>Your Event</span>
              </h2>
              <p style={{ fontSize: "1.1rem", color: "#4b5563", fontWeight: 500 }}>
                PAA offers complete operational support to ensure event success.
              </p>
            </FadeIn>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
            
            {/* Card 1 */}
            <FadeIn delay={100}>
              <div style={{ background: C.white, borderRadius: 16, padding: "2rem", border: `2px solid ${C.dark}`, boxShadow: "4px 4px 0px #000", height: "100%", display: "flex", flexDirection: "column", transition: "transform 0.2s ease" }}
                   onMouseEnter={e => e.currentTarget.style.transform = "translate(-2px, -2px)"}
                   onMouseLeave={e => e.currentTarget.style.transform = "translate(0px, 0px)"}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem", border: `2px solid ${C.dark}` }}>
                  <BookOpen size={24} color={C.red} />
                </div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: C.dark, marginBottom: "0.8rem", letterSpacing: "-0.02em" }}>Inspire a Love for Reading</h3>
                <p style={{ fontSize: "0.95rem", color: "#4b5563", lineHeight: 1.6, fontWeight: 500, margin: 0 }}>
                  Inspire Reading Habits and Creative Thinking Through Engaging Literary Experiences.
                </p>
              </div>
            </FadeIn>

            {/* Card 2 */}
            <FadeIn delay={200}>
              <div style={{ background: C.white, borderRadius: 16, padding: "2rem", border: `2px solid ${C.dark}`, boxShadow: "4px 4px 0px #000", height: "100%", display: "flex", flexDirection: "column", transition: "transform 0.2s ease" }}
                   onMouseEnter={e => e.currentTarget.style.transform = "translate(-2px, -2px)"}
                   onMouseLeave={e => e.currentTarget.style.transform = "translate(0px, 0px)"}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem", border: `2px solid ${C.dark}` }}>
                  <Calendar size={24} color="#16a34a" />
                </div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: C.dark, marginBottom: "0.8rem", letterSpacing: "-0.02em" }}>Curated Literary Events</h3>
                <p style={{ fontSize: "0.95rem", color: "#4b5563", lineHeight: 1.6, fontWeight: 500, margin: 0 }}>
                  Organize Book Exhibitions, Author Interactions, Storytelling Sessions, and Creative Workshops.
                </p>
              </div>
            </FadeIn>

            {/* Card 3 */}
            <FadeIn delay={300}>
              <div style={{ background: C.white, borderRadius: 16, padding: "2rem", border: `2px solid ${C.dark}`, boxShadow: "4px 4px 0px #000", height: "100%", display: "flex", flexDirection: "column", transition: "transform 0.2s ease" }}
                   onMouseEnter={e => e.currentTarget.style.transform = "translate(-2px, -2px)"}
                   onMouseLeave={e => e.currentTarget.style.transform = "translate(0px, 0px)"}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem", border: `2px solid ${C.dark}` }}>
                  <Users size={24} color={C.blue} />
                </div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: C.dark, marginBottom: "0.8rem", letterSpacing: "-0.02em" }}>Build a Vibrant Literary Culture</h3>
                <p style={{ fontSize: "0.95rem", color: "#4b5563", lineHeight: 1.6, fontWeight: 500, margin: 0 }}>
                  Build a Vibrant Literary Culture with Reading Campaigns, Competitions, and Educational Activities.
                </p>
              </div>
            </FadeIn>

          </div>
        </div>
      </section>


    </main>
  );
}
