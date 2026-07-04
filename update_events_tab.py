import os

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1. Add handleEditAuthorData before selectedEventBreakdown check
handleEditAuthorData = """
    const handleEditAuthorData = (author: any) => {
        setSelectedAuthorForData(author);
        setManageAuthorBooks((author.books || []).map((b: any) => ({
            bookId: b.id,
            title: b.title,
            mrp: parseFloat(b.mrp) || 0,
            isSelected: true,
            listedStock: 0,
            soldStock: 0,
            returnedStock: 0
        })));
    };

    const handlePublishData = async () => {
        try {
            setIsPublishingData(true);
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/events/${selectedEventBreakdown.id}/author/${selectedAuthorForData.id}/publish`, {
                registrationStatus: manageRegStatus,
                paymentStatus: managePaymentStatus,
                booksData: manageAuthorBooks
            }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            toast.success('Data Published! The author will now see these metrics in their dashboard.');
            setIsPublishingData(false);
        } catch (err) {
            toast.error('Failed to publish data.');
            setIsPublishingData(false);
        }
    };
"""

for i, line in enumerate(lines):
    if 'if (selectedEventBreakdown) {' in line:
        lines.insert(i, handleEditAuthorData)
        break

# 2. Replace the old map over author.books with manageAuthorBooks
map_start = -1
map_end = -1
for i, line in enumerate(lines):
    if '{(selectedAuthorForData.books || [{title: \'Example Book Title\'}]).map((book: any, idx: number) => (' in line:
        map_start = i
        break

for i in range(map_start, len(lines)):
    if '))} ' in lines[i] or '))}</div>' in lines[i] or '))} ' in lines[i] + ' ' or '))} ' in lines[i] or lines[i].strip() == '))}':
        map_end = i
        break

new_map_block = """
                        {manageAuthorBooks.map((book: any, idx: number) => {
                          const revenue = book.mrp * (book.soldStock || 0);
                          return (
                          <div key={idx} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm hover:shadow transition-shadow">
                             <div className="flex justify-between items-center p-4 bg-white border-b border-gray-100">
                                <div className="font-medium text-sm text-gray-800">{book.title} <span className="text-xs text-gray-400 font-normal">(MRP: ₹{book.mrp})</span></div>
                                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                                   <input type="checkbox" checked={book.isSelected} onChange={(e) => {
                                      const newBooks = [...manageAuthorBooks];
                                      newBooks[idx].isSelected = e.target.checked;
                                      setManageAuthorBooks(newBooks);
                                   }} className="rounded text-paa-navy w-4 h-4" /> Listed for this event
                                </label>
                             </div>
                             <div className="p-4 bg-gray-50 grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div>
                                   <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Quantities Listed</label>
                                   <input type="number" value={book.listedStock} onChange={(e) => {
                                      const newBooks = [...manageAuthorBooks];
                                      newBooks[idx].listedStock = parseInt(e.target.value) || 0;
                                      setManageAuthorBooks(newBooks);
                                   }} className="w-full border border-gray-300 rounded p-2 text-sm font-mono" />
                                </div>
                                <div>
                                   <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Manual Sold</label>
                                   <input type="number" value={book.soldStock} onChange={(e) => {
                                      const newBooks = [...manageAuthorBooks];
                                      newBooks[idx].soldStock = parseInt(e.target.value) || 0;
                                      setManageAuthorBooks(newBooks);
                                   }} className="w-full border border-gray-300 rounded p-2 text-sm font-mono" />
                                </div>
                                <div>
                                   <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Returned</label>
                                   <input type="number" value={book.returnedStock} onChange={(e) => {
                                      const newBooks = [...manageAuthorBooks];
                                      newBooks[idx].returnedStock = parseInt(e.target.value) || 0;
                                      setManageAuthorBooks(newBooks);
                                   }} className="w-full border border-gray-300 rounded p-2 text-sm font-mono" />
                                </div>
                                <div>
                                   <label className="block text-[10px] font-bold text-emerald-600 mb-1 uppercase tracking-wider">Revenue (₹)</label>
                                   <div className="w-full border border-emerald-200 bg-emerald-50 text-emerald-700 rounded p-2 text-sm font-mono font-bold">
                                      ₹{revenue}
                                   </div>
                                </div>
                                <div>
                                   <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">POS Sold (Auto)</label>
                                   <input type="number" defaultValue="0" disabled className="w-full border border-gray-200 bg-gray-100 text-gray-500 rounded p-2 text-sm font-mono" />
                                </div>
                             </div>
                          </div>
                        )})}
"""

if map_start != -1 and map_end != -1:
    del lines[map_start:map_end+1]
    lines.insert(map_start, new_map_block)

# 3. Fix the "PUBLISH TO AUTHOR" button
for i, line in enumerate(lines):
    if "PUBLISH TO AUTHOR" in line and "toast.success" in line:
        lines[i] = "                        <button onClick={handlePublishData} disabled={isPublishingData} className=\"px-8 py-2.5 text-sm bg-paa-gold text-paa-navy rounded-lg font-black hover:brightness-110 transition-all shadow-md\">{isPublishingData ? 'PUBLISHING...' : 'PUBLISH TO AUTHOR'}</button>\n"

# 4. Replace onClick={() => setSelectedAuthorForData(a)} with handleEditAuthorData(a)
for i, line in enumerate(lines):
    if "onClick={() => setSelectedAuthorForData(a)}" in line:
        lines[i] = line.replace("onClick={() => setSelectedAuthorForData(a)}", "onClick={() => handleEditAuthorData(a)}")

# 5. Add summary cards at the top of the events ecosystem page
events_page_start = -1
for i, line in enumerate(lines):
    if "<h3 className=\"text-lg font-serif font-medium text-paa-navy\">Events & Fairs Ecosystem</h3>" in line:
        events_page_start = i
        break

summary_block = """
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Events Organized</p>
                <div className="text-2xl font-serif text-paa-navy">{allCombinedEvents.length}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Books Sold</p>
                <div className="text-2xl font-serif text-paa-navy">{allCombinedEvents.reduce((acc, evt) => acc + (evt.aggSold || 0), 0)}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Authors Participated</p>
                <div className="text-2xl font-serif text-paa-navy">{allCombinedEvents.reduce((acc, evt) => acc + (evt.aggAuthors || 0), 0)}</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Total Gross Revenue</p>
                <div className="text-2xl font-serif text-emerald-800 font-bold">₹{allCombinedEvents.reduce((acc, evt) => acc + (evt.aggRevenue || 0), 0).toLocaleString()}</div>
            </div>
        </div>
"""

if events_page_start != -1:
    lines.insert(events_page_start + 4, summary_block)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Updated EventsTab successfully!")
