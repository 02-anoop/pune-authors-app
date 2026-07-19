import os

file_path = "src/app/components/AuthorRegistrationPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add social media validation
validation_snippet = """
    if (key === "city" && !value) error = "City is required.";
    if (key === "state" && !value) error = "State is required.";
    
    // Social Media
    if (key === "facebook" && value && !/^https?:\\/\\//.test(String(value))) error = "Must be a valid URL starting with http:// or https://";
    if (key === "instagram" && value && !/^https?:\\/\\//.test(String(value)) && !String(value).startsWith('@')) error = "Must be a valid URL or @username";
    if (key === "linkedin" && value && !/^https?:\\/\\//.test(String(value))) error = "Must be a valid URL starting with http:// or https://";
    if (key === "youtube" && value && !/^https?:\\/\\//.test(String(value))) error = "Must be a valid URL starting with http:// or https://";
"""

content = content.replace(
    "if (key === \"city\" && !value) error = \"City is required.\";\n    if (key === \"state\" && !value) error = \"State is required.\";",
    validation_snippet
)

# And make sure error is displayed
content = content.replace(
    "<input type=\"text\" value={form.instagram} onChange={(e) => update(\"instagram\", e.target.value)} className=\"dash-input w-full\" placeholder=\"Instagram URL or @username\" />",
    "<input type=\"text\" value={form.instagram} onChange={(e) => update(\"instagram\", e.target.value)} className={`dash-input w-full ${errors.instagram ? '!border-red-500' : ''}`} placeholder=\"Instagram URL or @username\" />\n                      {errors.instagram && <div className=\"text-red-500 text-xs mt-1 font-medium\">{errors.instagram}</div>}"
)
content = content.replace(
    "<input type=\"text\" value={form.facebook} onChange={(e) => update(\"facebook\", e.target.value)} className=\"dash-input w-full\" placeholder=\"Facebook Profile URL\" />",
    "<input type=\"text\" value={form.facebook} onChange={(e) => update(\"facebook\", e.target.value)} className={`dash-input w-full ${errors.facebook ? '!border-red-500' : ''}`} placeholder=\"Facebook Profile URL\" />\n                      {errors.facebook && <div className=\"text-red-500 text-xs mt-1 font-medium\">{errors.facebook}</div>}"
)
content = content.replace(
    "<input type=\"text\" value={form.linkedin} onChange={(e) => update(\"linkedin\", e.target.value)} className=\"dash-input w-full\" placeholder=\"LinkedIn Profile URL\" />",
    "<input type=\"text\" value={form.linkedin} onChange={(e) => update(\"linkedin\", e.target.value)} className={`dash-input w-full ${errors.linkedin ? '!border-red-500' : ''}`} placeholder=\"LinkedIn Profile URL\" />\n                      {errors.linkedin && <div className=\"text-red-500 text-xs mt-1 font-medium\">{errors.linkedin}</div>}"
)
content = content.replace(
    "<input type=\"text\" value={form.youtube} onChange={(e) => update(\"youtube\", e.target.value)} className=\"dash-input w-full\" placeholder=\"YouTube Channel URL\" />",
    "<input type=\"text\" value={form.youtube} onChange={(e) => update(\"youtube\", e.target.value)} className={`dash-input w-full ${errors.youtube ? '!border-red-500' : ''}`} placeholder=\"YouTube Channel URL\" />\n                      {errors.youtube && <div className=\"text-red-500 text-xs mt-1 font-medium\">{errors.youtube}</div>}"
)

# And missing fields check for "purposeOfWriting"
content = content.replace(
    "if (!form.format) missingBookFields.push('Format');",
    "if (!form.format) missingBookFields.push('Format');\n                        if (!form.purposeOfWriting) missingBookFields.push('Purpose of Writing');"
)
content = content.replace(
    "if (!form.format) missingContinueFields.push('Format');",
    "if (!form.format) missingContinueFields.push('Format');\n                        if (!form.purposeOfWriting) missingContinueFields.push('Purpose of Writing');"
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Validation patched.")
