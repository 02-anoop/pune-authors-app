import re

navbar_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/NavBar.tsx"
with open(navbar_path, "r", encoding="utf-8") as f:
    navbar_content = f.read()

# Replace NavBar header styles for glassmorphism
navbar_content = re.sub(
    r'background: "rgba\(255,255,255,0\.98\)",\s*borderBottom: "1px solid rgba\(0,0,0,0\.06\)",',
    'background: "rgba(255, 255, 255, 0.8)",\n        backdropFilter: "blur(12px)",\n        WebkitBackdropFilter: "blur(12px)",\n        borderBottom: "1px solid rgba(0,0,0,0.06)",\n        transition: "all 0.3s ease",',
    navbar_content
)

# Enhance buttons in NavBar
navbar_content = navbar_content.replace(
    'background: "#b44d28",',
    'background: "#b44d28",\n                  boxShadow: "0 4px 10px rgba(180, 77, 40, 0.3)",\n                  transition: "all 0.3s ease",\n                  transform: "translateY(0)",'
)

# Write back NavBar
with open(navbar_path, "w", encoding="utf-8") as f:
    f.write(navbar_content)


landing_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/LandingPage.tsx"
with open(landing_path, "r", encoding="utf-8") as f:
    landing_content = f.read()

# Add a style block at the end of LandingPage for animations
landing_content = landing_content.replace('</style>', """
        .brutalist-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .brutalist-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border-color: #b44d28;
        }
        .btn-hover {
          transition: all 0.3s ease;
        }
        .btn-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(180, 77, 40, 0.3);
        }
        .btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          background: #fff !important;
        }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
</style>""")

# Hero Section Upgrades
landing_content = landing_content.replace(
    'style={{ background: "#b44d28", color: "#fff", padding: "0.9rem 1.8rem", borderRadius: 4, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}',
    'className="btn-hover" style={{ background: "#b44d28", color: "#fff", padding: "0.9rem 1.8rem", borderRadius: 4, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}'
)
landing_content = landing_content.replace(
    'style={{ background: "#f3f4f6", color: "#111827", padding: "0.9rem 1.8rem", borderRadius: 4, fontWeight: 600, textDecoration: "none" }}',
    'className="btn-secondary" style={{ background: "#f3f4f6", color: "#111827", padding: "0.9rem 1.8rem", borderRadius: 4, fontWeight: 600, textDecoration: "none" }}'
)

landing_content = landing_content.replace(
    'style={{ width: "100%", borderRadius: 8, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}',
    'className="brutalist-card" style={{ width: "100%", borderRadius: 16, boxShadow: "0 30px 60px -12px rgba(0,0,0,0.3)" }}'
)

# Services grid items
landing_content = re.sub(
    r'style=\{\{ background: "#fff", padding: "2\.5rem", borderRadius: 8, boxShadow: "0 4px 6px -1px rgba\(0,0,0,0\.05\), 0 2px 4px -1px rgba\(0,0,0,0\.03\)" \}\}',
    'className="brutalist-card" style={{ background: "#fff", padding: "2.5rem", borderRadius: 12, border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}',
    landing_content
)

# Pillars grid items
landing_content = landing_content.replace(
    'style={{ background: "#fff", padding: "2.5rem 1.5rem", textAlign: "center", borderRadius: 4 }}',
    'className="brutalist-card" style={{ background: "#fff", padding: "2.5rem 1.5rem", textAlign: "center", borderRadius: 12, border: "1px solid rgba(0,0,0,0.05)" }}'
)

# Book Cards Grid
landing_content = landing_content.replace(
    'style={{ background: "#fff", border: "1px solid #f3f4f6", borderRadius: 10, overflow: "hidden", transition: "box-shadow 0.2s, transform 0.2s" }}',
    'className="brutalist-card" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: 16, overflow: "hidden" }}'
)
landing_content = re.sub(r'onMouseEnter=.*?onMouseLeave=.*?>', '>', landing_content, flags=re.DOTALL)


with open(landing_path, "w", encoding="utf-8") as f:
    f.write(landing_content)
print("Updated Frontend!")
