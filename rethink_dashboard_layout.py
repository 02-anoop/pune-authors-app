import os

def update_admin_layout():
    with open('src/app/components/OperationsDashboardPage.tsx', 'r', encoding='utf-8') as f:
        c = f.read()

    # Admin Layout changes
    # 1. Main outer container
    c = c.replace('className="flex h-screen bg-paa-cream font-sans text-paa-navy antialiased animate-fade-in-up"',
                  'className="flex h-screen bg-[#F3F2EE] font-sans text-paa-navy antialiased animate-fade-in-up p-4 gap-4"')
    
    # 2. Sidebar wrap
    c = c.replace('<aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-paa-navy text-paa-cream shadow-2xl md:shadow-none transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? \'translate-x-0\' : \'-translate-x-full\'} md:translate-x-0 flex flex-col h-full`}>',
                  '<aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-paa-navy text-paa-cream rounded-3xl shadow-premium transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? \'translate-x-0\' : \'-translate-x-full\'} md:translate-x-0 flex flex-col h-full overflow-hidden`}>')
    
    # 3. Main content wrapper
    c = c.replace('<div className="flex-1 flex flex-col overflow-hidden">',
                  '<div className="flex-1 flex flex-col bg-white rounded-3xl shadow-premium overflow-hidden border border-paa-navy/5 relative">')

    # 4. Header padding
    c = c.replace('<header className="bg-white border-b border-paa-navy/5 h-16 flex items-center justify-between px-6 shrink-0 shadow-premium">',
                  '<header className="bg-transparent border-b border-paa-navy/5 h-20 flex items-center justify-between px-10 shrink-0 z-10 backdrop-blur-md">')

    # 5. Main content padding
    c = c.replace('<main className="flex-1 overflow-y-auto p-6 scroll-smooth">',
                  '<main className="flex-1 overflow-y-auto p-10 scroll-smooth">')

    # 6. Sidebar logo
    c = c.replace('<h1 className="font-serif text-2xl tracking-widest font-bold">PAA Admin</h1>',
                  '<h1 className="font-serif text-3xl font-bold tracking-tight text-paa-gold">PAA Admin</h1>')

    # 7. KPI background fix (since main is now white, KPIs can be transparent or very soft)
    c = c.replace('className="bg-white p-8 rounded-3xl border border-paa-navy/5',
                  'className="bg-[#FAFAFA] p-8 rounded-3xl border border-paa-navy/5')

    with open('src/app/components/OperationsDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(c)

def update_author_layout():
    with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
        c = f.read()

    # Author Layout Changes
    c = c.replace('className="min-h-screen bg-paa-cream animate-fade-in-up font-sans text-paa-navy antialiased"',
                  'className="min-h-screen bg-[#F3F2EE] animate-fade-in-up font-sans text-paa-navy antialiased flex flex-col p-4 gap-4"')
    
    c = c.replace('<nav className="bg-paa-navy text-paa-cream sticky top-0 z-40 shadow-premium">',
                  '<nav className="bg-paa-navy text-paa-cream sticky top-0 z-40 shadow-premium rounded-3xl px-4 py-2 mx-auto w-full max-w-7xl">')
    
    c = c.replace('<main className="max-w-7xl mx-auto px-4 py-8 relative">',
                  '<main className="flex-1 max-w-7xl mx-auto w-full bg-white rounded-3xl shadow-premium overflow-hidden border border-paa-navy/5 p-8 relative">')

    # Header tweaks
    c = c.replace('<h1 className="text-xl md:text-2xl font-serif font-bold tracking-widest truncate">',
                  '<h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-paa-gold truncate">')

    c = c.replace('className="bg-white p-8 rounded-3xl border border-paa-navy/5',
                  'className="bg-[#FAFAFA] p-8 rounded-3xl border border-paa-navy/5')

    with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(c)

update_admin_layout()
update_author_layout()
print("Re-architected structural layouts.")
