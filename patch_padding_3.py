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
    "CustomerProfilePage.tsx",
    "BulkCheckoutPage.tsx",
    "BookDetailPage.tsx",
    "BrowseAuthorsPage.tsx",
    "AuthorPublicProfilePage.tsx",
    "AuthorLandingPage.tsx"
]

for filename in pages_to_patch:
    filepath = os.path.join(directory, filename)
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Revert padding from 14rem to 10rem for the top sections
    def repl(m):
        return m.group(0).replace("14rem", "10rem")
        
    # We match padding: "14rem...
    new_content = re.sub(r'padding:\s*"14rem[^"]*"', repl, content)
    
    if new_content != content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Patched {filename}")

