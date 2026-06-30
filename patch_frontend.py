import os
import re

file_path = "src/app/components/AuthorRegistrationPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add new icons to import
if "Instagram, Facebook, Linkedin, Youtube," not in content:
    content = content.replace(
        "import { CheckCircle, Upload, CreditCard, User, BookOpen, FileText, Shield, ChevronRight, ChevronLeft, Plus, Eye, EyeOff, X, Edit } from \"lucide-react\";",
        "import { CheckCircle, Upload, CreditCard, User, BookOpen, FileText, Shield, ChevronRight, ChevronLeft, Plus, Eye, EyeOff, X, Edit, Instagram, Facebook, Linkedin, Youtube, Link as LinkIcon } from \"lucide-react\";"
    )

# 2. Add new fields to form state
if "district: \"\"," not in content:
    content = content.replace(
        "address: \"\",",
        "address: \"\",\n    district: \"\",\n    pincode: \"\","
    )
    content = content.replace(
        "skills: \"\",\n    hobbies: \"\",",
        "skills: [],\n    hobbies: [],"
    )

# 3. Add skills/hobbies input state
if "const [skillInput, setSkillInput] = useState(\"\");" not in content:
    content = content.replace(
        "const [showPassword, setShowPassword] = useState(false);",
        "const [showPassword, setShowPassword] = useState(false);\n  const [skillInput, setSkillInput] = useState(\"\");\n  const [hobbyInput, setHobbyInput] = useState(\"\");"
    )

# 4. Indian States array
indian_states = """const indianStates = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];
"""
if "const indianStates =" not in content:
    content = content.replace(
        "const steps = [",
        indian_states + "\nconst steps = ["
    )

# 5. Language options
indian_languages = """const languages = [
  "English", "Hindi", "Marathi", "Bengali", "Telugu", "Tamil", "Gujarati", "Urdu", "Kannada", "Odia", "Malayalam", "Punjabi", "Other"
];
"""
if "const languages =" not in content:
    content = content.replace(
        "const genreOptions = [",
        indian_languages + "\nconst genreOptions = ["
    )

# 6. Update validation
content = content.replace(
    "if (key === \"experience\" && !value) error = \"Experience is required.\";",
    "if (key === \"experience\" && (value === \"\" || isNaN(Number(value)) || Number(value) < 0 || Number(value) > 70)) error = \"Experience must be a number between 0 and 70.\";"
)
content = content.replace(
    "if (key === \"skills\" && !value) error = \"Skills are required.\";",
    "if (key === \"skills\" && (!value || value.length === 0)) error = \"Skills are required.\";"
)
content = content.replace(
    "if (key === \"hobbies\" && !value) error = \"Hobbies are required.\";",
    "if (key === \"hobbies\" && (!value || value.length === 0)) error = \"Hobbies are required.\";"
)
if "pincode" not in content:
    content = content.replace(
        "if (key === \"address\" && !value) error = \"Full Address is required.\";",
        "if (key === \"address\" && !value) error = \"Full Address is required.\";\n    if (key === \"district\" && !value) error = \"District is required.\";\n    if (key === \"pincode\" && !/^\\d{6}$/.test(String(value))) error = \"Pincode must be 6 digits.\";"
    )

# 7. Form submission - skills/hobbies serialization
content = content.replace(
    "formData.append(key, String(val));",
    """if (key === 'skills' || key === 'hobbies') {
                            formData.append(key, JSON.stringify(val));
                          } else {
                            formData.append(key, String(val));
                          }"""
)

# 8. Name validation
content = content.replace(
    "value={form.name} onChange={(e) => update(\"name\", e.target.value)}",
    "value={form.name} onChange={(e) => update(\"name\", e.target.value.replace(/[^a-zA-Z\\s]/g, ''))}"
)

# 9. DOB validation - future dates
content = content.replace(
    "value={form.dob} onChange={(e) => update(\"dob\", e.target.value)} className={`dash-input w-full",
    "value={form.dob} max={new Date().toISOString().split('T')[0]} onChange={(e) => update(\"dob\", e.target.value)} className={`dash-input w-full"
)

