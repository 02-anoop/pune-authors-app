import os

files_to_update = [
    "LandingPage.tsx",
    "AboutPage.tsx",
    "ServicesPage.tsx",
    "EventsPage.tsx",
    "EventLogPage.tsx",
    "BookDetailPage.tsx",
    "CataloguePage.tsx"
]

base_dir = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components"

for filename in files_to_update:
    filepath = os.path.join(base_dir, filename)
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Improve contrast of text colors
    content = content.replace('color: "#666"', 'color: "#333"')
    content = content.replace('color: "#888"', 'color: "#555"')
    content = content.replace('color: "#444"', 'color: "#222"')
    content = content.replace('fontWeight: 300', 'fontWeight: 400') # Make text slightly thicker for readability
    
    # EventsPage specific changes
    if filename == "EventsPage.tsx":
        content = content.replace("useState<'upcoming' | 'past'>('past')", "useState<'upcoming' | 'past'>('upcoming')")
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
        
print("Updated contrast and EventsPage defaults successfully.")
