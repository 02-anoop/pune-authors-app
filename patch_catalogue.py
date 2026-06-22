import re

filepath = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/CataloguePage.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import
content = content.replace('import { Link, useNavigate } from "react-router";',
                          'import { Link, useNavigate } from "react-router";\nimport { bookCategories } from "../data/categories";')

# 2. Replace CATEGORIES and helper functions
cat_block_pattern = re.compile(r'// ── Category config ──.+?// ── Normalise both JSON files into one flat list ──', re.DOTALL)

new_cat_block = """// ── Category config ─────────────────────────────────────────────────────────
const getCategoryColor = (cat: string) => {
    const colors = [
        { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
        { color: "#db2777", bg: "#fdf2f8", border: "#fbcfe8" },
        { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
        { color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
        { color: "#9333ea", bg: "#faf5ff", border: "#e9d5ff" },
        { color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
    ];
    if (cat === "All" || !cat) return { color: "#1a1a2e", bg: "#f3f3f7", border: "transparent" };
    let hash = 0;
    for (let i = 0; i < cat.length; i++) {
        hash = cat.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

// ── Normalise both JSON files into one flat list ──"""
content = cat_block_pattern.sub(new_cat_block, content)

# 3. Update CatalogueBook interface
content = content.replace('genre: "NF" | "F" | "C";', 'genre: string;')

# 4. Update States & Handlers
state_old = """  const [activeCategory, setActiveCategory] = useState<"All" | CategoryName>("All");
  const [activeSubGenre, setActiveSubGenre] = useState("All");"""
state_new = """  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeSubcategory, setActiveSubcategory] = useState<string>("All");
  const [activeSubSubcategory, setActiveSubSubcategory] = useState<string>("All");"""
content = content.replace(state_old, state_new)

# 5. Remove toGenreCode & update fetch logic
to_genre_code_pattern = re.compile(r'  // Normalize genre string to internal code.*?  useEffect\(\(\) => \{', re.DOTALL)
fetch_new = """  useEffect(() => {"""
content = to_genre_code_pattern.sub(fetch_new, content)

content = content.replace('genre: toGenreCode(b.genre),', 'genre: b.genre || "Unknown",')

# 6. Handlers update
handlers_old = """  const catMeta = activeCategory !== "All" ? CATEGORIES[activeCategory as CategoryName] : null;
  const subGenres = catMeta ? catMeta.subGenres : [];

  // Reset subgenre on category change
  const handleCategoryChange = (cat: "All" | CategoryName) => {
    setActiveCategory(cat);
    setActiveSubGenre("All");
  };"""
handlers_new = """  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setActiveSubcategory("All");
    setActiveSubSubcategory("All");
  };

  const handleSubcategoryChange = (sc: string) => {
    setActiveSubcategory(sc);
    setActiveSubSubcategory("All");
  };"""
content = content.replace(handlers_old, handlers_new)

# 7. Update Filter logic
filter_old = """    if (activeCategory !== "All") {
      const code = CATEGORIES[activeCategory as CategoryName].code;
      list = list.filter((b) => b.genre === code);
    }

    if (activeSubGenre !== "All") {
      list = list.filter((b) => b.subGenre.toLowerCase() === activeSubGenre.toLowerCase());
    }"""
filter_new = """    if (activeCategory !== "All") {
      list = list.filter((b) => b.genre === activeCategory);
    }

    if (activeSubcategory !== "All") {
      list = list.filter((b) => {
        if (!b.subGenre) return false;
        const parts = b.subGenre.split(" > ").map(s => s.trim());
        return parts[0] === activeSubcategory;
      });
    }

    if (activeSubSubcategory !== "All") {
      list = list.filter((b) => {
        if (!b.subGenre) return false;
        const parts = b.subGenre.split(" > ").map(s => s.trim());
        return parts.length > 1 && parts[1] === activeSubSubcategory;
      });
    }"""
