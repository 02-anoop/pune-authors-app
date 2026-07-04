import sys
import re

def fix_author_dashboard_kpi():
    with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix 1: validParticipations calculation (Exclude Legacy Archive)
    target1 = """  const validParticipations = allEvents.filter((evt: any) => {
    if (evt.registration === 'Registered' || evt.registration === 'Approved' || evt.registration === 'Pending Approval') return true;
    if (evt.isPast && evt.status !== 'Legacy Archive') {
      if (evt.isDataUpdated && getPastEventBooks(evt.id).length > 0) return true;
    }
    return false;
  });"""
    
    replace1 = """  const validParticipations = allEvents.filter((evt: any) => {
    if (evt.status === 'Legacy Archive') return false;
    if (evt.registration === 'Registered' || evt.registration === 'Approved' || evt.registration === 'Pending Approval') return true;
    if (evt.isPast) {
      if (evt.isDataUpdated && (evt.isInvite ? getEventBooks(evt.id).length > 0 : getPastEventBooks(evt.id).length > 0)) return true;
    }
    return false;
  });"""
    content = content.replace(target1, replace1)

    # Fix 2: Total Books Sold logic swap
    target2 = """                 {validParticipations.reduce((acc: number, evt: any) => {
                    let sold = 0;
                    if (evt.manualTotalSold !== null && evt.manualTotalSold !== undefined) {
                       sold = evt.manualTotalSold;
                    } else if (evt.isPast && evt.isDataUpdated) {
                       evt.books?.forEach((b: any) => sold += (b.soldStock || 0));
                    } else if (evt.isInvite) {
                       getEventBooks(evt.id).forEach((b: any) => sold += (b.soldStock || 0));
                    }
                    return acc + sold;
                 }, 0)}"""
                 
    replace2 = """                 {validParticipations.reduce((acc: number, evt: any) => {
                    let sold = 0;
                    if (evt.manualTotalSold !== null && evt.manualTotalSold !== undefined) {
                       sold = evt.manualTotalSold;
                    } else if (evt.isInvite) {
                       getEventBooks(evt.id).forEach((b: any) => sold += (b.soldStock || 0));
                    } else if (evt.isPast && evt.isDataUpdated) {
                       evt.books?.forEach((b: any) => sold += (b.soldStock || 0));
                    }
                    return acc + sold;
                 }, 0)}"""
    content = content.replace(target2, replace2)

    # Fix 3: Total Revenue logic swap
    target3 = """                 ₹{validParticipations.reduce((acc: number, evt: any) => {
                    let rev = 0;
                    if (evt.manualTotalRevenue !== null && evt.manualTotalRevenue !== undefined) {
                       rev = evt.manualTotalRevenue;
                    } else if (evt.isPast && evt.isDataUpdated) {
                       evt.books?.forEach((b: any) => rev += (b.soldStock || 0) * (b.mrp || b.book?.mrp || 0));
                    } else if (evt.isInvite) {
                       getEventBooks(evt.id).forEach((b: any) => rev += (b.soldStock || 0) * (b.mrp || b.book?.mrp || 0));
                    }
                    return acc + rev;
                 }, 0).toLocaleString()}"""
                 
    replace3 = """                 ₹{validParticipations.reduce((acc: number, evt: any) => {
                    let rev = 0;
                    if (evt.manualTotalRevenue !== null && evt.manualTotalRevenue !== undefined) {
                       rev = evt.manualTotalRevenue;
                    } else if (evt.isInvite) {
                       getEventBooks(evt.id).forEach((b: any) => rev += (b.soldStock || 0) * (b.mrp || b.book?.mrp || 0));
                    } else if (evt.isPast && evt.isDataUpdated) {
                       evt.books?.forEach((b: any) => rev += (b.soldStock || 0) * (b.mrp || b.book?.mrp || 0));
                    }
                    return acc + rev;
                 }, 0).toLocaleString()}"""
    content = content.replace(target3, replace3)

    # Fix 4: Net Gain/Loss logic swap
    target4 = """                    const totalRev = validParticipations.reduce((acc: number, evt: any) => {
                       let rev = 0;
                       if (evt.manualTotalRevenue !== null && evt.manualTotalRevenue !== undefined) {
                          rev = evt.manualTotalRevenue;
                       } else if (evt.isPast && evt.isDataUpdated) {
                          evt.books?.forEach((b: any) => rev += (b.soldStock || 0) * (b.mrp || b.book?.mrp || 0));
                       } else if (evt.isInvite) {
                          getEventBooks(evt.id).forEach((b: any) => rev += (b.soldStock || 0) * (b.mrp || b.book?.mrp || 0));
                       }
                       return acc + rev;
                    }, 0);"""
                    
    replace4 = """                    const totalRev = validParticipations.reduce((acc: number, evt: any) => {
                       let rev = 0;
                       if (evt.manualTotalRevenue !== null && evt.manualTotalRevenue !== undefined) {
                          rev = evt.manualTotalRevenue;
                       } else if (evt.isInvite) {
                          getEventBooks(evt.id).forEach((b: any) => rev += (b.soldStock || 0) * (b.mrp || b.book?.mrp || 0));
                       } else if (evt.isPast && evt.isDataUpdated) {
                          evt.books?.forEach((b: any) => rev += (b.soldStock || 0) * (b.mrp || b.book?.mrp || 0));
                       }
                       return acc + rev;
                    }, 0);"""
    content = content.replace(target4, replace4)

    # Fix 5: Highlight Gain/Loss in Dropdown
    target5 = """                                                  <div>
                                                     <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1">Gain/Loss</p>
                                                     <p className={`text-sm font-bold ${gain >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{gain >= 0 ? '+' : '-'}₹{Math.abs(gain).toLocaleString()}</p>
                                                  </div>"""
                                                  
    replace5 = """                                                  <div>
                                                     <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1">Gain/Loss</p>
                                                     <p className={`text-sm font-black px-2 py-1 rounded-md inline-block shadow-sm ${gain >= 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>{gain >= 0 ? '+' : '-'}₹{Math.abs(gain).toLocaleString()}</p>
                                                  </div>"""
    content = content.replace(target5, replace5)

    with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

    print("SUCCESS")

if __name__ == '__main__':
    fix_author_dashboard_kpi()
