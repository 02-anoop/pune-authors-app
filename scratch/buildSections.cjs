const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/components/LandingPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The replacement CSS for styles at the end
const stylesToAdd = `
        .bg-dots-light {
          background-color: #fcfcfc;
          background-image: radial-gradient(#d1d5db 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .bg-slant {
          background-color: #ffffff;
          background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 11px);
        }
        .bg-dots-dark {
          background-color: #111111;
          background-image: radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .nf-card {
          border: 1px solid transparent;
          transition: all 0.3s ease;
        }
        .nf-card:hover {
          border-color: #0033FF;
          box-shadow: 0 10px 30px rgba(0, 51, 255, 0.1);
        }
        .fic-card {
          transition: all 0.3s ease;
        }
        .fic-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }
        .nr-card {
          transition: all 0.3s ease;
        }
        .nr-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 208, 132, 0.15);
        }
        .contact-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          padding: 0.5rem 0;
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s;
        }
        .contact-input:focus {
          border-bottom-color: #FFCC00;
        }
`;

if (!content.includes('.bg-dots-light')) {
    content = content.replace('</style>', stylesToAdd + '\n      </style>');
}

// Locate the "BUY OUR BOOKS — HORIZONTAL SCROLL" section
const startBuyBooks = content.indexOf('{/* ════════════════════════════════════════════\n          BUY OUR BOOKS — HORIZONTAL SCROLL\n      ════════════════════════════════════════════ */}');

// Locate the contact section
const startContact = content.indexOf('{/* ════════════════════════════════════════════\n          CONTACT SECTION\n      ════════════════════════════════════════════ */}');

const endContact = content.indexOf('{/* ── STYLES ── */ }');

