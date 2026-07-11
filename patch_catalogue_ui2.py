import re

with open('src/app/components/CataloguePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update signature of downloadCataloguePDF
content = content.replace(
    'export async function downloadCataloguePDF(label: string, books: CatalogueBook[], setDownloading: (val: boolean) => void) {',
    'export async function downloadCataloguePDF(label: string, books: CatalogueBook[], setDownloading: (val: boolean) => void, stats: any = {}, isPrintable: boolean = false) {'
)

# 2. Add color variables inside downloadCataloguePDF
vars_code = """    const bgColor = isPrintable ? '#f0f9ff' : '#0f172a';
    const textColor = isPrintable ? '#0f172a' : '#fff';
    const mutedColor = isPrintable ? '#334155' : '#e2e8f0';
    const highlightColor = isPrintable ? '#0284c7' : '#b44d28';
    const invertedFilter = isPrintable ? '' : 'filter: brightness(0) invert(1);';
"""
content = content.replace(
    '    const { jsPDF, html2canvas } = await loadPdfLibs();',
    '    const { jsPDF, html2canvas } = await loadPdfLibs();\n' + vars_code
)

# Replace stats in the Introduction & Vision text
content = content.replace('Currently the group has approx. 50 authors.', 'Currently the group has approx. ${stats?.authors || 50} authors.')
content = content.replace('There are 140 titles-books from these authors', 'There are ${stats?.books || 140} titles-books from these authors')
content = content.replace('organised nearly 34 Literary Events', 'organised nearly ${stats?.events || 34} Literary Events')
content = content.replace('donated till date 1600 copies of books', 'donated till date ${stats?.totalDonatedBooks || 1600} copies of books')

# Replace colors in the HTML template strings
# For Author pages
content = content.replace('background: #0f172a;', 'background: ${bgColor};')
content = content.replace('color: #fff;', 'color: ${textColor};')
content = content.replace('color: #e2e8f0;', 'color: ${mutedColor};')
content = content.replace('filter: brightness(0) invert(1);', '${invertedFilter}')

# Fix the backgroundColor for html2canvas
content = content.replace("backgroundColor: '#0f172a',", "backgroundColor: bgColor,")

# Add the second button to the UI
button1_code = """            <button
              disabled={isDownloadingPDF}
              onClick={() => downloadCataloguePDF(activeCategory === "All" ? "Complete" : activeCategory, filteredBooks, setIsDownloadingPDF, publicStats, false)}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: isDownloadingPDF ? "#475569" : "#1a1a2e", color: "#fff", border: "none", borderRadius: 10, padding: "0.55rem 1.1rem", fontSize: 13, fontWeight: 700, cursor: isDownloadingPDF ? "not-allowed" : "pointer", transition: "background 0.15s" }}
            >
              {isDownloadingPDF ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Download size={13} />} 
              {isDownloadingPDF ? "Generating PDF..." : `Download ${activeCategory === "All" ? "Complete" : activeCategory} Catalogue (PDF)`}
            </button>
            <button
              disabled={isDownloadingPDF}
              onClick={() => downloadCataloguePDF(activeCategory === "All" ? "Complete" : activeCategory, filteredBooks, setIsDownloadingPDF, publicStats, true)}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: isDownloadingPDF ? "#e2e8f0" : "#f0f9ff", color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: 10, padding: "0.55rem 1.1rem", fontSize: 13, fontWeight: 700, cursor: isDownloadingPDF ? "not-allowed" : "pointer", transition: "background 0.15s" }}
            >
              {isDownloadingPDF ? <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div> : <Download size={13} color="#0f172a" />} 
              {isDownloadingPDF ? "Generating Printable PDF..." : `Printable ${activeCategory === "All" ? "Complete" : activeCategory} Catalogue (PDF)`}
            </button>"""

original_button = """            <button
              disabled={isDownloadingPDF}
              onClick={() => downloadCataloguePDF(activeCategory === "All" ? "Complete" : activeCategory, filteredBooks, setIsDownloadingPDF)}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: isDownloadingPDF ? "#475569" : "#1a1a2e", color: "#fff", border: "none", borderRadius: 10, padding: "0.55rem 1.1rem", fontSize: 13, fontWeight: 700, cursor: isDownloadingPDF ? "not-allowed" : "pointer", transition: "background 0.15s" }}
            >
              {isDownloadingPDF ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Download size={13} />} 
              {isDownloadingPDF ? "Generating PDF..." : `Download ${activeCategory === "All" ? "Complete" : activeCategory} Catalogue (PDF)`}
            </button>"""

content = content.replace(original_button, button1_code)

bottom_button = """                <button
                onClick={() => downloadCataloguePDF(activeCategory === "All" ? "Complete" : activeCategory, filteredBooks, setIsDownloadingPDF)}
                disabled={isDownloadingPDF}
                style={{ 
                  display: "flex", alignItems: "center", gap: "0.5rem", 
                  background: isDownloadingPDF ? "#475569" : (activeCategory !== "All" ? getCategoryColor(activeCategory).color : "#1a1a2e"), 
                  color: "#fff", border: "none", borderRadius: 10, padding: "0.55rem 1.1rem", 
                  fontSize: 13, fontWeight: 700, cursor: isDownloadingPDF ? "not-allowed" : "pointer",
                  transition: "background 0.15s" 
                }}
              >
              {isDownloadingPDF ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Download size={14} />} 
              {isDownloadingPDF ? "Generating PDF..." : `Download ${activeCategory === "All" ? "Complete" : activeCategory} Catalogue (PDF)`}
              </button>"""

bottom_button_replacement = """                <button
                onClick={() => downloadCataloguePDF(activeCategory === "All" ? "Complete" : activeCategory, filteredBooks, setIsDownloadingPDF, publicStats, false)}
                disabled={isDownloadingPDF}
                style={{ 
                  display: "flex", alignItems: "center", gap: "0.5rem", 
                  background: isDownloadingPDF ? "#475569" : (activeCategory !== "All" ? getCategoryColor(activeCategory).color : "#1a1a2e"), 
                  color: "#fff", border: "none", borderRadius: 10, padding: "0.55rem 1.1rem", 
                  fontSize: 13, fontWeight: 700, cursor: isDownloadingPDF ? "not-allowed" : "pointer",
                  transition: "background 0.15s" 
                }}
              >
              {isDownloadingPDF ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Download size={14} />} 
              {isDownloadingPDF ? "Generating PDF..." : `Download ${activeCategory === "All" ? "Complete" : activeCategory} Catalogue (PDF)`}
              </button>
              <button
                onClick={() => downloadCataloguePDF(activeCategory === "All" ? "Complete" : activeCategory, filteredBooks, setIsDownloadingPDF, publicStats, true)}
                disabled={isDownloadingPDF}
                style={{ 
                  display: "flex", alignItems: "center", gap: "0.5rem", 
                  background: isDownloadingPDF ? "#e2e8f0" : "#f0f9ff", 
                  color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: 10, padding: "0.55rem 1.1rem", 
                  fontSize: 13, fontWeight: 700, cursor: isDownloadingPDF ? "not-allowed" : "pointer",
                  transition: "background 0.15s" 
                }}
              >
              {isDownloadingPDF ? <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div> : <Download size={14} color="#0f172a" />} 
              {isDownloadingPDF ? "Generating Printable PDF..." : `Printable ${activeCategory === "All" ? "Complete" : activeCategory} Catalogue (PDF)`}
              </button>"""

content = content.replace(bottom_button, bottom_button_replacement)

# Finally add the fetch logic for publicStats to CataloguePage component
state_addition = """  const [publicStats, setPublicStats] = useState<any>({});

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:3001').trim() + '/api/public-stats')
      .then(r => r.json())
      .then(data => setPublicStats(data))
      .catch(e => console.error(e));
  }, []);
"""

content = content.replace(
    '  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);',
    '  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);\n' + state_addition
)

with open('src/app/components/CataloguePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