# 10. Helper text for profile
content = content.replace(
    "Tell us about yourself. This information will be publicly displayed on your PAA author page.",
    "Tell us about yourself.<br/><span className='text-xs mt-1 block opacity-80'>Only public information (Bio, Profile Picture, Qualifications, Skills, Books) will be visible publicly. Sensitive information like Aadhaar Number, Phone Number, Address, Certificates, etc. will remain private.</span>"
)

# 11. State to dropdown
content = content.replace(
    "<input type=\"text\" value={form.state} onChange={(e) => update(\"state\", e.target.value)} className={`dash-input w-full ${errors.state ? '!border-red-500' : ''}`} placeholder=\"e.g. Maharashtra\" />",
    """<select value={form.state} onChange={(e) => update("state", e.target.value)} className={`dash-input w-full ${errors.state ? '!border-red-500' : ''}`}>
                          <option value="">Select State</option>
                          {indianStates.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>"""
)

# 12. District and Pincode
address_row = """<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="dash-label">District *</label>
                      <input type="text" value={form.district} onChange={(e) => update("district", e.target.value)} className={`dash-input w-full ${errors.district ? '!border-red-500' : ''}`} placeholder="e.g. Pune" />
                      {errors.district && <div className="text-red-500 text-xs mt-1 font-medium">{errors.district}</div>}
                    </div>
                    <div>
                      <label className="dash-label">Pincode *</label>
                      <input type="text" value={form.pincode} onChange={(e) => update("pincode", e.target.value.replace(/\\D/g, ''))} maxLength={6} className={`dash-input w-full ${errors.pincode ? '!border-red-500' : ''}`} placeholder="6-digit Pincode" />
                      {errors.pincode && <div className="text-red-500 text-xs mt-1 font-medium">{errors.pincode}</div>}
                    </div>
                  </div>"""

if "District *" not in content:
    content = content.replace(
        "placeholder=\"Street, Locality\" />\n                      {errors.address",
        "placeholder=\"House No./Flat No., Building, Street, Area\" />\n                      {errors.address"
    )
    content = content.replace(
        "<div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">\n                    <div>\n                      <label className=\"dash-label\">City *</label>",
        address_row + "\n                  <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">\n                    <div>\n                      <label className=\"dash-label\">City *</label>"
    )

# 13. Social media icons
content = content.replace(
    "<label className=\"dash-label\">Instagram Profile</label>",
    "<label className=\"dash-label flex items-center gap-1.5\"><Instagram size={14}/> Instagram Profile</label>"
)
content = content.replace(
    "<label className=\"dash-label\">Facebook Profile</label>",
    "<label className=\"dash-label flex items-center gap-1.5\"><Facebook size={14}/> Facebook Profile</label>"
)
content = content.replace(
    "<label className=\"dash-label\">LinkedIn Profile</label>",
    "<label className=\"dash-label flex items-center gap-1.5\"><Linkedin size={14}/> LinkedIn Profile</label>"
)
content = content.replace(
    "<label className=\"dash-label\">YouTube Channel</label>",
    "<label className=\"dash-label flex items-center gap-1.5\"><Youtube size={14}/> YouTube Channel</label>"
)

# 14. Skills chips
skills_input = """<div>
                      <label className="dash-label">Skills * <span className="font-normal opacity-70">(Press Enter to add)</span></label>
                      <div className={`p-2 border rounded-xl bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all ${errors.skills ? 'border-red-500' : 'border-gray-200'} flex flex-wrap gap-2`}>
                        {form.skills && form.skills.map((s: string, i: number) => (
                          <div key={i} className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-medium">
                            {s} <button type="button" onClick={() => update("skills", form.skills.filter((_: any, idx: number) => idx !== i))} className="hover:text-emerald-900"><X size={12}/></button>
                          </div>
                        ))}
                        <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (skillInput.trim()) { update("skills", [...(form.skills || []), skillInput.trim()]); setSkillInput(""); } } }} className="flex-1 min-w-[120px] outline-none text-sm bg-transparent" placeholder="Type and press Enter" />
                      </div>
                      {errors.skills && <div className="text-red-500 text-xs mt-1 font-medium">{errors.skills}</div>}
                    </div>"""
