import fs

landing_page_content = """import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import axios from "axios";
import { ArrowRight, Book, Megaphone, Store, Mic, GraduationCap, Building2, Mail, Phone, MapPin, Star, BookOpen, Info, Search, X } from "lucide-react";

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
          // Easing: easeOutQuart
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

// --- FADE IN ON SCROLL ---
function FadeIn({ children, delay = 0, y = 30 }: { children: React.ReactNode, delay?: number, y?: number }) {
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
        transform: isVisible ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function LandingPage() {
  const [activeGenre, setActiveGenre] = useState<string>("All Books");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [galleryItems, setGalleryItems] = useState<any[]>([]);

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
    <main style={{ fontFamily: "var(--font-body)", background: "#fdfbf7", overflowX: "hidden" }}>
      
      {/* ── HERO SECTION ── */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "6rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "5rem", alignItems: "center" }} className="hero-grid">
        <FadeIn>
          <div style={{ display: "inline-block", background: "rgba(180, 77, 40, 0.1)", color: "#b44d28", padding: "0.5rem 1.2rem", borderRadius: 100, fontSize: 12, fontWeight: 800, marginBottom: "2rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <span style={{ marginRight: 6 }}>●</span> Empowering Independent Voices
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3.5rem, 5vw, 5.5rem)", fontWeight: 900, color: "#0f172a", lineHeight: 1.05, marginBottom: "1.5rem", letterSpacing: "-0.02em" }}>
            Publish, Promote <br/><span style={{ color: "#b44d28", fontStyle: "italic", fontWeight: 400 }}>&amp;</span> Sell Your Book
          </h1>
          <p style={{ fontSize: 17, color: "#475569", lineHeight: 1.7, marginBottom: "3rem", maxWidth: 500 }}>
            From raw manuscript to global marketplace—we provide independent authors with premium publishing assistance, strategic promotion, distribution setups, and highly engaging community spaces.
          </p>
          <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
            <Link to="/register" className="btn-primary" style={{ background: "#b44d28", color: "#fff", padding: "1rem 2rem", borderRadius: 8, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
              Start Your Journey <ArrowRight size={18} />
            </Link>
            <Link to="/catalogue" className="btn-secondary" style={{ background: "transparent", border: "2px solid #0f172a", color: "#0f172a", padding: "1rem 2rem", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>
              Explore Catalogue
            </Link>
          </div>
        </FadeIn>
        <FadeIn delay={200}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: "100%", height: "100%", border: "2px solid #b44d28", borderRadius: 24, zIndex: 0 }}></div>
            <img 
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1000&h=800&fit=crop" 
              alt="Library Books" 
              style={{ width: "100%", borderRadius: 24, position: "relative", zIndex: 1, boxShadow: "0 40px 80px -20px rgba(0,0,0,0.3)" }}
            />
            {/* Floating badge */}
            <div className="float-anim" style={{ position: "absolute", bottom: -30, left: -30, background: "#fff", padding: "1.5rem", borderRadius: 16, boxShadow: "0 20px 40px rgba(0,0,0,0.1)", zIndex: 2, display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ background: "#ffedd5", width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><Star color="#b44d28" fill="#b44d28" size={24}/></div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 24, color: "#0f172a" }}>Premium</div>
                <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Publishing</div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── IMPACT STATS (ANIMATED) ── */}
      <section style={{ background: "#0f172a", color: "#fff", padding: "5rem 1.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.03, backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "3rem", position: "relative", zIndex: 1 }}>
          {[
            { num: 12, suffix: "+", label: "LITERARY EVENTS" },
            { num: 3, suffix: "+", label: "MAJOR FAIRS" },
            { num: 6, suffix: "", label: "AIRPORT LIBS" },
            { num: 100, suffix: "+", label: "AUTHORS JOINED" }
          ].map((stat, i) => (
            <FadeIn key={i} delay={i * 100} y={20}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "4.5rem", fontWeight: 900, color: "#fff", lineHeight: 1, marginBottom: "0.5rem" }}>
                  <CountUp end={stat.num} suffix={stat.suffix} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#b44d28", letterSpacing: "0.2em", textTransform: "uppercase" }}>{stat.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── SERVICES GRID (MODERN BENTO) ── */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "8rem 1.5rem" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#b44d28", letterSpacing: "0.15em", marginBottom: "1rem", textTransform: "uppercase" }}>What We Do</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 800, color: "#0f172a" }}>Everything an Author Needs</h2>
          </div>
        </FadeIn>
        
        <div className="bento-grid" style={{ display: "grid", gap: "2rem" }}>
          {[
            { icon: <Book size={28} />, title: "Publishing Services", desc: "End-to-end support including professional manuscript formatting, copyediting, structural review, tailored book cover illustrations, and ISBN procurement assistance.", class: "bento-span-2" },
            { icon: <Megaphone size={28} />, title: "Promotion Services", desc: "Customized modern marketing solutions including social media campaign launches, high-reach digital assets, press release distributions, and individual author brand kits.", class: "bento-span-1" },
            { icon: <Store size={28} />, title: "Distribution & Libraries", desc: "Direct shelf placements across our premium network of Airport Libraries, partner independent bookstores, and curated regional institutional reading spaces.", class: "bento-span-1" },
            { icon: <Mic size={28} />, title: "Literary Events", desc: "Organizing full-scale book launch events, intimate community author-meets, panel reviews, and deep interactive reading sessions in highly visible public spaces.", class: "bento-span-2" },
            { icon: <GraduationCap size={28} />, title: "Educational Outreach", desc: "Nurturing the next generation of readers via curated school activities, interactive writing workshops, and child-centric storytelling circles.", class: "bento-span-1" },
            { icon: <Building2 size={28} />, title: "Book Fairs", desc: "Representing our independent community at prominent state, national, and international book expos with beautiful dedicated group pavilions.", class: "bento-span-2" },
          ].map((card, i) => (
            <FadeIn key={i} delay={i * 50}>
              <div className={`service-card ${card.class}`} style={{ background: "#fff", height: "100%", padding: "3rem", borderRadius: 24, border: "1px solid rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
                <div className="service-icon" style={{ width: 64, height: 64, background: "#f8fafc", color: "#0f172a", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2rem", transition: "all 0.3s ease" }}>
                  {card.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: "1rem", fontFamily: "var(--font-display)" }}>{card.title}</h3>
                  <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.7 }}>{card.desc}</p>
                </div>
                <div className="service-bg-hover" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(135deg, rgba(180,77,40,0.03) 0%, rgba(180,77,40,0) 100%)", opacity: 0, transition: "opacity 0.4s ease", pointerEvents: "none" }}></div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── ABOUT SECTION (DYNAMIC SPLIT) ── */}
      <section style={{ background: "#0f172a", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "20vw", fontWeight: 900, color: "rgba(255,255,255,0.02)", fontFamily: "var(--font-display)", whiteSpace: "nowrap", pointerEvents: "none" }}>ABOUT US</div>
        
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "8rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6rem", alignItems: "center" }} className="hero-grid">
          <FadeIn>
            <div style={{ position: "relative" }}>
              <img 
                src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=1000&fit=crop" 
                alt="Library glowing" 
                style={{ width: "90%", height: 600, objectFit: "cover", borderRadius: 24, boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}
              />
              <img 
                className="float-anim-slow"
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=600&fit=crop" 
                alt="Books detail" 
                style={{ position: "absolute", bottom: -40, right: -20, width: "50%", height: 350, objectFit: "cover", borderRadius: 24, border: "8px solid #0f172a", boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}
              />
            </div>
          </FadeIn>
          
          <FadeIn delay={200}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#b44d28", letterSpacing: "0.15em", marginBottom: "1rem", textTransform: "uppercase" }}>Our Story</div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 3.5vw, 4rem)", fontWeight: 800, color: "#fff", marginBottom: "2rem", lineHeight: 1.1 }}>Reviving the <br/>Culture of Reading</h2>
              <p style={{ fontSize: 17, color: "#94a3b8", lineHeight: 1.8, marginBottom: "2rem" }}>
                Founded in December 2024, the Pune Authors' Association was born out of a collective vision to democratize publishing for Indian writers. We operate as a modern collaborative ecosystem where independent authors gain access to high-tier professional production resources traditionally kept behind corporate publishing walls.
              </p>
              <p style={{ fontSize: 17, color: "#94a3b8", lineHeight: 1.8, marginBottom: "3rem" }}>
                By merging localized community touchpoints—like our bespoke airport lounges, library corners, and school storytelling initiatives—with powerful collective distribution, we seek to fundamentally revive reading cultures across all ages.
              </p>
              <Link to="/about" className="link-hover" style={{ fontSize: 15, fontWeight: 700, color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                Read Our Full Mission <ArrowRight size={16} color="#b44d28" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── PILLARS SECTION (INTERACTIVE ACCORDION-STYLE CARDS) ── */}
      <section style={{ background: "#fdfbf7", padding: "8rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "5rem" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#b44d28", letterSpacing: "0.15em", marginBottom: "1rem", textTransform: "uppercase" }}>Our Core Pillars</div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 800, color: "#0f172a" }}>What We Stand For</h2>
            </div>
          </FadeIn>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
            {[
              { num: "01", title: "We Publish", desc: "Elevating manuscript quality to standard industrial grade with zero artistic compromise." },
              { num: "02", title: "We Promote", desc: "Building strategic visibility footprints so good writing finds its targeted audience segment." },
              { num: "03", title: "We Sell", desc: "Securing reliable revenue funnels via dedicated independent physical and digital distribution points." },
              { num: "04", title: "We Revive", desc: "Breaking digital fatigue through localized community events and shared physical spaces." },
            ].map((p, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div className="pillar-card" style={{ background: "#fff", padding: "4rem 2rem", borderRadius: 24, border: "1px solid rgba(0,0,0,0.04)", position: "relative", overflow: "hidden", height: "100%", transition: "all 0.4s ease" }}>
                  <div className="pillar-num" style={{ position: "absolute", top: -20, right: -10, fontSize: "120px", fontWeight: 900, fontFamily: "var(--font-display)", color: "transparent", WebkitTextStroke: "2px #f1f5f9", transition: "all 0.4s ease", zIndex: 0 }}>{p.num}</div>
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <h3 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: "1rem", fontFamily: "var(--font-display)" }}>{p.title}</h3>
                    <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.7 }}>{p.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOOKS SECTION (UI ENHANCED) ── */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "6rem 1.5rem" }}>
        <FadeIn>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", flexWrap: "wrap", gap: "1.5rem" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#b44d28", letterSpacing: "0.15em", marginBottom: "1rem", textTransform: "uppercase" }}>Featured Collection</div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "3.5rem", fontWeight: 800, color: "#0f172a", margin: 0, lineHeight: 1.1 }}>Buy Our Books</h2>
            </div>
            <Link to="/catalogue" className="btn-hover" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#0f172a", color: "#fff", padding: "1rem 2rem", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              View Full Catalogue <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "3rem" }}>
            {[
              { label: "All Books", key: "All Books" },
              { label: "Non-Fiction", key: "Non-Fiction" },
              { label: "Fiction", key: "Fiction" },
              { label: "Children's", key: "Children's corner" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveGenre(tab.key)}
                style={{
                  background: activeGenre === tab.key ? "#0f172a" : "transparent",
                  color: activeGenre === tab.key ? "#fff" : "#64748b",
                  border: `2px solid ${activeGenre === tab.key ? "#0f172a" : "#e2e8f0"}`,
                  padding: "0.6rem 1.5rem", fontSize: 14, fontWeight: 700,
                  borderRadius: 100, cursor: "pointer", transition: "all 0.2s ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2.5rem" }}>
            {filteredGallery.slice(0, 4).map((book, i) => (
              <div
                key={i}
                className="book-card-hover"
                style={{ background: "#fff", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(0,0,0,0.04)", transition: "all 0.4s ease" }}
              >
                <div style={{ background: "#f8fafc", height: 320, position: "relative", overflow: "hidden", padding: "2rem" }}>
                  <img
                    src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${book.coverUrl}`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop"}
                    alt={book.title}
                    style={{ height: "100%", width: "100%", objectFit: "cover", borderRadius: 8, boxShadow: "0 20px 40px rgba(0,0,0,0.15)", transition: "transform 0.4s ease" }}
                    className="book-img"
                  />
                </div>
                <div style={{ padding: "2rem" }}>
                  <div style={{ fontSize: 11, color: "#b44d28", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                    {book.genre === "NF" ? "Non-Fiction" : book.genre === "F" ? "Fiction" : "Children's"}
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: "0.2rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.title}</h3>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: "1.5rem" }}>by {book.authorName}</div>
                  
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "1.5rem", borderTop: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-display)" }}>₹{book.mrp}</span>
                    <Link to="/catalogue" style={{ color: "#b44d28", fontWeight: 700, fontSize: 14, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                      Buy Now <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER STYLES ── */}
      <style>{`
        /* Global & Component Animations */
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        @keyframes floatSlow {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-25px); }
          100% { transform: translateY(0px); }
        }
        .float-anim { animation: float 6s ease-in-out infinite; }
        .float-anim-slow { animation: floatSlow 8s ease-in-out infinite; }

        /* Buttons */
        .btn-primary { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(180, 77, 40, 0.3); }
        
        .btn-secondary { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .btn-secondary:hover { background: #0f172a !important; color: #fff !important; transform: translateY(-3px); box-shadow: 0 15px 30px rgba(15, 23, 42, 0.2); }

        .btn-hover { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .btn-hover:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(15, 23, 42, 0.2); }

        .link-hover { position: relative; display: inline-flex; }
        .link-hover::after { content: ''; position: absolute; width: 100%; transform: scaleX(0); height: 2px; bottom: -4px; left: 0; background-color: #b44d28; transform-origin: bottom right; transition: transform 0.3s ease-out; }
        .link-hover:hover::after { transform: scaleX(1); transform-origin: bottom left; }

        /* Bento Grid */
        @media (min-width: 1024px) {
          .bento-grid { grid-template-columns: repeat(3, 1fr); }
          .bento-span-2 { grid-column: span 2; }
          .bento-span-1 { grid-column: span 1; }
        }
        .service-card { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .service-card:hover { transform: translateY(-8px); box-shadow: 0 30px 60px rgba(0,0,0,0.08); border-color: rgba(180,77,40,0.2); }
        .service-card:hover .service-icon { background: #b44d28; color: #fff; transform: scale(1.1) rotate(5deg); }
        .service-card:hover .service-bg-hover { opacity: 1; }

        /* Pillar Cards */
        .pillar-card:hover { transform: translateY(-8px); box-shadow: 0 30px 60px rgba(0,0,0,0.06); }
        .pillar-card:hover .pillar-num { color: rgba(180,77,40,0.05); WebkitTextStroke: 0; transform: scale(1.1) translate(-10px, 10px); }

        /* Book Cards */
        .book-card-hover:hover { transform: translateY(-10px); box-shadow: 0 40px 80px rgba(0,0,0,0.08); border-color: rgba(180,77,40,0.2); }
        .book-card-hover:hover .book-img { transform: scale(1.05) translateY(-5px); }

        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 3rem !important; }
        }
      `}</style>
    </main>
  );
}
"""

with open("c:/Users/arvin/Desktop/pune-authors-app/src/app/components/LandingPage.tsx", "w", encoding="utf-8") as f:
    f.write(landing_page_content)
print("Rewrote LandingPage.tsx with highly uniform, modern animations and designs.")
