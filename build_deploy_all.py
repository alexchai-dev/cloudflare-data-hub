import os
import subprocess

# Read scratch files
with open("/home/admin/.gemini/antigravity/scratch/cloudflare-data-hub/index.html", "r", encoding="utf-8") as f:
    html = f.read()

with open("/home/admin/.gemini/antigravity/scratch/cloudflare-data-hub/index.css", "r", encoding="utf-8") as f:
    css = f.read()

with open("/home/admin/.gemini/antigravity/scratch/cloudflare-data-hub/app.js", "r", encoding="utf-8") as f:
    js = f.read()

# Generate updater python script for Fedora terminal
updater_code = f'''import os

html_data = {repr(html)}
css_data = {repr(css)}
js_data = {repr(js)}

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html_data)

with open("index.css", "w", encoding="utf-8") as f:
    f.write(css_data)

with open("app.js", "w", encoding="utf-8") as f:
    f.write(js_data)

print("Updated index.html, index.css, app.js successfully!")
'''

with open("/home/admin/.gemini/antigravity/scratch/cloudflare-data-hub/deploy_all.py", "w", encoding="utf-8") as f:
    f.write(updater_code)

print("Created deploy_all.py successfully!")
