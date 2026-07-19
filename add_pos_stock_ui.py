import os

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\LivePosDashboard.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add states
states_insertion = """  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [addStockBook, setAddStockBook] = useState<any>(null);
  const [addStockQty, setAddStockQty] = useState('1');
  const [isAddingStock, setIsAddingStock] = useState(false);"""
content = content.replace("  const [isProcessing, setIsProcessing] = useState(false);", states_insertion)

# 2. Add handleAddStock function
handle_add_stock = """
  const handleAddStock = async () => {
    if(!addStockBook) return;
    setIsAddingStock(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/events/${eventId}/add-stock`, {
        bookId: addStockBook.id,
        quantity: parseInt(addStockQty)
      }, { headers: { Authorization: `Bearer ${token}` }});
      toast.success('Stock added successfully!');
      setShowAddStockModal(false);
      setAddStockQty('1');
      fetchInventory();
    } catch(err: any) {
      toast.error(err.response?.data?.error || 'Failed to add stock');
    } finally {
      setIsAddingStock(false);
    }
  };

  const fetchInventory = async () => {"""
content = content.replace("  const fetchInventory = async () => {", handle_add_stock)

# 3. Add ADD button in the card
old_left = """<div className="text-[10px] text-paa-gray-text font-bold uppercase tracking-widest mt-1">{available} left</div>"""
new_left = """<div className="text-[10px] text-paa-gray-text font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
  {available} left
  <button onClick={(e) => { e.stopPropagation(); setAddStockBook(eb.book); setShowAddStockModal(true); }} className="text-paa-navy hover:text-paa-gold underline text-[9px] cursor-pointer">ADD</button>
</div>"""
content = content.replace(old_left, new_left)

# 4. Add the Add Stock Modal JSX
modal_jsx = """
      {/* Add Stock Modal */}
      {showAddStockModal && addStockBook && (
        <div className="fixed inset-0 bg-black/60 z-[400] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden flex flex-col p-6 animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-serif font-bold text-xl text-paa-navy">Add Event Stock</h3>
               <button onClick={() => setShowAddStockModal(false)} className="text-gray-400 hover:text-paa-navy"><X size={20}/></button>
            </div>
            <p className="text-sm text-gray-500 mb-6">How many copies of <span className="font-bold text-paa-navy">"{addStockBook.title}"</span> would you like to add to this event? (Will be deducted from main inventory).</p>
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-2">Quantity</label>
              <input 
                 type="number" 
                 className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-paa-navy transition-colors text-center font-bold text-lg" 
                 value={addStockQty} 
                 onChange={e => setAddStockQty(e.target.value)} 
                 min="1"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAddStockModal(false)} className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddStock} disabled={isAddingStock} className="flex-1 py-3 bg-paa-navy text-paa-cream rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors disabled:opacity-50">
                 {isAddingStock ? 'Adding...' : 'Add Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal */}
"""
content = content.replace("{/* Summary Modal */}", modal_jsx)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("POS UI updated with Add Stock.")
