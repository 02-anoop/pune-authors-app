const fs = require('fs');
let content = fs.readFileSync('src/app/components/AuthorDashboardPage.tsx', 'utf8');

// Add printFormat to newBook state
const newBookRegex = /const \[newBook, setNewBook\] = useState\(\{[\s\S]*?\}\);/g;
content = content.replace(newBookRegex, (match) => {
    if (!match.includes('printFormat:')) {
        return match.replace(/format: '',/, `format: '',\n    printFormat: '',`);
    }
    return match;
});

// Add whyJoining to editProfileForm
const editProfileFormRegex = /address: '', aadharNumber: '', qualification: '', age: '', experience: '', skills: '', hobbies: '',/g;
content = content.replace(editProfileFormRegex, `address: '', aadharNumber: '', qualification: '', age: '', experience: '', skills: '', hobbies: '', whyJoining: '',`);

const editProfileFormSet1Regex = /qualification: authorProfile.qualification \|\| '',\s*age: authorProfile.age \|\| '',\s*experience: authorProfile.experience \|\| '',\s*skills: authorProfile.skills \|\| '',\s*hobbies: authorProfile.hobbies \|\| '',/g;
content = content.replace(editProfileFormSet1Regex, (match) => {
    return match + `\n    whyJoining: authorProfile.whyJoining || '',`;
});

// Now we need to add the input fields to the JSX for editProfileForm
// Looking for hobbies input block
const hobbiesInputRegex = /<div>\s*<label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Hobbies<\/label>\s*<input className="dash-input w-full" value=\{editProfileForm\.hobbies\} onChange=\{e => setEditProfileForm\(\{\.\.\.editProfileForm, hobbies: e\.target\.value\}\)\} \/>\s*<\/div>\s*<\/div>/g;

const hobbiesInputReplacement = `<div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Hobbies</label>
                  <input className="dash-input w-full" value={editProfileForm.hobbies} onChange={e => setEditProfileForm({...editProfileForm, hobbies: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Why did you join the group? (Published Authors)</label>
                <textarea className="dash-input w-full resize-y" rows={2} value={editProfileForm.whyJoining} onChange={e => setEditProfileForm({...editProfileForm, whyJoining: e.target.value})} />
              </div>`;

content = content.replace(hobbiesInputRegex, hobbiesInputReplacement);

// Now for newBook form, add printFormat select field
const formatInputRegex = /<div>\s*<label className="dash-label">Format \*<\/label>\s*<select required className="dash-input" value=\{newBook\.format\} onChange=\{e => setNewBook\(\{\.\.\.newBook, format: e\.target\.value\}\)\}>\s*<option value="">Select Format<\/option>\s*<option value="Paperback">Paperback<\/option>\s*<option value="Hardcover">Hardcover<\/option>\s*<option value="Ebook">Ebook<\/option>\s*<\/select>\s*<\/div>/g;

const formatInputReplacement = `<div>
                    <label className="dash-label">Format *</label>
                    <select required className="dash-input" value={newBook.format} onChange={e => setNewBook({...newBook, format: e.target.value})}>
                      <option value="">Select Format</option>
                      <option value="Paperback">Paperback</option>
                      <option value="Hardcover">Hardcover</option>
                      <option value="Ebook">Ebook</option>
                    </select>
                  </div>
                  <div>
                    <label className="dash-label">Print Format *</label>
                    <select required className="dash-input" value={newBook.printFormat || ''} onChange={e => setNewBook({...newBook, printFormat: e.target.value})}>
                      <option value="">Select Print Format</option>
                      <option value="Black & White">Black & White</option>
                      <option value="Colored">Colored</option>
                    </select>
                  </div>`;

// Wait, the grid for ISBN, Edition, Format is grid-cols-3. Adding a 4th will wrap weirdly. Let's make it grid-cols-4 or just wrap.
const formatGridRegex = /<div className="grid grid-cols-1 md:grid-cols-3 gap-3">\s*<div>\s*<label className="dash-label">ISBN<\/label>/g;
content = content.replace(formatGridRegex, `<div className="grid grid-cols-1 md:grid-cols-4 gap-3">\n                  <div>\n                    <label className="dash-label">ISBN</label>`);

content = content.replace(formatInputRegex, formatInputReplacement);


fs.writeFileSync('src/app/components/AuthorDashboardPage.tsx', content);
console.log('Fixed Author Dashboard missing fields');
