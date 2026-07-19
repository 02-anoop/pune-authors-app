const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/components/CataloguePage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const returnMatch = content.match(/  return \(\r?\n    <main/);
if (!returnMatch) {
    console.log("Could not find return statement in CataloguePage.tsx");
    process.exit(1);
}

const beforeReturn = content.slice(0, returnMatch.index);

const newReturn = `  return (
    <main style={{ fontFamily: "'Montserrat', sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111", overflowX: "hidden" }}>
      {/* Google Font Injection */}
      <style>{\`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        .skeleton-pulse { animation: pulse 1.5s infinite ease-in-out; }
        .book-card-premium:hover .book-cover-img { transform: scale(1.05); }
        h1, h2, h3, h4, h5, h6 { font-family: 'Montserrat', sans-serif !important; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      \`}</style>
      
      {/* ════════════════════════════════════════════
          CATALOGUE HEADER & HERO (BRIGHT)
      ════════════════════════════════════════════ */}
      <section style={{ position: "relative", background: "#fff", padding: "6rem 2rem 4rem", borderBottom: "1px solid #eaeaea" }}>
        
        <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "2rem", marginBottom: "3rem" }}>
            <div style={{ maxWidth: 600 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#f5f5f5", padding: "0.5rem 1rem", borderRadius: "50px", marginBottom: "1rem" }}>
                 <BookOpen size={14} color="#00C2FF" />
                 <span style={{ fontSize: 12, fontWeight: 800, color: "#111", textTransform: "uppercase", letterSpacing: "0.1em" }}>PAA Digital Library</span>
              </div>
              <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 900, color: "#111", margin: "0 0 1rem 0", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                Explore & Buy <span style={{ color: "#00C2FF" }}>Books</span>
              </h1>
              <p style={{ fontSize: 18, color: "#666", margin: 0, fontWeight: 500 }}>Discover incredible titles curated by the Pune Authors' Association.</p>
            </div>

            {totalItems > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", background: "#f8f9fa", padding: "1rem 2rem", borderRadius: "50px", border: "1px solid #eaeaea", transform: "translateY(10px)" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#FF7A00", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <ShoppingCart size={20} color="#fff" />
                </div>
                <div>
                   <div style={{ fontSize: 12, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: "0.1em" }}>Your Cart</div>
                   <div style={{ fontSize: 18, fontWeight: 900, color: "#111" }}>{totalItems} Item{totalItems !== 1 ? 's' : ''}</div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
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
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1400, margin: "-40px auto 0", padding: "0 2rem", position: "relative", zIndex: 20 }}>
          {/* ════════════════════════════════════════════
              CATEGORY SELECTOR
          ════════════════════════════════════════════ */}
          {activeCategory === "All" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem", paddingBottom: "4rem" }}>
              {(Object.keys(bookCategories).filter(cat => allBooks.some(b => b.genre === cat))).map((cat, idx) => {
                const catBooksCount = allBooks.filter(b => b.genre === cat).length;
                
                // Vibrant color assignments based on index
                const colors = [
                  { bg: "#FF7A00", shadow: "rgba(255,122,0,0.15)", icon: "#fff" },
                  { bg: "#00C2FF", shadow: "rgba(0,194,255,0.15)", icon: "#fff" },
                  { bg: "#00D084", shadow: "rgba(0,208,132,0.15)", icon: "#fff" },
                  { bg: "#FF4FA3", shadow: "rgba(255,79,163,0.15)", icon: "#fff" },
                  { bg: "#7B61FF", shadow: "rgba(123,97,255,0.15)", icon: "#fff" },
                  { bg: "#FFD400", shadow: "rgba(255,212,0,0.15)", icon: "#111" }
                ];
                const c = colors[idx % colors.length];

                return (
                  <div
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    style={{
                      background: c.bg,
                      borderRadius: "30px",
                      padding: "3rem 2rem",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      minHeight: 250,
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      boxShadow: \`0 15px 30px \${c.shadow}\`
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-5px)";
                      const iconBg = e.currentTarget.querySelector('.cat-icon-bg') as HTMLDivElement;
                      if(iconBg) iconBg.style.transform = "scale(1.1) rotate(5deg)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = "none";
                      const iconBg = e.currentTarget.querySelector('.cat-icon-bg') as HTMLDivElement;
                      if(iconBg) iconBg.style.transform = "scale(1) rotate(0deg)";
                    }}
                  >
                    <div className="cat-icon-bg" style={{ width: 80, height: 80, borderRadius: "24px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "auto", transition: "transform 0.3s" }}>
                      <BookOpen size={40} color={c.icon} />
                    </div>
                    
                    <h3 style={{ margin: "2rem 0 0.5rem 0", color: c.icon, fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.02em", position: "relative", zIndex: 10 }}>{cat}</h3>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.2)", padding: "0.5rem 1rem", borderRadius: "50px", width: "fit-content" }}>
                       <span style={{ fontSize: "12px", color: c.icon, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                         {catBooksCount} {catBooksCount === 1 ? 'Title' : 'Titles'}
                       </span>
                       <ArrowRight size={14} color={c.icon} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ background: "#fff", borderRadius: "24px", padding: "1.5rem 2rem", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <button 
                  onClick={() => {
                    handleCategoryChange("All");
                    setSearchQuery("");
                  }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.8rem 1.5rem", background: "#f5f5f5", color: "#111",
                    borderRadius: "50px", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em",
                    border: "none", cursor: "pointer", transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#e5e5e5"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#f5f5f5"; }}
                >
                  <ChevronLeft size={16} /> All Categories
                </button>
                <h2 style={{ fontSize: "2rem", fontWeight: 900, margin: 0, color: getCategoryColor(activeCategory).color }}>{activeCategory}</h2>
              </div>

              {/* Subcategories & Filters */}
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", borderTop: "1px solid #eaeaea", paddingTop: "1.5rem" }}>
                {Object.keys(bookCategories[activeCategory as keyof typeof bookCategories] || {}).length > 0 && (
                  <>
                    <select
                      value={activeSubcategory}
                      onChange={(e) => handleSubcategoryChange(e.target.value)}
                      style={{ padding: "0.8rem 1.5rem", borderRadius: "50px", border: "2px solid #eaeaea", outline: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", background: "#fff", appearance: "none" }}
                    >
                      {["All", ...Object.keys(bookCategories[activeCategory as keyof typeof bookCategories] || {}).filter(sc => allBooks.some(b => b.genre === activeCategory && b.subGenre && b.subGenre.split(" > ")[0].trim() === sc))].map(sc => (
                        <option key={sc} value={sc}>{sc === "All" ? "All Subcategories" : sc}</option>
                      ))}
                    </select>

                    {activeSubcategory !== "All" && ((bookCategories[activeCategory as keyof typeof bookCategories] as any)[activeSubcategory] || []).length > 0 && (
                      <select
                        value={activeSubSubcategory}
                        onChange={(e) => setActiveSubSubcategory(e.target.value)}
                        style={{ padding: "0.8rem 1.5rem", borderRadius: "50px", border: "2px solid #eaeaea", outline: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", background: "#fff", appearance: "none" }}
                      >
                        {["All", ...((bookCategories[activeCategory as keyof typeof bookCategories] as any)[activeSubcategory] || []).filter((ssc: string) => allBooks.some(b => b.genre === activeCategory && b.subGenre && b.subGenre.split(" > ")[0].trim() === activeSubcategory && b.subGenre.split(" > ")[1]?.trim() === ssc))].map(ssc => (
                          <option key={ssc} value={ssc}>{ssc === "All" ? "All Specific Genres" : ssc}</option>
                        ))}
                      </select>
                    )}
                  </>
                )}

                <div style={{ flex: 1, minWidth: 250, position: "relative" }}>
                  <Search size={18} color="#888" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    placeholder="Search by title, author or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: "100%", padding: "0.8rem 3rem", border: "2px solid #eaeaea", borderRadius: "50px", outline: "none", fontSize: 14, fontWeight: 600, boxSizing: "border-box" }}
                    onFocus={e => e.currentTarget.style.borderColor = getCategoryColor(activeCategory).color}
                    onBlur={e => e.currentTarget.style.borderColor = "#eaeaea"}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                      <X size={16} color="#888" />
                    </button>
                  )}
                </div>

                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.8rem 1.5rem", borderRadius: "50px", border: showFilters ? \`2px solid \${getCategoryColor(activeCategory).color}\` : "2px solid #eaeaea", background: showFilters ? getCategoryColor(activeCategory).color : "#fff", color: showFilters ? "#fff" : "#111", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
                >
                  <SlidersHorizontal size={16} /> Filters
                </button>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{ padding: "0.8rem 1.5rem", borderRadius: "50px", border: "2px solid #eaeaea", outline: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", background: "#fff", appearance: "none" }}
                >
                  <option value="default">Sort: Recommended</option>
                  <option value="title">A → Z</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                </select>
              </div>

              {/* Advanced Filters Drawer */}
              {showFilters && (
                <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", padding: "1.5rem", background: "#f8f9fa", borderRadius: "16px", border: "1px solid #eaeaea", marginTop: "1rem" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#888" }}>
                      <span>Max Price</span>
                      <span style={{ color: getCategoryColor(activeCategory).color }}>{maxPrice === '' || maxPrice >= 2000 ? 'Any Price' : \`Under ₹\${maxPrice}\`}</span>
                    </div>
                    <input type="range" min="0" max="2000" step="50" value={maxPrice === '' ? 2000 : maxPrice} onChange={e => setMaxPrice(Number(e.target.value) === 2000 ? '' : Number(e.target.value))} style={{ width: "100%", accentColor: getCategoryColor(activeCategory).color }} />
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#888" }}>Format</span>
                    <select value={formatFilter} onChange={e => setFormatFilter(e.target.value)} style={{ padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid #ccc", outline: "none", fontSize: 14, fontWeight: 600 }}>
                      <option value="All">All Formats</option>
                      <option value="Paperback">Paperback</option>
                      <option value="Hardcover">Hardcover</option>
                      <option value="Ebook">Ebook</option>
                    </select>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#888" }}>Rating</span>
                    <select value={ratingFilter} onChange={e => setRatingFilter(Number(e.target.value))} style={{ padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid #ccc", outline: "none", fontSize: 14, fontWeight: 600 }}>
                      <option value={0}>Any Rating</option>
                      <option value={4}>4+ Stars</option>
                      <option value={3}>3+ Stars</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════
              BOOK RESULTS GRID
          ════════════════════════════════════════════ */}
          {activeCategory !== "All" && (
            <>
              {isLoading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "2rem", padding: "2rem 0 6rem" }}>
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} style={{ background: "#fff", borderRadius: "24px", padding: "1.2rem", height: 380, border: "1px solid #eaeaea", display: "flex", flexDirection: "column" }}>
                      <div style={{ width: "100%", flex: 1, background: "#f5f5f5", borderRadius: "12px", marginBottom: "1rem" }} className="skeleton-pulse"></div>
                      <div style={{ height: 20, width: "80%", background: "#f5f5f5", borderRadius: 4, marginBottom: "0.5rem" }} className="skeleton-pulse"></div>
                      <div style={{ height: 16, width: "60%", background: "#f5f5f5", borderRadius: 4 }} className="skeleton-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : filteredBooks.length === 0 ? (
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
                    return (
                      <div key={book.id} style={{ background: "#fff", borderRadius: "24px", padding: "1.2rem", border: "1px solid #eaeaea", display: "flex", flexDirection: "column", transition: "all 0.2s ease" }} className="book-card-premium" onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = getCategoryColor(activeCategory).color; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#eaeaea"; }}>
                        <Link to={\`/book/\${book.id}\`} style={{ textDecoration: "none", flex: 1, display: "flex", flexDirection: "column" }}>
                          <div style={{ width: "100%", aspectRatio: "3/4", borderRadius: "12px", overflow: "hidden", background: "#f5f5f5", marginBottom: "1.2rem", border: "1px solid #eaeaea" }}>
                            <img src={book.coverUrl || "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400"} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }} className="book-cover-img" />
                          </div>
                          
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                             <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: getCategoryColor(activeCategory).color, background: \`\${getCategoryColor(activeCategory).color}15\`, padding: "0.3rem 0.6rem", borderRadius: "4px" }}>{book.subGenre ? book.subGenre.split(" > ")[0] : book.genre}</div>
                             {book.rating > 0 && <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", fontSize: 12, fontWeight: 700, color: "#FFD400" }}><Star size={12} fill="#FFD400" /> {book.rating.toFixed(1)}</div>}
                          </div>
                          
                          <h3 style={{ fontSize: 17, fontWeight: 800, color: "#111", margin: "0 0 0.2rem 0", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{book.title}</h3>
                          <p style={{ fontSize: 13, color: "#666", margin: "0 0 1rem 0", fontWeight: 600 }}>{book.authorName}</p>
                          
                          <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                            <div>
                               <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#aaa", letterSpacing: "0.1em" }}>Price</div>
                               <div style={{ fontSize: 20, fontWeight: 900, color: "#111" }}>{book.mrp != null ? \`₹\${book.mrp}\` : book.mrpRaw || "TBD"}</div>
                            </div>
                          </div>
                        </Link>
                        
                        <div style={{ marginTop: "1.5rem" }}>
                          {inCart ? (
                            <button onClick={(e) => { e.preventDefault(); addToCart(book.id); }} style={{ width: "100%", padding: "1rem", background: "#f5f5f5", color: "#111", border: "2px solid #eaeaea", borderRadius: "12px", fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}><ShoppingCart size={16} fill="#111" /> In Cart</button>
                          ) : (
                            <button onClick={(e) => { e.preventDefault(); addToCart(book.id); }} style={{ width: "100%", padding: "1rem", background: getCategoryColor(activeCategory).color, color: "#fff", border: "none", borderRadius: "12px", fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "filter 0.2s" }} onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"} onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}><ShoppingCart size={16} /> Add to Cart</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
      </section>
    </main>
  );
}
`;

fs.writeFileSync(filePath, beforeReturn + newReturn);
console.log("CataloguePage.tsx updated to bright theme with Montserrat");
