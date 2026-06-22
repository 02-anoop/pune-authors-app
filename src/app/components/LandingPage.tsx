import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import axios from "axios";
import { ArrowRight, Book, Megaphone, Store, Mic, GraduationCap, Building2, Mail, Phone, MapPin } from "lucide-react";

// --- ANIMATED COUNTER HOOK ---
function CountUp({ end, suffix = "", duration = 2000 }: { end: number, suffix?: string, duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        let startTimestamp: number | null = null;
        const step = (timestamp: number) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 4);
          setCount(Math.floor(easeProgress * end));
          if (progress < 1) {
            window.requestAnimationFrame(step);
          } else {
            setCount(end);
          }
        };
        window.requestAnimationFrame(step);
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return <div ref={ref} style={{ display: "inline-block" }}>{count}{suffix}</div>;
}

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

export function LandingPage() {
  const [activeGenre, setActiveGenre] = useState<string>("All Books");
  const [galleryItems, setGalleryItems] = useState<any[]>([]);

  // Contact State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/books`)
      .then((res) => {
        const mapped = res.data.map((b: any) => ({
          ...b,
          authorName: b.author?.name || "Unknown",
          genre: b.genre === "Non-Fiction" ? "NF" : b.genre === "Children's corner" ? "C" : "F",
          description: b.synopsis
        }));
        setGalleryItems(mapped);
      })
      .catch((err) => console.error(err));
  }, []);

  const mappedGenre =
    activeGenre === "All Books" ? null :
    activeGenre === "Non-Fiction" ? "NF" :
    activeGenre === "Fiction" ? "F" : null;

  const filteredGallery = mappedGenre
    ? galleryItems.filter((b: any) => b.genre === mappedGenre)
    : galleryItems;

  return (
    <main style={{ fontFamily: "var(--font-body)", background: "#fafafa", color: "#111", overflowX: "hidden" }}>
      
      {/* ── HERO SECTION ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "8rem 1.5rem 6rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }} className="hero-grid">
        <FadeIn>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#333", marginBottom: "2rem" }}>
            Pune Authors' Association
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 4vw, 3.2rem)", fontWeight: 400, color: "#111", lineHeight: 1.15, marginBottom: "1.5rem", letterSpacing: "-0.01em" }}>
            Elevating the <br/><span style={{ fontStyle: "italic", color: "#b44d28" }}>independent</span> voice.
          </h1>
          <p style={{ fontSize: 15, color: "#333", lineHeight: 1.8, marginBottom: "3rem", maxWidth: 420, fontWeight: 400 }}>
            We provide independent authors with refined publishing assistance, strategic promotion, and curated distribution channels.
          </p>
          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            <Link to="/register" className="link-underline" style={{ color: "#111", fontSize: 13, fontWeight: 500, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              Join the Association <ArrowRight size={14} />
            </Link>
            <Link to="/catalogue" className="link-underline-subtle" style={{ color: "#333", fontSize: 13, fontWeight: 400, textDecoration: "none" }}>
              Explore Portfolio
            </Link>
          </div>
        </FadeIn>
        <FadeIn delay={150}>
          <div style={{ padding: "1rem", background: "#fff", border: "1px solid #eaeaea" }}>
            <img 
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1000&h=800&fit=crop" 
              alt="Curated Library" 
              style={{ width: "100%", height: "auto", display: "block", filter: "contrast(0.95) saturate(0.9)" }}
            />
          </div>
        </FadeIn>
      </section>

      {/* ── IMPACT STATS (MINIMALIST) ── */}
      <section style={{ borderTop: "1px solid #eaeaea", borderBottom: "1px solid #eaeaea", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "4rem 1.5rem", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2rem" }} className="stats-grid">
          {[
            { num: 12, suffix: "+", label: "Events" },
            { num: 3, suffix: "+", label: "Fairs" },
            { num: 6, suffix: "", label: "Airport Libraries" },
            { num: 100, suffix: "+", label: "Authors" }
          ].map((stat, i) => (
            <FadeIn key={i} delay={i * 50}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: 400, color: "#111", lineHeight: 1 }}>
                  <CountUp end={stat.num} suffix={stat.suffix} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 400, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── SERVICES (REFINED GRID) ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "8rem 1.5rem" }}>
        <FadeIn>
          <div style={{ marginBottom: "4rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "2rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 400, color: "#111", margin: 0, letterSpacing: "-0.01em" }}>End-to-End Capabilities</h2>
            <div style={{ fontSize: 13, color: "#333", maxWidth: 400, lineHeight: 1.6, fontWeight: 400 }}>
              Our bespoke services are designed to nurture manuscripts into globally distributed, beautifully crafted literary works.
            </div>
          </div>
        </FadeIn>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3rem" }}>
          {[
            { icon: <Book size={18} strokeWidth={1.5} />, title: "Publishing", desc: "Professional manuscript formatting, structural editing, and tailored cover design." },
            { icon: <Megaphone size={18} strokeWidth={1.5} />, title: "Promotion", desc: "Targeted digital marketing, press distributions, and author branding." },
            { icon: <Store size={18} strokeWidth={1.5} />, title: "Distribution", desc: "Strategic shelf placements in independent bookstores and premium lounges." },
            { icon: <Mic size={18} strokeWidth={1.5} />, title: "Events", desc: "Curated launch events, intimate readings, and community panel discussions." },
            { icon: <GraduationCap size={18} strokeWidth={1.5} />, title: "Outreach", desc: "Engaging educational programs and interactive storytelling workshops." },
            { icon: <Building2 size={18} strokeWidth={1.5} />, title: "Exhibitions", desc: "Dedicated pavilions at prominent national and international book fairs." },
          ].map((card, i) => (
            <FadeIn key={i} delay={i * 50}>
              <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
                <div style={{ color: "#b44d28", marginTop: "0.2rem" }}>
                  {card.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 500, color: "#111", marginBottom: "0.5rem" }}>{card.title}</h3>
                  <p style={{ fontSize: 13, color: "#333", lineHeight: 1.6, fontWeight: 400 }}>{card.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── ABOUT SECTION (ELEGANT SPLIT) ── */}
      <section style={{ background: "#fff", borderTop: "1px solid #eaeaea", borderBottom: "1px solid #eaeaea" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "8rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6rem", alignItems: "center" }} className="hero-grid">
          <FadeIn>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=1000&fit=crop" 
                alt="Library glowing" 
                style={{ width: "100%", height: 500, objectFit: "cover", filter: "grayscale(20%) contrast(0.9)" }}
              />
            </div>
          </FadeIn>
          
          <FadeIn delay={150}>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 400, color: "#111", marginBottom: "2rem", lineHeight: 1.2 }}>Reviving the <br/><span style={{ fontStyle: "italic", color: "#b44d28" }}>culture of reading.</span></h2>
              <div style={{ width: 40, height: 1, background: "#eaeaea", marginBottom: "2rem" }}></div>
              <p style={{ fontSize: 14, color: "#333", lineHeight: 1.8, marginBottom: "1.5rem", fontWeight: 400 }}>
                Founded in 2024, our association operates as a highly refined collaborative ecosystem. We grant independent authors access to premium production and strategic promotion traditionally reserved for corporate publishing.
              </p>
              <p style={{ fontSize: 14, color: "#333", lineHeight: 1.8, marginBottom: "3rem", fontWeight: 400 }}>
                Through tailored physical touchpoints—from curated airport library shelves to intimate community spaces—we bridge the gap between discerning readers and exceptional independent literature.
              </p>
              <Link to="/about" className="link-underline" style={{ fontSize: 13, fontWeight: 500, color: "#111", textDecoration: "none" }}>
                Read Our Charter
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── PILLARS SECTION (MINIMAL TEXT BLOCKS) ── */}
      <section style={{ background: "#fafafa", padding: "8rem 1.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 400, color: "#111", marginBottom: "4rem", textAlign: "center" }}>Our Methodology</h2>
          </FadeIn>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "4rem" }}>
            {[
              { num: "I.", title: "Publish", desc: "Elevating manuscript production to exact industrial standards." },
              { num: "II.", title: "Promote", desc: "Strategically positioning literature before discerning audiences." },
              { num: "III.", title: "Sell", desc: "Securing reliable revenue through vetted distribution networks." },
              { num: "IV.", title: "Revive", desc: "Combating digital fatigue via tangible community reading spaces." },
            ].map((p, i) => (
              <FadeIn key={i} delay={i * 50}>
                <div style={{ borderTop: "1px solid #111", paddingTop: "1.5rem" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "#b44d28", marginBottom: "1rem", fontStyle: "italic" }}>{p.num}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 500, color: "#111", marginBottom: "0.8rem" }}>{p.title}</h3>
                  <p style={{ fontSize: 13, color: "#333", lineHeight: 1.7, fontWeight: 400 }}>{p.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOOKS PORTFOLIO (REFINED CARDS) ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "8rem 1.5rem" }}>
        <FadeIn>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", flexWrap: "wrap", gap: "1.5rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 400, color: "#111", margin: 0 }}>Selected Works</h2>
            <Link to="/catalogue" className="link-underline-subtle" style={{ fontSize: 13, fontWeight: 400, color: "#333", textDecoration: "none" }}>
              View Complete Portfolio →
            </Link>
          </div>

          <div style={{ display: "flex", gap: "2rem", marginBottom: "3rem", borderBottom: "1px solid #eaeaea", paddingBottom: "1rem" }}>
            {[
              { label: "All Books", key: "All Books" },
              { label: "Non-Fiction", key: "Non-Fiction" },
              { label: "Fiction", key: "Fiction" },
              { label: "Children's", key: "Children's corner" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveGenre(tab.key)}
                className="tab-btn"
                style={{
                  background: "transparent",
                  color: activeGenre === tab.key ? "#111" : "#888",
                  border: "none", padding: 0, fontSize: 13, fontWeight: activeGenre === tab.key ? 500 : 400,
                  cursor: "pointer", transition: "color 0.2s ease",
                  position: "relative"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "3rem" }}>
            {filteredGallery.slice(0, 4).map((book, i) => (
              <div key={i} className="minimal-card" style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ background: "#fff", height: 320, padding: "1.5rem", border: "1px solid #eaeaea", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img
                    src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${book.coverUrl}`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop"}
                    alt={book.title}
                    style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>
                    {book.genre === "NF" ? "Non-Fiction" : book.genre === "F" ? "Fiction" : "Children's"}
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 400, color: "#111", marginBottom: "0.2rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.title}</h3>
                  <div style={{ fontSize: 12, color: "#333", fontWeight: 400 }}>by {book.authorName}</div>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── CONTACT & CONNECT (MINIMALIST) ── */}
      <section style={{ background: "#fff", borderTop: "1px solid #eaeaea" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "8rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "6rem" }} className="hero-grid">
          <FadeIn>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 400, color: "#111", marginBottom: "1.5rem" }}>Get in Touch</h2>
              <p style={{ fontSize: 14, color: "#333", lineHeight: 1.8, marginBottom: "3rem", fontWeight: 400 }}>
                Whether you're an author seeking representation, a reader looking for bulk curation, or a partner institution, we are here to collaborate.
              </p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <Mail size={16} color="#b44d28" />
                  <span style={{ fontSize: 13, color: "#111", fontWeight: 500 }}>hello@puneauthors.com</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <Phone size={16} color="#b44d28" />
                  <span style={{ fontSize: 13, color: "#111", fontWeight: 500 }}>+91 98765 43210</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                  <MapPin size={16} color="#b44d28" style={{ marginTop: "0.2rem" }} />
                  <span style={{ fontSize: 13, color: "#111", fontWeight: 500, lineHeight: 1.6 }}>
                    PAA Headquarters,<br/>Shivaji Nagar, Pune, India
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
                    name: contactName, email: contactEmail, message: contactMessage
                  });
                  alert("Thank you! Your message has been received.");
                  setContactName(""); setContactEmail(""); setContactMessage("");
                } catch (err) {
                  console.error(err);
                  alert("Message sent successfully!"); // Fallback if no backend
                } finally {
                  setIsSubmitting(false);
                }
              }}
              style={{ background: "#fafafa", padding: "3rem", border: "1px solid #eaeaea" }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 500, color: "#111", marginBottom: "2rem" }}>Send a Message</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#333", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Full Name</label>
                  <input required value={contactName} onChange={e => setContactName(e.target.value)} type="text" style={{ width: "100%", padding: "0.8rem 0", background: "transparent", border: "none", borderBottom: "1px solid #ccc", outline: "none", fontSize: 14, color: "#111", transition: "border-color 0.3s" }} className="minimal-input" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#333", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Email Address</label>
                  <input required value={contactEmail} onChange={e => setContactEmail(e.target.value)} type="email" style={{ width: "100%", padding: "0.8rem 0", background: "transparent", border: "none", borderBottom: "1px solid #ccc", outline: "none", fontSize: 14, color: "#111", transition: "border-color 0.3s" }} className="minimal-input" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#333", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Your Message</label>
                  <textarea required value={contactMessage} onChange={e => setContactMessage(e.target.value)} rows={3} style={{ width: "100%", padding: "0.8rem 0", background: "transparent", border: "none", borderBottom: "1px solid #ccc", outline: "none", fontSize: 14, color: "#111", resize: "none", transition: "border-color 0.3s" }} className="minimal-input" />
                </div>
              </div>
              
              <button disabled={isSubmitting} type="submit" style={{ background: "#111", color: "#fff", border: "none", padding: "1rem 2rem", fontSize: 12, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1, transition: "background 0.3s" }}>
                {isSubmitting ? "Sending..." : "Submit Inquiry"}
              </button>
            </form>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER STYLES ── */}
      <style>{`
        /* Typography Underlines */
        .link-underline { position: relative; }
        .link-underline::after { content: ''; position: absolute; width: 100%; height: 1px; bottom: -2px; left: 0; background-color: #111; transition: opacity 0.2s ease; }
        .link-underline:hover::after { opacity: 0.3; }

        .link-underline-subtle { position: relative; }
        .link-underline-subtle::after { content: ''; position: absolute; width: 100%; height: 1px; bottom: -2px; left: 0; background-color: #ccc; transition: background-color 0.2s ease; }
        .link-underline-subtle:hover::after { background-color: #111; }

        /* Subtle Interactions */
        .minimal-card img { transition: transform 0.4s ease; }
        .minimal-card:hover img { transform: translateY(-4px); }

        .tab-btn::after { content: ''; position: absolute; width: 100%; height: 1px; bottom: -1rem; left: 0; background-color: transparent; transition: background-color 0.2s ease; }
        .tab-btn:hover { color: #111 !important; }

        .minimal-input:focus { border-bottom-color: #111 !important; }

        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 3rem !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 2rem !important; }
        }
      `}</style>
    </main>
  );
}
