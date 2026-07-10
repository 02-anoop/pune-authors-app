import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { bookCategories } from "../data/categories";
import { ShoppingCart, Search, SlidersHorizontal, Star, ChevronRight, X, BookOpen, Info, Download } from "lucide-react";
// ── Category config ─────────────────────────────────────────────────────────
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

// ── Normalise both JSON files into one flat list ─────────────────────────────
export interface CatalogueBook {
  id: string;
  title: string;
  synopsis: string;
  mrp: number | null;
  mrpRaw: string;
  coverUrl: string;
  authorName: string;
  authorBio: string;
  authorPhotoUrl?: string;
  authorInstagram?: string;
  authorFacebook?: string;
  authorWhatsapp?: string;
  authorQualification?: string;
  authorAge?: string;
  authorExperience?: string;
  authorSkills?: string;
  authorHobbies?: string;
  genre: string;
  subGenre: string;
  pages?: number | null;
  language?: string;
  isbn?: string;
  publisher?: string;
  publicationDate?: string;
  edition?: string;
  format?: string;
  rating: number;
  reviewsCount: number;
  bundleRules?: { enabled: boolean; buyCount: number; discount: number }[];
  bundleRule?: { enabled: boolean; buyCount: number; discount: number };
}


// ── PDF catalogue download ───────────────────────────────────────────────────
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


export async function loadPdfLibs() {
  const loadScript = (src: string) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  if (!(window as any).jspdf) await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  if (!(window as any).html2canvas) await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
  return { jsPDF: (window as any).jspdf.jsPDF, html2canvas: (window as any).html2canvas };
}

