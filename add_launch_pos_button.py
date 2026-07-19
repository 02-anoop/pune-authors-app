import os

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "<button onClick={() => handleOpenBreakdown(evt)}" in line:
        pos_button = """                               {evt.livePosEnabled && !evt.isPast && (
                                 <button onClick={() => window.open('/pos/' + evt.id, '_blank')} className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-bold border border-emerald-200 transition-colors shadow-sm flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                    Launch POS
                                 </button>
                               )}
"""
        lines.insert(i, pos_button)
        break

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Added Launch POS button!")
