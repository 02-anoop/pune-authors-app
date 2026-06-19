import { useState, useEffect } from "react";
import { Link } from "react-router";
import axios from "axios";
import { ArrowRight, Book, Megaphone, Store, Mic, GraduationCap, Building2, Mail, Phone, MapPin } from "lucide-react";

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
    <main style={{ fontFamily: "var(--font-body)", background: "#fafafa" }}>
      {/* Hero Section */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "4rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "4rem", alignItems: "center" }} className="hero-grid">
        <div>
          <div style={{ display: "inline-block", background: "#ffedd5", color: "#b44d28", padding: "0.4rem 1rem", borderRadius: 100, fontSize: 12, fontWeight: 700, marginBottom: "1.5rem", letterSpacing: "0.05em" }}>
            <span style={{ marginRight: 6 }}>●</span> Empowering Independent Indian Voices
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 5vw, 4.5rem)", fontWeight: 800, color: "#111827", lineHeight: 1.1, marginBottom: "1.5rem" }}>
            Publish, Promote <br/><span style={{ color: "#b44d28", fontStyle: "italic" }}>&</span> Sell Your Book
          </h1>
          <p style={{ fontSize: 16, color: "#4b5563", lineHeight: 1.6, marginBottom: "2.5rem", maxWidth: 480 }}>
            From raw manuscript to global marketplace—we provide independent authors with premium publishing assistance, strategic promotion, distribution setups, and highly engaging community spaces.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link to="/register" style={{ background: "#b44d28", color: "#fff", padding: "0.9rem 1.8rem", borderRadius: 4, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              Start Your Journey <ArrowRight size={16} />
            </Link>
            <Link to="/catalogue" style={{ background: "#f3f4f6", color: "#111827", padding: "0.9rem 1.8rem", borderRadius: 4, fontWeight: 600, textDecoration: "none" }}>
              Explore Our Catalogue
            </Link>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <img 
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop" 
            alt="Library Books" 
            style={{ width: "100%", borderRadius: 8, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
          />
        </div>
      </section>

      {/* Impact Stats */}
      <section style={{ borderTop: "1px solid rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#fff" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "3rem 1.5rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "2rem" }}>
          {[
            { num: "12+", label: "LITERARY EVENTS" },
            { num: "3+", label: "MAJOR FAIRS" },
            { num: "6", label: "AIRPORT LIBS" },
            { num: "100+", label: "AUTHORS JOINED" }
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: "center", flex: 1, minWidth: 150 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, color: "#111827", marginBottom: "0.2rem" }}>{stat.num}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.1em" }}>{stat.label}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", paddingBottom: "2.5rem", fontSize: 13, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.05em", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "1.5rem" }}>
          <span><span style={{color: "#b44d28"}}>✦</span> Established in December 2024</span>
          <span><span style={{color: "#b44d28"}}>✦</span> Publishing Support</span>
          <span><span style={{color: "#b44d28"}}>✦</span> Book Promotion</span>
          <span><span style={{color: "#b44d28"}}>✦</span> National Book Fairs</span>
          <span><span style={{color: "#b44d28"}}>✦</span> Airport Library Distribution</span>
        </div>
      </section>

      {/* Services Grid */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "6rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#b44d28", letterSpacing: "0.1em", marginBottom: "0.5rem", textTransform: "uppercase" }}>What We Do</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, color: "#111827" }}>Everything an Author Needs</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
          {[
            { icon: <Book size={20} color="#b44d28" />, title: "Publishing Services", desc: "End-to-end support including professional manuscript formatting, copyediting, structural review, tailored book cover illustrations, and ISBN procurement assistance." },
            { icon: <Megaphone size={20} color="#b44d28" />, title: "Promotion Services", desc: "Customized modern marketing solutions including social media campaign launches, high-reach digital assets, press release distributions, and individual author brand kits." },
            { icon: <Store size={20} color="#b44d28" />, title: "Distribution & Libraries", desc: "Direct shelf placements across our premium network of Airport Libraries, partner independent bookstores, and curated regional institutional reading spaces." },
            { icon: <Mic size={20} color="#b44d28" />, title: "Literary Events", desc: "Organizing full-scale book launch events, intimate community author-meets, panel reviews, and deep interactive reading sessions in highly visible public spaces." },
            { icon: <GraduationCap size={20} color="#b44d28" />, title: "Educational Outreach", desc: "Nurturing the next generation of readers via curated school activities, interactive writing workshops, and child-centric storytelling circles." },
            { icon: <Building2 size={20} color="#b44d28" />, title: "Book Fairs", desc: "Representing our independent community at prominent state, national, and international book expos with beautiful dedicated group pavilions." },
          ].map((card, i) => (
            <div key={i} style={{ background: "#fff", padding: "2.5rem", borderRadius: 8, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)" }}>
              <div style={{ width: 48, height: 48, background: "#ffedd5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
                {card.icon}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: "1rem" }}>{card.title}</h3>
              <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section style={{ background: "#fff", borderTop: "1px solid rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "6rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "5rem", alignItems: "center" }} className="hero-grid">
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: -24, top: 0, bottom: 0, width: 4, background: "#b44d28" }}></div>
            <img 
              src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=700&fit=crop" 
              alt="Library glowing" 
              style={{ width: "100%", height: 500, objectFit: "cover", borderRadius: 4 }}
            />
          </div>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, color: "#111827", marginBottom: "2rem" }}>About Pune Authors' Association</h2>
            <p style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              Founded in December 2024, the Pune Authors' Association was born out of a collective vision to democratize publishing for Indian writers. We operate as a modern collaborative ecosystem where independent authors gain access to high-tier professional production resources traditionally kept behind corporate publishing walls.
            </p>
            <p style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.7, marginBottom: "2rem" }}>
              By merging localized community touchpoints—like our bespoke airport lounges, library corners, and school storytelling initiatives—with powerful collective distribution, we seek to fundamentally revive reading cultures across all ages.
            </p>
            <Link to="/about" style={{ fontSize: 14, fontWeight: 700, color: "#b44d28", textDecoration: "none", borderBottom: "2px solid #b44d28", paddingBottom: "0.2rem" }}>
              Our Full Charter & Mission →
            </Link>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section style={{ background: "#111827", padding: "5rem 1.5rem", position: "relative" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#b44d28", letterSpacing: "0.1em", marginBottom: "0.5rem", textTransform: "uppercase" }}>Our Core Pillars</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, color: "#fff" }}>What We Stand For</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
            {[
              { title: "We Publish", desc: "Elevating manuscript quality to standard industrial grade with zero artistic compromise." },
              { title: "We Promote", desc: "Building strategic visibility footprints so good writing finds its targeted audience segment." },
              { title: "We Sell", desc: "Securing reliable revenue funnels via dedicated independent physical and digital distribution points." },
              { title: "We Revive Reading", desc: "Breaking digital fatigue through localized community events and shared physical spaces." },
            ].map((p, i) => (
              <div key={i} style={{ background: "#fff", padding: "2.5rem 1.5rem", textAlign: "center", borderRadius: 4 }}>
                <div style={{ width: 40, height: 40, border: "1.5px solid #b44d28", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                  <Book size={18} color="#b44d28" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: "1rem" }}>{p.title}</h3>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Books Preview — Featured Books / Buy Our Books */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "6rem 1.5rem" }}>
        {/* Section header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#b44d28", letterSpacing: "0.1em", marginBottom: "0.5rem", textTransform: "uppercase" }}>Featured Books</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, color: "#111827", margin: 0 }}>Buy Our Books</h2>
            <p style={{ fontSize: 14, color: "#6b7280", marginTop: "0.5rem" }}>Browse by category — Fiction, Non-Fiction &amp; Children's</p>
          </div>
          <Link to="/catalogue" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "#111827", color: "#fff", padding: "0.75rem 1.5rem", borderRadius: 6, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            View Full Catalogue →
          </Link>
        </div>

        {/* Category tabs */}
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          {[
            { label: "All Books", key: "All Books", icon: "📚", color: "#111827", bg: "#f3f4f6" },
            { label: "Non-Fiction", key: "Non-Fiction", icon: "📘", color: "#2563eb", bg: "#eff6ff" },
            { label: "Fiction", key: "Fiction", icon: "📖", color: "#db2777", bg: "#fdf2f8" },
            { label: "Children's", key: "Children's corner", icon: "🧒", color: "#16a34a", bg: "#f0fdf4" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveGenre(tab.key)}
              style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                background: activeGenre === tab.key ? tab.bg : "#fff",
                color: activeGenre === tab.key ? tab.color : "#4b5563",
                border: `2px solid ${activeGenre === tab.key ? tab.color : "#e5e7eb"}`,
                padding: "0.55rem 1.1rem", fontSize: 13, fontWeight: 700,
                borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
              }}
            >
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* Subcategory chips — shown when a specific category is selected */}
        {activeGenre === "Non-Fiction" && (
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            {["Spiritual/Self-Help", "Geopolitics", "Historical", "Biographies", "Short Stories"].map(sg => (
              <span key={sg} style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 20, padding: "0.25rem 0.75rem", fontSize: 11, fontWeight: 600 }}>{sg}</span>
            ))}
          </div>
        )}
        {activeGenre === "Fiction" && (
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            {["Romance", "Thriller", "Mysteries", "Sci-Fi", "Poetry"].map(sg => (
              <span key={sg} style={{ background: "#fdf2f8", color: "#db2777", border: "1px solid #fbcfe8", borderRadius: 20, padding: "0.25rem 0.75rem", fontSize: 11, fontWeight: 600 }}>{sg}</span>
            ))}
          </div>
        )}

        {/* Book cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "2rem" }}>
          {filteredGallery.slice(0, 4).map((book, i) => {
            const genreColor = book.genre === "NF" ? "#2563eb" : book.genre === "F" ? "#db2777" : "#16a34a";
            const genreBg = book.genre === "NF" ? "#eff6ff" : book.genre === "F" ? "#fdf2f8" : "#f0fdf4";
            const genreLabel = book.genre === "NF" ? "Non-Fiction" : book.genre === "F" ? "Fiction" : "Children's";
            return (
              <div
                key={i}
                style={{ background: "#fff", border: "1px solid #f3f4f6", borderRadius: 10, overflow: "hidden", transition: "box-shadow 0.2s, transform 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
              >
                <div style={{ background: "#f7f7f9", height: 260, position: "relative", overflow: "hidden" }}>
                  <img
                    src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${book.coverUrl}`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=280&fit=crop"}
                    alt={book.title}
                    style={{ height: "100%", width: "100%", objectFit: "cover" }}
                  />
                  <div style={{ position: "absolute", top: 10, left: 10, background: genreBg, color: genreColor, fontSize: 10, fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: 6 }}>
                    {genreLabel}
                  </div>
                </div>
                <div style={{ padding: "1.25rem" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: "0.2rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.title}</h3>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>by {book.authorName}</div>
                  <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginBottom: "1.25rem", height: 38, overflow: "hidden" }}>
                    {book.description || book.synopsis || "A captivating read from a PAA author."}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>₹{book.mrp}</span>
                    <Link to="/catalogue" style={{ background: "#b44d28", color: "#fff", padding: "0.5rem 1rem", borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                      Buy Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredGallery.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem", color: "#9ca3af" }}>
            <p style={{ fontSize: 15 }}>No books in this category yet. <Link to="/catalogue" style={{ color: "#b44d28" }}>Browse full catalogue →</Link></p>
          </div>
        )}
      </section>

      {/* Contact Section */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "6rem 1.5rem" }} id="contact">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start" }} className="contact-grid">
          
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#b44d28", letterSpacing: "0.1em", marginBottom: "0.5rem", textTransform: "uppercase" }}>Reach Out</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, color: "#111827", marginBottom: "1rem" }}>Get in Touch</h2>
            <p style={{ fontSize: 16, color: "#4b5563", marginBottom: "2.5rem", lineHeight: 1.6 }}>
              Whether you're an aspiring author looking to publish, a reader with an inquiry, or an institution looking to partner, we'd love to hear from you.
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#ffedd5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <MapPin size={20} color="#b44d28" />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: "0.2rem" }}>Headquarters</h3>
                  <p style={{ fontSize: 14, color: "#6b7280" }}>101 Literary Avenue, Koregaon Park<br/>Pune, Maharashtra 411001</p>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#ffedd5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Mail size={20} color="#b44d28" />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: "0.2rem" }}>Email Us</h3>
                  <p style={{ fontSize: 14, color: "#6b7280" }}>info@puneauthorsassociation.org</p>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#ffedd5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Phone size={20} color="#b44d28" />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: "0.2rem" }}>Call Us</h3>
                  <p style={{ fontSize: 14, color: "#6b7280" }}>+91 79770 97397</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", padding: "2.5rem", borderRadius: 8, boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: "1.5rem" }}>Send a Message</h3>
            <form style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }} onSubmit={async (e) => { 
              e.preventDefault(); 
              setIsSubmitting(true);
              try {
                // 1. Send to Web3Forms directly from the browser to bypass Cloudflare bot protection
                await axios.post("https://api.web3forms.com/submit", {
                  access_key: "33505130-94ba-420a-a7b7-f383970343e4",
                  name: contactName,
                  email: contactEmail,
                  message: contactMessage,
                  subject: "New Inquiry from Pune Authors Association"
                });

                // 2. Save to local database
                await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:3001")}/api/contact`, { name: contactName, email: contactEmail, message: contactMessage });
                
                alert("Message Sent successfully!");
                setContactName("");
                setContactEmail("");
                setContactMessage("");
              } catch (err) {
                alert("Failed to send message. Please try again.");
              } finally {
                setIsSubmitting(false);
              }
            }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: "0.4rem" }}>Name *</label>
                <input required value={contactName} onChange={(e) => setContactName(e.target.value)} type="text" style={{ width: "100%", padding: "0.75rem", border: "1px solid #e5e7eb", borderRadius: 4, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: "0.4rem" }}>Email Address *</label>
                <input required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" style={{ width: "100%", padding: "0.75rem", border: "1px solid #e5e7eb", borderRadius: 4, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: "0.4rem" }}>Message *</label>
                <textarea required value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} rows={4} style={{ width: "100%", padding: "0.75rem", border: "1px solid #e5e7eb", borderRadius: 4, boxSizing: "border-box", resize: "vertical" }}></textarea>
              </div>
              <button disabled={isSubmitting} type="submit" style={{ background: "#b44d28", color: "#fff", padding: "0.85rem", border: "none", borderRadius: 4, fontWeight: 600, fontSize: 14, cursor: isSubmitting ? "not-allowed" : "pointer", marginTop: "0.5rem", opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? "Sending..." : "Submit Inquiry"}
              </button>
            </form>
          </div>

        </div>
      </section>


      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
