import re
import os

backend_file = "c:/Users/arvin/Desktop/pune-authors-app/server/index.js"
with open(backend_file, "r", encoding="utf-8") as f:
    backend_content = f.read()

# Add reject endpoint right after the accept endpoint
if "'/api/order-items/:id/reject'" not in backend_content:
    reject_route = """
app.put('/api/order-items/:id/reject', verifyToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const orderItem = await prisma.orderItem.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'Rejected', rejectionReason: reason },
      include: { order: true, book: true }
    });
    if (orderItem.order && orderItem.order.customerEmail) {
       await sendNotificationEmail(orderItem.order.customerEmail, 'Order Item Rejected', `Your order for book "${orderItem.book.title}" was rejected by the author. Reason: ${reason}`);
    }
    res.json(orderItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reject order' });
  }
});
"""
    backend_content = backend_content.replace(
        "app.put('/api/order-items/:id/accept', verifyToken, async (req, res) => {",
        reject_route + "\napp.put('/api/order-items/:id/accept', verifyToken, async (req, res) => {"
    )
    with open(backend_file, "w", encoding="utf-8") as f:
        f.write(backend_content)
    print("Backend patched")

frontend_author = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx"
with open(frontend_author, "r", encoding="utf-8") as f:
    author_content = f.read()

if "handleRejectOrder" not in author_content:
    reject_fn = """
  const handleRejectOrder = async (id: number) => {
    const reason = prompt("Please provide a reason for rejecting this order:");
    if (!reason) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/order-items/${id}/reject`, { reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDashboardData();
    } catch (err) {
      alert("Failed to reject order");
    }
  };
"""
    author_content = author_content.replace(
        "const handleAcceptOrder = async (id: number) => {",
        reject_fn + "\n  const handleAcceptOrder = async (id: number) => {"
    )
    
    # Add reject button in UI
    # Find: <button onClick={() => handleAcceptOrder(order.id)} ...>Accept</button>
    reject_btn = """<button onClick={() => handleAcceptOrder(order.id)} className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold hover:bg-green-200">Accept</button>
                    <button onClick={() => handleRejectOrder(order.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-xs font-semibold hover:bg-red-200">Reject</button>"""
    author_content = re.sub(
        r'<button onClick=\{\(\) => handleAcceptOrder\(order\.id\)\}.*?>Accept</button>',
        reject_btn,
        author_content
    )
    with open(frontend_author, "w", encoding="utf-8") as f:
        f.write(author_content)
    print("AuthorDashboard patched")

frontend_customer = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/CustomerProfilePage.tsx"
with open(frontend_customer, "r", encoding="utf-8") as f:
    customer_content = f.read()

if "rejectionReason" not in customer_content:
    reject_ui = """
                    <span style={{ 
                      background: item.status.includes('Pending') ? '#fffbeb' : item.status === 'Completed' ? '#f0fdf4' : item.status === 'Rejected' ? '#fef2f2' : '#eff6ff', 
                      color: item.status.includes('Pending') ? '#d97706' : item.status === 'Completed' ? '#16a34a' : item.status === 'Rejected' ? '#ef4444' : '#2563eb', 
                      padding: "0.3rem 0.8rem", borderRadius: 6, fontSize: 12, fontWeight: 700 
                    }}>
                      {item.status}
                    </span>
                  </div>
                  {item.status === 'Rejected' && item.rejectionReason && (
                    <div style={{ padding: "0.75rem", background: "#fef2f2", borderLeft: "3px solid #ef4444", borderRadius: "0 6px 6px 0", fontSize: 13, color: "#991b1b", marginBottom: "1rem" }}>
                      <strong>Rejection Reason:</strong> {item.rejectionReason}
                    </div>
                  )}
"""
    customer_content = re.sub(
        r'<span style=\{\{.*?\}\}>\s*\{item\.status\}\s*</span>\s*</div>',
        reject_ui,
        customer_content,
        flags=re.DOTALL
    )

    # Also update the table view
    reject_tbl_ui = """
                                      <span style={{ 
                                      background: item.status.includes('Pending') ? '#fffbeb' : item.status === 'Completed' ? '#f0fdf4' : item.status === 'Rejected' ? '#fef2f2' : '#eff6ff', 
                                      color: item.status.includes('Pending') ? '#d97706' : item.status === 'Completed' ? '#16a34a' : item.status === 'Rejected' ? '#ef4444' : '#2563eb', 
                                      padding: "0.15rem 0.5rem", borderRadius: 4, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", marginLeft: "1rem"
                                    }}>
                                      {item.status}
                                    </span>
                                    {item.status === 'Rejected' && item.rejectionReason && (
                                      <div style={{ marginLeft: "1rem", marginTop: "0.2rem", fontSize: 10, color: "#ef4444" }}>Reason: {item.rejectionReason}</div>
                                    )}
"""
    customer_content = re.sub(
        r'<span style=\{\{.*?padding: "0\.15rem 0\.5rem".*?\}\}>\s*\{item\.status\}\s*</span>',
        reject_tbl_ui,
        customer_content,
        flags=re.DOTALL
    )
    with open(frontend_customer, "w", encoding="utf-8") as f:
        f.write(customer_content)
    print("CustomerProfile patched")
