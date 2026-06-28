const fs = require('fs');
let content = fs.readFileSync('src/app/components/AuthorDashboardPage.tsx', 'utf8');

// 1. Add printFormat to newBook state
content = content.replace(
  /format: ''\n\s*}\);/,
  "format: '',\n    printFormat: ''\n  });"
);

// 2. Add Print Format to newBook UI (Add Book Modal)
const oldNewFormatUI = `<div className="md:col-span-1">
                      <label className="dash-label">Book Format *</label>
                      <select required className="dash-input w-full" value={newBook.format} onChange={e => setNewBook({...newBook, format: e.target.value})}>
                        <option value="">Select</option>
                        <option value="Paperback">Paperback</option>
                        <option value="Hardcover">Hardcover</option>
                        <option value="Ebook">Ebook</option>
                      </select>
                    </div>`;

const newNewFormatUI = `${oldNewFormatUI}
                    <div className="md:col-span-1">
                      <label className="dash-label">Print Format *</label>
                      <select required className="dash-input w-full" value={newBook.printFormat || ''} onChange={e => setNewBook({...newBook, printFormat: e.target.value})}>
                        <option value="">Select</option>
                        <option value="Black & White">Black & White</option>
                        <option value="Colored">Colored</option>
                      </select>
                    </div>`;
content = content.replace(oldNewFormatUI, newNewFormatUI);

// Fix grid-cols for Add Book Format row
content = content.replace(
  /<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">\n\s*<div className="md:col-span-1">\n\s*<label className="dash-label">ISBN Number/,
  `<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">\n                    <div className="md:col-span-1">\n                      <label className="dash-label">ISBN Number`
);

// 3. Add Overpriced Logic to newBook MRP (Add Book Modal)
const oldNewMrpUI = `<div className="md:col-span-1">
                      <label className="dash-label">MRP (₹) *</label>
                      <input required type="number" className="dash-input w-full" placeholder="299" value={newBook.mrp} onChange={e => setNewBook({...newBook, mrp: e.target.value})} />
                    </div>`;

const newNewMrpUI = `<div className="md:col-span-1">
                      {(() => {
                        let maxFairPrice = 0;
                        if (newBook.pages && newBook.printFormat) {
                          const pages = parseInt(newBook.pages, 10);
                          if (!isNaN(pages)) {
                             if (newBook.printFormat === 'Black & White') { maxFairPrice = (pages * 1) + 100; }
                             else if (newBook.printFormat === 'Colored') { maxFairPrice = (pages * 3) + 100; }
                          }
                        }
                        const isOverpriced = maxFairPrice > 0 && parseFloat(newBook.mrp) > maxFairPrice;
                        return (
                          <>
                            <label className="dash-label">MRP (₹) *</label>
                            <input required type="number" className="dash-input w-full" placeholder="299" value={newBook.mrp} onChange={e => setNewBook({...newBook, mrp: e.target.value})} />
                            {isOverpriced && (
                              <div className="text-yellow-700 bg-yellow-50 text-[10px] p-2 mt-1 rounded border border-yellow-200">
                                <strong>Warning:</strong> Max recommended price is ₹{maxFairPrice}. Proceeding will flag for Admin review.
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>`;
content = content.replace(oldNewMrpUI, newNewMrpUI);

// 4. Update handleAddBookSubmit to include printFormat & isOverpriced
content = content.replace(
  /formData\.append\('publicationDate', newBook\.publicationDate\);/,
  `formData.append('publicationDate', newBook.publicationDate);\n      formData.append('printFormat', newBook.printFormat || '');\n      \n      let maxFairPrice = 0;\n      if (newBook.pages && newBook.printFormat) {\n        const pages = parseInt(newBook.pages, 10);\n        if (!isNaN(pages)) {\n          if (newBook.printFormat === 'Black & White') { maxFairPrice = (pages * 1) + 100; }\n          else if (newBook.printFormat === 'Colored') { maxFairPrice = (pages * 3) + 100; }\n        }\n      }\n      formData.append('isOverpriced', (maxFairPrice > 0 && parseFloat(newBook.mrp) > maxFairPrice) ? 'true' : 'false');`
);


// 5. Add Print Format to editingBook UI (Edit Book Modal)
const oldEditFormatUI = `<div className="md:col-span-1">
                      <label className="dash-label">Book Format *</label>
                      <select required className="dash-input w-full" value={editingBook.format} onChange={e => setEditingBook({...editingBook, format: e.target.value})}>
                        <option value="">Select</option>
                        <option value="Paperback">Paperback</option>
                        <option value="Hardcover">Hardcover</option>
                        <option value="Ebook">Ebook</option>
                      </select>
                    </div>`;
                    
const newEditFormatUI = `${oldEditFormatUI}
                    <div className="md:col-span-1">
                      <label className="dash-label">Print Format *</label>
                      <select required className="dash-input w-full" value={editingBook.printFormat || ''} onChange={e => setEditingBook({...editingBook, printFormat: e.target.value})}>
                        <option value="">Select</option>
                        <option value="Black & White">Black & White</option>
                        <option value="Colored">Colored</option>
                      </select>
                    </div>`;
content = content.replace(oldEditFormatUI, newEditFormatUI);

// Fix grid-cols for Edit Book Format row
content = content.replace(
  /<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">\n\s*<div className="md:col-span-1">\n\s*<label className="dash-label">ISBN Number<\/label>/g,
  `<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">\n                    <div className="md:col-span-1">\n                      <label className="dash-label">ISBN Number</label>`
);

// 6. Add Overpriced Logic to editingBook MRP (Edit Book Modal)
const oldEditMrpUI = `<div className="md:col-span-1">
                      <label className="dash-label">MRP (₹) *</label>
                      <input required type="number" className="dash-input w-full" value={editingBook.mrp} onChange={e => setEditingBook({...editingBook, mrp: e.target.value})} />
                    </div>`;

const newEditMrpUI = `<div className="md:col-span-1">
                      {(() => {
                        let maxFairPrice = 0;
                        if (editingBook.pages && editingBook.printFormat) {
                          const pages = parseInt(editingBook.pages, 10);
                          if (!isNaN(pages)) {
                             if (editingBook.printFormat === 'Black & White') { maxFairPrice = (pages * 1) + 100; }
                             else if (editingBook.printFormat === 'Colored') { maxFairPrice = (pages * 3) + 100; }
                          }
                        }
                        const isOverpriced = maxFairPrice > 0 && parseFloat(editingBook.mrp) > maxFairPrice;
                        return (
                          <>
                            <label className="dash-label">MRP (₹) *</label>
                            <input required type="number" className="dash-input w-full" value={editingBook.mrp} onChange={e => setEditingBook({...editingBook, mrp: e.target.value})} />
                            {isOverpriced && (
                              <div className="text-yellow-700 bg-yellow-50 text-[10px] p-2 mt-1 rounded border border-yellow-200">
                                <strong>Warning:</strong> Max recommended price is ₹{maxFairPrice}. Proceeding will flag for Admin review.
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>`;
content = content.replace(oldEditMrpUI, newEditMrpUI);

fs.writeFileSync('src/app/components/AuthorDashboardPage.tsx', content);
console.log('Fixed Author Dashboard Page with Print Format and Overpriced formula');
