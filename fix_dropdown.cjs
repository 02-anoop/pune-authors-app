const fs = require('fs');
let content = fs.readFileSync('src/app/components/AuthorDashboardPage.tsx', 'utf8');

// Add handleStatusChange
const handleStatusChangeCode = `
  const handleStatusChange = async (id: number, newStatus: string) => {
    setLoadingAction(id);
    try {
      const token = localStorage.getItem('token');
      if (newStatus === 'Dispatched') {
         const trackingNumber = prompt("Enter tracking number for dispatch (optional):");
         await axios.put(\`\${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/order-items/\${id}/dispatch\`, { trackingNumber: trackingNumber || 'N/A' }, {
           headers: { Authorization: \`Bearer \${token}\` }
         });
      } else {
         await axios.put(\`\${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/order-items/\${id}/status\`, { status: newStatus }, {
           headers: { Authorization: \`Bearer \${token}\` }
         });
      }
      toast.success('Order status updated to ' + newStatus);
      onRefresh();
    } catch (e) {
      toast.error('Failed to update status');
    } finally {
      setLoadingAction(null);
    }
  };
`;

if (!content.includes('handleStatusChange = async')) {
  content = content.replace('const handleDispatch = async', handleStatusChangeCode + '\n  const handleDispatch = async');
}

// Replace the UI action area
const targetUIStart = `                      {/* Invoice button for all approved/dispatched orders */}`;
const targetUIEnd = `                        </div>\r\n                      )}`;
let targetUI = content.substring(content.indexOf(targetUIStart), content.indexOf(targetUIEnd) + targetUIEnd.length);

if (!targetUI || targetUI.length < 50) {
    const targetUIEndLF = `                        </div>\n                      )}`;
    targetUI = content.substring(content.indexOf(targetUIStart), content.indexOf(targetUIEndLF) + targetUIEndLF.length);
}

const newUI = `                      {/* Status Dropdown for approved orders */
                      (ord.status === 'Accepted' || ord.status === 'Dispatched' || ord.status === 'Delivered' || ord.status === 'Completed') && (
                        <div className="flex flex-col gap-2 items-center">
                          <select 
                            className="dash-input text-[10px] py-1 px-2 uppercase font-bold" 
                            value={ord.status === 'Completed' ? 'Delivered' : ord.status} 
                            disabled={loadingAction === ord.id}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          >
                            <option value="Accepted">Accepted</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </div>
                      )}`;

content = content.replace(targetUI, newUI);

// Remove the setTimeout for auto-printing the invoice in handleApprove
content = content.replace(/\/\/ Auto-open invoice after approval[\s\S]*?setTimeout\(\(\) => generateAndPrintInvoice\(id\), 800\);/, '');

fs.writeFileSync('src/app/components/AuthorDashboardPage.tsx', content);
console.log('Fixed dropdown');
