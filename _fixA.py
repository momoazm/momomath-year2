#!/usr/bin/env python3
test_path = r'C:\Users\momo\momomath-year2\tests\chestCards.test.ts'
with open(test_path, 'r', encoding='utf-8') as f: c = f.read()

# Show what's currently in the pity logic area
idx = c.find('pity = ')
start = max(0, idx - 200)
print('Current pity area:')
print(repr(c[start:start+500]))

# Now find and replace the entire test body
old_body = """      const prev = counts[r.cardId] ?? 0
      const after = prev + r.copies
      if (r.pity || (!isOwned(counts, r.cardId) && prev < 3 && after >= 3)) {
        pity = 0  // pity unlock OR natural first unlock
      } else if (r.cardId) {
        pity = pity + 1  // only count chest-openings that award a card
      }  // gem-only chest: pity unchanged"""

new_body = """      // Mirrors store.ts grantChest lines 536-545:
      const wasUnlocked = (counts[r.cardId] ?? 0) >= 3
      counts = { ...counts, [r.cardId]: (counts[r.cardId] ?? 0) + r.copies }
      const after = counts[r.cardId] ?? 0
      if (r.pity || (!wasUnlocked && after >= 3)) {
        pity = 0
      } else {
        pity = pity + 1
      }"""

if old_body in c:
    c = c.replace(old_body, new_body)
    open(test_path, 'w', encoding='utf-8').write(c)
    print('FIXED')
else:
    print('old_body not found, trying partial...')
    # Try just the if line
    old_if = "      if (r.pity || (!isOwned(counts, r.cardId) && prev < 3 && after >= 3)) {"
    if old_if in c:
        c = c.replace(old_if, "      if (r.pity || (!wasUnlocked && after >= 3)) {")
        open(test_path, 'w', encoding='utf-8').write(c)
        print('PARTIAL FIX: if line only')
    else:
        print('Could not find any matching pattern')
