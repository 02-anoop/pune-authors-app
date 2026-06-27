import os

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\LivePosDashboard.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix the extra closing tag that causes JSX adjacent error
old_end = """              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal */}"""
new_end = """              </div>
            </div>
        </div>
      )}

      {/* Summary Modal */}"""

content = content.replace(old_end, new_end)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed JSX error.")
