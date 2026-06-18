import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Coffee, BookOpen, Calendar, User, ArrowRight, Check } from "lucide-react";

const libraryBooks = [
  { title: "The God of Small Things", author: "Arundhati Roy", available: true, genre: "Fiction" },
  { title: "Sapiens", author: "Yuval Noah Harari", available: true, genre: "Non-Fiction" },
  { title: "The Alchemist", author: "Paulo Coelho", available: false, genre: "Fiction" },
  { title: "A Suitable Boy", author: "Vikram Seth", available: true, genre: "Fiction" },
  { title: "Wings of Fire", author: "A.P.J. Abdul Kalam", available: true, genre: "Non-Fiction" },
  { title: "Midnight's Children", author: "Salman Rushdie", available: false, genre: "Fiction" },
  { title: "The White Tiger", author: "Aravind Adiga", available: true, genre: "Fiction" },
  { title: "Panchtantra Tales", author: "Vishnu Sharma", available: true, genre: "Children's" },
];

const membershipTiers = [
  {
    name: "Reading Pass",
    price: 299,
    period: "month",
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    features: ["Access to 500+ library books", "2 book borrows/month", "Café reading space access", "Monthly newsletter"],
  },
  {
    name: "Literary Circle",
    price: 799,
    period: "month",
    color: "#db2777",
    bg: "#fdf2f8",
    border: "#fbcfe8",
    popular: true,
    features: ["Everything in Reading Pass", "5 book borrows/month", "Priority event seats", "Author meet access", "10% off café menu"],
  },
  {
    name: "Patron",
    price: 1499,
    period: "month",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    features: ["Everything in Literary Circle", "Unlimited borrows", "Free event tickets (2/month)", "Private reading room access", "Exclusive author sessions"],
  },
];

const upcomingCafeEvents = [
  { name: "Sunday Morning Book Club", date: "2025-01-19", time: "10:00 AM", capacity: 20, slots: 7 },
  { name: "Poetry Open Mic Night", date: "2025-01-25", time: "7:00 PM", capacity: 40, slots: 15 },
  { name: "Author Talk: Kavita Nair", date: "2025-02-02", time: "5:00 PM", capacity: 30, slots: 12 },
  { name: "Children's Story Hour", date: "2025-02-08", time: "11:00 AM", capacity: 25, slots: 18 },
];

