import { Link } from "react-router";
import { BookOpen, Edit3, Printer, Image, MapPin, Users, School, ShoppingBag, ArrowRight, Star, Package } from "lucide-react";

const services = [
  {
    title: "Publishing Support",
    subtitle: "From manuscript to masterpiece",
    color: "#2563eb",
    bgColor: "#eff6ff",
    borderColor: "#bfdbfe",
    icon: <BookOpen size={28} />,
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=360&fit=crop&auto=format",
    items: [
      { icon: <Edit3 size={16} />, title: "Manuscript Editing", desc: "Developmental, line, and copy editing by experienced literary editors." },
      { icon: <Star size={16} />, title: "Cover Design", desc: "Professional cover art tailored to genre conventions and market trends." },
      { icon: <Printer size={16} />, title: "Printing & Binding", desc: "Premium quality print runs from 50 to 5,000 copies with ISBN allocation." },
      { icon: <Image size={16} />, title: "Typesetting & Formatting", desc: "Clean interior layout for both print and digital distribution formats." },
    ],
  },
  {
    title: "Promotional & Outreach Services",
    subtitle: "Reaching readers where they are",
    color: "#db2777",
    bgColor: "#fdf2f8",
    borderColor: "#fbcfe8",
    icon: <Users size={28} />,
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=360&fit=crop&auto=format",
    items: [
      { icon: <MapPin size={16} />, title: "Airport Library Placements", desc: "6+ airport library tie-ups across India for passive high-footfall sales." },
      { icon: <Users size={16} />, title: "Housing Society Events", desc: "Author meet-and-greets and book reading sessions in residential communities." },
      { icon: <School size={16} />, title: "Educational Activations", desc: "Author talks, readings, and book drives at schools, colleges, and institutes." },
      { icon: <Star size={16} />, title: "Social & Digital Promotions", desc: "Curated social media campaigns and newsletter features for new releases." },
    ],
  },
  {
    title: "Selling Channels",
    subtitle: "Maximum reach, minimum friction",
    color: "#16a34a",
    bgColor: "#f0fdf4",
    borderColor: "#bbf7d0",
    icon: <ShoppingBag size={28} />,
    image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600&h=360&fit=crop&auto=format",
    items: [
      { icon: <Package size={16} />, title: "Book Fairs", desc: "Curated stalls at Pune Book Fair, Goa Book Fair, and regional events." },
      { icon: <ShoppingBag size={16} />, title: "General Stalls & Pop-ups", desc: "Rotating pop-up book stalls at malls, cafés, and cultural venues." },
      { icon: <MapPin size={16} />, title: "Housing Society Pop-ups", desc: "Monthly book pop-ups in apartment complexes across Pune and Goa." },
      { icon: <BookOpen size={16} />, title: "Online Catalogue Orders", desc: "Direct-to-buyer order fulfilment via the PAA online catalogue." },
    ],
  },
];

export function ChannelsPage() {
  return (
    <main style={{ fontFamily: "var(--font-body)" }}>
      {/* Header */}
      <section style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2d2d50 100%)", padding: "4rem 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", borderRadius: 100, padding: "0.3rem 1rem", marginBottom: "1.2rem" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Platform Overview</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: "1rem" }}>
            Channels &amp; Services
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: 540, margin: "0 auto" }}>
            End-to-end support for indie authors — from polishing your manuscript to placing your book in the hands of readers across India.
          </p>
        </div>
      </section>

      {/* Service Cards */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: "4rem" }}>
          {services.map((service, idx) => (
            <div
              key={service.title}
              style={{
                display: "grid",
                gridTemplateColumns: idx % 2 === 0 ? "1fr 1fr" : "1fr 1fr",
                gap: "3rem",
                alignItems: "center",
              }}
              className="service-row"
            >
              {/* Image side */}
              <div style={{ order: idx % 2 === 0 ? 1 : 2 }} className="service-img">
                <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.12)" }}>
                  <img
                    src={service.image}
                    alt={service.title}
                    style={{ width: "100%", height: 300, objectFit: "cover", display: "block" }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${service.color}33, transparent)` }} />
                </div>
              </div>

              {/* Content side */}
              <div style={{ order: idx % 2 === 0 ? 2 : 1 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    background: service.bgColor,
                    border: "1px solid " + service.borderColor,
                    borderRadius: 100,
                    padding: "0.35rem 0.9rem",
                    color: service.color,
                    marginBottom: "1.2rem",
                  }}
                >
                  {service.icon}
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
                    {service.title.split(" ")[0].toUpperCase()} SERVICE
                  </span>
                </div>

                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "#1a1a2e", lineHeight: 1.2, marginBottom: "0.4rem" }}>
                  {service.title}
                </h2>
                <p style={{ fontSize: 14, color: "#6b6b80", marginBottom: "1.5rem" }}>{service.subtitle}</p>

                {/* Feature grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  {service.items.map((item) => (
                    <div
                      key={item.title}
                      style={{
                        background: service.bgColor,
                        border: "1px solid " + service.borderColor,
                        borderRadius: 12,
                        padding: "1rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: service.color, marginBottom: "0.4rem" }}>
                        {item.icon}
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>{item.title}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "#6b6b80", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process Flow */}
      <section style={{ background: "#f7f7f9", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6b6b80", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Our Process</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "#1a1a2e", marginBottom: "2.5rem" }}>From Manuscript to Market</h2>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "0" }}>
            {["Submit Manuscript", "Edit & Design", "Print & Distribute", "Sell & Promote", "Track & Grow"].map((step, i) => (
              <div key={step} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ textAlign: "center", width: 130 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    background: ["#2563eb", "#db2777", "#d97706", "#16a34a", "#8b5cf6"][i],
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 16,
                    margin: "0 auto 0.6rem",
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ fontSize: 12, color: "#1a1a2e", fontWeight: 600, lineHeight: 1.3 }}>{step}</div>
                </div>
                {i < 4 && <div style={{ width: 32, height: 2, background: "rgba(0,0,0,0.1)", margin: "0 0.25rem", marginBottom: 24 }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#1a1a2e", padding: "3.5rem 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "#fff", marginBottom: "0.75rem" }}>Ready to publish your story?</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginBottom: "1.75rem" }}>Join PAA and get end-to-end support from our community of literary professionals.</p>
          <Link
            to="/register"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#fff", color: "#1a1a2e", padding: "0.75rem 1.6rem", borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none" }}
          >
            Apply as Author <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .service-row { grid-template-columns: 1fr !important; }
          .service-img { order: 1 !important; }
          .service-row > div:last-child { order: 2 !important; }
        }
      `}</style>
    </main>
  );
}
