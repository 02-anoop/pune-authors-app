import re

with open('src/app/components/LandingPage.tsx', 'r') as f:
    content = f.read()

# 1. Remove the top links
top_links_pattern = r'<div style=\{\{ display: "flex", gap: "2rem", alignItems: "center" \}\}>\s*<Link to="/signup\?role=AUTHOR" className="link-underline"[\s\S]*?</Link>\s*<Link to="/catalogue" className="link-underline-subtle"[\s\S]*?</Link>\s*</div>'
content = re.sub(top_links_pattern, '', content)

# 2. Extract BOOKS PORTFOLIO
portfolio_pattern = r'(\s*\{\/\* ── BOOKS PORTFOLIO \(REFINED CARDS\) ── \*\/[\s\S]*?<\/section>)'
portfolio_match = re.search(portfolio_pattern, content)
if portfolio_match:
    portfolio_text = portfolio_match.group(1)
    content = content.replace(portfolio_text, '')
else:
    print("Could not find BOOKS PORTFOLIO")
    exit(1)

# 3. Remove the 'Browse All Books' button FadeIn block
button_pattern = r'\s*<FadeIn delay=\{300\}>\s*<div style=\{\{ display: "flex", justifyContent: "center", paddingBottom: "4rem" \}\}>\s*<Link to="/catalogue"[\s\S]*?Browse All Books <ArrowRight size=\{14\} />\s*</Link>\s*</div>\s*</FadeIn>'
content = re.sub(button_pattern, '', content)

# 4. Insert the portfolio text before ABOUT SECTION
about_pattern = r'(\s*\{\/\* ── ABOUT SECTION \(ELEGANT SPLIT\) ── \*\/)'
content = re.sub(about_pattern, lambda m: portfolio_text + m.group(1), content)

with open('src/app/components/LandingPage.tsx', 'w') as f:
    f.write(content)

print("Rearrangement complete.")
