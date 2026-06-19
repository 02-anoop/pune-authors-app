import { useState } from "react";
import axios from "axios";
import { CheckCircle, Upload, CreditCard, User, BookOpen, FileText, Shield, ChevronRight, ChevronLeft } from "lucide-react";

const steps = [
  { title: "Author Profile", icon: <User size={18} />, desc: "Personal information and bio" },
  { title: "Book Details", icon: <BookOpen size={18} />, desc: "Title, synopsis, and cover" },
  { title: "Guidelines & Agreement", icon: <Shield size={18} />, desc: "Group norms and sign-off" },
  { title: "Submit & Payment", icon: <CreditCard size={18} />, desc: "Application fee" },
];

const genreOptions = [
  { code: "NF", label: "Non-Fiction", color: "#2563eb" },
  { code: "F", label: "Fiction", color: "#db2777" },
  { code: "P", label: "Poetry", color: "#d97706" },
  { code: "C", label: "Children's", color: "#16a34a" },
];

export function AuthorRegistrationPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverFileUrl, setCoverFileUrl] = useState<string | null>(null);
  const [authorPhotoUrl, setAuthorPhotoUrl] = useState<string | null>(null);
  const [coverBlob, setCoverBlob] = useState<File | null>(null);
  const [authorBlob, setAuthorBlob] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    whatsapp: "",
    bio: "",
    title: "",
    genre: "",
    synopsis: "",
    pages: "",
    mrp: "",
    guidelinesChecked: false,
    conflictChecked: false,
    cardNum: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  const update = (key: string, val: string | boolean) => setForm((prev) => ({ ...prev, [key]: val }));

  const inputStyle = {
    width: "100%",
    padding: "0.65rem 0.9rem",
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 10,
    fontFamily: "var(--font-body)",
    fontSize: 14,
    background: "#f7f7f9",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block" as const,
    fontSize: 12,
    fontWeight: 600 as const,
    color: "#1a1a2e",
    marginBottom: "0.3rem",
  };

  return (
    <main style={{ fontFamily: "var(--font-body)", minHeight: "100vh", background: "#f7f7f9" }}>
      {/* Header */}
      <section style={{ background: "#1a1a2e", padding: "3rem 1.5rem", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>New Author Onboarding</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800, color: "#fff" }}>Join Pune Authors' Association</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginTop: "0.5rem" }}>A one-time application reviewed by our editorial team within 5-7 working days.</p>
      </section>

      {/* Stepper */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "1rem 1.5rem" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
          {steps.map((s, i) => (
            <div key={s.title} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", cursor: i <= step ? "pointer" : "default",
                  padding: "0 0.75rem",
                }}
                onClick={() => { if (i <= step) setStep(i); }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: i < step ? "#16a34a" : i === step ? "#1a1a2e" : "#f0f0f4",
                  color: i < step || i === step ? "#fff" : "#6b6b80",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "0.4rem",
                  transition: "all 0.3s",
                }}>
                  {i < step ? <CheckCircle size={16} /> : s.icon}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: i === step ? "#1a1a2e" : "#6b6b80", textAlign: "center", maxWidth: 80, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ width: 48, height: 2, background: i < step ? "#16a34a" : "rgba(0,0,0,0.1)", transition: "background 0.3s" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "2.5rem auto", padding: "0 1.5rem 4rem" }}>
        {!submitted ? (
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(0,0,0,0.07)", padding: "2.5rem", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            {/* Step 0: Author Profile */}
            {step === 0 && (
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginBottom: "0.3rem" }}>Author Profile</h2>
                <p style={{ fontSize: 13, color: "#6b6b80", marginBottom: "1.75rem" }}>Tell us about yourself. This information will be publicly displayed on your PAA author page.</p>

                <div style={{ display: "grid", gap: "1rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Full Name *</label>
                      <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Email Address *</label>
                      <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Phone Number *</label>
                      <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Password (For Login) *</label>
                      <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Author Bio (100 words) *</label>
                    <textarea
                      placeholder="Tell us a little bit about yourself, your background, and your journey as a writer..."
                      value={form.bio}
                      onChange={(e) => update("bio", e.target.value)}
                      rows={5}
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                    <div style={{ fontSize: 11, color: "#6b6b80", marginTop: "0.3rem", textAlign: "right" }}>
                      {form.bio.split(/\s+/).filter(Boolean).length} / 100 words
                    </div>
                  </div>

                  {/* Author photo upload */}
                  <div>
                    <label style={labelStyle}>Author Photo</label>
                    <div
                      style={{ border: "2px dashed rgba(0,0,0,0.12)", borderRadius: 12, padding: "1.5rem", textAlign: "center", background: "#f7f7f9", cursor: "pointer" }}
                      onClick={() => document.getElementById("author-photo")?.click()}
                    >
                      {authorPhotoUrl ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                          <img src={authorPhotoUrl} alt="preview" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover" }} />
                          <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>Photo uploaded ✓</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={24} color="#6b6b80" style={{ margin: "0 auto 0.5rem" }} />
                          <div style={{ fontSize: 13, color: "#6b6b80" }}>Click to upload author headshot</div>
                          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: "0.25rem" }}>JPG, PNG up to 5MB</div>
                        </>
                      )}
                    </div>
                    <input
                      id="author-photo"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAuthorBlob(file);
                          setAuthorPhotoUrl(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Book Details */}
            {step === 1 && (
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginBottom: "0.3rem" }}>Book Details</h2>
                <p style={{ fontSize: 13, color: "#6b6b80", marginBottom: "1.75rem" }}>Information about the book you wish to publish or register with PAA.</p>

                <div style={{ display: "grid", gap: "1rem" }}>
                  <div>
                    <label style={labelStyle}>Book Title *</label>
                    <input type="text" placeholder="e.g. The Forgotten Horizon" value={form.title} onChange={(e) => update("title", e.target.value)} style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>Genre *</label>
                    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                      {genreOptions.map((g) => (
                        <button
                          key={g.code}
                          type="button"
                          onClick={() => update("genre", g.code)}
                          style={{
                            padding: "0.45rem 1rem",
                            borderRadius: 8,
                            border: "1.5px solid " + (form.genre === g.code ? g.color : "rgba(0,0,0,0.12)"),
                            background: form.genre === g.code ? g.color + "18" : "#fff",
                            color: form.genre === g.code ? g.color : "#6b6b80",
                            fontFamily: "var(--font-body)",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {g.code} — {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Synopsis (100 words) *</label>
                    <textarea
                      placeholder="A compelling description of your book — what it's about, who it's for, and what makes it unique..."
                      value={form.synopsis}
                      onChange={(e) => update("synopsis", e.target.value)}
                      rows={5}
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                    <div style={{ fontSize: 11, color: "#6b6b80", marginTop: "0.3rem", textAlign: "right" }}>
                      {form.synopsis.split(/\s+/).filter(Boolean).length} / 100 words
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Number of Pages</label>
                      <input type="number" placeholder="256" value={form.pages} onChange={(e) => update("pages", e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>MRP (₹) *</label>
                      <input type="number" placeholder="299" value={form.mrp} onChange={(e) => update("mrp", e.target.value)} style={inputStyle} />
                    </div>
                  </div>

                  {/* Cover upload */}
                  <div>
                    <label style={labelStyle}>Book Cover Upload *</label>
                    <div
                      style={{ border: "2px dashed rgba(0,0,0,0.12)", borderRadius: 12, padding: "2rem", textAlign: "center", background: "#f7f7f9", cursor: "pointer" }}
                      onClick={() => document.getElementById("cover-upload")?.click()}
                    >
                      {coverFileUrl ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                          <img src={coverFileUrl} alt="cover preview" style={{ height: 80, objectFit: "contain", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)" }} />
                          <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>Cover uploaded ✓</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={32} color="#6b6b80" style={{ margin: "0 auto 0.75rem" }} />
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e", marginBottom: "0.25rem" }}>Upload Book Cover</div>
                          <div style={{ fontSize: 12, color: "#6b6b80" }}>High resolution JPG or PNG, ideally 1600×2400px</div>
                        </>
                      )}
                    </div>
                    <input
                      id="cover-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCoverBlob(file);
                          setCoverFileUrl(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Guidelines */}
            {step === 2 && (
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginBottom: "0.3rem" }}>Guidelines &amp; Agreement</h2>
                <p style={{ fontSize: 13, color: "#6b6b80", marginBottom: "1.75rem" }}>Please read and acknowledge the following before proceeding.</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* Guidelines box */}
                  <div style={{ background: "#f7f7f9", borderRadius: 12, padding: "1.25rem", maxHeight: 240, overflowY: "auto", border: "1px solid rgba(0,0,0,0.08)", fontSize: 13, color: "#444", lineHeight: 1.8 }}>
                    <strong style={{ display: "block", marginBottom: "0.5rem", color: "#1a1a2e" }}>PAA Group Guidelines</strong>
                    <p>1. All content submitted must be original and authored by the registrant. Plagiarism will result in immediate removal.</p>
                    <p>2. Books registered with PAA must be exclusive to PAA channels for the first 6 months of listing.</p>
                    <p>3. Authors agree to participate in a minimum of 2 PAA events per year to maintain active status.</p>
                    <p>4. PAA retains the right to curate and decline books that do not meet editorial standards.</p>
                    <p>5. Revenue split: 70% to author, 30% to PAA for all sales through PAA channels.</p>
                    <p>6. Authors must provide accurate stock counts and maintain a minimum of 25 copies available at all times.</p>
                    <p>7. The author is responsible for ensuring the content complies with Indian publishing laws and does not violate copyright, obscenity, or defamation laws.</p>
                    <p>8. PAA may use book covers and author photos for promotional purposes without additional compensation.</p>
                  </div>

                  <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.guidelinesChecked}
                      onChange={(e) => update("guidelinesChecked", e.target.checked)}
                      style={{ width: 18, height: 18, marginTop: 2, cursor: "pointer", accentColor: "#1a1a2e" }}
                    />
                    <span style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.6 }}>
                      I have read and agree to the PAA Group Guidelines in full. I understand that violation of these guidelines may result in removal from the platform without refund.
                    </span>
                  </label>

                  {/* Conflict of interest */}
                  <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "1.25rem" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#d97706", marginBottom: "0.6rem" }}>Conflict of Interest Declaration</div>
                    <p style={{ fontSize: 12, color: "#78350f", lineHeight: 1.7, marginBottom: "0.75rem" }}>
                      I declare that I have no financial, personal, or professional conflict of interest that would compromise the integrity of the books I am registering with PAA. I confirm that the book content does not defame any individual, organisation, or institution. I sign off on this declaration of my own free will and understand that false declarations may result in legal action.
                    </p>
                    <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={form.conflictChecked}
                        onChange={(e) => update("conflictChecked", e.target.checked)}
                        style={{ width: 18, height: 18, marginTop: 2, cursor: "pointer", accentColor: "#d97706" }}
                      />
                      <span style={{ fontSize: 12, color: "#78350f", lineHeight: 1.6 }}>
                        I acknowledge and sign off on the Conflict of Interest Declaration above.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginBottom: "0.3rem" }}>Application Fee Payment</h2>
                <p style={{ fontSize: 13, color: "#6b6b80", marginBottom: "1.75rem" }}>A one-time registration fee of ₹2,000 secures your PAA membership and editorial review.</p>

                {/* Mock payment card */}
                <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2d2d50 100%)", borderRadius: 18, padding: "2rem", marginBottom: "1.5rem", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -30, right: -30, width: 150, height: 150, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />
                  <div style={{ position: "absolute", bottom: -40, left: 60, width: 100, height: 100, background: "rgba(255,255,255,0.04)", borderRadius: "50%" }} />
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", marginBottom: "1.5rem" }}>PAA MEMBERSHIP APPLICATION</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, color: "#fff", letterSpacing: "0.25em", marginBottom: "1.5rem" }}>
                    {form.cardNum.replace(/(.{4})/g, "$1 ").trim() || "•••• •••• •••• ••••"}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: "0.2rem" }}>CARDHOLDER</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#fff", fontWeight: 500 }}>{form.cardName || form.name || "YOUR NAME"}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: "0.2rem" }}>EXPIRES</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "#fff" }}>{form.expiry || "MM/YY"}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gap: "1rem" }}>
                  <div>
                    <label style={labelStyle}>Card Number</label>
                    <input type="text" maxLength={16} placeholder="1234 5678 9012 3456" value={form.cardNum} onChange={(e) => update("cardNum", e.target.value.replace(/\D/g, ""))} style={{ ...inputStyle, fontFamily: "var(--font-mono)" }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Name on Card</label>
                    <input type="text" placeholder="Full name as on card" value={form.cardName} onChange={(e) => update("cardName", e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Expiry Date</label>
                      <input type="text" placeholder="MM/YY" maxLength={5} value={form.expiry} onChange={(e) => update("expiry", e.target.value)} style={{ ...inputStyle, fontFamily: "var(--font-mono)" }} />
                    </div>
                    <div>
                      <label style={labelStyle}>CVV</label>
                      <input type="password" placeholder="•••" maxLength={3} value={form.cvv} onChange={(e) => update("cvv", e.target.value.replace(/\D/g, ""))} style={{ ...inputStyle, fontFamily: "var(--font-mono)" }} />
                    </div>
                  </div>
                </div>

                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "1rem", marginTop: "1rem", fontSize: 12, color: "#166534" }}>
                  <strong>Application Fee:</strong> ₹2,000 + GST = ₹2,360 (one-time)<br />
                  Your application will be reviewed within 5-7 business days. You will be notified via email once approved.
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                style={{
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  background: "transparent", border: "1.5px solid rgba(0,0,0,0.12)",
                  color: step === 0 ? "#c0c0c8" : "#1a1a2e", padding: "0.65rem 1.2rem",
                  borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: step === 0 ? "default" : "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                <ChevronLeft size={16} /> Back
              </button>

              {step < steps.length - 1 ? (
                <button
                  onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.4rem",
                    background: "#1a1a2e", color: "#fff", border: "none",
                    padding: "0.65rem 1.4rem", borderRadius: 10, fontSize: 14, fontWeight: 600,
                    cursor: "pointer", fontFamily: "var(--font-body)",
                  }}
                >
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  disabled={isSubmitting}
                  onClick={async () => {
                    if (!form.guidelinesChecked || !form.conflictChecked) {
                      alert("Please accept all agreements before submitting.");
                      return;
                    }
                    
                    setIsSubmitting(true);
                    try {
                      const formData = new FormData();
                      Object.entries(form).forEach(([key, val]) => {
                        formData.append(key, String(val));
                      });
                      if (authorBlob) formData.append("photo", authorBlob);
                      if (coverBlob) formData.append("cover", coverBlob);
                      
                      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/authors/register`, formData);
                      setSubmitted(true);
                    } catch (e: any) {
                      const msg = e.response?.data?.error || e.message || "Unknown error";
                      alert(`Failed to submit: ${msg}`);
                      console.error(e);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.4rem",
                    background: isSubmitting ? "#6b6b80" : "#16a34a", color: "#fff", border: "none",
                    padding: "0.65rem 1.4rem", borderRadius: 10, fontSize: 14, fontWeight: 600,
                    cursor: isSubmitting ? "not-allowed" : "pointer", fontFamily: "var(--font-body)",
                  }}
                >
                  <CheckCircle size={16} /> {isSubmitting ? "Submitting..." : "Submit Application & Wait for Review"}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Success state */
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(0,0,0,0.07)", padding: "3rem", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <div style={{ width: 72, height: 72, background: "#f0fdf4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <CheckCircle size={36} color="#16a34a" />
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#1a1a2e", marginBottom: "0.5rem" }}>Application Submitted!</h2>
            <p style={{ fontSize: 14, color: "#6b6b80", lineHeight: 1.7, maxWidth: 440, margin: "0 auto 1.5rem" }}>
              Thank you, <strong>{form.name || "Author"}</strong>! Your application for <em>"{form.title || "your book"}"</em> has been received. <br/><br/>
              <strong style={{ color: "#d97706" }}>Approval Pending:</strong> You must wait for the Admin to approve your account. Once approved, you will be able to log in to your Author Dashboard.
            </p>
            {/* Receipt */}
            <div style={{ background: "#f7f7f9", borderRadius: 14, padding: "1.5rem", maxWidth: 380, margin: "0 auto", textAlign: "left", border: "1px dashed rgba(0,0,0,0.12)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#6b6b80", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem", textAlign: "center" }}>Application Receipt</div>
              {[
                { label: "Application ID", value: "PAA-APP-2025-" + Math.floor(Math.random() * 9000 + 1000) },
                { label: "Author Name", value: form.name || "—" },
                { label: "Book Title", value: form.title || "—" },
                { label: "Genre", value: form.genre || "—" },
                { label: "Fee Paid", value: "₹2,360" },
                { label: "Status", value: "Pending Review" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "0.35rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <span style={{ color: "#6b6b80" }}>{item.label}</span>
                  <span style={{ color: "#1a1a2e", fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "2rem" }}>
              <button onClick={() => window.location.href = "/login"} style={{ background: "#1a1a2e", color: "#fff", border: "none", padding: "0.8rem 1.5rem", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}>
                Go to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
