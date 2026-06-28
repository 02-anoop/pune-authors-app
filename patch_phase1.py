import os

author_path = "src/app/components/AuthorDashboardPage.tsx"
with open(author_path, "r", encoding="utf-8") as f:
    author_content = f.read()

# 1. Edit Book - Add Print Format
edit_format_target = """                  <div>
                    <label className="dash-label">Format</label>
                    <input type="text" className="dash-input" value={editingBook.format} onChange={e => setEditingBook({...editingBook, format: e.target.value})} />
                  </div>"""
edit_format_replace = """                  <div>
                    <label className="dash-label">Format</label>
                    <input type="text" className="dash-input" value={editingBook.format} onChange={e => setEditingBook({...editingBook, format: e.target.value})} />
                  </div>
                  <div>
                    <label className="dash-label">Print Format</label>
                    <select className="dash-input" value={editingBook.printFormat || ''} onChange={e => setEditingBook({...editingBook, printFormat: e.target.value})}>
                      <option value="">Select Print Format</option>
                      <option value="Black & White">Black & White</option>
                      <option value="Colored">Colored</option>
                    </select>
                  </div>"""

if "Print Format" not in edit_format_target and "<option value=\"Colored\">Colored</option>" not in author_content.split("function InventoryPage")[0].split("const [editingBook")[1]:
    author_content = author_content.replace(edit_format_target, edit_format_replace)

# 2. Edit Book - Add Warning
edit_warning_target = """                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                  <button type="button" onClick={() => setEditingBook(null)} className="dash-btn dash-btn-ghost">Cancel</button>"""
edit_warning_replace = """                {(() => {
                   const pages = Number(editingBook.pages);
                   const mrp = Number(editingBook.mrp);
                   const isColored = editingBook.printFormat === 'Colored';
                   const rate = isColored ? 1.5 : 1;
                   const maxPrice = (pages * rate) + 100;
                   if (pages > 0 && mrp > maxPrice) {
                     return <div className="text-red-500 text-xs font-bold bg-red-50 p-2 rounded border border-red-200 mt-3">Warning: Your MRP (₹{mrp}) exceeds the recommended max price of ₹{maxPrice} based on your pages and format. This may delay approval.</div>;
                   }
                   return null;
                })()}
                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                  <button type="button" onClick={() => setEditingBook(null)} className="dash-btn dash-btn-ghost">Cancel</button>"""

if "Warning: Your MRP" not in author_content.split("function InventoryPage")[0].split("const [editingBook")[1]:
    author_content = author_content.replace(edit_warning_target, edit_warning_replace)

# 3. Add Book - Add Warning
add_warning_target = """                <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                  <button type="button" onClick={() => setShowAddBook(false)} className="dash-btn dash-btn-ghost">Cancel</button>"""
add_warning_replace = """                {(() => {
                   const pages = Number(newBook.pages);
                   const mrp = Number(newBook.mrp);
                   const isColored = newBook.printFormat === 'Colored';
                   const rate = isColored ? 1.5 : 1;
                   const maxPrice = (pages * rate) + 100;
                   if (pages > 0 && mrp > maxPrice) {
                     return <div className="text-red-500 text-xs font-bold bg-red-50 p-2 rounded border border-red-200 mt-3 mb-2">Warning: Your MRP (₹{mrp}) exceeds the recommended max price of ₹{maxPrice} based on your pages and format. This may delay approval.</div>;
                   }
                   return null;
                })()}
                <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                  <button type="button" onClick={() => setShowAddBook(false)} className="dash-btn dash-btn-ghost">Cancel</button>"""

if "Warning: Your MRP" not in author_content.split("const [newBook")[1].split("function InventoryPage")[0]:
    author_content = author_content.replace(add_warning_target, add_warning_replace)


# 4. Add Book - Initial Stock compulsory
stock_target = """                  <div>
                    <label className="dash-label">Initial Stock</label>
                    <input type="number" className="dash-input" placeholder="Qty" value={newBook.stock} onChange={e => setNewBook({...newBook, stock: e.target.value})} />
                  </div>"""
stock_replace = """                  <div>
                    <label className="dash-label">Initial Stock *</label>
                    <input required type="number" className="dash-input" placeholder="Qty" value={newBook.stock} onChange={e => setNewBook({...newBook, stock: e.target.value})} />
                  </div>"""

if stock_target in author_content:
    author_content = author_content.replace(stock_target, stock_replace)


with open(author_path, "w", encoding="utf-8") as f:
    f.write(author_content)
print("Patched Phase 1 features in AuthorDashboardPage")
