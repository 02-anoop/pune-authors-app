const fs = require('fs');
let content = fs.readFileSync('src/app/components/OperationsDashboardPage.tsx', 'utf8');

const tabRegex = /'Settings'\];/g;
if (!content.includes("'Notifications'")) {
    content = content.replace(tabRegex, `'Settings', 'Notifications'];`);
}

// Add state for notifications
const stateRegex = /const \[reportType, setReportType\] = useState\('orders'\);/g;
if (!content.includes("const [notifications, setNotifications]")) {
    content = content.replace(stateRegex, `const [reportType, setReportType] = useState('orders');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [newNotification, setNewNotification] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(-1);`);
}

// Add fetch for notifications
const fetchRegex = /fetch\(\`\$\{import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:3001'\}\/api\/admin\/forms\`, \{ headers: \{ 'Authorization': \`Bearer \$\{token\}\` \} \}\)/;
if (!content.includes("/api/notifications")) {
    content = content.replace(fetchRegex, `fetch(\`\${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/forms\`, { headers: { 'Authorization': \`Bearer \${token}\` } }),
          fetch(\`\${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/notifications\`)`);
}

const resRegex = /const \[formsRes\] = await Promise\.all\(\[/g;
if (!content.includes("notificationsRes")) {
    content = content.replace(resRegex, `const [formsRes, notificationsRes] = await Promise.all([`);
    
    const setRegex = /setForms\(await formsRes\.json\(\)\);/g;
    content = content.replace(setRegex, `setForms(await formsRes.json());\n        setNotifications(await notificationsRes.json());`);
}

// Add handle send notification
const handlersRegex = /const handleApproveBook = async \(id: number\) => \{/g;
const notifHandler = `
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotification.trim()) return;
    try {
      const token = localStorage.getItem('token');
      // basic parsing for target
      let target = 'ALL';
      const mentionMatch = newNotification.match(/@([a-zA-Z0-9_\\s]+)/);
      if (mentionMatch) {
         // naive target assignment for demonstration
         target = mentionMatch[1].trim();
      }
      
      const res = await fetch(\`\${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/notifications\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({ message: newNotification, target })
      });
      if (res.ok) {
        const notif = await res.json();
        setNotifications([notif, ...notifications]);
        setNewNotification('');
      } else {
        alert('Failed to send notification');
      }
    } catch(err) {
      console.error(err);
    }
  };
  
  const handleDeleteNotification = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(\`\${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/notifications/\${id}\`, {
        method: 'DELETE',
        headers: { 'Authorization': \`Bearer \${token}\` }
      });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch(err) {
      console.error(err);
    }
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewNotification(val);
    
    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);
    const mentionMatch = textBeforeCursor.match(/@(\\w*)$/);
    
    if (mentionMatch) {
       setMentionQuery(mentionMatch[1]);
       setShowMentionDropdown(true);
       setMentionIndex(textBeforeCursor.lastIndexOf('@'));
    } else {
       setShowMentionDropdown(false);
    }
  };

  const handleMentionSelect = (authorName: string) => {
    const before = newNotification.slice(0, mentionIndex);
    const after = newNotification.slice(mentionIndex + mentionQuery.length + 1);
    setNewNotification(before + '@' + authorName + ' ' + after);
    setShowMentionDropdown(false);
  };
`;

if (!content.includes("handleSendNotification")) {
    content = content.replace(handlersRegex, notifHandler + "\n  const handleApproveBook = async (id: number) => {");
}


// Add Notifications Tab UI
const uiRegex = /\{activeTab === 'Settings' && \(/g;
const notifUI = `
      {activeTab === 'Notifications' && (
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Global Notifications Broadcaster</h2>
          </div>
          <div className="dash-card-body">
             <div className="mb-8">
               <form onSubmit={handleSendNotification} className="flex flex-col gap-4 relative">
                 <label className="dash-label">Broadcast Message (Type @ to mention an author)</label>
                 <textarea 
                   className="dash-input min-h-[100px]" 
                   placeholder="Enter announcement or message... e.g., @JohnDoe your books are ready"
                   value={newNotification}
                   onChange={handleNotificationChange}
                 />
                 {showMentionDropdown && (
                   <div className="absolute top-[100%] mt-1 left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                     {authors.filter(a => a.name.toLowerCase().includes(mentionQuery.toLowerCase())).map(a => (
                        <div 
                          key={a.id} 
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium text-gray-800"
                          onClick={() => handleMentionSelect(a.name)}
                        >
                          {a.name} <span className="text-xs text-gray-400">({a.email})</span>
                        </div>
                     ))}
                   </div>
                 )}
                 <button type="submit" className="dash-btn dash-btn-primary self-start">Send Broadcast</button>
               </form>
             </div>
             
             <div>
               <h3 className="text-sm font-bold uppercase tracking-widest text-paa-navy mb-4 border-b border-paa-navy/10 pb-2">Recent Broadcasts</h3>
               <div className="space-y-3">
                 {notifications.length === 0 ? <p className="text-gray-500 text-sm">No notifications sent yet.</p> : null}
                 {notifications.map(n => (
                   <div key={n.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-start">
                     <div>
                       <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Target: {n.target}</div>
                       <p className="text-sm text-gray-800 whitespace-pre-wrap">{n.message}</p>
                       <div className="text-[10px] text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</div>
                     </div>
                     <button onClick={() => handleDeleteNotification(n.id)} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase p-2">Delete</button>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </div>
      )}
`;

if (!content.includes("activeTab === 'Notifications'")) {
    content = content.replace(uiRegex, notifUI + "\n      {activeTab === 'Settings' && (");
}

fs.writeFileSync('src/app/components/OperationsDashboardPage.tsx', content);
console.log('Added Notifications to Admin Dashboard');
