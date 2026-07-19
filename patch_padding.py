import os
import re

directory = "src/app/components"
pages_to_patch = [
    "EventsPage.tsx",
    "FlybrariesPage.tsx",
    "OrganizerLandingPage.tsx",
    "AboutPage.tsx",
    "ServicesPage.tsx",
    "ContactPage.tsx",
    "GoaCafePage.tsx",
    "CataloguePage.tsx",
    "EventLogPage.tsx",
    "CustomerProfilePage.tsx"
]

for filename in pages_to_patch:
    filepath = os.path.join(directory, filename)
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # We want to replace the FIRST occurrence of padding that looks like the top section
    # e.g., padding: "6rem 2rem 4rem" or padding: "4rem 1.5rem"
    
    def repl(m):
        # Change the rem value to something larger like 14rem or 12rem
        return m.group(0).replace("6rem", "14rem").replace("4rem", "14rem").replace("5rem", "14rem")
        
    new_content = re.sub(r'padding:\s*"(?:4rem|5rem|6rem)[^"]*"', repl, content, count=1)
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    print(f"Patched {filename}")

