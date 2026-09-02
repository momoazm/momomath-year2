#!/usr/bin/env python3
# Fix: add toStar alias and fix imports

# 1. Add toStar alias to cards.ts
cards_path = r'C:\Users\momo\momomath-year2\src\engine\cards.ts'
with open(cards_path, 'r', encoding='utf-8') as f: c = f.read()
old_fn = "export function starLevel(count: number): number {"
new_fn = "export function starLevel(count: number): number {\n/** Alias for starLevel — used by LibraryScreen / ProfileScreen */\nexport const toStar = starLevel"
if old_fn in c:
    c = c.replace(old_fn, new_fn)
    open(cards_path, 'w', encoding='utf-8').write(c)
    print('[OK] cards.ts toStar alias added')
else:
    print('[FAIL] starLevel not found in cards.ts')

# 2. Fix LibraryScreen - remove toStar import (already added STAR_THRESHOLDS)
lib_path = r'C:\Users\momo\momomath-year2\src\screens\LibraryScreen.tsx'
with open(lib_path, 'r', encoding='utf-8') as f: l = f.read()
if 'toStar' in l and 'STAR_THRESHOLDS, toStar' in l:
    l = l.replace('STAR_THRESHOLDS, toStar,', 'STAR_THRESHOLDS, toStar,')
    open(lib_path, 'w', encoding='utf-8').write(l)
    print('[OK] LibraryScreen already has toStar import')
else:
    print('[INFO] LibraryScreen toStar:', 'toStar' in l)

# 3. Fix ProfileScreen - already fixed by subagent, check
prof_path = r'C:\Users\momo\momomath-year2\src\screens\ProfileScreen.tsx'
with open(prof_path, 'r', encoding='utf-8') as f: p = f.read()
if 'toStar' in p:
    print('[OK] ProfileScreen has toStar')
else:
    print('[WARN] ProfileScreen missing toStar')

print('DONE')
