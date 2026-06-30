import { useState, useEffect, useRef } from "react";
import axios from "axios";
import qrCode from "./data/qr_code.jpeg";
import { bookCategories } from "../data/categories";
import { CheckCircle, Upload, CreditCard, User, BookOpen, FileText, Shield, ChevronRight, ChevronLeft, Plus, Eye, EyeOff, X, Edit, Instagram, Facebook, Linkedin, Youtube, Link as LinkIcon, ArrowLeft } from "lucide-react";

const indianStates = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const steps = [
  { title: "Author Profile", icon: <User size={18} />, desc: "Personal information and bio" },
  { title: "Book Details", icon: <BookOpen size={18} />, desc: "Title, synopsis, and cover" },
  { title: "Questionnaire", icon: <FileText size={18} />, desc: "Declarations & Guidelines" },
  { title: "Submit & Payment", icon: <CreditCard size={18} />, desc: "Application fee" },
];

const languages = [
  "English", "Hindi", "Marathi", "Bengali", "Telugu", "Tamil", "Gujarati", "Urdu", "Kannada", "Odia", "Malayalam", "Punjabi", "Other"
];

const genreOptions = [
  { code: "NF", label: "Non-Fiction", color: "#2563eb" },
  { code: "F", label: "Fiction", color: "#db2777" },
  { code: "P", label: "Poetry", color: "#d97706" },
  { code: "C", label: "Children's", color: "#16a34a" },
];

