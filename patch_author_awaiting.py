import sys
import re

with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add isAwaitingApproval
content = content.replace(
    "const isOptedIn = invite.optInStatus === 'Opted-In';",
    "const isOptedIn = invite.optInStatus === 'Opted-In';\n               const isAwaitingApproval = invite.optInStatus === 'Awaiting Approval';"
)

content = content.replace(
    "className={`bg-white border shadow-sm relative overflow-hidden ${isOptedIn ? 'border-green-300' : 'border-paa-navy/20'}`}",
    "className={`bg-white border shadow-sm relative overflow-hidden ${isOptedIn ? 'border-green-300' : (isAwaitingApproval ? 'border-orange-300' : 'border-paa-navy/20')}`}"
)

content = content.replace(
    "className={`px-4 py-2 text-white font-bold text-xs uppercase tracking-widest flex justify-between items-center ${isOptedIn ? 'bg-green-600' : 'bg-blue-600'}`}",
    "className={`px-4 py-2 text-white font-bold text-xs uppercase tracking-widest flex justify-between items-center ${isOptedIn ? 'bg-green-600' : (isAwaitingApproval ? 'bg-orange-600' : 'bg-blue-600')}`}"
)

content = content.replace(
    "<span>{isOptedIn ? 'Opted In' : 'Action Required'}</span>",
    "<span>{isOptedIn ? 'Opted In' : (isAwaitingApproval ? 'Awaiting Approval' : 'Action Required')}</span>"
)

# Replace the condition for showing the form
content = content.replace(
    "{isOptedIn ? (",
    "{isOptedIn ? ("
) # Wait, need to render the Awaiting Approval state

target = """                        {isOptedIn ? (
                           <div className="bg-green-50 p-4 border border-green-200">"""
replace = """                        {isAwaitingApproval ? (
                           <div className="bg-orange-50 p-4 border border-orange-200 text-center">
                              <p className="text-sm font-bold text-orange-900 mb-2">Registration Under Review</p>
                              <p className="text-xs text-orange-800">Your registration and payment screenshot are currently being verified by the admin.</p>
                           </div>
                        ) : isOptedIn ? (
                           <div className="bg-green-50 p-4 border border-green-200">"""

content = content.replace(target, replace)

with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
