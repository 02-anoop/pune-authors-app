import os
import re

directory = "src/app/components"
pages_to_patch = [
    "CheckoutPage.tsx",
    "BulkCheckoutPage.tsx",
    "AuthorRegistrationPage.tsx",
    "AuthorOnboardingWizard.tsx",
    "AuthPage.tsx",
    "BookDetailPage.tsx",
    "BrowseAuthorsPage.tsx",
    "AuthorPublicProfilePage.tsx"
]

for filename in pages_to_patch:
    filepath = os.path.join(directory, filename)
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    def repl(m):
        return m.group(0).replace("4rem", "14rem").replace("5rem", "14rem").replace("6rem", "14rem")
        
    new_content = re.sub(r'padding:\s*"(?:4rem|5rem|6rem)[^"]*"', repl, content, count=1)
    
    if new_content != content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Patched {filename}")

