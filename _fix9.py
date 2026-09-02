#!/usr/bin/env python3
test_path = r'C:\Users\momo\momomath-year2\tests\chestCards.test.ts'
with open(test_path, 'r', encoding='utf-8') as f: c = f.read()

# The fix: track wasUnlocked BEFORE update (same as grantChest line 539-541)
old_block = """      const prev = counts[r.cardId] ?? 0
      const after = prev + r.copies
      if (r.pity || (prev < 3 && after >= 3)) {
        pity = 0  // pity unlock OR natural first unlock
      } else if (r.cardId) {
        pity = pity + 1  // only count chest-openings that award a card
      }  // gem-only chest: pity unchanged"""

new_block = """      // Mirrors store.ts grantChest lines 536-545 exactly:
      // wasUnlocked = owned before THIS chest was opened
      const wasUnlocked = (counts[r.cardId] ?? 0) >= 3
      counts = { ...counts, [r.cardId]: (counts[r.cardId] ?? 0) + r.copies }
      const after = counts[r.cardId] ?? 0
      if (r.pity || (!wasUnlocked && after >= 3)) {
        pity = 0
      } else {
        pity = pity + 1
      }"""

if old_block in c:
    c = c.replace(old_block, new_block)
    open(test_path, 'w', encoding='utf-8').write(c)
    print('FIXED: pity logic mirrors grantChest exactly')
else:
    print('NOT FOUND')
    idx = c.find('const prev = counts[r.cardId]')
    print(repr(c[max(0,idx-20):idx+300]) if idx>=0 else 'NOT FOUND')
