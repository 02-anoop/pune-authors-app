import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace eventInvites with dashboardData?.eventInvites
content = content.replace(
    "{eventInvites?.some((inv: any) => inv.optInStatus === 'Opted-In' && inv.event.status === 'Past' && listedBooks.some((lb: any) => lb.eventId === inv.eventId && lb.listedStock !== (lb.soldStock || 0) + (lb.returnedStock || 0))) && (",
    "{dashboardData?.eventInvites?.some((inv: any) => inv.optInStatus === 'Opted-In' && inv.event.status === 'Past' && dashboardData?.listedBooks?.some((lb: any) => lb.eventId === inv.eventId && lb.listedStock !== (lb.soldStock || 0) + (lb.returnedStock || 0))) && location.pathname !== '/dashboard/events' && ("
)

old_overlay_inner = """               <p className="text-gray-500 mt-2">Please settle your past event inventory to access your dashboard.</p>
            </div>
         </div>"""

new_overlay_inner = """               <p className="text-gray-500 mt-2 mb-6">Please settle your past event inventory to access your dashboard.</p>
               <button onClick={() => navigate('/dashboard/events')} className="bg-paa-navy text-paa-cream px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-paa-gold hover:text-paa-navy transition-colors">Go to Events Tab</button>
            </div>
         </div>"""

if "Go to Events Tab" not in content:
    content = content.replace(old_overlay_inner, new_overlay_inner)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