export async function downloadCataloguePDF(label: string, books: CatalogueBook[], setDownloading: (val: boolean) => void) {
  try {
    setDownloading(true);

    // Only reject blob:/data: URLs — they can't be rendered cross-origin by html2canvas.
    // All server-hosted relative/absolute URLs are accepted; broken images are handled
    // gracefully by the onerror attributes in the HTML template.
    const isRenderableUrl = (url: string) => {
        if (!url) return true; // empty = no image, still renderable (shows placeholder)
        if (url.startsWith('blob:') || url.startsWith('data:')) return false;
        return true;
    };

    const validBooks = books.filter(b => {
        if (b.authorPhotoUrl && !isRenderableUrl(b.authorPhotoUrl)) return false;
        if (b.id !== 'NO_BOOK' && b.coverUrl && !isRenderableUrl(b.coverUrl)) return false;
        return true;
    });

    const { jsPDF, html2canvas } = await loadPdfLibs();
    
    // Group books by author
    const byAuthor: Record<string, { name: string; bio: string; photoUrl: string; instagram: string; facebook: string; whatsapp: string; qualification?: string; age?: string; experience?: string; skills?: string; hobbies?: string; books: CatalogueBook[] }> = {};
    validBooks.forEach(b => {
      let safePhoto = b.authorPhotoUrl || "";
      if (safePhoto.startsWith('blob:') || safePhoto.startsWith('data:')) safePhoto = "";

      if (!byAuthor[b.authorName]) {
        byAuthor[b.authorName] = {
          name: b.authorName,
          bio: b.authorBio,
          photoUrl: safePhoto,
          instagram: b.authorInstagram || "",
          facebook: b.authorFacebook || "",
          whatsapp: b.authorWhatsapp || "",
          qualification: b.authorQualification,
          age: b.authorAge,
          experience: b.authorExperience,
          skills: b.authorSkills,
          hobbies: b.authorHobbies,
          books: []
        };
      }
      // ignore NO_BOOK stubs
      if (b.id !== 'NO_BOOK') {
        let bClone = { ...b };
        if (bClone.coverUrl && (bClone.coverUrl.startsWith('blob:') || bClone.coverUrl.startsWith('data:'))) {
          bClone.coverUrl = "";
        }
        byAuthor[bClone.authorName].books.push(bClone);
      }
    });
    
      let currentPage = 4; // Cover is page 1, Intro is page 2, Progress is page 3
      
      const contentHtml = Object.values(byAuthor).map((author, index) => {
        // Calculate age if it's a DOB
        let ageStr = author.age && author.age !== 'NA' ? String(author.age) : '—';
        if (ageStr.includes('-')) {
           const birthDate = new Date(ageStr);
           if (!isNaN(birthDate.getTime())) {
               const ageNum = new Date().getFullYear() - birthDate.getFullYear();
               ageStr = ageNum.toString();
           }
        }
  
        // Parse JSON for qualifications
        let qualStr = '—';
        if (author.qualification && author.qualification !== 'NA') {
           try {
              const parsed = JSON.parse(author.qualification);
              if (Array.isArray(parsed) && parsed.length > 0) {
                 qualStr = parsed.map((q: any) => {
                    let str = q.qualification || '';
                    if (q.subject) str += ` in ${q.subject}`;
                    if (q.institution) str += ` from ${q.institution}`;
                    if (q.mode) str += ` (${q.mode})`;
                    return str;
                 }).filter(Boolean).join('; ');
              } else {
                 qualStr = author.qualification;
              }
           } catch(e) { qualStr = author.qualification; }
        }
  
        // Parse JSON for skills
        let skillsStr = '—';
        if (author.skills && author.skills !== 'NA') {
           try {
              const parsed = JSON.parse(author.skills);
              if (Array.isArray(parsed) && parsed.length > 0) {
                 skillsStr = parsed.filter(Boolean).join(', ');
              } else {
                 skillsStr = author.skills;
              }
           } catch(e) { skillsStr = author.skills; }
        }
  
        // Parse JSON for hobbies
        let hobbiesStr = '—';
        if (author.hobbies && author.hobbies !== 'NA') {
           try {
              const parsed = JSON.parse(author.hobbies);
              if (Array.isArray(parsed) && parsed.length > 0) {
                 hobbiesStr = parsed.filter(Boolean).join(', ');
              } else {
                 hobbiesStr = author.hobbies;
              }
           } catch(e) { hobbiesStr = author.hobbies; }
        }
        
        const expStr = author.experience && author.experience !== 'NA' && author.experience !== '0' ? author.experience + ' Years' : '—';
  
        // Social links block
        const socials = [];
        if (author.whatsapp && author.whatsapp !== 'NA') socials.push(`<a href="https://wa.me/${author.whatsapp.replace(/\D/g,'')}" style="background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 20px; color: #cbd5e1; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">
          &#128222; ${author.whatsapp}
        </a>`);
        if (author.instagram && author.instagram !== 'NA') socials.push(`<a href="${author.instagram.startsWith('http') ? author.instagram : 'https://instagram.com/'+author.instagram}" style="background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 20px; color: #cbd5e1; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">
          &#128247; ${author.instagram.replace('https://instagram.com/', '@').replace('https://www.instagram.com/', '@')}
        </a>`);
        if (author.facebook && author.facebook !== 'NA') socials.push(`<a href="${author.facebook.startsWith('http') ? author.facebook : 'https://facebook.com/'+author.facebook}" style="background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 20px; color: #cbd5e1; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">
          &#128101; Facebook
        </a>`);
        
        const socialHtml = socials.length > 0 ? `<div style="margin-top: 25px; font-size: 11px; display: flex; gap: 10px; flex-wrap: wrap;">${socials.join('')}</div>` : '';
  
        const authorPageHtml = `
           <div class="pdf-page" style="width: 802px; height: 1120px; position: relative; background: #0f172a; color: #fff; box-sizing: border-box; overflow: hidden; display: flex; flex-direction: column; justify-content: center; padding: 60px;">
             <div style="position: absolute; top: 40px; right: 40px;">
                <img src="${window.location.origin}/logo.png" crossorigin="anonymous" style="height: 60px; filter: brightness(0) invert(1);" />
             </div>
             
             <div style="position: absolute; right: -50px; top: -50px; font-size: 400px; color: rgba(255,255,255,0.03); font-family: 'Playfair Display', serif; font-weight: 900; line-height: 1; pointer-events: none;">${author.name.charAt(0)}</div>
             
             <div style="display: flex; gap: 50px; align-items: center; position: relative; z-index: 2;">
                 <div style="flex-shrink: 0; width: 220px; height: 220px; border-radius: 50%; border: 6px solid #b44d28; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); background: #1e293b;">
                   ${author.photoUrl ? `<img src="${author.photoUrl.startsWith('http') ? author.photoUrl : (import.meta.env.VITE_API_URL || 'http://localhost:3001').trim() + (author.photoUrl.startsWith('/') ? author.photoUrl : '/' + author.photoUrl)}" crossorigin="anonymous" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.opacity='0';" />` : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 80px; color: #94a3b8; font-family: serif;">${author.name.charAt(0)}</div>`}
                 </div>
                 
                 <div style="flex: 1;">
                   <div style="display: inline-block; background: #b44d28; color: #fff; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; padding: 6px 14px; margin-bottom: 20px; font-weight: 800; font-family: system-ui, sans-serif;">Featured Author</div>
                   <h2 style="margin: 0 0 20px; font-size: 48px; color: #fff; font-family: 'Playfair Display', Georgia, serif; line-height: 1.1; letter-spacing: -0.5px;">${author.name}</h2>
                   
                   <div style="margin: 0 0 20px; font-size: 13px; line-height: 1.8; color: #94a3b8; font-family: system-ui, sans-serif; text-transform: uppercase; letter-spacing: 1px;">
                     ${qualStr !== '—' ? `<div style="margin-bottom: 6px;"><strong>Qual:</strong> <span style="color: #cbd5e1">${qualStr}</span></div>` : ''}
                     <div style="display: flex; gap: 20px; margin-bottom: 6px;">
                       ${ageStr !== '—' ? `<div><strong>Age:</strong> <span style="color: #cbd5e1">${ageStr}</span></div>` : ''}
                       ${expStr !== '—' ? `<div><strong>Exp:</strong> <span style="color: #cbd5e1">${expStr}</span></div>` : ''}
                     </div>
                     ${skillsStr !== '—' ? `<div style="margin-bottom: 6px;"><strong>Skills:</strong> <span style="color: #cbd5e1">${skillsStr}</span></div>` : ''}
                     ${hobbiesStr !== '—' ? `<div style="margin-bottom: 6px;"><strong>Hobbies:</strong> <span style="color: #cbd5e1">${hobbiesStr}</span></div>` : ''}
                   </div>
                 </div>
             </div>
             
             <div style="position: relative; z-index: 2; margin-top: 40px; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.1);">
                <p style="margin: 0; font-size: 16px; line-height: 1.9; color: #e2e8f0; text-align: justify; font-style: italic;">${author.bio}</p>
                ${socialHtml}
             </div>
  
             <div style="position: absolute; bottom: 40px; right: 40px; font-size: 12px; color: rgba(255,255,255,0.5); font-family: system-ui, sans-serif;">Page ${currentPage++}</div>
           </div>
         `;
  
        const bookChunks = [];
        for (let i = 0; i < author.books.length; i += 2) {
           bookChunks.push(author.books.slice(i, i + 2));
        }
  
        const bookPagesHtml = bookChunks.map((chunk) => {
           const booksHtml = chunk.map((b, bIdx) => `
           <div style="display: flex; gap: 22px; padding-bottom: ${chunk.length > 1 && bIdx === 0 ? '22px' : '0'}; border-bottom: ${chunk.length > 1 && bIdx === 0 ? '1px solid #cbd5e1' : 'none'}; break-inside: avoid;">
             <div style="flex-shrink: 0; width: 155px;">
               ${b.coverUrl ? `<img src="${b.coverUrl.startsWith('http') ? b.coverUrl : (import.meta.env.VITE_API_URL || 'http://localhost:3001').trim() + (b.coverUrl.startsWith('/') ? b.coverUrl : '/' + b.coverUrl)}" crossorigin="anonymous" style="width: 100%; height: 240px; object-fit: cover; border-radius: 4px; box-shadow: 10px 10px 20px rgba(0,0,0,0.1); border: 1px solid #94a3b8;" onerror="this.style.opacity='0';" />` : `<div style="width: 100%; height: 240px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: 1px dashed #94a3b8;"><span style="color:#64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">No Cover</span></div>`}
             </div>
             <div style="flex: 1; display: flex; flex-direction: column;">
               <div style="margin-bottom: 6px;">
                 <h3 style="margin: 0 0 2px; color: #0f172a; font-size: 18px; font-family: 'Playfair Display', Georgia, serif; line-height: 1.2;">${b.title}</h3>
                 <p style="margin: 0; padding-top: 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #0ea5e9; font-weight: 800; font-family: system-ui, sans-serif;">
                   ${b.genre} ${b.subGenre ? `<span style="color: #94a3b8; margin: 0 5px;">/</span> ${b.subGenre}` : ''}
                 </p>
               </div>
               <div style="flex: 1;">
                 <p style="margin: 0 0 8px; font-size: 11px; line-height: 1.4; color: #334155; text-align: justify;">${b.synopsis}</p>
               </div>
               <div style="background: #fff; padding: 10px 12px; border-top: 3px solid #0ea5e9; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                 <table style="width: 100%; font-size: 10.5px; color: #0f172a; border-collapse: collapse; font-family: system-ui, sans-serif; text-transform: uppercase; letter-spacing: 0.5px;">
                   <tr>
                     <td style="padding: 4px 0; border-bottom: 1px solid #e2e8f0; width: 50%;"><strong>Price:</strong> <span style="color:#0ea5e9; font-weight: 800; font-size: 13px;">${b.mrp != null ? "₹" + b.mrp : b.mrpRaw || "—"}</span></td>
                     <td style="padding: 4px 0; border-bottom: 1px solid #e2e8f0; width: 50%;"><strong>Pages:</strong> ${b.pages || "—"}</td>
                   </tr>
                   <tr>
                     <td style="padding: 4px 0; border-bottom: 1px solid #e2e8f0;"><strong>Language:</strong> ${b.language || "—"}</td>
                     <td style="padding: 4px 0; border-bottom: 1px solid #e2e8f0;"><strong>Format:</strong> ${b.format || "—"}</td>
                   </tr>
                   <tr>
                     <td style="padding: 4px 0;"><strong>Publisher:</strong> ${b.publisher || "—"}</td>
                     <td style="padding: 4px 0;"><strong>ISBN:</strong> <span style="font-family: monospace;">${b.isbn || "—"}</span></td>
                   </tr>
                 </table>
               </div>
             </div>
           </div>
           ` ).join("");
  
           return `
           <div class="pdf-page" style="width: 802px; height: 1120px; position: relative; background: #f0f9ff; color: #0f172a; box-sizing: border-box; padding: 45px 50px; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-start;">
              <!-- Branding Header -->
              <div style="position: absolute; top: 28px; right: 32px;">
                <img src="${window.location.origin}/logo.png" crossorigin="anonymous" style="height: 48px;" />
              </div>
              
              <div style="margin-bottom: 25px; border-bottom: 2px solid #0f172a; padding-bottom: 8px; width: calc(100% - 110px);">
                <h4 style="margin: 0; font-family: system-ui, sans-serif; text-transform: uppercase; letter-spacing: 3px; font-size: 13px; font-weight: 800; color: #0f172a;">${author.name} &middot; Literary Portfolio</h4>
              </div>
              
              <div style="display: flex; flex-direction: column; gap: 25px;">
                 ${booksHtml}
              </div>
  
              <!-- Page Number -->
              <div style="position: absolute; bottom: 40px; right: 40px; font-size: 12px; color: #64748b; font-family: system-ui, sans-serif;">Page ${currentPage++}</div>
           </div>
           `;
        }).join('');
  
        return authorPageHtml + bookPagesHtml;
      }).join("");
  
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '0';
      container.style.top = '0';
      container.style.width = '802px';
      container.style.height = '1120px';
      container.style.overflow = 'hidden';
      container.style.zIndex = '-9999';
      document.body.appendChild(container);
  
      container.innerHTML = `
        <div id="pdf-content-wrapper" style="width: 802px; background: #0f172a;">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&display=swap');
          </style>
          
          <!-- Magazine Cover Page -->
          <div class="pdf-page" style="position: relative; width: 802px; height: 1120px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; overflow: hidden; background: #0f172a; box-sizing: border-box;">
            <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000&auto=format&fit=crop" crossorigin="anonymous" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.3; filter: grayscale(100%);" />
            <div style="position: relative; z-index: 10; padding: 80px; width: 80%; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); box-shadow: 0 30px 60px rgba(0,0,0,0.5); box-sizing: border-box;">
              <div style="margin-bottom: 40px;">
                <img src="${window.location.origin}/logo.png" crossorigin="anonymous" style="height: 250px; filter: brightness(0) invert(1); display: block; margin: 0 auto;" />
              </div>
              <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 6px; color: #b44d28; margin-bottom: 30px; font-weight: 800; font-family: system-ui, sans-serif;">Exclusive Collection</div>
              <h1 style="color: #fff; font-family: 'Playfair Display', serif; font-size: 64px; font-weight: 900; line-height: 1.1; margin: 0 0 20px; letter-spacing: -1px;">Pune Authors' Association</h1>
              <div style="width: 80px; height: 3px; background: #b44d28; margin: 30px auto;"></div>
              <h2 style="color: #e2e8f0; margin: 0 0 40px; font-size: 32px; font-weight: 400; font-style: italic; font-family: 'Playfair Display', serif;">The ${label} Portfolio</h2>
              <p style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 4px; font-family: system-ui, sans-serif;">
                Volume &middot; ${new Date().toLocaleDateString("en-US", { month: 'long', year: 'numeric' })} &nbsp;|&nbsp; ${validBooks.length} Curated Title(s)
              </p>
            </div>
            <!-- Page Number -->
            <div style="position: absolute; bottom: 40px; right: 40px; font-size: 12px; color: rgba(255,255,255,0.5); font-family: system-ui, sans-serif; z-index: 10;">Page 1</div>
          </div>

          <!-- Introduction Page 1 -->
          <div class="pdf-page" style="width: 802px; height: 1120px; position: relative; background: #0f172a; color: #e2e8f0; box-sizing: border-box; padding: 60px 80px; display: flex; flex-direction: column;">
            <div style="position: absolute; top: 40px; right: 40px;">
                <img src="${window.location.origin}/logo.png" crossorigin="anonymous" style="height: 60px; filter: brightness(0) invert(1);" />
            </div>
            <h2 style="margin: 40px 0 30px; font-size: 40px; color: #fff; font-family: 'Playfair Display', Georgia, serif; line-height: 1.1; letter-spacing: -0.5px;">Introduction & Vision</h2>
            
            <div style="font-size: 15px; line-height: 1.8; font-family: system-ui, sans-serif; text-align: justify; display: flex; flex-direction: column; gap: 20px;">
              <div>
                <h3 style="margin: 0 0 15px 0; font-size: 26px; color: #b44d28; font-family: 'Playfair Display', serif;">Introduction</h3>
                <p style="margin: 0;">Pune Authors’ Association, a group of authors from Pune was formed in Jan 2025 by Cdr Shiv Mathur, a veteran of the Indian Navy and an author of four books. He realized that there is a need to work in a collaborative way to revive book reading, promote indie authors and sell books through some innovative ways. The group begin with a modest number of about 25 authors and it has been evolving constantly since its inception. Many authors joined and left and many have stayed put. The process will continue as the group evolves further and stablises with a stronger presence and outcomes. As on 17 May 26, we have 53 authors in the group.</p>
              </div>
              
              <div>
                <h3 style="margin: 20px 0 15px 0; font-size: 26px; color: #b44d28; font-family: 'Playfair Display', serif;">Goals</h3>
                <p style="margin: 0 0 10px 0;">Following are the main goals of the group:</p>
                <ul style="margin: 0 0 0 20px; padding: 0; display: flex; flex-direction: column; gap: 8px;">
                  <li>a) Collective efforts through collaboration.</li>
                  <li>b) Participation and passion are a must for the authors in this group</li>
                  <li>c) Promote indie authors</li>
                  <li>d) Help authors with all publishing services at a minimal cost. We have authors who can format the manuscripts, edit, proof read, as well as design book covers.</li>
                  <li>e) We have a few printers who print as low as 50 copies and at a very cost-effective rate.</li>
                  <li>f) Organise literary events in housing societies and educational institutions as well as corporate offices.</li>
                  <li>g) Donate book to key libraries like airport libraries as an avenue for promotion.</li>
                  <li>h) Focus on organizing literary festivals in schools and colleges, where the actual book reading can be revived.</li>
                  <li>i) Help authors to understand the exploitation by the publishers and how to escape that.</li>
                </ul>
              </div>
            </div>
            
            <div style="position: absolute; bottom: 40px; right: 40px; font-size: 12px; color: rgba(255,255,255,0.5); font-family: system-ui, sans-serif;">Page 2</div>
          </div>

          <!-- Introduction Page 2 -->
          <div class="pdf-page" style="width: 802px; height: 1120px; position: relative; background: #0f172a; color: #e2e8f0; box-sizing: border-box; padding: 60px 80px; display: flex; flex-direction: column;">
            <div style="position: absolute; top: 40px; right: 40px;">
                <img src="${window.location.origin}/logo.png" crossorigin="anonymous" style="height: 60px; filter: brightness(0) invert(1);" />
            </div>
            <h2 style="margin: 40px 0 30px; font-size: 40px; color: #fff; font-family: 'Playfair Display', Georgia, serif; line-height: 1.1; letter-spacing: -0.5px;">Progress & Future</h2>
            
            <div style="font-size: 15px; line-height: 1.8; font-family: system-ui, sans-serif; text-align: justify; display: flex; flex-direction: column; gap: 20px;">
              <div>
                <h3 style="margin: 0 0 15px 0; font-size: 26px; color: #b44d28; font-family: 'Playfair Display', serif;">Achievements</h3>
                <p style="margin: 0 0 10px 0;">Following has been achieved since Jan 25 till 17 May 26.</p>
                <ul style="margin: 0 0 0 20px; padding: 0; display: flex; flex-direction: column; gap: 8px;">
                  <li>a) Organised seven events in housing societies, colleges and corporate offices.</li>
                  <li>b) Participated in three major book fairs organized by the National Book Trust of India in Pune, Goa and Dehradun.</li>
                  <li>c) More events and book fairs are lined up till Jul 26.</li>
                  <li>d) Donated and setup libraries at six major airports in India. Donated almost 1400 books for this initiative. Kolkata, Chennai, Pune, Thiruvananthapuram, Mangaluru, and Bhubaneshwar.</li>
                  <li>e) Maintaining a catalogue of fiction and non-fiction books.</li>
                  <li>f) All efforts are on cost sharing basis, so the whole initiative remains a low-cost affair and affordable to the authors who participate in literary events and book fairs. Participation in literary events remain free.</li>
                  <li>g) Created a Linkedin page that currently works as a landing page and also promotes the group amongst professionals.</li>
                </ul>
              </div>
              
              <div>
                <h3 style="margin: 20px 0 15px 0; font-size: 26px; color: #b44d28; font-family: 'Playfair Display', serif;">Way Ahead</h3>
                <ul style="margin: 0 0 0 20px; padding: 0; display: flex; flex-direction: column; gap: 8px;">
                  <li>a) Build a web-site for automating the operations and create a system that will become independent of any manual intervention. The rules will be implemented and all activities, transactions, database, tracking, supply chain, all will get rolled up into the web-site. All sales will happen through the website.</li>
                  <li>b) Marketing of the group through the website and Linkedin page.</li>
                  <li>c) Start a book shop, cum library cum café in Goa, that will be the authors book shop, café-library and it will be managed by the authors of this group.</li>
                  <li>d) Engage more with schools and colleges to engage them in literary activities and revival of book reading. Thereby, freeing them for mobile phones, scrolling and social media.</li>
                  <li>e) Form a foundation for promoting book reading and helping indie authors with publishing services.</li>
                  <li>f) Welcome authors from across the globe to join this group and take it to great heights.</li>
                </ul>
              </div>
            </div>
            
            <div style="position: absolute; bottom: 40px; right: 40px; font-size: 12px; color: rgba(255,255,255,0.5); font-family: system-ui, sans-serif;">Page 3</div>
          </div>
          
          ${contentHtml}
        </div>
      `;

    // Wait a brief moment to ensure browser has rendered DOM
    await new Promise(r => setTimeout(r, 500));

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pages = container.querySelectorAll('.pdf-page');
    
    // Hide all pages initially to speed up html2canvas DOM parsing and reset Y-coordinates
    for (let i = 0; i < pages.length; i++) {
        (pages[i] as HTMLElement).style.display = 'none';
    }
    
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        page.style.display = 'flex'; // show only this page during capture
        
        const canvas = await html2canvas(page, { 
            scale: 1.5, 
            useCORS: true, 
            logging: false,
            backgroundColor: '#0f172a',
            width: 802,
            height: 1120,
            windowWidth: 802,
            windowHeight: 1120
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.80);
        
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
        
        page.style.display = 'none'; // hide it again
    }

    pdf.save(`PAA_${label.replace(/\s+/g, '_')}_Catalogue.pdf`);
    
    document.body.removeChild(container);
    setDownloading(false);
  } catch (err) {
    console.error("PDF Generation failed", err);
    setDownloading(false);
    alert("Failed to generate PDF. Please try again.");
  }
}

