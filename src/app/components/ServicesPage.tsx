import { PenTool, Megaphone, ShoppingBag } from "lucide-react";

export function ServicesPage() {
  return (
    <main style={{ fontFamily: "var(--font-body)", background: "#f7f7f9", minHeight: "calc(100vh - 64px)", padding: "4rem 1.5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800, color: "#1a1a2e" }}>Our Services</h1>
          <p style={{ fontSize: 16, color: "#6b6b80", maxWidth: 600, margin: "1rem auto 0" }}>Empowering independent authors through collaborative publishing, strategic promotion, and widespread distribution.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
          {/* Publish */}
          <div style={{ background: "#fff", borderRadius: 20, padding: "2.5rem", boxShadow: "0 8px 32px rgba(0,0,0,0.05)", borderTop: "4px solid #2563eb" }}>
            <div style={{ width: 48, height: 48, background: "#eff6ff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
              <PenTool size={24} color="#2563eb" />
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginBottom: "1rem" }}>Publishing Support</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#4a4a5a", fontSize: 15, lineHeight: 1.8 }}>
              <li>✓ Formatting of Manuscript</li>
              <li>✓ Book Cover Design</li>
              <li>✓ Editing</li>
              <li>✓ Proof Reading</li>
              <li>✓ Printing as low as 50 copies at minimal cost</li>
            </ul>
          </div>

          {/* Promote */}
          <div style={{ background: "#fff", borderRadius: 20, padding: "2.5rem", boxShadow: "0 8px 32px rgba(0,0,0,0.05)", borderTop: "4px solid #d97706" }}>
            <div style={{ width: 48, height: 48, background: "#fffbeb", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
              <Megaphone size={24} color="#d97706" />
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginBottom: "1rem" }}>Promotional Support</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#4a4a5a", fontSize: 15, lineHeight: 1.8 }}>
              <li>✓ Catalogue of fiction and non-fiction books</li>
              <li>✓ Giving books to the Airport Libraries</li>
              <li>✓ Donating books to well known local libraries</li>
              <li>✓ LinkedIn page management</li>
              <li>✓ Merchandise - caps & branding</li>
            </ul>
          </div>

          {/* Sell */}
          <div style={{ background: "#fff", borderRadius: 20, padding: "2.5rem", boxShadow: "0 8px 32px rgba(0,0,0,0.05)", borderTop: "4px solid #16a34a" }}>
            <div style={{ width: 48, height: 48, background: "#f0fdf4", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
              <ShoppingBag size={24} color="#16a34a" />
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginBottom: "1rem" }}>Selling Books</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#4a4a5a", fontSize: 15, lineHeight: 1.8 }}>
              <li>✓ Participation in book fairs all over India (NBT)</li>
              <li>✓ Literary Events/Festivals in large housing societies</li>
              <li>✓ Literary Events in Educational Institutes</li>
              <li>✓ Participating in general fairs by taking a stall</li>
              <li>✓ Setting up stalls in housing societies</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
