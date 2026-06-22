import re

filepath = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/CataloguePage.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update CatalogueBook interface
old_interface = """interface CatalogueBook {
  id: string;
  title: string;
  synopsis: string;
  mrp: number | null;
  mrpRaw: string;
  coverUrl: string;
  authorName: string;
  authorBio: string;
  genre: string;
  subGenre: string;
}"""

new_interface = """interface CatalogueBook {
  id: string;
  title: string;
  synopsis: string;
  mrp: number | null;
  mrpRaw: string;
  coverUrl: string;
  authorName: string;
  authorBio: string;
  genre: string;
  subGenre: string;
  pages?: number | null;
  language?: string;
  isbn?: string;
  publisher?: string;
  publicationDate?: string;
  edition?: string;
  format?: string;
}"""
content = content.replace(old_interface, new_interface)

# 2. Update PDF Download Function
old_pdf_func = re.search(r'// ── PDF catalogue download ──.*?function downloadCataloguePDF.*?}\n', content, re.DOTALL).group(0)

new_pdf_func = """// ── PDF catalogue download ───────────────────────────────────────────────────
function downloadCataloguePDF(label: string, books: CatalogueBook[]) {
  const win = window.open("", "_blank")!;
  
  // Group books by author
  const byAuthor: Record<string, { name: string; bio: string; books: CatalogueBook[] }> = {};
  books.forEach(b => {
    if (!byAuthor[b.authorName]) {
      byAuthor[b.authorName] = {
        name: b.authorName,
        bio: b.authorBio,
        books: []
      };
    }
    byAuthor[b.authorName].books.push(b);
  });
  
  const contentHtml = Object.values(byAuthor).map(author => {
    const authorBooksHtml = author.books.map(b => `
      <div style="margin-bottom: 30px; padding: 20px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #1a1a2e; font-size: 20px;">${b.title}</h3>
        <p style="margin: 5px 0 15px; font-size: 14px; color: #db2777; font-weight: bold;">
          ${b.genre} ${b.subGenre ? ` &rarr; ${b.subGenre}` : ''}
        </p>
        <div style="display: flex; gap: 20px; margin-bottom: 15px; flex-wrap: wrap;">
          ${b.coverUrl ? `<img src="${b.coverUrl}" style="width: 120px; height: 180px; object-fit: cover; border-radius: 4px; border: 1px solid #ccc;" />` : `<div style="width: 120px; height: 180px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: 1px solid #ccc;"><span style="color:#94a3b8; font-size: 12px;">No Cover</span></div>`}
          <div style="flex: 1; min-width: 280px;">
            <p style="margin: 0 0 10px; font-size: 14px; line-height: 1.6; color: #334155;"><strong>Synopsis:</strong> ${b.synopsis}</p>
            <table style="width: 100%; font-size: 13px; color: #475569; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9;"><strong>Price:</strong> ${b.mrp != null ? "₹" + b.mrp : b.mrpRaw || "—"}</td>
                <td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9;"><strong>Pages:</strong> ${b.pages || "—"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9;"><strong>Language:</strong> ${b.language || "—"}</td>
                <td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9;"><strong>Format:</strong> ${b.format || "—"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9;"><strong>Publisher:</strong> ${b.publisher || "—"}</td>
                <td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9;"><strong>Edition:</strong> ${b.edition || "—"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0;"><strong>Publication Date:</strong> ${b.publicationDate || "—"}</td>
                <td style="padding: 6px 0;"><strong>ISBN:</strong> ${b.isbn || "—"}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    `).join("");

    return `
      <div style="margin-bottom: 50px; break-inside: avoid; page-break-inside: avoid;">
        <div style="background: #1a1a2e; color: #fff; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0 0 10px; font-size: 24px; color: #f59e0b;">${author.name}</h2>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; opacity: 0.9;"><strong>About the Author:</strong> ${author.bio}</p>
        </div>
        <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <h4 style="margin-top: 0; margin-bottom: 20px; color: #475569; border-bottom: 2px solid #cbd5e1; padding-bottom: 5px;">Books by ${author.name}</h4>
          ${authorBooksHtml}
        </div>
      </div>
    `;
  }).join("");

  win.document.write(`<!DOCTYPE html><html><head><title>PAA — ${label} Detailed Catalogue</title>
  <style>
    body { font-family: 'Georgia', serif; padding: 40px; color: #111; max-width: 1000px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #b44d28; }
    h1 { color: #b44d28; margin-bottom: 5px; }
    h2 { color: #1a1a2e; margin-top: 0; }
    .meta { color: #666; font-size: 14px; }
    @media print { button { display: none; } body { padding: 0; } }
  </style>
  </head><body>
  <div class="header">
    <h1>Pune Authors' Association</h1>
    <h2>${label} Detailed Catalogue</h2>
    <p class="meta">Generated: ${new Date().toLocaleDateString("en-IN")} &nbsp;·&nbsp; ${books.length} title(s)</p>
  </div>
  ${contentHtml}
  <div style="text-align: center; margin-top: 40px;">
    <button onclick="window.print()" style="background:#b44d28;color:#fff;border:none;padding:12px 30px;font-size:16px;cursor:pointer;border-radius:6px;font-weight:bold;">Print / Save as PDF</button>
  </div>
  </body></html>`);
  win.document.close();
}
"""
content = content.replace(old_pdf_func, new_pdf_func)

# 3. Update Fetch Mapping
old_mapping = """          genre: b.genre || "Unknown",
          subGenre: b.subGenre || ""
        }));"""
new_mapping = """          genre: b.genre || "Unknown",
          subGenre: b.subGenre || "",
          pages: b.pages || null,
          language: b.language || "",
          isbn: b.isbn || "",
          publisher: b.publisher || "",
          publicationDate: b.publicationDate || "",
          edition: b.edition || "",
          format: b.format || ""
        }));"""
content = content.replace(old_mapping, new_mapping)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated PDF Catalogue Generation!")
