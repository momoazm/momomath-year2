#!/usr/bin/env python3
test_path = r'C:\Users\momo\momomath-year2\tests\chestCards.test.ts'
with open(test_path, 'r', encoding='utf-8') as f: c = f.read()

# Add isOwned to import
old_imp = "import {\n  CARDS, START_TABLES, rollChest, rollStartTier,\n  STAR_THRESHOLDS, PACK_SIZE, LOCKED_PITY,\n  type ChestTier,\n} from '../src/engine/cards'"

new_imp = "import {\n  CARDS, START_TABLES, rollChest, rollStartTier,\n  STAR_THRESHOLDS, PACK_SIZE, LOCKED_PITY,\n  isOwned,\n  type ChestTier,\n} from '../src/engine/cards'"

if old_imp in c:
    c = c.replace(old_imp, new_imp)
    open(test_path, 'w', encoding='utf-8').write(c)
    print('FIXED: isOwned added to import')
else:
    print('IMPORT NOT FOUND')
    print(repr(c[:500]))
