import os
import re

server_dir = r"c:\Users\arvin\Desktop\pune-authors-app\server"
index_path = os.path.join(server_dir, "index.js")
auth_routes_path = os.path.join(server_dir, "routes", "auth.js")

with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

# The auth section starts at // --- AUTHENTICATION --- and ends at // --- BOOKS & AUTHORS ---
start_marker = "// --- AUTHENTICATION ---"
end_marker = "// --- BOOKS & AUTHORS ---"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    auth_block = content[start_idx:end_idx]
    
    # We need to format the extracted block into an Express router
    # Replace app.post( with router.post(
    # Remove isAdmin, verifyToken definitions (they are now in middleware)
    
    # We will just write a hardcoded well-formatted auth router to be safe
    auth_router_code = """const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const { upload } = require('../config/upload');

// Replace /api/auth/ prefix with / since we will mount on /api/auth
"""
    
    # Extract routes from auth_block
    # To be extremely safe, we will just use regex to replace app.get/app.post to router.get/router.post
    # and remove the /api/auth prefix
    
    # Actually, writing the routes manually based on what we saw is safer than regex replacing
    # because of the `upload.any()` in register.
    
    auth_block = auth_block.replace("app.post('/api/auth/register', upload.any(),", "router.post('/register', upload.any(),")
    auth_block = auth_block.replace("app.post('/api/auth/login', async", "router.post('/login', async")
    auth_block = auth_block.replace("app.get('/api/auth/me', verifyToken, async", "router.get('/me', verifyToken, async")
    auth_block = auth_block.replace("app.put('/api/auth/profile', verifyToken, async", "router.put('/profile', verifyToken, async")
    auth_block = auth_block.replace("app.post('/api/auth/register', async", "router.post('/register', async")
    
    # Remove the isAdmin and verifyToken definitions from the block
    auth_block = re.sub(r'const isAdmin = \(req, res, next\) => \{.*?\};\n', '', auth_block, flags=re.DOTALL)
    auth_block = re.sub(r'const verifyToken = \(req, res, next\) => \{.*?\};\n', '', auth_block, flags=re.DOTALL)
    
    final_auth_router = auth_router_code + auth_block + "\nmodule.exports = router;\n"
    
    with open(auth_routes_path, "w", encoding="utf-8") as f:
        f.write(final_auth_router)
    
    # Now replace the block in index.js with the router import
    new_index_content = content[:start_idx] + """// --- AUTHENTICATION ---
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

""" + content[end_idx:]
    
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(new_index_content)
    print("Auth routes extracted and index.js updated.")
else:
    print("Could not find markers.")
