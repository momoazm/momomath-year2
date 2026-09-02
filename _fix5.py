#!/usr/bin/env python3
cards = r'C:\Users\momo\momomath-year2\src\engine\cards.ts'
with open(cards, 'r', encoding='utf-8') as f: c = f.read()

# Remove the broken insert
broken = """/** Star level (0..MAX_STAR) for a given card copy count. */
export function starLevel(count: number): number {
/** Alias for starLevel — used by LibraryScreen / ProfileScreen */
export const toStar = starLevel
  let s = 0
  for (const t of STAR_THRESHOLDS) if (count >= t) s++
  return Math.min(MAX_STAR, s)
}"""

fixed = """/** Star level (0..MAX_STAR) for a given card copy count. */
export function starLevel(count: number): number {
  let s = 0
  for (const t of STAR_THRESHOLDS) if (count >= t) s++
  return Math.min(MAX_STAR, s)
}

/** Alias for starLevel — used by LibraryScreen / ProfileScreen */
export const toStar = starLevel"""

if broken in c:
    c = c.replace(broken, fixed)
    open(cards, 'w', encoding='utf-8').write(c)
    print('FIXED: toStar moved outside function')
else:
    print('PATTERN NOT FOUND')
    idx = c.find('export const toStar')
    print(repr(c[max(0,idx-100):idx+200]) if idx >= 0 else 'NOT FOUND')
