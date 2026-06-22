with open('src/app/components/OperationsDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update State Variables
old_state = '''  const [showPendingAuthors, setShowPendingAuthors] = useState(false);
  const [showPendingBooks, setShowPendingBooks] = useState(false);'''

new_state = '''  const [authorStatusFilter, setAuthorStatusFilter] = useState('All');
  const [bookStatusFilter, setBookStatusFilter] = useState('All');'''
content = content.replace(old_state, new_state)

# 2. Update AuthorsTab Filter UI
old_authors_filter = '''                <button 
                  onClick={() => setShowPendingAuthors(!showPendingAuthors)}
                  className={`px-3 py-2 text-xs font-bold tracking-widest uppercase border transition-colors ${showPendingAuthors ? 'bg-paa-navy text-white border-paa-navy' : 'bg-white text-paa-navy border-paa-navy/20 hover:border-paa-navy'}`}
                >
                  Pending Only
                </button>'''

new_authors_filter = '''                <div className="flex bg-gray-100 rounded p-1">
                  {['All', 'Pending', 'Active', 'Rejected'].map(status => (
                    <button 
                      key={status}
                      onClick={() => setAuthorStatusFilter(status)}
                      className={`px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-colors rounded ${authorStatusFilter === status ? 'bg-white text-paa-navy shadow-sm' : 'text-gray-500 hover:text-paa-navy'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>'''
content = content.replace(old_authors_filter, new_authors_filter)

# 3. Update AuthorsTab Map Logic
old_authors_map = '''{authors.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) && (!showPendingAuthors || a.status === 'Pending')).map((author) => ('''
new_authors_map = '''{authors.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) && (authorStatusFilter === 'All' || a.status === authorStatusFilter)).map((author) => ('''
content = content.replace(old_authors_map, new_authors_map)

# 4. Update BooksTab Filter UI
old_books_filter = '''                <button 
                  onClick={() => setShowPendingBooks(!showPendingBooks)}
                  className={`px-3 py-2 text-xs font-bold tracking-widest uppercase border transition-colors ${showPendingBooks ? 'bg-paa-navy text-white border-paa-navy' : 'bg-white text-paa-navy border-paa-navy/20 hover:border-paa-navy'}`}
                >
                  Pending Only
                </button>'''

new_books_filter = '''                <div className="flex bg-gray-100 rounded p-1">
                  {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                    <button 
                      key={status}
                      onClick={() => setBookStatusFilter(status)}
                      className={`px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-colors rounded ${bookStatusFilter === status ? 'bg-white text-paa-navy shadow-sm' : 'text-gray-500 hover:text-paa-navy'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>'''
content = content.replace(old_books_filter, new_books_filter)

# 5. Update BooksTab Map Logic
old_books_map = '''{books.filter(b => (!showPendingBooks || b.status === 'Pending')).map((book) => ('''
new_books_map = '''{books.filter(b => (bookStatusFilter === 'All' || b.status === bookStatusFilter)).map((book) => ('''
content = content.replace(old_books_map, new_books_map)

with open('src/app/components/OperationsDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated OperationsDashboardPage.tsx filters")
