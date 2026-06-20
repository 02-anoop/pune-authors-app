import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_success = """        toast.success("Inventory settled successfully! Remaining stock added back to your inventory.");
        setSettleEventId(null);
        fetchAuthorEvents(); // Reload to reflect settled status"""

new_success = """        toast.success("Inventory settled successfully! Remaining stock added back to your inventory.");
        setSettleEventId(null);
        fetchAuthorEvents(); // Reload to reflect settled status
        setTimeout(() => window.location.reload(), 1500); // Reload the whole page to update the root dashboardData state!"""

if old_success in content:
    content = content.replace(old_success, new_success)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
