require('dotenv').config();
const nodemailer = require('nodemailer');

let mailTransporter;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  mailTransporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to your email provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
} else {
  mailTransporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'windows'
  });
}

const sendNotificationEmail = async (to, subject, htmlBody) => {
  if (!mailTransporter || !to) return;
  try {
    let info = await mailTransporter.sendMail({
      from: '"Pune Authors\' Association" <noreply@puneauthors.com>',
      to,
      subject,
      html: htmlBody,
      text: htmlBody.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
    });
    console.log(`[EMAIL SENT] to ${to}: ${subject}`);
  } catch (err) {
    console.error('Error sending email:', err);
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
    <div class="header">
      <h1>Pune Authors' Association</h1>
      <p>puneauthors.com</p>
    </div>
    <div class="body">
      <h2>${heading}</h2>
      ${content}
    </div>
    <div class="footer">This is an automated message from the PAA platform. Please do not reply directly to this email.</div>
  </div>
</body></html>
`;

async function test() {
  const email = "arvindp.it.23@nitj.ac.in";
  
  // 1. Send Approval Email
  const approveContent = `
    <p>Dear Arvind Profile,</p>
    <p>Congratulations! Your author profile has been officially approved by the Pune Authors' Association editorial team.</p>
    <p>Your books are now live in the catalogue. You can log in to your dashboard to manage your inventory, track orders, and participate in upcoming events.</p>
    <p>Welcome to the community!</p>
  `;
  await sendNotificationEmail(email, "Welcome to PAA - Your Profile is Approved!", emailWrap("Profile Approved", approveContent));
  
  // 2. Send Rejection Email
  const rejectReason = "Book cover image is blurry and synopsis is missing.";
  const rejectContent = `
    <p>Dear Arvind Profile,</p>
    <p>We have reviewed your author profile application for the Pune Authors' Association.</p>
    <p>Unfortunately, your application has been rejected at this time for the following reason(s):</p>
    <p style="padding: 10px; background-color: #fef2f2; border-left: 4px solid #ef4444; color: #b91c1c;">
      <strong>${rejectReason}</strong>
    </p>
    <p>Please log in to your dashboard to resolve these issues and update your profile. Once the necessary changes are made, your profile will be re-evaluated.</p>
  `;
  await sendNotificationEmail(email, "Action Required: Your PAA Profile Status", emailWrap("Profile Review Update", rejectContent));
  
  console.log("Done!");
}

test();
