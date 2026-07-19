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
        
        # Replace app.METHOD('/api/prefix with router.METHOD('
        # Be careful: some routes have different prefixes or exact matches
        
        # We'll just replace app.get( and app.post( to router.get( and router.post(
        # We will not strip prefixes automatically for admin, books, authors because they might interleave
        block = re.sub(r"app\.(get|post|put|delete)\(", r"router.\1(", block)
        
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
        replacement = f"{start_marker}\nconst {filename[:-3]}Routes = require('./routes/{filename}');\napp.use('/', {filename[:-3]}Routes);\n\n"
        content = content[:start_idx] + replacement + content[end_idx:]
        print(f"Extracted {filename}")

# We will mount these on '/' because they already include full paths in the router.get('/api/admin/...') etc.
extract_section("// --- BOOKS & AUTHORS ---", "// --- NEW AUTHOR DASHBOARD ROUTES ---", "books.js", "/")
extract_section("// --- NEW AUTHOR DASHBOARD ROUTES ---", "// --------------------------------------------------------", "authors.js", "/")
extract_section("// --------------------------------------------------------", "// --- FORMS MANAGEMENT ---", "admin.js", "/")
extract_section("// --- AUTHOR EVENTS MANAGEMENT ---", "// --- EVENTS MANAGEMENT (PHASE 1) ---", "author_events.js", "/")
extract_section("// --- EVENTS MANAGEMENT (PHASE 1) ---", "// --- FORMS MANAGEMENT ---", "admin_events.js", "/") # Actually they are out of order, let's just do what's left

# The extraction of admin.js and author_events.js might fail because of marker ordering.
# Let's write a safer extraction for whatever remains that is `app.something`
