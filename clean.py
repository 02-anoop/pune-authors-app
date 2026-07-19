import os

file_path = "src/app/components/OperationsDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# AdminReviewsTab appears twice because I appended it twice. Let's split by "function AdminReviewsTab() {"
parts = content.split("function AdminReviewsTab() {")
if len(parts) > 2:
    # There are at least two declarations. We will keep the first part, the first function body, and discard the second function body.
    # Actually, it's safer to just replace the second occurrence manually.
    
    # We can reconstruct it. 
    # part 0 is everything before the first function AdminReviewsTab
    # part 1 is the body of the first AdminReviewsTab (up to the second "function AdminReviewsTab() {")
    # part 2 is the body of the second AdminReviewsTab
    
    # Let's find the second AdminReviewsTab
    first_index = content.find("function AdminReviewsTab() {")
    second_index = content.find("function AdminReviewsTab() {", first_index + 1)
    
    if second_index != -1:
        # Just slice off everything after the second_index, because it was appended at the very end.
        content = content[:second_index]
        
with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Cleaned up duplicate AdminReviewsTab")
