import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/CustomerProfilePage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix the JSX wrapper
content = content.replace("return (\n\n      {/* Query Modal */}", "return (\n    <>\n      {/* Query Modal */}")
content = content.replace("</main>\n    </div>\n  );\n}", "</main>\n    </div>\n    </>\n  );\n}")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
