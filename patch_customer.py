import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/CustomerProfilePage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add handleCancelOrder
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

# Add Cancel button in UI
if "Cancel Order</button>" not in content:
    cancel_btn = """
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e", fontFamily: "var(--font-display)" }}>Order Details</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {!selectedOrder.items?.some((i: any) => i.status === 'Dispatched' || i.status === 'Completed' || i.status === 'Cancelled') && (
                  <button onClick={() => handleCancelOrder(selectedOrder.id)} style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", padding: "0.4rem 0.8rem", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel Order</button>
                )}
                <button onClick={() => setSelectedOrder(null)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#6b6b80" }}>&times;</button>
              </div>
            </div>
"""
    content = re.sub(r'<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1\.5rem" }}>\s*<h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e", fontFamily: "var\(--font-display\)" }}>Order Details</h2>\s*<button onClick=\{\(\) => setSelectedOrder\(null\)\} style=\{\{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#6b6b80" \}\}>&times;</button>\s*</div>', cancel_btn, content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Customer patched")
