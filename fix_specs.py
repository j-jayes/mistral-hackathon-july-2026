#!/usr/bin/env python3
"""
Script to fix spec files by replacing unsupported matchers.
"""

import os
import re

# Find all spec files
spec_dir = "C:\\dev\\mistral-hackathon-july-2026\\specs"

for root, dirs, files in os.walk(spec_dir):
    for filename in files:
        if filename.endswith('_spec.py'):
            filepath = os.path.join(root, filename)
            
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Replace _should_be_callable() with callable() check
            content = re.sub(
                r'(\w+)\.(\w+)\_should_be_callable\(\)',
                r'callable(\1.\2)._should_be_like(True)',
                content
            )
            
            # Replace _should_contain("x") with "x" in ..._should_be_like(True)
            content = re.sub(
                r'(\w+)\_should_contain\("([^"]+)"\)',
                r'"\2" in \1._should_be_like(True)',
                content
            )
            
            # Replace _should_not_be_like with != check
            content = re.sub(
                r'(\w+)\_should_not_be_like\(([^)]+)\)',
                r'(\1 != \2)._should_be_like(True)',
                content
            )
            
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed: {filepath}")

print("Spec files fixed!")