import json
import os

SETTINGS_FILE = 'server/settings.json'
if not os.path.exists(SETTINGS_FILE):
    with open(SETTINGS_FILE, 'w') as f:
        json.dump({"authorDynamicFields": []}, f)

with open('server/index.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_routes = '''// --- DYNAMIC AUTHOR FIELDS ---
app.get('/api/admin/author-fields', verifyToken, (req, res) => {
    try {
        const settings = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'settings.json')));
        res.json(settings.authorDynamicFields || []);
    } catch (e) {
        res.json([]);
    }
});

app.post('/api/admin/author-fields', verifyToken, (req, res) => {
    try {
        const fields = req.body.fields;
        const settingsPath = require('path').join(__dirname, 'settings.json');
        let settings = {};
        if (require('fs').existsSync(settingsPath)) {
            settings = JSON.parse(require('fs').readFileSync(settingsPath));
        }
        settings.authorDynamicFields = fields;
        require('fs').writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to save fields' });
    }
});

app.put('/api/author/profile/extra', verifyToken, async (req, res) => {
    try {
        const author = await prisma.author.findUnique({ where: { email: req.user.email } });
        if (!author) return res.status(404).json({ error: "Author not found" });
        await prisma.author.update({
            where: { id: author.id },
            data: { extraData: req.body.extraData }
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update extra data' });
    }
});
'''

# Find a good place to insert, e.g., before app.listen
content = content.replace('const PORT =', new_routes + '\nconst PORT =')

with open('server/index.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added dynamic fields to backend")
