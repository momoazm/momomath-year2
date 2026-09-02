#!/usr/bin/env python3
# 1. FIX chestCards.test.ts pity logic
test_path = r'C:\Users\momo\momomath-year2\tests\chestCards.test.ts'
with open(test_path, 'r', encoding='utf-8') as f: content = f.read()
old = "      const prev = (counts[r.cardId] ?? 0) - r.copies\n      pity = (prev < 3 && (counts[r.cardId] ?? 0) >= 3) ? 0 : pity + 1"
new = "      const prev = counts[r.cardId] ?? 0\n      const after = prev + r.copies\n      if (r.pity || (prev < 3 && after >= 3)) { pity = 0 } else { pity = pity + 1 }"
if old in content:
    content = content.replace(old, new)
    open(test_path, 'w', encoding='utf-8').write(content)
    print('[1] test.ts FIXED')
else:
    print('[1] test.ts NOT FOUND')
    idx=content.find('const prev = (counts')
    print(repr(content[max(0,idx-20):idx+250]) if idx>=0 else 'NOT FOUND')

# 2. FIX store.ts version + v6 migration
store_path = r'C:\Users\momo\momomath-year2\src\engine\store.ts'
with open(store_path, 'r', encoding='utf-8') as f: store = f.read()
store = store.replace("version: 5,\n      migrate:", "version: 6,\n      migrate:")
old_m = ("        if (version < 5) {\n          p.lastLeagueSettle = p.lastLeagueSettle ?? null\n"
         "          if (typeof p.weeklyXpWeek !== 'string' || !/^\\d{4}-\\d{2}-\\d{2}$/.test(p.weeklyXpWeek)) { p.weeklyXpWeek = '' }\n"
         "          if (!Number.isFinite(p.weeklyXp)) p.weeklyXp = 0\n          p.version = 5\n        }\n      },")
new_m = ("        if (version < 5) {\n          p.lastLeagueSettle = p.lastLeagueSettle ?? null\n"
         "          if (typeof p.weeklyXpWeek !== 'string' || !/^\\d{4}-\\d{2}-\\d{2}$/.test(p.weeklyXpWeek)) { p.weeklyXpWeek = '' }\n"
         "          if (!Number.isFinite(p.weeklyXp)) p.weeklyXp = 0\n          p.version = 5\n        }\n        if (version < 6) {\n"
         "          const oldCards: string[] = (p as any).cardCollection ?? []\n          p.cardCounts = {}\n          for (const id of oldCards) p.cardCounts[id] = 3\n          if (typeof (p as any).cardPity !== 'number') (p as any).cardPity = 0\n          p.version = 6\n        }\n      },")
if old_m in store:
    store = store.replace(old_m, new_m)
    open(store_path, 'w', encoding='utf-8').write(store)
    print('[2] store.ts FIXED')
else:
    print('[2] store.ts pattern not found'); idx=store.find('if (version < 5)'); print(repr(store[max(0,idx-5):idx+500]) if idx>=0 else 'NOT FOUND')
print('PART1 DONE')
