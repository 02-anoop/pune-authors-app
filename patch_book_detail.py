import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/BookDetailPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add Buy Now button inside the Price & stock div
if "Buy Now" not in content:
    buy_now_btn = """
                <div style={{ background: book.stock > 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${book.stock > 0 ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 8, padding: "0.35rem 0.85rem", fontSize: 12, fontWeight: 700, color: book.stock > 0 ? "#4ade80" : "#f87171" }}>
                  <Package size={12} style={{ display: "inline", marginRight: 4 }} />
                  {book.stock > 0 ? `${book.stock} in stock` : "Out of stock"}
                </div>
                {book.stock > 0 && (
                  <button onClick={() => navigate("/checkout", { state: { cart: [book.id] } })} style={{ background: "#2563eb", color: "#fff", border: "none", padding: "0.5rem 1.5rem", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 700, marginLeft: "auto" }}>
                    Buy Now
                  </button>
                )}
"""
    content = re.sub(r'<div style=\{\{ background: book\.stock > 0 \? "rgba\(34,197,94,0\.15\)" : "rgba\(239,68,68,0\.15\)", border: `1px solid \$\{book\.stock > 0 \? "rgba\(34,197,94,0\.3\)" : "rgba\(239,68,68,0\.3\)"\}`, borderRadius: 8, padding: "0\.35rem 0\.85rem", fontSize: 12, fontWeight: 700, color: book\.stock > 0 \? "#4ade80" : "#f87171" \}\}>\s*<Package size=\{12\} style=\{\{ display: "inline", marginRight: 4 \}\} />\s*\{book\.stock > 0 \? `\$\{book\.stock\} in stock` : "Out of stock"\}\s*</div>', buy_now_btn, content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Patched BookDetailPage.tsx")
