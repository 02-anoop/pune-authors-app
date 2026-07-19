import re

with open('server/routes/api.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace authenticateToken with verifyToken, isAdmin
content = content.replace("router.get('/api/admin/settings', authenticateToken, async (req, res) => {", "router.get('/api/admin/settings', verifyToken, isAdmin, async (req, res) => {")
content = content.replace("router.post('/api/admin/settings', authenticateToken, async (req, res) => {", "router.post('/api/admin/settings', verifyToken, isAdmin, async (req, res) => {")

# Remove the redundant role check since isAdmin handles it
content = content.replace("  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });\n", "")

with open('server/routes/api.js', 'w', encoding='utf-8') as f:
    f.write(content)
