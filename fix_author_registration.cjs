const fs = require('fs');

let content = fs.readFileSync('src/app/components/AuthorRegistrationPage.tsx', 'utf8');

const formatDiv = `                    <div>
                      <label className="dash-label">Book Format *</label>
                      <select value={form.format} onChange={(e) => update("format", e.target.value)} className={\`dash-input w-full \${errors.format ? '!border-red-500' : ''}\`}>
                        <option value="">Select Format</option>
                        <option value="Paperback">Paperback</option>
                        <option value="Hardcover">Hardcover</option>
                        <option value="Ebook">Ebook</option>
                      </select>
                      {errors.format && <div className="text-red-500 text-xs mt-1 font-medium">{errors.format}</div>}
                    </div>`;

const newFormatDiv = `${formatDiv}
                    <div>
                      <label className="dash-label">Print Format *</label>
                      <select value={form.printFormat || ''} onChange={(e) => update("printFormat", e.target.value)} className={\`dash-input w-full \${errors.printFormat ? '!border-red-500' : ''}\`}>
                        <option value="">Select Print Format</option>
                        <option value="Black & White">Black & White</option>
                        <option value="Colored">Colored</option>
                      </select>
                      {errors.printFormat && <div className="text-red-500 text-xs mt-1 font-medium">{errors.printFormat}</div>}
                    </div>`;

content = content.replace(formatDiv, newFormatDiv);

const pagesDiv = `                    <div>
                      <label className="dash-label">Number of Pages</label>
                      <input type="number" placeholder="256" value={form.pages} onChange={(e) => update("pages", e.target.value)} className="dash-input w-full" />
                    </div>`;

const newPagesDiv = `                    <div>
                      <label className="dash-label">Number of Pages *</label>
                      <input type="number" placeholder="256" value={form.pages} onChange={(e) => { update("pages", e.target.value); }} className={\`dash-input w-full \${errors.pages ? '!border-red-500' : ''}\`} />
                      {errors.pages && <div className="text-red-500 text-xs mt-1 font-medium">{errors.pages}</div>}
                    </div>`;

content = content.replace(pagesDiv, newPagesDiv);

// Update MRP logic
const mrpDiv = `                    <div>
                      <label className="dash-label">MRP (₹) *</label>
                      <input type="number" placeholder="299" value={form.mrp} onChange={(e) => update("mrp", e.target.value)} className={\`dash-input w-full \${errors.mrp ? '!border-red-500' : ''}\`} />
                      {errors.mrp && <div className="text-red-500 text-xs mt-1 font-medium">{errors.mrp}</div>}
                    </div>`;

const newMrpDiv = `                    <div>
                      <label className="dash-label">MRP (₹) *</label>
                      <input type="number" placeholder="299" value={form.mrp} onChange={(e) => { 
                          update("mrp", e.target.value);
                      }} className={\`dash-input w-full \${errors.mrp ? '!border-red-500' : ''}\`} />
                      {errors.mrp && <div className="text-red-500 text-xs mt-1 font-medium">{errors.mrp}</div>}
                      {(() => {
                         if (!form.pages || !form.printFormat || !form.mrp) return null;
                         const rate = form.printFormat === 'Black & White' ? 1 : 3;
                         const fairPrice = (parseInt(form.pages) * rate) + 100;
                         if (parseFloat(form.mrp) > fairPrice) {
                            return <div className="text-orange-500 text-[10px] mt-1 font-medium">Warning: This MRP is higher than the fair price (₹{fairPrice}). Admin approval may take longer.</div>;
                         }
                         return null;
                      })()}
                    </div>`;

content = content.replace(mrpDiv, newMrpDiv);

// Update validation logic in `onClick` of "Save & Add Another Book"
const saveBtnCondition = `if (!form.title || !form.genre || !form.synopsis || !form.mrp || !form.language || !form.publisher || !form.publicationDate || !form.format || !coverBlob) {`;
const newSaveBtnCondition = `if (!form.title || !form.genre || !form.synopsis || !form.mrp || !form.language || !form.publisher || !form.publicationDate || !form.format || !form.printFormat || !form.pages || !coverBlob) {`;
content = content.replace(saveBtnCondition, newSaveBtnCondition);

const setFormCall = `setForm({...form, title: "", subtitle: "", genre: "", subcategory: "", subSubcategory: "", synopsis: "", pages: "", mrp: "", stock: "0", language: "", isbn: "", publisher: "", publicationDate: "", edition: "", format: ""});`;
const newSetFormCall = `setForm({...form, title: "", subtitle: "", genre: "", subcategory: "", subSubcategory: "", synopsis: "", pages: "", mrp: "", stock: "0", language: "", isbn: "", publisher: "", publicationDate: "", edition: "", format: "", printFormat: ""});`;
content = content.replace(setFormCall, newSetFormCall);

const finalBooksPush = `if (form.title && form.genre && form.mrp) {
                        finalBooks.push({ ...form, coverBlob });
                      }`;
const newFinalBooksPush = `if (form.title && form.genre && form.mrp) {
                        let isOverpriced = false;
                        if (form.pages && form.printFormat && form.mrp) {
                           const rate = form.printFormat === 'Black & White' ? 1 : 3;
                           const fairPrice = (parseInt(form.pages) * rate) + 100;
                           isOverpriced = parseFloat(form.mrp) > fairPrice;
                        }
                        finalBooks.push({ ...form, coverBlob, isOverpriced });
                      }`;
content = content.replace(finalBooksPush, newFinalBooksPush);

// Fix grid-cols for format row
content = content.replace(`<div className="grid grid-cols-1 md:grid-cols-4 gap-6">`, `<div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">`);


fs.writeFileSync('src/app/components/AuthorRegistrationPage.tsx', content);
console.log('Updated AuthorRegistrationPage.tsx for printFormat and overpriced logic');
