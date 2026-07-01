const fs = require('fs');
let content = fs.readFileSync('src/app/components/AuthorRegistrationPage.tsx', 'utf-8');

const diffHelpers = `
  const getDiffUi = (key: string) => {
    if (!isAdminEdit || !initialData?.extraData?.originalProfileData) return null;
    const origData = initialData.extraData.originalProfileData;
    const origVal = origData[key] !== undefined ? String(origData[key]) : "";
    const curVal = form[key] !== undefined ? String(form[key]) : "";
    if (origVal !== curVal) {
       return <div className="text-xs text-blue-600 mt-1 font-bold bg-blue-50 px-2 py-1 rounded inline-block shadow-sm border border-blue-100">Original: {origVal || '(empty)'}</div>;
    }
    return null;
  };
  
  const getDiffClass = (key: string) => {
    if (!isAdminEdit || !initialData?.extraData?.originalProfileData) return "";
    const origData = initialData.extraData.originalProfileData;
    const origVal = origData[key] !== undefined ? String(origData[key]) : "";
    const curVal = form[key] !== undefined ? String(form[key]) : "";
    if (origVal !== curVal) {
       return "!border-blue-500 ring-2 ring-blue-500/20";
    }
    return "";
  };
`;

if (!content.includes('getDiffUi')) {
  content = content.replace('const topRef = useRef<HTMLDivElement>(null);', diffHelpers + '\n  const topRef = useRef<HTMLDivElement>(null);');
}

// Regex to safely inject getDiffClass and getDiffUi into input fields
const fields = [
  'name', 'email', 'phone', 'address', 'city', 'pincode', 'aadharNumber', 'bio', 'penName'
];

fields.forEach(field => {
  // Replace the className for the input
  const classRegex = new RegExp(`className={\`dash-input w-full \\\${errors\\.${field} \\? '!border-red-500' : ''}\`}`);
  content = content.replace(classRegex, `className={\`dash-input w-full \${errors.${field} ? '!border-red-500' : ''} \${getDiffClass("${field}")}\`}`);
  
  // Also for textarea (bio)
  const bioClassRegex = new RegExp(`className={\`dash-input w-full resize-y \\\${errors\\.${field} \\? '!border-red-500' : ''}\`}`);
  content = content.replace(bioClassRegex, `className={\`dash-input w-full resize-y \${errors.${field} ? '!border-red-500' : ''} \${getDiffClass("${field}")}\`}`);

  // Inject getDiffUi after the error div
  const errorDivRegex = new RegExp(`({errors\\.${field} && <div className="text-red-500 text-xs mt-1 font-medium">{errors\\.${field}}</div>})`);
  if (content.match(errorDivRegex)) {
    content = content.replace(errorDivRegex, `$1\n                      {getDiffUi("${field}")}`);
  }
});

fs.writeFileSync('src/app/components/AuthorRegistrationPage.tsx', content);
console.log('Patched AuthorRegistrationPage.tsx');
