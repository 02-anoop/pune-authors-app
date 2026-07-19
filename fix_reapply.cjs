const fs = require('fs');
let content = fs.readFileSync('src/app/components/AuthorDashboardPage.tsx', 'utf8');

// 1. Highlight Rejection Reason more
content = content.replace(
  /\{rejectionReason && <p className="text-sm font-bold bg-white p-3 rounded-3xl-2xl border border-red-100">Reason: \{rejectionReason\}<\/p>\}/,
  `{rejectionReason && <div className="text-base font-bold bg-red-100 p-4 rounded-xl border-l-4 border-red-600 text-red-900 shadow-sm my-4"><strong className="uppercase tracking-widest text-xs block mb-1">Rejection Reason:</strong> {rejectionReason}</div>}`
);

// 2. Add new fields to reapplyForm state initialization
// Wait, reapplyForm state initialization is higher up in the component. Let's find it.
// It's likely near the top of the component: `const [reapplyForm, setReapplyForm] = useState({ ... })`
const oldReapplyState = `const [reapplyForm, setReapplyForm] = useState({
    name: name || '',
    phone: phone || '',
    whatsapp: extraData?.whatsapp || '',
    bio: bio || '',
    transactionId: transactionId || ''
  });`;
const newReapplyState = `const [reapplyForm, setReapplyForm] = useState({
    name: name || '',
    penName: extraData?.penName || '',
    phone: phone || '',
    whatsapp: extraData?.whatsapp || '',
    bio: bio || '',
    transactionId: transactionId || '',
    city: extraData?.city || '',
    state: extraData?.state || '',
    address: extraData?.address || '',
    aadharNumber: extraData?.aadharNumber || '',
    qualification: extraData?.qualification || '',
    age: extraData?.age || '',
    experience: extraData?.experience || '',
    skills: extraData?.skills || '',
    hobbies: extraData?.hobbies || '',
    instagram: extraData?.instagram || '',
    facebook: extraData?.facebook || ''
  });`;

// Because the original state might be slightly different, let's use a regex to replace it
content = content.replace(/const \[reapplyForm, setReapplyForm\] = useState\(\{[\s\S]*?\}\);/, newReapplyState);

// 3. Update the reapplyForm UI
const oldUIStart = `<div className="grid grid-cols-2 gap-4 text-sm mb-4">`;
const oldUIEnd = `<div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Bio</label>
                  <textarea rows={3} className="w-full border p-2 rounded-3xl-2xl" value={reapplyForm.bio} onChange={e => setReapplyForm({...reapplyForm, bio: e.target.value})} />
                </div>
              </div>`;

const newUI = `<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Name</label>
                  <input className="w-full border p-2 rounded-3xl-2xl" value={reapplyForm.name} onChange={e => setReapplyForm({...reapplyForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Pen Name</label>
                  <input className="w-full border p-2 rounded-3xl-2xl" value={reapplyForm.penName} onChange={e => setReapplyForm({...reapplyForm, penName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Phone</label>
                  <input className="w-full border p-2 rounded-3xl-2xl" value={reapplyForm.phone} onChange={e => setReapplyForm({...reapplyForm, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">WhatsApp</label>
                  <input className="w-full border p-2 rounded-3xl-2xl" value={reapplyForm.whatsapp} onChange={e => setReapplyForm({...reapplyForm, whatsapp: e.target.value})} />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Full Address</label>
                  <input className="w-full border p-2 rounded-3xl-2xl" value={reapplyForm.address} onChange={e => setReapplyForm({...reapplyForm, address: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">City</label>
                  <input className="w-full border p-2 rounded-3xl-2xl" value={reapplyForm.city} onChange={e => setReapplyForm({...reapplyForm, city: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">State</label>
                  <input className="w-full border p-2 rounded-3xl-2xl" value={reapplyForm.state} onChange={e => setReapplyForm({...reapplyForm, state: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Aadhar Number</label>
                  <input className="w-full border p-2 rounded-3xl-2xl" value={reapplyForm.aadharNumber} onChange={e => setReapplyForm({...reapplyForm, aadharNumber: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Transaction ID</label>
                  <input className="w-full border p-2 rounded-3xl-2xl" value={reapplyForm.transactionId} onChange={e => setReapplyForm({...reapplyForm, transactionId: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Qualification</label>
                  <input className="w-full border p-2 rounded-3xl-2xl" value={reapplyForm.qualification} onChange={e => setReapplyForm({...reapplyForm, qualification: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Age</label>
                  <input type="number" className="w-full border p-2 rounded-3xl-2xl" value={reapplyForm.age} onChange={e => setReapplyForm({...reapplyForm, age: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Experience</label>
                  <input className="w-full border p-2 rounded-3xl-2xl" value={reapplyForm.experience} onChange={e => setReapplyForm({...reapplyForm, experience: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Skills</label>
                  <input className="w-full border p-2 rounded-3xl-2xl" value={reapplyForm.skills} onChange={e => setReapplyForm({...reapplyForm, skills: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Hobbies</label>
                  <input className="w-full border p-2 rounded-3xl-2xl" value={reapplyForm.hobbies} onChange={e => setReapplyForm({...reapplyForm, hobbies: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Instagram</label>
                  <input className="w-full border p-2 rounded-3xl-2xl" value={reapplyForm.instagram} onChange={e => setReapplyForm({...reapplyForm, instagram: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Facebook</label>
                  <input className="w-full border p-2 rounded-3xl-2xl" value={reapplyForm.facebook} onChange={e => setReapplyForm({...reapplyForm, facebook: e.target.value})} />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Bio (150 words)</label>
                  <textarea rows={5} required className="w-full border p-2 rounded-3xl-2xl" value={reapplyForm.bio} onChange={e => setReapplyForm({...reapplyForm, bio: e.target.value})} />
                </div>
              </div>`;

content = content.replace(/<div className="grid grid-cols-2 gap-4 text-sm mb-4">[\s\S]*?<div className="col-span-2">[\s\S]*?<\/div>[\s\S]*?<\/div>/, newUI);

fs.writeFileSync('src/app/components/AuthorDashboardPage.tsx', content);
console.log('Fixed reapply form');
