import os
api_path = r"c:\Users\arvin\Desktop\pune-authors-app\server\routes\api.js"
with open(api_path, 'r', encoding='utf-8') as f:
    content = f.read()

lines_to_remove = [
    "const formsRoutes = require('./routes/forms.js');",
    "router.use('/api/forms', formsRoutes);",
    "const queriesRoutes = require('./routes/queries.js');",
    "router.use('/api/queries', queriesRoutes);"
]

for line in lines_to_remove:
    content = content.replace(line, "")

with open(api_path, 'w', encoding='utf-8') as f:
    f.write(content)
