const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/components/LandingPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const returnMatch = content.match(/  return \(\r?\n    <main/);
if (!returnMatch) {
    console.log("Could not find return statement in LandingPage.tsx");
    process.exit(1);
}

const beforeReturn = content.slice(0, returnMatch.index);

const newReturn = `  return (
    <main style={{ fontFamily: "'Google Sans', sans-serif", background: "#fff", color: "#111", overflowX: "hidden" }}>
      {/* Google Font Injection */}
      <style>{\`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap');
        .hover-lift:hover { transform: translateY(-5px); }
        .hover-zoom:hover { transform: scale(1.08); }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.3); }
        h1, h2, h3, h4, h5, h6 { font-family: 'Playfair Display', serif !important; }
        
        .bg-mesh {
          background-color: transparent;
          background-image: radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .bg-mesh-light {
          background-color: transparent;
          background-image: radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      \`}</style>

      {/* ════════════════════════════════════════════
          HERO — CLEAN & BRIGHT
      ════════════════════════════════════════════ */}
      <section className="bg-mesh" style={{ position: "relative", minHeight: "80vh", display: "flex", alignItems: "center", overflow: "hidden", backgroundColor: "#f8f9fa" }}>
        {/* Soft colorful blobs */}
        <div style={{ position: "absolute", top: "-10%", left: "-5%", width: "40vw", height: "40vw", background: "radial-gradient(circle, rgba(255,122,0,0.1) 0%, rgba(255,122,0,0) 70%)", filter: "blur(40px)", zIndex: 0 }}></div>
        <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: "30vw", height: "30vw", background: "radial-gradient(circle, rgba(0,51,255,0.08) 0%, rgba(0,51,255,0) 70%)", filter: "blur(40px)", zIndex: 0 }}></div>
        
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "4rem 2rem", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "4rem", alignItems: "center", position: "relative", zIndex: 10 }}>
          {/* LEFT SIDE */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <FadeIn>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#fff", padding: "0.5rem 1rem", borderRadius: 50, marginBottom: "2rem", border: "1px solid #eaeaea", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
                 <Sparkles size={16} color="#FF7A00" />
                 <span style={{ fontSize: 13, fontWeight: 700, color: "#111", letterSpacing: "0.1em", textTransform: "uppercase" }}>Pune Authors' Association</span>
              </div>
              <h1 style={{ fontSize: "clamp(3rem, 5vw, 4.5rem)", fontWeight: 900, color: "#111", lineHeight: 1.1, marginBottom: "1.5rem", letterSpacing: "-0.03em" }}>
                Helping indie <span style={{ color: "#FF7A00" }}>authors</span> publish, promote and sell.
              </h1>
              <p style={{ fontSize: 18, color: "#666", lineHeight: 1.6, marginBottom: "2.5rem", maxWidth: 500, fontWeight: 500 }}>
                {stats.landingConfig?.heroSubtitle || "We provide independent authors with refined publishing assistance, strategic promotion, and curated distribution channels."}
              </p>

              <div style={{ display: "flex", background: "#fff", borderRadius: 50, padding: "0.4rem", border: "1px solid #eaeaea", marginBottom: "2rem", maxWidth: 440, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                <input
                  type="text"
                  placeholder="Search your next favorite book..."
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(\`/catalogue?search=\${heroSearch}\`)}
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "0 1.5rem", fontSize: 16, color: "#111", fontFamily: "inherit" }}
                />
                <button
                  onClick={() => navigate(\`/catalogue?search=\${heroSearch}\`)}
                  style={{ background: "#FF7A00", color: "#fff", border: "none", width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  <Search size={20} />
                </button>
              </div>

              <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                <Link to="/catalogue" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#111", color: "#fff", padding: "1.2rem 3rem", fontSize: 15, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", textDecoration: "none", borderRadius: 50, transition: "all 0.3s ease" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>Explore Catalogue</Link>
              </div>
            </FadeIn>
          </div>

          {/* RIGHT SIDE - CAROUSEL */}
          <div style={{ position: "relative", height: "500px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "30px", overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,0.1)", background: "#fff" }}>
                <div style={{ display: "flex", width: \`\${totalSlides * 100}%\`, height: "100%", transform: \`translateX(-\${currentSlide * (100 / totalSlides)}%)\`, transition: "transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)" }}>
                  {carouselImages.map((img, idx) => (
                    <div key={idx} style={{ width: \`\${100 / totalSlides}%\`, height: "100%", position: "relative" }}>
                      <img src={img.url.startsWith('http') ? img.url : \`\${import.meta.env.VITE_API_URL || 'http://localhost:3001'}\${img.url.startsWith('/') ? img.url : '/' + img.url}\`} alt="Gallery" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FICTION — WARM ELEGANT SECTION (ORANGE)
      ════════════════════════════════════════════ */}
      {galleryItems.filter(b => b.genre === "F").length > 0 && (
      <section className="bg-mesh-light" style={{ backgroundColor: "#FF7A00", padding: "6rem 2rem", position: "relative" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <FadeIn delay={100}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "2rem", marginBottom: "4rem" }}>
              <div>
                <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 900, color: "#fff", margin: "0 0 1rem 0", letterSpacing: "-0.02em" }}>Immersive Fiction</h2>
                <p style={{ fontSize: 18, color: "rgba(255,255,255,0.9)", maxWidth: 600, fontWeight: 500, margin: 0 }}>Lose yourself in worlds woven by our finest storytellers.</p>
              </div>
              <Link to="/catalogue?category=Fiction" style={{ background: "#fff", color: "#FF7A00", padding: "1rem 2.5rem", borderRadius: 50, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", textDecoration: "none", fontSize: 13, transition: "transform 0.3s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                View All
              </Link>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "2rem", alignItems: "stretch" }}>
              {galleryItems.filter(b => b.genre === "F").slice(0, 8).map((book, i) => (
                <Link key={i} to={\`/book/\${book.id}\`} className="hover-lift" style={{ display: "flex", flexDirection: "column", textDecoration: "none", background: "#fff", padding: "1.2rem", borderRadius: "24px", boxShadow: "0 15px 30px rgba(0,0,0,0.1)", transition: "all 0.3s ease", height: "100%" }}>
                  <div style={{ width: "100%", height: "240px", borderRadius: "12px", background: "linear-gradient(135deg, #FFF5EB, #FFE4CC)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.2rem", overflow: "hidden" }}>
                    <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : \`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}\${book.coverUrl}\`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300"} alt={book.title} style={{ height: "85%", width: "auto", aspectRatio: "3/4", objectFit: "cover", borderRadius: "8px", boxShadow: "0 15px 25px rgba(255,122,0,0.2)", transition: "transform 0.5s ease" }} className="hover-zoom" />
                  </div>
                  <div style={{ padding: "0 0.5rem", display: "flex", flexDirection: "column", flex: 1 }}>
                    <h4 style={{ fontSize: 18, fontWeight: 800, color: "#111", margin: "0 0 0.4rem 0", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontFamily: "'Playfair Display', serif" }}>{book.title}</h4>
                    <p style={{ fontSize: 14, color: "#666", margin: "0 0 0.5rem 0", fontWeight: 500 }}>{book.authorName}</p>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", marginBottom: "1rem" }}>
                       <Star size={14} fill="#FFD400" color="#FFD400" />
                       <Star size={14} fill="#FFD400" color="#FFD400" />
                       <Star size={14} fill="#FFD400" color="#FFD400" />
                       <Star size={14} fill="#FFD400" color="#FFD400" />
                       <Star size={14} fill="#eee" color="#eee" />
                       <span style={{ fontSize: 12, fontWeight: 700, color: "#888", marginLeft: "0.2rem" }}>4.0</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto" }}>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#FF7A00" }}>{book.mrp != null ? \`₹\${book.mrp}\` : book.mrpRaw || "TBD"}</div>
                      </div>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#FF7A00", display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowRight size={16} color="#fff" /></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>
      )}

      {/* ════════════════════════════════════════════
          NON-FICTION — CLEAN EDITORIAL SECTION
      ════════════════════════════════════════════ */}
      {galleryItems.filter(b => b.genre === "NF").length > 0 && (
      <section className="bg-mesh" style={{ backgroundColor: "#FAFAFA", padding: "6rem 2rem", position: "relative" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <FadeIn delay={200}>
            {/* Swapped Heading (Right) and Button (Left) */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "2rem", marginBottom: "4rem" }}>
              <div style={{ order: 2, textAlign: "right", flex: 1 }}>
                 <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 900, color: "#0033FF", margin: "0 0 1rem 0", letterSpacing: "-0.03em" }}>Knowledge &<br/>Non-Fiction</h2>
                 <p style={{ fontSize: 18, color: "#666", fontWeight: 500, margin: "0 0 0 auto", maxWidth: 600 }}>Explore real-world insights, histories, and thought-provoking analysis.</p>
              </div>
              <div style={{ order: 1 }}>
                <Link to="/catalogue?category=Non-Fiction" style={{ background: "#0033FF", color: "#fff", padding: "1rem 2.5rem", borderRadius: 50, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", textDecoration: "none", fontSize: 13, transition: "background 0.3s", display: "inline-block" }} onMouseEnter={e => e.currentTarget.style.background = "#0022AA"} onMouseLeave={e => e.currentTarget.style.background = "#0033FF"}>
                  View All
                </Link>
              </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2rem", alignItems: "stretch" }}>
              {galleryItems.filter(b => b.genre === "NF").slice(0, 8).map((book, i) => (
                <Link key={i} to={\`/book/\${book.id}\`} style={{ display: "flex", gap: "1.5rem", background: "#fff", padding: "1.5rem", border: "1px solid #eaeaea", borderRadius: 16, textDecoration: "none", transition: "all 0.3s ease", height: "100%" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,51,255,0.08)"; e.currentTarget.style.borderColor = "#0033FF"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#eaeaea"; }}>
                  <div style={{ flex: "0 0 110px", height: "150px", borderRadius: 8, overflow: "hidden", background: "#f5f5f5" }}>
                    <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : \`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}\${book.coverUrl}\`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300"} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <h4 style={{ fontSize: 17, fontWeight: 800, color: "#111", margin: "0 0 0.4rem 0", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontFamily: "'Playfair Display', serif" }}>{book.title}</h4>
                    <p style={{ fontSize: 14, color: "#666", margin: "0 0 0.5rem 0", fontWeight: 500 }}>{book.authorName}</p>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", marginBottom: "1rem" }}>
                       <Star size={12} fill="#FFD400" color="#FFD400" />
                       <Star size={12} fill="#FFD400" color="#FFD400" />
                       <Star size={12} fill="#FFD400" color="#FFD400" />
                       <Star size={12} fill="#FFD400" color="#FFD400" />
                       <Star size={12} fill="#eee" color="#eee" />
                       <span style={{ fontSize: 11, fontWeight: 700, color: "#888", marginLeft: "0.2rem" }}>4.0</span>
                    </div>

                    <div style={{ fontSize: 18, fontWeight: 800, color: "#0033FF", marginTop: "auto" }}>{book.mrp != null ? \`₹\${book.mrp}\` : book.mrpRaw || "Price TBD"}</div>
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
      <section className="bg-mesh-light" style={{ backgroundColor: "#FFD400", padding: "6rem 2rem", position: "relative" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <FadeIn delay={300}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4rem", flexWrap: "wrap", gap: "2rem" }}>
              <div style={{ textAlign: "left" }}>
                <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 900, color: "#111", margin: "0 0 0.5rem 0", letterSpacing: "-0.02em", fontFamily: "'Google Sans', sans-serif" }}>Children's Corner</h2>
                <p style={{ fontSize: 18, color: "#111", fontWeight: 600, margin: 0, opacity: 0.8 }}>Colorful stories for young, imaginative minds.</p>
              </div>
              <Link to="/catalogue?category=Children" style={{ background: "#fff", color: "#111", padding: "1rem 2.5rem", borderRadius: 50, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", textDecoration: "none", fontSize: 13, transition: "transform 0.3s", boxShadow: "0 5px 15px rgba(0,0,0,0.05)" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                View All
              </Link>
            </div>
            
            {/* Reduced Over-Design: Cleaner Landscape Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "2rem", alignItems: "stretch" }}>
              {galleryItems.filter(b => b.genre === "C").slice(0, 8).map((book, i) => (
                <Link key={i} to={\`/book/\${book.id}\`} className="hover-lift" style={{ display: "flex", flexDirection: "row", gap: "1.5rem", textDecoration: "none", background: "#fff", borderRadius: "20px", padding: "1.2rem", transition: "all 0.3s ease", border: "1px solid #eaeaea", alignItems: "center", height: "100%", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                  <div style={{ flex: "0 0 110px", height: "150px", borderRadius: "10px", overflow: "hidden", background: "#f5f5f5" }}>
                    <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : \`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}\${book.coverUrl}\`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300"} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", justifyContent: "center" }}>
                    <h4 style={{ fontSize: 18, fontWeight: 900, color: "#111", margin: "0 0 0.4rem 0", lineHeight: 1.2, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", fontFamily: "'Google Sans', sans-serif" }}>{book.title}</h4>
                    <p style={{ fontSize: 14, color: "#666", margin: "0 0 0.5rem 0", fontWeight: 700 }}>by {book.authorName}</p>
                    
                    {/* Ratings */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", marginBottom: "1rem" }}>
                       <Star size={14} fill="#FFD400" color="#FFD400" />
                       <Star size={14} fill="#FFD400" color="#FFD400" />
                       <Star size={14} fill="#FFD400" color="#FFD400" />
                       <Star size={14} fill="#FFD400" color="#FFD400" />
                       <Star size={14} fill="#eee" color="#eee" />
                       <span style={{ fontSize: 12, fontWeight: 700, color: "#888", marginLeft: "0.2rem" }}>4.0</span>
                    </div>

                    <div style={{ color: "#111", fontWeight: 900, fontSize: 18, marginTop: "auto" }}>
                      {book.mrp != null ? \`₹\${book.mrp}\` : book.mrpRaw || "TBD"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>
      )}

      {/* ════════════════════════════════════════════
          NEW RELEASES (BRIGHT THEME)
      ════════════════════════════════════════════ */}
      {galleryItems.length > 0 && (
      <section className="bg-mesh" style={{ backgroundColor: "#fff", padding: "6rem 2rem", position: "relative" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "4rem", flexWrap: "wrap", gap: "2rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                   <div style={{ width: 40, height: 2, background: "#00D084" }}></div>
                   <span style={{ fontSize: 14, fontWeight: 800, color: "#00D084", textTransform: "uppercase", letterSpacing: "0.2em" }}>Fresh Arrivals</span>
                </div>
                <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 900, color: "#111", margin: 0, letterSpacing: "-0.02em" }}>New Releases</h2>
                <p style={{ fontSize: 18, color: "#666", maxWidth: 600, fontWeight: 500, margin: "1rem 0 0 0" }}>Check out the latest additions to our growing digital library.</p>
              </div>
              <Link to="/catalogue" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#00D084", fontWeight: 800, textDecoration: "none", fontSize: 15, textTransform: "uppercase", letterSpacing: "0.05em" }} onMouseEnter={e => e.currentTarget.style.transform = "translateX(5px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateX(0)"} className="hover-transition">
                See All <ArrowRight size={18} />
              </Link>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "2rem", alignItems: "stretch" }}>
              {[...galleryItems].reverse().slice(0, 8).map((book, i) => (
                <Link key={i} to={\`/book/\${book.id}\`} className="hover-lift" style={{ display: "flex", flexDirection: "column", textDecoration: "none", position: "relative", height: "100%", background: "#fff", padding: "1.2rem", borderRadius: "24px", border: "1px solid #eaeaea", transition: "all 0.3s ease" }} onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = "#00D084"; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#eaeaea"; }}>
                  <div style={{ width: "100%", height: "240px", borderRadius: "12px", background: "linear-gradient(135deg, #F0FDF4, #E2F8EB)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.2rem", overflow: "hidden" }}>
                    <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : \`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}\${book.coverUrl}\`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300"} alt={book.title} style={{ height: "85%", width: "auto", aspectRatio: "3/4", objectFit: "cover", borderRadius: "8px", boxShadow: "0 15px 25px rgba(0,208,132,0.2)", transition: "transform 0.5s ease" }} className="hover-zoom" />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "0 0.5rem" }}>
                    <h4 style={{ fontSize: 18, fontWeight: 800, color: "#111", margin: "0 0 0.4rem 0", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontFamily: "'Playfair Display', serif" }}>{book.title}</h4>
                    <p style={{ fontSize: 14, color: "#666", margin: "0 0 0.5rem 0", fontWeight: 500 }}>{book.authorName}</p>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", marginBottom: "1rem" }}>
                       <Star size={14} fill="#FFD400" color="#FFD400" />
                       <Star size={14} fill="#FFD400" color="#FFD400" />
                       <Star size={14} fill="#FFD400" color="#FFD400" />
                       <Star size={14} fill="#FFD400" color="#FFD400" />
                       <Star size={14} fill="#eee" color="#eee" />
                       <span style={{ fontSize: 12, fontWeight: 700, color: "#888", marginLeft: "0.2rem" }}>4.0</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto" }}>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#00D084" }}>{book.mrp != null ? \`₹\${book.mrp}\` : book.mrpRaw || "TBD"}</div>
                      </div>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#00D084", display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowRight size={16} color="#fff" /></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>
      )}

      {/* ════════════════════════════════════════════
          CONTACT & INQUIRY — BRIGHT & CLEAN
      ════════════════════════════════════════════ */}
      <section className="bg-mesh" style={{ backgroundColor: "#f8f9fa", padding: "6rem 2rem", position: "relative", borderTop: "1px solid #eaeaea" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 900, color: "#111", margin: "0 0 1rem 0", letterSpacing: "-0.02em" }}>Got Questions?</h2>
            <p style={{ fontSize: 18, color: "#666", marginBottom: "3rem", fontWeight: 500 }}>We're here to help you publish, promote, or explore literature.</p>
            
            <form onSubmit={async (e) => { e.preventDefault(); setIsSubmitting(true); try { await axios.post(\`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/inquiries\`, { name: contactName, email: contactEmail, message: contactMessage }); toast.success("Inquiry sent successfully!"); setContactName(""); setContactEmail(""); setContactMessage(""); } catch (err) { toast.error("Failed to send inquiry."); } finally { setIsSubmitting(false); } }} style={{ background: "#fff", padding: "3rem", borderRadius: "24px", border: "1px solid #eaeaea", textAlign: "left", boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Your Name</label>
                  <input required value={contactName} onChange={(e) => setContactName(e.target.value)} type="text" style={{ width: "100%", padding: "1rem", background: "#f5f5f5", border: "1px solid #eaeaea", borderRadius: "12px", outline: "none", color: "#111", fontSize: 16, fontWeight: 500, fontFamily: "inherit" }} onFocus={e => e.currentTarget.style.borderColor = "#00C2FF"} onBlur={e => e.currentTarget.style.borderColor = "#eaeaea"} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Email Address</label>
                  <input required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" style={{ width: "100%", padding: "1rem", background: "#f5f5f5", border: "1px solid #eaeaea", borderRadius: "12px", outline: "none", color: "#111", fontSize: 16, fontWeight: 500, fontFamily: "inherit" }} onFocus={e => e.currentTarget.style.borderColor = "#00C2FF"} onBlur={e => e.currentTarget.style.borderColor = "#eaeaea"} />
                </div>
              </div>
              <div style={{ marginBottom: "2rem" }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Message</label>
                <textarea required value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} rows={4} style={{ width: "100%", padding: "1rem", background: "#f5f5f5", border: "1px solid #eaeaea", borderRadius: "12px", outline: "none", color: "#111", fontSize: 16, resize: "none", fontWeight: 500, fontFamily: "inherit" }} onFocus={e => e.currentTarget.style.borderColor = "#00C2FF"} onBlur={e => e.currentTarget.style.borderColor = "#eaeaea"} />
              </div>
              <button disabled={isSubmitting} type="submit" style={{ width: "100%", background: "#00C2FF", color: "#111", border: "none", padding: "1.2rem", fontSize: 15, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", borderRadius: "12px", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1, transition: "all 0.3s ease", fontFamily: "inherit" }} onMouseEnter={e => { if(!isSubmitting) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,194,255,0.3)"; } }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </FadeIn>
        </div>
      </section>

    </main>
  );
}
`;

fs.writeFileSync(filePath, beforeReturn + newReturn);
console.log("LandingPage.tsx updated with mesh background, uniform ratings, shifted non-fiction layout, and subtle children's UI.");
