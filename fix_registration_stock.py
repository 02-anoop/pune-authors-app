with open('src/app/components/AuthorRegistrationPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add stock to form state
old_form_state = '''    pages: "",
    mrp: "",
    guidelinesChecked: false,'''
new_form_state = '''    pages: "",
    mrp: "",
    stock: "",
    guidelinesChecked: false,'''
content = content.replace(old_form_state, new_form_state)

# 2. Add stock field next to MRP
old_book_details = '''                    <div>
                      <label style={labelStyle}>Maximum Retail Price (₹) *</label>
                      <input type="number" placeholder="e.g. 299" value={form.mrp} onChange={(e) => update("mrp", e.target.value)} style={inputStyle} />
                    </div>
                  </div>'''
new_book_details = '''                    <div>
                      <label style={labelStyle}>Maximum Retail Price (₹) *</label>
                      <input type="number" placeholder="e.g. 299" value={form.mrp} onChange={(e) => update("mrp", e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Initial Book Stock *</label>
                      <input type="number" placeholder="e.g. 50" value={form.stock} onChange={(e) => update("stock", e.target.value)} style={inputStyle} />
                    </div>
                  </div>'''
content = content.replace(old_book_details, new_book_details)

# 3. Add 1fr to the grid to accommodate stock
old_grid = '''<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>'''
new_grid = '''<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>'''
content = content.replace(old_grid, new_grid)

with open('src/app/components/AuthorRegistrationPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added stock to AuthorRegistrationPage")
