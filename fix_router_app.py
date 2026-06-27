import os
import re
import glob

routes_dir = r"c:\Users\arvin\Desktop\pune-authors-app\server\routes"

for filepath in glob.glob(os.path.join(routes_dir, "*.js")):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Replace app.get, app.post, app.put, app.delete with router.get, etc.
    new_content = re.sub(r"app\.(get|post|put|delete|use)\(", r"router.\1(", content)
    
    if new_content != content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Fixed {os.path.basename(filepath)}")