if (startBuyBooks !== -1 && startContact !== -1) {
    const section1 = `
      {/* ════════════════════════════════════════════
          IMMERSIVE FICTION (ORANGE)
      ════════════════════════════════════════════ */}
      <section style={{ backgroundColor: "#FF6B00", padding: "5rem 2rem", fontFamily: "var(--font-body)", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>Immersive Fiction</h2>
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, fontWeight: 500 }}>Lose yourself in worlds woven by our finest storytellers.</p>
              </div>
              <Link to="/catalogue?category=Fiction" style={{ background: "#fff", color: "#FF6B00", padding: "0.8rem 2rem", borderRadius: 50, fontWeight: 700, textDecoration: "none", fontSize: 13, letterSpacing: "0.05em", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", display: "inline-block" }}>
                VIEW ALL
              </Link>
            </div>
          </FadeIn>
          
          <div className="horizontal-scroll" style={{ display: "flex", gap: "1.5rem", overflowX: "auto", paddingBottom: "2rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
            {galleryItems.filter(b => b.genre === "F").slice(0, 8).map((book, i) => (
              <div key={i} className="fic-card" style={{ flex: "0 0 280px", width: 280, background: "#fff", borderRadius: 16, padding: "1rem", position: "relative", display: "flex", flexDirection: "column" }}>
                <div style={{ width: "100%", height: 320, background: "#f1f5f9", borderRadius: 8, marginBottom: "1rem", overflow: "hidden" }}>
                  <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : \`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}\${book.coverUrl}\`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop"} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 800, color: "#111", margin: "0 0 0.2rem 0", fontFamily: "'Playfair Display', serif" }}>{book.title}</h4>
                  <p style={{ fontSize: 13, color: "#666", margin: "0 0 1rem 0", fontWeight: 500 }}>{book.authorName}</p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#FF6B00" }}>₹{book.mrp || 150}</span>
                  <Link to={\`/book/\${book.id}\`} style={{ width: 32, height: 32, borderRadius: "50%", background: "#FF6B00", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          KNOWLEDGE & NON-FICTION (WHITE DOTS)
      ════════════════════════════════════════════ */}
      <section className="bg-dots-light" style={{ padding: "5rem 2rem", borderTop: "4px solid #FFCC00", borderBottom: "12px solid #FFCC00", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", flexDirection: "row-reverse", flexWrap: "wrap", gap: "2rem" }}>
              <div style={{ textAlign: "right" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 800, color: "#0033FF", marginBottom: "0.5rem", lineHeight: 1.1 }}>Knowledge &<br/>Non-Fiction</h2>
                <p style={{ color: "#475569", fontSize: 16, fontWeight: 500 }}>Explore real-world insights, histories, and thought-provoking analysis.</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <Link to="/catalogue?category=Non-Fiction" style={{ background: "#0033FF", color: "#fff", padding: "0.8rem 2rem", borderRadius: 50, fontWeight: 700, textDecoration: "none", fontSize: 13, letterSpacing: "0.05em", boxShadow: "0 4px 15px rgba(0,51,255,0.2)" }}>
                  VIEW ALL
                </Link>
                <span style={{ color: "#0033FF", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: "0.4rem" }}><ArrowRight size={14}/> SCROLL</span>
              </div>
            </div>
          </FadeIn>
          
          <div className="horizontal-scroll" style={{ display: "flex", gap: "1.5rem", overflowX: "auto", paddingBottom: "2rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
            {galleryItems.filter(b => b.genre === "NF").slice(0, 8).map((book, i) => (
              <div key={i} className="nf-card" style={{ flex: "0 0 320px", width: 320, background: "#fff", borderRadius: 12, padding: "1.2rem", display: "flex", gap: "1rem", alignItems: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                <div style={{ width: 80, height: 110, background: "#f1f5f9", borderRadius: 6, overflow: "hidden", flexShrink: 0 }}>
                  <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : \`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}\${book.coverUrl}\`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop"} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", justifyContent: "center" }}>
                  <Link to={\`/book/\${book.id}\`} style={{ textDecoration: "none" }}>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: "#111", margin: "0 0 0.3rem 0", fontFamily: "'Playfair Display', serif", lineHeight: 1.2 }}>{book.title}</h4>
                  </Link>
                  <p style={{ fontSize: 12, color: "#666", margin: "0 0 0.5rem 0", fontWeight: 500 }}>{book.authorName}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", marginBottom: "0.8rem" }}>
                     {[1,2,3,4].map(star => <span key={star} style={{ color: "#FFCC00", fontSize: 12 }}>★</span>)}
                     <span style={{ color: "#e2e8f0", fontSize: 12 }}>★</span>
                     <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "0.3rem", fontWeight: 600 }}>4.0</span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#0033FF" }}>₹{book.mrp || 200}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          NEW RELEASES (SLANT GREEN)
      ════════════════════════════════════════════ */}
      <section className="bg-slant" style={{ padding: "5rem 2rem", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div style={{ width: 30, height: 2, background: "#00D084" }} />
                  <span style={{ color: "#00D084", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em" }}>FRESH ARRIVALS</span>
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 800, color: "#111", lineHeight: 1.1 }}>New Releases</h2>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                   <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#111" }}><ArrowLeft size={16}/></div>
                   <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#111" }}><ArrowRight size={16}/></div>
                </div>
                <Link to="/catalogue" style={{ color: "#00D084", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  SEE ALL <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </FadeIn>
          
          <div className="horizontal-scroll" style={{ display: "flex", gap: "1.5rem", overflowX: "auto", paddingBottom: "2rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
            {[...galleryItems].reverse().slice(0, 8).map((book, i) => (
              <div key={i} className="nr-card" style={{ flex: "0 0 240px", width: 240, background: "#fff", borderRadius: 16, padding: "1.2rem", position: "relative", display: "flex", flexDirection: "column", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                <div style={{ width: "100%", height: 260, background: "linear-gradient(180deg, #e6f9f0 0%, #ccf4df 100%)", borderRadius: 8, marginBottom: "1.2rem", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : \`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}\${book.coverUrl}\`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop"} alt={book.title} style={{ width: "80%", height: "90%", objectFit: "cover", borderRadius: 4, boxShadow: "0 10px 20px rgba(0,208,132,0.2)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: "#111", margin: "0 0 0.3rem 0", fontFamily: "'Playfair Display', serif" }}>{book.title}</h4>
                  <p style={{ fontSize: 12, color: "#666", margin: "0 0 0.5rem 0", fontWeight: 500 }}>{book.authorName}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", marginBottom: "1rem" }}>
                     {[1,2,3,4].map(star => <span key={star} style={{ color: "#FFCC00", fontSize: 12 }}>★</span>)}
                     <span style={{ color: "#e2e8f0", fontSize: 12 }}>★</span>
                     <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "0.3rem", fontWeight: 600 }}>4.0</span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#00D084" }}>₹{book.mrp || 250}</span>
                  <Link to={\`/book/\${book.id}\`} style={{ width: 32, height: 32, borderRadius: "50%", background: "#00D084", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
`;

    const sectionContact = `
      {/* ════════════════════════════════════════════
          CONTACT SECTION (DARK DOTS)
      ════════════════════════════════════════════ */}
      <section className="bg-dots-dark" style={{ padding: "6rem 2rem" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#FFCC00", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
                 <Mail size={24} color="#111" />
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 800, color: "#fff", marginBottom: "1rem" }}>Get in Touch</h2>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, fontWeight: 500 }}>Publishing queries, promotion details, or simply saying hello.</p>
            </div>
          </FadeIn>

          <FadeIn delay={150}>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                try {
                  await axios.post(\`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/contact\`, {
                    name: contactName,
                    email: contactEmail,
                    message: contactMessage,
                  });
                  toast.success("Thank you! Your message has been received.");
                  setContactName("");
                  setContactEmail("");
                  setContactMessage("");
                } catch (err) {
                  console.error(err);
                  toast.error("Failed to send message. Please try again.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", marginBottom: "3rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#FFCC00", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8rem" }}>FIRST & LAST NAME</label>
                  <input
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    type="text"
                    placeholder="e.g. Jane Doe"
                    className="contact-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#FFCC00", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8rem" }}>EMAIL ADDRESS</label>
                  <input
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    type="email"
                    placeholder="jane@example.com"
                    className="contact-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: "4rem" }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#FFCC00", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8rem" }}>HOW CAN WE HELP?</label>
                <textarea
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  rows={1}
                  placeholder="Tell us about your project or inquiry..."
                  className="contact-input"
                  style={{ width: "100%", resize: "none", overflow: "hidden" }}
                />
              </div>
              
              <div style={{ textAlign: "right" }}>
                <button
                  disabled={isSubmitting}
                  type="submit"
                  style={{
                    background: "#FFCC00",
                    color: "#111",
                    border: "none",
                    padding: "1rem 2.5rem",
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    borderRadius: 50,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                    transition: "all 0.3s",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    boxShadow: "0 4px 20px rgba(255, 204, 0, 0.2)"
                  }}
                >
                  {isSubmitting ? "SENDING..." : "SUBMIT INQUIRY"} <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </FadeIn>
        </div>
      </section>
`;

    // Wait, let's make sure we also preserve the "Books by Language" section which I injected earlier!
    // The structure is:
    // ... "BUY OUR BOOKS — HORIZONTAL SCROLL"
    // ... "BOOKS BY LANGUAGE (RESTORED)"
    // ... "CONTACT SECTION"
    // ... "STYLES"
    
    // I need to replace from BUY OUR BOOKS down to BOOKS BY LANGUAGE with section1
    const endBuyBooks = content.indexOf('{/* ════════════════════════════════════════════\n          BOOKS BY LANGUAGE (RESTORED)\n      ════════════════════════════════════════════ */}');
    
    if (endBuyBooks !== -1) {
        content = content.substring(0, startBuyBooks) + section1 + content.substring(endBuyBooks, startContact) + sectionContact + content.substring(endContact);
        fs.writeFileSync(filePath, content);
        console.log("Successfully rebuilt sections to match user screenshots!");
    } else {
        console.log("Could not find BOOKS BY LANGUAGE section.");
    }
} else {
    console.log("Could not find BUY OUR BOOKS or CONTACT section.");
}
