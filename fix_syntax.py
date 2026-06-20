import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_end = """        </Routes>
      </div>
    </div>
  );
}

function OverviewTab({ data, onRefresh }: { data: any, onRefresh: () => void }) {"""

new_end = """        </Routes>
      </div>
    </div>
    </>
  );
}

function OverviewTab({ data, onRefresh }: { data: any, onRefresh: () => void }) {"""

if old_end in content:
    content = content.replace(old_end, new_end)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
