import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add "Support & Queries" link to navigation
if "/dashboard/queries" not in content:
    content = content.replace(
        """<Link to="/dashboard/events" className={`${location.pathname.includes('/events') ? 'text-paa-navy border-b-2 border-paa-navy' : 'text-gray-500 hover:text-paa-navy'} pb-1 transition-colors whitespace-nowrap`}>Events</Link>""",
        """<Link to="/dashboard/events" className={`${location.pathname.includes('/events') ? 'text-paa-navy border-b-2 border-paa-navy' : 'text-gray-500 hover:text-paa-navy'} pb-1 transition-colors whitespace-nowrap`}>Events</Link>
          <Link to="/dashboard/queries" className={`${location.pathname.includes('/queries') ? 'text-paa-navy border-b-2 border-paa-navy' : 'text-gray-500 hover:text-paa-navy'} pb-1 transition-colors whitespace-nowrap`}>Support & Queries</Link>"""
    )

# 2. Add route
if '<Route path="/queries" element={<AuthorQueriesTab />} />' not in content:
    content = content.replace(
        '<Route path="/events" element={<EventsDashboard registrations={dashboardData.authorProfile.eventRegistrations} />} />',
        '<Route path="/events" element={<EventsDashboard registrations={dashboardData.authorProfile.eventRegistrations} />} />\n          <Route path="/queries" element={<AuthorQueriesTab />} />'
    )

# 3. Add AuthorQueriesTab component at the end of the file
queries_component = """
function AuthorQueriesTab() {
  const [queries, setQueries] = useState<any[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQueries = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/queries`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setQueries(res.data);
    } catch (e) {
      toast.error('Failed to load queries');
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setIsSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/queries`, { subject, message }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Query submitted successfully!');
      setSubject('');
      setMessage('');
      fetchQueries();
    } catch (err) {
      toast.error('Failed to submit query');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
       <div className="bg-white p-6 border border-paa-navy/10 rounded shadow-sm">
          <h2 className="text-xl font-serif text-paa-navy mb-2">Raise a Query</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-6">Contact administration for support or royalty issues.</p>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
             <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Subject *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Question regarding July payout" 
                  className="w-full border border-paa-navy/20 p-3 text-sm outline-none focus:border-paa-navy bg-gray-50 rounded" 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)} 
                />
             </div>
             <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Message *</label>
                <textarea 
                  required 
                  rows={4}
                  placeholder="Describe your issue..." 
                  className="w-full border border-paa-navy/20 p-3 text-sm outline-none focus:border-paa-navy bg-gray-50 rounded resize-y" 
                  value={message} 
                  onChange={e => setMessage(e.target.value)} 
                />
             </div>
             <button disabled={isSubmitting} type="submit" className="px-6 py-2 bg-paa-navy text-white text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors rounded">
               {isSubmitting ? 'Submitting...' : 'Submit Query'}
             </button>
          </form>
       </div>

       <div className="bg-white p-6 border border-paa-navy/10 rounded shadow-sm">
          <h2 className="text-xl font-serif text-paa-navy mb-6">Past Queries</h2>
          {queries.length === 0 ? (
             <p className="text-sm text-gray-500 italic">You have not raised any queries yet.</p>
          ) : (
             <div className="space-y-4">
                {queries.map(q => (
                   <div key={q.id} className="border border-gray-200 rounded p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="font-bold text-paa-navy">{q.subject}</h3>
                         <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${q.status === 'Answered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                           {q.status}
                         </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-4 whitespace-pre-wrap">{q.message}</p>
                      
                      {q.reply && (
                         <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs font-bold uppercase tracking-widest text-paa-gold mb-1">Admin Reply:</p>
                            <p className="text-sm text-gray-800 bg-white p-3 border border-gray-100 rounded shadow-sm whitespace-pre-wrap">{q.reply}</p>
                         </div>
                      )}
                   </div>
                ))}
             </div>
          )}
       </div>
    </div>
  );
}
"""

if "function AuthorQueriesTab" not in content:
    content += "\n" + queries_component

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
