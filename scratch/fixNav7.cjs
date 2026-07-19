const fs = require('fs');
const path = require('path');

const landPath = path.join(__dirname, '../src/app/components/LandingPage.tsx');
let landContent = fs.readFileSync(landPath, 'utf8');

const replacement = `
  {/* ════════════════════════════════════════════
          BOOKS BY LANGUAGE (RESTORED)
      ════════════════════════════════════════════ */}
  {availableLanguages.length > 0 && (
  <section style={{ 
    position: "relative", 
    padding: "8rem 2rem", 
    overflow: "hidden",
    background: "linear-gradient(135deg, #FF7A00 0%, #E91E63 100%)"
  }}>
    {/* Subtle patterned overlay */}
    <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/floral-pattern.png')", backgroundSize: "300px", opacity: 0.15, mixBlendMode: "overlay", pointerEvents: "none" }} />
    
    <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
      <FadeIn delay={200}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 900, color: "#fff", marginBottom: "1rem", fontFamily: "'Playfair Display', serif" }}>
            {languageDrilldown === "Others" ? "Other Regional Languages" : languageDrilldown === "Foreign" ? "Foreign Languages" : "Books by Language"}
          </h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.9)", fontWeight: 500, marginBottom: "4rem" }}>Discover literature in your preferred tongue.</p>
          {languageDrilldown && (
            <button onClick={() => setLanguageDrilldown(null)} style={{ marginTop: "1.5rem", padding: "0.6rem 1.5rem", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "50px", cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <ArrowLeft size={14} /> Back
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2rem", maxWidth: 900, margin: "0 auto" }}>
          {(() => {
            const indianLangs = ["Hindi", "English", "Marathi", "Sanskrit", "Tamil", "Telugu", "Kannada", "Malayalam", "Gujarati", "Bengali", "Punjabi", "Urdu", "Odia", "Assamese", "Maithili", "Bhojpuri"];
            const safeParam = (l) => l.searchParam ? l.searchParam.toLowerCase() : "";
            const otherRegional = availableLanguages.filter(l => safeParam(l) !== "english" && safeParam(l) !== "hindi" && indianLangs.some(ind => ind.toLowerCase() === safeParam(l)));
            const foreign = availableLanguages.filter(l => safeParam(l) !== "english" && safeParam(l) !== "hindi" && !indianLangs.some(ind => ind.toLowerCase() === safeParam(l)) && l.name !== "Others");

            let displayedLangs = [];
            if (languageDrilldown === "Others") displayedLangs = otherRegional;
            else if (languageDrilldown === "Foreign") displayedLangs = foreign;
            else displayedLangs = availableLanguages.filter(l => l.name !== "Others");

            return displayedLangs.map((l, i) => {
              // Generate an elegant, slightly translucent white bubble for each language
              return (
                <Link key={i} to={\`/catalogue?search=\${l.searchParam}\`} style={{ width: 120, height: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.5)", borderRadius: "50%", textDecoration: "none", transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1) translateY(-10px)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.2)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "scale(1) translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)"; }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#E91E63", fontFamily: "'Playfair Display', serif" }}>{l.name}</div>
                </Link>
              );
            });
          })()}
          
          {!languageDrilldown && (
            <>
              <button onClick={() => setLanguageDrilldown("Others")} style={{ width: 120, height: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.5)", borderRadius: "50%", textDecoration: "none", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1) translateY(-10px)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.2)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "scale(1) translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)"; }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#FF7A00", fontFamily: "'Playfair Display', serif" }}>Regional</div>
              </button>
            </>
          )}
        </div>
      </FadeIn>
    </div>
  </section>
  )}
`;

// regex replace the whole GENRE & LANGUAGE section and its block
const startIdx = landContent.indexOf('BOOKS BY GENRE & LANGUAGE');
if (startIdx !== -1) {
  // Find the start of the comment block
  const commentStart = landContent.lastIndexOf('{/*', startIdx);
  // Find the next section 'THE BOOK SHOP, CAFÉ & LIBRARY'
  const nextSectionStart = landContent.indexOf('THE BOOK SHOP, CAFÉ & LIBRARY', startIdx);
  const nextCommentStart = landContent.lastIndexOf('{/*', nextSectionStart);
  
  if (commentStart !== -1 && nextCommentStart !== -1) {
    landContent = landContent.substring(0, commentStart) + replacement + '\n  ' + landContent.substring(nextCommentStart);
    
    // Also restore the hero padding which was lost
    landContent = landContent.replace(/padding:\s*"4rem 2rem"/, 'padding: "10rem 2rem 4rem 2rem"');

    fs.writeFileSync(landPath, landContent);
    console.log("Section replaced successfully.");
  }
}
