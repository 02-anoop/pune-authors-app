
import re

with open("src/app/components/CataloguePage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

new_buttons_html = """
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-end" }}>
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
                  padding: "1rem 2.5rem", borderRadius: "50px",
                  background: downloadingType === "standard" ? "#eee" : "#1e40af", 
                  color: downloadingType === "standard" ? "#888" : "#fff",
                  fontWeight: 800, fontSize: 15,
                  textTransform: "uppercase", letterSpacing: "0.02em",
                  border: "none",
                  cursor: downloadingType !== null ? "not-allowed" : "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 8px 20px rgba(30,64,175,0.4)",
                }}
                onMouseEnter={e => { 
                  e.currentTarget.style.transform = "translateY(-2px)"; 
                  e.currentTarget.style.filter = "brightness(1.1)";
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.transform = "translateY(0)"; 
                  e.currentTarget.style.filter = "brightness(1)";
                }}
              >
                {downloadingType === 'standard' ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} 
                {downloadingType === 'standard' ? "Generating..." : `Download ${activeCategory === "All" ? "Complete" : activeCategoryDisplay} Catalogue`}
              </button>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => {
                    setBulkSelectionMode(!bulkSelectionMode);
                    if (bulkSelectionMode) setSelectedBooksForBulk([]);
                    if (!bulkSelectionMode) { setSelectionMode(false); setSelectedBooksForCatalogue([]); }
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.8rem",
                    padding: "0.8rem 2rem", borderRadius: "50px",
                    background: bulkSelectionMode ? "#1d4ed8" : "#2563eb",
                    color: "#fff",
                    fontWeight: 700, fontSize: 14,
                    textTransform: "uppercase", letterSpacing: "0.02em",
                    border: bulkSelectionMode ? "2px solid #1e40af" : "2px solid #2563eb",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 15px rgba(37,99,235,0.3)"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; setHoveredButton('bulk'); }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; setHoveredButton(null); }}
                >
                  <ShoppingCart size={16} />
                  {bulkSelectionMode ? "Cancel Bulk Order" : "Raise Bulk Order"}
                </button>
                {hoveredButton === 'bulk' && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    marginTop: "0.8rem",
                    background: "rgba(15, 23, 42, 0.95)",
                    color: "#fff",
                    padding: "0.7rem 1.2rem",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 500,
                    lineHeight: "1.4",
                    width: "260px",
                    textAlign: "center",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
                    zIndex: 100,
                    pointerEvents: "none",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}>
                    <div style={{
                      position: "absolute",
                      top: "-4px",
                      left: "50%",
                      transform: "translateX(-50%) rotate(45deg)",
                      width: "8px",
                      height: "8px",
                      background: "rgba(15, 23, 42, 0.95)",
                      borderLeft: "1px solid rgba(255,255,255,0.08)",
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                    }} />
                    Select multiple books to place a bulk book order and proceed to checkout.
                  </div>
                )}
              </div>

              <div style={{ position: "relative" }}>
                <button
                  onClick={() => {
                    setSelectionMode(!selectionMode);
                    if (selectionMode) setSelectedBooksForCatalogue([]);
                    if (!selectionMode) { setBulkSelectionMode(false); setSelectedBooksForBulk([]); }
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.8rem",
                    padding: "0.6rem 1.5rem", borderRadius: "50px",
                    background: selectionMode ? "#2563eb" : "#3b82f6",
                    color: "#fff",
                    fontWeight: 700, fontSize: 13,
                    textTransform: "uppercase", letterSpacing: "0.02em",
                    border: selectionMode ? "2px solid #1d4ed8" : "2px solid #3b82f6",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 15px rgba(59,130,246,0.3)"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; setHoveredButton('catalogue'); }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; setHoveredButton(null); }}
                >
                  <BookOpen size={16} />
                  {selectionMode ? "Cancel Selection" : "Create Custom Catalogue"}
                </button>
                {hoveredButton === 'catalogue' && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    marginTop: "0.8rem",
                    background: "rgba(15, 23, 42, 0.95)",
                    color: "#fff",
                    padding: "0.7rem 1.2rem",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 500,
                    lineHeight: "1.4",
                    width: "260px",
                    textAlign: "center",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
                    zIndex: 100,
                    pointerEvents: "none",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}>
                    <div style={{
                      position: "absolute",
                      top: "-4px",
                      left: "50%",
                      transform: "translateX(-50%) rotate(45deg)",
                      width: "8px",
                      height: "8px",
                      background: "rgba(15, 23, 42, 0.95)",
                      borderLeft: "1px solid rgba(255,255,255,0.08)",
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                    }} />
                    Select multiple books to generate and download a customized PDF catalogue.
                  </div>
                )}
              </div>
            </div>
"""

start_str = '<div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-end" }}>'
end_str = '            </div>\n          </div>\n        </div>\n      </section>'

start_idx = content.find(start_str)
end_idx = content.find(end_str, start_idx)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + new_buttons_html.strip() + "\n          </div>\n        </div>\n      </section>" + content[end_idx + len(end_str):]
    with open("src/app/components/CataloguePage.tsx", "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Done")
else:
    print("Failed to find start or end")


