import os

author_path = "src/app/components/AuthorDashboardPage.tsx"
with open(author_path, "r", encoding="utf-8") as f:
    author_content = f.read()

# Fix ProfileSettings root wrapper
fix_target = """      </form>
    </div>

    {/* BUNDLE OFFER CONFIGURATION */}"""
fix_replace = """      </form>
    </div>

    {/* BUNDLE OFFER CONFIGURATION */}"""

# Wait, the ProfileSettings return statement starts with:
# return (
#   <div>
#     <h2 className="text-2xl font-serif text-paa-navy mb-8">Profile Settings</h2>
# ...

# We just need to wrap the whole return inside `<> ... </>`
# Let's find the start of ProfileSettings return

# ProfileSettings return
ret_target = """  return (
    <div>
      <h2 className="text-2xl font-serif text-paa-navy mb-8">Profile Settings</h2>"""
ret_replace = """  return (
    <>
    <div>
      <h2 className="text-2xl font-serif text-paa-navy mb-8">Profile Settings</h2>"""

if "<>\n    <div>" not in author_content:
    author_content = author_content.replace(ret_target, ret_replace)
    
end_target = """        </div>
      </div>
    </div>
  );
}"""

# Our injected bundle offer ends with `    </div>\n  );\n}`
# We need to change that `</div>` to `</div>\n    </>\n  );`
bundle_end_target = """        </div>
      </div>
    </div>
  );
}"""

# Actually, I injected:
#         </div>
#       </div>
#     </div>
#   );
# }

# Let's just do a specific replace for the end of ProfileSettings
if "</>\n  );\n}" not in author_content:
    author_content = author_content.replace("    </div>\n  );\n}\n\n\n\nfunction AuthorGallery()", "    </div>\n    </>\n  );\n}\n\n\n\nfunction AuthorGallery()")

with open(author_path, "w", encoding="utf-8") as f:
    f.write(author_content)
print("Fixed JSX wrapper in AuthorDashboardPage")
