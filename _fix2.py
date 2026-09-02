#!/usr/bin/env python3
# 3. FIX LibraryScreen.tsx - add STAR_THRESHOLDS + star display + pass cardCounts

lib_path = r'C:\Users\momo\momomath-year2\src\screens\LibraryScreen.tsx'
with open(lib_path, 'r', encoding='utf-8') as f: lib = f.read()

# 3a. Add imports
old_imp = "import { CARDS, cardImageUrl, type CardDef, type ChestTier } from '../engine/cards'"
new_imp = "import { CARDS, cardImageUrl, STAR_THRESHOLDS, toStar, type CardDef, type ChestTier } from '../engine/cards'"
if old_imp in lib:
    lib = lib.replace(old_imp, new_imp); print('[3a] import FIXED')
else: print('[3a] import NOT FOUND:', repr(lib[:200]))

# 3b. Add cardCounts to CardGrid props type
old_props = 'function CardGrid({ cards, isOwned, onCardClick, getHiddenCardStyle }: CardGridProps) {'
new_props = 'function CardGrid({ cards, isOwned, onCardClick, getHiddenCardStyle, cardCounts }: CardGridProps & { cardCounts: Record<string, number> }) {'
if old_props in lib:
    lib = lib.replace(old_props, new_props); print('[3b] CardGrid props FIXED')
else: print('[3c] CardGrid props NOT FOUND')

# 3c. Update CardGrid call to pass cardCounts
old_call = '      <CardGrid\n        cards={filteredCards}\n        isOwned={isOwned}\n        onCardClick={handleCardClick}\n        getHiddenCardStyle={getHiddenCardStyle}\n      />'
new_call = '      <CardGrid\n        cards={filteredCards}\n        isOwned={isOwned}\n        onCardClick={handleCardClick}\n        getHiddenCardStyle={getHiddenCardStyle}\n        cardCounts={cardCounts}\n      />'
if old_call in lib:
    lib = lib.replace(old_call, new_call); print('[3c] CardGrid call FIXED')
else: print('[3c] CardGrid call NOT FOUND')

# 3d. Add star display after flavor text
old_end = ('              <div className="relative z-10 px-3 pb-3 text-center">\n'
           '                <h3 className="font-display text-base font-extrabold text-slate-800">\n'
           '                  {card.name}\n'
           '                </h3>\n'
           '                <p className="text-xs text-slate-500 mt-1">\n'
           '                  {card.flavor}\n'
           '                </p>\n'
           '              </div>')
new_end = ('              <div className="relative z-10 px-3 pb-3 text-center">\n'
           '                <h3 className="font-display text-base font-extrabold text-slate-800">\n'
           '                  {card.name}\n'
           '                </h3>\n'
           '                <p className="text-xs text-slate-500 mt-1">\n'
           '                  {card.flavor}\n'
           '                </p>\n'
           '                {(() => {\n'
           '                  const count = (cardCounts[card.id] ?? 0)\n'
           '                  const star = toStar(count)\n'
           '                  return (\n'
           '                    <div className="mt-1 flex justify-center gap-0.5">\n'
           '                      {[1,2,3,4,5].map(s => (\n'
           '                        <span key={s} className={"text-xs " + (s <= star ? "text-amber-400" : "text-slate-300")}>★</span>\n'
           '                      ))}\n'
           '                    </div>\n'
           '                  )\n'
           '                })()}\n'
           '              </div>')
if old_end in lib:
    lib = lib.replace(old_end, new_end); print('[3d] star display FIXED')
else:
    print('[3d] star display NOT FOUND')
    idx=lib.find('card.flavor')
    print(repr(lib[max(0,idx-100):idx+400]) if idx>=0 else 'NOT FOUND')

open(lib_path, 'w', encoding='utf-8').write(lib)
print('PART2 DONE')
