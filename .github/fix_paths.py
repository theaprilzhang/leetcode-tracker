#!/usr/bin/env python3
import os
import re

for root, dirs, files in os.walk("docs"):
    for file in files:
        if file.endswith(".html"):
            fp = os.path.join(root, file)
            with open(fp, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Remove all old base tags
            content = re.sub(r'<base href="[^"]*">', "", content)
            
            # Add single correct base tag
            if '<base href="/leetcode-tracker/">' not in content:
                content = content.replace("<head>", '<head><base href="/leetcode-tracker/">')
            
            # Fix paths: use absolute paths under the repo path so assets load
            # regardless of base tag or relative resolution
            content = re.sub(r'url\("\./?assets', 'url("/leetcode-tracker/assets', content)
            content = re.sub(r'url\("/assets', 'url("/leetcode-tracker/assets', content)
            content = re.sub(r'href=\"\./?assets', 'href=\"/leetcode-tracker/assets', content)
            content = re.sub(r'href=\"/assets', 'href=\"/leetcode-tracker/assets', content)
            content = re.sub(r'src=\"\./?_expo', 'src=\"/leetcode-tracker/_expo', content)
            content = re.sub(r'src=\"/_expo', 'src=\"/leetcode-tracker/_expo', content)
            # favicon
            content = content.replace('href="./favicon.ico"', 'href="/leetcode-tracker/favicon.ico"')
            # Fix double assets (if any)
            content = content.replace("assets/assets", "assets")
            
            with open(fp, "w", encoding="utf-8") as f:
                f.write(content)
