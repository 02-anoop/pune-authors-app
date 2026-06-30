import os

file_path = "src/app/components/AuthorRegistrationPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Pre-fill updates
reapply_replace_1 = """address: initialData.address || "",
             district: initialData.district || "",
             pincode: initialData.pincode || "",
             aadharNumber: initialData.aadharNumber || "",
             dob: initialData.dob || initialData.age || "",
             experience: initialData.experience || "",
             skills: (() => { try { return JSON.parse(initialData.skillsJson) } catch(e) { return initialData.skills ? initialData.skills.split(',').map((s:any)=>s.trim()) : [] } })(),
             hobbies: (() => { try { return JSON.parse(initialData.hobbiesJson) } catch(e) { return initialData.hobbies ? initialData.hobbies.split(',').map((s:any)=>s.trim()) : [] } })(),"""

content = content.replace(
    """address: initialData.address || "",
             aadharNumber: initialData.aadharNumber || "",
             dob: initialData.age || "",
             experience: initialData.experience || "",
             skills: initialData.skills || "",
             hobbies: initialData.hobbies || "",""",
    reapply_replace_1
)

# And similarly for the other setForm in isReapply
content = content.replace(
    """address: initialData.address || "",
             aadharNumber: initialData.aadharNumber || "",
             dob: initialData.age || "",
             experience: initialData.experience || "",
             skills: initialData.skills || "",
             hobbies: initialData.hobbies || "",""",
    reapply_replace_1
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Prefill patched.")
