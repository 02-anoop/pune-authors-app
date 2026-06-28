const fs = require('fs');

// --- Update api.js ---
let apiContent = fs.readFileSync('server/routes/api.js', 'utf8');

apiContent = apiContent.replace(
  /const { name, location, date, duration, eventType, registrationFee, feeType, description } = req.body;/,
  'const { name, location, date, duration, eventType, registrationFee, feeType, description, livePosEnabled } = req.body;'
);

apiContent = apiContent.replace(
  /feeType: feeType \|\| 'Per Author'\n\s*}/,
  "feeType: feeType || 'Per Author',\n        livePosEnabled: livePosEnabled === 'true' || livePosEnabled === true\n      }"
);

fs.writeFileSync('server/routes/api.js', apiContent);
console.log('Updated api.js for livePosEnabled');

// --- Update OperationsDashboardPage.tsx ---
let opsContent = fs.readFileSync('src/app/components/OperationsDashboardPage.tsx', 'utf8');

opsContent = opsContent.replace(
  /if \(target\.description\.value\) fd\.append\('description', target\.description\.value\);/,
  "if (target.description.value) fd.append('description', target.description.value);\n            fd.append('livePosEnabled', target.livePosEnabled.checked ? 'true' : 'false');"
);

const oldEventFeeTypeUI = `<div>
              <label className="dash-label">Fee Type</label>
              <select name="feeType" className="dash-input">
                <option value="Per Author">Per Author</option>
                <option value="Per Title">Per Title</option>
                <option value="Flat Fee">Flat Fee</option>
              </select>
            </div>`;

const newEventFeeTypeUI = `${oldEventFeeTypeUI}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" id="livePosEnabled" name="livePosEnabled" defaultChecked className="w-4 h-4 text-paa-navy border-gray-300 rounded focus:ring-paa-navy" />
            <label htmlFor="livePosEnabled" className="text-sm font-bold text-paa-navy">Enable Live POS for this Event</label>
            <p className="text-[10px] text-gray-500 ml-2">(If disabled, authors won't see the Launch POS button)</p>
          `;

// Be careful since oldEventFeeTypeUI is already inside a `<div className="grid grid-cols-2 gap-4">`.
// Let's replace just the feeType div with it and close the grid.
opsContent = opsContent.replace(oldEventFeeTypeUI, newEventFeeTypeUI);

// Now for editingEvent
opsContent = opsContent.replace(
  /<div>\n\s*<label className="dash-label">Fee Type<\/label>\n\s*<select className="dash-input" value={editingEvent.feeType} onChange={e => setEditingEvent\({...editingEvent, feeType: e.target.value}\)}>/,
  `<div>
                <label className="dash-label">Fee Type</label>
                <select className="dash-input" value={editingEvent.feeType} onChange={e => setEditingEvent({...editingEvent, feeType: e.target.value})}>`
);
// I can just use a similar string replace.
const oldEditFeeTypeUI = `<div>
                <label className="dash-label">Fee Type</label>
                <select className="dash-input" value={editingEvent.feeType} onChange={e => setEditingEvent({...editingEvent, feeType: e.target.value})}>
                  <option value="Per Author">Per Author</option>
                  <option value="Per Title">Per Title</option>
                  <option value="Flat Fee">Flat Fee</option>
                </select>
              </div>
            </div>`;

const newEditFeeTypeUI = `${oldEditFeeTypeUI}
            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" id="editLivePosEnabled" checked={editingEvent.livePosEnabled !== false} onChange={e => setEditingEvent({...editingEvent, livePosEnabled: e.target.checked})} className="w-4 h-4 text-paa-navy border-gray-300 rounded focus:ring-paa-navy" />
              <label htmlFor="editLivePosEnabled" className="text-sm font-bold text-paa-navy">Enable Live POS for this Event</label>
            </div>`;

opsContent = opsContent.replace(oldEditFeeTypeUI, newEditFeeTypeUI);

fs.writeFileSync('src/app/components/OperationsDashboardPage.tsx', opsContent);
console.log('Updated OperationsDashboardPage.tsx for livePosEnabled');
