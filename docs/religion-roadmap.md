# MomoMath Year 2 · Religion Extra (optional Islamic road, govt Grade 2)

Optional DLC-style addition — **NOT** a core subject. Core stays exactly as
before unless the player opts in via **Profile → Extra adventures**
(`store.religionEnabled`, persisted, store v7) or opens `?subject=religion`
(which auto-enables).

## 1. Curriculum honesty

- Scope follows the Egyptian MOE **التربية الدينية الإسلامية Grade 2
  (تانية ابتدائي)**: aqeedah (التوكل، الشكر، أسماء الله الحسنى),
  Quran (القدر، البينة، التين، العلق، الشرح + short surahs),
  fiqh (الأذان، صلاة الجماعة), seerah (الوحي، بداية الدعوة، شعيب),
  T2 (صفات الله، معجزات النبي، الصلاة وآداب المسجد، موسى، الصحابة).
- Objective codes are `EG-Rl-2` families (Q quran / A aqeedah / F fiqh /
  S seerah-stories / E ethics).

## 2. Roadmap — 6 units, 18 lessons + 6 bosses = 24 nodes

| Unit | Theme | Lessons |
|---|---|---|
| R1 الله ربي | عقيدة: الخالق والأسماء والتوكل | الله خالقي · أسماء الله الحسنى · التوكل والشكر + Boss |
| R2 كتاب الله | قرآن: حفظ وترتيل ومعاني | سور أحفظها · أرتل وأتعلم · أفهم كلماتي + Boss |
| R3 صلاتي | عبادات: أذان ووضوء وصلاة | الأذان · الوضوء والصلاة · المسجد + Boss |
| R4 سيرة نبينا | المولد والوحي والدعوة | مولد النبي · الوحي والدعوة · أخلاق النبي + Boss |
| R5 قصص الأنبياء | شعيب وموسى وإبراهيم | شعيب · موسى · أنبياء الله + Boss |
| R6 أخلاق المسلم | قيم وقدوة | الصدق والأمانة · بر الوالدين · الصحابة + Boss |

Format reuse only (`mcq/match/order/tap-count/letter-tiles/truefalse/speak`).

## 3. Integration (optional-by-design)

Same model as the Arabic extra: `types.ts Subject` += `'religion'`,
`src/content/religion/` + `registry.ts` entry, `store.religionEnabled`
(default false, v7 migrate, `?subject=religion` auto-enables), `TopBar` 🕌
pill, `ProfileScreen` card, ar-EG TTS, `PathScreen` label «الدين (extra)»,
shared economy, `r*` lesson keys (no collisions), per-device opt-in.

## 4. Verify

```bash
cd C:/Users/momo/Documents/momomath-year2
npm run test -- --run tests/religion tests/religionRegistry.test.ts
npx tsc -b
npm run build
```