content = content.replace(
    "<div>\n                      <label className=\"dash-label\">Skills *</label>\n                      <input type=\"text\" value={form.skills} onChange={(e) => update(\"skills\", e.target.value)} className={`dash-input w-full ${errors.skills ? '!border-red-500' : ''}`} placeholder=\"e.g. Copywriting, Editing\" />\n                      {errors.skills && <div className=\"text-red-500 text-xs mt-1 font-medium\">{errors.skills}</div>}\n                    </div>",
    skills_input
)

hobbies_input = """<div>
                      <label className="dash-label">Hobbies * <span className="font-normal opacity-70">(Press Enter to add)</span></label>
                      <div className={`p-2 border rounded-xl bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all ${errors.hobbies ? 'border-red-500' : 'border-gray-200'} flex flex-wrap gap-2`}>
                        {form.hobbies && form.hobbies.map((h: string, i: number) => (
                          <div key={i} className="flex items-center gap-1 bg-paa-navy/5 text-paa-navy px-2.5 py-1 rounded-full text-xs font-medium">
                            {h} <button type="button" onClick={() => update("hobbies", form.hobbies.filter((_: any, idx: number) => idx !== i))} className="hover:text-paa-navy/70"><X size={12}/></button>
                          </div>
                        ))}
                        <input type="text" value={hobbyInput} onChange={(e) => setHobbyInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (hobbyInput.trim()) { update("hobbies", [...(form.hobbies || []), hobbyInput.trim()]); setHobbyInput(""); } } }} className="flex-1 min-w-[120px] outline-none text-sm bg-transparent" placeholder="Type and press Enter" />
                      </div>
                      {errors.hobbies && <div className="text-red-500 text-xs mt-1 font-medium">{errors.hobbies}</div>}
                    </div>"""
content = content.replace(
    "<div>\n                      <label className=\"dash-label\">Hobbies *</label>\n                      <input type=\"text\" value={form.hobbies} onChange={(e) => update(\"hobbies\", e.target.value)} className={`dash-input w-full ${errors.hobbies ? '!border-red-500' : ''}`} placeholder=\"e.g. Reading, Traveling\" />\n                      {errors.hobbies && <div className=\"text-red-500 text-xs mt-1 font-medium\">{errors.hobbies}</div>}\n                    </div>",
    hobbies_input
)

# 15. Book Category (Other)
content = content.replace(
    "{Object.keys(bookCategories).map(c => <option key={c} value={c}>{c}</option>)}",
    "{Object.keys(bookCategories).map(c => <option key={c} value={c}>{c}</option>)}\n<option value=\"Other\">Other</option>"
)

# 16. Book Language Dropdown
language_select = """<select value={form.language} onChange={(e) => update("language", e.target.value)} className={`dash-input w-full ${errors.language ? '!border-red-500' : ''}`}>
                        <option value="">Select Language</option>
                        {languages.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>"""
content = content.replace(
    "<input type=\"text\" placeholder=\"e.g. English, Marathi\" value={form.language} onChange={(e) => update(\"language\", e.target.value)} className={`dash-input w-full ${errors.language ? '!border-red-500' : ''}`} />",
    language_select
)

