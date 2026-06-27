import os

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Find the start of the Modal
modal_start = content.find("const Modal = ({ isOpen, onClose, title, children }: any) => {")
if modal_start != -1:
    modal_end = content.find("};", modal_start) + 2
    
    # Extract the Modal
    modal_code = content[modal_start:modal_end]
    
    # Remove it from inside the component
    new_content = content[:modal_start] + content[modal_end:]
    
    # Insert it before OperationsDashboardPage
    insert_idx = new_content.find("export function OperationsDashboardPage")
    new_content = new_content[:insert_idx] + modal_code + "\n\n" + new_content[insert_idx:]
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Modal moved successfully!")
else:
    print("Modal not found")
