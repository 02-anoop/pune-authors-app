const fs = require('fs');

let content = fs.readFileSync('src/app/components/AuthorRegistrationPage.tsx', 'utf8');

const target = `                        <div>
                          <div className="font-bold text-paa-navy text-sm mb-0.5">{b.title}</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text">{b.genre} {b.subcategory && \`> \${b.subcategory}\`}</div>
                        </div>`;

const replacement = `                        <div>
                          <div className="font-bold text-paa-navy text-sm mb-0.5">
                             {b.title}
                             {b.isOverpriced && <span className="ml-2 bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Overpriced</span>}
                          </div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text">{b.genre} {b.subcategory && \`> \${b.subcategory}\`}</div>
                        </div>`;

content = content.replace(target, replacement);

fs.writeFileSync('src/app/components/AuthorRegistrationPage.tsx', content);
console.log('Added overpriced badge to added books map.');