content = content.replace(filter_old, filter_new)
content = content.replace('[activeCategory, activeSubGenre, searchQuery, sortBy, allBooks]', '[activeCategory, activeSubcategory, activeSubSubcategory, searchQuery, sortBy, allBooks]')

# 8. Genre label and color
content = content.replace('  const genreLabel = (g: string) =>\n    g === "NF" ? "Non-Fiction" : g === "F" ? "Fiction" : "Children";\n  const genreColor = (g: string) =>\n    g === "NF" ? CATEGORIES["Non-Fiction"] : g === "F" ? CATEGORIES.Fiction : CATEGORIES.Children;', '  const genreLabel = (g: string) => g || "Unknown";\n  const genreColor = (g: string) => getCategoryColor(g);')

# 9. PDF Links
pdf_links_old = """          {/* PDF Catalogue Downloads */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            <a
              href="/catalogues/fiction-catalogue.pdf"
              download="Fiction-Catalogue-PAA.pdf"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#fdf2f8", color: "#db2777", border: "1.5px solid #fbcfe8", borderRadius: 10, padding: "0.55rem 1.1rem", fontSize: 13, fontWeight: 700, textDecoration: "none", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fce7f3")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fdf2f8")}
            >
              <Download size={13} /> Download Fiction Catalogue (PDF)
            </a>
            <a
              href="/catalogues/non-fiction-catalogue.pdf"
              download="Non-Fiction-Catalogue-PAA.pdf"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#eff6ff", color: "#2563eb", border: "1.5px solid #bfdbfe", borderRadius: 10, padding: "0.55rem 1.1rem", fontSize: 13, fontWeight: 700, textDecoration: "none", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#dbeafe")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#eff6ff")}
            >
              <Download size={13} /> Download Non-Fiction Catalogue (PDF)
            </a>
          </div>"""
pdf_links_new = """          {/* Dynamic PDF Catalogue Download */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            <button
              onClick={() => downloadCataloguePDF(activeCategory === "All" ? "Complete" : activeCategory, filteredBooks)}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 10, padding: "0.55rem 1.1rem", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "background 0.15s" }}
            >
              <Download size={13} /> Download {activeCategory === "All" ? "Complete" : activeCategory} Catalogue (PDF)
            </button>
          </div>"""
content = content.replace(pdf_links_old, pdf_links_new)

# 10. Tabs and Chips
tabs_old = """          {/* Top-level category tabs (no emojis) */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
            {(["All", "Non-Fiction", "Fiction", "Children"] as Array<"All" | CategoryName>).map((cat) => {
              const meta = cat !== "All" ? CATEGORIES[cat as CategoryName] : null;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  style={{
                    padding: "0.55rem 1.25rem",
                    borderRadius: 10,
                    border: `2px solid ${isActive ? (meta?.color || "#1a1a2e") : "transparent"}`,
                    background: isActive ? (meta?.bg || "#1a1a2e") : "#f3f3f7",
                    color: isActive ? (meta?.color || "#fff") : "#4b5563",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {cat === "All" ? "All Books" : cat}
                </button>
              );
            })}
          </div>

          {/* Sub-genre chips */}
          {subGenres.length > 1 && (
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
              {subGenres.map((sg) => {
                const isActive = activeSubGenre === sg;
                return (
                  <button
                    key={sg}
                    onClick={() => setActiveSubGenre(sg)}
                    style={{
                      padding: "0.35rem 0.9rem",
                      borderRadius: 20,
                      border: `1.5px solid ${isActive ? catMeta!.color : "rgba(0,0,0,0.1)"}`,
                      background: isActive ? catMeta!.color : "#fff",
                      color: isActive ? "#fff" : "#6b6b80",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {sg}
                  </button>
                );
              })}
            </div>
          )}"""

