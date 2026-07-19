import os

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Fix the double Opt-In bug
old_block = """                             ) : (
                               <button onClick={() => { setOptInEventId(evt.id); setSelectedBooksToLink([]); setPaymentScreenshotBlob(null); }} className="dash-btn dash-btn-primary w-full justify-center">
                                  Opt-In & List Books
                               </button>
                             )"""

new_block = """                             ) : isAwaitingApproval ? (
                               <div className="bg-orange-50 text-orange-800 text-sm p-3 rounded-lg text-center font-medium border border-orange-200">
                                  Approval Pending
                               </div>
                             ) : (
                               <button onClick={() => { setOptInEventId(evt.id); setSelectedBooksToLink([]); setPaymentScreenshotBlob(null); }} className="dash-btn dash-btn-primary w-full justify-center">
                                  Opt-In & List Books
                               </button>
                             )"""

content = content.replace(old_block, new_block)

# 2. Add POS access while awaiting approval (as disabled or just active)
old_pos = """                          {isOptedIn && evt.status !== 'Past' && (
                             <button onClick={() => navigate(`/dashboard/pos/${evt.id}`)} className="dash-btn dash-btn-ghost w-full justify-center border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800">
                                Launch Live POS
                             </button>
                          )}"""

# We allow them to view POS if they are opted in OR awaiting approval. 
new_pos = """                          {(isOptedIn || isAwaitingApproval) && evt.status !== 'Past' && (
                             <button onClick={() => navigate(`/dashboard/pos/${evt.id}`)} className="dash-btn dash-btn-ghost w-full justify-center border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 mt-2">
                                Launch Live POS
                             </button>
                          )}"""

content = content.replace(old_pos, new_pos)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Opt-In UI bug fixed.")
