const fs = require('fs');
const path = 'src/app/components/LandingPage.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacement = `      {/* ════════════════════════════════════════════
          NEW RELEASES (Dotted Background Full Width)
      ════════════════════════════════════════════ */}
      <section style={{ padding: "4rem 2rem", backgroundImage: \`radial-gradient(\${C.border} 2px, transparent 2px)\`, backgroundSize: "20px 20px", backgroundColor: C.white }} id="buy-books">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {isLoadingBooks ? (
             <div style={{ display: "flex", gap: "1.5rem", overflow: "hidden" }}>
               {[1, 2, 3, 4].map(i => <div key={i} style={{ flex: "0 0 240px", height: 320, background: C.cream }} className="skeleton-pulse" />)}
             </div>
          ) : galleryItems.length > 0 && (
            <FadeIn delay={50}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.8rem", fontWeight: 700, color: C.dark }}>New Releases</h3>
                <Link to="/catalogue?category=All" style={{ fontSize: 13, fontWeight: 700, color: C.dark, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem", background: C.gold, padding: "0.6rem 1.4rem", borderRadius: "50px" }}>
                  View All <ArrowRight size={14} />
                </Link>
              </div>
              <div className="horizontal-scroll" style={{ display: "flex", gap: "1.5rem", overflowX: "auto", paddingBottom: "2rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", alignItems: "flex-start" }}>
                 {[...galleryItems].reverse().slice(0, 10).map((book, i) => (
                    <div key={\`new-\${book.id || i}\`} className="book-card group" style={{ flex: "0 0 220px", width: 220, display: "flex", flexDirection: "column" }}>
                      <Link to={\`/book/\${book.id}\`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", width: "100%" }}>
                        <div style={{ width: "100%", paddingTop: "133.33%", overflow: "hidden", marginBottom: "1rem", background: C.goldBg, position: "relative" }}>
                          <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : \`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}\${book.coverUrl}\`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop"} alt={book.title} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: C.dark, margin: "0 0 0.2rem 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.title}</h4>
                        <span style={{ fontSize: 14, color: C.amber, fontWeight: 600, marginBottom: "0.4rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.authorName}</span>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>{book.mrp != null ? \`₹\${book.mrp}\` : book.mrpRaw || "Price TBD"}</div>
                      </Link>
                    </div>
                 ))}
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FICTION (Grass Green Full Width)
      ════════════════════════════════════════════ */}
      <section style={{ padding: "4rem 2rem", background: C.amber }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {!isLoadingBooks && galleryItems.filter(b => b.genre === "F").length > 0 && (
            <FadeIn delay={100}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.8rem", fontWeight: 700, color: C.white }}>Fiction Books</h3>
                <Link to="/catalogue?category=Fiction" style={{ fontSize: 13, fontWeight: 700, color: C.dark, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem", background: C.gold, padding: "0.6rem 1.4rem", borderRadius: "50px" }}>
                  View Fiction <ArrowRight size={14} />
                </Link>
              </div>
              <div className="horizontal-scroll" style={{ display: "flex", gap: "1.5rem", overflowX: "auto", paddingBottom: "2rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", alignItems: "flex-start" }}>
                 {galleryItems.filter(b => b.genre === "F").slice(0, 10).map((book, i) => (
                    <div key={\`fic-\${book.id || i}\`} className="book-card group" style={{ flex: "0 0 220px", width: 220, display: "flex", flexDirection: "column" }}>
                      <Link to={\`/book/\${book.id}\`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", width: "100%" }}>
                        <div style={{ width: "100%", paddingTop: "133.33%", overflow: "hidden", marginBottom: "1rem", background: C.goldBg, position: "relative" }}>
                          <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : \`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}\${book.coverUrl}\`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop"} alt={book.title} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: C.white, margin: "0 0 0.2rem 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.title}</h4>
                        <span style={{ fontSize: 14, color: C.gold, fontWeight: 600, marginBottom: "0.4rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.authorName}</span>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.white }}>{book.mrp != null ? \`₹\${book.mrp}\` : book.mrpRaw || "Price TBD"}</div>
                      </Link>
                    </div>
                 ))}
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          NON-FICTION (Crumpled Paper Full Width)
      ════════════════════════════════════════════ */}
      <section style={{ padding: "4rem 2rem", backgroundImage: "url(/crumpled-paper.png)", backgroundSize: "cover" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {!isLoadingBooks && galleryItems.filter(b => b.genre === "NF").length > 0 && (
            <FadeIn delay={200}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.8rem", fontWeight: 700, color: C.dark }}>Non-Fiction Books</h3>
                <Link to="/catalogue?category=Non-Fiction" style={{ fontSize: 13, fontWeight: 700, color: C.dark, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem", background: C.gold, padding: "0.6rem 1.4rem", borderRadius: "50px" }}>
                  View Non-Fiction <ArrowRight size={14} />
                </Link>
              </div>
              <div className="horizontal-scroll" style={{ display: "flex", gap: "1.5rem", overflowX: "auto", paddingBottom: "2rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", alignItems: "flex-start" }}>
                 {galleryItems.filter(b => b.genre === "NF").slice(0, 10).map((book, i) => (
                    <div key={\`nf-\${book.id || i}\`} className="book-card group" style={{ flex: "0 0 220px", width: 220, display: "flex", flexDirection: "column" }}>
                      <Link to={\`/book/\${book.id}\`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", width: "100%" }}>
                        <div style={{ width: "100%", paddingTop: "133.33%", overflow: "hidden", marginBottom: "1rem", background: C.goldBg, position: "relative" }}>
                          <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : \`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}\${book.coverUrl}\`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop"} alt={book.title} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: C.dark, margin: "0 0 0.2rem 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.title}</h4>
                        <span style={{ fontSize: 14, color: C.amber, fontWeight: 600, marginBottom: "0.4rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.authorName}</span>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>{book.mrp != null ? \`₹\${book.mrp}\` : book.mrpRaw || "Price TBD"}</div>
                      </Link>
                    </div>
                 ))}
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CHILDREN'S BOOKS (Sky Blue Full Width)
      ════════════════════════════════════════════ */}
      <section style={{ padding: "4rem 2rem", background: C.greenLight }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {!isLoadingBooks && galleryItems.filter(b => b.genre === "C").length > 0 && (
            <FadeIn delay={300}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.8rem", fontWeight: 700, color: C.dark }}>Children's Books</h3>
                <Link to="/catalogue?category=Children's corner" style={{ fontSize: 13, fontWeight: 700, color: C.white, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem", background: C.dark, padding: "0.6rem 1.4rem", borderRadius: "50px" }}>
                  View Children's <ArrowRight size={14} />
                </Link>
              </div>
              <div className="horizontal-scroll" style={{ display: "flex", gap: "1.5rem", overflowX: "auto", paddingBottom: "2rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", alignItems: "flex-start" }}>
                 {galleryItems.filter(b => b.genre === "C").slice(0, 10).map((book, i) => (
                    <div key={\`child-\${book.id || i}\`} className="book-card group" style={{ flex: "0 0 220px", width: 220, display: "flex", flexDirection: "column" }}>
                      <Link to={\`/book/\${book.id}\`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", width: "100%" }}>
                        <div style={{ width: "100%", paddingTop: "133.33%", overflow: "hidden", marginBottom: "1rem", background: C.goldBg, position: "relative" }}>
                          <img src={book.coverUrl ? (book.coverUrl.startsWith("http") ? book.coverUrl : \`\${import.meta.env.VITE_API_URL || "http://localhost:3001"}\${book.coverUrl}\`) : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop"} alt={book.title} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: C.dark, margin: "0 0 0.2rem 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.title}</h4>
                        <span style={{ fontSize: 14, color: C.amber, fontWeight: 600, marginBottom: "0.4rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.authorName}</span>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>{book.mrp != null ? \`₹\${book.mrp}\` : book.mrpRaw || "Price TBD"}</div>
                      </Link>
                    </div>
                 ))}
              </div>
            </FadeIn>
          )}
        </div>
      </section>`;

let startIndex = -1;
let endIndex = -1;

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('BUY OUR BOOKS — HORIZONTAL SCROLL')) {
    startIndex = i - 1; // get the previous comment line
  }
  if (lines[i].includes('BOOKS BY GENRE & LANGUAGE')) {
    endIndex = i - 1;
    break;
  }
}

if (startIndex !== -1 && endIndex !== -1) {
  const before = lines.slice(0, startIndex).join('\n');
  const after = lines.slice(endIndex).join('\n');
  fs.writeFileSync(path, before + '\n' + replacement + '\n\n' + after, 'utf8');
  console.log('Successfully replaced books sections');
} else {
  console.log('Could not find markers');
}
