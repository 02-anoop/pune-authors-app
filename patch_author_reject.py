import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add handleReject
if "handleReject" not in content:
    reject_fn = """
  const handleReject = async (id: number) => {
    const reason = prompt("Please provide a reason for rejecting this order (e.g. Out of stock):");
    if (!reason) return;
    setLoadingAction(id);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/order-items/${id}/reject`, { reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order Rejected');
      onRefresh();
    } catch (e) {
      toast.error('Failed to reject order');
    } finally {
      setLoadingAction(null);
    }
  };
"""
    content = content.replace(
        "const handleDispatch = async (id: number) => {",
        reject_fn + "\n  const handleDispatch = async (id: number) => {"
    )

    # Add REJECT button
    old_buttons = """                      {ord.status === 'Pending' && ord.paymentVerified && (
                        <button 
                          onClick={() => handleAccept(ord.id)}
                          disabled={loadingAction === ord.id}
                          className="bg-[#337ab7] text-white px-3 py-1 text-xs rounded shadow font-bold disabled:opacity-50 mt-2"
                        >
                          ACCEPT
                        </button>
                      )}"""
                      
    new_buttons = """                      {ord.status === 'Pending' && ord.paymentVerified && (
                        <div className="flex flex-col gap-2 mt-2">
                          <button 
                            onClick={() => handleAccept(ord.id)}
                            disabled={loadingAction === ord.id}
                            className="bg-[#337ab7] text-white px-3 py-1 text-xs rounded shadow font-bold disabled:opacity-50"
                          >
                            ACCEPT
                          </button>
                          <button 
                            onClick={() => handleReject(ord.id)}
                            disabled={loadingAction === ord.id}
                            className="bg-red-500 text-white px-3 py-1 text-xs rounded shadow font-bold disabled:opacity-50"
                          >
                            REJECT
                          </button>
                        </div>
                      )}"""
    content = content.replace(old_buttons, new_buttons)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Author reject patched")
