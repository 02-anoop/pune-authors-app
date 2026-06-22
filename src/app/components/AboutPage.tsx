import { useState, useEffect, useRef } from "react";
import { Users } from "lucide-react";

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

export function AboutPage() {
  return (
    <main style={{ fontFamily: "var(--font-body)", background: "#fafafa", color: "#111", minHeight: "calc(100vh - 64px)", overflowX: "hidden" }}>
      
      {/* ── HERO ── */}
      <section style={{ borderBottom: "1px solid #eaeaea", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "8rem 1.5rem" }}>
          <FadeIn>
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#333", marginBottom: "2rem" }}>
              Origins & Mission
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 5vw, 4rem)", fontWeight: 400, color: "#111", lineHeight: 1.1, letterSpacing: "-0.01em", maxWidth: 800 }}>
              About <span style={{ fontStyle: "italic", color: "#b44d28" }}>The Group.</span>
            </h1>
          </FadeIn>
        </div>
      </section>

      {/* ── CONTENT (ELEGANT SPLIT) ── */}
      <section style={{ padding: "8rem 1.5rem", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6rem", alignItems: "start" }} className="about-grid">
          
          <FadeIn delay={150}>
            <div>
              <div style={{ width: "100%", height: 500, background: "#fff", border: "1px solid #eaeaea", padding: "1rem" }}>
                <img 
                  src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=1000&fit=crop" 
                  alt="Authors collaborating" 
                  style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(20%) contrast(0.9)" }}
                />
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={300}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div>
                <div style={{ width: 30, height: 1, background: "#111", marginBottom: "1.5rem" }}></div>
                <p style={{ fontSize: 16, color: "#222", lineHeight: 1.8, fontWeight: 400 }}>
                  The group was conceived in <strong>December 2024</strong> following the Pune Book Fair. While networking at a local stall, several authors recognized a shared challenge: the immense difficulty of selling independently in a saturated market.
                </p>
              </div>
              
              <div>
                <p style={{ fontSize: 16, color: "#222", lineHeight: 1.8, fontWeight: 400 }}>
                  The idea to form a unified coalition of Pune authors was spearheaded by <strong>Cdr Shiv Mathur</strong>. Having witnessed firsthand the struggles authors face with visibility and distribution, the vision became clear: find a way to promote literature collaboratively rather than competitively.
                </p>
              </div>

              <div>
                <p style={{ fontSize: 16, color: "#222", lineHeight: 1.8, fontWeight: 400 }}>
                  By pooling resources, we discovered that financial barriers to self-marketing drastically decreased. Shared costs allow us to execute large-scale activities, prominent stall placements, and robust marketing campaigns that would be prohibitively expensive for an individual author.
                </p>
              </div>

              <div>
                <p style={{ fontSize: 16, color: "#222", lineHeight: 1.8, fontWeight: 400 }}>
                  Today, a strict group guideline document ensures every author understands our shared agenda and ethical rules. As our success grew, we expanded our invitation to authors from Mumbai, and we are now proudly welcoming talent from across the entire country into our literary ecosystem.
                </p>
              </div>
            </div>
          </FadeIn>
          
        </div>
      </section>

      <style>{`
        @media (max-width: 800px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 4rem !important; }
        }
      `}</style>
    </main>
  );
}