# 17. Self Published checkbox
publisher_row = """<div>
                      <label className="dash-label flex items-center justify-between">
                        Publisher Name *
                        <label className="flex items-center gap-1.5 text-xs font-normal cursor-pointer lowercase text-gray-500"><input type="checkbox" checked={form.isSelfPublished === 'yes'} onChange={(e) => { update('isSelfPublished', e.target.checked ? 'yes' : 'no'); if(e.target.checked) update('publisher', 'Self Published'); else update('publisher', ''); }} className="w-3 h-3"/> I am Self Published</label>
                      </label>
                      <input type="text" placeholder="e.g. Penguin" value={form.publisher} onChange={(e) => update("publisher", e.target.value)} className={`dash-input w-full ${errors.publisher ? '!border-red-500' : ''}`} disabled={form.isSelfPublished === 'yes'} />
                      {errors.publisher && <div className="text-red-500 text-xs mt-1 font-medium">{errors.publisher}</div>}
                    </div>"""
content = content.replace(
    """<div>
                      <label className="dash-label">Publisher Name *</label>
                      <input type="text" placeholder="e.g. Self-Published" value={form.publisher} onChange={(e) => update("publisher", e.target.value)} className={`dash-input w-full ${errors.publisher ? '!border-red-500' : ''}`} />
                      {errors.publisher && <div className="text-red-500 text-xs mt-1 font-medium">{errors.publisher}</div>}
                    </div>""",
    publisher_row
)

# 18. Navbar inside success page
navbar_snippet = """{/* Registration Success View with Navbar access */}
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
            </p>"""
content = content.replace(
    """<div className="bg-white rounded-3xl-2xl border border-paa-navy/5 p-10 md:p-14 text-center shadow-premium animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="font-serif text-3xl font-medium text-paa-navy mb-3">{isReapply ? "Application Resubmitted!" : "Application Submitted!"}</h2>
            <p className="text-sm text-paa-gray-text leading-relaxed max-w-md mx-auto mb-8">
              Thank you, <strong className="text-paa-navy font-bold">{form.name || "Author"}</strong>! 
              {` Your ${isReapply ? "updated " : ""}application for `}
              <em>"{[...books.map(b => b.title), form.title].filter(Boolean).join(", ") || "your books"}"</em>
              {` has been received. `}
              <br /><br />
              <strong className="text-paa-gold">Approval Pending:</strong> You must wait for the Admin to approve your account. Once approved, you will be able to log in to your Author Dashboard.
            </p>""",
    navbar_snippet
)

# Replace the "Go to Login" with "Go to Home" and "Go to Login"
buttons_snippet = """<div className="flex justify-center gap-4">
              <a href="/" className="dash-btn px-8 py-3 rounded-full bg-gray-100 text-paa-navy hover:bg-gray-200">
                Go to Homepage
              </a>
              <a href="/login" className="dash-btn dash-btn-primary rounded-full px-8 py-3">
                Go to Login
              </a>
            </div>"""
content = content.replace(
    """<button onClick={() => window.location.href = "/login"} className="dash-btn dash-btn-primary rounded-full px-8 py-3">
              Go to Login
            </button>""",
    buttons_snippet
)

# 19. Form layout max-width change
content = content.replace(
    "className=\"max-w-3xl mx-auto my-12 px-6 pb-20\"",
    "className=\"max-w-5xl mx-auto my-12 px-6 pb-20\""
)

# 20. Divide into sections using headings
content = content.replace(
    "<div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">\n                    <div>\n                      <label className=\"dash-label\"><Instagram",
    "<h3 className=\"font-serif text-xl mt-8 mb-4 pt-8 border-t border-gray-100\">Social Media</h3>\n                  <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">\n                    <div>\n                      <label className=\"dash-label\"><Instagram"
)
content = content.replace(
    "<div className=\"space-y-4\">\n                    <div className=\"flex justify-between items-center\">\n                      <label className=\"dash-label mb-0 text-lg font-serif\">Qualifications</label>",
    "<h3 className=\"font-serif text-xl mt-8 pt-8 border-t border-gray-100\">Qualifications</h3>\n                  <div className=\"space-y-4\">\n                    <div className=\"flex justify-between items-center\">\n                      <label className=\"dash-label mb-0 text-sm opacity-0\">Qualifications</label>"
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Frontend patched.")
