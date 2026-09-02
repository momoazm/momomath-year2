#!/usr/bin/env python3
test_path = r'C:\Users\momo\momomath-year2\tests\chestCards.test.ts'
with open(test_path, 'r', encoding='utf-8') as f: c = f.read()

# The test body currently has:
# Line 55: counts update 1
# Line 57: wasUnlocked from updated counts (WRONG - double-counted)
# Line 58: counts update 2 (DUPLICATE!)
# We need: wasUnlocked BEFORE update, then single update

old_test = """  it('locked pity resets when a new unlock occurs', () => {
    // simulate from empty counts
    let counts: Record<string, number> = {}
    let pity = 0
    for (let i = 0; i < 500; i++) {
      const r = rollChest(rng(i + 10000), 'normal', counts, pity)
      counts = { ...counts, [r.cardId]: (counts[r.cardId] ?? 0) + r.copies }
      // Mirrors store.ts grantChest lines 536-545:
      const wasUnlocked = (counts[r.cardId] ?? 0) >= 3
      counts = { ...counts, [r.cardId]: (counts[r.cardId] ?? 0) + r.copies }
      const after = counts[r.cardId] ?? 0
      if (r.pity || (!wasUnlocked && after >= 3)) {
        pity = 0
      } else {
        pity = pity + 1
      }
      expect(pity >= 0 && pity <= LOCKED_PITY + 3).toBe(true)
    }
  })"""

new_test = """  it('locked pity resets when a new unlock occurs', () => {
    // simulate from empty counts
    let counts: Record<string, number> = {}
    let pity = 0
    for (let i = 0; i < 500; i++) {
      const r = rollChest(rng(i + 10000), 'normal', counts, pity)
      // wasUnlocked: was this card unlocked BEFORE this chest was opened?
      // mirrors store.ts line 539: const unlockedBefore = prev >= 3
      const wasUnlocked = (counts[r.cardId] ?? 0) >= 3
      // update counts with copies from this chest (single update)
      counts = { ...counts, [r.cardId]: (counts[r.cardId] ?? 0) + r.copies }
      // after: locked state AFTER the chest
      const after = counts[r.cardId] ?? 0
      // pity reset logic mirrors store.ts line 541: if (chest.pity || (!unlockedBefore && unlockedAfter))
      if (r.pity || (!wasUnlocked && after >= 3)) {
        pity = 0
      } else {
        pity = pity + 1
      }
      if (!(pity >= 0 && pity <= LOCKED_PITY + 3)) {
        console.log('FAIL at i=' + i + ' pity=' + pity + ' r.pity=' + r.pity + ' wasUnlocked=' + wasUnlocked + ' after=' + after)
      }
      expect(pity >= 0 && pity <= LOCKED_PITY + 3).toBe(true)
    }
  })"""

if old_test in c:
    c = c.replace(old_test, new_test)
    open(test_path, 'w', encoding='utf-8').write(c)
    print('FIXED: removed double-count bug + added debug')
else:
    print('NOT FOUND')
    # show what's there
    idx = c.find("it('locked pity")
    print(repr(c[idx:idx+600]) if idx>=0 else 'NOT FOUND')
