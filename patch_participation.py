import os
import re

api_file = r'c:\Users\arvin\Desktop\pune-authors-app\server\routes\api.js'
ops_file = r'c:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx'
author_file = r'c:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx'

def patch_api():
    with open(api_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update PUT /api/admin/events/:id
    put_regex = re.compile(r'const \{([^}]+aggRevenue[^}]+)\} = req\.body;')
    if put_regex.search(content):
        old_destruct = put_regex.search(content).group(0)
        if 'aggEligibleAuthors' not in old_destruct:
            new_destruct = old_destruct.replace('aggRevenue', 'aggRevenue, aggEligibleAuthors')
            content = content.replace(old_destruct, new_destruct)
            
            update_data_reg = re.compile(r'if \(aggRevenue !== undefined\) updateData\.aggRevenue = aggRevenue \? parseFloat\(aggRevenue\) : null;')
            if update_data_reg.search(content):
                insert_idx = update_data_reg.search(content).end()
                content = content[:insert_idx] + "\n    if (aggEligibleAuthors !== undefined) updateData.aggEligibleAuthors = aggEligibleAuthors ? parseInt(aggEligibleAuthors) : null;" + content[insert_idx:]

    # 2. Update POST /api/admin/events
    post_regex = re.compile(r'aggRevenue:\s*req\.body\.aggRevenue\s*\?\s*parseFloat\(req\.body\.aggRevenue\)\s*:\s*null,?')
    if post_regex.search(content):
        old_post = post_regex.search(content).group(0)
        if 'aggEligibleAuthors' not in content[post_regex.search(content).start():post_regex.search(content).start()+150]:
            content = content.replace(old_post, old_post + "\n        aggEligibleAuthors: req.body.aggEligibleAuthors ? parseInt(req.body.aggEligibleAuthors) : null,")

    # 3. Update attachParticipation calculation in Author Dashboard API
    calc_regex = re.compile(r'const eligibleAuthorsCount = allAuthors\.filter.*?length;', re.DOTALL)
    if calc_regex.search(content):
        old_calc = calc_regex.search(content).group(0)
        new_calc = """let eligibleAuthorsCount = evt.aggEligibleAuthors;
      if (eligibleAuthorsCount == null) {
          eligibleAuthorsCount = allAuthors.filter(a => {
              const joinDate = a.groupJoiningDate ? new Date(a.groupJoiningDate) : new Date(a.createdAt);
              joinDate.setHours(0, 0, 0, 0);
              return evTime >= joinDate.getTime();
          }).length;
      }"""
        content = content.replace(old_calc, new_calc)

    with open(api_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched api.js")

def patch_ops():
    with open(ops_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update form data appends
    append_reg = re.compile(r"fd\.append\('aggRevenue',.*?;\n")
    if append_reg.search(content):
        # We might have multiple, replace all safely
        content = re.sub(
            r"(fd\.append\('aggRevenue', target\.aggRevenue\?\.value \|\| '0'\);)",
            r"\1\n                  fd.append('aggEligibleAuthors', target.aggEligibleAuthors?.value || '0');",
            content
        )
        content = re.sub(
            r"(formData\.append\('aggRevenue', selectedEventBreakdown\.aggRevenue\?\.toString\(\) \|\| '0'\);)",
            r"\1\n        formData.append('aggEligibleAuthors', selectedEventBreakdown.aggEligibleAuthors?.toString() || '0');",
            content
        )

    # 2. UI for editing KPI (aggEligibleAuthors)
    # Find the Total Authors block and duplicate it for Total Registered
    authors_kpi_reg = re.compile(r'(<div className=\{`bg-gray-50 border rounded-xl p-4 shadow-sm flex flex-col justify-between \$\{isEditingKPIs \? "border-paa-navy/40 ring-1 ring-paa-navy/10" : "border-gray-200"}`\}>.*?Total Authors.*?</div>\s*</div>)', re.DOTALL)
    if authors_kpi_reg.search(content):
        old_block = authors_kpi_reg.search(content).group(1)
        if 'Total Registered' not in content:
            new_block = old_block.replace('Total Authors', 'Total Participated')
            
            registered_block = old_block.replace('Total Authors', 'Total Registered')
            registered_block = registered_block.replace('aggAuthors', 'aggEligibleAuthors')
            registered_block = registered_block.replace('totalAuthors', 'totalRegistered')
            
            content = content.replace(old_block, registered_block + '\n\n' + new_block)

    # Add totalRegistered calculation
    calc_authors = re.compile(r"const totalAuthors = selectedEventBreakdown\.isLegacy \? \(selectedEventBreakdown\.aggAuthors != null \? selectedEventBreakdown\.aggAuthors : 'NA'\) : totalAuthorsBase;")
    if calc_authors.search(content):
        if 'const totalRegistered =' not in content:
            old_calc = calc_authors.search(content).group(0)
            new_calc = "const totalRegistered = selectedEventBreakdown.isLegacy ? (selectedEventBreakdown.aggEligibleAuthors != null ? selectedEventBreakdown.aggEligibleAuthors : 'NA') : totalAuthorsBase;\n      " + old_calc
            content = content.replace(old_calc, new_calc)
            
    # Also fix participation percentage calculation in Ops
    ops_part_reg = re.compile(r"const participationPercentage = eligibleAuthorsCount === 0 \? 0 : Math\.round\(\(participated / eligibleAuthorsCount\) \* 100\);")
    if ops_part_reg.search(content):
        old_ops_part = ops_part_reg.search(content).group(0)
        new_ops_part = "const participationPercentage = eligibleAuthorsCount === 0 ? 0 : Math.round((participated / (evt.aggEligibleAuthors || eligibleAuthorsCount)) * 100);"
        content = content.replace(old_ops_part, new_ops_part)

    with open(ops_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched OperationsDashboardPage.tsx")

patch_api()
patch_ops()
