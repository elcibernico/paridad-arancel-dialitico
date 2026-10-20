import os
import re

directory = r"d:\ProgramFiles\GitHub-Firebase-Antigravity\2026-07 Paridad Arancel Dialitico\app\src\components\points"

def read_file_with_encoding(filepath):
    encodings = ['utf-8', 'utf-16', 'utf-16-le', 'utf-16-be', 'latin-1']
    for enc in encodings:
        try:
            with open(filepath, 'r', encoding=enc) as f:
                content = f.read()
                return content, enc
        except UnicodeDecodeError:
            continue
    raise ValueError(f"Could not decode file {filepath} with any of the standard encodings.")

def process_file(filepath):
    print(f"Processing {os.path.basename(filepath)}...")
    try:
        content, encoding = read_file_with_encoding(filepath)
    except Exception as e:
        print(f"Failed to read {filepath}: {e}")
        return

    # Step 1: Strip out existing INI/FIN comment lines to ensure idempotency
    lines = content.split('\n')
    cleaned_lines = []
    for line in lines:
        if "------------------------------------------- INI:" in line or "------------------------------------------- FIN:" in line:
            continue
        cleaned_lines.append(line)

    # Step 2: Run the insertion algorithm on the cleaned lines
    lines = cleaned_lines
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Match lines like {hasPermission('...') && ( OR containing hasPermission inside a JSX block
        match = re.search(r'\{\s*(?:[^{}]*?\s+)?hasPermission\(\'([^\']+)\'\)(?:\s+[^{}]*?)?\s*&&\s*\(', line)
        if match:
            perm_id = match.group(1)
            brace_count = 0
            block_lines = []
            
            j = i
            found_end = False
            while j < len(lines):
                curr_line = lines[j]
                block_lines.append(curr_line)
                
                # Count braces
                for char in curr_line:
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                
                if brace_count <= 0 and j > i:
                    found_end = True
                    break
                j += 1
            
            if found_end:
                indent = ' ' * (len(line) - len(line.lstrip()))
                ini_comment = f"{indent}{{/* ------------------------------------------- INI: {perm_id} --------------------------------------------- */}}"
                fin_comment = f"{indent}{{/* ------------------------------------------- FIN: {perm_id} --------------------------------------------- */}}"
                
                new_lines.append(ini_comment)
                new_lines.extend(block_lines)
                new_lines.append(fin_comment)
                
                i = j + 1
                continue
        
        new_lines.append(line)
        i += 1
        
    new_content = '\n'.join(new_lines)
    with open(filepath, 'w', encoding=encoding) as f:
        f.write(new_content)

for filename in os.listdir(directory):
    if filename.endswith(".jsx") and filename.startswith("Punto") and not "backup" in filename:
        process_file(os.path.join(directory, filename))

print("Done processing all points files cleanly.")
