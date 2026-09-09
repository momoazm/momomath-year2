# MomoMath Year 2 · Social Extra (optional Discover-based road, govt Grade 2)

Optional DLC-style addition — **NOT** a core subject. Core stays exactly as
before unless the player opts in via **Profile → Extra adventures**
(`store.socialEnabled`, persisted, store v7) or opens `?subject=social`
(which auto-enables).

## 1. Curriculum honesty

- Egypt Grade 2 has **no standalone social-studies subject** — these themes
  live inside **Discover (اكتشف)**. This extra honestly collects them:
  belonging, Nile, jobs, map, monuments, community. It is labelled
  «دراسات» in the kid-facing UI with this doc as the source of truth.
- Objective codes are `EG-So-2` families (G geography / H history /
  E economy-jobs / C civics / W writing).

## 2. Roadmap — 6 units, 18 lessons + 6 bosses = 24 nodes

| Unit | Theme | Lessons |
|---|---|---|
| D1 مصر بلدي | انتماء: علم وعاصمة ومحافظة | مصر بلدي · محافظتي ومدينتي · أحب بلدي + Boss |
| D2 نهر النيل | جغرافيا: الماء والزراعة | نهر النيل · من النيل إلى الحقل · نحمي مياهنا + Boss |
| D3 المهن | اقتصاد مبسط: المهن والأدوات | مهن مجتمعي · أدوات المهن · عندما أكبر + Boss |
| D4 الخريطة والاتجاهات | جغرافيا: اتجاهات وخريطة | الاتجاهات الأربعة · الخريطة · رحلتي في مصر + Boss |
| D5 آثار مصر | تاريخ: حضارة وحماية | الأهرامات · الأقصر وأسوان · أحافظ على آثار بلدي + Boss |
| D6 مجتمعي | مواطنة: مجتمع ومواصلات وبيئة | أسرتي ومدرستي · المواصلات · بيئتي مسؤوليتي + Boss |

Format reuse only (`mcq/match/order/tap-count/letter-tiles/truefalse/speak`).

## 3. Integration (optional-by-design)

Same model as the Arabic extra: `types.ts Subject` += `'social'`,
`src/content/social/` + `registry.ts` entry, `store.socialEnabled`
(default false, v7 migrate, `?subject=social` auto-enables), `TopBar` 🗺️
pill, `ProfileScreen` card, ar-EG TTS, `PathScreen` label «دراسات (extra)»,
shared economy, `d*` lesson keys (no collisions), per-device opt-in.

## 4. Verify

```bash
cd C:/Users/momo/Documents/momomath-year2
npm run test -- --run tests/social tests/socialRegistry.test.ts
npx tsc -b
npm run build
```
