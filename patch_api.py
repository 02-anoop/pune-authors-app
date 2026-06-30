import os

file_path = "server/routes/api.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update author destructuring in register
content = content.replace(
    "whyJoining, aadharNumber, address, extraData, transactionId\n    } = req.body;",
    "whyJoining, aadharNumber, address, district, pincode, extraData, transactionId\n    } = req.body;"
)

# 2. Update booksArray mapping to include purpose
content = content.replace(
    "edition: req.body.edition, format: req.body.format",
    "edition: req.body.edition, format: req.body.format, purpose: req.body.purposeOfWriting"
)

# 3. Update author creation to include district, pincode, dob, etc
content = content.replace(
    "aadharNumber,\n        address,\n        extraData:",
    "aadharNumber,\n        address,\n        district,\n        pincode,\n        dob,\n        skillsJson: (() => { try { return JSON.parse(skills) } catch(e) { return [] } })(),\n        hobbiesJson: (() => { try { return JSON.parse(hobbies) } catch(e) { return [] } })(),\n        qualificationsJson: qualificationsArray,\n        extraData:"
)

# 4. Update book creation inside author to include purpose
content = content.replace(
    "format: b.format,\n            coverUrl: covers[idx]",
    "format: b.format,\n            purpose: b.purpose,\n            coverUrl: covers[idx]"
)

# --- REAPPLY ---
# 5. Update author destructuring in reapply-full
content = content.replace(
    "whyJoining, aadharNumber, address, extraData, transactionId\n    } = req.body;",
    "whyJoining, aadharNumber, address, district, pincode, extraData, transactionId\n    } = req.body;"
)

# 6. Update booksArray mapping in reapply-full
content = content.replace(
    "edition: req.body.edition, format: req.body.format\n       });",
    "edition: req.body.edition, format: req.body.format, purpose: req.body.purposeOfWriting\n       });"
)

# 7. Update author update in reapply-full
content = content.replace(
    "aadharNumber, address, status: 'Pending',",
    "aadharNumber, address, district, pincode, dob, skillsJson: (() => { try { return JSON.parse(skills) } catch(e) { return [] } })(), hobbiesJson: (() => { try { return JSON.parse(hobbies) } catch(e) { return [] } })(), qualificationsJson: qualificationsArray, status: 'Pending',"
)

# 8. Update book bookData in reapply-full
content = content.replace(
    "edition: b.edition, format: b.format\n       };",
    "edition: b.edition, format: b.format, purpose: b.purpose\n       };"
)

# --- EDIT AUTHOR PROFILE (Admin) ---
content = content.replace(
    "whyJoining, books } = req.body;",
    "whyJoining, books, district, pincode, dob } = req.body;"
)

content = content.replace(
    "...(whyJoining !== undefined && { whyJoining }),",
    "...(whyJoining !== undefined && { whyJoining }),\n        ...(district !== undefined && { district }),\n        ...(pincode !== undefined && { pincode }),\n        ...(dob !== undefined && { dob }),\n        ...(skills !== undefined && { skillsJson: (() => { try { return JSON.parse(skills) } catch(e) { return [] } })() }),\n        ...(hobbies !== undefined && { hobbiesJson: (() => { try { return JSON.parse(hobbies) } catch(e) { return [] } })() }),"
)

content = content.replace(
    "synopsis: b.synopsis,",
    "synopsis: b.synopsis,\n              purpose: b.purpose,"
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("api.js patched.")
