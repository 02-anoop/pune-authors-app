import sys

def fix_author_dashboard():
    with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix 1: Bar chart
    target1 = """                  if (evt.manualTotalSold !== null && evt.manualTotalSold !== undefined) {
                    sold = evt.manualTotalSold;
                  } else if (evt.isPast && evt.isDataUpdated) {
                    evt.books?.forEach((b: any) => { sold += (b.soldStock || 0); });
                  } else if (evt.isInvite) {
                    const evtBooks = getEventBooks(evt.id);
                    evtBooks.forEach((b: any) => { sold += (b.soldStock || 0); });
                  }"""
                  
    replace1 = """                  if (evt.manualTotalSold !== null && evt.manualTotalSold !== undefined) {
                    sold = evt.manualTotalSold;
                  } else if (evt.isInvite) {
                    const evtBooks = getEventBooks(evt.id);
                    evtBooks.forEach((b: any) => { sold += (b.soldStock || 0); });
                  } else if (evt.isPast && evt.isDataUpdated) {
                    evt.books?.forEach((b: any) => { sold += (b.soldStock || 0); });
                  }"""

    # Fix 2: Table row
    target2 = """                  if (evt.manualTotalSold !== null && evt.manualTotalSold !== undefined) {
                    sold = evt.manualTotalSold;
                    rev = evt.manualTotalRevenue || 0;
                  } else if (evt.isPast && evt.isDataUpdated) {
                    evt.books?.forEach((b: any) => {
                      sold += (b.soldStock || 0);
                      rev += (b.soldStock || 0) * (b.mrp || b.book?.mrp || 0);
                    });
                  } else if (evt.isInvite) {
                    const evtBooks = getEventBooks(evt.id);
                    evtBooks.forEach((b: any) => {
                      sold += (b.soldStock || 0);
                      rev += (b.soldStock || 0) * (b.book?.mrp || 0);
                    });
                  }"""

    replace2 = """                  if (evt.manualTotalSold !== null && evt.manualTotalSold !== undefined) {
                    sold = evt.manualTotalSold;
                    rev = evt.manualTotalRevenue || 0;
                  } else if (evt.isInvite) {
                    const evtBooks = getEventBooks(evt.id);
                    evtBooks.forEach((b: any) => {
                      sold += (b.soldStock || 0);
                      rev += (b.soldStock || 0) * (b.mrp || b.book?.mrp || 0);
                    });
                  } else if (evt.isPast && evt.isDataUpdated) {
                    evt.books?.forEach((b: any) => {
                      sold += (b.soldStock || 0);
                      rev += (b.soldStock || 0) * (b.mrp || b.book?.mrp || 0);
                    });
                  }"""

    # Fix 3: Expanded view revenue
    target3 = """<div className="flex flex-col items-end"><span className="text-emerald-600 font-bold">REV</span><span className="text-emerald-600 font-bold bg-emerald-50 px-1 rounded">₹{b.revenue || 0}</span></div>"""
    replace3 = """<div className="flex flex-col items-end"><span className="text-emerald-600 font-bold">REV</span><span className="text-emerald-600 font-bold bg-emerald-50 px-1 rounded">₹{(b.soldStock || b.sold || 0) * (b.mrp || b.book?.mrp || bDetails?.mrp || 0)}</span></div>"""

    content = content.replace(target1, replace1).replace(target2, replace2).replace(target3, replace3)

    with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

    print("SUCCESS")

if __name__ == '__main__':
    fix_author_dashboard()
