import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/CustomerProfilePage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add states for queries
if "const [queries, setQueries] = useState<any[]>([]);" not in content:
    content = content.replace(
        "const [acknowledging, setAcknowledging] = useState<number | null>(null);",
        "const [acknowledging, setAcknowledging] = useState<number | null>(null);\n  const [queries, setQueries] = useState<any[]>([]);\n  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);\n  const [querySubject, setQuerySubject] = useState('');\n  const [queryMessage, setQueryMessage] = useState('');\n  const [isSubmittingQuery, setIsSubmittingQuery] = useState(false);"
    )

# 2. Add fetchQueries to fetchProfile
old_fetch_profile_end = """        setLoading(false);
      })"""
new_fetch_profile_end = """        setLoading(false);
        fetchQueries();
      })"""
if "fetchQueries();" not in content:
    content = content.replace(old_fetch_profile_end, new_fetch_profile_end)

# 3. Add fetchQueries and handleCreateQuery functions
queries_functions = """
  const fetchQueries = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/customer/queries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQueries(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!querySubject || !queryMessage) return;
    setIsSubmittingQuery(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/customer/queries`, {
        subject: querySubject, message: queryMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsQueryModalOpen(false);
      setQuerySubject('');
      setQueryMessage('');
      fetchQueries();
      alert("Query submitted successfully!");
    } catch (err) {
      alert("Failed to submit query");
    } finally {
      setIsSubmittingQuery(false);
    }
  };

  const openQueryForOrder = (orderId: number) => {
    setQuerySubject(`Issue with Order #${orderId}`);
    setQueryMessage('');
    setIsQueryModalOpen(true);
  };
"""

if "const fetchQueries" not in content:
    content = content.replace("const handleAcknowledge", queries_functions + "\n  const handleAcknowledge")

# 4. Add the "Raise Query" button next to Orders
# Need to find where the order is rendered.
# Usually it maps over `orders`
# Let's just add it inside the order card or next to `handleCancelOrder`.
# We know there's a selectedOrder modal. Let's add it to the top of the UI somewhere.

# Let's search for the mapped orders list.
old_order_actions = """                          <button onClick={() => handleCancelOrder(order.id)} className="w-full py-2 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-colors">
                            Cancel Order
                          </button>"""

new_order_actions = """                          <button onClick={() => handleCancelOrder(order.id)} className="w-full py-2 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-colors">
                            Cancel Order
                          </button>
                        )}
                        <button onClick={() => openQueryForOrder(order.id)} className="w-full py-2 mt-2 bg-paa-navy/5 text-paa-navy text-xs font-bold uppercase tracking-widest hover:bg-paa-navy/10 transition-colors flex justify-center items-center gap-2">
                           <MessageSquare className="w-4 h-4" /> Raise Support Query
                        </button>
                        {order.status !== 'Pending' && order.status !== 'Cancelled' && (
                           <span className="hidden">"""
if "openQueryForOrder" not in content and "handleCancelOrder" in content:
    # Actually, let's just do a safer replace that adds the Support queries section and modal.
    pass

# We will add a "Support Queries" section to the Profile page body and the Modal.
queries_section = """
        {/* Support Queries Section */}
        <div className="bg-white border shadow-sm p-6 mt-8">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-serif text-paa-navy font-medium">Support Queries</h2>
              <button onClick={() => { setQuerySubject(''); setQueryMessage(''); setIsQueryModalOpen(true); }} className="px-4 py-2 bg-paa-navy text-white text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors">
                Raise New Query
              </button>
           </div>
           
           {queries.length === 0 ? (
              <p className="text-sm text-gray-500 italic">You have no open queries.</p>
           ) : (
              <div className="space-y-4">
                 {queries.map(q => (
                    <div key={q.id} className="border border-gray-200 p-4 bg-gray-50">
                       <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-paa-navy">{q.subject}</h3>
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${q.status === 'Answered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {q.status}
                          </span>
                       </div>
                       <p className="text-sm text-gray-700 whitespace-pre-wrap">{q.message}</p>
                       {q.reply && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                             <p className="text-xs font-bold uppercase tracking-widest text-paa-gold mb-1">Admin Reply:</p>
                             <p className="text-sm text-gray-800 bg-white p-3 border border-gray-100 whitespace-pre-wrap">{q.reply}</p>
                          </div>
                       )}
                    </div>
                 ))}
              </div>
           )}
        </div>
"""

# Let's put this section after the Orders section
if "Support Queries Section" not in content:
    content = content.replace(
        "        {/* Support Queries */} <!-- I will replace the end of the container -->", ""
    )
    # The structure is usually `<div className="lg:col-span-2 space-y-6"> ... Orders ... </div>`
    content = content.replace("</div>\n      </div>\n    </div>", queries_section + "\n      </div>\n      </div>\n    </div>")

# Add the Modal
query_modal = """
      {/* Query Modal */}
      {isQueryModalOpen && (
        <div className="fixed inset-0 bg-paa-navy/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6">
            <h2 className="text-xl font-serif text-paa-navy mb-6">Raise a Query</h2>
            <form onSubmit={handleCreateQuery} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Subject / Order ID *</label>
                <input required type="text" value={querySubject} onChange={e => setQuerySubject(e.target.value)} className="w-full border p-2 text-sm outline-none" placeholder="e.g. Issue with Order #123" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">Message *</label>
                <textarea required rows={4} value={queryMessage} onChange={e => setQueryMessage(e.target.value)} className="w-full border p-2 text-sm outline-none resize-y" placeholder="Describe your issue..." />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsQueryModalOpen(false)} className="flex-1 py-2 bg-gray-200 text-xs font-bold uppercase">Cancel</button>
                <button type="submit" disabled={isSubmittingQuery} className="flex-1 py-2 bg-paa-navy text-white text-xs font-bold uppercase hover:bg-paa-gold hover:text-paa-navy">{isSubmittingQuery ? 'Submitting...' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
"""

if "Query Modal" not in content:
    content = content.replace("return (", "return (\n" + query_modal, 1)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
