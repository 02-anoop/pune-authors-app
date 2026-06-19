with open('src/app/components/OperationsDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add states for pending filters
old_state = '''  const [searchTerm, setSearchTerm] = useState('');'''
new_state = '''  const [searchTerm, setSearchTerm] = useState('');
  const [showPendingAuthors, setShowPendingAuthors] = useState(false);
  const [showPendingBooks, setShowPendingBooks] = useState(false);'''

if old_state in content:
    content = content.replace(old_state, new_state)

# 2. Add filter UI to AuthorsTab and apply filter
old_authors_header = '''             <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-paa-gray-text" />
                <input 
                  type="text" 
                  placeholder="SEARCH AUTHORS..." 
                  className="pl-9 pr-4 py-2 bg-white border border-paa-navy/20 text-xs font-bold tracking-widest uppercase outline-none focus:border-paa-navy transition-colors w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>'''

new_authors_header = '''             <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowPendingAuthors(!showPendingAuthors)}
                  className={`px-3 py-2 text-xs font-bold tracking-widest uppercase border transition-colors ${showPendingAuthors ? 'bg-paa-navy text-white border-paa-navy' : 'bg-white text-paa-navy border-paa-navy/20 hover:border-paa-navy'}`}
                >
                  Pending Only
                </button>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-paa-gray-text" />
                  <input 
                    type="text" 
                    placeholder="SEARCH AUTHORS..." 
                    className="pl-9 pr-4 py-2 bg-white border border-paa-navy/20 text-xs font-bold tracking-widest uppercase outline-none focus:border-paa-navy transition-colors w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
             </div>'''

content = content.replace(old_authors_header, new_authors_header)

old_authors_map = '''             {authors.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase())).map((author) => ('''
new_authors_map = '''             {authors.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) && (!showPendingAuthors || a.status === 'Pending')).map((author) => ('''
content = content.replace(old_authors_map, new_authors_map)


# 3. Add filter UI to BooksTab and apply filter
old_books_header = '''             <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-paa-gray-text" />
                <input type="text" placeholder="SEARCH BOOKS..." className="pl-9 pr-4 py-2 bg-white border border-paa-navy/20 text-xs font-bold tracking-widest uppercase outline-none focus:border-paa-navy transition-colors w-64" />
             </div>'''

new_books_header = '''             <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowPendingBooks(!showPendingBooks)}
                  className={`px-3 py-2 text-xs font-bold tracking-widest uppercase border transition-colors ${showPendingBooks ? 'bg-paa-navy text-white border-paa-navy' : 'bg-white text-paa-navy border-paa-navy/20 hover:border-paa-navy'}`}
                >
                  Pending Only
                </button>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-paa-gray-text" />
                  <input type="text" placeholder="SEARCH BOOKS..." className="pl-9 pr-4 py-2 bg-white border border-paa-navy/20 text-xs font-bold tracking-widest uppercase outline-none focus:border-paa-navy transition-colors w-64" />
                </div>
             </div>'''

content = content.replace(old_books_header, new_books_header)

old_books_map = '''             {books.map((book) => ('''
new_books_map = '''             {books.filter(b => (!showPendingBooks || b.status === 'Pending')).map((book) => ('''
content = content.replace(old_books_map, new_books_map)

with open('src/app/components/OperationsDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Filters added to OperationsDashboardPage")
