#!/usr/bin/env python3
store_path = r'C:\Users\momo\momomath-year2\src\engine\store.ts'
with open(store_path, 'r', encoding='utf-8') as f: store = f.read()

# Bump version 5 -> 6
store = store.replace('version: 5,', 'version: 6,')

# Insert v6 migration before "return p" inside migrate block
old_return = """        if (version < 5) {
          // League settlement: backfill the banner field and normalise the
          // week key / XP so a stale or missing week always triggers a proper
          // settlement (promote/demote) on next launch instead of silently
          // carrying last week's XP into the new week.
          p.lastLeagueSettle = p.lastLeagueSettle ?? null
          if (typeof p.weeklyXpWeek !== 'string' || !/^\\d{4}-\\d{2}-\\d{2}$/.test(p.weeklyXpWeek)) {
            p.weeklyXpWeek = ''
          }
          if (!Number.isFinite(p.weeklyXp)) p.weeklyXp = 0
        }
        return p"""

new_with_v6 = """        if (version < 5) {
          // League settlement: backfill the banner field and normalise the
          // week key / XP so a stale or missing week always triggers a proper
          // settlement (promote/demote) on next launch instead of silently
          // carrying last week's XP into the new week.
          p.lastLeagueSettle = p.lastLeagueSettle ?? null
          if (typeof p.weeklyXpWeek !== 'string' || !/^\\d{4}-\\d{2}-\\d{2}$/.test(p.weeklyXpWeek)) {
            p.weeklyXpWeek = ''
          }
          if (!Number.isFinite(p.weeklyXp)) p.weeklyXp = 0
        }
        if (version < 6) {
          // cardCollection (string[]) -> cardCounts (Record<string,number>)
          const oldCards: string[] = (p as any).cardCollection ?? []
          p.cardCounts = {}
          for (const id of oldCards) p.cardCounts[id] = 3
          if (typeof (p as any).cardPity !== 'number') (p as any).cardPity = 0
        }
        return p"""

if old_return in store:
    store = store.replace(old_return, new_with_v6)
    open(store_path, 'w', encoding='utf-8').write(store)
    print('FIXED: store.ts v6 migration added')
else:
    print('NOT FOUND - printing context:')
    idx = store.find('if (version < 5)')
    print(repr(store[idx:idx+800]))
