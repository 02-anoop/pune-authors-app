const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/components/LandingPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The replacement requires careful regex targeting the scroll containers.
// Let's rewrite the return block entirely using our previous rewrite scripts as a base,
// but adding the chunking logic to the carousels.

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
        
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        h1, h2, h3, h4, h5, h6 { font-family: 'Playfair Display', serif !important; }
        
        .bg-hash {
          background-color: transparent;
          background-image: repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 15px);
        }
        .bg-hash-light {
          background-color: transparent;
          background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 15px);
        }
        .bg-dots {
          background-color: transparent;
          background-image: radial-gradient(rgba(0,0,0,0.15) 1.5px, transparent 1.5px);
          background-size: 24px 24px;
        }
        .bg-dots-light {
          background-color: transparent;
          background-image: radial-gradient(rgba(255,255,255,0.25) 1.5px, transparent 1.5px);
          background-size: 24px 24px;
        }
        
        /* Graph Paper for Knowledge section */
        .bg-graph {
          background-color: #FAFAFA;
          background-image: 
            linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* Floating Animation */
        @keyframes float-slow {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-slow 7s ease-in-out infinite; animation-delay: 1s; }

        /* Editorial Form Input */
        .editorial-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 2px solid rgba(255,255,255,0.2);
          padding: 1rem 0;
          font-size: 1.1rem;
          font-weight: 500;
          color: #fff;
          font-family: 'Google Sans', sans-serif;
          outline: none;
          transition: border-color 0.3s;
        }
        .editorial-input:focus { border-bottom-color: #fff; }
        .editorial-input::placeholder { color: rgba(255,255,255,0.5); font-weight: 400; }
        
        .nav-btn {
          width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: transform 0.2s, background 0.3s;
        }
        .nav-btn:hover { transform: scale(1.1); }
      \`}</style>

      {/* ════════════════════════════════════════════
          HERO — CLEAN & BRIGHT
      ════════════════════════════════════════════ */}
      <section className="bg-hash" style={{ position: "relative", minHeight: "80vh", display: "flex", alignItems: "center", overflow: "hidden", backgroundColor: "#f8f9fa" }}>
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
                <Link to="/catalogue" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#111", color: "#fff", padding: "1.2rem 3rem", fontSize: 15, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", textDecoration: "none", borderRadius: 50, transition: "all 0.3s ease" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.background = "#333"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "#111"; }}>Explore Catalogue</Link>
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
          FICTION — NO PEEPING PAGE CHUNKS
      ════════════════════════════════════════════ */}
      {galleryItems.filter(b => b.genre === "F").length > 0 && (
      <section className="bg-dots-light" style={{ backgroundColor: "#FF7A00", padding: "6rem 2rem", position: "relative" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <FadeIn delay={100}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "2rem", marginBottom: "3rem" }}>
              <div>
                <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 900, color: "#fff", margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>Immersive Fiction</h2>
                <p style={{ fontSize: 18, color: "rgba(255,255,255,0.9)", maxWidth: 600, fontWeight: 500, margin: 0 }}>Lose yourself in worlds woven by our finest storytellers.</p>
              </div>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                
                {/* Custom Left/Right Navigation */}
                <div style={{ display: "flex", gap: "0.5rem", marginRight: "1rem" }}>
                  <button onClick={() => { const el = document.getElementById('scroll-fiction'); el.scrollBy({left: -el.clientWidth, behavior: 'smooth'}); }} className="nav-btn" style={{ background: "rgba(255,255,255,0.2)", border: "none" }}>
                    <ArrowRight size={20} color="#fff" style={{ transform: "rotate(180deg)" }} />
                  </button>
                  <button onClick={() => { const el = document.getElementById('scroll-fiction'); el.scrollBy({left: el.clientWidth, behavior: 'smooth'}); }} className="nav-btn" style={{ background: "rgba(255,255,255,0.2)", border: "none" }}>
                    <ArrowRight size={20} color="#fff" />
                  </button>
                </div>

                <Link to="/catalogue?category=Fiction" style={{ background: "#fff", color: "#FF7A00", padding: "0.8rem 2rem", borderRadius: 50, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", textDecoration: "none", fontSize: 13, transition: "all 0.3s ease" }} onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.background = "#111"; e.currentTarget.style.color = "#fff"; }} onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#FF7A00"; }}>
                  View All
                </Link>
              </div>
            </div>
            
            {/* PAGED SCROLL - NO PEEPING */}
            <div id="scroll-fiction" className="hide-scrollbar" style={{ display: "flex", overflowX: "auto", paddingBottom: "1rem", scrollSnapType: "x mandatory" }}>
              {Array.from({ length: Math.ceil(galleryItems.filter(b => b.genre === "F").slice(0, 15).length / 5) }).map((_, pageIndex) => (
                <div key={pageIndex} style={{ flex: "0 0 100%", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1.5rem", scrollSnapAlign: "start", paddingRight: "1px" }}>
                  {galleryItems.filter(b => b.genre === "F").slice(0, 15).slice(pageIndex * 5, pageIndex * 5 + 5).map((book, i) => (
                    <Link key={i} to={\`/book/\${book.id}\`} className="hover-lift" style={{ display: "flex", flexDirection: "column", textDecoration: "none", background: "#fff", padding: "1rem", borderRadius: "20px", boxShadow: "0 10px 20px rgba(0,0,0,0.1)", transition: "all 0.3s ease" }}>
                      <div style={{ width: "100%", height: "180px", borderRadius: "10px", background: "linear-gradient(135deg, #FFF5EB, #FFE4CC)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", overflow: "hidden" }}>
                        <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : \`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}\${book.coverUrl}\`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300"} alt={book.title} style={{ height: "85%", width: "auto", aspectRatio: "3/4", objectFit: "cover", borderRadius: "6px", boxShadow: "0 10px 20px rgba(255,122,0,0.2)", transition: "transform 0.5s ease" }} className="hover-zoom" />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                        <h4 style={{ fontSize: 16, fontWeight: 800, color: "#111", margin: "0 0 0.3rem 0", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontFamily: "'Playfair Display', serif" }}>{book.title}</h4>
                        <p style={{ fontSize: 13, color: "#666", margin: "0 0 0.5rem 0", fontWeight: 500 }}>{book.authorName}</p>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "0.15rem", marginBottom: "0.8rem" }}>
                           <Star size={12} fill="#FFD400" color="#FFD400" />
                           <Star size={12} fill="#FFD400" color="#FFD400" />
                           <Star size={12} fill="#FFD400" color="#FFD400" />
                           <Star size={12} fill="#FFD400" color="#FFD400" />
                           <Star size={12} fill="#eee" color="#eee" />
                           <span style={{ fontSize: 11, fontWeight: 700, color: "#888", marginLeft: "0.2rem" }}>4.0</span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto" }}>
                          <div style={{ fontSize: 20, fontWeight: 900, color: "#FF7A00" }}>{book.mrp != null ? \`₹\${book.mrp}\` : book.mrpRaw || "TBD"}</div>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#FF7A00", display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowRight size={14} color="#fff" /></div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>
      )}

      {/* ════════════════════════════════════════════
          NON-FICTION — PAGED (2 ROWS OF 4)
      ════════════════════════════════════════════ */}
      {galleryItems.filter(b => b.genre === "NF").length > 0 && (
      <section className="bg-graph" style={{ padding: "6rem 2rem", position: "relative", borderTop: "1px solid #eaeaea", borderBottom: "1px solid #eaeaea" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <FadeIn delay={200}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "2rem", marginBottom: "3rem" }}>
              <div style={{ order: 2, textAlign: "right", flex: 1 }}>
                 <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 900, color: "#0033FF", margin: "0 0 0.5rem 0", letterSpacing: "-0.03em" }}>Knowledge &<br/>Non-Fiction</h2>
                 <p style={{ fontSize: 18, color: "#666", fontWeight: 500, margin: "0 0 0 auto", maxWidth: 600 }}>Explore real-world insights, histories, and thought-provoking analysis.</p>
              </div>
              <div style={{ order: 1, display: "flex", alignItems: "center", gap: "1rem" }}>
                <Link to="/catalogue?category=Non-Fiction" style={{ background: "#0033FF", color: "#fff", padding: "0.8rem 2rem", borderRadius: 50, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", textDecoration: "none", fontSize: 13, transition: "all 0.3s ease", display: "inline-block" }} onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.background = "#111"; }} onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "#0033FF"; }}>
                  View All
                </Link>
                
                <div style={{ display: "flex", gap: "0.5rem", marginLeft: "1rem" }}>
                  <button onClick={() => { const el = document.getElementById('scroll-nf'); el.scrollBy({left: -el.clientWidth, behavior: 'smooth'}); }} className="nav-btn" style={{ background: "#eaeaea", border: "none" }}>
                    <ArrowRight size={20} color="#111" style={{ transform: "rotate(180deg)" }} />
                  </button>
                  <button onClick={() => { const el = document.getElementById('scroll-nf'); el.scrollBy({left: el.clientWidth, behavior: 'smooth'}); }} className="nav-btn" style={{ background: "#eaeaea", border: "none" }}>
                    <ArrowRight size={20} color="#111" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* PAGED 2 ROWS: 8 items per page */}
            <div id="scroll-nf" className="hide-scrollbar" style={{ display: "flex", overflowX: "auto", paddingBottom: "1rem", scrollSnapType: "x mandatory" }}>
              {Array.from({ length: Math.ceil(galleryItems.filter(b => b.genre === "NF").slice(0, 24).length / 8) }).map((_, pageIndex) => (
                <div key={pageIndex} style={{ flex: "0 0 100%", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "1fr 1fr", gap: "1.5rem", scrollSnapAlign: "start", paddingRight: "1px" }}>
                  {galleryItems.filter(b => b.genre === "NF").slice(0, 24).slice(pageIndex * 8, pageIndex * 8 + 8).map((book, i) => (
                    <Link key={i} to={\`/book/\${book.id}\`} style={{ display: "flex", gap: "1.2rem", background: "#fff", padding: "1.2rem", border: "1px solid #eaeaea", borderRadius: 16, textDecoration: "none", transition: "all 0.3s ease" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,51,255,0.08)"; e.currentTarget.style.borderColor = "#0033FF"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#eaeaea"; }}>
                      <div style={{ flex: "0 0 90px", height: "130px", borderRadius: 8, overflow: "hidden", background: "#f5f5f5" }}>
                        <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : \`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}\${book.coverUrl}\`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300"} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <h4 style={{ fontSize: 15, fontWeight: 800, color: "#111", margin: "0 0 0.3rem 0", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontFamily: "'Playfair Display', serif" }}>{book.title}</h4>
                        <p style={{ fontSize: 12, color: "#666", margin: "0 0 0.5rem 0", fontWeight: 500 }}>{book.authorName}</p>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "0.15rem", marginBottom: "0.5rem" }}>
                           <Star size={11} fill="#FFD400" color="#FFD400" />
                           <Star size={11} fill="#FFD400" color="#FFD400" />
                           <Star size={11} fill="#FFD400" color="#FFD400" />
                           <Star size={11} fill="#FFD400" color="#FFD400" />
                           <Star size={11} fill="#eee" color="#eee" />
                           <span style={{ fontSize: 10, fontWeight: 700, color: "#888", marginLeft: "0.2rem" }}>4.0</span>
                        </div>

                        <div style={{ fontSize: 16, fontWeight: 900, color: "#0033FF", marginTop: "auto" }}>{book.mrp != null ? \`₹\${book.mrp}\` : book.mrpRaw || "Price TBD"}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>
      )}

      {/* ════════════════════════════════════════════
          CHILDREN'S CORNER — NO PEEPING PAGE CHUNKS
      ════════════════════════════════════════════ */}
      {galleryItems.filter(b => b.genre === "C").length > 0 && (
      <section className="bg-hash-light" style={{ backgroundColor: "#FFD400", padding: "6rem 2rem", position: "relative", overflow: "hidden" }}>
        
        {/* Floating Playful Toys */}
        <div className="animate-float" style={{ position: "absolute", top: "10%", left: "5%", fontSize: "4rem", zIndex: 0, filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.1))" }}>🚀</div>
        <div className="animate-float-delayed" style={{ position: "absolute", bottom: "15%", right: "8%", fontSize: "5rem", zIndex: 0, filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.1))" }}>🎈</div>
        <div className="animate-float" style={{ position: "absolute", top: "30%", right: "40%", fontSize: "3rem", zIndex: 0, filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.1))" }}>⭐</div>
        <div className="animate-float-delayed" style={{ position: "absolute", bottom: "30%", left: "30%", fontSize: "4rem", zIndex: 0, filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.1))" }}>🧩</div>
        <div className="animate-float" style={{ position: "absolute", top: "60%", left: "15%", fontSize: "4.5rem", zIndex: 0, filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.1))" }}>🧸</div>
        <div className="animate-float-delayed" style={{ position: "absolute", top: "20%", right: "20%", fontSize: "3.5rem", zIndex: 0, filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.1))" }}>🎨</div>
        <div className="animate-float" style={{ position: "absolute", bottom: "10%", left: "50%", fontSize: "4rem", zIndex: 0, filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.1))" }}>🪁</div>
        <div className="animate-float-delayed" style={{ position: "absolute", top: "5%", left: "40%", fontSize: "2.5rem", zIndex: 0, filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.1))" }}>🎲</div>

        <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <FadeIn delay={300}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", flexWrap: "wrap", gap: "2rem" }}>
              <div style={{ textAlign: "left" }}>
                <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 900, color: "#111", margin: "0 0 0.5rem 0", letterSpacing: "-0.02em", fontFamily: "'Google Sans', sans-serif" }}>Children's Corner</h2>
                <p style={{ fontSize: 18, color: "#111", fontWeight: 600, margin: 0, opacity: 0.8 }}>Colorful stories for young, imaginative minds.</p>
              </div>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                
                <div style={{ display: "flex", gap: "0.5rem", marginRight: "1rem" }}>
                  <button onClick={() => { const el = document.getElementById('scroll-children'); el.scrollBy({left: -el.clientWidth, behavior: 'smooth'}); }} className="nav-btn" style={{ background: "rgba(0,0,0,0.1)", border: "none" }}>
                    <ArrowRight size={20} color="#111" style={{ transform: "rotate(180deg)" }} />
                  </button>
                  <button onClick={() => { const el = document.getElementById('scroll-children'); el.scrollBy({left: el.clientWidth, behavior: 'smooth'}); }} className="nav-btn" style={{ background: "rgba(0,0,0,0.1)", border: "none" }}>
                    <ArrowRight size={20} color="#111" />
                  </button>
                </div>

                <Link to="/catalogue?category=Children" style={{ background: "#111", color: "#fff", padding: "0.8rem 2rem", borderRadius: 50, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", textDecoration: "none", fontSize: 13, transition: "all 0.3s ease", boxShadow: "0 5px 15px rgba(0,0,0,0.05)" }} onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#111"; }} onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "#111"; e.currentTarget.style.color = "#fff"; }}>
                  View All
                </Link>
              </div>
            </div>
            
            {/* PAGED SCROLL - NO PEEPING */}
            <div id="scroll-children" className="hide-scrollbar" style={{ display: "flex", overflowX: "auto", paddingBottom: "1rem", scrollSnapType: "x mandatory" }}>
              {Array.from({ length: Math.ceil(galleryItems.filter(b => b.genre === "C").slice(0, 16).length / 4) }).map((_, pageIndex) => (
                <div key={pageIndex} style={{ flex: "0 0 100%", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", scrollSnapAlign: "start", paddingRight: "1px" }}>
                  {galleryItems.filter(b => b.genre === "C").slice(0, 16).slice(pageIndex * 4, pageIndex * 4 + 4).map((book, i) => (
                    <Link key={i} to={\`/book/\${book.id}\`} className="hover-lift" style={{ display: "flex", flexDirection: "row", gap: "1.2rem", textDecoration: "none", background: "#fff", borderRadius: "20px", padding: "1.2rem", transition: "all 0.3s ease", border: "1px solid #eaeaea", alignItems: "center", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                      <div style={{ flex: "0 0 100px", height: "140px", borderRadius: "10px", overflow: "hidden", background: "#f5f5f5" }}>
                        <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : \`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}\${book.coverUrl}\`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300"} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", justifyContent: "center" }}>
                        <h4 style={{ fontSize: 16, fontWeight: 900, color: "#111", margin: "0 0 0.3rem 0", lineHeight: 1.2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontFamily: "'Google Sans', sans-serif" }}>{book.title}</h4>
                        <p style={{ fontSize: 13, color: "#666", margin: "0 0 0.5rem 0", fontWeight: 700 }}>by {book.authorName}</p>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", marginBottom: "0.8rem" }}>
                           <Star size={12} fill="#FFD400" color="#FFD400" />
                           <Star size={12} fill="#FFD400" color="#FFD400" />
                           <Star size={12} fill="#FFD400" color="#FFD400" />
                           <Star size={12} fill="#FFD400" color="#FFD400" />
                           <Star size={12} fill="#eee" color="#eee" />
                           <span style={{ fontSize: 11, fontWeight: 700, color: "#888", marginLeft: "0.2rem" }}>4.0</span>
                        </div>

                        <div style={{ color: "#111", fontWeight: 900, fontSize: 18, marginTop: "auto" }}>
                          {book.mrp != null ? \`₹\${book.mrp}\` : book.mrpRaw || "TBD"}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
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
      <section style={{ backgroundColor: "#fff", padding: "6rem 2rem", position: "relative" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", flexWrap: "wrap", gap: "2rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                   <div style={{ width: 40, height: 2, background: "#00D084" }}></div>
                   <span style={{ fontSize: 14, fontWeight: 800, color: "#00D084", textTransform: "uppercase", letterSpacing: "0.2em" }}>Fresh Arrivals</span>
                </div>
                <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 900, color: "#111", margin: 0, letterSpacing: "-0.02em" }}>New Releases</h2>
              </div>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                
                <div style={{ display: "flex", gap: "0.5rem", marginRight: "1rem" }}>
                  <button onClick={() => { const el = document.getElementById('scroll-new'); el.scrollBy({left: -el.clientWidth, behavior: 'smooth'}); }} className="nav-btn" style={{ background: "#f5f5f5", border: "none" }}>
                    <ArrowRight size={20} color="#111" style={{ transform: "rotate(180deg)" }} />
                  </button>
                  <button onClick={() => { const el = document.getElementById('scroll-new'); el.scrollBy({left: el.clientWidth, behavior: 'smooth'}); }} className="nav-btn" style={{ background: "#f5f5f5", border: "none" }}>
                    <ArrowRight size={20} color="#111" />
                  </button>
                </div>

                <Link to="/catalogue" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#00D084", fontWeight: 800, textDecoration: "none", fontSize: 15, textTransform: "uppercase", letterSpacing: "0.05em", transition: "color 0.3s ease" }} onMouseEnter={e => e.currentTarget.style.color = "#111"} onMouseLeave={e => e.currentTarget.style.color = "#00D084"} className="hover-transition">
                  See All <ArrowRight size={18} />
                </Link>
              </div>
            </div>
            
            {/* PAGED SCROLL - NO PEEPING */}
            <div id="scroll-new" className="hide-scrollbar" style={{ display: "flex", overflowX: "auto", paddingBottom: "1rem", scrollSnapType: "x mandatory" }}>
              {Array.from({ length: Math.ceil(galleryItems.slice(0, 15).length / 5) }).map((_, pageIndex) => (
                <div key={pageIndex} style={{ flex: "0 0 100%", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1.5rem", scrollSnapAlign: "start", paddingRight: "1px" }}>
                  {[...galleryItems].reverse().slice(0, 15).slice(pageIndex * 5, pageIndex * 5 + 5).map((book, i) => (
                    <Link key={i} to={\`/book/\${book.id}\`} className="hover-lift" style={{ display: "flex", flexDirection: "column", textDecoration: "none", position: "relative", background: "#fff", padding: "1rem", borderRadius: "20px", border: "1px solid #eaeaea", transition: "all 0.3s ease" }}>
                      <div style={{ width: "100%", height: "180px", borderRadius: "10px", background: "linear-gradient(135deg, #F0FDF4, #E2F8EB)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", overflow: "hidden" }}>
                        <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : \`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}\${book.coverUrl}\`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300"} alt={book.title} style={{ height: "85%", width: "auto", aspectRatio: "3/4", objectFit: "cover", borderRadius: "6px", boxShadow: "0 10px 20px rgba(0,208,132,0.2)", transition: "transform 0.5s ease" }} className="hover-zoom" />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                        <h4 style={{ fontSize: 16, fontWeight: 800, color: "#111", margin: "0 0 0.3rem 0", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontFamily: "'Playfair Display', serif" }}>{book.title}</h4>
                        <p style={{ fontSize: 13, color: "#666", margin: "0 0 0.5rem 0", fontWeight: 500 }}>{book.authorName}</p>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "0.15rem", marginBottom: "0.8rem" }}>
                           <Star size={12} fill="#FFD400" color="#FFD400" />
                           <Star size={12} fill="#FFD400" color="#FFD400" />
                           <Star size={12} fill="#FFD400" color="#FFD400" />
                           <Star size={12} fill="#FFD400" color="#FFD400" />
                           <Star size={12} fill="#eee" color="#eee" />
                           <span style={{ fontSize: 11, fontWeight: 700, color: "#888", marginLeft: "0.2rem" }}>4.0</span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto" }}>
                          <div style={{ fontSize: 20, fontWeight: 900, color: "#00D084" }}>{book.mrp != null ? \`₹\${book.mrp}\` : book.mrpRaw || "TBD"}</div>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#00D084", display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowRight size={14} color="#fff" /></div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>
      )}

      {/* ════════════════════════════════════════════
          BOOKS BY LANGUAGE — PETAL CIRCLES
      ════════════════════════════════════════════ */}
      {galleryItems.some(b => b.language) && (
      <section className="bg-hash" style={{ backgroundColor: "#FFF4F7", padding: "6rem 2rem", position: "relative" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 900, color: "#E91E63", margin: "0 0 1rem 0", letterSpacing: "-0.02em" }}>Books by Language</h2>
            <p style={{ fontSize: 18, color: "#666", marginBottom: "4rem", fontWeight: 500 }}>Discover literature in your preferred tongue.</p>
            
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "3rem" }}>
              {[...new Set(galleryItems.map(b => b.language?.trim().toLowerCase()).filter(Boolean))].map(l => l.charAt(0).toUpperCase() + l.slice(1)).map((lang, i) => {
                const colors = ["#E91E63", "#9C27B0", "#3F51B5", "#009688", "#FF9800"];
                const color = colors[i % colors.length];
                return (
                  <Link key={i} to={\`/catalogue?language=\${lang}\`} className="hover-lift" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                    <div style={{ 
                      width: "160px", height: "160px", borderRadius: "50%", background: \`\${color}10\`, 
                      border: \`1px solid \${color}30\`, display: "flex", alignItems: "center", justifyContent: "center", 
                      position: "relative", overflow: "hidden", transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      boxShadow: \`0 15px 30px \${color}15\`
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1) rotate(15deg)"; e.currentTarget.style.background = color; e.currentTarget.style.boxShadow = \`0 20px 40px \${color}40\`; e.currentTarget.querySelector('.lang-text').style.color = '#fff'; e.currentTarget.querySelector('.petal-bg').style.opacity = '0.3'; e.currentTarget.querySelector('.petal-bg').style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1) rotate(0deg)"; e.currentTarget.style.background = \`\${color}10\`; e.currentTarget.style.boxShadow = \`0 15px 30px \${color}15\`; e.currentTarget.querySelector('.lang-text').style.color = color; e.currentTarget.querySelector('.petal-bg').style.opacity = '0.1'; e.currentTarget.querySelector('.petal-bg').style.color = color; }}
                    >
                      {/* Beautiful Flower Petal/Mandala SVG inside the circle */}
                      <svg className="petal-bg" viewBox="0 0 100 100" style={{ position: "absolute", width: "130%", height: "130%", opacity: 0.1, transition: "all 0.4s ease", color: color }}>
                        <path d="M50 5 C65 25, 95 35, 95 50 C95 65, 65 75, 50 95 C35 75, 5 65, 5 50 C5 35, 35 25, 50 5 Z" fill="currentColor" />
                        <path d="M18 18 C38 25, 50 5, 50 5 C50 5, 62 25, 82 18 C75 38, 95 50, 95 50 C95 50, 75 62, 82 82 C62 75, 50 95, 50 95 C50 95, 38 75, 18 82 C25 62, 5 50, 5 50 C5 50, 25 38, 18 18 Z" fill="currentColor" style={{ transformOrigin: "center", transform: "rotate(45deg)", opacity: 0.7 }} />
                      </svg>
                      
                      <span className="lang-text" style={{ fontSize: 24, fontWeight: 900, color: color, position: "relative", zIndex: 2, fontFamily: "'Playfair Display', serif", transition: "color 0.3s" }}>{lang}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </FadeIn>
        </div>
      </section>
      )}

      {/* ════════════════════════════════════════════
          CONTACT & INQUIRY — DARK THEME
      ════════════════════════════════════════════ */}
      <section className="bg-hash-light" style={{ backgroundColor: "#111", padding: "8rem 2rem", position: "relative" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, background: "#FFD400", borderRadius: "50%", marginBottom: "1.5rem" }}>
                 <Mail size={28} color="#111" />
              </div>
              <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 900, color: "#fff", margin: "0 0 1rem 0", letterSpacing: "-0.02em" }}>Get in Touch</h2>
              <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Publishing queries, promotion details, or simply saying hello.</p>
            </div>
            
            <form onSubmit={async (e) => { e.preventDefault(); setIsSubmitting(true); try { await axios.post(\`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/inquiries\`, { name: contactName, email: contactEmail, message: contactMessage }); toast.success("Inquiry sent successfully!"); setContactName(""); setContactEmail(""); setContactMessage(""); } catch (err) { toast.error("Failed to send inquiry."); } finally { setIsSubmitting(false); } }}>
              
              <div style={{ borderTop: "2px solid rgba(255,255,255,0.1)", borderBottom: "2px solid rgba(255,255,255,0.1)", padding: "2rem 0", marginBottom: "3rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 250px" }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#FFD400", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.2rem" }}>First & Last Name</label>
                      <input required value={contactName} onChange={(e) => setContactName(e.target.value)} type="text" className="editorial-input" placeholder="e.g. Jane Doe" />
                    </div>
                    <div style={{ flex: "1 1 250px" }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#FFD400", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.2rem" }}>Email Address</label>
                      <input required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" className="editorial-input" placeholder="jane@example.com" />
                    </div>
                  </div>
                  <div style={{ marginTop: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#FFD400", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.2rem" }}>How can we help?</label>
                    <textarea required value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} rows={3} className="editorial-input" style={{ resize: "none" }} placeholder="Tell us about your project or inquiry..." />
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <button disabled={isSubmitting} type="submit" style={{ background: "#FFD400", color: "#111", border: "none", padding: "1.2rem 3rem", fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", borderRadius: 50, cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1, transition: "transform 0.3s ease", display: "inline-flex", alignItems: "center", gap: "0.8rem", fontFamily: "inherit" }} onMouseEnter={e => { if(!isSubmitting) e.currentTarget.style.transform = "scale(1.05)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
                  {isSubmitting ? "Sending..." : "Submit Inquiry"} <ArrowRight size={16} />
                </button>
              </div>

            </form>
          </FadeIn>
        </div>
      </section>

    </main>
  );
}
`;

fs.writeFileSync(filePath, beforeReturn + newReturn);
console.log("LandingPage.tsx updated successfully with paginated carousels to prevent peeping!");
