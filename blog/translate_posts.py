#!/usr/bin/env python3
import os
import re
import sys
import time
import json
import urllib.request
import urllib.parse

POSTS_DIR = os.path.join(os.path.dirname(__file__), '_posts')
POSTS_FR_DIR = os.path.join(os.path.dirname(__file__), '_posts_fr')

os.makedirs(POSTS_FR_DIR, exist_ok=True)

def translate_raw(text):
    if not text or not text.strip():
        return text
    trimmed = text.strip()
    if re.match(r'^[0-9\s\-_.,:;/\\()\[\]{}]+$', trimmed):
        return text
    
    url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=fr&dt=t&q=' + urllib.parse.quote(text)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)'})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=12) as response:
                data = json.loads(response.read().decode('utf-8'))
                return ''.join([part[0] for part in data[0] if part and part[0]])
        except Exception as e:
            time.sleep(1.0 * (attempt + 1))
    return text

def protect_and_translate(text):
    if not text.strip():
        return text
    
    code_tokens = []
    def code_repl(match):
        code_tokens.append(match.group(0))
        return f'XYZCODE{len(code_tokens)-1}XYZ'
    
    protected = re.sub(r'`[^`\n]+`', code_repl, text)
    
    link_urls = []
    def link_repl(match):
        label = match.group(1)
        url = match.group(2)
        link_urls.append(url)
        return f'[{label}](XYZURL{len(link_urls)-1}XYZ)'
    
    protected = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', link_repl, protected)
    
    translated = translate_raw(protected)
    
    for idx, url in enumerate(link_urls):
        translated = re.sub(rf'XYZURL{idx}XYZ', lambda m, u=url: u, translated)
        
    for idx, code in enumerate(code_tokens):
        translated = re.sub(rf'XYZCODE{idx}XYZ', lambda m, c=code: c, translated)
        
    return translated

def translate_markdown_body(body):
    lines = body.split('\n')
    out_lines = []
    in_code_block = False
    buffer_para = []

    def flush_para():
        if not buffer_para:
            return
        full_text = ' '.join(buffer_para)
        trans = protect_and_translate(full_text)
        out_lines.append(trans)
        buffer_para.clear()

    for line in lines:
        stripped = line.strip()

        # Check for code block fences
        if stripped.startswith('```') or stripped.startswith('~~~'):
            flush_para()
            in_code_block = not in_code_block
            out_lines.append(line)
            continue

        if in_code_block:
            out_lines.append(line)
            continue

        # Blank line
        if not stripped:
            flush_para()
            out_lines.append(line)
            continue

        # HTML comments or tags that shouldn't be translated
        if stripped.startswith('<!--') or stripped.startswith('-->') or re.match(r'^<[a-zA-Z0-9/].*>.*</[a-zA-Z0-9]+>$', stripped):
            flush_para()
            out_lines.append(line)
            continue

        # Markdown headings (# Heading)
        heading_match = re.match(r'^(#{1,6}\s+)(.*)$', line)
        if heading_match:
            flush_para()
            hashes = heading_match.group(1)
            htext = heading_match.group(2)
            out_lines.append(hashes + protect_and_translate(htext))
            continue

        # List items (- item or * item or 1. item)
        list_match = re.match(r'^(\s*(?:[-*+]|\d+\.)\s+)(.*)$', line)
        if list_match:
            flush_para()
            prefix = list_match.group(1)
            item_text = list_match.group(2)
            out_lines.append(prefix + protect_and_translate(item_text))
            continue

        # Blockquotes (> Quote)
        quote_match = re.match(r'^(\s*>\s*)(.*)$', line)
        if quote_match:
            flush_para()
            prefix = quote_match.group(1)
            qtext = quote_match.group(2)
            out_lines.append(prefix + protect_and_translate(qtext))
            continue

        # Table rows (| Col 1 | Col 2 |)
        if stripped.startswith('|') and stripped.endswith('|'):
            flush_para()
            out_lines.append(line)
            continue

        # Normal text paragraph accumulation
        buffer_para.append(line)

    flush_para()
    return '\n'.join(out_lines)

def process_file(filename):
    src_path = os.path.join(POSTS_DIR, filename)
    dst_path = os.path.join(POSTS_FR_DIR, filename)

    with open(src_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split front matter
    parts = re.split(r'^---\s*$', content, flags=re.MULTILINE)
    if len(parts) >= 3:
        fm_text = parts[1]
        body = '---'.join(parts[2:])
    else:
        fm_text = ''
        body = content

    # Translate title in front matter
    new_fm_lines = []
    for fm_line in fm_text.split('\n'):
        title_m = re.match(r'^(title:\s*)(.*)$', fm_line)
        desc_m = re.match(r'^(description:\s*)(.*)$', fm_line)
        if title_m:
            prefix = title_m.group(1)
            orig_title = title_m.group(2).strip().strip('"\'')
            trans_title = protect_and_translate(orig_title)
            # Escape double quotes
            trans_title = trans_title.replace('"', '\\"')
            new_fm_lines.append(f'{prefix}"{trans_title}"')
        elif desc_m:
            prefix = desc_m.group(1)
            orig_desc = desc_m.group(2).strip().strip('"\'')
            trans_desc = protect_and_translate(orig_desc)
            trans_desc = trans_desc.replace('"', '\\"')
            new_fm_lines.append(f'{prefix}"{trans_desc}"')
        else:
            new_fm_lines.append(fm_line)

    new_fm = '\n'.join(new_fm_lines)
    print(f"Translating body of {filename}...")
    new_body = translate_markdown_body(body)

    out_content = f"---{new_fm}---\n{new_body}"
    with open(dst_path, 'w', encoding='utf-8') as f:
        f.write(out_content)
    print(f"-> Saved {dst_path}")

def main():
    files = sorted([f for f in os.listdir(POSTS_DIR) if f.endswith('.md')])
    print(f"Found {len(files)} posts to process.")
    for idx, fname in enumerate(files):
        print(f"[{idx+1}/{len(files)}] Processing {fname}...")
        process_file(fname)
        time.sleep(0.3)
    print("All posts translated successfully!")

if __name__ == '__main__':
    main()
