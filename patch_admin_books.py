import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add selectedBookDetails state
if "const [selectedBookDetails, setSelectedBookDetails] = useState<any>(null);" not in content:
    content = content.replace(
        "const [activeTab, setActiveTab] = useState<'overview' | 'authors' | 'books' | 'events' | 'orders' | 'settings' | 'forms' | 'gallery' | 'author_data'>('overview');",
        "const [activeTab, setActiveTab] = useState<'overview' | 'authors' | 'books' | 'events' | 'orders' | 'settings' | 'forms' | 'gallery' | 'author_data'>('overview');\n  const [selectedBookDetails, setSelectedBookDetails] = useState<any>(null);"
    )

# 2. Add the Eye button to the actions cell
old_actions_cell = """                       {book.status !== 'Rejected' && (
                         <button onClick={() => handleRejectBook(book.id)} className="p-1.5 text-white bg-orange-500 hover:bg-orange-600 border border-[transparent] shadow" title="Reject">
                           <X className="w-4 h-4" />
                         </button>
                       )}
                                                      <button onClick={() => handleEditBookClick(book)} className="p-1.5 text-white bg-blue-500 hover:bg-blue-600 border border-[transparent] shadow" title="Edit Details">
                          <Edit className="w-4 h-4" />"""

new_actions_cell = """                       {book.status !== 'Rejected' && (
                         <button onClick={() => handleRejectBook(book.id)} className="p-1.5 text-white bg-orange-500 hover:bg-orange-600 border border-[transparent] shadow" title="Reject">
                           <X className="w-4 h-4" />
                         </button>
                       )}
                       <button onClick={() => setSelectedBookDetails(book)} className="p-1.5 text-white bg-purple-500 hover:bg-purple-600 border border-[transparent] shadow" title="View Details">
                         <Eye className="w-4 h-4" />
                       </button>
                       <button onClick={() => handleEditBookClick(book)} className="p-1.5 text-white bg-blue-500 hover:bg-blue-600 border border-[transparent] shadow" title="Edit Details">
                          <Edit className="w-4 h-4" />"""

if 'setSelectedBookDetails(book)' not in content:
    content = content.replace(old_actions_cell, new_actions_cell)

# 3. Add the Book Details Modal at the end of the main return block
modal_code = """
      {/* Book Details Modal */}
      {selectedBookDetails && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
           <div className="bg-white max-w-2xl w-full rounded border border-paa-navy/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-[#b3d4ff] p-4 flex justify-between items-center border-b border-paa-navy/10">
                 <h2 className="font-bold text-sm tracking-widest uppercase text-paa-navy">Book Details</h2>
                 <button onClick={() => setSelectedBookDetails(null)} className="text-paa-navy hover:text-black">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6">
                 <div className="flex flex-col md:flex-row gap-6">
                    {/* Cover Image */}
                    <div className="w-full md:w-1/3 shrink-0">
                       {selectedBookDetails.coverUrl ? (
                         <img 
                           src={import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + selectedBookDetails.coverUrl : "http://localhost:3001" + selectedBookDetails.coverUrl} 
                           alt={selectedBookDetails.title} 
                           className="w-full h-auto object-cover rounded shadow-sm border border-gray-200"
                         />
                       ) : (
                         <div className="w-full aspect-[2/3] bg-gray-100 flex items-center justify-center rounded border border-gray-200 text-gray-400">
                           <BookOpen size={48} />
                         </div>
                       )}
                    </div>
                    {/* Details */}
                    <div className="flex-1 space-y-4">
                       <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Title</p>
                          <p className="text-xl font-serif text-paa-navy font-medium">{selectedBookDetails.title}</p>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Author</p>
                             <p className="text-sm font-medium text-paa-navy">{selectedBookDetails.authorName}</p>
                          </div>
                          <div>
                             <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Genre</p>
                             <p className="text-sm font-medium text-paa-navy">{selectedBookDetails.genre} {selectedBookDetails.subGenre && `(${selectedBookDetails.subGenre})`}</p>
                          </div>
                          <div>
                             <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">MRP</p>
                             <p className="text-sm font-medium text-paa-navy">₹{selectedBookDetails.mrp}</p>
                          </div>
                          <div>
                             <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Current Stock</p>
                             <p className="text-sm font-medium text-paa-navy">{selectedBookDetails.stock}</p>
                          </div>
                          <div>
                             <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Pages</p>
                             <p className="text-sm font-medium text-paa-navy">{selectedBookDetails.pages || 'N/A'}</p>
                          </div>
                          <div>
                             <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Status</p>
                             <span className={`inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${selectedBookDetails.status === 'Approved' ? 'bg-[#5cb85c] text-white border-[#4cae4c]' : selectedBookDetails.status === 'Rejected' ? 'bg-[#d9534f] text-white border-[#c9302c]' : 'bg-[#f0ad4e] text-white border-[#eea236]'}`}>
                               {selectedBookDetails.status}
                             </span>
                          </div>
                       </div>
                    </div>
                 </div>
                 
                 <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Synopsis</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded border border-gray-100">{selectedBookDetails.synopsis}</p>
                 </div>
              </div>
           </div>
        </div>
      )}
"""

if "selectedBookDetails && (" not in content:
    content = content.replace(
        '<Modal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} title="Edit Book">',
        modal_code + '\n      <Modal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} title="Edit Book">'
    )

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