// ── Component ────────────────────────────────────────────────────────────────
export function CataloguePage() {
  const [activeCategory, setActiveCategory] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("category") || "All";
  });
  const [activeSubcategory, setActiveSubcategory] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("subcategory") || "All";
  });
  const [activeSubSubcategory, setActiveSubSubcategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("search") || "";
  });
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc" | "title">("default");
  const [cart, setCart] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('checkout_cart');
      return saved ? JSON.parse(saved).map(String) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('checkout_cart', JSON.stringify(cart));
  }, [cart]);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [formatFilter, setFormatFilter] = useState<string>("All");
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [tooltip, setTooltip] = useState<{ name: string; bio: string; x: number; y: number } | null>(null);
  const [allBooks, setAllBooks] = useState<CatalogueBook[]>([]);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    const handleCartUpdate = () => {
      try {
        const saved = localStorage.getItem('checkout_cart');
        if (saved) setCart(JSON.parse(saved).map(String));
      } catch (e) {}
    };
    window.addEventListener('cart_updated', handleCartUpdate);
    // Also listen to storage events if updated in another tab
    window.addEventListener('storage', (e) => {
      if (e.key === 'checkout_cart') handleCartUpdate();
    });
    return () => {
      window.removeEventListener('cart_updated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, []);

  useEffect(() => {
    const w = window as any;
    w.__apiCache = w.__apiCache || {};
    
    if (w.__apiCache.catalogueBooks) {
      setAllBooks(w.__apiCache.catalogueBooks);
    }

    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/books`)
      .then(res => res.json())
      .then(data => {
        const mapped: CatalogueBook[] = data.map((b: any) => ({
          id: b.id.toString(),
          title: b.title,
          synopsis: b.synopsis || "",
          mrp: b.mrp,
          mrpRaw: b.mrp?.toString(),
          coverUrl: b.coverUrl || "",
          authorName: b.author?.name || "Unknown",
          authorBio: b.author?.bio || "",
          authorPhotoUrl: b.author?.photoUrl || "",
          authorInstagram: b.author?.instagram || "",
          authorFacebook: b.author?.facebook || "",
          authorWhatsapp: b.author?.whatsapp || "",
          authorQualification: b.author?.qualification || "",
          authorAge: b.author?.age || "",
          authorExperience: b.author?.experience || "",
          authorSkills: b.author?.skills || "",
          authorHobbies: b.author?.hobbies || "",
          genre: b.genre || "Unknown",
          subGenre: b.subGenre || "",
          pages: b.pages || null,
          language: b.language || "",
          isbn: b.isbn || "",
          publisher: b.publisher || "",
          publicationDate: b.publicationDate || "",
          edition: b.edition || "",
          format: b.format || "",
          rating: b.reviews && b.reviews.length > 0 ? b.reviews.reduce((acc, r) => acc + r.rating, 0) / b.reviews.length : 0,
          reviewsCount: b.reviews ? b.reviews.length : 0,
          bundleRules: b.author?.extraData?.bundleRules || [],
          bundleRule: b.author?.extraData?.bundleRule || undefined
        }));
        w.__apiCache.catalogueBooks = mapped;
        setAllBooks(mapped);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setActiveSubcategory("All");
    setActiveSubSubcategory("All");
  };

  const handleSubcategoryChange = (sc: string) => {
    setActiveSubcategory(sc);
    setActiveSubSubcategory("All");
  };

  const filteredBooks = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const authorsParam = params.get('authors');
    let baseAllBooks = allBooks;
    if (authorsParam) {
        const ids = authorsParam.split(',').map(Number);
        baseAllBooks = allBooks.filter((b: any) => ids.includes(b.authorId));
    }
    let list = allBooks;

    if (activeCategory !== "All") {
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
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.authorName.toLowerCase().includes(q) ||
          b.synopsis.toLowerCase().includes(q) ||
          (b.language || "").toLowerCase().includes(q)
      );
    }
    
    if (minPrice !== '') {
      list = list.filter(b => b.mrp !== null && b.mrp >= minPrice);
    }
    if (maxPrice !== '') {
      list = list.filter(b => b.mrp !== null && b.mrp <= maxPrice);
    }
    if (formatFilter !== "All") {
      list = list.filter(b => b.format === formatFilter);
    }
    if (ratingFilter > 0) {
       list = list.filter(b => b.rating >= ratingFilter);
    }

    if (sortBy === "price_asc") list.sort((a, b) => (a.mrp ?? 0) - (b.mrp ?? 0));
    else if (sortBy === "price_desc") list.sort((a, b) => (b.mrp ?? 0) - (a.mrp ?? 0));
    else if (sortBy === "title") list.sort((a, b) => a.title.localeCompare(b.title));

    return list;
  }, [activeCategory, activeSubcategory, activeSubSubcategory, searchQuery, sortBy, allBooks, minPrice, maxPrice, formatFilter, ratingFilter]);

  const addToCart = (id: string) =>
    setCart((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const cartTotal = cart.reduce((acc, id) => {
    const book = allBooks.find((b) => b.id === id);
    return acc + (book?.mrp || 0);
  }, 0);

  const genreLabel = (g: string) => g || "Unknown";
  const genreColor = (g: string) => getCategoryColor(g);

  return (
    <main style={{ fontFamily: "var(--font-body)", minHeight: "100vh", background: "#fafafa" }}>
      {/* ── Header ── */}
      <section style={{ background: "#fff", borderBottom: "1px solid #eaeaea", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem", marginBottom: "2rem" }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#b44d28", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                PAA Book Catalogue
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400, color: "#111", margin: 0, letterSpacing: "-0.01em" }}>
                Explore &amp; Buy Books
              </h1>
              <p style={{ fontSize: 15, color: "#333", marginTop: "0.5rem", fontWeight: 400 }}>
                {allBooks.length} titles by Pune Authors' Association members
              </p>
            </div>
            {userRole !== "AUTHOR" && userRole !== "ADMIN" && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#1a1a2e", color: "#fff", padding: "0.6rem 1.1rem", borderRadius: 10 }}>
                <ShoppingCart size={15} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{cart.length} in cart</span>
              </div>
            )}
          </div>

          {/* Dynamic PDF Catalogue Download */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            <button
              disabled={isDownloadingPDF}
              onClick={() => downloadCataloguePDF(activeCategory === "All" ? "Complete" : activeCategory, filteredBooks, setIsDownloadingPDF)}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: isDownloadingPDF ? "#475569" : "#1a1a2e", color: "#fff", border: "none", borderRadius: 10, padding: "0.55rem 1.1rem", fontSize: 13, fontWeight: 700, cursor: isDownloadingPDF ? "not-allowed" : "pointer", transition: "background 0.15s" }}
            >
              {isDownloadingPDF ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Download size={13} />} 
              {isDownloadingPDF ? "Generating PDF..." : `Download ${activeCategory === "All" ? "Complete" : activeCategory} Catalogue (PDF)`}
            </button>
          </div>

          {/* Top-level category tabs */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
            {(["All", ...Object.keys(bookCategories).filter(cat => allBooks.some(b => b.genre === cat))]).map((cat) => {
              const meta = getCategoryColor(cat);
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  style={{
                    padding: "0.4rem 1rem",
                    borderRadius: 20,
                    border: `1px solid ${isActive ? "#111" : "#eaeaea"}`,
                    background: isActive ? "#111" : "transparent",
                    color: isActive ? "#fff" : "#666",
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                    transition: "all 0.2s",
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
              {["All", ...Object.keys(bookCategories[activeCategory as keyof typeof bookCategories] || {}).filter(sc => allBooks.some(b => b.genre === activeCategory && b.subGenre && b.subGenre.split(" > ")[0].trim() === sc))].map((sc) => {
                const isActive = activeSubcategory === sc;
                return (
                  <button
                    key={sc}
                    onClick={() => handleSubcategoryChange(sc)}
                    style={{
                      padding: "0.3rem 0.8rem",
                      borderRadius: 20,
                      border: `1px solid ${isActive ? "#111" : "transparent"}`,
                      background: isActive ? "#fafafa" : "#fff",
                      color: isActive ? "#111" : "#888",
                      fontSize: 11,
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      cursor: "pointer",
                      transition: "all 0.2s",
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
              {["All", ...((bookCategories[activeCategory as keyof typeof bookCategories] as any)[activeSubcategory] || []).filter((ssc: string) => allBooks.some(b => b.genre === activeCategory && b.subGenre && b.subGenre.split(" > ")[0].trim() === activeSubcategory && b.subGenre.split(" > ")[1]?.trim() === ssc))].map((ssc: string) => {
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
          )}

          {/* Search + Sort + Download */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <Search size={15} color="#6b6b80" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search by title, author or description…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 2.5rem 0.6rem 2rem",
                  border: "none",
                  borderBottom: "1px solid #eaeaea",
                  background: "transparent",
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  outline: "none",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s"
                }}
                onFocus={e => e.currentTarget.style.borderColor = "#111"}
                onBlur={e => e.currentTarget.style.borderColor = "#eaeaea"}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                  <X size={14} color="#6b6b80" />
                </button>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.6rem 1.2rem",
                  border: showFilters ? "1px solid #111" : "1px solid #eaeaea",
                  borderRadius: 24,
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  background: showFilters ? "#111" : "#fff",
                  color: showFilters ? "#fff" : "#111",
                  fontWeight: 600,
                  cursor: "pointer",
                  outline: "none",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                }}
                onMouseEnter={e => { if (!showFilters) e.currentTarget.style.borderColor = "#111" }}
                onMouseLeave={e => { if (!showFilters) e.currentTarget.style.borderColor = "#eaeaea" }}
              >
                <SlidersHorizontal size={14} /> Filters
              </button>
              
              <div style={{ position: "relative" }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{
                    appearance: "none",
                    WebkitAppearance: "none",
                    padding: "0.6rem 2.5rem 0.6rem 1.2rem",
                    border: "1px solid #eaeaea",
                    borderRadius: 24,
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    background: "#fff",
                    color: "#111",
                    fontWeight: 600,
                    cursor: "pointer",
                    outline: "none",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#111"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#eaeaea"}
                >
                  <option value="default">Sort: Default</option>
                  <option value="title">A → Z</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                </select>
                <ChevronRight size={14} color="#111" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%) rotate(90deg)", pointerEvents: "none" }} />
              </div>
            </div>
            
          {/* Advanced Filters Dropdown/Bar */}
          {showFilters && (
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center", marginTop: "1rem", padding: "1.5rem", background: "#fff", borderRadius: 16, border: "1px solid #eaeaea", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              {/* Price Range Slider */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", minWidth: 200, flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <span>Max Price</span>
                <span style={{ color: "#b44d28", fontWeight: 800 }}>{maxPrice === '' || maxPrice >= 2000 ? 'Any Price' : `Under ₹${maxPrice}`}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="2000" 
                step="50" 
                value={maxPrice === '' ? 2000 : maxPrice} 
                onChange={e => setMaxPrice(Number(e.target.value) === 2000 ? '' : Number(e.target.value))}
                style={{ accentColor: "#111", cursor: "pointer", width: "100%" }}
              />
            </div>
            
            <div style={{ width: "1px", height: "30px", background: "#eaeaea" }}></div>
            
            {/* Format Dropdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em" }}>Book Format</span>
              <select value={formatFilter} onChange={e => setFormatFilter(e.target.value)} style={{ padding: "0.5rem 1.5rem 0.5rem 0.8rem", borderRadius: 8, border: "1px solid #eaeaea", fontSize: 13, outline: "none", cursor: "pointer", background: "#f9fafb", color: "#111", fontWeight: 500 }}>
                <option value="All">All Formats</option>
                <option value="Paperback">Paperback</option>
                <option value="Hardcover">Hardcover</option>
                <option value="Ebook">Ebook</option>
              </select>
            </div>
            
            <div style={{ width: "1px", height: "30px", background: "#eaeaea" }}></div>
            
            {/* Rating Dropdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em" }}>Minimum Rating</span>
              <select value={ratingFilter} onChange={e => setRatingFilter(Number(e.target.value))} style={{ padding: "0.5rem 1.5rem 0.5rem 0.8rem", borderRadius: 8, border: "1px solid #eaeaea", fontSize: 13, outline: "none", cursor: "pointer", background: "#f9fafb", color: "#111", fontWeight: 500 }}>
                <option value={0}>Any Rating</option>
                <option value={4}>4+ Stars</option>
                <option value={3}>3+ Stars</option>
              </select>
            </div>
          </div>
          )}
        </div>
      </div>
    </section>

      {/* Results bar */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "1rem 1.5rem 0", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#6b6b80" }}>
          Showing <strong style={{ color: "#1a1a2e" }}>{filteredBooks.length}</strong> book{filteredBooks.length !== 1 ? "s" : ""}
          {searchQuery && <span> for "<strong>{searchQuery}</strong>"</span>}
        </span>
        {activeCategory !== "All" && (
          <span style={{ background: getCategoryColor(activeCategory).bg, color: getCategoryColor(activeCategory).color, border: `1px solid ${getCategoryColor(activeCategory).border}`, borderRadius: 20, padding: "0.2rem 0.7rem", fontSize: 12, fontWeight: 600 }}>
            {activeCategory}
          </span>
        )}
      </div>

      {/* Books Grid */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "1.5rem 1.5rem 4rem" }}>
        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 12, border: "1px solid #eaeaea", overflow: "hidden" }}>
                <div className="animate-pulse bg-gray-200" style={{ height: 350, width: "100%" }}></div>
                <div style={{ padding: "1.25rem" }}>
                  <div className="animate-pulse bg-gray-200 rounded" style={{ height: 20, width: "80%", marginBottom: 8 }}></div>
                  <div className="animate-pulse bg-gray-200 rounded" style={{ height: 14, width: "40%", marginBottom: 16 }}></div>
                  <div className="animate-pulse bg-gray-200 rounded" style={{ height: 12, width: "100%", marginBottom: 6 }}></div>
                  <div className="animate-pulse bg-gray-200 rounded" style={{ height: 12, width: "90%", marginBottom: 16 }}></div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="animate-pulse bg-gray-200 rounded" style={{ height: 24, width: "30%" }}></div>
                    <div className="animate-pulse bg-gray-200 rounded-full" style={{ height: 32, width: 80 }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem", color: "#6b6b80" }}>
            <BookOpen size={40} style={{ margin: "0 auto 1rem", opacity: 0.3, display: "block" }} />
            <p style={{ fontSize: 15, fontWeight: 600 }}>No books found</p>
            <button onClick={() => { setSearchQuery(""); setActiveCategory("All"); setActiveSubcategory("All"); setActiveSubSubcategory("All"); }}
              style={{ marginTop: "1.5rem", background: "#1a1a2e", color: "#fff", border: "none", padding: "0.6rem 1.5rem", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              Clear Filters
            </button>
            <button
                onClick={() => downloadCataloguePDF(activeCategory === "All" ? "Complete" : activeCategory, filteredBooks, setIsDownloadingPDF)}
                disabled={isDownloadingPDF}
                style={{
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  padding: "0.6rem 1.1rem",
                  background: isDownloadingPDF ? "#475569" : (activeCategory !== "All" ? getCategoryColor(activeCategory).color : "#1a1a2e"),
                  color: "#fff", border: "none", borderRadius: 10,
                  fontSize: 13, fontWeight: 700, cursor: isDownloadingPDF ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-body)", whiteSpace: "nowrap",
                  marginTop: "1rem", transition: "background 0.15s"
                }}
              >
              {isDownloadingPDF ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Download size={14} />} 
              {isDownloadingPDF ? "Generating PDF..." : `Download ${activeCategory === "All" ? "Complete" : activeCategory} Catalogue (PDF)`}
            </button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "2rem"
          }}>
            {filteredBooks.map((book) => {
              const meta = genreColor(book.genre);
              const inCart = cart.includes(book.id);
              return (
                <div
                  key={book.id}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    border: `1px solid ${meta.border}`,
                    overflow: "hidden",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 36px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
                  }}
                >
                  {/* Cover */}
                  <div
                    onClick={() => window.location.href = `/book/${book.id}`}
                    style={{ position: "relative", height: 220, background: "#f7f7f9", overflow: "hidden", flexShrink: 0, cursor: "pointer" }}>
                    {book.coverUrl ? (
                      <img src={book.coverUrl.startsWith('http') ? book.coverUrl : `${(import.meta.env.VITE_API_URL || 'http://localhost:3001').trim()}${book.coverUrl.startsWith('/') ? book.coverUrl : '/' + book.coverUrl}`} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: meta.bg }}>
                        <BookOpen size={48} color={meta.color} style={{ opacity: 0.3 }} />
                      </div>
                    )}
                    {/* Genre badge */}
                    <div style={{ position: "absolute", top: 10, left: 10, background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, fontSize: 10, fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: 6 }}>
                      {genreLabel(book.genre)}
                    </div>
                    {/* Rating placeholder */}
                    <div style={{ position: "absolute", bottom: 10, right: 10, display: "flex", alignItems: "center", gap: "0.25rem", background: "rgba(0,0,0,0.6)", borderRadius: 6, padding: "0.2rem 0.5rem" }}>
                      <Star size={11} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#fff", fontWeight: 600 }}>{book.rating > 0 ? book.rating.toFixed(1) : 'New'}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "1.2rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {/* Author row with bio tooltip trigger */}
                    <div
                      style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
                      onMouseEnter={(e) => {
                        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                        setTooltip({ name: book.authorName, bio: book.authorBio, x: rect.left, y: rect.bottom + 8 });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: meta.bg, border: `2px solid ${meta.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>
                          {book.authorName.charAt(0)}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: "#6b6b80", fontWeight: 500 }}>{book.authorName}</span>
                      <Info size={12} color={meta.color} style={{ marginLeft: "auto", flexShrink: 0, opacity: 0.6 }} />
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => window.location.href = `/book/${book.id}`}
                      style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "#1a1a2e", lineHeight: 1.35, margin: 0, cursor: "pointer" }}
                      title="View book details"
                    >
                      {book.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {book.subGenre && (
                        <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, borderRadius: 4, padding: "0.15rem 0.5rem" }}>
                          {book.subGenre}
                        </span>
                      )}
                      {(() => {
                         const rules = book.bundleRules?.filter(r => r.enabled) || [];
                         if (rules.length > 0) {
                            rules.sort((a,b) => b.buyCount - a.buyCount);
                            const r = rules[0];
                            return <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", background: "#fef3c7", color: "#d97706", border: `1px solid #fde68a`, borderRadius: 4, padding: "0.15rem 0.5rem" }}>
                              Buy {r.buyCount}+ Get ₹{r.discount} Off
                            </span>;
                         } else if (book.bundleRule?.enabled) {
                            return <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", background: "#fef3c7", color: "#d97706", border: `1px solid #fde68a`, borderRadius: 4, padding: "0.15rem 0.5rem" }}>
                              Buy {book.bundleRule.buyCount}+ Get ₹{book.bundleRule.discount} Off
                            </span>;
                         }
                         return null;
                      })()}
                    </div>

                    {/* Synopsis */}
                    <p style={{ fontSize: 12, color: "#6b6b80", lineHeight: 1.65, flex: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", margin: 0 }}>
                      {book.synopsis}
                    </p>

                    {/* Footer */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                      <div>
                        {book.mrp != null ? (
                          <>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 800, color: "#1a1a2e" }}>₹{book.mrp}</span>
                            <span style={{ fontSize: 10, color: "#9ca3af", marginLeft: 3 }}>MRP</span>
                          </>
                        ) : (
                          <span style={{ fontSize: 12, color: "#9ca3af" }}>{book.mrpRaw || "Price TBD"}</span>
                        )}
                      </div>
                      {userRole !== "AUTHOR" && userRole !== "ADMIN" && book.mrp != null && (
                        <button
                          onClick={() => addToCart(book.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: "0.35rem",
                            background: inCart ? meta.color : "#1a1a2e",
                            color: "#fff", border: "none", padding: "0.5rem 1rem",
                            borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                            fontFamily: "var(--font-body)", transition: "background 0.15s",
                          }}
                        >
                          <ShoppingCart size={12} />
                          {inCart ? "In Cart" : "Buy"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Author Bio Tooltip */}
      {tooltip && (
        <div
          style={{
            position: "fixed",
            left: Math.min(tooltip.x, window.innerWidth - 340),
            top: tooltip.y,
            width: 320,
            background: "#1a1a2e",
            color: "#fff",
            padding: "1rem 1.25rem",
            borderRadius: 12,
            fontSize: 12,
            lineHeight: 1.65,
            zIndex: 2000,
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: "0.5rem", color: "#f59e0b" }}>{tooltip.name}</div>
          <div style={{ opacity: 0.85, maxHeight: 180, overflow: "hidden" }}>{tooltip.bio}</div>
        </div>
      )}

      {/* Floating Cart */}
      {cart.length > 0 && (
        <div style={{
          position: "fixed", bottom: "1.5rem", right: "1.5rem",
          background: "#1a1a2e", color: "#fff", borderRadius: 14,
          padding: "1rem 1.5rem", boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          display: "flex", alignItems: "center", gap: "1rem", zIndex: 100,
        }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700 }}>{cart.length} book{cart.length > 1 ? "s" : ""} selected</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>₹{cartTotal} total</div>
          </div>
          <Link to="/checkout" state={{ cart }}
            style={{ background: "#b44d28", color: "#fff", padding: "0.5rem 1.1rem", borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap" }}>
            Checkout <ChevronRight size={14} style={{ display: "inline", verticalAlign: "middle" }} />
          </Link>
        </div>
      )}

      <style>{`@media(max-width:640px){section{padding-left:1rem!important;padding-right:1rem!important}}`}</style>
    </main>
  );
}
