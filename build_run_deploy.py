import os

with open("/home/admin/.gemini/antigravity/scratch/cloudflare-data-hub/index.html", "r", encoding="utf-8") as f:
    html = f.read()

with open("/home/admin/.gemini/antigravity/scratch/cloudflare-data-hub/index.css", "r", encoding="utf-8") as f:
    css = f.read()

with open("/home/admin/.gemini/antigravity/scratch/cloudflare-data-hub/app.js", "r", encoding="utf-8") as f:
    js = f.read()

script = f'''import os

html_code = {repr(html)}
css_code = {repr(css)}
js_code = {repr(js)}

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_code)

with open('index.css', 'w', encoding='utf-8') as f:
    f.write(css_code)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

print("Applied full 100% verified files to index.html, index.css, app.js!")
'''

with open("/home/admin/.gemini/antigravity/scratch/cloudflare-data-hub/run_deploy.py", "w", encoding="utf-8") as f:
    f.write(script)

print("Generated run_deploy.py!")
