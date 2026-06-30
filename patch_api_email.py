import os

file_path = "server/routes/api.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

email_snippet = """
    if (typeof sendNotificationEmail === 'function' && typeof emailWrap === 'function') {
      const emailContent = `
        <p>Dear ${author.name},</p>
        <p>Thank you for registering with the Pune Authors' Association.</p>
        <p>Your profile has been created and is currently under admin review.</p>
        <p>You will receive another email once your application is approved or rejected.</p>
        <p>Dashboard access will be available only after your application has been approved.</p>
      `;
      sendNotificationEmail(author.email, "Registration Received - PAA", emailWrap("Registration Received", emailContent));
    }
"""

if "Registration Received - PAA" not in content:
    content = content.replace(
        "res.status(201).json(author);",
        f"{email_snippet}\n    res.status(201).json(author);"
    )
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Email added.")
else:
    print("Email already exists.")
