
import re

with open("src/app/components/EventsPage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add C object
if "const C = {" not in content:
    content = content.replace("export function EventsPage() {", """
const C = {
  gold: "#FF6B00",
  goldBg: "#f8f9fa",
  amber: "#0033FF",
  dark: "#111",
  text: "#111",
  muted: "#475569",
  border: "#eaeaea",
  white: "#fff",
  cream: "#fff",
};

export function EventsPage() {""")

# 2. Update Main
content = content.replace("<main style={{ fontFamily: \"var(--font-body)\", background: \"#2C1B18\", color: \"#fff\", minHeight: \"calc(100vh - 64px)\", overflowX: \"hidden\" }}>", "<main style={{ fontFamily: \"'Google Sans', 'Montserrat', sans-serif\", background: C.cream, color: C.dark, minHeight: \"calc(100vh - 64px)\", overflowX: \"hidden\" }}>")

# 3. Update Hero
hero_regex = re.compile(r"{/\* -- HERO -- \*/}.*?</section>", re.DOTALL)
new_hero = """{/* -- HERO -- */}
      <section style={{ padding: "6rem 2rem 4rem", textAlign: "center", position: "relative", overflow: "hidden", backgroundColor: "#fff" }}>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ 
            fontFamily: "'Playfair Display', serif", 
            fontSize: "clamp(2.5rem, 5vw, 4rem)", 
            color: C.gold, 
            fontWeight: 800, 
            lineHeight: 1.2, 
            letterSpacing: "-0.02em", 
            margin: 0
          }}>
            Literary Events <span style={{ fontStyle: "italic", color: C.amber }}>& Book Fairs.</span>
          </h1>
          <p style={{
            fontSize: "1rem",
            color: C.muted,
            fontWeight: 500,
            marginTop: "1.5rem",
            maxWidth: 600,
            margin: "1.5rem auto 0",
            lineHeight: 1.8
          }}>
            Discover our upcoming book fairs, reading sessions, and literary festivals across India. Join the movement and celebrate the written word.
          </p>
        </div>
      </section>"""
content = hero_regex.sub(new_hero, content)

# 4. Update Tabs
tabs_regex = re.compile(r"{/\* -- TABS & SEARCH \(MINIMALIST\) -- \*/}.*?</section>", re.DOTALL)
new_tabs = """{/* -- TABS & SEARCH -- */}
      <section style={{ borderBottom: `1px solid ${C.border}`, borderTop: `1px solid ${C.border}`, background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "2rem" }}>
            <button 
              onClick={() => setActiveTab('upcoming')}
              className="tab-btn"
              style={{
                background: "transparent", border: "none", padding: "0.5rem 0",
                color: activeTab === 'upcoming' ? C.gold : C.muted,
                borderBottom: activeTab === 'upcoming' ? `2px solid ${C.gold}` : "2px solid transparent",
                fontSize: 13, fontWeight: activeTab === 'upcoming' ? 800 : 600,
                letterSpacing: "0.05em", textTransform: "uppercase",
                cursor: "pointer", transition: "all 0.2s ease"
              }}
            >
              Upcoming ({upcomingEvents.length})
            </button>
            <button 
              onClick={() => setActiveTab('past')}
              className="tab-btn"
              style={{
                background: "transparent", border: "none", padding: "0.5rem 0",
                color: activeTab === 'past' ? C.gold : C.muted,
                borderBottom: activeTab === 'past' ? `2px solid ${C.gold}` : "2px solid transparent",
                fontSize: 13, fontWeight: activeTab === 'past' ? 800 : 600,
                letterSpacing: "0.05em", textTransform: "uppercase",
                cursor: "pointer", transition: "all 0.2s ease"
              }}
            >
              Past ({filteredPastEvents.length})
            </button>
          </div>
          
          <div style={{ position: "relative", width: "100%", maxWidth: 300 }}>
            <Search size={14} color={C.muted} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
            <input 
              type="text" 
              placeholder="Search Events..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%", padding: "0.6rem 1rem 0.6rem 2.5rem",
                background: "#f8f9fa", border: `1px solid ${C.border}`, borderRadius: "50px",
                outline: "none", fontSize: 13, color: C.dark, fontWeight: 500,
                transition: "border-color 0.3s"
              }}
            />
          </div>
        </div>
      </section>"""
content = tabs_regex.sub(new_tabs, content)

# 5. Fix Empty States
content = content.replace("color: \"#fff\"", "color: C.dark").replace("color: \"rgba(255,255,255,0.7)\"", "color: C.muted").replace("color=\"rgba(255,255,255,0.3)\"", "color={C.border}")
content = content.replace("borderTop: \"1px solid rgba(255,255,255,0.1)\"", f"borderTop: `1px solid ${{C.border}}`").replace("borderBottom: \"1px solid rgba(255,255,255,0.1)\"", f"borderBottom: `1px solid ${{C.border}}`")

# Fix skeleton
content = content.replace("background: \"rgba(255,255,255,0.05)\"", "background: C.white").replace("border: \"1px solid rgba(255,255,255,0.1)\"", f"border: `1px solid ${{C.border}}`").replace("background: \"rgba(255,255,255,0.1)\"", "background: \"#f1f5f9\"")

# Add border radius to cards
content = content.replace("padding: \"2rem\", transition: \"transform 0.4s ease, box-shadow 0.4s ease\"", "padding: \"2rem\", transition: \"transform 0.4s ease, box-shadow 0.4s ease\", borderRadius: 24, boxShadow: \"0 4px 20px rgba(0,0,0,0.03)\"")

# Update card titles to playfair display
content = content.replace("fontFamily: \"var(--font-display)\"", "fontFamily: \"'Playfair Display', serif\"")
content = content.replace("fontFamily: \"var(--font-body)\"", "fontFamily: \"'Google Sans', 'Montserrat', sans-serif\"")

# Pagination buttons
content = content.replace("color: currentPage === 1 ? 'rgba(255,255,255,0.3)' : '#2C1B18'", "color: currentPage === 1 ? C.border : C.dark")
content = content.replace("color: currentPage === totalPages ? 'rgba(255,255,255,0.3)' : '#2C1B18'", "color: currentPage === totalPages ? C.border : C.dark")
content = content.replace("background: currentPage === 1 ? 'transparent' : '#fff'", "background: currentPage === 1 ? 'transparent' : C.goldBg")
content = content.replace("background: currentPage === totalPages ? 'transparent' : '#fff'", "background: currentPage === totalPages ? 'transparent' : C.goldBg")

with open("src/app/components/EventsPage.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Done")

