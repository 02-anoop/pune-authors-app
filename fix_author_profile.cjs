const fs = require('fs');
let content = fs.readFileSync('c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorFullProfileView.tsx', 'utf8');

const strToFind = `                    <div className="mt-4"><span className="text-[10px] uppercase text-paa-gray-text block mb-1">Synopsis</span><p className="text-sm text-paa-navy font-medium whitespace-pre-wrap leading-relaxed">{b.synopsis}</p></div>
                  </div>
                </div>
              ))}`;

const replacement = `                    <div className="mt-4"><span className="text-[10px] uppercase text-paa-gray-text block mb-1">Synopsis</span><p className="text-sm text-paa-navy font-medium whitespace-pre-wrap leading-relaxed">{b.synopsis}</p></div>
                  </div>
                </div>
              ));
              })()}`;

if (content.includes(strToFind)) {
    content = content.replace(strToFind, replacement);
    fs.writeFileSync('c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorFullProfileView.tsx', content, 'utf8');
    console.log('Fixed AuthorFullProfileView syntax error.');
} else {
    console.log('Could not find string to replace.');
}
