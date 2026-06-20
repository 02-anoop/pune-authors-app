import { useState, useEffect } from "react";
import axios from "axios";
import qrCode from "./data/qr_code.jpeg";
import { bookCategories } from "../data/categories";
import { CheckCircle, Upload, CreditCard, User, BookOpen, FileText, Shield, ChevronRight, ChevronLeft } from "lucide-react";

const steps = [
  { title: "Author Profile", icon: <User size={18} />, desc: "Personal information and bio" },
  { title: "Book Details", icon: <BookOpen size={18} />, desc: "Title, synopsis, and cover" },
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
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string | null>(null);
  const [paymentBlob, setPaymentBlob] = useState<File | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrCodeBlob, setQrCodeBlob] = useState<File | null>(null);
  const [dynamicFields, setDynamicFields] = useState<any[]>([]);
  const [extraDataState, setExtraDataState] = useState<any>({});
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/author-fields`)
      .then(res => {
        const requiredFields = res.data.filter((f: any) => f.requiredForRegistration);
        setDynamicFields(requiredFields);
      })
      .catch(console.error);
  }, []);


  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    whatsapp: "",
    bio: "",
    penName: "",
    city: "",
    state: "",
    instagram: "",
    facebook: "",
    title: "",
    subtitle: "",
    genre: "",
    subcategory: "",
    subSubcategory: "",
    synopsis: "",
    pages: "",
    mrp: "",
    stock: "0",
    language: "",
    isbn: "",
    publisher: "",
    publicationDate: "",
    edition: "",
    format: "",
    transactionId: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (key: string, value: string | boolean) => {
    let error = "";
    if (key === "name" && !value) error = "Name is required.";
    if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string)) error = "Invalid email address.";
    if (key === "password" && (value as string).length < 6) error = "Password must be at least 6 characters.";
    if (key === "phone" && !/^\d{10}$/.test((value as string).replace(/\D/g, ''))) error = "Must be a 10-digit number.";
    if (key === "bio" && !value) error = "Bio is required.";
    if (key === "city" && !value) error = "City is required.";
    if (key === "state" && !value) error = "State is required.";
    
    // For book details
    if (key === "title" && !value) error = "Title is required.";
    if (key === "genre" && !value) error = "Category is required.";
    if (key === "synopsis" && !value) error = "Synopsis is required.";
    if (key === "mrp" && (!value || Number(value) <= 0)) error = "Valid MRP is required.";
    if (key === "language" && !value) error = "Language is required.";
    if (key === "publisher" && !value) error = "Publisher is required.";
    if (key === "publicationDate" && !value) error = "Publication Date is required.";
    if (key === "format" && !value) error = "Book Format is required.";
    
    // Payment
    if (key === "transactionId" && !value) error = "Transaction ID is required.";

    setErrors((prev) => ({ ...prev, [key]: error }));
  };

  const update = (key: string, val: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    validateField(key, val);
  };

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
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Full Name *</label>
                      <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} style={{...inputStyle, borderColor: errors.name ? "#ef4444" : "rgba(0,0,0,0.12)"}} />
                      {errors.name && <div style={{ color: "#ef4444", fontSize: 11, marginTop: "0.2rem" }}>{errors.name}</div>}
                    </div>
                    <div>
                      <label style={labelStyle}>Pen Name</label>
                      <input type="text" value={form.penName} onChange={(e) => update("penName", e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Email Address *</label>
                      <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} style={{...inputStyle, borderColor: errors.email ? "#ef4444" : "rgba(0,0,0,0.12)"}} />
                      {errors.email && <div style={{ color: "#ef4444", fontSize: 11, marginTop: "0.2rem" }}>{errors.email}</div>}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Phone Number *</label>
                      <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} style={{...inputStyle, borderColor: errors.phone ? "#ef4444" : "rgba(0,0,0,0.12)"}} />
                      {errors.phone && <div style={{ color: "#ef4444", fontSize: 11, marginTop: "0.2rem" }}>{errors.phone}</div>}
                    </div>
                    <div>
                      <label style={labelStyle}>Password (For Login) *</label>
                      <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} style={{...inputStyle, borderColor: errors.password ? "#ef4444" : "rgba(0,0,0,0.12)"}} />
                      {errors.password && <div style={{ color: "#ef4444", fontSize: 11, marginTop: "0.2rem" }}>{errors.password}</div>}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>City *</label>
                      <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} style={{...inputStyle, borderColor: errors.city ? "#ef4444" : "rgba(0,0,0,0.12)"}} />
                      {errors.city && <div style={{ color: "#ef4444", fontSize: 11, marginTop: "0.2rem" }}>{errors.city}</div>}
                    </div>
                    <div>
                      <label style={labelStyle}>State *</label>
                      <input type="text" value={form.state} onChange={(e) => update("state", e.target.value)} style={{...inputStyle, borderColor: errors.state ? "#ef4444" : "rgba(0,0,0,0.12)"}} />
                      {errors.state && <div style={{ color: "#ef4444", fontSize: 11, marginTop: "0.2rem" }}>{errors.state}</div>}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Instagram Profile</label>
                      <input type="text" value={form.instagram} onChange={(e) => update("instagram", e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Facebook / LinkedIn Profile</label>
                      <input type="text" value={form.facebook} onChange={(e) => update("facebook", e.target.value)} style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Author Bio (100 words) *</label>
                    <textarea
                      placeholder="Tell us a little bit about yourself, your background, and your journey as a writer..."
                      value={form.bio}
                      onChange={(e) => update("bio", e.target.value)}
                      rows={5}
                      style={{ ...inputStyle, resize: "vertical", borderColor: errors.bio ? "#ef4444" : "rgba(0,0,0,0.12)" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "0.3rem" }}>
                      {errors.bio ? <div style={{ color: "#ef4444", fontSize: 11 }}>{errors.bio}</div> : <div></div>}
                      <div style={{ fontSize: 11, color: "#6b6b80", textAlign: "right" }}>
                        {form.bio.split(/\s+/).filter(Boolean).length} / 100 words
                      </div>
                    </div>
                  </div>


                  {dynamicFields.length > 0 && (
                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: '1rem' }}>Additional Required Information</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        {dynamicFields.map(f => (
                          <div key={f.name}>
                            <label style={labelStyle}>{f.name} *</label>
                            {f.type === 'number' ? (
                              <input type="number" required style={inputStyle} value={extraDataState[f.name] || ''} onChange={e => setExtraDataState({...extraDataState, [f.name]: e.target.value})} />
                            ) : f.type === 'date' ? (
                              <input type="date" required style={inputStyle} value={extraDataState[f.name] || ''} onChange={e => setExtraDataState({...extraDataState, [f.name]: e.target.value})} />
                            ) : (
                              <input type="text" required style={inputStyle} value={extraDataState[f.name] || ''} onChange={e => setExtraDataState({...extraDataState, [f.name]: e.target.value})} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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

                  {/* QR Code upload */}
                  <div>
                    <label style={labelStyle}>Your Payment QR Code * <span style={{ fontSize: 11, color: "#6b6b80", fontWeight: 400 }}>(This QR will be shown to customers when they purchase your book)</span></label>
                    <div
                      style={{ border: "2px dashed rgba(0,0,0,0.12)", borderRadius: 12, padding: "1.5rem", textAlign: "center", background: "#f7f7f9", cursor: "pointer" }}
                      onClick={() => document.getElementById("qr-code-upload")?.click()}
                    >
                      {qrCodeUrl ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                          <img src={qrCodeUrl} alt="QR preview" style={{ width: 80, height: 80, objectFit: "contain", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)" }} />
                          <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>QR Code uploaded ✓</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={24} color="#6b6b80" style={{ margin: "0 auto 0.5rem" }} />
                          <div style={{ fontSize: 13, color: "#6b6b80" }}>Click to upload your UPI / Bank QR code</div>
                          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: "0.25rem" }}>PNG, JPG up to 5MB</div>
                        </>
                      )}
                    </div>
                    <input
                      id="qr-code-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setQrCodeBlob(file);
                          setQrCodeUrl(URL.createObjectURL(file));
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
                <p style={{ fontSize: 13, color: "#6b6b80", marginBottom: "1.75rem" }}>Information about the book(s) you wish to publish or register with PAA.</p>

                {books.length > 0 && (
                  <div style={{ marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>Added Books ({books.length})</h3>
                    {books.map((b, idx) => (
                      <div key={idx} style={{ background: "#f8f9fa", padding: "0.75rem 1rem", borderRadius: 8, border: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>{b.title}</div>
                          <div style={{ fontSize: 12, color: "#6b6b80" }}>{b.genre} {b.subcategory && `> ${b.subcategory}`}</div>
                        </div>
                        {b.coverFileUrl && <img src={b.coverFileUrl} alt="cover" style={{ height: 40, width: 30, objectFit: "cover", borderRadius: 4 }} />}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: "grid", gap: "1rem", padding: books.length > 0 ? "1.5rem" : "0", background: books.length > 0 ? "#fff" : "transparent", borderRadius: 12, border: books.length > 0 ? "1px solid #e5e7eb" : "none" }}>
                  {books.length > 0 && <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", marginBottom: "-0.5rem" }}>Add Another Book</h3>}
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Book Title *</label>
                      <input type="text" placeholder="e.g. The Forgotten Horizon" value={form.title} onChange={(e) => update("title", e.target.value)} style={{...inputStyle, borderColor: errors.title ? "#ef4444" : "rgba(0,0,0,0.12)"}} />
                      {errors.title && <div style={{ color: "#ef4444", fontSize: 11, marginTop: "0.2rem" }}>{errors.title}</div>}
                    </div>
                    <div>
                      <label style={labelStyle}>Subtitle</label>
                      <input type="text" placeholder="e.g. A Journey Through Time" value={form.subtitle} onChange={(e) => update("subtitle", e.target.value)} style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Category *</label>
                      <select value={form.genre} onChange={(e) => { update("genre", e.target.value); update("subcategory", ""); update("subSubcategory", ""); }} style={{...inputStyle, borderColor: errors.genre ? "#ef4444" : "rgba(0,0,0,0.12)"}}>
                        <option value="">Select Category</option>
                        {Object.keys(bookCategories).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {errors.genre && <div style={{ color: "#ef4444", fontSize: 11, marginTop: "0.2rem" }}>{errors.genre}</div>}
                    </div>
                    {form.genre && Object.keys(bookCategories[form.genre as keyof typeof bookCategories] || {}).length > 0 && (
                      <div>
                        <label style={labelStyle}>Subcategory</label>
                        <select value={form.subcategory} onChange={(e) => { update("subcategory", e.target.value); update("subSubcategory", ""); }} style={inputStyle}>
                          <option value="">Select Subcategory</option>
                          {Object.keys(bookCategories[form.genre as keyof typeof bookCategories] || {}).map(sc => <option key={sc} value={sc}>{sc}</option>)}
                        </select>
                      </div>
                    )}
                    {form.genre && form.subcategory && ((bookCategories[form.genre as keyof typeof bookCategories] as any)[form.subcategory] || []).length > 0 && (
                      <div>
                        <label style={labelStyle}>Specific Genre</label>
                        <select value={form.subSubcategory} onChange={(e) => update("subSubcategory", e.target.value)} style={inputStyle}>
                          <option value="">Select Specific Genre</option>
                          {((bookCategories[form.genre as keyof typeof bookCategories] as any)[form.subcategory] || []).map((ssc: string) => <option key={ssc} value={ssc}>{ssc}</option>)}
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={labelStyle}>Synopsis (100 words) *</label>
                    <textarea
                      placeholder="A compelling description of your book — what it's about, who it's for, and what makes it unique..."
                      value={form.synopsis}
                      onChange={(e) => update("synopsis", e.target.value)}
                      rows={5}
                      style={{ ...inputStyle, resize: "vertical", borderColor: errors.synopsis ? "#ef4444" : "rgba(0,0,0,0.12)" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "0.3rem" }}>
                      {errors.synopsis ? <div style={{ color: "#ef4444", fontSize: 11 }}>{errors.synopsis}</div> : <div></div>}
                      <div style={{ fontSize: 11, color: "#6b6b80", textAlign: "right" }}>
                        {form.synopsis.split(/\s+/).filter(Boolean).length} / 100 words
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Language *</label>
                      <input type="text" placeholder="e.g. English, Marathi" value={form.language} onChange={(e) => update("language", e.target.value)} style={{...inputStyle, borderColor: errors.language ? "#ef4444" : "rgba(0,0,0,0.12)"}} />
                      {errors.language && <div style={{ color: "#ef4444", fontSize: 11, marginTop: "0.2rem" }}>{errors.language}</div>}
                    </div>
                    <div>
                      <label style={labelStyle}>Publisher Name *</label>
                      <input type="text" placeholder="e.g. Self-Published" value={form.publisher} onChange={(e) => update("publisher", e.target.value)} style={{...inputStyle, borderColor: errors.publisher ? "#ef4444" : "rgba(0,0,0,0.12)"}} />
                      {errors.publisher && <div style={{ color: "#ef4444", fontSize: 11, marginTop: "0.2rem" }}>{errors.publisher}</div>}
                    </div>
                    <div>
                      <label style={labelStyle}>Publication Date *</label>
                      <input type="date" value={form.publicationDate} onChange={(e) => update("publicationDate", e.target.value)} style={{...inputStyle, borderColor: errors.publicationDate ? "#ef4444" : "rgba(0,0,0,0.12)"}} />
                      {errors.publicationDate && <div style={{ color: "#ef4444", fontSize: 11, marginTop: "0.2rem" }}>{errors.publicationDate}</div>}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>ISBN Number</label>
                      <input type="text" placeholder="e.g. 978-3-16-148410-0" value={form.isbn} onChange={(e) => update("isbn", e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Edition</label>
                      <input type="text" placeholder="e.g. 1st Edition" value={form.edition} onChange={(e) => update("edition", e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Book Format *</label>
                      <select value={form.format} onChange={(e) => update("format", e.target.value)} style={{...inputStyle, borderColor: errors.format ? "#ef4444" : "rgba(0,0,0,0.12)"}}>
                        <option value="">Select Format</option>
                        <option value="Paperback">Paperback</option>
                        <option value="Hardcover">Hardcover</option>
                        <option value="Ebook">Ebook</option>
                      </select>
                      {errors.format && <div style={{ color: "#ef4444", fontSize: 11, marginTop: "0.2rem" }}>{errors.format}</div>}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Number of Pages</label>
                      <input type="number" placeholder="256" value={form.pages} onChange={(e) => update("pages", e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>MRP (₹) *</label>
                      <input type="number" placeholder="299" value={form.mrp} onChange={(e) => update("mrp", e.target.value)} style={{...inputStyle, borderColor: errors.mrp ? "#ef4444" : "rgba(0,0,0,0.12)"}} />
                      {errors.mrp && <div style={{ color: "#ef4444", fontSize: 11, marginTop: "0.2rem" }}>{errors.mrp}</div>}
                    </div>
                    <div>
                      <label style={labelStyle}>Initial Stock (Optional)</label>
                      <input type="number" placeholder="0" value={form.stock} onChange={(e) => update("stock", e.target.value)} style={inputStyle} />
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

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!form.title || !form.genre || !form.synopsis || !form.mrp || !form.language || !form.publisher || !form.publicationDate || !form.format || !coverBlob) {
                          alert("Please fill all compulsory fields and upload a cover to add this book.");
                          return;
                        }
                        setBooks([...books, { ...form, coverBlob, coverFileUrl }]);
                        setForm({...form, title: "", subtitle: "", genre: "", subcategory: "", subSubcategory: "", synopsis: "", pages: "", mrp: "", stock: "0", language: "", isbn: "", publisher: "", publicationDate: "", edition: "", format: ""});
                        setCoverBlob(null);
                        setCoverFileUrl(null);
                      }}
                      style={{
                        background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0",
                        padding: "0.5rem 1rem", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer"
                      }}
                    >
                      + Save & Add Another Book
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginBottom: "0.3rem" }}>Application Fee Payment</h2>
                <p style={{ fontSize: 13, color: "#6b6b80", marginBottom: "1.75rem" }}>A one-time registration fee of ₹500 secures your PAA membership and editorial review.</p>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem" }}>
                  <img src={qrCode} alt="Payment QR" style={{ width: 200, height: 200, borderRadius: 12, border: "2px solid #e5e7eb" }} />
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e", marginTop: "0.5rem" }}>Scan QR to Pay ₹500</p>
                </div>

                <div style={{ display: "grid", gap: "1rem" }}>
                  <div>
                    <label style={labelStyle}>Transaction ID *</label>
                    <input type="text" required placeholder="e.g. T23456789012" value={form.transactionId} onChange={(e) => update("transactionId", e.target.value)} style={{...inputStyle, borderColor: errors.transactionId ? "#ef4444" : "rgba(0,0,0,0.12)"}} />
                    {errors.transactionId && <div style={{ color: "#ef4444", fontSize: 11, marginTop: "0.2rem" }}>{errors.transactionId}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>Payment Screenshot *</label>
                    <div
                      style={{ border: "2px dashed rgba(0,0,0,0.12)", borderRadius: 12, padding: "1.5rem", textAlign: "center", background: "#f7f7f9", cursor: "pointer" }}
                      onClick={() => document.getElementById("payment-screenshot-upload")?.click()}
                    >
                      {paymentScreenshotUrl ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                          <img src={paymentScreenshotUrl} alt="screenshot preview" style={{ height: 60, objectFit: "contain", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)" }} />
                          <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>Screenshot uploaded ✓</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={24} color="#6b6b80" style={{ margin: "0 auto 0.5rem" }} />
                          <div style={{ fontSize: 13, color: "#6b6b80" }}>Click to upload payment screenshot</div>
                        </>
                      )}
                    </div>
                    <input
                      id="payment-screenshot-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPaymentBlob(file);
                          setPaymentScreenshotUrl(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>
                </div>

                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "1rem", marginTop: "1rem", fontSize: 12, color: "#166534" }}>
                  <strong>Application Fee:</strong> ₹500 (one-time minimum fee)<br />
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
                  onClick={() => {
                    if (step === 0) {
                      if (!form.name || !form.email || !form.phone || !form.password || !form.bio || !authorBlob) {
                        alert("Please fill all compulsory fields in this step and upload author photo."); return;
                      }
                      if (!qrCodeBlob) {
                        alert("Please upload your Payment QR Code — customers will use it to pay you directly."); return;
                      }
                                            if (dynamicFields.length > 0) {
                        for (const f of dynamicFields) {
                          if (!extraDataState[f.name]) {
                            alert(`Please fill the required field: ${f.name}`); return;
                          }
                        }
                      }
                      if (!/^\S+@\S+\.\S+$/.test(form.email)) {
                        alert("Please enter a valid email address."); return;
                      }
                      if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) {
                        alert("Please enter a valid 10-digit phone number."); return;
                      }
                    } else if (step === 1) {
                      if (!form.title || !form.genre || !form.synopsis || !form.mrp || !form.language || !form.publisher || !form.publicationDate || !form.format || !coverBlob) {
                        if (books.length === 0) {
                          alert("Please fill all compulsory fields in this step and upload book cover."); return;
                        }
                      } else {
                        // Auto-save the current book before moving to next step
                        setBooks([...books, { ...form, coverBlob, coverFileUrl }]);
                        setForm({...form, title: "", subtitle: "", genre: "", subcategory: "", subSubcategory: "", synopsis: "", pages: "", mrp: "", stock: "0", language: "", isbn: "", publisher: "", publicationDate: "", edition: "", format: ""});
                        setCoverBlob(null);
                        setCoverFileUrl(null);
                      }
                    }
                    setStep((s) => Math.min(steps.length - 1, s + 1));
                  }}
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

                    if (!form.transactionId || !paymentBlob) {
                      alert("Please provide the transaction ID and upload the payment screenshot.");
                      return;
                    }
                    
                    setIsSubmitting(true);
                    try {
                      const formData = new FormData();
                      Object.entries(form).forEach(([key, val]) => {
                        const bookKeys = ['subcategory', 'subSubcategory', 'title', 'genre', 'synopsis', 'pages', 'mrp', 'stock', 'subtitle', 'language', 'isbn', 'publisher', 'publicationDate', 'edition', 'format'];
                        if (!bookKeys.includes(key)) {
                           formData.append(key, String(val));
                        }
                      });
                      
                      const finalBooks = [...books];
                      if (form.title && form.genre && form.mrp) {
                        finalBooks.push({ ...form, coverBlob });
                      }
                      
                      formData.append("books", JSON.stringify(finalBooks.map(b => {
                        let subGenre = b.subcategory;
                        if (b.subSubcategory) subGenre += ' > ' + b.subSubcategory;
                        return {
                          title: b.title,
                          subtitle: b.subtitle,
                          genre: b.genre,
                          subGenre: subGenre,
                          synopsis: b.synopsis,
                          pages: b.pages,
                          mrp: b.mrp,
                          stock: b.stock,
                          language: b.language,
                          isbn: b.isbn,
                          publisher: b.publisher,
                          publicationDate: b.publicationDate,
                          edition: b.edition,
                          format: b.format
                        };
                      })));

                      if (authorBlob) formData.append("photo", authorBlob);
                      finalBooks.forEach((b, idx) => {
                        if (b.coverBlob) formData.append(`cover_${idx}`, b.coverBlob);
                      });
                      if (paymentBlob) formData.append("paymentScreenshot", paymentBlob);
                      if (qrCodeBlob) formData.append("qrCode", qrCodeBlob);
                      if (Object.keys(extraDataState).length > 0) {
                        formData.append("extraData", JSON.stringify(extraDataState));
                      }

                      
                      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/authors/register`, formData);
                      setSubmitted(true);
                    } catch (e: any) {
                      const msg = e.response?.data?.error || e.message || "Unknown error";
                      const details = e.response?.data?.details || "";
                      alert(`Failed to submit: ${msg} ${details}`);
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
              Thank you, <strong>{form.name || "Author"}</strong>! Your application for <em>"{[...books.map(b => b.title), form.title].filter(Boolean).join(", ") || "your books"}"</em> has been received. <br/><br/>
              <strong style={{ color: "#d97706" }}>Approval Pending:</strong> You must wait for the Admin to approve your account. Once approved, you will be able to log in to your Author Dashboard.
            </p>
            {/* Receipt */}
            <div style={{ background: "#f7f7f9", borderRadius: 14, padding: "1.5rem", maxWidth: 380, margin: "0 auto", textAlign: "left", border: "1px dashed rgba(0,0,0,0.12)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#6b6b80", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem", textAlign: "center" }}>Application Receipt</div>
              {[
                { label: "Application ID", value: "PAA-APP-2025-" + Math.floor(Math.random() * 9000 + 1000) },
                { label: "Author Name", value: form.name || "—" },
                { label: "Book Title(s)", value: [...books.map(b => b.title), form.title].filter(Boolean).join(", ") || "—" },
                { label: "Genre", value: Array.from(new Set([...books.map(b => b.genre), form.genre].filter(Boolean))).join(", ") || "—" },
                { label: "Fee Paid", value: "₹500" },
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
