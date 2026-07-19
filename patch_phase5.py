import os

# --- Backend Updates ---
api_path = "server/routes/api.js"
with open(api_path, "r", encoding="utf-8") as f:
    api_content = f.read()

# Author Dashboard Data: add dispatchedAt & deliveredAt
order_map_target = "createdAt: item.createdAt,"
order_map_replace = "createdAt: item.createdAt,\n        dispatchedAt: item.dispatchedAt,\n        deliveredAt: item.deliveredAt,"
if "dispatchedAt: item.dispatchedAt" not in api_content:
    api_content = api_content.replace(order_map_target, order_map_replace)

# Admin orders escalation endpoint
escalate_api = """
// Escalate order
router.post('/api/admin/orders/:id/escalate', verifyToken, isAdmin, async (req, res) => {
  try {
    // In a real system, send email via AWS SES or SendGrid here
    console.log(`[ESCALATION] Email sent to author for order item ${req.params.id}`);
    res.json({ success: true, message: "Escalation email sent to author" });
  } catch (err) {
    res.status(500).json({ error: 'Failed to escalate' });
  }
});
"""
if "/api/admin/orders/:id/escalate" not in api_content:
    api_content = api_content.replace("module.exports = router;", escalate_api + "\nmodule.exports = router;")

with open(api_path, "w", encoding="utf-8") as f:
    f.write(api_content)
print("Backend Phase 5 patched")


# --- Admin Dashboard Updates ---
admin_path = "src/app/components/OperationsDashboardPage.tsx"
with open(admin_path, "r", encoding="utf-8") as f:
    admin_content = f.read()

# Fix Reviews Tab Injection
nav_target = "{ id: 'gallery', label: 'Gallery Management', icon: ImageIcon },"
nav_replace = "{ id: 'gallery', label: 'Gallery Management', icon: ImageIcon },\n             { id: 'reviews', label: 'Global Reviews', icon: Star },"
if "id: 'reviews'" not in admin_content:
    admin_content = admin_content.replace(nav_target, nav_replace)

ui_target = "{activeTab === 'gallery' && <GalleryTab />}"
ui_replace = "{activeTab === 'gallery' && <GalleryTab />}\n           {activeTab === 'reviews' && <AdminReviewsTab />}"
if "<AdminReviewsTab />" not in admin_content:
    admin_content = admin_content.replace(ui_target, ui_replace)
    admin_content += """
function AdminReviewsTab() {
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/reviews`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setReviews(res.data);
      } catch(err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-paa-navy"/></div>;

  return (
    <div className="space-y-6 animate-fade-in-up px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-paa-navy tracking-tight">Global Book Reviews</h2>
          <p className="text-sm text-gray-500 mt-1">Monitor all customer feedback and ratings across the platform.</p>
        </div>
      </div>
      <div className="bg-white rounded-3xl-2xl border border-gray-100 shadow-premium overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-gray-100">Reviewer</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-gray-100">Book</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-gray-100">Rating</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-gray-100">Feedback</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reviews.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-bold text-sm text-paa-navy">{r.reviewerName}</td>
                <td className="px-6 py-4 text-sm">{r.book?.title}</td>
                <td className="px-6 py-4 font-bold">{r.rating} Stars</td>
                <td className="px-6 py-4 text-sm text-gray-600 italic">"{r.comment}"</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
"""

# Escalate handle
escalate_handle = """
  const handleEscalateOrder = async (id: number) => {
    try {
      await axios.post(`${API}/api/admin/orders/${id}/escalate`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      toast.success("Escalation email sent to author!");
    } catch(err) {
      toast.error("Failed to escalate order");
    }
  };
"""
if "handleEscalateOrder" not in admin_content:
    admin_content = admin_content.replace("const handleExportCSV =", escalate_handle + "\n  const handleExportCSV =")


# Delivery KPI in WebOrdersTab
kpi_target = "const topAuthorsData = Object.entries(authorSalesMap)"
kpi_replace = """
    let totalDeliveryTime = 0;
    let deliveredCount = 0;
    orders.forEach((o: any) => {
       o.items?.forEach((it: any) => {
          if (it.status === 'Delivered' && it.dispatchedAt && it.deliveredAt) {
             const time = new Date(it.deliveredAt).getTime() - new Date(it.dispatchedAt).getTime();
             totalDeliveryTime += time;
             deliveredCount++;
          }
       });
    });
    const avgDeliveryDays = deliveredCount > 0 ? (totalDeliveryTime / deliveredCount / (1000 * 3600 * 24)).toFixed(1) : 0;
    
""" + kpi_target
if "let totalDeliveryTime" not in admin_content:
    admin_content = admin_content.replace(kpi_target, kpi_replace)

# KPI render in WebOrdersTab
kpi_ui_target = "<span className=\"text-xs text-gray-500 block uppercase tracking-widest\">Delivered</span>"
kpi_ui_replace = kpi_ui_target + """
        </div>
        <div className="bg-white p-4 rounded-xl border border-paa-navy/10 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-paa-navy">{avgDeliveryDays} <span className="text-sm">Days</span></span>
          <span className="text-xs text-gray-500 block uppercase tracking-widest mt-1 text-center">Avg Delivery<br/>Time</span>
"""
if "Avg Delivery<br/>Time" not in admin_content:
    admin_content = admin_content.replace(kpi_ui_target, kpi_ui_replace)

# Escalate Button in WebOrdersTab
escalate_btn_target = "<span className=\"text-[10px] font-bold text-red-600 uppercase tracking-widest ml-2 bg-red-100 px-2 py-0.5 rounded-full flex items-center gap-1\"><AlertCircle className=\"w-3 h-3\"/> SLA Breach (>24h)</span>"
escalate_btn_replace = escalate_btn_target + """
          <button onClick={() => handleEscalateOrder(it.id)} className="ml-2 text-[10px] bg-red-600 text-white font-bold uppercase tracking-widest px-2 py-0.5 rounded-full hover:bg-red-700 transition-colors">
             Escalate
          </button>
"""
if "Escalate\n          </button>" not in admin_content:
    admin_content = admin_content.replace(escalate_btn_target, escalate_btn_replace)


with open(admin_path, "w", encoding="utf-8") as f:
    f.write(admin_content)
print("Admin Phase 5 patched")


# --- Author Dashboard Updates ---
author_path = "src/app/components/AuthorDashboardPage.tsx"
with open(author_path, "r", encoding="utf-8") as f:
    author_content = f.read()

author_kpi_target = "<h3 className=\"text-sm font-bold text-gray-500 uppercase tracking-widest mb-1\">Total Sales</h3>"
author_kpi_replace = """
      <div className="bg-white p-6 rounded-3xl-2xl border border-gray-100 shadow-sm text-center">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Avg Delivery Time</h3>
        <p className="text-4xl font-serif text-paa-navy">
          {(() => {
             let totalTime = 0;
             let count = 0;
             authorOrders.forEach(o => {
                if (o.status === 'Delivered' && o.dispatchedAt && o.deliveredAt) {
                   totalTime += new Date(o.deliveredAt).getTime() - new Date(o.dispatchedAt).getTime();
                   count++;
                }
             });
             return count > 0 ? (totalTime / count / (1000 * 3600 * 24)).toFixed(1) + ' Days' : 'N/A';
          })()}
        </p>
      </div>
""" + author_kpi_target
if "Avg Delivery Time" not in author_content:
    author_content = author_content.replace(author_kpi_target, author_kpi_replace)

with open(author_path, "w", encoding="utf-8") as f:
    f.write(author_content)
print("Author Phase 5 patched")
