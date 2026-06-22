import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update report state variables
if "const [pendingReportStatus, setPendingReportStatus]" not in content:
    content = content.replace(
        "const [eventReportData, setEventReportData] = useState<any[]>([]);",
        "const [eventReportData, setEventReportData] = useState<any[]>([]);\n  const [pendingReportStatus, setPendingReportStatus] = useState<any>(null);"
    )

# 2. Update fetchEventReport to handle the pending status
old_fetch_report = """    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/events/${eventId}/report`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEventReportData(res.data);
      setReportEventId(eventId);
    } catch (err) {
      toast.error('Failed to load event report');
    }"""

new_fetch_report = """    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/events/${eventId}/report`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.status === 'pending') {
         setPendingReportStatus(res.data);
         setEventReportData([]);
      } else {
         setPendingReportStatus(null);
         setEventReportData(res.data.data);
      }
      setReportEventId(eventId);
    } catch (err) {
      toast.error('Failed to load event report');
    }"""

if "setPendingReportStatus(res.data);" not in content:
    content = content.replace(old_fetch_report, new_fetch_report)

# 3. Add notify settlement function
notify_code = """
  const handleNotifySettlement = async () => {
     try {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/events/${reportEventId}/notify-settlement`, {}, {
           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success("Notification emails sent to all pending authors!");
     } catch (err) {
        toast.error("Failed to notify authors");
     }
  };
"""

if "handleNotifySettlement" not in content:
    content = content.replace("  const fetchEventReport", notify_code + "\n  const fetchEventReport")

# 4. Update the Report Modal JSX to display the pending state
old_modal_inner = """            <div className="p-6 overflow-y-auto flex-1">
               {eventReportData[0]?.isLegacySummary ? ("""

new_modal_inner = """            <div className="p-6 overflow-y-auto flex-1">
               {pendingReportStatus ? (
                  <div className="text-center p-8 bg-gray-50 border border-paa-navy/10 rounded">
                     <h3 className="text-2xl font-serif text-paa-navy mb-2">Awaiting Author Settlements</h3>
                     <p className="text-sm text-gray-500 mb-6">The detailed report cannot be generated because the following authors have not yet submitted their post-event inventory counts:</p>
                     <div className="flex flex-wrap gap-2 justify-center mb-8">
                        {pendingReportStatus.missingAuthors.map((a: any) => (
                           <span key={a.id} className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200">{a.name}</span>
                        ))}
                     </div>
                     <button onClick={handleNotifySettlement} className="bg-paa-navy text-paa-cream px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors">Notify Pending Authors</button>
                  </div>
               ) : eventReportData[0]?.isLegacySummary ? ("""

if "Awaiting Author Settlements" not in content:
    content = content.replace(old_modal_inner, new_modal_inner)

# 5. Fix the Blinking Logic to only blink on INCREASES and stop on click
# First, add refs
if "const prevCountsRef = useRef" not in content:
    content = content.replace(
        "const [pendingAlerts, setPendingAlerts] = useState({ orders: false, queries: false, authors: false, books: false });",
        "const [pendingAlerts, setPendingAlerts] = useState({ orders: false, queries: false, authors: false, books: false });\n  const prevCountsRef = React.useRef({ orders: 0, queries: 0, authors: 0, books: 0 });"
    )

# Then, replace the fetch logic
# Authors
content = re.sub(
    r"setPendingAlerts\(prev => \(\{ \.\.\.prev, authors: res\.data\.some\(\(a: any\) => a\.status === 'Pending'\) \}\)\);",
    "const c = res.data.filter((a: any) => a.status === 'Pending').length; if (c > prevCountsRef.current.authors) setPendingAlerts(prev => ({ ...prev, authors: true })); prevCountsRef.current.authors = c;",
    content
)
# Books
content = re.sub(
    r"setPendingAlerts\(prev => \(\{ \.\.\.prev, books: res\.data\.some\(\(b: any\) => b\.status === 'Pending'\) \}\)\);",
    "const c = res.data.filter((b: any) => b.status === 'Pending').length; if (c > prevCountsRef.current.books) setPendingAlerts(prev => ({ ...prev, books: true })); prevCountsRef.current.books = c;",
    content
)
# Orders
content = re.sub(
    r"setPendingAlerts\(prev => \(\{ \.\.\.prev, orders: res\.data\.some\(\(o: any\) => o\.status === 'Pending'\) \}\)\);",
    "const c = res.data.filter((o: any) => o.status === 'Pending').length; if (c > prevCountsRef.current.orders) setPendingAlerts(prev => ({ ...prev, orders: true })); prevCountsRef.current.orders = c;",
    content
)
# Queries
content = re.sub(
    r"setPendingAlerts\(prev => \(\{ \.\.\.prev, queries: res\.data\.some\(\(q: any\) => q\.status === 'Pending'\) \}\)\);",
    "const c = res.data.filter((q: any) => q.status === 'Pending').length; if (c > prevCountsRef.current.queries) setPendingAlerts(prev => ({ ...prev, queries: true })); prevCountsRef.current.queries = c;",
    content
)

# 6. Clear alert when tab is clicked
content = content.replace("setActiveTab('authors')", "setActiveTab('authors'); setPendingAlerts(prev => ({...prev, authors: false}))")
content = content.replace("setActiveTab('books')", "setActiveTab('books'); setPendingAlerts(prev => ({...prev, books: false}))")
content = content.replace("setActiveTab('orders')", "setActiveTab('orders'); setPendingAlerts(prev => ({...prev, orders: false}))")
content = content.replace("setActiveTab('helpdesk')", "setActiveTab('helpdesk'); setPendingAlerts(prev => ({...prev, queries: false}))")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