export function AuthorRegistrationPage({ initialData, isReapply = false, onReapplySuccess, isAdminEdit = false, onAdminSave, onAdminReject, onAdminCancel }: any = {}) {
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
  const [qualifications, setQualifications] = useState<any[]>([{ id: Date.now(), qualification: "", institution: "", subject: "", certificateUrl: "", certificateBlob: null }]);
  const [dynamicFields, setDynamicFields] = useState<any[]>([]);
  const [extraDataState, setExtraDataState] = useState<any>({});
  const [books, setBooks] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [hobbyInput, setHobbyInput] = useState("");

  // Modals for guidelines
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showInfoDoc, setShowInfoDoc] = useState(false);
  const hasInitialized = useRef(false);
  const hasLoadedDraft = useRef(false);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/author-fields`)
      .then(res => {
        const requiredFields = res.data.filter((f: any) => f.requiredForRegistration);
        setDynamicFields(requiredFields);
      })
      .catch(console.error);
      
    if ((isReapply || isAdminEdit) && initialData && !hasInitialized.current) {
       hasInitialized.current = true;
       let parsedQuals = [];
       try { parsedQuals = JSON.parse(initialData.qualification); } catch(e) {}
       if (!Array.isArray(parsedQuals) || parsedQuals.length === 0) parsedQuals = [{ id: Date.now(), qualification: "", institution: "", subject: "", certificateUrl: "", certificateBlob: null }];
       setQualifications(parsedQuals);
       
       const parseArray = (jsonVal: any, strVal: any) => {
         if (Array.isArray(jsonVal)) return jsonVal;
         if (typeof jsonVal === 'string') { try { const p = JSON.parse(jsonVal); if (Array.isArray(p)) return p; } catch(e) {} }
         if (typeof strVal === 'string') {
           try { const p = JSON.parse(strVal); if (Array.isArray(p)) return p; } catch(e) {}
           return strVal.split(',').map((s: string) => s.trim()).filter(Boolean);
         }
         return [];
       };
       
       let extra = {};
       if (typeof initialData.extraData === 'string') {
         try { extra = JSON.parse(initialData.extraData); } catch (e) {}
       } else if (initialData.extraData) {
         extra = initialData.extraData;
       }

       if (initialData.books && initialData.books.length > 0) {
          const firstBook = initialData.books[0];
          setForm(prev => ({
             ...prev,
             name: initialData.name || "",
             email: initialData.email || "",
             phone: initialData.phone || "",

             address: initialData.address || "",
             pincode: initialData.pincode || "",
             aadharNumber: initialData.aadharNumber || "",
             dob: initialData.dob || initialData.age || "",
             experience: initialData.experience || "",
             skills: parseArray(initialData.skillsJson, initialData.skills),
             hobbies: parseArray(initialData.hobbiesJson, initialData.hobbies),
             whyJoining: initialData.whyJoining || "",
             bio: initialData.bio || "",
             penName: initialData.penName || "",
             city: initialData.city || "",
             state: initialData.state || "",
             instagram: initialData.instagram || "",
             facebook: initialData.facebook || "",
             linkedin: (extra as any).linkedin || "",
             youtube: (extra as any).youtube || "",
             transactionId: initialData.transactionId || "",
             conflictOfInterestSignature: (extra as any).conflictOfInterestSignature || "",
             agreedToGuidelines: (extra as any).agreedToGuidelines || false,
             agreedToInfoDoc: (extra as any).agreedToInfoDoc || false,
             
             // book 1 prefill
             title: firstBook.title || "",
             subtitle: firstBook.subtitle || "",
             genre: firstBook.genre || "",
             subcategory: firstBook.subGenre ? firstBook.subGenre.split(' > ')[0] : "",
             subSubcategory: firstBook.subGenre && firstBook.subGenre.includes(' > ') ? firstBook.subGenre.split(' > ')[1] : "",
             synopsis: firstBook.synopsis || "",
             pages: firstBook.pages || "",
             mrp: firstBook.mrp || "",
             stock: firstBook.stock || "",
             language: firstBook.language || "",
             isbn: firstBook.isbn || "",
             publisher: firstBook.publisher || "",
             publicationDate: firstBook.publicationDate || "",
             edition: firstBook.edition || "",
             format: firstBook.format || "",
             printFormat: firstBook.printFormat || "",
             purposeOfWriting: firstBook.purpose || ""
          }));
          if (initialData.books.length > 1) {
             setBooks(initialData.books.slice(1).map((b: any) => ({
                ...b,
                subcategory: b.subGenre ? b.subGenre.split(' > ')[0] : "",
                subSubcategory: b.subGenre && b.subGenre.includes(' > ') ? b.subGenre.split(' > ')[1] : ""
             })));
          }
          if (firstBook.coverUrl) setCoverFileUrl(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}${firstBook.coverUrl}`);
       } else {
          setForm(prev => ({
             ...prev,
             name: initialData.name || "",
             email: initialData.email || "",
             phone: initialData.phone || "",

             address: initialData.address || "",
             pincode: initialData.pincode || "",
             aadharNumber: initialData.aadharNumber || "",
             dob: initialData.dob || initialData.age || "",
             experience: initialData.experience || "",
             skills: parseArray(initialData.skillsJson, initialData.skills),
             hobbies: parseArray(initialData.hobbiesJson, initialData.hobbies),
             whyJoining: initialData.whyJoining || "",
             bio: initialData.bio || "",
             penName: initialData.penName || "",
             city: initialData.city || "",
             state: initialData.state || "",
             instagram: initialData.instagram || "",
             facebook: initialData.facebook || "",
             linkedin: (extra as any).linkedin || "",
             youtube: (extra as any).youtube || "",
             transactionId: initialData.transactionId || "",
             conflictOfInterestSignature: (extra as any).conflictOfInterestSignature || "",
             agreedToGuidelines: (extra as any).agreedToGuidelines || false,
             agreedToInfoDoc: (extra as any).agreedToInfoDoc || false
          }));
       }
       if (initialData.extraData) {
          setExtraDataState(initialData.extraData);
       }
       if (initialData.photoUrl) setAuthorPhotoUrl(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}${initialData.photoUrl}`);
       if (initialData.paymentScreenshot) setPaymentScreenshotUrl(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}${initialData.paymentScreenshot}`);
       if (initialData.qrCodeUrl) setQrCodeUrl(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}${initialData.qrCodeUrl}`);
    }
  }, [isReapply, isAdminEdit, initialData]);


  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",

    address: "",
    pincode: "",
    aadharNumber: "",
    dob: "",
    experience: "",
    skills: [],
    hobbies: [],
    whyJoining: "",
    bio: "",
    penName: "",
    city: "",
    state: "",
    instagram: "",
    facebook: "",
    linkedin: "",
    youtube: "",
    title: "",
    subtitle: "",
    genre: "",
    subcategory: "",
    subSubcategory: "",
    synopsis: "",
    pages: "",
    mrp: "",
    stock: "",
    language: "",
    isbn: "",
    publisher: "",
    publicationDate: "",
    edition: "",
    format: "",
    transactionId: "",
    purposeOfWriting: "",
    isSelfPublished: "",
    conflictOfInterestSignature: "",
    agreedToGuidelines: false,
    agreedToInfoDoc: false,
    printFormat: "",
  });

  const [showAddBookForm, setShowAddBookForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAdminEdit && !isReapply && !hasLoadedDraft.current) {
      hasLoadedDraft.current = true;
      try {
        const draftStr = localStorage.getItem("authorRegistrationDraft");
        if (draftStr) {
          const draft = JSON.parse(draftStr);
          if (draft.step !== undefined) setStep(draft.step);
          if (draft.form) setForm(prev => ({ ...prev, ...draft.form }));
          if (draft.books) setBooks(draft.books);
          if (draft.qualifications) setQualifications(draft.qualifications);
          if (draft.extraDataState) setExtraDataState(draft.extraDataState);
          if (draft.skillInput) setSkillInput(draft.skillInput);
          if (draft.hobbyInput) setHobbyInput(draft.hobbyInput);
        }
      } catch (e) {
        console.error("Failed to load registration draft:", e);
      }
    }
  }, [isAdminEdit, isReapply]);

  useEffect(() => {
    if (!isAdminEdit && !isReapply && hasLoadedDraft.current) {
      const draft = {
        step,
        form,
        books: books.map(b => ({ ...b, coverBlob: null })), // Don't save blobs
        qualifications: qualifications.map(q => ({ ...q, certificateBlob: null })), // Don't save blobs
        extraDataState,
        skillInput,
        hobbyInput
      };
      localStorage.setItem("authorRegistrationDraft", JSON.stringify(draft));
    }
  }, [step, form, books, qualifications, extraDataState, skillInput, hobbyInput, isAdminEdit, isReapply]);

  const validateField = (key: string, value: string | boolean) => {
    let error = "";
    if (key === "name" && !value) error = "Name is required.";
    if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string)) error = "Invalid email address.";
    if (!isReapply && !isAdminEdit && key === "password" && (value as string).length < 6) error = "Password must be at least 6 characters.";
    if (key === "phone" && !/^\d{10}$/.test((value as string).replace(/\D/g, ''))) error = "Must be a 10-digit number.";
    if (key === "address" && !value) error = "Full Address is required.";
    if (key === "aadharNumber") {
      if (!value) error = "Aadhar Number is required.";
      else if (!/^\d{12}$/.test(value as string)) error = "Aadhar Number must be exactly 12 digits.";
    }
    if (key === "dob") {
      if (!value) error = "Date of Birth is required.";
      else if (form.experience) {
        const birthDate = new Date(value as string);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age--;
        if (Number(form.experience) > age) {
          setErrors(prev => ({ ...prev, experience: "Experience cannot be greater than your age." }));
        } else {
          setErrors(prev => ({ ...prev, experience: "" }));
        }
      }
    }
    if (key === "experience") {
      if (value === "" || isNaN(Number(value)) || Number(value) < 0 || Number(value) > 70) {
        error = "Experience must be a number between 0 and 70.";
      } else if (form.dob) {
        const birthDate = new Date(form.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age--;
        if (Number(value) > age) error = "Experience cannot be greater than your age.";
      }
    }
    if (key === "skills" && (!value || value.length === 0)) error = "Skills are required.";
    if (key === "hobbies" && (!value || value.length === 0)) error = "Hobbies are required.";
    if (key === "bio") {
      if (!value) error = "Bio is required.";
      else {
        const wordCount = String(value).split(/\s+/).filter(Boolean).length;
        if (wordCount < 100) error = "Bio must be at least 100 words.";
        if (wordCount > 150) error = "Bio cannot exceed 150 words.";
      }
    }
    
    if (key === "city" && !value) error = "City is required.";
    if (key === "state" && !value) error = "State is required.";
    
    // Social Media
    if (key === "facebook" && value && !/^https?:\/\//.test(String(value))) error = "Must be a valid URL starting with http:// or https://";
    if (key === "instagram" && value && !/^https?:\/\//.test(String(value)) && !String(value).startsWith('@')) error = "Must be a valid URL or @username";
    if (key === "linkedin" && value && !/^https?:\/\//.test(String(value))) error = "Must be a valid URL starting with http:// or https://";
    if (key === "youtube" && value && !/^https?:\/\//.test(String(value))) error = "Must be a valid URL starting with http:// or https://";


    // For book details
    if (key === "title" && !value) error = "Title is required.";
    if (key === "genre" && !value) error = "Category is required.";
    if (key === "synopsis") {
      if (!value) error = "Synopsis is required.";
      else if (String(value).split(/\s+/).filter(Boolean).length > 100) error = "Synopsis cannot exceed 100 words.";
    }
    if (key === "mrp" && (!value || Number(value) <= 0)) error = "Valid MRP is required.";
    if (key === "pages" && (!value || Number(value) <= 0)) error = "Number of Pages is required.";
    if (key === "language" && !value) error = "Language is required.";
    if (key === "isbn") {
      const digits = String(value).replace(/\D/g, '');
      if (!digits) error = "ISBN is required.";
      else if (digits.length !== 10 && digits.length !== 13) error = "ISBN must be exactly 10 or 13 digits.";
    }
    if (key === "publisher" && !value) error = "Publisher is required.";
    if (key === "publicationDate" && !value) error = "Publication Date is required.";
    if (key === "format" && !value) error = "Book Format is required.";
    if (key === "printFormat" && !value) error = "Print Format is required.";
    if (key === "purposeOfWriting" && !value) error = "Purpose of Writing is required.";

    // Questionnaire
    if (key === "conflictOfInterestSignature" && !value) error = "Signature is required.";
    if (key === "whyJoining" && !value) error = "This field is required.";

    // Payment
    if (key === "transactionId" && !value) error = "Transaction ID is required.";

    setErrors((prev) => ({ ...prev, [key]: error }));
  };

  const update = (key: string, val: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    validateField(key, val);
  };
  const handleEditAddedBook = (idx: number) => {
    const bookToEdit = books[idx];
    setForm({
      ...form,
      title: bookToEdit.title || "",
      subtitle: bookToEdit.subtitle || "",
      genre: bookToEdit.genre || "",
      subcategory: bookToEdit.subcategory || "",
      subSubcategory: bookToEdit.subSubcategory || "",
      synopsis: bookToEdit.synopsis || "",
      pages: bookToEdit.pages || "",
      mrp: bookToEdit.mrp || "",
      stock: bookToEdit.stock || "0",
      language: bookToEdit.language || "",
      isbn: bookToEdit.isbn || "",
      publisher: bookToEdit.publisher || "",
      publicationDate: bookToEdit.publicationDate || "",
      edition: bookToEdit.edition || "",
      format: bookToEdit.format || "",
      printFormat: bookToEdit.printFormat || "",
      purposeOfWriting: bookToEdit.purposeOfWriting || ""
    });
    setCoverBlob(bookToEdit.coverBlob || null);
    setCoverFileUrl(bookToEdit.coverFileUrl || (bookToEdit.coverUrl ? `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${bookToEdit.coverUrl}` : null));
    setBooks(books.filter((_, i) => i !== idx));
  };

  return (
    <main className="font-sans min-h-screen bg-[#F8FAFC] text-paa-navy">
      {/* Scrollable Header Banner */}
      {isAdminEdit ? (
        <section className="bg-paa-navy py-6 md:py-8 px-6 text-center text-white relative">
          <button onClick={onAdminCancel} className="absolute left-6 top-1/2 -translate-y-1/2 text-paa-gold hover:text-white flex items-center gap-2 text-sm font-bold tracking-widest uppercase transition-colors">
            <ArrowLeft size={16} /> <span className="hidden md:inline">Back to Dashboard</span>
          </button>
          <div className="font-sans text-[10px] text-paa-gold tracking-widest uppercase font-bold mb-1 md:mb-2">Admin Review Mode</div>
          <h1 className="font-serif text-2xl md:text-3xl font-medium tracking-tight">Review Application: {initialData?.name}</h1>
        </section>
      ) : isReapply ? (
        <section className="bg-paa-navy py-6 px-6 text-center text-white">
          <div className="font-sans text-[10px] text-paa-gold tracking-widest uppercase font-bold mb-1">Edit &amp; Reapply</div>
          <h1 className="font-serif text-xl md:text-2xl font-medium tracking-tight">Update Your Application</h1>
        </section>
      ) : (
        <section className="bg-paa-navy py-8 px-6 text-center text-white">
          <div className="font-sans text-[10px] text-paa-gold tracking-widest uppercase font-bold mb-2 md:mb-3">New Author Onboarding</div>
          <h1 className="font-serif text-2xl md:text-3xl font-medium tracking-tight mb-2 md:mb-3">Join Pune Authors&apos; Association</h1>
          <p className="text-xs md:text-sm text-white/60 max-w-lg mx-auto">A one-time application reviewed by our editorial team within 5-7 working days.</p>
        </section>
      )}

      {/* Sticky Stepper Only */}
      <div className={`sticky z-40 w-full shadow-md ${isAdminEdit ? 'top-0' : isReapply ? 'top-[64px]' : 'top-0'}`}>
        <div className="bg-white border-b border-paa-navy/5 px-2 md:px-6 py-3 md:py-4 overflow-x-auto hide-scrollbar">
          <div className="max-w-3xl mx-auto flex items-center justify-between md:justify-center min-w-max md:min-w-0 pb-1 md:pb-0">
            {steps.map((s, i) => (
              <div key={s.title} className="flex items-center">
                <div
                  className={`flex flex-col items-center px-1 md:px-3 ${i <= step || isAdminEdit ? "cursor-pointer" : "cursor-default"}`}
                  onClick={() => { if (i <= step || isAdminEdit) setStep(i); }}
                >
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mb-1.5 md:mb-2 transition-all duration-300 shadow-sm
                    ${i < step ? "bg-emerald-500 text-white shadow-emerald-500/20" : i === step ? "bg-paa-gold text-paa-navy shadow-paa-gold/20" : "bg-gray-100 text-gray-400"}`}>
                    {i < step ? <CheckCircle size={14} className="md:w-[18px] md:h-[18px]" /> : <span className="scale-75 md:scale-100">{s.icon}</span>}
                  </div>
                  <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-center whitespace-nowrap transition-colors ${i === step ? "text-paa-navy" : "text-gray-400"}`}>
                    {s.title}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-6 md:w-12 h-0.5 transition-colors ${i < step ? "bg-emerald-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full px-6 md:px-12 lg:px-20 my-12 pb-20">
        <div className="max-w-5xl mx-auto">
        {!submitted ? (
          <div className="bg-white rounded-3xl-2xl border border-paa-navy/5 p-8 md:p-12 shadow-premium hover:shadow-premium-hover transition-all duration-500 ease-out">
            {/* Step 0: Author Profile */}
            {step === 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="font-serif text-2xl font-medium text-paa-navy mb-2">Author Profile</h2>
                <p className="text-sm text-paa-gray-text mb-8">Tell us about yourself.<br/><span className='text-xs mt-1 block opacity-80'>Only public information (Bio, Profile Picture, Qualifications, Skills, Books) will be visible publicly. Sensitive information like Aadhaar Number, Phone Number, Address, Certificates, etc. will remain private.</span></p>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="dash-label">Full Name *</label>
                      <input type="text" value={form.name} onChange={(e) => update("name", e.target.value.replace(/[^a-zA-Z\s]/g, ''))} className={`dash-input w-full ${errors.name ? '!border-red-500' : ''}`} placeholder="e.g. Jane Doe" />
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

                  {/* Phone + Password (if applicable) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="dash-label">Phone Number *</label>
                      <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value.replace(/\D/g, ''))} className={`dash-input w-full ${errors.phone ? '!border-red-500' : ''}`} placeholder="10-digit mobile number" />
                      {errors.phone && <div className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</div>}
                    </div>
                    {!isReapply && !isAdminEdit ? (
                      <div>
                        <label className="dash-label">Password (For Login) *</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={(e) => update("password", e.target.value)}
                            className={`dash-input w-full pr-10 ${errors.password ? '!border-red-500' : ''}`}
                            placeholder="Min 6 characters"
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-0 bottom-0 flex items-center justify-center text-gray-400 hover:text-paa-navy transition-colors">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {errors.password && <div className="text-red-500 text-xs mt-1 font-medium">{errors.password}</div>}
                      </div>
                    ) : (
                      <div>
                        <label className="dash-label">Aadhar Number *</label>
                        <input type="text" value={form.aadharNumber} onChange={(e) => update("aadharNumber", e.target.value.replace(/\D/g, ''))} className={`dash-input w-full ${errors.aadharNumber ? '!border-red-500' : ''}`} placeholder="12-digit Aadhar number" />
                        {errors.aadharNumber && <div className="text-red-500 text-xs mt-1 font-medium">{errors.aadharNumber}</div>}
                      </div>
                    )}
                  </div>

                  {/* Address + Aadhaar (if password was shown) */}
                  <div className={`grid grid-cols-1 ${!isReapply && !isAdminEdit ? "md:grid-cols-2" : ""} gap-6`}>
                    <div>
                      <label className="dash-label">Full Address *</label>
                      <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} className={`dash-input w-full ${errors.address ? '!border-red-500' : ''}`} placeholder="House No./Flat No., Building, Street, Area" />
                      {errors.address && <div className="text-red-500 text-xs mt-1 font-medium">{errors.address}</div>}
                    </div>
                    {!isReapply && !isAdminEdit && (
                      <div>
                        <label className="dash-label">Aadhar Number *</label>
                        <input type="text" value={form.aadharNumber} onChange={(e) => update("aadharNumber", e.target.value.replace(/\D/g, ''))} className={`dash-input w-full ${errors.aadharNumber ? '!border-red-500' : ''}`} placeholder="12-digit Aadhar number" />
                        {errors.aadharNumber && <div className="text-red-500 text-xs mt-1 font-medium">{errors.aadharNumber}</div>}
                      </div>
                    )}
                  </div>

                  {/* Pincode + City + State in one row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="dash-label">Pincode *</label>
                      <input type="text" value={form.pincode} onChange={(e) => update("pincode", e.target.value.replace(/\D/g, ''))} maxLength={6} className={`dash-input w-full ${errors.pincode ? '!border-red-500' : ''}`} placeholder="6-digit Pincode" />
                      {errors.pincode && <div className="text-red-500 text-xs mt-1 font-medium">{errors.pincode}</div>}
                    </div>
                    <div>
                      <label className="dash-label">City *</label>
                      <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} className={`dash-input w-full ${errors.city ? '!border-red-500' : ''}`} placeholder="e.g. Pune" />
                      {errors.city && <div className="text-red-500 text-xs mt-1 font-medium">{errors.city}</div>}
                    </div>
                    <div>
                      <label className="dash-label">State *</label>
                      <select value={form.state} onChange={(e) => update("state", e.target.value)} className={`dash-input w-full ${errors.state ? '!border-red-500' : ''}`}>
                        <option value="">Select State</option>
                        {indianStates.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                      {errors.state && <div className="text-red-500 text-xs mt-1 font-medium">{errors.state}</div>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="dash-label">Instagram</label>
                      <div className={`flex items-center border rounded-xl overflow-hidden bg-white transition-all focus-within:ring-2 focus-within:ring-pink-500/20 focus-within:border-pink-500 ${errors.instagram ? '!border-red-500' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-center w-11 h-11 shrink-0" style={{background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'}}>
                          <Instagram size={18} className="text-white" />
                        </div>
                        <input type="text" value={form.instagram} onChange={(e) => update("instagram", e.target.value)} className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent" placeholder="https://instagram.com/yourprofile" />
                      </div>
                      {errors.instagram && <div className="text-red-500 text-xs mt-1 font-medium">{errors.instagram}</div>}
                    </div>
                    <div>
                      <label className="dash-label">Facebook</label>
                      <div className={`flex items-center border rounded-xl overflow-hidden bg-white transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 ${errors.facebook ? '!border-red-500' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-center w-11 h-11 shrink-0 bg-[#1877F2]">
                          <Facebook size={18} className="text-white" />
                        </div>
                        <input type="text" value={form.facebook} onChange={(e) => update("facebook", e.target.value)} className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent" placeholder="https://facebook.com/yourprofile" />
                      </div>
                      {errors.facebook && <div className="text-red-500 text-xs mt-1 font-medium">{errors.facebook}</div>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="dash-label">LinkedIn</label>
                      <div className={`flex items-center border rounded-xl overflow-hidden bg-white transition-all focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500 ${errors.linkedin ? '!border-red-500' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-center w-11 h-11 shrink-0 bg-[#0A66C2]">
                          <Linkedin size={18} className="text-white" />
                        </div>
                        <input type="text" value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent" placeholder="https://linkedin.com/in/yourprofile" />
                      </div>
                      {errors.linkedin && <div className="text-red-500 text-xs mt-1 font-medium">{errors.linkedin}</div>}
                    </div>
                    <div>
                      <label className="dash-label">YouTube</label>
                      <div className={`flex items-center border rounded-xl overflow-hidden bg-white transition-all focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500 ${errors.youtube ? '!border-red-500' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-center w-11 h-11 shrink-0 bg-[#FF0000]">
                          <Youtube size={18} className="text-white" />
                        </div>
                        <input type="text" value={form.youtube} onChange={(e) => update("youtube", e.target.value)} className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent" placeholder="https://youtube.com/@yourchannel" />
                      </div>
                      {errors.youtube && <div className="text-red-500 text-xs mt-1 font-medium">{errors.youtube}</div>}
                    </div>
                  </div>

                  <h3 className="font-serif text-xl mt-8 pt-8 border-t border-gray-100">Qualifications</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="dash-label mb-0 text-sm opacity-0">Qualifications</label>
                      <button type="button" onClick={() => setQualifications([...qualifications, { id: Date.now(), qualification: "", institution: "", subject: "", mode: "", certificateUrl: "", certificateBlob: null }])} className="text-xs font-bold uppercase tracking-widest text-paa-navy hover:text-paa-gold flex items-center gap-1"><Plus size={14}/> Add Another</button>
                    </div>
                    {qualifications.map((q, idx) => (
                      <div key={q.id} className="p-5 border border-paa-navy/10 rounded-2xl bg-white shadow-sm space-y-4 relative">
                        {qualifications.length > 1 && (
                          <button type="button" onClick={() => setQualifications(qualifications.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-red-500 hover:text-red-700 flex items-center gap-1">
                            <span className="text-[10px] font-bold">REMOVE</span>
                          </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="dash-label">Qualification *</label>
                            <input type="text" value={q.qualification} onChange={(e) => { const n = [...qualifications]; n[idx].qualification = e.target.value; setQualifications(n); }} className={`dash-input w-full ${!q.qualification ? '!border-red-500' : ''}`} placeholder="e.g. BE, MA" />
                          </div>
                          <div>
                            <label className="dash-label">Institution *</label>
                            <input type="text" value={q.institution} onChange={(e) => { const n = [...qualifications]; n[idx].institution = e.target.value; setQualifications(n); }} className={`dash-input w-full ${!q.institution ? '!border-red-500' : ''}`} placeholder="e.g. Pune University" />
                          </div>
                          <div>
                            <label className="dash-label">Subject *</label>
                            <input type="text" value={q.subject} onChange={(e) => { const n = [...qualifications]; n[idx].subject = e.target.value; setQualifications(n); }} className={`dash-input w-full ${!q.subject ? '!border-red-500' : ''}`} placeholder="e.g. Computer Science" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="dash-label">Mode of Degree *</label>
                            <select value={q.mode || ''} onChange={(e) => { const n = [...qualifications]; n[idx].mode = e.target.value; setQualifications(n); }} className="dash-input w-full">
                              <option value="">Select Mode</option>
                              <option value="Full Time">Full Time</option>
                              <option value="Part Time">Part Time</option>
                              <option value="Online">Online</option>
                              <option value="Distance">Distance</option>
                              <option value="Correspondence">Correspondence</option>
                            </select>
                          </div>
                          <div>
                            <label className="dash-label">Upload Certificate (Optional)</label>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => document.getElementById(`cert-upload-${idx}`)?.click()}
                                className="border border-dashed border-paa-navy/20 rounded-xl px-4 py-2.5 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer flex items-center gap-2 shrink-0"
                              >
                                <Upload className="w-4 h-4 text-paa-navy/40" />
                                <span className="text-xs font-medium text-paa-navy">{q.certificateUrl ? 'Change' : 'Upload'}</span>
                              </button>
                              {q.certificateUrl && (
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {(() => {
                                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                                    const isServerUrl = q.certificateUrl.startsWith('/uploads');
                                    const fullUrl = isServerUrl ? `${API_URL}${q.certificateUrl}` : q.certificateUrl;
                                    const isImage = q.certificateBlob ? q.certificateBlob.type?.startsWith('image/') : /\.(jpg|jpeg|png|gif|webp)$/i.test(q.certificateUrl);
                                    const isPdf = !isImage;
                                    return (
                                      <>
                                        {isServerUrl ? (
                                          <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 group">
                                            {isImage ? (
                                              <img src={fullUrl} alt="Certificate" className="w-14 h-14 object-cover rounded-lg border-2 border-paa-navy/20 shadow-sm group-hover:border-paa-gold transition-colors" />
                                            ) : (
                                              <div className="w-14 h-14 bg-red-50 rounded-lg border-2 border-red-100 group-hover:border-paa-gold flex flex-col items-center justify-center shrink-0 transition-colors gap-0.5">
                                                <FileText className="w-5 h-5 text-red-500" />
                                                <span className="text-[8px] font-bold text-red-500 uppercase">PDF</span>
                                              </div>
                                            )}
                                          </a>
                                        ) : isImage ? (
                                          <img src={q.certificateUrl} alt="Certificate" className="w-12 h-12 object-cover rounded-lg border border-gray-200 shadow-sm" />
                                        ) : (
                                          <div className="w-12 h-12 bg-red-50 rounded-lg border border-red-100 flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5 text-red-500" />
                                          </div>
                                        )}
                                        <div className="min-w-0">
                                          <p className="text-xs font-semibold text-paa-navy truncate">{q.certificateBlob?.name || 'Certificate'}</p>
                                          {isServerUrl ? (
                                            <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 font-bold uppercase tracking-widest hover:underline">
                                              View {isPdf ? 'PDF' : 'Image'} ↗
                                            </a>
                                          ) : (
                                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Uploaded ✓</p>
                                          )}
                                        </div>
                                      </>
                                    );
                                  })()}
                                  <button type="button" onClick={() => { const n = [...qualifications]; n[idx].certificateUrl = ''; n[idx].certificateBlob = null; setQualifications(n); }} className="ml-auto text-gray-400 hover:text-red-500 transition-colors shrink-0">
                                    <X size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                            <input
                              id={`cert-upload-${idx}`}
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const n = [...qualifications];
                                  n[idx].certificateBlob = file;
                                  n[idx].certificateUrl = URL.createObjectURL(file);
                                  setQualifications(n);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="dash-label">Date of Birth *</label>
                      <input type="date" value={form.dob} max={new Date().toISOString().split('T')[0]} onChange={(e) => update("dob", e.target.value)} className={`dash-input w-full ${errors.dob ? '!border-red-500' : ''}`} />
                      {errors.dob && <div className="text-red-500 text-xs mt-1 font-medium">{errors.dob}</div>}
                    </div>
                    <div>
                      <label className="dash-label">Years of Experience *</label>
                      <input type="text" inputMode="numeric" value={form.experience} onChange={(e) => update("experience", e.target.value.replace(/\D/g, ''))} className={`dash-input w-full ${errors.experience ? '!border-red-500' : ''}`} placeholder="e.g. 5" />
                      {errors.experience && <div className="text-red-500 text-xs mt-1 font-medium">{errors.experience}</div>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="dash-label">Skills * <span className="font-normal opacity-70">(Press Enter to add)</span></label>
                      <div className={`p-2 border rounded-xl bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all ${errors.skills ? 'border-red-500' : 'border-gray-200'} flex flex-wrap gap-2`}>
                        {form.skills && form.skills.map((s: string, i: number) => (
                          <div key={i} className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-medium">
                            {s} <button type="button" onClick={() => update("skills", form.skills.filter((_: any, idx: number) => idx !== i))} className="hover:text-emerald-900"><X size={12}/></button>
                          </div>
                        ))}
                        <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const val = skillInput.trim().toLowerCase(); if (val && !(form.skills || []).map((s: string) => s.toLowerCase()).includes(val)) { update("skills", [...(form.skills || []), val]); } setSkillInput(""); } }} className="flex-1 min-w-[120px] outline-none text-sm bg-transparent" placeholder="Type and press Enter" />
                      </div>
                      {errors.skills && <div className="text-red-500 text-xs mt-1 font-medium">{errors.skills}</div>}
                    </div>
                    <div>
                      <label className="dash-label">Hobbies * <span className="font-normal opacity-70">(Press Enter to add)</span></label>
                      <div className={`p-2 border rounded-xl bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all ${errors.hobbies ? 'border-red-500' : 'border-gray-200'} flex flex-wrap gap-2`}>
                        {form.hobbies && form.hobbies.map((h: string, i: number) => (
                          <div key={i} className="flex items-center gap-1 bg-paa-navy/5 text-paa-navy px-2.5 py-1 rounded-full text-xs font-medium">
                            {h} <button type="button" onClick={() => update("hobbies", form.hobbies.filter((_: any, idx: number) => idx !== i))} className="hover:text-paa-navy/70"><X size={12}/></button>
                          </div>
                        ))}
                        <input type="text" value={hobbyInput} onChange={(e) => setHobbyInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const val = hobbyInput.trim().toLowerCase(); if (val && !(form.hobbies || []).map((h: string) => h.toLowerCase()).includes(val)) { update("hobbies", [...(form.hobbies || []), val]); } setHobbyInput(""); } }} className="flex-1 min-w-[120px] outline-none text-sm bg-transparent" placeholder="Type and press Enter" />
                      </div>
                      {errors.hobbies && <div className="text-red-500 text-xs mt-1 font-medium">{errors.hobbies}</div>}
                    </div>
                  </div>

                  <div>
                    <label className="dash-label">Author Bio (100-150 words) *</label>
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
                        {form.bio.split(/\s+/).filter(Boolean).length} / 150 words (min 100)
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
                              <input type="number" required className="dash-input w-full" value={extraDataState[f.name] || ''} onChange={e => setExtraDataState({ ...extraDataState, [f.name]: e.target.value })} />
                            ) : f.type === 'date' ? (
                              <input type="date" required className="dash-input w-full" value={extraDataState[f.name] || ''} onChange={e => setExtraDataState({ ...extraDataState, [f.name]: e.target.value })} />
                            ) : (
                              <input type="text" required className="dash-input w-full" value={extraDataState[f.name] || ''} onChange={e => setExtraDataState({ ...extraDataState, [f.name]: e.target.value })} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
                    {/* Author photo upload */}
                    <div>
                      <label className="dash-label">Author Photo *</label>
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
                      <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-paa-navy/10 flex items-center gap-3 shadow-sm">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-paa-navy text-sm mb-0.5 truncate">{b.title}</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text">{b.genre} {b.subcategory && `> ${b.subcategory}`}</div>
                        </div>
                        {(b.coverFileUrl || b.coverUrl) && <img src={b.coverFileUrl || `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${b.coverUrl}`} alt="cover" className="h-12 w-9 object-cover rounded shadow-sm border border-paa-navy/10 flex-shrink-0" />}
                        <button type="button" onClick={() => handleEditAddedBook(idx)} className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-500 hover:text-blue-700 flex items-center justify-center transition-colors" title="Edit book">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => setBooks(books.filter((_, i2) => i2 !== idx))} className="flex-shrink-0 w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition-colors" title="Remove book">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className={`space-y-6 ${books.length > 0 ? 'p-8 bg-gray-50/50 rounded-3xl-2xl border border-paa-navy/5' : ''}`}>
                  {books.length > 0 && !showAddBookForm ? (
                    <button
                      type="button"
                      onClick={() => setShowAddBookForm(true)}
                      className="px-6 py-2.5 bg-paa-navy text-white hover:bg-paa-navy/90 transition-colors rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-2"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Another Book
                    </button>
                  ) : (
                    <>
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
<option value="Other">Other</option>
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

                  <div>
                    <label className="dash-label">Write the purpose of writing the book *</label>
                    <textarea value={form.purposeOfWriting} onChange={(e) => update("purposeOfWriting", e.target.value)} rows={3} className={`dash-input w-full resize-y ${errors.purposeOfWriting ? '!border-red-500' : ''}`} placeholder="What inspired you to write?" />
                    {errors.purposeOfWriting && <div className="text-red-500 text-xs mt-1 font-medium">{errors.purposeOfWriting}</div>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="dash-label">Language *</label>
                      <select value={form.language} onChange={(e) => update("language", e.target.value)} className={`dash-input w-full ${errors.language ? '!border-red-500' : ''}`}>
                        <option value="">Select Language</option>
                        {languages.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      {errors.language && <div className="text-red-500 text-xs mt-1 font-medium">{errors.language}</div>}
                    </div>
                    <div>
                      <label className="dash-label flex items-center justify-between">
                        Publisher Name *
                        <label className="flex items-center gap-1.5 text-xs font-normal cursor-pointer lowercase text-gray-500"><input type="checkbox" checked={form.isSelfPublished === 'yes'} onChange={(e) => { update('isSelfPublished', e.target.checked ? 'yes' : 'no'); if(e.target.checked) update('publisher', 'Self Published'); else update('publisher', ''); }} className="w-3 h-3"/> I am Self Published</label>
                      </label>
                      <input type="text" placeholder="e.g. Penguin" value={form.publisher} onChange={(e) => update("publisher", e.target.value)} className={`dash-input w-full ${errors.publisher ? '!border-red-500' : ''}`} disabled={form.isSelfPublished === 'yes'} />
                      {errors.publisher && <div className="text-red-500 text-xs mt-1 font-medium">{errors.publisher}</div>}
                    </div>
                    <div>
                      <label className="dash-label">Publication Date *</label>
                      <input type="date" value={form.publicationDate} onChange={(e) => update("publicationDate", e.target.value)} className={`dash-input w-full ${errors.publicationDate ? '!border-red-500' : ''}`} />
                      {errors.publicationDate && <div className="text-red-500 text-xs mt-1 font-medium">{errors.publicationDate}</div>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="dash-label">ISBN Number *</label>
                      <input type="text" inputMode="numeric" placeholder="10 or 13 digit ISBN" value={form.isbn} onChange={(e) => update("isbn", e.target.value.replace(/\D/g, ''))} maxLength={13} className={`dash-input w-full ${errors.isbn ? '!border-red-500' : ''}`} />
                      {errors.isbn && <div className="text-red-500 text-xs mt-1 font-medium">{errors.isbn}</div>}
                    </div>
                    <div>
                      <label className="dash-label">Edition</label>
                      <input type="text" inputMode="numeric" placeholder="e.g. 1" value={form.edition} onChange={(e) => update("edition", e.target.value.replace(/\D/g, ''))} className="dash-input w-full" />
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
                    <div>
                      <label className="dash-label">Print Format *</label>
                      <select value={form.printFormat} onChange={(e) => update("printFormat", e.target.value)} className={`dash-input w-full ${errors.printFormat ? '!border-red-500' : ''}`}>
                        <option value="">Select Print Format</option>
                        <option value="Black & White">Black & White</option>
                        <option value="Colored">Colored</option>
                      </select>
                      {errors.printFormat && <div className="text-red-500 text-xs mt-1 font-medium">{errors.printFormat}</div>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="dash-label">Number of Pages *</label>
                      <input type="text" inputMode="numeric" placeholder="256" value={form.pages} onChange={(e) => update("pages", e.target.value.replace(/\D/g, ''))} className={`dash-input w-full ${errors.pages ? '!border-red-500' : ''}`} />
                      {errors.pages && <div className="text-red-500 text-xs mt-1 font-medium">{errors.pages}</div>}
                    </div>
                    <div>
                      <label className="dash-label">MRP (₹) *</label>
                      <input type="number" placeholder="299" value={form.mrp} onChange={(e) => update("mrp", e.target.value)} className={`dash-input w-full ${errors.mrp ? '!border-red-500' : ''}`} />
                      {errors.mrp && <div className="text-red-500 text-xs mt-1 font-medium">{errors.mrp}</div>}
                    </div>
                    <div>
                      <label className="dash-label">Initial Stock *</label>
                      <input type="number" placeholder="0" value={form.stock} onChange={(e) => update("stock", e.target.value)} className="dash-input w-full" />
                    </div>
                  </div>

                  {(() => {
                     const pages = Number(form.pages);
                     const mrp = Number(form.mrp);
                     if (pages > 0 && form.printFormat && mrp > 0) {
                        const rate = form.printFormat === 'Colored' ? 2.40 : 0.50;
                        const maxPrice = (pages * rate) + 250;
                        if (mrp > maxPrice) {
                           return <div className="text-yellow-700 text-xs font-bold bg-yellow-50 p-3 rounded-lg border border-yellow-200 mt-2 mb-4">Warning: Your MRP (₹{mrp}) exceeds the recommended max price of ₹{maxPrice} based on your pages and format.</div>;
                        }
                     }
                     return null;
                  })()}

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

                  <div className="flex justify-end mt-4 gap-3">
                    {books.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm({ ...form, title: "", subtitle: "", genre: "", subcategory: "", subSubcategory: "", synopsis: "", pages: "", mrp: "", stock: "0", language: "", isbn: "", publisher: "", publicationDate: "", edition: "", format: "", printFormat: "", purposeOfWriting: "" });
                          setCoverBlob(null);
                          setCoverFileUrl(null);
                          setStep(2);
                        }}
                        className="px-4 py-2 bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                      >
                        <X className="w-3 h-3" /> Cancel & Continue
                      </button>
                    )}
                    {books.length > 0 && showAddBookForm && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm({ ...form, title: "", subtitle: "", genre: "", subcategory: "", subSubcategory: "", synopsis: "", pages: "", mrp: "", stock: "0", language: "", isbn: "", publisher: "", publicationDate: "", edition: "", format: "", printFormat: "", purposeOfWriting: "" });
                          setCoverBlob(null);
                          setCoverFileUrl(null);
                          setShowAddBookForm(false);
                        }}
                        className="px-4 py-2 bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const missingBookFields = [];
                        if (!form.title) missingBookFields.push('Title');
                        if (!form.genre) missingBookFields.push('Category');
                        if (!form.synopsis) missingBookFields.push('Synopsis');
                        if (!form.mrp) missingBookFields.push('MRP');
                        if (!form.language) missingBookFields.push('Language');
                        if (!form.publisher) missingBookFields.push('Publisher');
                        if (!form.publicationDate) missingBookFields.push('Publication Date');
                        if (!form.format) missingBookFields.push('Format');
                        if (!form.purposeOfWriting) missingBookFields.push('Purpose of Writing');
                        if (!form.printFormat) missingBookFields.push('Print Format');
                        if (!form.pages) missingBookFields.push('Pages');
                        if (!form.isbn) missingBookFields.push('ISBN');
                        if (!coverBlob && !coverFileUrl) missingBookFields.push('Cover Image');
                        if (missingBookFields.length > 0) {
                          alert(`Please fill these missing fields: ${missingBookFields.join(', ')}`);
                          return;
                        }
                        if (form.synopsis.split(/\s+/).filter(Boolean).length > 100) {
                          alert("Synopsis cannot exceed 100 words.");
                          return;
                        }
                        setBooks([...books, { ...form, coverBlob, coverFileUrl }]);
                        setForm({ ...form, title: "", subtitle: "", genre: "", subcategory: "", subSubcategory: "", synopsis: "", pages: "", mrp: "", stock: "0", language: "", isbn: "", publisher: "", publicationDate: "", edition: "", format: "", printFormat: "", purposeOfWriting: "" });
                        setCoverBlob(null);
                        setCoverFileUrl(null);
                        setShowAddBookForm(false);
                      }}
                      className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-colors rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                    >
                      <Plus className="w-3 h-3" /> Save & Add Another Book
                    </button>
                  </div>
                </>
              )}
                </div>
              </div>
            )}

            {/* Step 2: Questionnaire & Declarations */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="font-serif text-2xl font-medium text-paa-navy mb-2">Declarations & Guidelines</h2>
                <p className="text-sm text-paa-gray-text mb-8">Please agree to the PAA guidelines and sign the conflict of interest declaration.</p>

                <div className="space-y-8">
                  <div>
                    <label className="dash-label">If you are published by a publisher, why are you joining this group and what priority will you give to this group? *</label>
                    <textarea value={form.whyJoining} onChange={(e) => update("whyJoining", e.target.value)} rows={3} className={`dash-input w-full resize-y ${errors.whyJoining ? '!border-red-500' : ''}`} placeholder="Please explain your reasons..." />
                    {errors.whyJoining && <div className="text-red-500 text-xs mt-1 font-medium">{errors.whyJoining}</div>}
                  </div>

                  <div className="p-5 bg-gray-50 border border-paa-navy/10 rounded-2xl space-y-4">
                    <h3 className="font-serif font-medium text-paa-navy">Declarations</h3>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="mt-0.5">
                        <input type="checkbox" checked={form.agreedToGuidelines} onChange={(e) => update("agreedToGuidelines", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                      </div>
                      <div className="text-sm text-paa-navy font-medium">
                        I have read and agree to the <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowGuidelines(true); }} className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2">Group Guidelines</button> *
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="mt-0.5">
                        <input type="checkbox" checked={form.agreedToInfoDoc} onChange={(e) => update("agreedToInfoDoc", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                      </div>
                      <div className="text-sm text-paa-navy font-medium">
                        I have read the <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowInfoDoc(true); }} className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2">Group Information Document</button> *
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="dash-label">Sign for not having any conflict of interest *</label>
                    <input type="text" value={form.conflictOfInterestSignature} onChange={(e) => update("conflictOfInterestSignature", e.target.value)} className={`dash-input w-full font-serif italic text-lg ${errors.conflictOfInterestSignature ? '!border-red-500' : ''}`} placeholder="Type your full legal name as digital signature" />
                    {errors.conflictOfInterestSignature && <div className="text-red-500 text-xs mt-1 font-medium">{errors.conflictOfInterestSignature}</div>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
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
                <div className="flex gap-3 flex-1 w-full justify-end">
                  <button
                    onClick={() => {
                    if (step === 1 && !isAdminEdit) {
                      const hasPartialBook = form.title || form.genre || form.synopsis || form.mrp || form.pages || form.isbn;
                      if (hasPartialBook) {
                        const missingContinueFields = [];
                        if (!form.title) missingContinueFields.push('Title');
                        if (!form.genre) missingContinueFields.push('Category');
                        if (!form.synopsis) missingContinueFields.push('Synopsis');
                        if (!form.mrp || parseFloat(form.mrp) <= 0) missingContinueFields.push('MRP (> 0)');
                        if (!form.stock || parseInt(form.stock) < 0) missingContinueFields.push('Initial Stock (>= 0)');
                        if (!form.language) missingContinueFields.push('Language');
                        if (!form.publisher) missingContinueFields.push('Publisher');
                        if (!form.publicationDate) missingContinueFields.push('Publication Date');
                        if (!form.format) missingContinueFields.push('Format');
                        if (!form.purposeOfWriting) missingContinueFields.push('Purpose of Writing');
                        if (!form.printFormat) missingContinueFields.push('Print Format');
                        if (!form.pages) missingContinueFields.push('Pages');
                        if (!form.isbn) missingContinueFields.push('ISBN');
                        if (!coverBlob && !coverFileUrl) missingContinueFields.push('Cover Image');
                        if (missingContinueFields.length > 0) {
                          alert(`Please fill these missing fields: ${missingContinueFields.join(', ')}`);
                          return;
                        }
                        if (form.synopsis.split(/\s+/).filter(Boolean).length > 100) {
                          alert("Synopsis cannot exceed 100 words.");
                          return;
                        }
                        setBooks([...books, { ...form, coverBlob, coverFileUrl }]);
                        setForm({ ...form, title: "", subtitle: "", genre: "", subcategory: "", subSubcategory: "", synopsis: "", pages: "", mrp: "", stock: "", language: "", isbn: "", publisher: "", publicationDate: "", edition: "", format: "", purposeOfWriting: "" });
                        setCoverBlob(null);
                        setCoverFileUrl(null);
                      } else if (books.length === 0) {
                        alert("Please fill all compulsory fields for at least one book.");
                        return;
                      }
                    }
                    if (step === 2 && !isAdminEdit) {
                      if (!form.whyJoining || !form.whyJoining.trim()) {
                        alert("Please explain why you are joining this group.");
                        return;
                      }
                      if (!form.conflictOfInterestSignature || !form.agreedToGuidelines || !form.agreedToInfoDoc) {
                        alert("Please agree to the declarations and sign the conflict of interest statement.");
                        return;
                      }
                    }
                    setStep((s) => Math.min(steps.length - 1, s + 1));
                  }}
                  className="dash-btn dash-btn-primary rounded-full px-6 py-2.5 flex items-center gap-2"
                >
                  Continue <ChevronRight size={14} />
                </button>
                {isAdminEdit && (
                  <button
                    type="button"
                    onClick={onAdminReject}
                    className="dash-btn px-6 py-2.5 rounded-full flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white shadow-premium hover:-translate-y-0.5 ml-auto"
                  >
                    <X className="w-4 h-4" /> Reject Application
                  </button>
                )}
              </div>
              ) : (
                <div className="flex gap-3">
                <button
                  disabled={isSubmitting}
                  onClick={async () => {

                    // Step 0 Validations
                    const bioWordCount = form.bio.split(/\s+/).filter(Boolean).length;
                    const missingProfileFields = [];
                    if (!form.name) missingProfileFields.push('Name');
                    if (!form.email) missingProfileFields.push('Email');
                    if (!form.phone) missingProfileFields.push('Phone');
                    if (!isReapply && !isAdminEdit && !form.password) missingProfileFields.push('Password');
                    if (!form.bio) missingProfileFields.push('Bio');
                    if (form.bio && (bioWordCount < 100 || bioWordCount > 150)) missingProfileFields.push(`Bio word count (currently ${bioWordCount}, needs 100-150)`);
                    if (!authorBlob && !authorPhotoUrl) missingProfileFields.push('Author Photo');
                    if (missingProfileFields.length > 0) {
                      setStep(0);
                      alert(`Author Profile: Please fix these fields — ${missingProfileFields.join(', ')}`); return;
                    }
                    for (const q of qualifications) {
                      if (!q.qualification || !q.institution || !q.subject) {
                        setStep(0);
                        alert("Please fill all qualification fields (Qualification, Institution, Subject) correctly."); return;
                      }
                    }
                    if (!qrCodeBlob && !qrCodeUrl) {
                      setStep(0);
                      alert("Please upload your Payment QR Code."); return;
                    }
                    if (dynamicFields.length > 0) {
                      for (const f of dynamicFields) {
                        if (!extraDataState[f.name]) {
                          setStep(0);
                          alert(`Please fill the required field: ${f.name}`); return;
                        }
                      }
                    }
                    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
                      setStep(0);
                      alert("Please enter a valid email address."); return;
                    }
                    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) {
                      setStep(0);
                      alert("Please enter a valid 10-digit phone number."); return;
                    }
                    if (!/^\d{12}$/.test(form.aadharNumber)) {
                      setStep(0);
                      alert("Please enter a valid 12-digit Aadhar number."); return;
                    }

                    // Step 1 Validations
                    const hasFirstBook = form.title && form.genre && form.mrp && (coverBlob || coverFileUrl) && form.purposeOfWriting && form.pages && form.isbn && form.synopsis.split(/\s+/).filter(Boolean).length <= 100;
                    const hasBook = books.length > 0 || hasFirstBook;
                    if (!hasBook) {
                      setStep(1);
                      alert("Please fill all compulsory fields for at least one book (including ISBN, Pages, and purpose of writing) and upload a cover."); return;
                    }

                    // Step 2 Validations
                    if (!form.whyJoining || !form.whyJoining.trim()) {
                      setStep(2);
                      alert("Please explain why you are joining this group."); return;
                    }
                    if (!form.conflictOfInterestSignature || !form.agreedToGuidelines || !form.agreedToInfoDoc) {
                      setStep(2);
                      alert("Please agree to the declarations and sign the conflict of interest statement."); return;
                    }

                    // Step 3 Validations
                    const missingPaymentFields = [];
                    if (!form.transactionId) missingPaymentFields.push('Transaction ID');
                    if (!paymentBlob && !paymentScreenshotUrl) missingPaymentFields.push('Payment Screenshot');
                    if (missingPaymentFields.length > 0) {
                      alert(`Payment: Please provide — ${missingPaymentFields.join(', ')}`);
                      return;
                    }

                    setIsSubmitting(true);
                    try {
                      const formData = new FormData();
                      Object.entries(form).forEach(([key, val]) => {
                        const bookKeys = ['subcategory', 'subSubcategory', 'title', 'genre', 'synopsis', 'pages', 'mrp', 'stock', 'subtitle', 'language', 'isbn', 'publisher', 'publicationDate', 'edition', 'format'];
                        if (!bookKeys.includes(key)) {
                          if (key === 'skills' || key === 'hobbies') {
                            formData.append(key, JSON.stringify(val));
                          } else {
                            formData.append(key, String(val));
                          }
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
                          format: b.format,
                          printFormat: b.printFormat,
                          purpose: b.purposeOfWriting || b.purpose
                        };
                      })));

                      if (authorBlob) formData.append("photo", authorBlob);
                      finalBooks.forEach((b, idx) => {
                        if (b.coverBlob) formData.append(`cover_${idx}`, b.coverBlob);
                      });

                      if (paymentBlob) formData.append("paymentScreenshot", paymentBlob);
                      if (qrCodeBlob) formData.append("qrCode", qrCodeBlob);
                      
                      formData.append("qualifications", JSON.stringify(qualifications.map(q => ({
                        id: q.id,
                        qualification: q.qualification,
                        institution: q.institution,
                        subject: q.subject,
                        mode: q.mode
                      }))));
                      qualifications.forEach(q => {
                        if (q.certificateBlob) formData.append(`certificate_${q.id}`, q.certificateBlob);
                      });

                      if (Object.keys(extraDataState).length > 0) {
                        formData.append("extraData", JSON.stringify(extraDataState));
                      }

                      let res;
                      if (isAdminEdit) {
                        res = await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/admin/authors/${initialData.id}/full-update-and-approve`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
                        if (onAdminSave) onAdminSave();
                        return;
                      } else if (isReapply) {
                        res = await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/author/reapply-full`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
                      } else {
                        res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/authors/register`, formData);
                      }
                      
                      localStorage.removeItem("authorRegistrationDraft");
                      setSubmitted(true);
                      if (isReapply && onReapplySuccess) {
                        onReapplySuccess();
                      }
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
                  {isSubmitting ? <span className="animate-pulse">{isAdminEdit ? "Approving..." : "Submitting..."}</span> : <><CheckCircle size={14} /> {isAdminEdit ? "Approve Application" : "Submit Application"}</>}
                </button>
                {isAdminEdit && (
                  <button
                    type="button"
                    onClick={onAdminReject}
                    className="dash-btn px-6 py-2.5 rounded-full flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white shadow-premium hover:-translate-y-0.5 ml-auto"
                  >
                    <X className="w-4 h-4" /> Reject Application
                  </button>
                )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Success state */
          <div className="bg-white rounded-3xl-2xl border border-paa-navy/5 p-10 md:p-14 text-center shadow-premium animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="font-serif text-3xl font-medium text-paa-navy mb-3">{isReapply ? "Application Resubmitted!" : "Application Submitted!"}</h2>
            <p className="text-sm text-paa-gray-text leading-relaxed max-w-md mx-auto mb-8">
              Thank you, <strong className="text-paa-navy font-bold">{form.name || "Author"}</strong>! 
              Your application is under review. An email confirmation has been sent to you.
              <br /><br />
              <strong className="text-paa-gold">Approval Pending:</strong> Our editorial team will review your application within 5-7 working days. Once approved, you will be able to log in to your Author Dashboard.
              <br /><br />
              While you wait, you can continue browsing our website.
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

            <div className="flex justify-center gap-4">
              <a href="/" className="dash-btn px-8 py-3 rounded-full bg-gray-100 text-paa-navy hover:bg-gray-200">
                Go to Homepage
              </a>
              <a href="/login" className="dash-btn dash-btn-primary rounded-full px-8 py-3">
                Go to Login
              </a>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Group Guidelines Modal */}
      {showGuidelines && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paa-navy/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-paa-navy/5 bg-gray-50 flex justify-between items-center">
              <h3 className="font-serif text-xl font-medium text-paa-navy">PAA Group Guidelines</h3>
              <button onClick={() => setShowGuidelines(false)} className="text-gray-400 hover:text-red-500 font-bold uppercase text-xs tracking-widest transition-colors">Close</button>
            </div>
            <div className="p-8 overflow-y-auto prose prose-sm max-w-none text-paa-navy/80">
              <h4 className="text-paa-navy font-bold uppercase tracking-widest text-xs mb-4">1. Code of Conduct</h4>
              <p>All members of the Pune Authors' Association are expected to treat fellow authors, readers, and administrative staff with the utmost respect and professionalism. Harassment, discrimination, or abusive behavior in any PAA event, forum, or communication channel will result in immediate termination of membership.</p>

              <h4 className="text-paa-navy font-bold uppercase tracking-widest text-xs mt-6 mb-4">2. Originality & Plagiarism</h4>
              <p>By registering, you guarantee that all books and materials submitted to PAA are your original intellectual property or that you hold the explicit legal rights to distribute them. Plagiarism or copyright infringement is strictly prohibited.</p>

              <h4 className="text-paa-navy font-bold uppercase tracking-widest text-xs mt-6 mb-4">3. Event Participation</h4>
              <p>When participating in PAA-sponsored book fairs or physical events, authors must adhere to the specific guidelines of that event, including arrival times, table presentation standards, and POS (Point of Sale) protocols.</p>

              <h4 className="text-paa-navy font-bold uppercase tracking-widest text-xs mt-6 mb-4">4. Promotion & Spam</h4>
              <p>While self-promotion is encouraged in designated areas, spamming the PAA community, mass-emailing fellow authors, or using PAA platforms for unauthorized commercial advertising is not allowed.</p>
            </div>
            <div className="p-6 border-t border-paa-navy/5 bg-gray-50 flex justify-end">
              <button onClick={() => { setShowGuidelines(false); update("agreedToGuidelines", true); }} className="dash-btn dash-btn-primary rounded-full px-8 py-2">I Agree to the Guidelines</button>
            </div>
          </div>
        </div>
      )}

      {/* Group Information Document Modal */}
      {showInfoDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paa-navy/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-paa-navy/5 bg-gray-50 flex justify-between items-center">
              <h3 className="font-serif text-xl font-medium text-paa-navy">PAA Information Document</h3>
              <button onClick={() => setShowInfoDoc(false)} className="text-gray-400 hover:text-red-500 font-bold uppercase text-xs tracking-widest transition-colors">Close</button>
            </div>
            <div className="p-8 overflow-y-auto prose prose-sm max-w-none text-paa-navy/80">
              <h4 className="text-paa-navy font-bold uppercase tracking-widest text-xs mb-4">About Pune Authors' Association</h4>
              <p>The Pune Authors' Association (PAA) is a premier collective dedicated to supporting, promoting, and elevating local authors. Whether you are traditionally published or an independent self-published author, PAA provides the infrastructure to help you succeed.</p>

              <h4 className="text-paa-navy font-bold uppercase tracking-widest text-xs mt-6 mb-4">Membership Benefits</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>Access to the exclusive PAA Author Dashboard.</li>
                <li>Opportunities to participate in official PAA Book Fairs and literary events.</li>
                <li>Inclusion in digital and physical event catalogues distributed to readers.</li>
                <li>Direct-to-consumer sales infrastructure using our integrated POS (Point of Sale) system.</li>
                <li>Networking opportunities with industry professionals, editors, and fellow authors.</li>
              </ul>

              <h4 className="text-paa-navy font-bold uppercase tracking-widest text-xs mt-6 mb-4">Application & Fee Structure</h4>
              <p>The ₹1000 registration fee is a one-time processing and onboarding charge. This fee covers the administrative cost of our editorial team reviewing your application, validating your bibliography, and setting up your secure author portal.</p>
              <p className="mt-2 italic text-sm">Note: This fee is non-refundable. If your application is rejected due to incomplete information, you will be given an opportunity to correct your application without paying again.</p>
            </div>
            <div className="p-6 border-t border-paa-navy/5 bg-gray-50 flex justify-end">
              <button onClick={() => { setShowInfoDoc(false); update("agreedToInfoDoc", true); }} className="dash-btn dash-btn-primary rounded-full px-8 py-2">I Have Read The Document</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
