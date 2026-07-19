const fs = require('fs');

const filePath = 'src/app/components/CataloguePage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// The file contains Git conflict markers.
// We'll split the file by conflict markers and resolve them manually.

const conflictRegex = /<<<<<<< HEAD\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> [a-f0-9]+\n/g;

let matchCount = 0;
content = content.replace(conflictRegex, (match, head, theirs) => {
  matchCount++;
  
  if (matchCount === 1) {
    // Conflict 1: Imports
    return 'import { ShoppingCart, Search, SlidersHorizontal, Star, ChevronRight, ChevronLeft, ArrowRight, ArrowLeft, X, BookOpen, Info, Download, Loader2, CheckCircle2, Circle } from "lucide-react";\n';
  }
  
  if (matchCount === 2) {
    // Conflict 2: Buttons
    return `          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            <button 
              onClick={() => {
                if (activeCategory === "All") {
                  handleDownloadPublicCatalogue();
                } else {
                  downloadCataloguePDF(activeCategory, filteredBooks, setDownloadingType, publicStats, false);
                }
              }}
              disabled={downloadingType !== null}
              style={{
                display: "flex", alignItems: "center", gap: "0.8rem",
                padding: "1rem 2rem", borderRadius: "50px",
                background: downloadingType === "standard" ? "#eee" : (activeCategory === "All" ? "#00C2FF" : getCategoryColor(activeCategory).color), 
                color: downloadingType === "standard" ? "#888" : "#fff",
                fontWeight: 800, fontSize: 15,
                textTransform: "uppercase", letterSpacing: "0.05em",
                border: "none",
                cursor: downloadingType !== null ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: activeCategory === "All" ? "0 10px 30px rgba(0,194,255,0.2)" : "none",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {downloadingType === 'standard' ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} 
              {downloadingType === 'standard' ? "Generating..." : \`Download \${activeCategory === "All" ? "Complete" : activeCategory} PDF\`}
            </button>
            <button
              onClick={() => {
                setSelectionMode(!selectionMode);
                if (selectionMode) setSelectedBooksForCatalogue([]);
              }}
              style={{
                display: "flex", alignItems: "center", gap: "0.8rem",
                padding: "1rem 2rem", borderRadius: "50px",
                background: selectionMode ? "#111" : "#fff",
                color: selectionMode ? "#fff" : "#111",
                fontWeight: 800, fontSize: 15,
                textTransform: "uppercase", letterSpacing: "0.05em",
                border: selectionMode ? "2px solid #111" : "2px solid #eaeaea",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <BookOpen size={18} />
              {selectionMode ? "Cancel Selection" : "Create Custom Catalogue"}
            </button>
          </div>\n`;
  }
  
  if (matchCount === 3) {
    // Conflict 3: Grid and Checkouts
    return `              ) : filteredBooks.length === 0 ? (
                <div style={{ textAlign: "center", padding: "8rem 2rem", background: "#fff", borderRadius: "30px", border: "1px dashed #ccc", marginBottom: "6rem" }}>
                  <Search size={48} color="#ccc" style={{ marginBottom: "1rem" }} />
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#888", marginBottom: "0.5rem" }}>No books found</h3>
                  <p style={{ color: "#aaa", fontSize: 15, fontWeight: 500 }}>Try adjusting your filters or search query.</p>
                  <button onClick={() => { setSearchQuery(""); setMaxPrice(''); setFormatFilter("All"); setRatingFilter(0); }} style={{ marginTop: "1.5rem", padding: "0.8rem 2rem", background: "#111", color: "#fff", borderRadius: "50px", fontWeight: 800, textTransform: "uppercase", border: "none", cursor: "pointer" }}>Clear Filters</button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "2rem", padding: "2rem 0 6rem", alignItems: "flex-start" }}>
                  {filteredBooks.map((book) => {
                    const inCart = cart.includes(book.id);
                    const isSelected = selectedBooksForCatalogue.includes(book.id);
                    return (
                      <div key={book.id} style={{ background: "#fff", borderRadius: "24px", padding: "1.2rem", border: "1px solid", borderColor: selectionMode && isSelected ? getCategoryColor(activeCategory).color : "#eaeaea", display: "flex", flexDirection: "column", transition: "all 0.2s ease", position: "relative" }} className="book-card-premium" onMouseEnter={e => { if(!selectionMode) { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = getCategoryColor(activeCategory).color; } }} onMouseLeave={e => { if(!selectionMode) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#eaeaea"; } }}>
                        
                        {selectionMode && (
                          <div 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedBooksForCatalogue(prev => 
                                prev.includes(book.id) ? prev.filter(id => id !== book.id) : [...prev, book.id]
                              );
                            }}
                            style={{
                              position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 10, cursor: "pointer",
                              background: isSelected ? "rgba(2, 132, 199, 0.05)" : "transparent",
                              borderRadius: "24px", transition: "all 0.2s",
                              display: "flex", alignItems: "flex-start", justifyContent: "flex-end", padding: "1rem"
                            }}
                          >
                            {isSelected ? (
                              <CheckCircle2 size={28} color={getCategoryColor(activeCategory).color} fill="#fff" style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }} />
                            ) : (
                              <Circle size={28} color="#cbd5e1" fill="#fff" style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))", opacity: 0.8 }} />
                            )}
                          </div>
                        )}

                        <Link to={\`/book/\${book.id}\`} style={{ textDecoration: "none", flex: 1, display: "flex", flexDirection: "column" }}>
                          <div style={{ width: "100%", height: "240px", borderRadius: "12px", background: \`linear-gradient(135deg, \${getCategoryColor(activeCategory).bg}, #f8f9fa)\`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.2rem", overflow: "hidden" }}>
                            <img src={book.coverUrl || "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400"} alt={book.title} style={{ height: "85%", width: "auto", aspectRatio: "3/4", objectFit: "cover", borderRadius: "8px", boxShadow: \`0 15px 25px \${getCategoryColor(activeCategory).color}33\`, transition: "transform 0.5s" }} className="book-cover-img" />
                          </div>
                          
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                             <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: getCategoryColor(activeCategory).color, background: \`\${getCategoryColor(activeCategory).color}15\`, padding: "0.3rem 0.6rem", borderRadius: "4px" }}>{book.subGenre ? book.subGenre.split(" > ")[0] : book.genre}</div>
                             {book.rating > 0 && <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", fontSize: 12, fontWeight: 700, color: "#FFD400" }}><Star size={12} fill="#FFD400" /> {book.rating.toFixed(1)}</div>}
                          </div>
                          
                          <h3 style={{ fontSize: 17, fontWeight: 800, color: "#111", margin: "0 0 0.2rem 0", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontFamily: "'Playfair Display', serif" }}>{book.title}</h3>
                          <p style={{ fontSize: 13, color: "#666", margin: "0 0 1rem 0", fontWeight: 600 }}>{book.authorName}</p>
                          
                          <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                            <div>
                               <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#aaa", letterSpacing: "0.1em" }}>Price</div>
                               <div style={{ fontSize: 20, fontWeight: 900, color: "#111" }}>{book.mrp != null ? \`₹\${book.mrp}\` : book.mrpRaw || "TBD"}</div>
                            </div>
                          </div>
                        </Link>
                        
                        {!selectionMode && (
                          <div style={{ marginTop: "1.5rem" }}>
                            {inCart ? (
                              <button onClick={(e) => { e.preventDefault(); addToCart(book.id); }} style={{ width: "100%", padding: "1rem", background: "#f5f5f5", color: "#111", border: "2px solid #eaeaea", borderRadius: "12px", fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}><ShoppingCart size={16} fill="#111" /> In Cart</button>
                            ) : (
                              <button onClick={(e) => { e.preventDefault(); addToCart(book.id); }} style={{ width: "100%", padding: "1rem", background: getCategoryColor(activeCategory).color, color: "#fff", border: "none", borderRadius: "12px", fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "filter 0.2s" }} onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"} onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}><ShoppingCart size={16} /> Add to Cart</button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
      </section>

      {selectionMode && (
        <div style={{
          position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)",
          background: "#1e293b", color: "#fff", borderRadius: 16,
          padding: "1rem 1.5rem", boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", gap: "1.5rem", zIndex: 100,
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: "#334155", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={18} color="#94a3b8" />
            </div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700 }}>
                {selectedBooksForCatalogue.length} Book{selectedBooksForCatalogue.length !== 1 ? "s" : ""} Selected
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>For Custom Catalogue</div>
            </div>
          </div>
          <div style={{ width: 1, height: 30, background: "rgba(255,255,255,0.1)" }}></div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button 
              onClick={() => {
                setSelectionMode(false);
                setSelectedBooksForCatalogue([]);
              }}
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", color: "#e2e8f0", padding: "0.5rem 1rem", borderRadius: 8, fontWeight: 600, fontSize: 13, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                if (selectedBooksForCatalogue.length === 0) {
                  toast.error("Please select at least one book.");
                  return;
                }
                const selectedBooks = allBooks.filter(b => selectedBooksForCatalogue.includes(b.id));
                downloadCataloguePDF("Personalized", selectedBooks, setDownloadingType, publicStats, false);
              }}
              disabled={downloadingType !== null || selectedBooksForCatalogue.length === 0}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#00C2FF", border: "none", cursor: (downloadingType !== null || selectedBooksForCatalogue.length === 0) ? "not-allowed" : "pointer", color: "#fff", padding: "0.5rem 1.25rem", borderRadius: 8, fontWeight: 700, fontSize: 13, opacity: (downloadingType !== null || selectedBooksForCatalogue.length === 0) ? 0.5 : 1 }}
            >
              {downloadingType === 'standard' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Generate PDF
            </button>
          </div>
        </div>
      )}

      {!selectionMode && cart.length > 0 && (
        <div style={{
          position: "fixed", bottom: "1.5rem", right: "1.5rem",
          background: "#1a1a2e", color: "#fff", borderRadius: 14,
          padding: "1rem 1.5rem", boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          display: "flex", alignItems: "center", gap: "1rem", zIndex: 100,
        }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700 }}>{totalItems} book{totalItems > 1 ? "s" : ""} selected</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>₹{cartTotal} total</div>
          </div>
          <button onClick={() => {
              const token = localStorage.getItem("token");
              const role = localStorage.getItem("userRole");
              if (!token || role !== "CUSTOMER") {
                navigate("/login?role=CUSTOMER&redirect=/checkout");
              } else {
                navigate("/checkout");
              }
            }}
            style={{ background: "#FF7A00", border: "none", cursor: "pointer", color: "#fff", padding: "0.5rem 1.1rem", borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap" }}>
            Checkout <ChevronRight size={14} style={{ display: "inline", verticalAlign: "middle" }} />
          </button>
        </div>
      )}\n`;
  }
  
  return match; // fallback
});

fs.writeFileSync(filePath, content);
console.log("Merged conflicts successfully!");
