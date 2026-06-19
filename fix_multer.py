with open('server/index.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_upload = '''app.post('/api/authors/register', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
  { name: 'paymentScreenshot', maxCount: 1 }
]), async (req, res) => {'''

new_upload = '''app.post('/api/authors/register', upload.any(), async (req, res) => {'''

content = content.replace(old_upload, new_upload)

old_files = '''    // In local dev, store local URL. In prod, this would be an S3 URL.
    const files = req.files || {};
    const photoUrl = files['photo'] ? `/uploads/${files['photo'][0].filename}` : null;
    const coverUrl = files['cover'] ? `/uploads/${files['cover'][0].filename}` : null;
    const paymentScreenshotUrl = files['paymentScreenshot'] ? `/uploads/${files['paymentScreenshot'][0].filename}` : null;'''

new_files = '''    // In local dev, store local URL. In prod, this would be an S3 URL.
    let photoUrl = null, coverUrl = null, paymentScreenshotUrl = null;
    if (Array.isArray(req.files)) {
       for (const file of req.files) {
          if (file.fieldname === 'photo') photoUrl = `/uploads/${file.filename}`;
          if (file.fieldname === 'cover') coverUrl = `/uploads/${file.filename}`;
          if (file.fieldname === 'paymentScreenshot') paymentScreenshotUrl = `/uploads/${file.filename}`;
       }
    } else if (req.files) {
       photoUrl = req.files['photo'] ? `/uploads/${req.files['photo'][0].filename}` : null;
       coverUrl = req.files['cover'] ? `/uploads/${req.files['cover'][0].filename}` : null;
       paymentScreenshotUrl = req.files['paymentScreenshot'] ? `/uploads/${req.files['paymentScreenshot'][0].filename}` : null;
    }'''

content = content.replace(old_files, new_files)

with open('server/index.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated register route to use upload.any()")
