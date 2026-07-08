const fs = require('fs');
let content = fs.readFileSync('c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx', 'utf8');

const oldStr = `    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">`;

const newStr = `    return (
      <>
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">`;

content = content.replace(oldStr, newStr);

const oldStr2 = `                );
            })()}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`;

const newStr2 = `                );
            })()}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`;

// Actually we just need to find the final </div> of the component and put </> before it.
// The component is function DashboardTab. The next component is LateAuthorsSystemTab.
const oldStr3 = `      </div>
    );
}

function LateAuthorsSystemTab({ data }: { data: any }) {`;

const newStr3 = `      </div>
      </>
    );
}

function LateAuthorsSystemTab({ data }: { data: any }) {`;

content = content.replace(oldStr3, newStr3);

fs.writeFileSync('c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx', content, 'utf8');
