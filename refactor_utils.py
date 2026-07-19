import os

server_dir = r"c:\Users\arvin\Desktop\pune-authors-app\server"
index_path = os.path.join(server_dir, "index.js")

with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

# Directories
for d in ['routes', 'controllers', 'middleware', 'utils', 'config']:
    os.makedirs(os.path.join(server_dir, d), exist_ok=True)

# 1. config/db.js
db_content = """const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
module.exports = prisma;
"""
with open(os.path.join(server_dir, 'config', 'db.js'), 'w', encoding='utf-8') as f:
    f.write(db_content)

# 2. utils/cache.js
cache_content = """const cache = new Map();
const CACHE_TTL = 30 * 1000;
function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > entry.ttl) { cache.delete(key); return null; }
  return entry.data;
}
function setCache(key, data, ttl = CACHE_TTL) {
  cache.set(key, { data, ts: Date.now(), ttl });
}
function invalidateCache(pattern) {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) cache.delete(key);
  }
}
module.exports = { cache, getCache, setCache, invalidateCache };
"""
with open(os.path.join(server_dir, 'utils', 'cache.js'), 'w', encoding='utf-8') as f:
    f.write(cache_content)

# 3. utils/email.js
email_content = """const nodemailer = require('nodemailer');
let mailTransporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
} else {
  mailTransporter = nodemailer.createTransport({ streamTransport: true, newline: 'windows' });
}
const sendNotificationEmail = async (to, subject, htmlBody) => {
  if (!mailTransporter || !to) return;
  try {
    let info = await mailTransporter.sendMail({
      from: '"Pune Authors\' Association" <noreply@puneauthors.com>',
      to, subject, html: htmlBody,
      text: htmlBody.replace(/<[^>]+>/g, '').replace(/\\s+/g, ' ').trim(),
    });
    console.log(`[EMAIL SENT] to ${to}: ${subject}`);
    const otpMatch = htmlBody.match(/<h2[^>]*>(\\d{6})<\\/h2>/);
    if (otpMatch) {
      console.log(`\\n========================================`);
      console.log(`🔑 DEV MODE OTP: ${otpMatch[1]}`);
      console.log(`========================================\\n`);
    }
  } catch (err) {
    console.error('Email failed:', err.message);
  }
};
const emailWrap = (heading, content) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f8; margin: 0; padding: 0; color: #222; }
  .wrap { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.08); }
  .header { background: #1a1a2e; color: #fff; padding: 28px 32px; }
  .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
  .header p { margin: 6px 0 0; font-size: 13px; color: #94a3b8; }
  .body { padding: 32px; }
  .body h2 { margin: 0 0 8px; font-size: 18px; color: #1a1a2e; }
  .body p { margin: 0 0 16px; font-size: 15px; line-height: 1.65; color: #444; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
  th { background: #f0f4ff; color: #1a1a2e; text-align: left; padding: 10px 14px; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
  td { padding: 10px 14px; border-bottom: 1px solid #f0f0f4; vertical-align: top; }
  .badge { display: inline-block; background: #22c55e; color: #fff; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; }
  .footer { padding: 20px 32px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f0f0f4; }
</style></head>
<body>
  <div class="wrap">
    <div class="header"><h1>Pune Authors' Association</h1><p>puneauthors.com</p></div>
    <div class="body"><h2>${heading}</h2>${content}</div>
    <div class="footer">This is an automated message from the PAA platform. Please do not reply directly to this email.</div>
  </div>
</body></html>`;
module.exports = { sendNotificationEmail, emailWrap };
"""
with open(os.path.join(server_dir, 'utils', 'email.js'), 'w', encoding='utf-8') as f:
    f.write(email_content)

# 4. utils/helpers.js
helpers_content = """const inr = (n) => `₹${parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
module.exports = { inr };
"""
with open(os.path.join(server_dir, 'utils', 'helpers.js'), 'w', encoding='utf-8') as f:
    f.write(helpers_content)

# 5. config/upload.js
upload_content = """const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });
module.exports = { upload, uploadDir };
"""
with open(os.path.join(server_dir, 'config', 'upload.js'), 'w', encoding='utf-8') as f:
    f.write(upload_content)

# 6. middleware/auth.js
auth_middleware = """const jwt = require('jsonwebtoken');
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
with open(os.path.join(server_dir, 'middleware', 'auth.js'), 'w', encoding='utf-8') as f:
    f.write(auth_middleware)

print("Setup complete")
