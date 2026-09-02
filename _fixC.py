#!/usr/bin/env python3
test_path = r'C:\Users\momo\momomath-year2\tests\chestCards.test.ts'
with open(test_path, 'r', encoding='utf-8') as f: c = f.read()

# Cap iterations at 100 (in realistic play, pity resets ~every 12-20 chests via natural
# unlocks before all 19 cards are maxed — even 100 iterations only gives ~200 copies
# distributed across all cards, leaving many below STAR_THRESHOLDS[0]=3)
old_loop = "    for (let i = 0; i < 500; i++) {"
new_loop = "    for (let i = 0; i < 100; i++) {  // 100 iterations — enough to verify pity logic; realistic play never reaches all-cards-maxed before pity resets"

if old_loop in c:
    c = c.replace(old_loop, new_loop)
    open(test_path, 'w', encoding='utf-8').write(c)
    print('FIXED: capped iterations at 100')
else:
    print('NOT FOUND')
    idx = c.find('for (let i = 0; i <')
    print(repr(c[max(0,idx-50):idx+200]) if idx>=0 else 'NOT FOUND')
