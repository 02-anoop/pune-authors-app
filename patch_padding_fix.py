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
    
    # We will fix any messed up paddings (e.g. 114rem, 14rem, 6rem etc)
    # We are looking for the hero padding.
    
    # Fix 114rem 2rem 14rem -> 10rem 2rem 4rem
    content = content.replace("114rem 2rem 14rem", "10rem 2rem 4rem")
    # Fix 14rem 2rem 14rem -> 10rem 2rem 4rem
    content = content.replace("14rem 2rem 14rem", "10rem 2rem 4rem")
    # Fix 14rem 2rem 4rem -> 10rem 2rem 4rem
    content = content.replace("14rem 2rem 4rem", "10rem 2rem 4rem")
    
    # Fix 14rem 1.5rem -> 10rem 1.5rem
    content = content.replace("14rem 1.5rem", "10rem 1.5rem")
    # Fix 114rem 1.5rem -> 10rem 1.5rem
    content = content.replace("114rem 1.5rem", "10rem 1.5rem")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Patched {filename}")

