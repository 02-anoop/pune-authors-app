with open('src/app/components/AuthorRegistrationPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_alert = '''                      const msg = e.response?.data?.error || e.message || "Unknown error";
                      alert(`Failed to submit: ${msg}`);'''

new_alert = '''                      const msg = e.response?.data?.error || e.message || "Unknown error";
                      const details = e.response?.data?.details || "";
                      alert(`Failed to submit: ${msg} ${details}`);'''

content = content.replace(old_alert, new_alert)

with open('src/app/components/AuthorRegistrationPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated alert in AuthorRegistrationPage to show details")
