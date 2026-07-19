const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/components/LandingPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add refs and scroll function
if (!content.includes('ficScrollRef')) {
  content = content.replace(
    'export function LandingPage() {\\n  const [activeGenre, setActiveGenre] = useState<string>("All Books");',
    `export function LandingPage() {
  const ficScrollRef = useRef<HTMLDivElement>(null);
  const nfScrollRef = useRef<HTMLDivElement>(null);
  const scrollContainer = (ref: React.RefObject<HTMLDivElement>, direction: 'left'|'right') => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollAmount = clientWidth * 0.8;
      ref.current.scrollTo({ left: scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount), behavior: 'smooth' });
    }
  };
  const [activeGenre, setActiveGenre] = useState<string>("All Books");`
  );
}

// 2. Fix Immersive Fiction (Arrows, Dotted BG, Font)
content = content.replace(
  'backgroundColor: "#FF6B00", padding: "5rem 2rem", fontFamily: "var(--font-body)"',
  'backgroundColor: "#FF6B00", backgroundImage: "radial-gradient(rgba(255,255,255,0.15) 2px, transparent 2px)", backgroundSize: "24px 24px", padding: "5rem 2rem", fontFamily: "\\\'Google Sans\\\', sans-serif"'
);

// Add ref to fiction horizontal scroll
content = content.replace(
  '<div className="horizontal-scroll" style={{ display: "flex", gap: "1.5rem", overflowX: "auto", paddingBottom: "2rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>',
  '<div ref={ficScrollRef} className="horizontal-scroll" style={{ display: "flex", gap: "1.5rem", overflowX: "auto", paddingBottom: "2rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", scrollBehavior: "smooth" }}>'
);

// Connect click events to fiction arrows
content = content.replace(
  '<div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", transition: "background 0.2s" }} className="hover-bg-black"><ArrowLeft size={16}/></div>',
  '<div onClick={() => scrollContainer(ficScrollRef, \\\'left\\\')} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", transition: "background 0.2s" }} className="hover-bg-black"><ArrowLeft size={16}/></div>'
);
content = content.replace(
  '<div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", transition: "background 0.2s" }} className="hover-bg-black"><ArrowRight size={16}/></div>',
  '<div onClick={() => scrollContainer(ficScrollRef, \\\'right\\\')} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", transition: "background 0.2s" }} className="hover-bg-black"><ArrowRight size={16}/></div>'
);

// 3. Fix Knowledge & Non-Fiction (Arrows, 2 Rows Grid, Font)
content = content.replace(
  '<section className="bg-dots-light" style={{ padding: "5rem 2rem", borderTop: "4px solid #FFCC00", borderBottom: "12px solid #FFCC00", overflow: "hidden" }}>',
  '<section className="bg-dots-light" style={{ padding: "5rem 2rem", borderTop: "4px solid #FFCC00", borderBottom: "12px solid #FFCC00", overflow: "hidden", fontFamily: "\\\'Google Sans\\\', sans-serif" }}>'
);

// Change NF container from flex to 2-row grid
content = content.replace(
  '<div className="horizontal-scroll" style={{ display: "flex", gap: "1.5rem", overflowX: "auto", paddingBottom: "2rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>\\n            {galleryItems.filter(b => b.genre === "NF")',
  '<div ref={nfScrollRef} className="horizontal-scroll" style={{ display: "grid", gridTemplateRows: "1fr 1fr", gridAutoFlow: "column", gridAutoColumns: "320px", gap: "1.5rem", overflowX: "auto", paddingBottom: "2rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", scrollBehavior: "smooth" }}>\\n            {galleryItems.filter(b => b.genre === "NF")'
);

// In case the above replace didn't match perfectly, let's do a fallback replace for NF flex
if (!content.includes('gridTemplateRows')) {
    const nfScrollStart = content.indexOf('<div className="horizontal-scroll" style={{ display: "flex"', content.indexOf('Knowledge &<br/>Non-Fiction'));
    if (nfScrollStart !== -1) {
        const nfScrollEnd = content.indexOf('>', nfScrollStart);
        content = content.substring(0, nfScrollStart) + '<div ref={nfScrollRef} className="horizontal-scroll" style={{ display: "grid", gridTemplateRows: "1fr 1fr", gridAutoFlow: "column", gridAutoColumns: "320px", gap: "1.5rem", overflowX: "auto", paddingBottom: "2rem", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", scrollBehavior: "smooth" }}' + content.substring(nfScrollEnd);
    }
}

// Connect click events to NF arrows
content = content.replace(
  '<div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,51,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#0033FF", transition: "background 0.2s" }} className="hover-bg-black"><ArrowLeft size={16}/></div>',
  '<div onClick={() => scrollContainer(nfScrollRef, \\\'left\\\')} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,51,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#0033FF", transition: "background 0.2s" }} className="hover-bg-black"><ArrowLeft size={16}/></div>'
);
content = content.replace(
  '<div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,51,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#0033FF", transition: "background 0.2s" }} className="hover-bg-black"><ArrowRight size={16}/></div>',
  '<div onClick={() => scrollContainer(nfScrollRef, \\\'right\\\')} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,51,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#0033FF", transition: "background 0.2s" }} className="hover-bg-black"><ArrowRight size={16}/></div>'
);

// 4. Update font for other sections too to maintain consistency
content = content.replace(
  '<section className="bg-slant" style={{ padding: "5rem 2rem", overflow: "hidden" }}>',
  '<section className="bg-slant" style={{ padding: "5rem 2rem", overflow: "hidden", fontFamily: "\\\'Google Sans\\\', sans-serif" }}>'
);
content = content.replace(
  '<section style={{ backgroundColor: "#FFD700", padding: "5rem 2rem", position: "relative", overflow: "hidden" }}>',
  '<section style={{ backgroundColor: "#FFD700", padding: "5rem 2rem", position: "relative", overflow: "hidden", fontFamily: "\\\'Google Sans\\\', sans-serif" }}>'
);
content = content.replace(
  '<section className="bg-dots-dark" style={{ padding: "6rem 2rem" }}>',
  '<section className="bg-dots-dark" style={{ padding: "6rem 2rem", fontFamily: "\\\'Google Sans\\\', sans-serif" }}>'
);

fs.writeFileSync(filePath, content);
console.log("Refinements applied!");
