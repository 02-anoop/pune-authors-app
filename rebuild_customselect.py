
import re

with open("src/app/components/CataloguePage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace CustomSelect signature
old_sig = 'const CustomSelect = ({ value, onChange, options, color = "#111" }: { value: string, onChange: (v: string) => void, options: {label: string, value: string}[], color?: string }) => {'
new_sig = 'const CustomSelect = ({ value, onChange, options, color = "#111", filled = false }: { value: string, onChange: (v: string) => void, options: {label: string, value: string}[], color?: string, filled?: boolean }) => {'
content = content.replace(old_sig, new_sig)

# Replace the div
old_div = '<div \n        onClick={() => setIsOpen(!isOpen)} \n        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.8rem 1.5rem", borderRadius: "50px", border: isOpen ? `2px solid ${color}` : "2px solid #eaeaea", cursor: "pointer", background: "#fff", fontSize: 14, fontWeight: 700, color: "#111", gap: "1rem", transition: "all 0.2s ease" }}\n      >'
new_div = '<div \n        onClick={() => setIsOpen(!isOpen)} \n        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.8rem 1.5rem", borderRadius: "50px", border: isOpen || filled ? `2px solid ${color}` : "2px solid #eaeaea", cursor: "pointer", background: filled ? color : "#fff", fontSize: 14, fontWeight: 700, color: filled ? (color === "#eab308" || color === "#FFD400" ? "#111" : "#fff") : "#111", gap: "1rem", transition: "all 0.2s ease" }}\n      >'
content = content.replace(old_div, new_div)
# Sometimes line breaks differ, so regex is better:
content = re.sub(
    r'<div\s+onClick=\{\(\) => setIsOpen\(!isOpen\)\}\s+style=\{\{\s*display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.8rem 1.5rem", borderRadius: "50px", border: isOpen \? `2px solid \$\{color\}` : "2px solid #eaeaea", cursor: "pointer", background: "#fff", fontSize: 14, fontWeight: 700, color: "#111", gap: "1rem", transition: "all 0.2s ease"\s*\}\}\s*>',
    '<div onClick={() => setIsOpen(!isOpen)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.8rem 1.5rem", borderRadius: "50px", border: isOpen || filled ? `2px solid ${color}` : "2px solid #eaeaea", cursor: "pointer", background: filled ? color : "#fff", fontSize: 14, fontWeight: 700, color: filled ? (color === "#eab308" || color === "#FFD400" ? "#111" : "#fff") : "#111", gap: "1rem", transition: "all 0.2s ease" }}>',
    content
)

# Replace the chevron color
old_chev = '<ChevronRight size={16} style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s ease" }} color={isOpen ? color : "#94a3b8"} />'
new_chev = '<ChevronRight size={16} style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s ease" }} color={filled ? (color === "#eab308" || color === "#FFD400" ? "#111" : "#fff") : (isOpen ? color : "#94a3b8")} />'
content = content.replace(old_chev, new_chev)

# Now find the usages of CustomSelect for subcategories and set filled={true}
# Usage 1: All Subcategories
content = re.sub(
    r'(<CustomSelect\s*value=\{activeSubcategory\}\s*onChange=\{handleSubcategoryChange\}\s*options=\{[\s\S]*?\}\s*color=\{getCategoryColor\(activeCategory\)\.color\})',
    r'\1 filled={true}',
    content
)

# Usage 2: All Specific Genres
content = re.sub(
    r'(<CustomSelect\s*value=\{activeSubSubcategory\}\s*onChange=\{setActiveSubSubcategory\}\s*options=\{[\s\S]*?\}\s*color=\{getCategoryColor\(activeCategory\)\.color\})',
    r'\1 filled={true}',
    content
)


with open("src/app/components/CataloguePage.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Done")

