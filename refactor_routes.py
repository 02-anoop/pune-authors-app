import os
import re

server_dir = r"c:\Users\arvin\Desktop\pune-authors-app\server"
index_path = os.path.join(server_dir, "index.js")

with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

def extract_section(start_marker, end_marker, filename, router_prefix):
    global content
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker) if end_marker else len(content)
    
    if start_idx != -1 and end_idx != -1:
        block = content[start_idx:end_idx]
        
        # Replace app.METHOD('/api/prefix
        block = re.sub(r"app\.(get|post|put|delete)\('" + router_prefix, r"router.\1('", block)
        # In case some routes don't have the exact prefix but fall under it
        
        router_code = f"""const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const {{ getCache, setCache, invalidateCache }} = require('../utils/cache');
const {{ isAdmin, verifyToken }} = require('../middleware/auth');
const {{ sendNotificationEmail, emailWrap }} = require('../utils/email');
const {{ upload }} = require('../config/upload');

"""
        
        final_router = router_code + block + "\nmodule.exports = router;\n"
        
        with open(os.path.join(server_dir, "routes", filename), "w", encoding="utf-8") as f:
            f.write(final_router)
        
        # Replace in index.js
        replacement = f"{start_marker}\nconst {filename[:-3]}Routes = require('./routes/{filename}');\napp.use('{router_prefix}', {filename[:-3]}Routes);\n\n"
        content = content[:start_idx] + replacement + content[end_idx:]
        print(f"Extracted {filename}")

extract_section("// --- FORMS MANAGEMENT ---", "// --- QUERIES (SUPPORT) ---", "forms.js", "/api/forms")
extract_section("// --- QUERIES (SUPPORT) ---", "// --- DYNAMIC AUTHOR FIELDS ---", "queries.js", "/api/queries")
extract_section("// --- POS APIs ---", None, "pos.js", "/api/pos")

with open(index_path, "w", encoding="utf-8") as f:
    f.write(content)
