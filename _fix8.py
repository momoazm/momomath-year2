#!/usr/bin/env python3
test_path = r'C:\Users\momo\momomath-year2\tests\chestCards.test.ts'
with open(test_path, 'r', encoding='utf-8') as f: c = f.read()

# Remove the isOwned import (not exported from cards.ts)
c = c.replace("import {\n  CARDS, START_TABLES, rollChest, rollStartTier,\n  STAR_THRESHOLDS, PACK_SIZE, LOCKED_PITY,\n  isOwned,\n  type ChestTier,\n} from '../src/engine/cards'", "import {\n  CARDS, START_TABLES, rollChest, rollStartTier,\n  STAR_THRESHOLDS, PACK_SIZE, LOCKED_PITY,\n  type ChestTier,\n} from '../src/engine/cards'")

# Fix pity logic - simplified: use prev/after only (no isOwned needed in test)
c = c.replace(
    "      if (r.pity || (!isOwned(counts, r.cardId) && prev < 3 && after >= 3)) {",
    "      if (r.pity || (prev < 3 && after >= 3)) {"
)

open(test_path, 'w', encoding='utf-8').write(c)
print('FIXED')
# Verify
idx = c.find('if (r.pity')
print(repr(c[idx:idx+200]))
