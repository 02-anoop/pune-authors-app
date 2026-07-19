import re

def fix_dashboard():
    with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add sort state
    content = content.replace("const [activeTab, setActiveTab] = useState('events');",
                              "const [activeTab, setActiveTab] = useState('events');\n  const [bpSort, setBpSort] = useState('revenue_desc');")

    # 2. Update KPI cards in Book Performance tab
    content = content.replace('className="bg-white p-4 rounded-xl border border-paa-navy/10 shadow-premium flex flex-col justify-center relative group cursor-default"',
                              'className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col justify-center relative group cursor-default"')

    # 3. Update Text sizes in KPI cards
    content = content.replace('className="text-2xl font-black text-indigo-600"', 'className="text-3xl font-serif font-bold text-indigo-700"')
    content = content.replace('className="text-2xl font-black text-paa-navy"', 'className="text-3xl font-serif font-bold text-paa-navy"')
    content = content.replace('className="text-2xl font-black text-emerald-600"', 'className="text-3xl font-serif font-bold text-emerald-700"')
    
    content = content.replace('className="text-sm font-black text-paa-navy"', 'className="text-lg font-serif font-bold text-paa-navy"')
    content = content.replace('className="text-sm font-black text-purple-700"', 'className="text-lg font-serif font-bold text-purple-700"')
    content = content.replace('className="text-sm font-black text-blue-700 truncate"', 'className="text-lg font-serif font-bold text-blue-700 truncate"')

    # 4. Add sorting logic to the Book Performance table.
    target_table_sort = """                   // Sort by revenue desc, then by date desc
                   enrichedEvents.sort((a, b) => b._rev - a._rev || b._date - a._date);"""
                   
    replace_table_sort = """                   enrichedEvents.sort((a, b) => {
                       if (bpSort === 'revenue_desc') return b._rev - a._rev || b._date - a._date;
                       if (bpSort === 'revenue_asc') return a._rev - b._rev || a._date - b._date;
                       if (bpSort === 'date_desc') return b._date - a._date;
                       if (bpSort === 'date_asc') return a._date - b._date;
                       if (bpSort === 'sold_desc') return b._sold - a._sold || b._rev - a._rev;
                       return b._rev - a._rev;
                   });"""

    content = content.replace(target_table_sort, replace_table_sort)

    # 5. Add UI Dropdown for sorting ABOVE the table
    target_table_header = """          <div className="bg-white rounded-xl shadow-premium border border-paa-navy/5 overflow-hidden mb-8">
            <table className="w-full text-left border-collapse whitespace-nowrap">"""
            
    replace_table_header = """          <div className="flex justify-between items-end mb-4">
            <h4 className="font-bold text-paa-navy text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-500" /> Event Performance Breakdown</h4>
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sort By:</span>
                <select className="border border-gray-200 rounded-lg text-sm font-bold text-paa-navy p-2 outline-none cursor-pointer bg-white" value={bpSort} onChange={e => setBpSort(e.target.value)}>
                    <option value="revenue_desc">Highest Revenue</option>
                    <option value="revenue_asc">Lowest Revenue</option>
                    <option value="sold_desc">Most Copies Sold</option>
                    <option value="date_desc">Newest Events</option>
                    <option value="date_asc">Oldest Events</option>
                </select>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-premium border border-paa-navy/5 overflow-hidden mb-8">
            <table className="w-full text-left border-collapse whitespace-nowrap">"""

    content = content.replace(target_table_header, replace_table_header)

    with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("DONE")

if __name__ == '__main__':
    fix_dashboard()
