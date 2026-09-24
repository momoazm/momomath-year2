# MomoMath Year 2 · Arabic Extra (optional road, Selah El Telmeez)

Optional DLC-style addition — **NOT** a core subject. Math ⇄ English ⇄ Science stay
exactly as before unless the player opts in via **Profile → Extra adventures**
(`store.arabicEnabled`, persisted, store v6) or opens `?subject=arabic`
(which auto-enables).

## 1. Why optional + curriculum honesty

- The scope follows **Selah El Telmeez (سلاح التلميذ) Arabic for Grade 2
  (تانية ابتدائي)**, which tracks the Egyptian MOE curriculum:
  Term 1 (تمهيد تأسيسي + المعاملة الطيبة + عادات صحية + الرياضة والتكنولوجيا)
  + Term 2 (أحب من حولي + في مدرستي + أماكن جميلة).
- Every lesson intro states it is the Arabic extra. Objective codes are
  `EG-Ar-2` families (R reading / W writing / G grammar / E expression /
  L listening) — honest about not being a Cambridge syllabus.

## 2. Roadmap — 10 units, 30 lessons + 10 bosses = 40 nodes

| Unit | Theme (Selah El Telmeez) | Lessons |
|---|---|---|
| A1 مراجعة تأسيسية | تمهيد: حركات/مدود/شدة | الحركات القصيرة · المدود · الشدة + Boss |
| A2 المعاملة الطيبة ١ | يوم جميل، كلماتي الجميلة | يوم جميل · كلماتي الجميلة (مفرد/مثنى) · كلمات تسعد الآخرين + Boss |
| A3 المعاملة الطيبة ٢ | أحب أصدقائي، الطفل المهذب | أحب أصدقائي · أسماء الإشارة · نشيد الطفل المهذب + Boss |
| A4 عادات صحية ١ | أرتب حياتي، أسناني قوية | أرتب حياتي · أسناني قوية (ذلك/تلك) · اللام الشمسية والقمرية + Boss |
| A5 عادات صحية ٢ | طعامي الصحي، البطل الصغير | طعامي الصحي · ظرف المكان والزمان · البطل الصغير + Boss |
| A6 الرياضة والتكنولوجيا ١ | حسام والكمبيوتر | الرياضة لنا جميعا · حسام والكمبيوتر · الأمر والنهي + Boss |
| A7 الرياضة والتكنولوجيا ٢ | في النادي، رياضتي | في النادي · الذي والتي · نشيد رياضتي + Boss |
| A8 أحب من حولي | ترم ثان: الغائب/النداء/التاء | ضمائر الغائب · أسلوب النداء · التاء المربوطة والمفتوحة + Boss |
| A9 في مدرستي | ترم ثان: استفهام/جر/شدة | أدوات الاستفهام · حروف الجر والعطف · الشدة مع التنوين + Boss |
| A10 أماكن جميلة | ترم ثان: تعجب/كتابة | أسلوب التعجب · أماكن جميلة · الكاتب الصغير + Boss |

Format reuse only (`mcq/match/order/tap-count/letter-tiles/truefalse/speak`):
classification = match with unique right labels (renderer dedupes rights, see
`matchLayout.ts`); listening = existing `audioText` + ar-EG TTS turtle replay;
speaking = existing `speak` with forgiving self-check. Arabic tiles are plain
letters (no tashkeel inside tiles).

## 3. Integration (optional-by-design)

| Concern | How |
|---|---|
| Type | `types.ts Subject` gains `'arabic'` — core code never assumes a fixed subject list |
| Content | `src/content/arabic/` (helpers + a01…a10 + index) mirrors `german/`; `registry.ts` adds `arabic` entry |
| Flag | `store.arabicEnabled: boolean` (default false, v6 migrate; `?subject=arabic` auto-enables) |
| Switch | `TopBar` shows 🇪🇬 only when `arabicEnabled`; `setSubject('arabic')` auto-enables; disabling while viewing falls back to Maths |
| Entry | `ProfileScreen` “Extra adventures” section: Add / Play / Remove (progress kept on remove) |
| Audio | `tts.ts ttsLangFor` — Arabic plays ar-EG, everything else unchanged |
| Path | `PathScreen` label “العربية (extra)”; same zigzag path, unlock, adaptive `buildCatalog('arabic')` works unchanged |
| Economy | Shared XP/gems/league/chest (one economy, like German); `lessonProgress` keys are `a*` so no collisions |
| Sync | `lessonProgress` (incl. `a*` ids) syncs via existing cloudsave union; `arabicEnabled` itself stays per-device opt-in (documented) |

## 4. Verify

```bash
cd C:/Users/momo/Documents/momomath-year2
npm run test -- --run tests/arabic tests/arabicRegistry.test.ts
npx tsc -b
npm run build
```

New tests: `tests/arabic/harness.ts` (allows Arabic-letter tiles),
`tests/arabic/a01…a10.test.ts`, `tests/arabicRegistry.test.ts`
(disjoint `a*` ids, boss shape, EG-Ar families, Selah El Telmeez progression).
