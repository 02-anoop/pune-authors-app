import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add activeTab state
if "const [activeTab, setActiveTab] = useState<'overview' | 'authors' | 'books' | 'events' | 'orders' | 'settings' | 'forms' | 'gallery' | 'author_data'>('overview');" in content:
    content = content.replace(
        "const [activeTab, setActiveTab] = useState<'overview' | 'authors' | 'books' | 'events' | 'orders' | 'settings' | 'forms' | 'gallery' | 'author_data'>('overview');",
        "const [activeTab, setActiveTab] = useState<'overview' | 'authors' | 'books' | 'events' | 'orders' | 'settings' | 'forms' | 'gallery' | 'author_data' | 'helpdesk'>('overview');"
    )

# 2. Add Helpdesk link to sidebar
sidebar_link = """            <button 
              onClick={() => setActiveTab('author_data')}
              className={`w-full text-left px-4 py-3 text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-3 ${activeTab === 'author_data' ? 'bg-paa-navy text-paa-cream' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <ClipboardList className="w-4 h-4" /> Author Extra Data
            </button>
            <button 
              onClick={() => setActiveTab('helpdesk')}
              className={`w-full text-left px-4 py-3 text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-3 ${activeTab === 'helpdesk' ? 'bg-paa-navy text-paa-cream' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Users className="w-4 h-4" /> Helpdesk / Queries
            </button>"""

if "Helpdesk / Queries" not in content:
    content = content.replace(
        """            <button 
              onClick={() => setActiveTab('author_data')}
              className={`w-full text-left px-4 py-3 text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-3 ${activeTab === 'author_data' ? 'bg-paa-navy text-paa-cream' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <ClipboardList className="w-4 h-4" /> Author Extra Data
            </button>""",
        sidebar_link
    )

# 3. Add HelpdeskTab rendering
tab_rendering = """           {activeTab === 'author_data' && <AuthorDataTab />}
           {activeTab === 'helpdesk' && <HelpdeskTab />}"""

if "<HelpdeskTab />" not in content:
    content = content.replace(
        "{activeTab === 'author_data' && <AuthorDataTab />}",
        tab_rendering
    )

# 4. Add HelpdeskTab component at the end of the file
helpdesk_component = """
const HelpdeskTab = () => {
  const [queries, setQueries] = useState<any[]>([]);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [isReplying, setIsReplying] = useState<{ [key: number]: boolean }>({});

  const fetchQueries = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/queries`, {
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

  const handleReply = async (id: number) => {
    if (!replyText[id]) return;
    setIsReplying({ ...isReplying, [id]: true });
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/queries/${id}/reply`, { reply: replyText[id] }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Reply sent successfully!');
      fetchQueries();
    } catch (err) {
      toast.error('Failed to send reply');
    } finally {
      setIsReplying({ ...isReplying, [id]: false });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
       <div className="bg-white p-6 border border-paa-navy/10 shadow-sm rounded">
          <div className="flex justify-between items-center mb-6 border-b border-paa-navy/10 pb-4">
             <div>
                <h3 className="text-xl font-serif font-medium text-paa-navy mb-1 flex items-center gap-2">
                   <Users className="w-5 h-5" /> Support Helpdesk
                </h3>
                <p className="text-paa-gray-text text-sm">Manage and respond to author queries.</p>
             </div>
             <button onClick={fetchQueries} className="p-2 border border-paa-navy/20 bg-gray-50 hover:bg-gray-100 rounded text-paa-navy transition-colors shadow-sm">
                <RefreshCw size={18} />
             </button>
          </div>
          
          <div className="space-y-6">
             {queries.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-8">No queries found.</p>
             ) : queries.map(q => (
                <div key={q.id} className="border border-gray-200 rounded p-6 bg-gray-50 shadow-sm">
                   <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                      <div>
                         <h4 className="font-bold text-paa-navy text-lg">{q.subject}</h4>
                         <p className="text-xs text-gray-500 mt-1">From: <span className="font-bold">{q.author?.name}</span> ({q.author?.email})</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded ${q.status === 'Answered' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                        {q.status}
                      </span>
                   </div>
                   <div className="bg-white p-4 rounded border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap mb-4 shadow-inner">
                      {q.message}
                   </div>

                   {q.status === 'Pending' ? (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                         <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-2">Write a Reply</label>
                         <textarea 
                           rows={3} 
                           placeholder="Type your reply here..." 
                           className="w-full border border-paa-navy/20 p-3 text-sm outline-none focus:border-paa-navy bg-white rounded resize-y mb-3 shadow-sm"
                           value={replyText[q.id] || ''}
                           onChange={e => setReplyText({ ...replyText, [q.id]: e.target.value })}
                         />
                         <button 
                           onClick={() => handleReply(q.id)} 
                           disabled={isReplying[q.id]}
                           className="px-6 py-2 bg-paa-navy text-white text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors rounded shadow-sm"
                         >
                           {isReplying[q.id] ? 'Sending...' : 'Send Reply'}
                         </button>
                      </div>
                   ) : (
                      <div className="mt-4 pt-4 border-t border-gray-200 bg-green-50/50 p-4 rounded">
                         <p className="text-xs font-bold uppercase tracking-widest text-paa-gold mb-2">Your Reply:</p>
                         <p className="text-sm text-gray-800 whitespace-pre-wrap">{q.reply}</p>
                      </div>
                   )}
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};
"""

if "const HelpdeskTab" not in content:
    content += "\n" + helpdesk_component

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