tabs_new = """          {/* Top-level category tabs */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
            {(["All", ...Object.keys(bookCategories)]).map((cat) => {
              const meta = getCategoryColor(cat);
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  style={{
                    padding: "0.55rem 1.25rem",
                    borderRadius: 10,
                    border: `2px solid ${isActive ? (meta.color || "#1a1a2e") : "transparent"}`,
                    background: isActive ? (meta.bg || "#1a1a2e") : "#f3f3f7",
                    color: isActive ? (meta.color || "#fff") : "#4b5563",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {cat === "All" ? "All Books" : cat}
                </button>
              );
            })}
          </div>

          {/* Subcategory chips */}
          {activeCategory !== "All" && Object.keys(bookCategories[activeCategory as keyof typeof bookCategories] || {}).length > 0 && (
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
              {["All", ...Object.keys(bookCategories[activeCategory as keyof typeof bookCategories] || {})].map((sc) => {
                const isActive = activeSubcategory === sc;
                const meta = getCategoryColor(activeCategory);
                return (
                  <button
                    key={sc}
                    onClick={() => handleSubcategoryChange(sc)}
                    style={{
                      padding: "0.35rem 0.9rem",
                      borderRadius: 20,
                      border: `1.5px solid ${isActive ? meta.color : "rgba(0,0,0,0.1)"}`,
                      background: isActive ? meta.color : "#fff",
                      color: isActive ? "#fff" : "#6b6b80",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {sc}
                  </button>
                );
              })}
            </div>
          )}

          {/* Sub-Subcategory chips */}
          {activeCategory !== "All" && activeSubcategory !== "All" && ((bookCategories[activeCategory as keyof typeof bookCategories] as any)[activeSubcategory] || []).length > 0 && (
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
              {["All", ...((bookCategories[activeCategory as keyof typeof bookCategories] as any)[activeSubcategory] || [])].map((ssc: string) => {
                const isActive = activeSubSubcategory === ssc;
                const meta = getCategoryColor(activeCategory);
                return (
                  <button
                    key={ssc}
                    onClick={() => setActiveSubSubcategory(ssc)}
                    style={{
                      padding: "0.3rem 0.8rem",
                      borderRadius: 20,
                      border: `1px solid ${isActive ? meta.color : "rgba(0,0,0,0.1)"}`,
                      background: isActive ? meta.bg : "#f9fafb",
                      color: isActive ? meta.color : "#6b6b80",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {ssc}
                  </button>
                );
              })}
            </div>
          )}"""

content = content.replace(tabs_old, tabs_new)

# 11. Results bar update
results_bar_old = """        {activeCategory !== "All" && catMeta && (
          <span style={{ background: catMeta.bg, color: catMeta.color, border: `1px solid ${catMeta.border}`, borderRadius: 20, padding: "0.2rem 0.7rem", fontSize: 12, fontWeight: 600 }}>
            {activeCategory}
          </span>
        )}"""
results_bar_new = """        {activeCategory !== "All" && (
          <span style={{ background: getCategoryColor(activeCategory).bg, color: getCategoryColor(activeCategory).color, border: `1px solid ${getCategoryColor(activeCategory).border}`, borderRadius: 20, padding: "0.2rem 0.7rem", fontSize: 12, fontWeight: 600 }}>
            {activeCategory}
          </span>
        )}"""
content = content.replace(results_bar_old, results_bar_new)

# 12. Clear Filters Button update
clear_filters_old = """<button onClick={() => { setSearchQuery(""); setActiveCategory("All"); setActiveSubGenre("All"); }}"""
clear_filters_new = """<button onClick={() => { setSearchQuery(""); setActiveCategory("All"); setActiveSubcategory("All"); setActiveSubSubcategory("All"); }}"""
content = content.replace(clear_filters_old, clear_filters_new)

# 13. PDF Download Button update
pdf_btn_old = """                  background: catMeta ? catMeta.color : "#1a1a2e","""
pdf_btn_new = """                  background: activeCategory !== "All" ? getCategoryColor(activeCategory).color : "#1a1a2e","""
content = content.replace(pdf_btn_old, pdf_btn_new)


with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated successfully")
