import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/CustomerProfilePage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add handleCancelOrder
if "handleCancelOrder" not in content:
    cancel_fn = """
  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm("Are you sure you want to cancel this order? This cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/orders/${orderId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Order cancelled successfully");
      setSelectedOrder(null);
      fetchProfile();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to cancel order");
    }
  };
"""
    content = content.replace("const handleAcknowledge =", cancel_fn + "\n  const handleAcknowledge =")

# 2. Add Cancel Order button
if "Cancel Order</button>" not in content:
    old_modal_header = """<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e", fontFamily: "var(--font-display)" }}>Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#6b6b80" }}>&times;</button>
            </div>"""
            
    new_modal_header = """<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e", fontFamily: "var(--font-display)" }}>Order Details</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {!selectedOrder.items?.some((i: any) => i.status === 'Dispatched' || i.status === 'Completed' || i.status === 'Cancelled') && (
                  <button onClick={() => handleCancelOrder(selectedOrder.id)} style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", padding: "0.4rem 0.8rem", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel Order</button>
                )}
                <button onClick={() => setSelectedOrder(null)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#6b6b80" }}>&times;</button>
              </div>
            </div>"""
    content = content.replace(old_modal_header, new_modal_header)

# 3. Add table row reject reason
if "item.status === 'Rejected' ? '#ef4444'" not in content:
    old_tbl_status = """                                    <span style={{ 
                                      background: item.status.includes('Pending') ? '#fffbeb' : item.status === 'Completed' ? '#f0fdf4' : '#eff6ff', 
                                      color: item.status.includes('Pending') ? '#d97706' : item.status === 'Completed' ? '#16a34a' : '#2563eb', 
                                      padding: "0.15rem 0.5rem", borderRadius: 4, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", marginLeft: "1rem"
                                    }}>
                                      {item.status}
                                    </span>"""
                                    
    new_tbl_status = """                                    <span style={{ 
                                      background: item.status.includes('Pending') ? '#fffbeb' : item.status === 'Completed' ? '#f0fdf4' : item.status === 'Rejected' ? '#fef2f2' : '#eff6ff', 
                                      color: item.status.includes('Pending') ? '#d97706' : item.status === 'Completed' ? '#16a34a' : item.status === 'Rejected' ? '#ef4444' : '#2563eb', 
                                      padding: "0.15rem 0.5rem", borderRadius: 4, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", marginLeft: "1rem"
                                    }}>
                                      {item.status}
                                    </span>
                                    {item.status === 'Rejected' && item.rejectionReason && (
                                      <div style={{ marginLeft: "1rem", marginTop: "0.2rem", fontSize: 10, color: "#ef4444" }}>Reason: {item.rejectionReason}</div>
                                    )}"""
    content = content.replace(old_tbl_status, new_tbl_status)

# 4. Add modal item reject reason
if "item.status === 'Rejected' ? '#fef2f2'" not in content:
    old_modal_status = """                    <span style={{ 
                      background: item.status.includes('Pending') ? '#fffbeb' : item.status === 'Completed' ? '#f0fdf4' : '#eff6ff', 
                      color: item.status.includes('Pending') ? '#d97706' : item.status === 'Completed' ? '#16a34a' : '#2563eb', 
                      padding: "0.3rem 0.8rem", borderRadius: 6, fontSize: 12, fontWeight: 700 
                    }}>
                      {item.status}
                    </span>
                  </div>"""
                  
    new_modal_status = """                    <span style={{ 
                      background: item.status.includes('Pending') ? '#fffbeb' : item.status === 'Completed' ? '#f0fdf4' : item.status === 'Rejected' ? '#fef2f2' : '#eff6ff', 
                      color: item.status.includes('Pending') ? '#d97706' : item.status === 'Completed' ? '#16a34a' : item.status === 'Rejected' ? '#ef4444' : '#2563eb', 
                      padding: "0.3rem 0.8rem", borderRadius: 6, fontSize: 12, fontWeight: 700 
                    }}>
                      {item.status}
                    </span>
                  </div>
                  {item.status === 'Rejected' && item.rejectionReason && (
                    <div style={{ padding: "0.75rem", background: "#fef2f2", borderLeft: "3px solid #ef4444", borderRadius: "0 6px 6px 0", fontSize: 13, color: "#991b1b", marginBottom: "1rem", marginTop: "1rem" }}>
                      <strong>Rejection Reason:</strong> {item.rejectionReason}
                    </div>
                  )}"""
    content = content.replace(old_modal_status, new_modal_status)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("CustomerProfile patched carefully")
