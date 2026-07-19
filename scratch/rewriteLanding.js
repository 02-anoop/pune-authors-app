const fs = require('fs');

const path = 'src/app/components/LandingPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find the start of the return statement
const returnIndex = content.indexOf('  return (\n    <main');

if (returnIndex === -1) {
    console.log("Could not find return statement in LandingPage.tsx");
    process.exit(1);
}

const beforeReturn = content.slice(0, returnIndex);

const newReturn = `  return (
    <main style={{ fontFamily: "var(--font-body)", background: "#0a0a0a", color: "#fff", overflowX: "hidden" }}>
      
      {/* ════════════════════════════════════════════
          HERO — VIBRANT GRADIENT MESH & GLOW
      ════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "90vh", display: "flex", alignItems: "center", overflow: "hidden", background: "#000" }}>
        {/* Animated Orbs */}
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "60vw", height: "60vw", background: "radial-gradient(circle, rgba(255,122,0,0.3) 0%, rgba(255,122,0,0) 70%)", filter: "blur(80px)", zIndex: 0, animation: "float 10s infinite alternate ease-in-out" }}></div>
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(123,97,255,0.3) 0%, rgba(123,97,255,0) 70%)", filter: "blur(80px)", zIndex: 0, animation: "float 12s infinite alternate-reverse ease-in-out" }}></div>
        
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center", position: "relative", zIndex: 10 }}>
          {/* LEFT SIDE */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <FadeIn>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", padding: "0.5rem 1rem", borderRadius: 50, marginBottom: "2rem", border: "1px solid rgba(255,255,255,0.2)" }}>
                 <Sparkles size={16} color="#FFD400" />
                 <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>Pune Authors' Association</span>
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 5vw, 4.5rem)", fontWeight: 900, color: "#fff", lineHeight: 1.05, marginBottom: "1.5rem", letterSpacing: "-0.03em" }}>
                {(() => {
                  const title = stats.landingConfig?.heroTitle || "Helping indie authors publish, promote and sell.";
                  const highlight = (stats.landingConfig?.heroHighlight || "authors").trim();
                  if (!highlight) return title;
                  const parts = title.split(new RegExp(\`(\${highlight.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&')})\`, 'gi'));
                  return parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase()
                      ? <span key={i} style={{ color: "transparent", WebkitTextStroke: "1px #FF7A00", backgroundImage: "linear-gradient(45deg, #FF7A00, #FFD400)", WebkitBackgroundClip: "text", textShadow: "0 0 40px rgba(255,122,0,0.5)" }}>{part}</span>
                      : part
                  );
                })()}
              </h1>
              <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: "2.5rem", maxWidth: 500, fontWeight: 400 }}>
                {stats.landingConfig?.heroSubtitle || "We provide independent authors with refined publishing assistance, strategic promotion, and curated distribution channels."}
              </p>

              <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 50, padding: "0.4rem", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "2rem", maxWidth: 440, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
                <input
                  type="text"
                  placeholder="Search your next favorite book..."
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(\`/catalogue?search=\${heroSearch}\`)}
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "0 1.5rem", fontSize: 16, color: "#fff" }}
                />
                <button
                  onClick={() => navigate(\`/catalogue?search=\${heroSearch}\`)}
                  style={{ background: "linear-gradient(135deg, #FF7A00, #FF3D00)", color: "#fff", border: "none", width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  <Search size={20} />
                </button>
              </div>

              <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                <Link to="/catalogue" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#fff", color: "#000", padding: "1.2rem 3rem", fontSize: 15, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", textDecoration: "none", borderRadius: 50, transition: "all 0.3s ease" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>Explore Catalogue</Link>
              </div>
            </FadeIn>
          </div>

          {/* RIGHT SIDE - FLOATING CAROUSEL */}
          <div style={{ position: "relative", height: "600px", display: "flex", alignItems: "center", justifyContent: "center", perspective: "1000px" }}>
              <div style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "30px", overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)", transform: "rotateY(-5deg) rotateX(5deg)", transition: "transform 0.5s ease" }}>
                <div style={{ display: "flex", width: \`\${totalSlides * 100}%\`, height: "100%", transform: \`translateX(-\${currentSlide * (100 / totalSlides)}%)\`, transition: "transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)" }}>
                  {carouselImages.map((img, idx) => (
                    <div key={idx} style={{ width: \`\${100 / totalSlides}%\`, height: "100%", position: "relative" }}>
                      <img src={img.url.startsWith('http') ? img.url : \`\${import.meta.env.VITE_API_URL || 'http://localhost:3001'}\${img.url.startsWith('/') ? img.url : '/' + img.url}\`} alt="Gallery" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }}></div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ position: "absolute", bottom: "-20px", display: "flex", gap: "0.5rem", zIndex: 20 }}>
                {Array.from({ length: totalSlides }).map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentSlide(idx)} style={{ width: currentSlide === idx ? 30 : 10, height: 10, borderRadius: 5, background: currentSlide === idx ? "#FF7A00" : "rgba(255,255,255,0.3)", border: "none", padding: 0, cursor: "pointer", transition: "all 0.3s ease" }} />
                ))}
              </div>
          </div>
        </div>
        {/* Bottom Curve Separator */}
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", overflow: "hidden", lineHeight: 0 }}>
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px", transform: "rotate(180deg)" }}>
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C73.66,28.61,154.5,60.67,239.3,66.69,267.43,68.7,294.63,61.4,321.39,56.44Z" fill="#111111"></path>
            </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          NEW RELEASES — MAGZINE LAYOUT (DARK)
      ════════════════════════════════════════════ */}
      {galleryItems.length > 0 && (
      <section style={{ background: "#111", padding: "6rem 2rem", position: "relative", zIndex: 1 }} id="buy-books">
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "4rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                   <div style={{ width: 40, height: 2, background: "#00D084" }}></div>
                   <span style={{ fontSize: 14, fontWeight: 700, color: "#00D084", textTransform: "uppercase", letterSpacing: "0.2em" }}>Fresh Arrivals</span>
                </div>
                <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 900, color: "#fff", fontFamily: "var(--font-display)", margin: 0, letterSpacing: "-0.02em" }}>New Releases</h2>
              </div>
              <Link to="/catalogue" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#00D084", fontWeight: 700, textDecoration: "none", fontSize: 15, textTransform: "uppercase", letterSpacing: "0.05em" }} onMouseEnter={e => e.currentTarget.style.transform = "translateX(5px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateX(0)"} className="hover-transition">
                See All <ArrowRight size={18} />
              </Link>
            </div>
            
            <div style={{ display: "flex", gap: "2rem", overflowX: "auto", paddingBottom: "2rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
              {[...galleryItems].reverse().slice(0, 8).map((book, i) => (
                <Link key={i} to={\`/book/\${book.id}\`} style={{ flex: "0 0 280px", display: "flex", flexDirection: "column", textDecoration: "none", group: "true", position: "relative" }}>
                  <div style={{ width: "100%", aspectRatio: "2/3", borderRadius: "16px", overflow: "hidden", marginBottom: "1.5rem", background: "#222", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }} className="hover-lift">
                    <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : \`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}\${book.coverUrl}\`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300"} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} className="hover-zoom" />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)", opacity: 0, transition: "opacity 0.3s ease", display: "flex", alignItems: "center", justifyContent: "center" }} className="hover-fade-in">
                       <div style={{ padding: "0.8rem 1.5rem", background: "#00D084", color: "#000", fontWeight: 800, borderRadius: 50, textTransform: "uppercase", fontSize: 12, letterSpacing: "0.1em", transform: "translateY(20px)", transition: "transform 0.3s ease" }} className="hover-slide-up">View Details</div>
                    </div>
                  </div>
                  <h4 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: "0 0 0.5rem 0", lineHeight: 1.3, fontFamily: "var(--font-display)" }}>{book.title}</h4>
                  <p style={{ fontSize: 14, color: "#888", margin: "0 0 1rem 0" }}>By {book.authorName}</p>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#00D084" }}>{book.mrp != null ? \`₹\${book.mrp}\` : book.mrpRaw || "Price TBD"}</div>
                </Link>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>
      )}

      {/* ════════════════════════════════════════════
          FICTION — WARM ELEGANT SECTION
      ════════════════════════════════════════════ */}
      {galleryItems.filter(b => b.genre === "F").length > 0 && (
      <section style={{ background: "#FF7A00", padding: "6rem 2rem", position: "relative" }}>
        {/* Abstract Background Shapes */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%", overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
            <div style={{ position: "absolute", top: "-10%", right: "-5%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)", filter: "blur(40px)" }}></div>
            <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,212,0,0.3) 0%, rgba(255,212,0,0) 70%)", filter: "blur(60px)" }}></div>
        </div>
        
        <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <FadeIn delay={100}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "4rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 60, height: 60, background: "#fff", borderRadius: 20, marginBottom: "1.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", transform: "rotate(-10deg)" }}>
                 <Feather size={28} color="#FF7A00" />
              </div>
              <h2 style={{ fontSize: "clamp(3rem, 5vw, 4rem)", fontWeight: 900, color: "#fff", fontFamily: "var(--font-display)", margin: "0 0 1rem 0", letterSpacing: "-0.02em" }}>Immersive Fiction</h2>
              <p style={{ fontSize: 18, color: "rgba(255,255,255,0.9)", maxWidth: 600 }}>Lose yourself in worlds woven by our finest storytellers.</p>
            </div>
            
            <div style={{ display: "flex", gap: "2rem", overflowX: "auto", paddingBottom: "2rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
              {galleryItems.filter(b => b.genre === "F").slice(0, 8).map((book, i) => (
                <Link key={i} to={\`/book/\${book.id}\`} style={{ flex: "0 0 240px", display: "flex", flexDirection: "column", textDecoration: "none", background: "#fff", padding: "1rem", borderRadius: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", transform: "translateY(0)", transition: "transform 0.3s ease, box-shadow 0.3s ease" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-10px)"; e.currentTarget.style.boxShadow = "0 30px 60px rgba(0,0,0,0.25)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)"; }}>
                  <div style={{ width: "100%", aspectRatio: "3/4", borderRadius: "16px", overflow: "hidden", marginBottom: "1.5rem", background: "#f5f5f5" }}>
                    <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : \`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}\${book.coverUrl}\`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300"} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: "0 0.5rem 0.5rem" }}>
                    <h4 style={{ fontSize: 16, fontWeight: 800, color: "#111", margin: "0 0 0.4rem 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.title}</h4>
                    <p style={{ fontSize: 13, color: "#666", margin: "0 0 1rem 0" }}>{book.authorName}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#FF7A00" }}>{book.mrp != null ? \`₹\${book.mrp}\` : book.mrpRaw || "Price TBD"}</div>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowRight size={14} color="#111" /></div>
                    </div>
                  </div>
                </Link>
              ))}
              {galleryItems.filter(b => b.genre === "F").length > 8 && (
                 <div style={{ flex: "0 0 240px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Link to="/catalogue?category=Fiction" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", color: "#fff", textDecoration: "none", fontWeight: 700 }}>
                       <div style={{ width: 80, height: 80, borderRadius: "50%", border: "2px dashed rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }} onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#FF7A00"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }}>
                         <ArrowRight size={24} />
                       </div>
                       View Entire Collection
                    </Link>
                 </div>
              )}
            </div>
          </FadeIn>
        </div>
      </section>
      )}

      {/* ════════════════════════════════════════════
          NON-FICTION — CLEAN EDITORIAL SECTION
      ════════════════════════════════════════════ */}
      {galleryItems.filter(b => b.genre === "NF").length > 0 && (
      <section style={{ background: "#FAFAFA", padding: "6rem 2rem", position: "relative" }}>
        {/* Grid Background */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(#eaeaea 1px, transparent 1px), linear-gradient(90deg, #eaeaea 1px, transparent 1px)", backgroundSize: "40px 40px", opacity: 0.5, pointerEvents: "none" }}></div>
        
        <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <FadeIn delay={200}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4rem" }}>
              <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 900, color: "#0033FF", fontFamily: "var(--font-display)", margin: 0, letterSpacing: "-0.03em" }}>Knowledge &<br/>Non-Fiction</h2>
              <Link to="/catalogue?category=Non-Fiction" style={{ background: "#0033FF", color: "#fff", padding: "1rem 2.5rem", borderRadius: 50, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", textDecoration: "none", fontSize: 13, transition: "background 0.3s" }} onMouseEnter={e => e.currentTarget.style.background = "#0022AA"} onMouseLeave={e => e.currentTarget.style.background = "#0033FF"}>
                View All
              </Link>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" }}>
              {galleryItems.filter(b => b.genre === "NF").slice(0, 8).map((book, i) => (
                <Link key={i} to={\`/book/\${book.id}\`} style={{ display: "flex", gap: "1.5rem", background: "#fff", padding: "1.5rem", border: "1px solid #eaeaea", borderRadius: 16, textDecoration: "none", transition: "all 0.3s ease" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,51,255,0.08)"; e.currentTarget.style.borderColor = "#0033FF"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#eaeaea"; }}>
                  <div style={{ flex: "0 0 100px", aspectRatio: "3/4", borderRadius: 8, overflow: "hidden", background: "#f5f5f5" }}>
                    <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : \`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}\${book.coverUrl}\`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300"} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <h4 style={{ fontSize: 16, fontWeight: 800, color: "#111", margin: "0 0 0.4rem 0", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{book.title}</h4>
                    <p style={{ fontSize: 13, color: "#666", margin: "0 0 1rem 0" }}>{book.authorName}</p>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0033FF" }}>{book.mrp != null ? \`₹\${book.mrp}\` : book.mrpRaw || "Price TBD"}</div>
                  </div>
                </Link>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>
      )}

      {/* ════════════════════════════════════════════
          CHILDREN'S CORNER — PLAYFUL, YELLOW/SKY BLUE
      ════════════════════════════════════════════ */}
      {galleryItems.filter(b => b.genre === "C").length > 0 && (
      <section style={{ background: "#FFD400", padding: "8rem 2rem", position: "relative", overflow: "hidden" }}>
        {/* Soft Blobs and Clouds */}
        <div style={{ position: "absolute", top: "-50px", left: "10%", width: "200px", height: "200px", background: "#00C2FF", borderRadius: "50%", filter: "blur(40px)", opacity: 0.5, pointerEvents: "none" }}></div>
        <div style={{ position: "absolute", bottom: "-100px", right: "5%", width: "300px", height: "300px", background: "#FF6B6B", borderRadius: "50%", filter: "blur(60px)", opacity: 0.5, pointerEvents: "none" }}></div>
        
        <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <FadeIn delay={300}>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <div style={{ display: "inline-flex", background: "#00C2FF", padding: "1rem 2rem", borderRadius: "40px", transform: "rotate(-3deg)", boxShadow: "5px 5px 0 #111", marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, color: "#fff", fontFamily: "var(--font-display)", margin: 0, letterSpacing: "2px", textTransform: "uppercase" }}>Children's Corner</h2>
              </div>
              <p style={{ fontSize: 20, color: "#111", fontWeight: 700 }}>Colorful stories for young, imaginative minds.</p>
            </div>
            
            <div style={{ display: "flex", gap: "2rem", overflowX: "auto", paddingBottom: "2rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
              {galleryItems.filter(b => b.genre === "C").slice(0, 8).map((book, i) => (
                <Link key={i} to={\`/book/\${book.id}\`} style={{ flex: "0 0 220px", display: "flex", flexDirection: "column", textDecoration: "none", background: "#fff", borderRadius: "30px", padding: "1.2rem", boxShadow: "8px 8px 0 #00C2FF", transform: "translateY(0) translateX(0)", transition: "all 0.2s ease" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px) translateX(-5px)"; e.currentTarget.style.boxShadow = "13px 13px 0 #00C2FF"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) translateX(0)"; e.currentTarget.style.boxShadow = "8px 8px 0 #00C2FF"; }}>
                  <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: "20px", overflow: "hidden", marginBottom: "1rem", background: "#f5f5f5", border: "2px solid #111" }}>
                    <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : \`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}\${book.coverUrl}\`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300"} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <h4 style={{ fontSize: 16, fontWeight: 900, color: "#111", margin: "0 0 0.2rem 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.title}</h4>
                  <p style={{ fontSize: 13, color: "#666", margin: "0 0 0.8rem 0", fontWeight: 600 }}>{book.authorName}</p>
                  <div style={{ background: "#FF6B6B", color: "#fff", padding: "0.5rem", borderRadius: "12px", textAlign: "center", fontWeight: 800, fontSize: 14 }}>
                    {book.mrp != null ? \`₹\${book.mrp}\` : book.mrpRaw || "Price TBD"}
                  </div>
                </Link>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>
      )}

      {/* ════════════════════════════════════════════
          LANGUAGES SECTION — VIBRANT GRIDS
      ════════════════════════════════════════════ */}
      {availableLanguages.length > 0 && (
      <section style={{ background: "#000", padding: "6rem 2rem", color: "#fff", position: "relative" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "4rem" }}>
                <div>
                  <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 900, color: "#fff", fontFamily: "var(--font-display)", margin: 0, letterSpacing: "-0.02em" }}>Discover by Language</h2>
                  <p style={{ color: "#888", fontSize: 18, marginTop: "1rem" }}>Literature spanning across borders and cultures.</p>
                </div>
                {languageDrilldown ? (
                  <button onClick={() => setLanguageDrilldown(null)} style={{ fontSize: 14, fontWeight: 800, color: "#FF4FA3", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", textTransform: "uppercase" }}>
                    <ArrowLeft size={16} /> Go Back
                  </button>
                ) : (
                  <Link to="/catalogue" style={{ fontSize: 14, fontWeight: 800, color: "#FF4FA3", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem", textTransform: "uppercase" }}>
                    All Languages <ArrowRight size={16} />
                  </Link>
                )}
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem" }}>
                {(() => {
                  const indianLangs = ["Hindi", "English", "Marathi", "Sanskrit", "Tamil", "Telugu", "Kannada", "Malayalam", "Gujarati", "Bengali", "Punjabi", "Urdu", "Odia", "Assamese", "Maithili", "Bhojpuri"];
                  const safeParam = (l) => l.searchParam ? l.searchParam.toLowerCase() : "";
                  const otherRegional = availableLanguages.filter(l => safeParam(l) !== "english" && safeParam(l) !== "hindi" && indianLangs.some(ind => ind.toLowerCase() === safeParam(l)));
                  const foreign = availableLanguages.filter(l => safeParam(l) !== "english" && safeParam(l) !== "hindi" && !indianLangs.some(ind => ind.toLowerCase() === safeParam(l)) && l.name !== "Others");

                  const renderCard = (to, letter, title, sub, bg, color) => (
                    <Link to={to} style={{ background: "#111", border: \`1px solid \${bg}\`, borderRadius: "20px", padding: "2rem 1.5rem", textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", transition: "all 0.3s ease", position: "relative", overflow: "hidden" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.background = bg; e.currentTarget.querySelector('h4').style.color = "#000"; e.currentTarget.querySelector('p').style.color = "rgba(0,0,0,0.6)"; e.currentTarget.querySelector('.letter-bg').style.background = "#fff"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "#111"; e.currentTarget.querySelector('h4').style.color = "#fff"; e.currentTarget.querySelector('p').style.color = "#888"; e.currentTarget.querySelector('.letter-bg').style.background = "rgba(255,255,255,0.05)"; }}>
                        <div className="letter-bg" style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 900, color: color, marginBottom: "1.5rem", transition: "background 0.3s" }}>{letter}</div>
                        <h4 style={{ margin: "0 0 0.5rem 0", fontSize: 20, fontWeight: 800, color: "#fff", transition: "color 0.3s" }}>{title}</h4>
                        <p style={{ margin: 0, fontSize: 12, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", transition: "color 0.3s" }}>{sub}</p>
                    </Link>
                  );

                  if (languageDrilldown === "Others") {
                    return otherRegional.length > 0 ? otherRegional.map((l, i) => renderCard(\`/catalogue?search=\${l.searchParam}\`, l.letter, l.name, "Explore", l.bg, l.color)) : <p>No other regional books available.</p>;
                  }

                  if (languageDrilldown === "Foreign") {
                    return foreign.length > 0 ? foreign.map((l, i) => renderCard(\`/catalogue?search=\${l.searchParam}\`, l.letter, l.name, "Explore", l.bg, l.color)) : <p>No foreign books available.</p>;
                  }

                  return (
                    <>
                      {renderCard("/catalogue?search=English", "E", "English", "Explore Books", "#FFD400", "#FF7A00")}
                      {renderCard("/catalogue?search=Hindi", "H", "Hindi", "Explore Books", "#00D084", "#00C2FF")}
                      <div onClick={() => setLanguageDrilldown("Others")} style={{ background: "#111", border: \`1px solid #7B61FF\`, borderRadius: "20px", padding: "2rem 1.5rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", transition: "all 0.3s ease", cursor: "pointer" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.background = "#7B61FF"; e.currentTarget.querySelector('h4').style.color = "#000"; e.currentTarget.querySelector('p').style.color = "rgba(0,0,0,0.6)"; e.currentTarget.querySelector('.letter-bg').style.background = "#fff"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "#111"; e.currentTarget.querySelector('h4').style.color = "#fff"; e.currentTarget.querySelector('p').style.color = "#888"; e.currentTarget.querySelector('.letter-bg').style.background = "rgba(255,255,255,0.05)"; }}>
                          <div className="letter-bg" style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 900, color: "#7B61FF", marginBottom: "1.5rem", transition: "background 0.3s" }}>O</div>
                          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: 20, fontWeight: 800, color: "#fff", transition: "color 0.3s" }}>Others</h4>
                          <p style={{ margin: 0, fontSize: 12, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", transition: "color 0.3s" }}>Regional Languages</p>
                      </div>
                      {foreign.length > 0 && (
                        <div onClick={() => setLanguageDrilldown("Foreign")} style={{ background: "#111", border: \`1px solid #FF4FA3\`, borderRadius: "20px", padding: "2rem 1.5rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", transition: "all 0.3s ease", cursor: "pointer" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.background = "#FF4FA3"; e.currentTarget.querySelector('h4').style.color = "#000"; e.currentTarget.querySelector('p').style.color = "rgba(0,0,0,0.6)"; e.currentTarget.querySelector('.letter-bg').style.background = "#fff"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "#111"; e.currentTarget.querySelector('h4').style.color = "#fff"; e.currentTarget.querySelector('p').style.color = "#888"; e.currentTarget.querySelector('.letter-bg').style.background = "rgba(255,255,255,0.05)"; }}>
                          <div className="letter-bg" style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 900, color: "#FF4FA3", marginBottom: "1.5rem", transition: "background 0.3s" }}>F</div>
                          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: 20, fontWeight: 800, color: "#fff", transition: "color 0.3s" }}>Foreign</h4>
                          <p style={{ margin: 0, fontSize: 12, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", transition: "color 0.3s" }}>International</p>
                      </div>
                      )}
                    </>
                  );
                })()}
              </div>
          </div>
      </section>
      )}

      {/* ════════════════════════════════════════════
          CONTACT & INQUIRY — MINIMALIST GLOW
      ════════════════════════════════════════════ */}
      <section style={{ background: "#0a0a0a", padding: "8rem 2rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: "-20%", left: "50%", transform: "translateX(-50%)", width: "100%", height: "500px", background: "radial-gradient(ellipse, rgba(0,194,255,0.15) 0%, rgba(0,0,0,0) 70%)", zIndex: 0 }}></div>
        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 10, textAlign: "center" }}>
          <FadeIn>
            <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 900, color: "#fff", fontFamily: "var(--font-display)", margin: "0 0 1rem 0" }}>Got Questions?</h2>
            <p style={{ fontSize: 18, color: "#888", marginBottom: "3rem" }}>We're here to help you publish, promote, or explore literature.</p>
            
            <form onSubmit={async (e) => { e.preventDefault(); setIsSubmitting(true); try { await axios.post(\`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/inquiries\`, { name: contactName, email: contactEmail, message: contactMessage }); toast.success("Inquiry sent successfully!"); setContactName(""); setContactEmail(""); setContactMessage(""); } catch (err) { toast.error("Failed to send inquiry."); } finally { setIsSubmitting(false); } }} style={{ background: "#111", padding: "3rem", borderRadius: "30px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "left", boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Your Name</label>
                  <input required value={contactName} onChange={(e) => setContactName(e.target.value)} type="text" style={{ width: "100%", padding: "1rem", background: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", outline: "none", color: "#fff", fontSize: 16 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Email Address</label>
                  <input required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" style={{ width: "100%", padding: "1rem", background: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", outline: "none", color: "#fff", fontSize: 16 }} />
                </div>
              </div>
              <div style={{ marginBottom: "2rem" }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Message</label>
                <textarea required value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} rows={4} style={{ width: "100%", padding: "1rem", background: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", outline: "none", color: "#fff", fontSize: 16, resize: "none" }} />
              </div>
              <button disabled={isSubmitting} type="submit" style={{ width: "100%", background: "#00C2FF", color: "#000", border: "none", padding: "1.2rem", fontSize: 16, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", borderRadius: "12px", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1, transition: "background 0.3s" }} onMouseEnter={e => e.currentTarget.style.background = "#00A0D6"} onMouseLeave={e => e.currentTarget.style.background = "#00C2FF"}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </FadeIn>
        </div>
      </section>

      {/* ── STYLES ── */}
      <style>{\`
        .hover-lift:hover { transform: translateY(-10px); }
        .hover-zoom:hover { transform: scale(1.05); }
        .group:hover .hover-fade-in { opacity: 1 !important; }
        .group:hover .hover-slide-up { transform: translateY(0) !important; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-30px) rotate(10deg); }
        }
      \`}</style>
    </main>
  );
}
`;

fs.writeFileSync(path, beforeReturn + newReturn);
console.log("LandingPage.tsx updated successfully.");
