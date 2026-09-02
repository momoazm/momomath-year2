#!/usr/bin/env python3
test_path = r'C:\Users\momo\momomath-year2\tests\chestCards.test.ts'
with open(test_path, 'r', encoding='utf-8') as f: c = f.read()
# Remove isOwned from import (it's not exported from cards.ts)
c = c.replace("  isOwned,\n", "")
open(test_path, 'w', encoding='utf-8').write(c)
print('REMOVED isOwned from import')
