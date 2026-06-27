import os
import re

server_dir = r"c:\Users\arvin\Desktop\pune-authors-app\server"
index_path = os.path.join(server_dir, "index.js")
routes_dir = os.path.join(server_dir, "routes")

with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "// --- BOOKS & AUTHORS ---"
start_idx = content.find(start_marker)

# Stop right before posRoutes logic
end_marker = "// --- POS APIs ---"
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    remaining_routes = content[start_idx:end_idx]
    
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
        
    replacement = """
const apiRoutes = require('./routes/api');
app.use('/', apiRoutes);

"""
    new_content = content[:start_idx] + replacement + content[end_idx:]
    
    # Remove old definitions
    new_content = new_content.replace("const { PrismaClient } = require('@prisma/client');\n", "")
    new_content = new_content.replace("const nodemailer = require('nodemailer');\n", "")
    new_content = re.sub(r"// --- IN-MEMORY CACHE ---.*?// --- AUTHENTICATION ---", "// --- AUTHENTICATION ---", new_content, flags=re.DOTALL)
    new_content = re.sub(r"const storage = multer\.diskStorage.*?const upload = multer\(\{ storage \}\);\n", "", new_content, flags=re.DOTALL)
    
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print("Successfully extracted remaining routes to api.js")