export function GoaCafePage() {
  const [selectedTier, setSelectedTier] = useState("");
  const [memberForm, setMemberForm] = useState({ name: "", email: "", phone: "" });
  const [memberSubmitted, setMemberSubmitted] = useState(false);
  const [eventBookings, setEventBookings] = useState<string[]>([]);
  const [bookSearch, setBookSearch] = useState("");

  const filteredBooks = libraryBooks.filter((b) =>
    b.title.toLowerCase().includes(bookSearch.toLowerCase()) || b.author.toLowerCase().includes(bookSearch.toLowerCase())
  );

  return (
    <main style={{ fontFamily: "var(--font-body)" }}>
      {/* Hero */}
      <section style={{ position: "relative", height: 480, overflow: "hidden" }}>
        <img
          src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1400&h=500&fit=crop&auto=format"
          alt="Goa Book Café interior"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(26,26,46,0.88) 40%, rgba(26,26,46,0.2))" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", padding: "0 4rem" }} className="cafe-hero-text">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <Coffee size={18} color="rgba(255,255,255,0.7)" />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Goa De-Stress Book Café & Library</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: "0.75rem" }}>
              Your Literary Haven<br />in Porvorim, Goa
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, maxWidth: 420, marginBottom: "1.5rem" }}>
              A curated community space where books, conversation, and coastal tranquility meet. Open daily for reading, events, and author discoveries.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
                <MapPin size={14} /> Porvorim, North Goa
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
                <Clock size={14} /> Open: 9 AM – 9 PM Daily
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
                <Phone size={14} /> +91 83209 11234
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact + Map strip */}
      <section style={{ background: "#1a1a2e", padding: "1.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          {[
            { icon: <MapPin size={16} />, label: "Address", value: "12 Monastery Road, Porvorim, Bardez, Goa — 403521" },
            { icon: <Phone size={16} />, label: "Phone", value: "+91 83209 11234" },
            { icon: <Mail size={16} />, label: "Email", value: "goa@puneauthors.in" },
            { icon: <Clock size={16} />, label: "Hours", value: "Mon–Sun: 9:00 AM – 9:00 PM" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
              <div style={{ color: "#d97706", marginTop: 2 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{item.label}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: "0.1rem" }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Library Books section */}
      <section style={{ padding: "4rem 1.5rem", background: "#f7f7f9" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6b6b80", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Café Library</div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "#1a1a2e" }}>Available Library Books</h2>
            </div>
            <input
              type="text"
              placeholder="Search books…"
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              style={{ padding: "0.55rem 0.9rem", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 13, background: "#fff", outline: "none", minWidth: 220 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
            {filteredBooks.map((book, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.07)",
                  padding: "1.1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.85rem",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ width: 40, height: 52, background: book.available ? "#eff6ff" : "#f0f0f4", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <BookOpen size={18} color={book.available ? "#2563eb" : "#9ca3af"} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.title}</div>
                  <div style={{ fontSize: 11, color: "#6b6b80", marginTop: "0.15rem" }}>{book.author}</div>
                  <div style={{ marginTop: "0.4rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: book.available ? "#16a34a" : "#dc2626", background: book.available ? "#f0fdf4" : "#fef2f2", padding: "0.15rem 0.4rem", borderRadius: 4 }}>
                      {book.available ? "Available" : "Borrowed"}
                    </span>
                    <span style={{ fontSize: 10, color: "#9ca3af" }}>· {book.genre}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Book an Event */}
      <section style={{ padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6b6b80", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Community</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "#1a1a2e", marginBottom: "1.75rem" }}>Book an Event at the Café</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {upcomingCafeEvents.map((event, i) => {
              const booked = eventBookings.includes(event.name);
              const slotsPercent = (event.slots / event.capacity) * 100;
              return (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    border: "1px solid rgba(0,0,0,0.07)",
                    padding: "1.25rem",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#1a1a2e", marginBottom: "0.5rem", lineHeight: 1.3 }}>{event.name}</div>
                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.9rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: 12, color: "#6b6b80" }}>
                      <Calendar size={12} /> {new Date(event.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: 12, color: "#6b6b80" }}>
                      <Clock size={12} /> {event.time}
                    </div>
                  </div>
                  <div style={{ marginBottom: "0.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b6b80", marginBottom: "0.3rem" }}>
                      <span>Seats remaining</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "#1a1a2e" }}>{event.slots}/{event.capacity}</span>
                    </div>
                    <div style={{ height: 6, background: "#f0f0f4", borderRadius: 3 }}>
                      <div style={{ height: "100%", width: slotsPercent + "%", background: slotsPercent > 50 ? "#16a34a" : slotsPercent > 20 ? "#d97706" : "#dc2626", borderRadius: 3, transition: "width 0.3s" }} />
                    </div>
                  </div>
                  <button
                    onClick={() => { if (!booked) setEventBookings((prev) => [...prev, event.name]); }}
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      borderRadius: 8,
                      border: "none",
                      background: booked ? "#f0fdf4" : "#1a1a2e",
                      color: booked ? "#16a34a" : "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: booked ? "default" : "pointer",
                      fontFamily: "var(--font-body)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
                    }}
                  >
                    {booked ? <><Check size={14} /> Seat Booked</> : "Book My Seat"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Membership */}
      <section style={{ padding: "4rem 1.5rem", background: "#f7f7f9" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6b6b80", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Join the Library</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "#1a1a2e" }}>Membership Tiers</h2>
            <p style={{ fontSize: 14, color: "#6b6b80", marginTop: "0.4rem" }}>Choose a plan that fits your reading lifestyle</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
            {membershipTiers.map((tier) => (
              <div
                key={tier.name}
                onClick={() => setSelectedTier(tier.name)}
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  border: selectedTier === tier.name ? "2px solid " + tier.color : "1.5px solid " + (tier.popular ? tier.border : "rgba(0,0,0,0.07)"),
                  padding: "1.75rem",
                  cursor: "pointer",
                  position: "relative",
                  boxShadow: selectedTier === tier.name ? `0 8px 32px ${tier.color}22` : "0 2px 12px rgba(0,0,0,0.04)",
                  transition: "all 0.2s",
                }}
              >
                {tier.popular && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: tier.color, color: "#fff", fontSize: 11, fontWeight: 700, padding: "0.25rem 0.85rem", borderRadius: 100, whiteSpace: "nowrap" }}>
                    Most Popular
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: tier.bg, border: "1px solid " + tier.border, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Coffee size={16} color={tier.color} />
                  </div>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>{tier.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", marginBottom: "1.25rem" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 32, fontWeight: 800, color: tier.color }}>₹{tier.price}</span>
                  <span style={{ fontSize: 13, color: "#6b6b80" }}>/{tier.period}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {tier.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: 13, color: "#444" }}>
                      <Check size={14} color={tier.color} style={{ flexShrink: 0, marginTop: 2 }} />
                      {f}
                    </div>
                  ))}
                </div>
                {selectedTier === tier.name && (
                  <div style={{ marginTop: "1rem", padding: "0.5rem", background: tier.bg, borderRadius: 8, textAlign: "center", fontSize: 12, fontWeight: 600, color: tier.color }}>
                    ✓ Selected
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Membership form */}
          {selectedTier && !memberSubmitted && (
            <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(0,0,0,0.07)", padding: "2rem", maxWidth: 560, margin: "0 auto" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#1a1a2e", marginBottom: "1.5rem" }}>
                Join as {selectedTier}
              </h3>
              <div style={{ display: "grid", gap: "0.85rem" }}>
                {[
                  { key: "name", label: "Full Name", placeholder: "Your name" },
                  { key: "email", label: "Email", placeholder: "email@example.com" },
                  { key: "phone", label: "Phone", placeholder: "+91 00000 00000" },
                ].map((f) => (
                  <div key={f.key}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.3rem" }}>{f.label}</label>
                    <input
                      type="text"
                      placeholder={f.placeholder}
                      value={memberForm[f.key as keyof typeof memberForm]}
                      onChange={(e) => setMemberForm({ ...memberForm, [f.key]: e.target.value })}
                      style={{ width: "100%", padding: "0.65rem 0.9rem", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 14, background: "#f7f7f9", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  if (!memberForm.name || !memberForm.email) { alert("Please fill name and email"); return; }
                  setMemberSubmitted(true);
                }}
                style={{ width: "100%", marginTop: "1.25rem", background: "#1a1a2e", color: "#fff", border: "none", padding: "0.8rem", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
              >
                Join the Library <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Receipt */}
          {memberSubmitted && (
            <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(0,0,0,0.07)", padding: "2rem", maxWidth: 440, margin: "0 auto", textAlign: "center" }}>
              <Check size={40} color="#16a34a" style={{ margin: "0 auto 1rem" }} />
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#1a1a2e", marginBottom: "0.5rem" }}>Welcome to the Library!</h3>
              <p style={{ fontSize: 13, color: "#6b6b80", marginBottom: "1.25rem" }}>Your membership confirmation has been sent to {memberForm.email}</p>
              {/* Receipt */}
              <div style={{ background: "#f7f7f9", borderRadius: 12, padding: "1.25rem", textAlign: "left", border: "1px dashed rgba(0,0,0,0.12)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#6b6b80", letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center", marginBottom: "0.75rem" }}>Membership Receipt</div>
                {[
                  { label: "Member", value: memberForm.name },
                  { label: "Plan", value: selectedTier },
                  { label: "Monthly Fee", value: `₹${membershipTiers.find(t => t.name === selectedTier)?.price}` },
                  { label: "Membership ID", value: "GOA-LIB-" + Math.floor(Math.random() * 9000 + 1000) },
                  { label: "Valid From", value: new Date().toLocaleDateString("en-IN") },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "0.35rem 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                    <span style={{ color: "#6b6b80" }}>{item.label}</span>
                    <span style={{ color: "#1a1a2e", fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 640px) {
          .cafe-hero-text { padding: 0 1.5rem !important; }
        }
      `}</style>
    </main>
  );
}
