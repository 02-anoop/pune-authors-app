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

  return (
    <main className="font-sans min-h-screen bg-[#F8FAFC] text-paa-navy">
      {/* Header */}
      <section className="bg-paa-navy py-16 px-6 text-center text-white">
        <div className="font-sans text-[10px] text-paa-gold tracking-widest uppercase font-bold mb-3">New Author Onboarding</div>
        <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight mb-3">Join Pune Authors' Association</h1>
        <p className="text-sm text-white/60 max-w-lg mx-auto">A one-time application reviewed by our editorial team within 5-7 working days.</p>
      </section>

      {/* Stepper */}
      <div className="bg-white border-b border-paa-navy/5 px-6 py-5 sticky top-0 z-40 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-center">
          {steps.map((s, i) => (
            <div key={s.title} className="flex items-center">
              <div
                className={`flex flex-col items-center px-3 ${i <= step ? "cursor-pointer" : "cursor-default"}`}
                onClick={() => { if (i <= step) setStep(i); }}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 shadow-sm
                  ${i < step ? "bg-emerald-500 text-white shadow-emerald-500/20" : i === step ? "bg-paa-gold text-paa-navy shadow-paa-gold/20" : "bg-gray-100 text-gray-400"}`}>
                  {i < step ? <CheckCircle size={18} /> : s.icon}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest text-center max-w-[80px] truncate transition-colors ${i === step ? "text-paa-navy" : "text-gray-400"}`}>
                  {s.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 h-0.5 transition-colors ${i < step ? "bg-emerald-500" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto my-12 px-6 pb-20">
        {!submitted ? (
          <div className="bg-white rounded-3xl-2xl border border-paa-navy/5 p-8 md:p-12 shadow-premium hover:shadow-premium-hover transition-all duration-500 ease-out">
            {/* Step 0: Author Profile */}
            {step === 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="font-serif text-2xl font-medium text-paa-navy mb-2">Author Profile</h2>
                <p className="text-sm text-paa-gray-text mb-8">Tell us about yourself. This information will be publicly displayed on your PAA author page.</p>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="dash-label">Full Name *</label>
                      <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className={`dash-input w-full ${errors.name ? '!border-red-500' : ''}`} placeholder="e.g. Jane Doe" />
                      {errors.name && <div className="text-red-500 text-xs mt-1 font-medium">{errors.name}</div>}
                    </div>
                    <div>
                      <label className="dash-label">Pen Name</label>
                      <input type="text" value={form.penName} onChange={(e) => update("penName", e.target.value)} className="dash-input w-full" placeholder="e.g. J.D." />
                    </div>
                    <div>
                      <label className="dash-label">Email Address *</label>
                      <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={`dash-input w-full ${errors.email ? '!border-red-500' : ''}`} placeholder="jane@example.com" />
                      {errors.email && <div className="text-red-500 text-xs mt-1 font-medium">{errors.email}</div>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="dash-label">Phone Number *</label>
                      <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={`dash-input w-full ${errors.phone ? '!border-red-500' : ''}`} placeholder="10-digit mobile number" />
                      {errors.phone && <div className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</div>}
                    </div>
                    <div>
                      <label className="dash-label">Password (For Login) *</label>
                      <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} className={`dash-input w-full ${errors.password ? '!border-red-500' : ''}`} placeholder="Min 6 characters" />
                      {errors.password && <div className="text-red-500 text-xs mt-1 font-medium">{errors.password}</div>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="dash-label">City *</label>
                      <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} className={`dash-input w-full ${errors.city ? '!border-red-500' : ''}`} placeholder="e.g. Pune" />
                      {errors.city && <div className="text-red-500 text-xs mt-1 font-medium">{errors.city}</div>}
                    </div>
                    <div>
                      <label className="dash-label">State *</label>
                      <input type="text" value={form.state} onChange={(e) => update("state", e.target.value)} className={`dash-input w-full ${errors.state ? '!border-red-500' : ''}`} placeholder="e.g. Maharashtra" />
                      {errors.state && <div className="text-red-500 text-xs mt-1 font-medium">{errors.state}</div>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="dash-label">Instagram Profile</label>
                      <input type="text" value={form.instagram} onChange={(e) => update("instagram", e.target.value)} className="dash-input w-full" placeholder="@username" />
                    </div>
                    <div>
                      <label className="dash-label">Facebook / LinkedIn Profile</label>
                      <input type="text" value={form.facebook} onChange={(e) => update("facebook", e.target.value)} className="dash-input w-full" placeholder="Profile URL" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="dash-label">Author Bio (100 words) *</label>
                    <textarea
                      placeholder="Tell us a little bit about yourself, your background, and your journey as a writer..."
                      value={form.bio}
                      onChange={(e) => update("bio", e.target.value)}
                      rows={5}
                      className={`dash-input w-full resize-y ${errors.bio ? '!border-red-500' : ''}`}
                    />
                    <div className="flex justify-between items-start mt-1">
                      {errors.bio ? <div className="text-red-500 text-xs font-medium">{errors.bio}</div> : <div></div>}
                      <div className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text">
                        {form.bio.split(/\s+/).filter(Boolean).length} / 100 words
                      </div>
                    </div>
                  </div>


                  {dynamicFields.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-paa-navy/5">
                      <h3 className="font-serif text-lg font-medium text-paa-navy mb-4">Additional Required Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {dynamicFields.map(f => (
                          <div key={f.name}>
                            <label className="dash-label">{f.name} *</label>
                            {f.type === 'number' ? (
                              <input type="number" required className="dash-input w-full" value={extraDataState[f.name] || ''} onChange={e => setExtraDataState({...extraDataState, [f.name]: e.target.value})} />
                            ) : f.type === 'date' ? (
                              <input type="date" required className="dash-input w-full" value={extraDataState[f.name] || ''} onChange={e => setExtraDataState({...extraDataState, [f.name]: e.target.value})} />
                            ) : (
                              <input type="text" required className="dash-input w-full" value={extraDataState[f.name] || ''} onChange={e => setExtraDataState({...extraDataState, [f.name]: e.target.value})} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                    {/* Author photo upload */}
                    <div>
                      <label className="dash-label">Author Photo</label>
                      <div
                        className="border border-dashed border-paa-navy/20 rounded-3xl-2xl p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[140px]"
                        onClick={() => document.getElementById("author-photo")?.click()}
                      >
                        {authorPhotoUrl ? (
                          <div className="flex flex-col items-center gap-3">
                            <img src={authorPhotoUrl} alt="preview" className="w-16 h-16 rounded-full object-cover shadow-sm ring-2 ring-emerald-500/20" />
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Photo Uploaded</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-paa-navy/40 mb-3" />
                            <div className="text-sm font-medium text-paa-navy mb-1">Click to upload headshot</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text">JPG, PNG up to 5MB</div>
                          </>
                        )}
                      </div>
                      <input
                        id="author-photo"
                        type="file"
                        accept="image/*"
                        className="hidden"
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
                      <label className="dash-label">Your Payment QR Code * <span className="font-normal normal-case tracking-normal opacity-70">(Shown to customers for direct payment)</span></label>
                      <div
                        className="border border-dashed border-paa-navy/20 rounded-3xl-2xl p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[140px]"
                        onClick={() => document.getElementById("qr-code-upload")?.click()}
                      >
                        {qrCodeUrl ? (
                          <div className="flex flex-col items-center gap-3">
                            <img src={qrCodeUrl} alt="QR preview" className="w-16 h-16 object-contain rounded-lg border border-paa-navy/10 bg-white" />
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">QR Code Uploaded</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-paa-navy/40 mb-3" />
                            <div className="text-sm font-medium text-paa-navy mb-1">Click to upload UPI/Bank QR</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text">PNG, JPG up to 5MB</div>
                          </>
                        )}
                      </div>
                      <input
                        id="qr-code-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
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
              </div>
            )}

            {/* Step 1: Book Details */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="font-serif text-2xl font-medium text-paa-navy mb-2">Book Details</h2>
                <p className="text-sm text-paa-gray-text mb-8">Information about the book(s) you wish to publish or register with PAA.</p>

                {books.length > 0 && (
                  <div className="mb-8 flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Added Books ({books.length})</h3>
                    {books.map((b, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-paa-navy/10 flex justify-between items-center shadow-sm">
                        <div>
                          <div className="font-bold text-paa-navy text-sm mb-0.5">{b.title}</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text">{b.genre} {b.subcategory && `> ${b.subcategory}`}</div>
                        </div>
                        {b.coverFileUrl && <img src={b.coverFileUrl} alt="cover" className="h-12 w-9 object-cover rounded shadow-sm border border-paa-navy/10" />}
                      </div>
                    ))}
                  </div>
                )}

                <div className={`space-y-6 ${books.length > 0 ? 'p-8 bg-gray-50/50 rounded-3xl-2xl border border-paa-navy/5' : ''}`}>
                  {books.length > 0 && <h3 className="font-serif text-lg font-medium text-paa-navy mb-2">Add Another Book</h3>}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="dash-label">Book Title *</label>
                      <input type="text" placeholder="e.g. The Forgotten Horizon" value={form.title} onChange={(e) => update("title", e.target.value)} className={`dash-input w-full ${errors.title ? '!border-red-500' : ''}`} />
                      {errors.title && <div className="text-red-500 text-xs mt-1 font-medium">{errors.title}</div>}
                    </div>
                    <div>
                      <label className="dash-label">Subtitle</label>
                      <input type="text" placeholder="e.g. A Journey Through Time" value={form.subtitle} onChange={(e) => update("subtitle", e.target.value)} className="dash-input w-full" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="dash-label">Category *</label>
                      <select value={form.genre} onChange={(e) => { update("genre", e.target.value); update("subcategory", ""); update("subSubcategory", ""); }} className={`dash-input w-full ${errors.genre ? '!border-red-500' : ''}`}>
                        <option value="">Select Category</option>
                        {Object.keys(bookCategories).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {errors.genre && <div className="text-red-500 text-xs mt-1 font-medium">{errors.genre}</div>}
                    </div>
                    {form.genre && Object.keys(bookCategories[form.genre as keyof typeof bookCategories] || {}).length > 0 && (
                      <div>
                        <label className="dash-label">Subcategory</label>
                        <select value={form.subcategory} onChange={(e) => { update("subcategory", e.target.value); update("subSubcategory", ""); }} className="dash-input w-full">
                          <option value="">Select Subcategory</option>
                          {Object.keys(bookCategories[form.genre as keyof typeof bookCategories] || {}).map(sc => <option key={sc} value={sc}>{sc}</option>)}
                        </select>
                      </div>
                    )}
                    {form.genre && form.subcategory && ((bookCategories[form.genre as keyof typeof bookCategories] as any)[form.subcategory] || []).length > 0 && (
                      <div>
                        <label className="dash-label">Specific Genre</label>
                        <select value={form.subSubcategory} onChange={(e) => update("subSubcategory", e.target.value)} className="dash-input w-full">
                          <option value="">Select Specific Genre</option>
                          {((bookCategories[form.genre as keyof typeof bookCategories] as any)[form.subcategory] || []).map((ssc: string) => <option key={ssc} value={ssc}>{ssc}</option>)}
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="dash-label">Synopsis (100 words) *</label>
                    <textarea
                      placeholder="A compelling description of your book — what it's about, who it's for, and what makes it unique..."
                      value={form.synopsis}
                      onChange={(e) => update("synopsis", e.target.value)}
                      rows={5}
                      className={`dash-input w-full resize-y ${errors.synopsis ? '!border-red-500' : ''}`}
                    />
                    <div className="flex justify-between items-start mt-1">
                      {errors.synopsis ? <div className="text-red-500 text-xs font-medium">{errors.synopsis}</div> : <div></div>}
                      <div className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text">
                        {form.synopsis.split(/\s+/).filter(Boolean).length} / 100 words
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="dash-label">Language *</label>
                      <input type="text" placeholder="e.g. English, Marathi" value={form.language} onChange={(e) => update("language", e.target.value)} className={`dash-input w-full ${errors.language ? '!border-red-500' : ''}`} />
                      {errors.language && <div className="text-red-500 text-xs mt-1 font-medium">{errors.language}</div>}
                    </div>
                    <div>
                      <label className="dash-label">Publisher Name *</label>
                      <input type="text" placeholder="e.g. Self-Published" value={form.publisher} onChange={(e) => update("publisher", e.target.value)} className={`dash-input w-full ${errors.publisher ? '!border-red-500' : ''}`} />
                      {errors.publisher && <div className="text-red-500 text-xs mt-1 font-medium">{errors.publisher}</div>}
                    </div>
                    <div>
                      <label className="dash-label">Publication Date *</label>
                      <input type="date" value={form.publicationDate} onChange={(e) => update("publicationDate", e.target.value)} className={`dash-input w-full ${errors.publicationDate ? '!border-red-500' : ''}`} />
                      {errors.publicationDate && <div className="text-red-500 text-xs mt-1 font-medium">{errors.publicationDate}</div>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="dash-label">ISBN Number</label>
                      <input type="text" placeholder="e.g. 978-3-16-148410-0" value={form.isbn} onChange={(e) => update("isbn", e.target.value)} className="dash-input w-full" />
                    </div>
                    <div>
                      <label className="dash-label">Edition</label>
                      <input type="text" placeholder="e.g. 1st Edition" value={form.edition} onChange={(e) => update("edition", e.target.value)} className="dash-input w-full" />
                    </div>
                    <div>
                      <label className="dash-label">Book Format *</label>
                      <select value={form.format} onChange={(e) => update("format", e.target.value)} className={`dash-input w-full ${errors.format ? '!border-red-500' : ''}`}>
                        <option value="">Select Format</option>
                        <option value="Paperback">Paperback</option>
                        <option value="Hardcover">Hardcover</option>
                        <option value="Ebook">Ebook</option>
                      </select>
                      {errors.format && <div className="text-red-500 text-xs mt-1 font-medium">{errors.format}</div>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="dash-label">Number of Pages</label>
                      <input type="number" placeholder="256" value={form.pages} onChange={(e) => update("pages", e.target.value)} className="dash-input w-full" />
                    </div>
                    <div>
                      <label className="dash-label">MRP (₹) *</label>
                      <input type="number" placeholder="299" value={form.mrp} onChange={(e) => update("mrp", e.target.value)} className={`dash-input w-full ${errors.mrp ? '!border-red-500' : ''}`} />
                      {errors.mrp && <div className="text-red-500 text-xs mt-1 font-medium">{errors.mrp}</div>}
                    </div>
                    <div>
                      <label className="dash-label">Initial Stock (Optional)</label>
                      <input type="number" placeholder="0" value={form.stock} onChange={(e) => update("stock", e.target.value)} className="dash-input w-full" />
                    </div>
                  </div>

                  {/* Cover upload */}
                  <div className="pt-2">
                    <label className="dash-label">Book Cover Upload *</label>
                    <div
                      className="border border-dashed border-paa-navy/20 rounded-3xl-2xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer flex flex-col items-center justify-center"
                      onClick={() => document.getElementById("cover-upload")?.click()}
                    >
                      {coverFileUrl ? (
                        <div className="flex flex-col items-center gap-3">
                          <img src={coverFileUrl} alt="cover preview" className="h-24 object-contain rounded shadow-sm border border-paa-navy/10 bg-white" />
                          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Cover Uploaded</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-paa-navy/40 mb-3" />
                          <div className="text-sm font-medium text-paa-navy mb-1">Upload Book Cover</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text">High resolution JPG or PNG, ideally 1600×2400px</div>
                        </>
                      )}
                    </div>
                    <input
                      id="cover-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCoverBlob(file);
                          setCoverFileUrl(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>

                  <div className="flex justify-end mt-4">
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
                      className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-colors rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                    >
                      <Plus className="w-3 h-3" /> Save & Add Another Book
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="font-serif text-2xl font-medium text-paa-navy mb-2">Application Fee Payment</h2>
                <p className="text-sm text-paa-gray-text mb-8">A one-time registration fee of ₹1000 secures your PAA membership and editorial review.</p>

                <div className="flex flex-col items-center mb-10">
                  <div className="p-2 bg-white rounded-2xl border border-paa-navy/10 shadow-sm mb-4">
                    <img src={qrCode} alt="Payment QR" className="w-48 h-48 object-cover rounded-xl" />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest text-paa-navy bg-paa-gold/20 px-4 py-1.5 rounded-full">Scan QR to Pay ₹1000</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="dash-label">Transaction ID *</label>
                    <input type="text" required placeholder="e.g. T23456789012" value={form.transactionId} onChange={(e) => update("transactionId", e.target.value)} className={`dash-input w-full ${errors.transactionId ? '!border-red-500' : ''}`} />
                    {errors.transactionId && <div className="text-red-500 text-xs mt-1 font-medium">{errors.transactionId}</div>}
                    
                    <div className="mt-8 bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 text-sm text-emerald-800 leading-relaxed shadow-sm">
                      <strong className="font-bold text-emerald-900 block mb-1">Application Fee: ₹1000</strong>
                      <span className="opacity-90 text-xs">Your application will be reviewed within 5-7 business days. You will be notified via email once approved.</span>
                    </div>
                  </div>
                  <div>
                    <label className="dash-label">Payment Screenshot *</label>
                    <div
                      className="border border-dashed border-paa-navy/20 rounded-3xl-2xl p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[160px]"
                      onClick={() => document.getElementById("payment-screenshot-upload")?.click()}
                    >
                      {paymentScreenshotUrl ? (
                        <div className="flex flex-col items-center gap-3">
                          <img src={paymentScreenshotUrl} alt="screenshot preview" className="h-16 object-contain rounded shadow-sm border border-paa-navy/10 bg-white" />
                          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Screenshot Uploaded</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-paa-navy/40 mb-3" />
                          <div className="text-sm font-medium text-paa-navy mb-1">Upload payment screenshot</div>
                        </>
                      )}
                    </div>
                    <input
                      id="payment-screenshot-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
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
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-10 pt-8 border-t border-paa-navy/5">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${step === 0 ? "text-gray-300 cursor-default" : "text-paa-navy hover:bg-gray-100 active:scale-95 border border-paa-navy/10"}`}
              >
                <ChevronLeft size={14} /> Back
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
                  className="dash-btn dash-btn-primary rounded-full px-6 py-2.5 flex items-center gap-2"
                >
                  Continue <ChevronRight size={14} />
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
                  className={`dash-btn px-6 py-2.5 rounded-full flex items-center gap-2 ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-premium hover:-translate-y-0.5"}`}
                >
                  {isSubmitting ? <span className="animate-pulse">Submitting...</span> : <><CheckCircle size={14} /> Submit Application</>}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Success state */
          <div className="bg-white rounded-3xl-2xl border border-paa-navy/5 p-10 md:p-14 text-center shadow-premium animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="font-serif text-3xl font-medium text-paa-navy mb-3">Application Submitted!</h2>
            <p className="text-sm text-paa-gray-text leading-relaxed max-w-md mx-auto mb-8">
              Thank you, <strong className="text-paa-navy font-bold">{form.name || "Author"}</strong>! Your application for <em>"{[...books.map(b => b.title), form.title].filter(Boolean).join(", ") || "your books"}"</em> has been received. <br/><br/>
              <strong className="text-paa-gold">Approval Pending:</strong> You must wait for the Admin to approve your account. Once approved, you will be able to log in to your Author Dashboard.
            </p>
            
            {/* Receipt */}
            <div className="bg-gray-50 rounded-2xl p-6 max-w-sm mx-auto text-left border border-dashed border-paa-navy/20 shadow-sm mb-10">
              <div className="font-mono text-[10px] font-bold text-paa-gray-text tracking-widest uppercase mb-4 text-center">Application Receipt</div>
              <div className="space-y-3">
                {[
                  { label: "Application ID", value: "PAA-APP-2025-" + Math.floor(Math.random() * 9000 + 1000) },
                  { label: "Author Name", value: form.name || "—" },
                  { label: "Book Title(s)", value: [...books.map(b => b.title), form.title].filter(Boolean).join(", ") || "—" },
                  { label: "Genre", value: Array.from(new Set([...books.map(b => b.genre), form.genre].filter(Boolean))).join(", ") || "—" },
                  { label: "Fee Paid", value: "₹1000" },
                  { label: "Status", value: "Pending Review", isStatus: true },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center text-xs pb-2 border-b border-paa-navy/5 last:border-0 last:pb-0">
                    <span className="text-paa-gray-text font-medium">{item.label}</span>
                    <span className={`font-bold ${item.isStatus ? "text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-widest text-[9px]" : "text-paa-navy text-right max-w-[150px] truncate"}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => window.location.href = "/login"} className="dash-btn dash-btn-primary rounded-full px-8 py-3">
              Go to Login
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
