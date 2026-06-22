with open('server/index.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_routes = '''
// --- DYNAMIC AUTHOR FIELDS ---
app.get('/api/admin/author-fields', verifyToken, (req, res) => {
    try {
        const settings = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'settings.json')));
        res.json(settings.authorDynamicFields || []);
    } catch(e) { res.json([]); }
});

app.post('/api/admin/author-fields', verifyToken, (req, res) => {
    try {
        const p = require('path').join(__dirname, 'settings.json');
        const settings = require('fs').existsSync(p) ? JSON.parse(require('fs').readFileSync(p)) : {};
        settings.authorDynamicFields = req.body.fields;
        require('fs').writeFileSync(p, JSON.stringify(settings, null, 2));
        res.json({ success: true });
    } catch(e) { res.status(500).json({ error: 'Failed to save settings' }); }
});

app.put('/api/author/profile/extra', verifyToken, async (req, res) => {
    try {
        const author = await prisma.author.findUnique({ where: { email: req.user.email } });
        await prisma.author.update({
            where: { id: author.id },
            data: { extraData: req.body }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save extra data' });
    }
});

'''

# Insert before app.listen
content = content.replace('app.listen(PORT', new_routes + 'app.listen(PORT')

with open('server/index.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Restored dynamic routes")
