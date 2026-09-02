#!/usr/bin/env python3
test_path = r'C:\Users\momo\momomath-year2\tests\chestCards.test.ts'
with open(test_path, 'r', encoding='utf-8') as f: c = f.read()

# The current broken logic: increments pity EVERY iteration
old_logic = """      const prev = counts[r.cardId] ?? 0
      const after = prev + r.copies
      if (r.pity || (prev < 3 && after >= 3)) { pity = 0 } else { pity = pity + 1 }"""

# The correct logic: mirrors store.ts grantChest exactly
# - Reset if r.pity (forced pity unlock) OR natural first unlock (prev<3 AND after>=3)
# - Increment ONLY if r.cardId exists (gem-only chest does NOT increment)
# - No increment if no card (gem-only chest)
new_logic = """      const prev = counts[r.cardId] ?? 0
      const after = prev + r.copies
      if (r.pity || (!isOwned(counts, r.cardId) && prev < 3 && after >= 3)) {
        pity = 0  // pity unlock OR natural first unlock
      } else if (r.cardId) {
        pity = pity + 1  // only count chest-openings that award a card
      }  // gem-only chest: pity unchanged"""

if old_logic in c:
    c = c.replace(old_logic, new_logic)
    open(test_path, 'w', encoding='utf-8').write(c)
    print('FIXED: pity logic matches grantChest exactly')
else:
    print('NOT FOUND, searching...')
    idx = c.find('const prev = counts[r.cardId]')
    print(repr(c[max(0,idx-50):idx+300]) if idx>=0 else 'NOT FOUND')
