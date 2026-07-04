import sys

def fix_author_dashboard():
    with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Part 1: Fix validParticipations
    target_valid = """  const validParticipations = allEvents.filter((evt: any) => {
    if (evt.registration === 'Registered' || evt.registration === 'Approved' || evt.registration === 'Pending Approval') return true;
    if (evt.isPast) {
      if (evt.isDataUpdated && getPastEventBooks(evt.id).length > 0) return true;
    }
    return false;
  });"""

    replacement_valid = """  const validParticipations = allEvents.filter((evt: any) => {
    if (evt.registration === 'Registered' || evt.registration === 'Approved' || evt.registration === 'Pending Approval') return true;
    if (evt.isPast && evt.status !== 'Legacy Archive') {
      if (evt.isDataUpdated && getPastEventBooks(evt.id).length > 0) return true;
    }
    return false;
  });"""

    content = content.replace(target_valid, replacement_valid)

    # Part 2: Fix filteredEvents
    target_filter = """  const filteredEvents = allEvents.filter((evt: any) => {
    if (eventFilter === 'UPCOMING' && evt.isPast) return false;
    if (eventFilter === 'PAST' && !evt.isPast) return false;
    if (eventFilter === 'INVITES' && !evt.isInvite) return false;
    if (searchTerm) {"""

    replacement_filter = """  const filteredEvents = allEvents.filter((evt: any) => {
    if (eventFilter === 'UPCOMING' && evt.isPast) return false;
    if (eventFilter === 'PAST' && (!evt.isPast || evt.status === 'Legacy Archive')) return false;
    if (eventFilter === 'INVITES' && !evt.isInvite) return false;
    if (eventFilter === 'LEGACY ARCHIVE' && evt.status !== 'Legacy Archive') return false;
    if (eventFilter === 'ALL' && evt.status === 'Legacy Archive') return false;
    if (searchTerm) {"""

    content = content.replace(target_filter, replacement_filter)

    # Part 3: Fix Tabs UI
    target_tabs = """             <div className="flex gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
               {['ALL', 'UPCOMING', 'PAST', 'INVITES'].map((f) => (
                 <button key={f} onClick={() => setEventFilter(f)} className={`px-5 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${eventFilter === f ? 'bg-white text-paa-navy shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>{f === 'ALL' ? 'All Events' : (f === 'UPCOMING' ? 'Upcoming & Live' : (f === 'PAST' ? 'Past Events' : 'Invites'))}</button>
               ))}
             </div>"""

    replacement_tabs = """             <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
               {['ALL', 'UPCOMING', 'PAST', 'INVITES', 'LEGACY ARCHIVE'].map((f) => (
                 <button key={f} onClick={() => setEventFilter(f)} className={`px-5 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${eventFilter === f ? 'bg-white text-paa-navy shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>{f === 'ALL' ? 'All Events' : (f === 'UPCOMING' ? 'Upcoming & Live' : (f === 'PAST' ? 'Past Events' : (f === 'LEGACY ARCHIVE' ? 'Legacy Archive' : 'Invites')))}</button>
               ))}
             </div>"""

    content = content.replace(target_tabs, replacement_tabs)

    with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("SUCCESSFULLY UPDATED AUTHOR DASHBOARD LEGACY ARCHIVE TABS")

if __name__ == '__main__':
    fix_author_dashboard()
