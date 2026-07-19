import os

# 1. Update schema.prisma
schema_path = "server/prisma/schema.prisma"
with open(schema_path, "r") as f:
    schema_content = f.read()

if "district           String?" not in schema_content:
    schema_content = schema_content.replace(
        "  address            String?",
        "  address            String?\n  district           String?\n  pincode            String?\n  dob                String?"
    )
    schema_content = schema_content.replace(
        "  extraData          Json?",
        "  extraData          Json?\n  qualificationsJson Json?\n  skillsJson         Json?\n  hobbiesJson        Json?"
    )
    schema_content = schema_content.replace(
        "  isbn            String?",
        "  isbn            String?\n  purpose         String?"
    )
    with open(schema_path, "w") as f:
        f.write(schema_content)
    print("Updated schema.prisma")

