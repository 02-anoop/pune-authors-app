import re

with open('src/app/components/CataloguePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update state definition
content = content.replace(
    'const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);',
    'const [downloadingType, setDownloadingType] = useState<"standard" | "printable" | null>(null);'
)

# 2. Update downloadCataloguePDF signature and internals
# We need to replace `setDownloading: (val: boolean) => void` with `setDownloading: (val: any) => void` to avoid TS issues if we pass strings
content = content.replace(
    'setDownloading: (val: boolean) => void, stats: any = {}, isPrintable: boolean = false) {',
    'setDownloading: (val: any) => void, stats: any = {}, isPrintable: boolean = false) {'
)

content = content.replace(
    'setDownloading(true);',
    'setDownloading(isPrintable ? "printable" : "standard");'
)

content = content.replace(
    'setDownloading(false);',
    'setDownloading(null);'
)

# 3. Update the buttons
# We replace `isDownloadingPDF` with `downloadingType !== null` for disabled prop
# And `downloadingType === "standard"` or `"printable"` for the visual text

# Button 1 (Standard) at top
content = content.replace(
    'disabled={isDownloadingPDF}\n              onClick={() => downloadCataloguePDF(activeCategory === "All" ? "Complete" : activeCategory, filteredBooks, setIsDownloadingPDF, publicStats, false)}\n              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: isDownloadingPDF ? "#475569" : "#1a1a2e", color: "#fff", border: "none", borderRadius: 10, padding: "0.55rem 1.1rem", fontSize: 13, fontWeight: 700, cursor: isDownloadingPDF ? "not-allowed" : "pointer", transition: "background 0.15s" }}\n            >\n              {isDownloadingPDF ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Download size={13} />} \n              {isDownloadingPDF ? "Generating PDF..." : `Download ${activeCategory === "All" ? "Complete" : activeCategory} Catalogue (PDF)`}',
    'disabled={downloadingType !== null}\n              onClick={() => downloadCataloguePDF(activeCategory === "All" ? "Complete" : activeCategory, filteredBooks, setDownloadingType, publicStats, false)}\n              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: downloadingType === "standard" ? "#475569" : "#1a1a2e", color: "#fff", border: "none", borderRadius: 10, padding: "0.55rem 1.1rem", fontSize: 13, fontWeight: 700, cursor: downloadingType !== null ? "not-allowed" : "pointer", transition: "background 0.15s", opacity: downloadingType === "printable" ? 0.5 : 1 }}\n            >\n              {downloadingType === "standard" ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Download size={13} />} \n              {downloadingType === "standard" ? "Generating PDF..." : `Download ${activeCategory === "All" ? "Complete" : activeCategory} Catalogue (PDF)`}'
)

# Button 2 (Printable) at top
content = content.replace(
    'disabled={isDownloadingPDF}\n              onClick={() => downloadCataloguePDF(activeCategory === "All" ? "Complete" : activeCategory, filteredBooks, setIsDownloadingPDF, publicStats, true)}\n              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: isDownloadingPDF ? "#e2e8f0" : "#f0f9ff", color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: 10, padding: "0.55rem 1.1rem", fontSize: 13, fontWeight: 700, cursor: isDownloadingPDF ? "not-allowed" : "pointer", transition: "background 0.15s" }}\n            >\n              {isDownloadingPDF ? <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div> : <Download size={13} color="#0f172a" />} \n              {isDownloadingPDF ? "Generating Printable PDF..." : `Printable ${activeCategory === "All" ? "Complete" : activeCategory} Catalogue (PDF)`}',
    'disabled={downloadingType !== null}\n              onClick={() => downloadCataloguePDF(activeCategory === "All" ? "Complete" : activeCategory, filteredBooks, setDownloadingType, publicStats, true)}\n              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: downloadingType === "printable" ? "#e2e8f0" : "#f0f9ff", color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: 10, padding: "0.55rem 1.1rem", fontSize: 13, fontWeight: 700, cursor: downloadingType !== null ? "not-allowed" : "pointer", transition: "background 0.15s", opacity: downloadingType === "standard" ? 0.5 : 1 }}\n            >\n              {downloadingType === "printable" ? <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div> : <Download size={13} color="#0f172a" />} \n              {downloadingType === "printable" ? "Generating Printable PDF..." : `Printable ${activeCategory === "All" ? "Complete" : activeCategory} Catalogue (PDF)`}'
)

# Button 3 (Standard) at bottom
content = content.replace(
    'onClick={() => downloadCataloguePDF(activeCategory === "All" ? "Complete" : activeCategory, filteredBooks, setIsDownloadingPDF, publicStats, false)}\n                disabled={isDownloadingPDF}\n                style={{ \n                  display: "flex", alignItems: "center", gap: "0.5rem", \n                  background: isDownloadingPDF ? "#475569" : (activeCategory !== "All" ? getCategoryColor(activeCategory).color : "#1a1a2e"), \n                  color: "#fff", border: "none", borderRadius: 10, padding: "0.55rem 1.1rem", \n                  fontSize: 13, fontWeight: 700, cursor: isDownloadingPDF ? "not-allowed" : "pointer",\n                  transition: "background 0.15s" \n                }}\n              >\n              {isDownloadingPDF ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Download size={14} />} \n              {isDownloadingPDF ? "Generating PDF..." : `Download ${activeCategory === "All" ? "Complete" : activeCategory} Catalogue (PDF)`}',
    'onClick={() => downloadCataloguePDF(activeCategory === "All" ? "Complete" : activeCategory, filteredBooks, setDownloadingType, publicStats, false)}\n                disabled={downloadingType !== null}\n                style={{ \n                  display: "flex", alignItems: "center", gap: "0.5rem", \n                  background: downloadingType === "standard" ? "#475569" : (activeCategory !== "All" ? getCategoryColor(activeCategory).color : "#1a1a2e"), \n                  color: "#fff", border: "none", borderRadius: 10, padding: "0.55rem 1.1rem", \n                  fontSize: 13, fontWeight: 700, cursor: downloadingType !== null ? "not-allowed" : "pointer",\n                  transition: "background 0.15s", opacity: downloadingType === "printable" ? 0.5 : 1 \n                }}\n              >\n              {downloadingType === "standard" ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Download size={14} />} \n              {downloadingType === "standard" ? "Generating PDF..." : `Download ${activeCategory === "All" ? "Complete" : activeCategory} Catalogue (PDF)`}'
)

# Button 4 (Printable) at bottom
content = content.replace(
    'onClick={() => downloadCataloguePDF(activeCategory === "All" ? "Complete" : activeCategory, filteredBooks, setIsDownloadingPDF, publicStats, true)}\n                disabled={isDownloadingPDF}\n                style={{ \n                  display: "flex", alignItems: "center", gap: "0.5rem", \n                  background: isDownloadingPDF ? "#e2e8f0" : "#f0f9ff", \n                  color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: 10, padding: "0.55rem 1.1rem", \n                  fontSize: 13, fontWeight: 700, cursor: isDownloadingPDF ? "not-allowed" : "pointer",\n                  transition: "background 0.15s" \n                }}\n              >\n              {isDownloadingPDF ? <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div> : <Download size={14} color="#0f172a" />} \n              {isDownloadingPDF ? "Generating Printable PDF..." : `Printable ${activeCategory === "All" ? "Complete" : activeCategory} Catalogue (PDF)`}',
    'onClick={() => downloadCataloguePDF(activeCategory === "All" ? "Complete" : activeCategory, filteredBooks, setDownloadingType, publicStats, true)}\n                disabled={downloadingType !== null}\n                style={{ \n                  display: "flex", alignItems: "center", gap: "0.5rem", \n                  background: downloadingType === "printable" ? "#e2e8f0" : "#f0f9ff", \n                  color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: 10, padding: "0.55rem 1.1rem", \n                  fontSize: 13, fontWeight: 700, cursor: downloadingType !== null ? "not-allowed" : "pointer",\n                  transition: "background 0.15s", opacity: downloadingType === "standard" ? 0.5 : 1 \n                }}\n              >\n              {downloadingType === "printable" ? <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div> : <Download size={14} color="#0f172a" />} \n              {downloadingType === "printable" ? "Generating Printable PDF..." : `Printable ${activeCategory === "All" ? "Complete" : activeCategory} Catalogue (PDF)`}'
)

with open('src/app/components/CataloguePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
