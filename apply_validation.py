import os

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\server\routes\api.js"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add imports at the top
imports = "const { validate } = require('../middleware/validate');\nconst { eventSchema } = require('../validators');\n"
if "middleware/validate" not in content:
    idx = content.find("const express = require('express');")
    if idx != -1:
        content = content[:idx] + imports + content[idx:]

# Find the target route and patch it
target_route = "router.post('/api/admin/events', verifyToken, isAdmin, upload.single('banner'), async (req, res) => {"
replacement = "router.post('/api/admin/events', verifyToken, isAdmin, upload.single('banner'), validate(eventSchema), async (req, res) => {"

if target_route in content:
    content = content.replace(target_route, replacement)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Patched api.js with Zod validation")
else:
    print("Could not find the target route in api.js")
