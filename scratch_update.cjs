const fs = require('fs');

let content = fs.readFileSync('src/app/components/LandingPage.tsx', 'utf8');

// 1. Extract the Genre & Language section
const genreStart = content.indexOf('{/* ════════════════════════════════════════════\n          BOOKS BY GENRE & LANGUAGE');
const genreEnd = content.indexOf('      {/* ════════════════════════════════════════════\n          THE BOOK SHOP, CAFÉ & LIBRARY');

if (genreStart === -1 || genreEnd === -1) {
  console.log("Could not find genre sections");
  process.exit(1);
}

const genreSection = content.substring(genreStart, genreEnd);
content = content.substring(0, genreStart) + content.substring(genreEnd);


// 2. Define the New Hero Section
const newHero = `{/* ════════════════════════════════════════════
          HERO — BRIDGE & CLOUD (LIGHT THEME)
      ════════════════════════════════════════════ */}
      <section
        style={{
          background: "linear-gradient(180deg, #e0f2fe 0%, #ffffff 100%)",
          position: "relative",
          overflow: "hidden",
          padding: "5rem 2rem 5rem 2rem",
          minHeight: "85vh",
          display: "flex",
          alignItems: "center"
        }}
      >
        {/* SVG Clouds and Bridge background */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
          
          {/* Clouds */}
          <svg viewBox="0 0 1440 320" style={{ position: "absolute", top: "15%", left: 0, width: "100%", opacity: 0.6 }}>
            <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
          
          {/* Bridge Vector Silhouette */}
          <svg viewBox="0 0 1000 400" style={{ position: "absolute", bottom: "10%", left: "5%", width: "65%", opacity: 0.15 }}>
            {/* Pylon 1 */}
            <polygon points="300,50 285,350 315,350" fill="#0284c7" />
            <polygon points="300,50 300,350 315,350" fill="#0369a1" />
            {/* Pylon 2 */}
            <polygon points="700,100 688,350 712,350" fill="#0284c7" />
            <polygon points="700,100 700,350 712,350" fill="#0369a1" />
            
            {/* Cables Pylon 1 */}
            <line x1="300" y1="80" x2="100" y2="350" stroke="#0284c7" strokeWidth="1.5" />
            <line x1="300" y1="120" x2="150" y2="350" stroke="#0284c7" strokeWidth="1.5" />
            <line x1="300" y1="160" x2="200" y2="350" stroke="#0284c7" strokeWidth="1.5" />
            <line x1="300" y1="200" x2="250" y2="350" stroke="#0284c7" strokeWidth="1.5" />
            <line x1="300" y1="80" x2="500" y2="350" stroke="#0284c7" strokeWidth="1.5" />
            <line x1="300" y1="120" x2="450" y2="350" stroke="#0284c7" strokeWidth="1.5" />
            <line x1="300" y1="160" x2="400" y2="350" stroke="#0284c7" strokeWidth="1.5" />
            <line x1="300" y1="200" x2="350" y2="350" stroke="#0284c7" strokeWidth="1.5" />

            {/* Cables Pylon 2 */}
            <line x1="700" y1="130" x2="550" y2="350" stroke="#0284c7" strokeWidth="1.5" />
            <line x1="700" y1="170" x2="600" y2="350" stroke="#0284c7" strokeWidth="1.5" />
            <line x1="700" y1="210" x2="650" y2="350" stroke="#0284c7" strokeWidth="1.5" />
            <line x1="700" y1="130" x2="850" y2="350" stroke="#0284c7" strokeWidth="1.5" />
            <line x1="700" y1="170" x2="800" y2="350" stroke="#0284c7" strokeWidth="1.5" />
            <line x1="700" y1="210" x2="750" y2="350" stroke="#0284c7" strokeWidth="1.5" />

            {/* Deck */}
            <rect x="0" y="345" width="1000" height="8" fill="#0284c7" />
          </svg>
          
          {/* Birds */}
          <svg viewBox="0 0 100 100" style={{ position: "absolute", top: "25%", left: "40%", width: 80, opacity: 0.15 }}>
            <path d="M10,50 Q25,30 40,50 Q25,40 10,50 Z M40,50 Q55,30 70,50 Q55,40 40,50 Z" fill="#0284c7"/>
            <path d="M30,60 Q40,45 50,60 Q40,52 30,60 Z M50,60 Q60,45 70,60 Q60,52 50,60 Z" fill="#0284c7" style={{transform: "translate(20px, -15px) scale(0.7)"}}/>
          </svg>
        </div>

        <div style={{ position: "relative", zIndex: 10, maxWidth: 1200, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "center" }} className="hero-grid">
          
          {/* Left Content */}
          <FadeIn>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.7)", color: "#0ea5e9", borderRadius: 50, padding: "0.4rem 1.2rem", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", width: "fit-content", border: "1px solid rgba(14,165,233,0.2)" }}>
                DISCOVER, READ, GROW
              </div>
              
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 5vw, 4.2rem)", fontWeight: 700, color: "#1e293b", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                Helping indie <br/>
                <span style={{ color: "#f97316" }}>authors</span> <br/>
                publish, promote <br/> and sell.
              </h1>
              
              <p style={{ fontSize: 16, color: "#475569", maxWidth: 450, lineHeight: 1.6 }}>
                A dedicated, self-governing independent collective built to publish, distribute, promote, and establish high visibility for modern Indian writers.
              </p>
              
              {/* Buttons (matching original content) */}
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                <Link
                  to="/register"
                  className="hover-scale"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#f97316", color: "#fff", padding: "0.85rem 2rem", fontSize: 14, fontWeight: 600, borderRadius: 50, textDecoration: "none", boxShadow: "0 4px 15px rgba(249,115,22,0.2)" }}
                >
                  <Users size={16} /> New Authors — Join Us
                </Link>
                <Link
                  to="/gallery"
                  className="hover-scale"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#fff", color: "#1e293b", border: "1px solid #e2e8f0", padding: "0.85rem 2rem", fontSize: 14, fontWeight: 600, borderRadius: 50, textDecoration: "none", boxShadow: "0 2px 5px rgba(0,0,0,0.02)" }}
                >
                  Gallery <ArrowRight size={14} />
                </Link>
              </div>
              
              {/* Stats */}
              <div style={{ display: "flex", gap: "2.5rem", marginTop: "2rem", flexWrap: "wrap" }}>
                 <div>
                   <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: 20, fontWeight: 800, color: "#1e293b" }}><Book size={20} color="#94a3b8" strokeWidth={2.5} /> <CountUp end={stats.books} suffix="+" /></div>
                   <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginTop: "0.2rem" }}>Books</div>
                 </div>
                 <div>
                   <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: 20, fontWeight: 800, color: "#1e293b" }}><Users size={20} color="#94a3b8" strokeWidth={2.5} /> <CountUp end={stats.authors} suffix="+" /></div>
                   <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginTop: "0.2rem" }}>Authors</div>
                 </div>
                 <div>
                   <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: 20, fontWeight: 800, color: "#1e293b" }}><Megaphone size={20} color="#94a3b8" strokeWidth={2.5} /> <CountUp end={stats.events} suffix="+" /></div>
                   <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginTop: "0.2rem" }}>Events</div>
                 </div>
              </div>
            </div>
          </FadeIn>

          {/* Right Content - 3D Pedestal and Books */}
          <FadeIn delay={200}>
            <div style={{ position: "relative", height: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
               {/* Yellow Arch / Circle Background */}
               <div style={{ position: "absolute", top: "50%", right: "-10%", transform: "translateY(-50%)", width: 500, height: 500, background: "#f59e0b", borderRadius: "50%", zIndex: -1 }}></div>
               
               {/* 3D Pedestal */}
               <div style={{ position: "relative", width: 380, height: 90, background: "#ffffff", borderRadius: "50%", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", display: "flex", justifyContent: "center", alignItems: "flex-end", paddingBottom: 25, zIndex: 1 }}>
                  {/* Cylinder Body */}
                  <div style={{ position: "absolute", top: 45, width: 380, height: 120, background: "linear-gradient(to right, #f8fafc, #e2e8f0, #f8fafc)", borderRadius: "0 0 50% 50%", zIndex: -1 }}></div>
                  
                  {/* Books Array */}
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "-1rem", zIndex: 5, transform: "translateY(30px)" }}>
                     {/* Left Book */}
                     <div style={{ width: 120, height: 170, background: "#fff", borderRadius: "2px 6px 6px 2px", boxShadow: "-8px 8px 20px rgba(0,0,0,0.15)", transform: "rotateY(-15deg) translateZ(10px) translateX(20px)", overflow: "hidden", borderLeft: "3px solid #e2e8f0" }}>
                         <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300&auto=format&fit=crop" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                     </div>
                     {/* Center Book */}
                     <div style={{ width: 140, height: 210, background: "#fff", borderRadius: "2px 6px 6px 2px", boxShadow: "0 15px 30px rgba(0,0,0,0.2)", transform: "translateZ(30px) translateY(-10px)", overflow: "hidden", zIndex: 10, borderLeft: "4px solid #cbd5e1" }}>
                         <img src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=300&auto=format&fit=crop" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                     </div>
                     {/* Right Book */}
                     <div style={{ width: 120, height: 170, background: "#fff", borderRadius: "2px 6px 6px 2px", boxShadow: "8px 8px 20px rgba(0,0,0,0.15)", transform: "rotateY(15deg) translateZ(10px) translateX(-20px)", overflow: "hidden", borderLeft: "3px solid #e2e8f0" }}>
                         <img src="https://images.unsplash.com/photo-1629196914216-928d3e230ce6?q=80&w=300&auto=format&fit=crop" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                     </div>
                  </div>
               </div>
            </div>
          </FadeIn>
        </div>
      </section>

${genreSection}
`;

const heroStart = content.indexOf('{/* ════════════════════════════════════════════\n          HERO — BRIDGE & CLOUD BANNER');
const buyBooksStart = content.indexOf('{/* ════════════════════════════════════════════\n          BUY OUR BOOKS — HORIZONTAL SCROLL');

if (heroStart === -1 || buyBooksStart === -1) {
  console.log("Could not find hero or buy books sections");
  process.exit(1);
}

content = content.substring(0, heroStart) + newHero + content.substring(buyBooksStart);

fs.writeFileSync('src/app/components/LandingPage.tsx', content);
console.log("Successfully replaced hero section and moved genres.");
