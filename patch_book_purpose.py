import os

file_path = "src/app/components/AuthorDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add purpose to newBook initial state
content = content.replace(
    "printFormat: ''\n  });",
    "printFormat: '',\n    purpose: ''\n  });"
)
content = content.replace(
    "printFormat: '',",
    "printFormat: '', purpose: '',"
)
# And handleEditBookOpen
content = content.replace(
    "printFormat: book.printFormat || ''",
    "printFormat: book.printFormat || '',\n      purpose: book.purpose || ''"
)
# And formData for add book
content = content.replace(
    "formData.append('printFormat', newBook.printFormat || '');",
    "formData.append('printFormat', newBook.printFormat || '');\n      formData.append('purpose', newBook.purpose || '');"
)
# And handleEditBookSubmit
content = content.replace(
    "printFormat: editingBook.printFormat",
    "printFormat: editingBook.printFormat,\n        purpose: editingBook.purpose"
)

# And add the field in the UI for Add Book
purpose_field = """<div>
                    <label className="dash-label">Purpose of Writing *</label>
                    <select required className="dash-input" value={(newBook as any).purpose || ''} onChange={e => setNewBook({...newBook, purpose: e.target.value})}>
                      <option value="">Select Purpose</option>
                      <option value="Hobby">Hobby</option>
                      <option value="Professional/Academic">Professional/Academic</option>
                      <option value="Commercial/Revenue">Commercial/Revenue</option>
                      <option value="Social Cause/Awareness">Social Cause/Awareness</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>"""

content = content.replace(
    """<div>
                    <label className="dash-label">Print Format *</label>
                    <select required className="dash-input" value={(newBook as any).printFormat || ''} onChange={e => setNewBook({...newBook, printFormat: e.target.value})}>
                      <option value="">Select Print Format</option>
                      <option value="Black & White">Black & White</option>
                      <option value="Colored">Colored</option>
                    </select>
                  </div>""",
    """<div>
                    <label className="dash-label">Print Format *</label>
                    <select required className="dash-input" value={(newBook as any).printFormat || ''} onChange={e => setNewBook({...newBook, printFormat: e.target.value})}>
                      <option value="">Select Print Format</option>
                      <option value="Black & White">Black & White</option>
                      <option value="Colored">Colored</option>
                    </select>
                  </div>\n                  """ + purpose_field
)

# And add the field in the UI for Edit Book (Wait, I don't see the edit book form in the Overview tab? Ah wait, there might be a modal for editing book. Let me check if `editingBook` exists in UI)
# Yes, `editingBook` modal must exist.

purpose_edit_field = """<div>
                    <label className="dash-label">Purpose of Writing *</label>
                    <select required className="dash-input" value={editingBook.purpose || ''} onChange={e => setEditingBook({...editingBook, purpose: e.target.value})}>
                      <option value="">Select Purpose</option>
                      <option value="Hobby">Hobby</option>
                      <option value="Professional/Academic">Professional/Academic</option>
                      <option value="Commercial/Revenue">Commercial/Revenue</option>
                      <option value="Social Cause/Awareness">Social Cause/Awareness</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>"""

content = content.replace(
    """<div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Print Format</label>
                    <select className="dash-input w-full" value={editingBook.printFormat || ''} onChange={e => setEditingBook({...editingBook, printFormat: e.target.value})}>
                      <option value="">Select</option>
                      <option value="Black & White">Black & White</option>
                      <option value="Colored">Colored</option>
                    </select>
                  </div>""",
    """<div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Print Format</label>
                    <select className="dash-input w-full" value={editingBook.printFormat || ''} onChange={e => setEditingBook({...editingBook, printFormat: e.target.value})}>
                      <option value="">Select</option>
                      <option value="Black & White">Black & White</option>
                      <option value="Colored">Colored</option>
                    </select>
                  </div>\n                  """ + purpose_edit_field.replace('dash-label', 'block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1').replace('dash-input', 'dash-input w-full')
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Book purpose patched.")
