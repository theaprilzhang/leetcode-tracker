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
            
            # Fix paths
            content = re.sub(r'url\("/', 'url("./', content)
            content = re.sub(r'href="/', 'href="./', content)
            content = re.sub(r'src="/', 'src="./', content)
            
            # Fix double assets
            content = content.replace("assets/assets", "assets")
            
            with open(fp, "w", encoding="utf-8") as f:
                f.write(content)
