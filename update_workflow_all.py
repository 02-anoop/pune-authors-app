import os

# 1. Update api.js
api_path = r"C:\Users\arvin\Desktop\pune-authors-app\server\routes\api.js"
with open(api_path, 'r', encoding='utf-8') as f:
    api_data = f.read()

# Change 'Awaiting Approval' to 'Pending Approval' in opt-in
api_data = api_data.replace("optInStatus: 'Awaiting Approval'", "optInStatus: 'Pending Approval'")
# If admin approves, we need to make sure the endpoint sets it to 'Registered' instead of 'Opted-In'
# Let's find the endpoint for approval.
# The endpoint in OperationsDashboard is likely `/api/admin/events/:eventId/author/:authorId/approve`?
# Let's check api.js for 'Opted-In'
api_data = api_data.replace("'Opted-In'", "'Registered'")
api_data = api_data.replace('"Opted-In"', '"Registered"')

with open(api_path, 'w', encoding='utf-8') as f:
    f.write(api_data)


# 2. Update OperationsDashboardPage.tsx
ops_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx"
with open(ops_path, 'r', encoding='utf-8') as f:
    ops_data = f.read()

ops_data = ops_data.replace("'Awaiting Approval'", "'Pending Approval'")
ops_data = ops_data.replace("'Opted-In'", "'Registered'")

# We want to add a badge to the Authors column in Events Registry if there are pending authors
# Find: <td className="px-4 py-3 text-sm font-bold text-paa-navy text-right">{authors}</td>
# And we need the count of pending authors for that event.
# In `evt.registrations` we can check `evt.registrations.filter(r => r.optInStatus === 'Pending Approval').length`
# Wait, `allCombinedEvents` doesn't necessarily include `registrations` in `isLegacy` but for non-legacy it might.
# Let's modify the TR mapping in Events Registry.
find_authors_td = '<td className="px-4 py-3 text-sm font-bold text-paa-navy text-right">{authors}</td>'
replace_authors_td = """                        <td className="px-4 py-3 text-sm font-bold text-paa-navy text-right">
                           <div className="flex items-center justify-end gap-2">
                               {evt.registrations?.filter((r:any) => r.optInStatus === 'Pending Approval').length > 0 && (
                                   <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
                                       {evt.registrations.filter((r:any) => r.optInStatus === 'Pending Approval').length} Pending
                                   </span>
                               )}
                               {authors}
                           </div>
                        </td>"""
ops_data = ops_data.replace(find_authors_td, replace_authors_td)

with open(ops_path, 'w', encoding='utf-8') as f:
    f.write(ops_data)


# 3. Update AuthorDashboardPage.tsx
auth_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx"
with open(auth_path, 'r', encoding='utf-8') as f:
    auth_data = f.read()

auth_data = auth_data.replace("'Opted-In'", "'Registered'")
auth_data = auth_data.replace("'Awaiting Approval'", "'Pending Approval'")

# For the Event Details in Opt-In Modal
# We will add an accordion
# Find `<h3 className="font-bold text-blue-900 mb-1">Event Invitation</h3>`
opt_in_modal_find = """                   <h3 className="font-bold text-blue-900 mb-1">Event Invitation</h3>
                   <p className="text-sm text-blue-800">You have been invited to participate in this event. Please select the books you want to bring.</p>
                   {selectedInvite.registrationFee > 0 && ("""

opt_in_modal_replace = """                   <h3 className="font-bold text-blue-900 mb-1">Event Invitation</h3>
                   <p className="text-sm text-blue-800 mb-3">You have been invited to participate in this event. Please select the books you want to bring.</p>
                   <details className="bg-white rounded-lg p-3 text-sm text-gray-700 border border-blue-200 cursor-pointer shadow-sm mb-4">
                       <summary className="font-bold text-paa-navy focus:outline-none">View Event Details ▼</summary>
                       <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                           <div><span className="font-semibold">Date:</span> {new Date(selectedInvite.startDate || selectedInvite.date).toLocaleDateString()}</div>
                           <div><span className="font-semibold">Location:</span> {selectedInvite.location || selectedInvite.venue || 'TBA'}</div>
                           <div><span className="font-semibold">Duration:</span> {selectedInvite.durationDays ? `${selectedInvite.durationDays} Days` : 'N/A'}</div>
                           <div><span className="font-semibold">Type:</span> {selectedInvite.type || 'N/A'}</div>
                           {selectedInvite.description && <div className="col-span-2"><span className="font-semibold">Description:</span> {selectedInvite.description}</div>}
                       </div>
                   </details>
                   {selectedInvite.registrationFee > 0 && ("""
auth_data = auth_data.replace(opt_in_modal_find, opt_in_modal_replace)

# Make Launch POS work if status === 'Registered'
auth_data = auth_data.replace("evt.registration === 'Registered' || evt.registration === 'Participated'", "evt.registration === 'Registered'")

with open(auth_path, 'w', encoding='utf-8') as f:
    f.write(auth_data)

print("Updated workflow scripts!")
