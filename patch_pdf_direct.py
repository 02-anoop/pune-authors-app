import re

filepath = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/CataloguePage.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

new_pdf_func = """// ── PDF catalogue download ───────────────────────────────────────────────────
const loadHtml2Pdf = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).html2pdf) return resolve((window as any).html2pdf);
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.onload = () => resolve((window as any).html2pdf);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

async function downloadCataloguePDF(label: string, books: CatalogueBook[], setDownloading: (val: boolean) => void) {
  try {
    setDownloading(true);
    const html2pdf = await loadHtml2Pdf();
    
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
    
    const contentHtml = Object.values(byAuthor).map((author, index) => {
      // Social links block
      const socials = [];
      if (author.whatsapp) socials.push(`<span style="background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 20px;">&#128222; ${author.whatsapp}</span>`);
      if (author.instagram) socials.push(`<span style="background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 20px;">&#128247; ${author.instagram.replace('https://instagram.com/', '@')}</span>`);
      if (author.facebook) socials.push(`<span style="background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 20px;">&#128101; Facebook</span>`);
      const socialHtml = socials.length > 0 ? `<div style="margin-top: 20px; font-size: 11px; color: #cbd5e1; display: flex; gap: 10px; flex-wrap: wrap;">${socials.join('')}</div>` : '';

      const authorBooksHtml = author.books.map((b, bIdx) => `
        <div style="display: flex; gap: 30px; margin-bottom: 40px; padding-bottom: 40px; border-bottom: ${bIdx === author.books.length - 1 ? 'none' : '1px solid #e2e8f0'}; break-inside: avoid;">
          <div style="flex-shrink: 0; width: 180px;">
            ${b.coverUrl ? `<img src="${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${b.coverUrl.startsWith('/') ? b.coverUrl : '/' + b.coverUrl}" crossorigin="anonymous" style="width: 100%; height: 270px; object-fit: cover; border-radius: 4px; box-shadow: 15px 15px 30px rgba(0,0,0,0.15); border: 1px solid #e2e8f0;" />` : `<div style="width: 100%; height: 270px; background: #f8fafc; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: 1px dashed #cbd5e1;"><span style="color:#94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">No Cover</span></div>`}
          </div>
          <div style="flex: 1; display: flex; flex-direction: column;">
            <div style="margin-bottom: 15px;">
              <h3 style="margin: 0 0 5px; color: #0f172a; font-size: 26px; font-family: 'Playfair Display', Georgia, serif; line-height: 1.2;">${b.title}</h3>
              <p style="margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #b44d28; font-weight: 800; font-family: system-ui, sans-serif;">
                ${b.genre} ${b.subGenre ? `<span style="color: #cbd5e1; margin: 0 5px;">/</span> ${b.subGenre}` : ''}
              </p>
            </div>
            <div style="flex: 1;">
              <p style="margin: 0 0 20px; font-size: 13px; line-height: 1.8; color: #475569; text-align: justify;">${b.synopsis}</p>
            </div>
            <div style="background: #f8fafc; padding: 20px; border-top: 3px solid #1e293b;">
              <table style="width: 100%; font-size: 11px; color: #334155; border-collapse: collapse; font-family: system-ui, sans-serif; text-transform: uppercase; letter-spacing: 0.5px;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; width: 50%;"><strong>Price:</strong> <span style="color:#b44d28; font-weight: 800; font-size: 14px;">${b.mrp != null ? "₹" + b.mrp : b.mrpRaw || "—"}</span></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; width: 50%;"><strong>Pages:</strong> ${b.pages || "—"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Language:</strong> ${b.language || "—"}</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Format:</strong> ${b.format || "—"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Publisher:</strong> ${b.publisher || "—"}</td>
                  <td style="padding: 8px 0;"><strong>ISBN:</strong> <span style="font-family: monospace;">${b.isbn || "—"}</span></td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      `;}).join("");

      return `
        <div style="page-break-before: ${index === 0 ? 'auto' : 'always'}; font-family: 'Georgia', serif;">
          <!-- Magazine Author Header -->
          <div style="position: relative; background: #0f172a; color: #fff; padding: 60px 50px; display: flex; gap: 40px; align-items: center; overflow: hidden;">
            <div style="position: absolute; right: -50px; top: -50px; font-size: 300px; color: rgba(255,255,255,0.02); font-family: 'Playfair Display', serif; font-weight: 900; line-height: 1; pointer-events: none;">${author.name.charAt(0)}</div>
            <div style="flex-shrink: 0; width: 180px; height: 180px; border-radius: 50%; border: 4px solid #b44d28; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); background: #1e293b; position: relative; z-index: 2;">
              ${author.photoUrl ? `<img src="${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${author.photoUrl.startsWith('/') ? author.photoUrl : '/' + author.photoUrl}" crossorigin="anonymous" style="width: 100%; height: 100%; object-fit: cover;" />` : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 60px; color: #94a3b8; font-family: serif;">${author.name.charAt(0)}</div>`}
            </div>
            <div style="flex: 1; position: relative; z-index: 2;">
              <div style="display: inline-block; background: #b44d28; color: #fff; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; padding: 4px 10px; margin-bottom: 15px; font-weight: 800; font-family: system-ui, sans-serif;">Featured Author</div>
              <h2 style="margin: 0 0 15px; font-size: 42px; color: #fff; font-family: 'Playfair Display', Georgia, serif; line-height: 1.1; letter-spacing: -0.5px;">${author.name}</h2>
              <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #cbd5e1; text-align: justify; font-style: italic;">${author.bio}</p>
              ${socialHtml}
            </div>
          </div>

          <!-- Magazine Content Body -->
          <div style="padding: 50px;">
            <div style="margin-bottom: 40px; border-bottom: 2px solid #0f172a; padding-bottom: 15px;">
              <h4 style="margin: 0; color: #0f172a; font-family: system-ui, sans-serif; text-transform: uppercase; letter-spacing: 3px; font-size: 14px; font-weight: 800;">Literary Portfolio</h4>
            </div>
            ${authorBooksHtml}
          </div>
        </div>
      `;
    }).join("");

    const container = document.createElement('div');
    container.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&display=swap');
      </style>
      <div style="width: 800px; background: #fff;">
        <!-- Magazine Cover Page -->
        <div style="position: relative; width: 800px; height: 1131px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; overflow: hidden; background: #0f172a;">
          <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000&auto=format&fit=crop" crossorigin="anonymous" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.3; filter: grayscale(100%);" />
          <div style="position: relative; z-index: 10; padding: 80px; width: 80%; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); box-shadow: 0 30px 60px rgba(0,0,0,0.5);">
            <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 6px; color: #b44d28; margin-bottom: 30px; font-weight: 800; font-family: system-ui, sans-serif;">Exclusive Collection</div>
            <h1 style="color: #fff; font-family: 'Playfair Display', serif; font-size: 64px; font-weight: 900; line-height: 1.1; margin: 0 0 20px; letter-spacing: -1px;">Pune Authors' Association</h1>
            <div style="width: 80px; height: 3px; background: #b44d28; margin: 30px auto;"></div>
            <h2 style="color: #e2e8f0; margin: 0 0 40px; font-size: 32px; font-weight: 400; font-style: italic; font-family: 'Playfair Display', serif;">The ${label} Portfolio</h2>
            <p style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 4px; font-family: system-ui, sans-serif;">
              Volume &middot; ${new Date().toLocaleDateString("en-US", { month: 'long', year: 'numeric' })} &nbsp;|&nbsp; ${books.length} Curated Title(s)
            </p>
          </div>
        </div>
        ${contentHtml}
      </div>
    `;

    const opt = {
      margin:       0,
      filename:     `PAA_${label.replace(/\s+/g, '_')}_Catalogue.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true, windowWidth: 800 },
      jsPDF:        { unit: 'px', format: [800, 1131], orientation: 'portrait' }
    };

    await html2pdf().set(opt).from(container.firstElementChild).save();
    setDownloading(false);
  } catch (err) {
    console.error("PDF Generation failed", err);
    setDownloading(false);
    alert("Failed to generate PDF. Please try again.");
  }
}
"""

old_pdf_func = re.search(r'// ── PDF catalogue download ──.*?function downloadCataloguePDF.*?(?=\n// ── Component ──)', content, re.DOTALL).group(0)
content = content.replace(old_pdf_func, new_pdf_func)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated PDF logic to direct download with html2pdf and upgraded UI.")
