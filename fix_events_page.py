import os
import re

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\EventsPage.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix 1: Upcoming Events Image
old_upcoming_img = """                    <div style={{ height: 180, overflow: "hidden", marginBottom: "1.5rem", border: "1px solid #eaeaea", background: "#fafafa", padding: "0.25rem" }}>
                      <img src={(event as any).bannerUrl || "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=800&q=80"} alt={event.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>"""
new_upcoming_img = """                    <div style={{ height: 180, overflow: "hidden", marginBottom: "1.5rem", border: "1px solid #eaeaea", background: "#fafafa", padding: "0.25rem" }}>
                      {(event as any).bannerUrl ? (
                         <img src={(event as any).bannerUrl.startsWith('http') ? (event as any).bannerUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${(event as any).bannerUrl}`} alt={event.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                         <div style={{ width: "100%", height: "100%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", textAlign: "center" }}>
                            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "#333", margin: 0, lineHeight: 1.2 }}>{event.name}</h3>
                         </div>
                      )}
                    </div>"""
content = content.replace(old_upcoming_img, new_upcoming_img)


# Fix 2: Past Events Image
old_past_img = """                      <div style={{ height: 180, overflow: "hidden", marginBottom: "1.5rem", border: "1px solid #eaeaea", background: "#fafafa", padding: "0.25rem" }}>
                        <img src={(event as any).photoUrl || "https://images.unsplash.com/photo-1506880018603-83d5b62f40e5?w=800&q=80"} alt={event.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>"""
new_past_img = """                      <div style={{ height: 180, overflow: "hidden", marginBottom: "1.5rem", border: "1px solid #eaeaea", background: "#fafafa", padding: "0.25rem" }}>
                        {(event as any).photoUrl ? (
                           <img src={(event as any).photoUrl.startsWith('http') ? (event as any).photoUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${(event as any).photoUrl}`} alt={event.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = `<div style="width:100%;height:100%;background:#f5f5f5;display:flex;align-items:center;justify-content:center;padding:1rem;text-align:center"><h3 style="font-family:var(--font-display);font-size:24px;color:#333;margin:0;line-height:1.2">${event.name}</h3></div>` }} />
                        ) : (
                           <div style={{ width: "100%", height: "100%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", textAlign: "center" }}>
                              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "#333", margin: 0, lineHeight: 1.2 }}>{event.name}</h3>
                           </div>
                        )}
                      </div>"""
content = content.replace(old_past_img, new_past_img)

# Fix 3: Download Report for past events
old_report_btn = """                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #eaeaea", paddingTop: "1.5rem", cursor: "pointer" }} className="report-hover">"""
new_report_btn = """                      <div onClick={() => { if ((event as any).reportUrl) window.open((event as any).reportUrl.startsWith('http') ? (event as any).reportUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${(event as any).reportUrl}`, '_blank'); else alert('Detailed report is not available for this legacy event.'); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #eaeaea", paddingTop: "1.5rem", cursor: "pointer" }} className="report-hover">"""
content = content.replace(old_report_btn, new_report_btn)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("EventsPage fixed.")
