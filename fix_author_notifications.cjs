const fs = require('fs');
let content = fs.readFileSync('src/app/components/AuthorDashboardPage.tsx', 'utf8');

// Add notifications state
const stateRegex = /const \[authorProfile, setAuthorProfile\] = useState<any>\(null\);/g;
if (!content.includes("const [notifications, setNotifications]")) {
    content = content.replace(stateRegex, `const [authorProfile, setAuthorProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);`);
}

// Add fetch
const fetchRegex = /fetch\(\`\$\{import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:3001'\}\/api\/author\/me\`, \{ headers \}\)/g;
if (!content.includes("fetch(\`\${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/notifications\`)")) {
    content = content.replace(fetchRegex, `fetch(\`\${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/me\`, { headers }),
        fetch(\`\${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/notifications\`)`);
}

const resRegex = /const \[meRes\] = await Promise\.all\(\[/g;
if (!content.includes("notificationsRes")) {
    content = content.replace(resRegex, `const [meRes, notificationsRes] = await Promise.all([`);
    
    const setRegex = /setAuthorProfile\(await meRes\.json\(\)\);/g;
    content = content.replace(setRegex, `
        const profileData = await meRes.json();
        setAuthorProfile(profileData);
        if (notificationsRes && notificationsRes.ok) {
           const notifs = await notificationsRes.json();
           setNotifications(notifs.filter((n: any) => n.target === 'ALL' || n.target === profileData.name));
        }
    `);
}

// Add UI for notifications icon in the dashboard layout
const uiRegex = /<button onClick=\{handleLogout\} className="dash-btn dash-btn-ghost w-full">/g;
const notifBell = `
          {/* Notifications Panel */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-paa-navy/50 mb-3 px-3">Notifications</h3>
            <div className="space-y-2 px-3">
              {notifications.length === 0 ? (
                 <p className="text-xs text-gray-400 italic">No new notifications</p>
              ) : (
                 notifications.slice(0, 3).map(n => (
                   <div key={n.id} className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs text-blue-900 shadow-sm relative">
                     <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500"></span>
                     {n.message}
                   </div>
                 ))
              )}
            </div>
          </div>
`;

if (!content.includes("Notifications Panel")) {
    content = content.replace(uiRegex, notifBell + "\n          <button onClick={handleLogout} className=\"dash-btn dash-btn-ghost w-full\">");
}

fs.writeFileSync('src/app/components/AuthorDashboardPage.tsx', content);
console.log('Added Notifications to Author Dashboard');
