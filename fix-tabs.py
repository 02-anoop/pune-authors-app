import sys

def fix_tabs():
    with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    target = """  const filteredEvents = allEvents.filter((evt: any) => {
    if (eventFilter === 'UPCOMING' && evt.isPast) return false;
    if (eventFilter === 'PAST' && (!evt.isPast || evt.status === 'Legacy Archive')) return false;
    if (eventFilter === 'INVITES' && !evt.isInvite) return false;
    if (eventFilter === 'LEGACY ARCHIVE' && evt.status !== 'Legacy Archive') return false;
    if (eventFilter === 'ALL' && evt.status === 'Legacy Archive') return false;
    if (searchTerm) {
        return (evt.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
               (evt.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });"""
  
    replace = """  const filteredEvents = allEvents.filter((evt: any) => {
    const isLegacy = evt.status === 'Legacy Archive';
    
    if (eventFilter === 'ALL' && isLegacy) return false;
    if (eventFilter === 'UPCOMING' && (evt.isPast || isLegacy)) return false;
    if (eventFilter === 'PAST' && (!evt.isPast || isLegacy)) return false;
    if (eventFilter === 'INVITES' && (evt.isPast || isLegacy || evt.registration !== 'Pending')) return false;
    if (eventFilter === 'LEGACY ARCHIVE' && !isLegacy) return false;
    
    if (searchTerm) {
        return (evt.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
               (evt.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });"""

    content = content.replace(target, replace)

    with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

    print("SUCCESS")

if __name__ == '__main__':
    fix_tabs()
