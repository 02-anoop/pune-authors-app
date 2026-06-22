import re

filepath = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/CataloguePage.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update interface
content = re.sub(
    r'  authorBio: string;\n  genre: string;',
    '  authorBio: string;\n  authorPhotoUrl?: string;\n  authorInstagram?: string;\n  authorFacebook?: string;\n  authorWhatsapp?: string;\n  genre: string;',
    content
)

# 2. Update mapping logic
content = re.sub(
    r'          authorBio: b\.author\?\.bio \|\| "",\n          genre: b\.genre',
    '          authorBio: b.author?.bio || "",\n          authorPhotoUrl: b.author?.photoUrl || "",\n          authorInstagram: b.author?.instagram || "",\n          authorFacebook: b.author?.facebook || "",\n          authorWhatsapp: b.author?.whatsapp || "",\n          genre: b.genre',
    content
)

# 3. Replace PDF Generation Function
new_pdf_func = """// ── PDF catalogue download ───────────────────────────────────────────────────
function downloadCataloguePDF(label: string, books: CatalogueBook[]) {
  const win = window.open("", "_blank")!;
  
  // Group books by author
  const byAuthor: Record<string, { name: string; bio: string; photoUrl: string; instagram: string; facebook: string; whatsapp: string; books: CatalogueBook[] }> = {};
  books.forEach(b => {
    if (!byAuthor[b.authorName]) {
      byAuthor[b.authorName] = {
        name: b.authorName,
        bio: b.authorBio,
        photoUrl: b.authorPhotoUrl || "",
        instagram: b.authorInstagram || "",
        facebook: b.authorFacebook || "",
        whatsapp: b.authorWhatsapp || "",
        books: []
      };
    }
    byAuthor[b.authorName].books.push(b);
  });
  
  const contentHtml = Object.values(byAuthor).map(author => {
    
    // Social links block
    const socials = [];
    if (author.whatsapp) socials.push(`<span>&#128222; ${author.whatsapp}</span>`);
    if (author.instagram) socials.push(`<span>&#128247; ${author.instagram.replace('https://instagram.com/', '@')}</span>`);
    if (author.facebook) socials.push(`<span>&#128101; Facebook</span>`);
    const socialHtml = socials.length > 0 ? `<div style="margin-top: 15px; font-size: 12px; color: #64748b; display: flex; gap: 15px; flex-wrap: wrap;">${socials.join('')}</div>` : '';

    const authorBooksHtml = author.books.map(b => `
      <div style="margin-bottom: 35px; padding-bottom: 30px; border-bottom: 1px solid #e2e8f0; display: flex; gap: 30px; flex-wrap: wrap; align-items: stretch;">
        <div style="flex-shrink: 0; width: 160px;">
          ${b.coverUrl ? `<img src="${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${b.coverUrl.startsWith('/') ? b.coverUrl : '/' + b.coverUrl}" style="width: 100%; height: auto; aspect-ratio: 2/3; object-fit: cover; border-radius: 4px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;" />` : `<div style="width: 100%; aspect-ratio: 2/3; background: #f8fafc; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: 1px dashed #cbd5e1;"><span style="color:#94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">No Cover</span></div>`}
        </div>
        <div style="flex: 1; min-width: 300px; display: flex; flex-direction: column;">
          <h3 style="margin: 0 0 5px; color: #0f172a; font-size: 22px; font-family: 'Playfair Display', Georgia, serif; line-height: 1.3;">${b.title}</h3>
          <p style="margin: 0 0 15px; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #b44d28; font-weight: 700; font-family: system-ui, sans-serif;">
            ${b.genre} ${b.subGenre ? `<span style="color: #cbd5e1; margin: 0 5px;">/</span> ${b.subGenre}` : ''}
          </p>
          <div style="flex: 1;">
            <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.7; color: #475569; font-style: italic; text-align: justify;">${b.synopsis}</p>
          </div>
          <div style="background: #f8fafc; border-radius: 6px; padding: 15px; border: 1px solid #e2e8f0; margin-top: auto;">
            <table style="width: 100%; font-size: 12px; color: #334155; border-collapse: collapse; font-family: system-ui, sans-serif;">
              <tr>
                <td style="padding: 6px 0; border-bottom: 1px dotted #cbd5e1; width: 50%;"><strong>Price:</strong> <span style="color:#b44d28; font-weight: 800; font-size: 14px;">${b.mrp != null ? "₹" + b.mrp : b.mrpRaw || "—"}</span></td>
                <td style="padding: 6px 0; border-bottom: 1px dotted #cbd5e1; width: 50%;"><strong>Pages:</strong> ${b.pages || "—"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; border-bottom: 1px dotted #cbd5e1;"><strong>Language:</strong> ${b.language || "—"}</td>
                <td style="padding: 6px 0; border-bottom: 1px dotted #cbd5e1;"><strong>Format:</strong> ${b.format || "—"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; border-bottom: 1px dotted #cbd5e1;"><strong>Publisher:</strong> ${b.publisher || "—"}</td>
                <td style="padding: 6px 0; border-bottom: 1px dotted #cbd5e1;"><strong>Edition:</strong> ${b.edition || "—"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; padding-bottom: 0;"><strong>Published:</strong> ${b.publicationDate || "—"}</td>
                <td style="padding: 6px 0; padding-bottom: 0;"><strong>ISBN:</strong> <span style="font-family: monospace;">${b.isbn || "—"}</span></td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    `).join("");

    return `
      <div style="margin-bottom: 70px; break-inside: avoid; page-break-inside: avoid; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        
        <!-- Author Profile Header (Magazine Style) -->
        <div style="background: #1e293b; color: #fff; padding: 40px; display: flex; gap: 30px; align-items: center; flex-wrap: wrap;">
          <div style="flex-shrink: 0; width: 140px; height: 140px; border-radius: 50%; border: 4px solid #fff; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3); background: #334155;">
            ${author.photoUrl ? `<img src="${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${author.photoUrl.startsWith('/') ? author.photoUrl : '/' + author.photoUrl}" style="width: 100%; height: 100%; object-fit: cover;" />` : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 40px; color: #94a3b8; font-weight: 800; font-family: serif;">${author.name.charAt(0)}</div>`}
          </div>
          <div style="flex: 1; min-width: 250px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-bottom: 5px; font-weight: 700; font-family: system-ui, sans-serif;">Featured Author</div>
            <h2 style="margin: 0 0 15px; font-size: 36px; color: #fff; font-family: 'Playfair Display', Georgia, serif; line-height: 1.1; letter-spacing: -0.5px;">${author.name}</h2>
            <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #cbd5e1; text-align: justify; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;">${author.bio}</p>
            ${socialHtml}
          </div>
        </div>

        <!-- Author Books -->
        <div style="padding: 40px; background: #fff;">
          <div style="display: flex; align-items: center; margin-bottom: 30px;">
            <div style="height: 1px; flex: 1; background: #e2e8f0;"></div>
            <h4 style="margin: 0 20px; color: #0f172a; font-family: system-ui, sans-serif; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; font-weight: 800;">Literary Portfolio</h4>
            <div style="height: 1px; flex: 1; background: #e2e8f0;"></div>
          </div>
          
          <div style="padding: 0 10px;">
            ${authorBooksHtml}
          </div>
        </div>
      </div>
    `;
  }).join("");

  win.document.write(`<!DOCTYPE html><html><head><title>PAA — ${label} Literary Collection</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
    
    body { 
      font-family: 'Georgia', serif; 
      padding: 50px 40px; 
      color: #0f172a; 
      max-width: 900px; 
      margin: 0 auto; 
      background: #f8fafc;
    }
    .catalogue-cover {
      text-align: center;
      padding: 80px 20px;
      margin-bottom: 60px;
      background: #fff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
      position: relative;
    }
    .catalogue-cover::before {
      content: '';
      position: absolute;
      top: 10px; left: 10px; right: 10px; bottom: 10px;
      border: 1px solid #cbd5e1;
      pointer-events: none;
    }
    h1 { 
      color: #0f172a; 
      margin-bottom: 10px; 
      font-family: 'Playfair Display', serif;
      font-size: 42px;
      letter-spacing: -0.5px;
    }
    h2.subtitle { 
      color: #b44d28; 
      margin-top: 0; 
      font-size: 24px;
      font-weight: 400;
      font-style: italic;
    }
    .meta { 
      color: #64748b; 
      font-size: 12px; 
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: 40px;
      font-family: system-ui, sans-serif;
    }
    
    @media print { 
      button { display: none; } 
      body { padding: 0; background: #fff; } 
      .catalogue-cover { box-shadow: none; border-color: #000; break-after: page; }
    }
  </style>
  </head><body>
  
  <div class="catalogue-cover">
    <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 4px; color: #475569; margin-bottom: 20px; font-family: system-ui, sans-serif; font-weight: 700;">Exclusive Collection</div>
    <h1>Pune Authors' Association</h1>
    <h2 class="subtitle">${label} Portfolio</h2>
    <p class="meta">Volume &middot; ${new Date().toLocaleDateString("en-US", { month: 'long', year: 'numeric' })} &nbsp;|&nbsp; ${books.length} Title(s)</p>
  </div>
  
  ${contentHtml}
  
  <div style="text-align: center; margin-top: 60px; padding-bottom: 40px;">
    <button onclick="window.print()" style="background:#0f172a;color:#fff;border:none;padding:15px 40px;font-size:14px;text-transform:uppercase;letter-spacing:2px;cursor:pointer;border-radius:4px;font-weight:700;font-family:system-ui,sans-serif;box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      Print / Save as PDF
    </button>
  </div>
  
  </body></html>`);
  win.document.close();
}
"""

old_pdf_func = re.search(r'// ── PDF catalogue download ──.*?function downloadCataloguePDF.*?}\n', content, re.DOTALL).group(0)
content = content.replace(old_pdf_func, new_pdf_func)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated PDF Catalogue Generation to Magazine Style!")
