const fs = require('fs');

const path = 'src/app/components/CataloguePage.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacement = `export async function downloadCataloguePDF(label: string, books: CatalogueBook[], setDownloading: (val: boolean) => void) {
  try {
    setDownloading(true);
    const html2pdf = await loadHtml2Pdf();
    
    // Group books by author
    const byAuthor: Record<string, { name: string; bio: string; photoUrl: string; instagram: string; facebook: string; whatsapp: string; qualification?: string; age?: string; experience?: string; skills?: string; hobbies?: string; books: CatalogueBook[] }> = {};
    books.forEach(b => {
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
    
      let currentPage = 3; // Cover is page 1, Intro is page 2
      
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
                 qualStr = parsed.map((q: any) => q.qualification).filter(Boolean).join(', ');
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
        if (author.whatsapp && author.whatsapp !== 'NA') socials.push(\`<a href="https://wa.me/\${author.whatsapp.replace(/\\D/g,'')}" style="background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 20px; color: #cbd5e1; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">
          &#128222; \${author.whatsapp}
        </a>\`);
        if (author.instagram && author.instagram !== 'NA') socials.push(\`<a href="\${author.instagram.startsWith('http') ? author.instagram : 'https://instagram.com/'+author.instagram}" style="background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 20px; color: #cbd5e1; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">
          &#128247; \${author.instagram.replace('https://instagram.com/', '@').replace('https://www.instagram.com/', '@')}
        </a>\`);
        if (author.facebook && author.facebook !== 'NA') socials.push(\`<a href="\${author.facebook.startsWith('http') ? author.facebook : 'https://facebook.com/'+author.facebook}" style="background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 20px; color: #cbd5e1; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">
          &#128101; Facebook
        </a>\`);
        
        const socialHtml = socials.length > 0 ? \`<div style="margin-top: 25px; font-size: 11px; display: flex; gap: 10px; flex-wrap: wrap;">\${socials.join('')}</div>\` : '';
  
        const authorPageHtml = \`
           <div class="pdf-page" style="width: 802px; height: 1120px; position: relative; background: #0f172a; color: #fff; box-sizing: border-box; overflow: hidden; display: flex; flex-direction: column; justify-content: center; padding: 60px;">
             <div style="position: absolute; top: 40px; right: 40px;">
                <img src="\${window.location.origin}/logo.png" crossorigin="anonymous" style="height: 60px; filter: brightness(0) invert(1);" />
             </div>
             
             <div style="position: absolute; right: -50px; top: -50px; font-size: 400px; color: rgba(255,255,255,0.03); font-family: 'Playfair Display', serif; font-weight: 900; line-height: 1; pointer-events: none;">\${author.name.charAt(0)}</div>
             
             <div style="display: flex; gap: 50px; align-items: center; position: relative; z-index: 2;">
                 <div style="flex-shrink: 0; width: 220px; height: 220px; border-radius: 50%; border: 6px solid #b44d28; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); background: #1e293b;">
                   \${author.photoUrl ? \`<img src="\${author.photoUrl.startsWith('http') ? author.photoUrl : (import.meta.env.VITE_API_URL || 'http://localhost:3001').trim() + (author.photoUrl.startsWith('/') ? author.photoUrl : '/' + author.photoUrl)}" crossorigin="anonymous" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.opacity='0';" />\` : \`<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 80px; color: #94a3b8; font-family: serif;">\${author.name.charAt(0)}</div>\`}
                 </div>
                 
                 <div style="flex: 1;">
                   <div style="display: inline-block; background: #b44d28; color: #fff; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; padding: 6px 14px; margin-bottom: 20px; font-weight: 800; font-family: system-ui, sans-serif;">Featured Author</div>
                   <h2 style="margin: 0 0 20px; font-size: 48px; color: #fff; font-family: 'Playfair Display', Georgia, serif; line-height: 1.1; letter-spacing: -0.5px;">\${author.name}</h2>
                   
                   <div style="margin: 0 0 20px; font-size: 13px; line-height: 1.8; color: #94a3b8; font-family: system-ui, sans-serif; text-transform: uppercase; letter-spacing: 1px;">
                     \${qualStr !== '—' ? \`<div style="margin-bottom: 6px;"><strong>Qual:</strong> <span style="color: #cbd5e1">\${qualStr}</span></div>\` : ''}
                     <div style="display: flex; gap: 20px; margin-bottom: 6px;">
                       \${ageStr !== '—' ? \`<div><strong>Age:</strong> <span style="color: #cbd5e1">\${ageStr}</span></div>\` : ''}
                       \${expStr !== '—' ? \`<div><strong>Exp:</strong> <span style="color: #cbd5e1">\${expStr}</span></div>\` : ''}
                     </div>
                     \${skillsStr !== '—' ? \`<div style="margin-bottom: 6px;"><strong>Skills:</strong> <span style="color: #cbd5e1">\${skillsStr}</span></div>\` : ''}
                     \${hobbiesStr !== '—' ? \`<div style="margin-bottom: 6px;"><strong>Hobbies:</strong> <span style="color: #cbd5e1">\${hobbiesStr}</span></div>\` : ''}
                   </div>
                 </div>
             </div>
             
             <div style="position: relative; z-index: 2; margin-top: 40px; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.1);">
                <p style="margin: 0; font-size: 16px; line-height: 1.9; color: #e2e8f0; text-align: justify; font-style: italic;">\${author.bio}</p>
                \${socialHtml}
             </div>
  
             <div style="position: absolute; bottom: 40px; right: 40px; font-size: 12px; color: rgba(255,255,255,0.5); font-family: system-ui, sans-serif;">Page \${currentPage++}</div>
           </div>
         \`;
  
        const bookChunks = [];
        for (let i = 0; i < author.books.length; i += 2) {
           bookChunks.push(author.books.slice(i, i + 2));
        }
  
        const bookPagesHtml = bookChunks.map((chunk) => {
           const booksHtml = chunk.map((b, bIdx) => \`
           <div style="display: flex; gap: 30px; padding-bottom: \${chunk.length > 1 && bIdx === 0 ? '30px' : '0'}; border-bottom: \${chunk.length > 1 && bIdx === 0 ? '1px solid #cbd5e1' : 'none'}; break-inside: avoid;">
             <div style="flex-shrink: 0; width: 180px;">
               \${b.coverUrl ? \`<img src="\${b.coverUrl.startsWith('http') ? b.coverUrl : (import.meta.env.VITE_API_URL || 'http://localhost:3001').trim() + (b.coverUrl.startsWith('/') ? b.coverUrl : '/' + b.coverUrl)}" crossorigin="anonymous" style="width: 100%; height: 270px; object-fit: cover; border-radius: 4px; box-shadow: 10px 10px 20px rgba(0,0,0,0.1); border: 1px solid #94a3b8;" onerror="this.style.opacity='0';" />\` : \`<div style="width: 100%; height: 270px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: 1px dashed #94a3b8;"><span style="color:#64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">No Cover</span></div>\`}
             </div>
             <div style="flex: 1; display: flex; flex-direction: column;">
               <div style="margin-bottom: 12px;">
                 <h3 style="margin: 0 0 5px; color: #0f172a; font-size: 24px; font-family: 'Playfair Display', Georgia, serif; line-height: 1.2;">\${b.title}</h3>
                 <p style="margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #0ea5e9; font-weight: 800; font-family: system-ui, sans-serif;">
                   \${b.genre} \${b.subGenre ? \`<span style="color: #94a3b8; margin: 0 5px;">/</span> \${b.subGenre}\` : ''}
                 </p>
               </div>
               <div style="flex: 1;">
                 <p style="margin: 0 0 15px; font-size: 13px; line-height: 1.6; color: #334155; text-align: justify; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical;">\${b.synopsis}</p>
               </div>
               <div style="background: #fff; padding: 15px; border-top: 3px solid #0ea5e9; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                 <table style="width: 100%; font-size: 11px; color: #0f172a; border-collapse: collapse; font-family: system-ui, sans-serif; text-transform: uppercase; letter-spacing: 0.5px;">
                   <tr>
                     <td style="padding: 6px 0; border-bottom: 1px solid #e2e8f0; width: 50%;"><strong>Price:</strong> <span style="color:#0ea5e9; font-weight: 800; font-size: 14px;">\${b.mrp != null ? "₹" + b.mrp : b.mrpRaw || "—"}</span></td>
                     <td style="padding: 6px 0; border-bottom: 1px solid #e2e8f0; width: 50%;"><strong>Pages:</strong> \${b.pages || "—"}</td>
                   </tr>
                   <tr>
                     <td style="padding: 6px 0; border-bottom: 1px solid #e2e8f0;"><strong>Language:</strong> \${b.language || "—"}</td>
                     <td style="padding: 6px 0; border-bottom: 1px solid #e2e8f0;"><strong>Format:</strong> \${b.format || "—"}</td>
                   </tr>
                   <tr>
                     <td style="padding: 6px 0;"><strong>Publisher:</strong> \${b.publisher || "—"}</td>
                     <td style="padding: 6px 0;"><strong>ISBN:</strong> <span style="font-family: monospace;">\${b.isbn || "—"}</span></td>
                   </tr>
                 </table>
               </div>
             </div>
           </div>
           \` ).join("");
  
           return \`
           <div class="pdf-page" style="width: 802px; height: 1120px; position: relative; background: #f0f9ff; color: #0f172a; box-sizing: border-box; padding: 60px; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-start;">
              <!-- Branding Header -->
              <div style="position: absolute; top: 40px; right: 40px;">
                <img src="\${window.location.origin}/logo.png" crossorigin="anonymous" style="height: 60px;" />
              </div>
              
              <div style="margin-bottom: 40px; border-bottom: 2px solid #0f172a; padding-bottom: 10px; width: calc(100% - 140px);">
                <h4 style="margin: 0; font-family: system-ui, sans-serif; text-transform: uppercase; letter-spacing: 3px; font-size: 14px; font-weight: 800; color: #0f172a;">\${author.name} &middot; Literary Portfolio</h4>
              </div>
              
              <div style="display: flex; flex-direction: column; gap: 40px;">
                 \${booksHtml}
              </div>
  
              <!-- Page Number -->
              <div style="position: absolute; bottom: 40px; right: 40px; font-size: 12px; color: #64748b; font-family: system-ui, sans-serif;">Page \${currentPage++}</div>
           </div>
           \`;
        }).join('');
  
        return authorPageHtml + bookPagesHtml;
      }).join("");
  
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-2px';
      container.style.top = '0';
      container.style.opacity = '0';
      container.style.zIndex = '-9999';
      document.body.appendChild(container);
  
      container.innerHTML = \`
        <div id="pdf-content-wrapper" style="width: 802px; background: #0f172a;">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&display=swap');
          </style>
          
          <!-- Magazine Cover Page -->
          <div style="position: relative; width: 802px; height: 1120px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; overflow: hidden; background: #0f172a; box-sizing: border-box;">
            <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000&auto=format&fit=crop" crossorigin="anonymous" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.3; filter: grayscale(100%);" />
            <div style="position: relative; z-index: 10; padding: 80px; width: 80%; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); box-shadow: 0 30px 60px rgba(0,0,0,0.5); box-sizing: border-box;">
              <div style="margin-bottom: 40px;">
                <img src="\${window.location.origin}/logo.png" crossorigin="anonymous" style="height: 250px; filter: brightness(0) invert(1);" />
              </div>
              <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 6px; color: #b44d28; margin-bottom: 30px; font-weight: 800; font-family: system-ui, sans-serif;">Exclusive Collection</div>
              <h1 style="color: #fff; font-family: 'Playfair Display', serif; font-size: 64px; font-weight: 900; line-height: 1.1; margin: 0 0 20px; letter-spacing: -1px;">Pune Authors' Association</h1>
              <div style="width: 80px; height: 3px; background: #b44d28; margin: 30px auto;"></div>
              <h2 style="color: #e2e8f0; margin: 0 0 40px; font-size: 32px; font-weight: 400; font-style: italic; font-family: 'Playfair Display', serif;">The \${label} Portfolio</h2>
              <p style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 4px; font-family: system-ui, sans-serif;">
                Volume &middot; \${new Date().toLocaleDateString("en-US", { month: 'long', year: 'numeric' })} &nbsp;|&nbsp; \${books.length} Curated Title(s)
              </p>
            </div>
            <!-- Page Number -->
            <div style="position: absolute; bottom: 40px; right: 40px; font-size: 12px; color: rgba(255,255,255,0.5); font-family: system-ui, sans-serif; z-index: 10;">Page 1</div>
          </div>

          <!-- Introduction Page -->
          <div class="pdf-page" style="width: 802px; height: 1120px; position: relative; background: #0f172a; color: #e2e8f0; box-sizing: border-box; padding: 60px 80px; display: flex; flex-direction: column;">
            <div style="position: absolute; top: 40px; right: 40px;">
                <img src="\${window.location.origin}/logo.png" crossorigin="anonymous" style="height: 60px; filter: brightness(0) invert(1);" />
            </div>
            <h2 style="margin: 40px 0 30px; font-size: 40px; color: #fff; font-family: 'Playfair Display', Georgia, serif; line-height: 1.1; letter-spacing: -0.5px;">Introduction & Vision</h2>
            
            <div style="font-size: 14px; line-height: 1.7; font-family: system-ui, sans-serif; text-align: justify; display: flex; flex-direction: column; gap: 15px;">
              <p style="margin: 0;"><strong style="color: #b44d28;">Introduction :-</strong> Pune Authors’ Association, a group of authors from Pune was formed in Jan 2025 by Cdr Shiv Mathur, a veteran of the Indian Navy and an author of four books. He realized that there is a need to work in a collaborative way to revive book reading, promote indie authors and sell books through some innovative ways. The group begin with a modest number of about 25 authors and it has been evolving constantly since its inception. Many authors joined and left and many have stayed put. The process will continue as the group evolves further and stablises with a stronger presence and outcomes. As on 17 May 26, we have 53 authors in the group.</p>
              
              <p style="margin: 0;"><strong style="color: #b44d28;">Goals :</strong> Following are the main goals of the group</p>
              <ul style="margin: 0 0 0 20px; padding: 0; display: flex; flex-direction: column; gap: 5px;">
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
              
              <p style="margin: 0;"><strong style="color: #b44d28;">Achievements :</strong> Following has been achieved since Jan 25 till 17 May 26.</p>
              <ul style="margin: 0 0 0 20px; padding: 0; display: flex; flex-direction: column; gap: 5px;">
                <li>a) Organised seven events in housing societies, colleges and corporate offices.</li>
                <li>b) Participated in three major book fairs organized by the National Book Trust of India in Pune, Goa and Dehradun.</li>
                <li>c) More events and book fairs are lined up till Jul 26.</li>
                <li>d) Donated and setup libraries at six major airports in India. Donated almost 1400 books for this initiative. Kolkata, Chennai, Pune, Thiruvananthapuram, Mangaluru, and Bhubaneshwar.</li>
                <li>e) Maintaining a catalogue of fiction and non-fiction books.</li>
                <li>f) All efforts are on cost sharing basis, so the whole initiative remains a low-cost affair and affordable to the authors who participate in literary events and book fairs. Participation in literary events remain free.</li>
                <li>g) Created a Linkedin page that currently works as a landing page and also promotes the group amongst professionals.</li>
              </ul>
              
              <p style="margin: 0;"><strong style="color: #b44d28;">Way Ahead :</strong></p>
              <ul style="margin: 0 0 0 20px; padding: 0; display: flex; flex-direction: column; gap: 5px;">
                <li>a) Build a web-site for automating the operations and create a system that will become independent of any manual intervention. The rules will be implemented and all activities, transactions, database, tracking, supply chain, all will get rolled up into the web-site. All sales will happen through the website.</li>
                <li>b) Marketing of the group through the website and Linkedin page.</li>
                <li>c) Start a book shop, cum library cum café in Goa, that will be the authors book shop, café-library and it will be managed by the authors of this group.</li>
                <li>d) Engage more with schools and colleges to engage them in literary activities and revival of book reading. Thereby, freeing them for mobile phones, scrolling and social media.</li>
                <li>e) Form a foundation for promoting book reading and helping indie authors with publishing services.</li>
                <li>f) Welcome authors from across the globe to join this group and take it to great heights.</li>
              </ul>
            </div>
            
            <div style="position: absolute; bottom: 40px; right: 40px; font-size: 12px; color: rgba(255,255,255,0.5); font-family: system-ui, sans-serif;">Page 2</div>
          </div>
          
          \${contentHtml}
        </div>
      \`;


    const opt = {
      margin:       0,
      filename:     \`PAA_\${label.replace(/\\s+/g, '_')}_Catalogue.pdf\`,
      image:        { type: 'jpeg', quality: 0.8 },
      html2canvas:  { 
        scale: 1.5, 
        useCORS: true, 
        logging: false,
        scrollY: 0,
        scrollX: 0
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: 'css', before: '.pdf-page' }
    };

    await html2pdf().set(opt).from(container.firstElementChild).save();
    
    document.body.removeChild(container);
    setDownloading(false);
  } catch (err) {
    console.error("PDF Generation failed", err);
    setDownloading(false);
    alert("Failed to generate PDF. Please try again.");
  }
}
`;

const startIndex = content.indexOf('export async function downloadCataloguePDF');
const endIndex = content.indexOf('// ── Component ────────────────────────────────────────────────────────────────');

if (startIndex !== -1 && endIndex !== -1) {
  const before = content.substring(0, startIndex);
  const after = content.substring(endIndex);
  fs.writeFileSync(path, before + replacement + '\n' + after, 'utf8');
  console.log('Successfully replaced catalogue generation function');
} else {
  console.log('Could not find markers');
}
