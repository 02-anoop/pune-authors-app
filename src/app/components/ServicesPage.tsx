import { useState, useEffect, useRef } from "react";
import { PenTool, Megaphone, ShoppingBag } from "lucide-react";

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

export function ServicesPage() {
  return (
    <main style={{ fontFamily: "var(--font-body)", background: "#fafafa", color: "#111", minHeight: "calc(100vh - 64px)", overflowX: "hidden" }}>
      
      {/* ── HERO ── */}
      <section style={{ borderBottom: "1px solid #eaeaea", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "9rem 1.5rem 2rem" }}>
          <FadeIn>
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#333", marginBottom: "2rem" }}>
              Capabilities
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 5vw, 4rem)", fontWeight: 400, color: "#111", lineHeight: 1.1, letterSpacing: "-0.01em", maxWidth: 800 }}>
              Our <span style={{ fontStyle: "italic", color: "#b44d28" }}>Services.</span>
            </h1>
            <p style={{ fontSize: 15, color: "#333", lineHeight: 1.8, marginTop: "2rem", maxWidth: 500, fontWeight: 400 }}>
              Supporting authors through literary events, publishing support, promotion, and opportunities to connect with readers.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── SERVICES LIST (MINIMALIST) ── */}
      <section style={{ padding: "4rem 1.5rem", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
          
          {/* 1. Reviving Book Reading */}
          <FadeIn delay={100}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "4rem", borderTop: "1px solid #111", paddingTop: "2rem" }} className="service-row">
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "#b44d28", fontStyle: "italic", marginBottom: "1rem" }}>I.</div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 400, color: "#111" }}>Reviving <br/>Book Reading</h2>
              </div>
              <div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {[
                    "Organise literary events in housing societies, educational institutions and organisation."
                  ].map((item, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                      <span style={{ color: "#b44d28", fontSize: 12, marginTop: "0.2rem" }}>—</span>
                      <span style={{ fontSize: 14, color: "#333", fontWeight: 400 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>

          {/* 2. Reaching out to Readers */}
          <FadeIn delay={200}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "4rem", borderTop: "1px solid #111", paddingTop: "2rem" }} className="service-row">
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "#b44d28", fontStyle: "italic", marginBottom: "1rem" }}>II.</div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 400, color: "#111" }}>Reaching out <br/>to Readers</h2>
              </div>
              <div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {[
                    "Participate in Book Fairs organised by the National Book Trust of India",
                    "Online presence through group's website"
                  ].map((item, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                      <span style={{ color: "#b44d28", fontSize: 12, marginTop: "0.2rem" }}>—</span>
                      <span style={{ fontSize: 14, color: "#333", fontWeight: 400 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>

          {/* 3. Publishing Support */}
          <FadeIn delay={300}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "4rem", borderTop: "1px solid #111", paddingTop: "2rem" }} className="service-row">
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "#b44d28", fontStyle: "italic", marginBottom: "1rem" }}>III.</div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 400, color: "#111" }}>Publishing <br/>Support</h2>
              </div>
              <div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {[
                    "Formatting of manuscript",
                    "Editing",
                    "Proof Reading",
                    "Cover Designing",
                    "Printing support"
                  ].map((item, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                      <span style={{ color: "#b44d28", fontSize: 12, marginTop: "0.2rem" }}>—</span>
                      <span style={{ fontSize: 14, color: "#333", fontWeight: 400 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>

          {/* 4. Promotional Initiatives */}
          <FadeIn delay={400}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "4rem", borderTop: "1px solid #111", paddingTop: "2rem" }} className="service-row">
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "#b44d28", fontStyle: "italic", marginBottom: "1rem" }}>IV.</div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 400, color: "#111" }}>Promotional <br/>Initiatives</h2>
              </div>
              <div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {[
                    "Donating to small libraries in residential areas",
                    "Setting up airport flybraries",
                    "Marketing the website",
                    "Arranging author events and sessions"
                  ].map((item, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                      <span style={{ color: "#b44d28", fontSize: 12, marginTop: "0.2rem" }}>—</span>
                      <span style={{ fontSize: 14, color: "#333", fontWeight: 400 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>

        </div>
      </section>

      <style>{`
        @media (max-width: 800px) {
          .service-row { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>
    </main>
  );
}
