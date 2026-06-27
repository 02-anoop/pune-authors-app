import os
import re

server_dir = r"c:\Users\arvin\Desktop\pune-authors-app\server"
index_path = os.path.join(server_dir, "index.js")
routes_dir = os.path.join(server_dir, "routes")

with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

# Find the first occurrence of app.get, app.post, app.put, app.delete
# We know they start after "// --- BOOKS & AUTHORS ---"
start_marker = "// --- BOOKS & AUTHORS ---"
start_idx = content.find(start_marker)

if start_idx != -1:
    # We will extract everything from here until the end, EXCEPT the server start block
    end_marker = "app.listen(PORT,"
    end_idx = content.find(end_marker)
    
    if end_idx != -1:
        # Step back to just before app.listen
        remaining_routes = content[start_idx:end_idx]
        
        # Replace app. with router.
        remaining_routes = re.sub(r"app\.(get|post|put|delete)\(", r"router.\1(", remaining_routes)
        
        router_code = f"""const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const {{ getCache, setCache, invalidateCache }} = require('../utils/cache');
const {{ isAdmin, verifyToken }} = require('../middleware/auth');
const {{ sendNotificationEmail, emailWrap }} = require('../utils/email');
const {{ upload }} = require('../config/upload');
const path = require('path');
const fs = require('fs');

"""
        final_router = router_code + remaining_routes + "\nmodule.exports = router;\n"
        
        with open(os.path.join(routes_dir, "api.js"), "w", encoding="utf-8") as f:
            f.write(final_router)
            
        # Replace in index.js
        replacement = """
const apiRoutes = require('./routes/api');
app.use('/', apiRoutes);

"""
        new_content = content[:start_idx] + replacement + content[end_idx:]
        
        # We also need to remove the top imports in index.js that are now in config/utils
        new_content = new_content.replace("const { PrismaClient } = require('@prisma/client');\n", "")
        new_content = new_content.replace("const nodemailer = require('nodemailer');\n", "")
        # Remove old cache definition
        new_content = re.sub(r"// --- IN-MEMORY CACHE ---.*?// --- AUTHENTICATION ---", "// --- AUTHENTICATION ---", new_content, flags=re.DOTALL)
        # Remove old multer definition
        new_content = re.sub(r"const storage = multer\.diskStorage.*?const upload = multer\(\{ storage \}\);\n", "", new_content, flags=re.DOTALL)
        
        with open(index_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        
        print("Successfully extracted remaining routes to api.js")
