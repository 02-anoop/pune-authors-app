import { Users } from "lucide-react";

export function AboutPage() {
  return (
    <main style={{ fontFamily: "var(--font-body)", background: "#f7f7f9", minHeight: "calc(100vh - 64px)", padding: "4rem 1.5rem" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", background: "#fff", padding: "3rem", borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ width: 56, height: 56, background: "#1a1a2e", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={28} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#6b6b80", letterSpacing: "0.15em", textTransform: "uppercase" }}>Origins</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "#1a1a2e", lineHeight: 1.1 }}>About The Group</h1>
          </div>
        </div>

        <div style={{ fontSize: 16, color: "#4a4a5a", lineHeight: 1.8 }}>
          <p style={{ marginBottom: "1.5rem" }}>
            The group was conceived in <strong>Dec 2024</strong> after the Pune Book Fair 2024, where some of the authors from Pune met at a book stall.
          </p>
          <p style={{ marginBottom: "1.5rem" }}>
            The idea to form a group of authors from Pune was conceived by <strong>Cdr Shiv Mathur</strong>; after seeing the way authors struggle to sell their books. The vision was to find ways to promote our books together in a collaborative way. 
          </p>
          <p style={{ marginBottom: "1.5rem" }}>
            This way the cost gets shared and many activities can be conducted with pooled in resources and funds, that may not be possible for authors individually due to the costs involved as well as any approach available to do self-marketing.
          </p>
          <p style={{ marginBottom: "1.5rem" }}>
            A group guideline document was also created so that every author knows the agenda and the rules of the group. As the group started expanding, we decided to welcome authors from Mumbai also to join our group. Now we are getting authors from other parts of the country also.
          </p>
        </div>
      </div>
    </main>
  );
}
