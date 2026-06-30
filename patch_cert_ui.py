import os

file_path = "src/app/components/AuthorRegistrationPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Improve certificate upload UI
cert_ui_snippet = """<div>
                          <label className="dash-label">Upload Certificate (Optional)</label>
                          <div
                            className="border border-dashed border-paa-navy/20 rounded-2xl p-4 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[100px]"
                            onClick={() => document.getElementById(`cert-upload-${idx}`)?.click()}
                          >
                            {q.certificateUrl ? (
                              <div className="flex flex-col items-center gap-2">
                                <FileText className="w-5 h-5 text-emerald-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Certificate Selected</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 text-paa-navy/40 mb-2" />
                                <div className="text-xs font-medium text-paa-navy">Upload PDF/Image</div>
                              </>
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
                        </div>"""

content = content.replace(
    """<div>
                          <label className="dash-label">Upload Certificate (Optional)</label>
                          <input type="file" accept="image/*,application/pdf" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const n = [...qualifications];
                              n[idx].certificateBlob = file;
                              n[idx].certificateUrl = URL.createObjectURL(file);
                              setQualifications(n);
                            }
                          }} className="text-xs w-full block"/>
                          {q.certificateUrl && <span className="text-[10px] text-emerald-600 block mt-2 font-bold uppercase tracking-widest">Certificate Selected</span>}
                        </div>""",
    cert_ui_snippet
)

# And missing "purposeOfWriting" clearing when adding multiple books
content = content.replace(
    "setForm({ ...form, title: \"\", subtitle: \"\", genre: \"\", subcategory: \"\", subSubcategory: \"\", synopsis: \"\", pages: \"\", mrp: \"\", stock: \"0\", language: \"\", isbn: \"\", publisher: \"\", publicationDate: \"\", edition: \"\", format: \"\" });",
    "setForm({ ...form, title: \"\", subtitle: \"\", genre: \"\", subcategory: \"\", subSubcategory: \"\", synopsis: \"\", pages: \"\", mrp: \"\", stock: \"0\", language: \"\", isbn: \"\", publisher: \"\", publicationDate: \"\", edition: \"\", format: \"\", purposeOfWriting: \"\" });"
)

# Replace default -1 values with 0, NA, or empty values.
# Usually this means if someone inputs "-1", we should clear it or change to empty? Or maybe the prompt means initial state should not be -1.
# I checked the initial state, it's mostly empty strings or "0" for stock.

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Certificate UI patched.")
