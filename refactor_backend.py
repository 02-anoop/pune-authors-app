import os
import re

server_dir = r"c:\Users\arvin\Desktop\pune-authors-app\server"
index_path = os.path.join(server_dir, "index.js")

# Creating directories
for d in ['routes', 'controllers', 'middleware', 'utils', 'config']:
    os.makedirs(os.path.join(server_dir, d), exist_ok=True)

with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

# We need to extract utils and middleware manually to prevent breaking routes
# Actually, since this is extremely risky, I will implement a simpler automated python script
# to at least extract the cache, mail functions, and middleware into separate files.

# Step 1: Extract Middleware
middleware_js = """
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { isAdmin, verifyToken, JWT_SECRET };
"""
with open(os.path.join(server_dir, 'middleware', 'auth.middleware.js'), 'w', encoding="utf-8") as f:
    f.write(middleware_js.strip())

print("Middleware created.")
