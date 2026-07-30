import os

with open("/home/admin/.gemini/antigravity/scratch/cloudflare-data-hub/app.js", "r", encoding="utf-8") as f:
    js_content = f.read()

script = f'''import os

js_code = {repr(js_content)}

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

print("Overwritten app.js with 100% bulletproof null-checked logic!")
'''

with open("/home/admin/.gemini/antigravity/scratch/cloudflare-data-hub/deploy_bulletproof.py", "w", encoding="utf-8") as f:
    f.write(script)

print("Generated deploy_bulletproof.py!")
