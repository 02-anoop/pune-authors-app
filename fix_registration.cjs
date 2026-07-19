const fs = require('fs');
let content = fs.readFileSync('src/app/components/AuthorRegistrationPage.tsx', 'utf8');

// Add printFormat to state
content = content.replace(
  /format: "",\n\s*transactionId: "",/,
  'format: "",\n    printFormat: "",\n    transactionId: "",'
);

// Add printFormat to validation
content = content.replace(
  /if \(key === "format" && !value\) error = "Book Format is required.";/,
  'if (key === "format" && !value) error = "Book Format is required.";\n    if (key === "printFormat" && !value) error = "Print Format is required.";'
);

// Add the Print Format UI select next to the Book Format select
const oldFormatUI = `<div>
                      <label className="dash-label">Book Format *</label>
                      <select value={form.format} onChange={(e) => update("format", e.target.value)} className={\`dash-input w-full \${errors.format ? '!border-red-500' : ''}\`}>
                        <option value="">Select Format</option>
                        <option value="Paperback">Paperback</option>
                        <option value="Hardcover">Hardcover</option>
                        <option value="Ebook">Ebook</option>
                      </select>
                      {errors.format && <div className="text-red-500 text-xs mt-1 font-medium">{errors.format}</div>}
                    </div>`;

const newFormatUI = `${oldFormatUI}
                    <div>
                      <label className="dash-label">Print Format *</label>
                      <select value={form.printFormat} onChange={(e) => update("printFormat", e.target.value)} className={\`dash-input w-full \${errors.printFormat ? '!border-red-500' : ''}\`}>
                        <option value="">Select Print Format</option>
                        <option value="Black & White">Black & White</option>
                        <option value="Colored">Colored</option>
                      </select>
                      {errors.printFormat && <div className="text-red-500 text-xs mt-1 font-medium">{errors.printFormat}</div>}
                    </div>`;

content = content.replace(oldFormatUI, newFormatUI);

// The grid for Edition/Format currently is grid-cols-3 and has 3 items: ISBN, Edition, Book Format.
// With Print Format, it has 4 items. Let's make it grid-cols-4 or grid-cols-2.
content = content.replace(
  /<div className="grid grid-cols-1 md:grid-cols-3 gap-6">\s*<div>\s*<label className="dash-label">ISBN Number<\/label>/,
  '<div className="grid grid-cols-1 md:grid-cols-4 gap-6">\n                    <div>\n                      <label className="dash-label">ISBN Number</label>'
);

// Add Overpriced Logic calculation near MRP
const oldMrpUI = `<div>
                      <label className="dash-label">MRP (₹) *</label>
                      <input type="number" placeholder="299" value={form.mrp} onChange={(e) => update("mrp", e.target.value)} className={\`dash-input w-full \${errors.mrp ? '!border-red-500' : ''}\`} />
                      {errors.mrp && <div className="text-red-500 text-xs mt-1 font-medium">{errors.mrp}</div>}
                    </div>`;

const newMrpUI = `{(() => {
                      let maxFairPrice = 0;
                      if (form.pages && form.printFormat) {
                        const pages = parseInt(form.pages, 10);
                        if (!isNaN(pages)) {
                           if (form.printFormat === 'Black & White') { maxFairPrice = (pages * 1) + 100; }
                           else if (form.printFormat === 'Colored') { maxFairPrice = (pages * 3) + 100; }
                        }
                      }
                      const isOverpriced = maxFairPrice > 0 && parseFloat(form.mrp) > maxFairPrice;
                      
                      return (
                        <div>
                          <label className="dash-label">MRP (₹) *</label>
                          <input type="number" placeholder="299" value={form.mrp} onChange={(e) => update("mrp", e.target.value)} className={\`dash-input w-full \${errors.mrp ? '!border-red-500' : ''}\`} />
                          {errors.mrp && <div className="text-red-500 text-xs mt-1 font-medium">{errors.mrp}</div>}
                          {isOverpriced && (
                            <div className="text-yellow-700 bg-yellow-50 text-[10px] p-2 mt-1 rounded border border-yellow-200">
                              <strong>Warning:</strong> Based on the page count and print format, the recommended maximum fair price is ₹{maxFairPrice}. You can still proceed, but it will be flagged for Admin review.
                            </div>
                          )}
                        </div>
                      );
                    })()}`;

content = content.replace(oldMrpUI, newMrpUI);

// Now for saving the book, ensure printFormat and isOverpriced are passed.
// Look for handleAddBook
content = content.replace(
  /isbn: form\.isbn,\n\s*publisher: form\.publisher,\n\s*publicationDate: form\.publicationDate,\n\s*edition: form\.edition,\n\s*format: form\.format,/,
  `isbn: form.isbn,
      publisher: form.publisher,
      publicationDate: form.publicationDate,
      edition: form.edition,
      format: form.format,
      printFormat: form.printFormat,
      isOverpriced: (function() {
        let maxFairPrice = 0;
        if (form.pages && form.printFormat) {
          const pages = parseInt(form.pages, 10);
          if (!isNaN(pages)) {
             if (form.printFormat === 'Black & White') { maxFairPrice = (pages * 1) + 100; }
             else if (form.printFormat === 'Colored') { maxFairPrice = (pages * 3) + 100; }
          }
        }
        return maxFairPrice > 0 && parseFloat(form.mrp) > maxFairPrice;
      })(),`
);

fs.writeFileSync('src/app/components/AuthorRegistrationPage.tsx', content);
console.log('Fixed Author Registration Page with Print Format and Overpriced formula');
