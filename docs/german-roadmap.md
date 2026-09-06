# MomoMath Year 2 · Deutsch Extra (optional German roadmap)

Optional DLC-style addition — **NOT** a third core subject. Math ⇄ English stay
exactly as before unless the player opts in via **Profile → Extra adventures**
(`store.germanEnabled`, persisted, store v5) or opens `?subject=german`
(which auto-enables).

## 1. Why optional + curriculum honesty

- There is **no official Cambridge Stage 2 German**. The correct framework is
  Cambridge Primary Modern Foreign Language **0064**, whose stages start at
  **Stage 4** (recognise familiar words with visuals, slow-clear speech; write
  isolated words).
- This extra is therefore **pre-A1 / pre-Stage-4 beginner DaF for age 6–7**,
  using 0064 Stage-4 code families downscaled (`4Lm/4Rm/4Sc/4Wc/4Vl/4Gr/4Cu`)
  + content sequenced from Goethe-Institut **Felix & Franzi Vol.1**
  (Hallo, Farben, Tiere, Zahlen/Geburtstag, Wetter, Essen) + Vol.2 ch.1–3.
- Every lesson intro states it is the "Deutsch extra" so nobody mistakes it
  for an official Cambridge Stage 2 syllabus.

## 2. Roadmap — 10 units, 33 lessons + 10 bosses = 43 nodes

| Unit | Theme | Lessons |
|---|---|---|
| G1 Hallo! | greetings, Frau/Herr, Briefkasten | Hallo Felix! · Frau und Herr · Hallo oder Tschüss? + Boss |
| G2 Wie geht's? | feelings, Und dir?, ä ö ü | Wie geht es dir? · Hör gut zu! · Ä Ö Ü Party + Boss |
| G3 Farben | colours, Lieblingsfarbe, D-A-CH flags | Das Gemälde · Meine Lieblingsfarbe · Flaggen & Länder + Boss |
| G4 Zahlen 1–12 | zählen, Wie alt bist du? | Eins bis sechs · Sieben bis zwölf · Wie alt bist du? + Boss |
| G5 Tiere | animals, der/die/das | Besuch aus Deutschland · der die das · Tierstimmen + Boss |
| G6 Familie & Freunde | family, Das ist…, mein/meine | Meine Familie · Das ist… · Ich heiße… + Boss |
| G7 Essen & Trinken | food, Ich mag / mag nicht | Obstsalat · Ich mag… · Zeit fürs Frühstück! + Boss |
| G8 Körper & Kleidung | body, clothes, weather | Mein Körper · Anziehen! · Sonnenbrille oder Regenschirm? + Boss |
| G9 Zeit & Schule | weekdays, seasons, subjects | Die Wochentage · Jahreszeiten · Mein Stundenplan + Boss |
| G10 Zuhause & Feste | home, in/auf/unter, Geburtstag | Im Briefkasten · Wo ist es? · Felix hat Geburtstag · Ein Brief aus Berlin + Boss |

Format reuse only (`mcq/match/order/tap-count/letter-tiles/truefalse/speak`):
gender = match + mcq cloze; umlauts = letter-tiles with ä/ö/ü/ß single tiles;
listening = existing `audioText` + de-DE TTS turtle replay; speaking = existing
`speak` with forgiving self-check.

## 3. Integration (optional-by-design)

| Concern | How |
|---|---|
| Type | `types.ts Subject` gains `'german'` with doc comment — core code never assumes only 2 subjects |
| Content | `src/content/german/` (helpers + g01…g10 + index) mirrors `english/`; `registry.ts` adds `german` entry |
| Flag | `store.germanEnabled: boolean` (default false, v5 migrate keeps Math for existing saves; `?subject=german` auto-enables) |
| Switch | `TopBar` shows 🇩🇪 only when `germanEnabled`; `setSubject('german')` auto-enables; disabling while viewing falls back to Maths |
| Entry | `ProfileScreen` “Extra adventures” section: Add / Play / Remove (progress kept on remove) |
| Audio | `tts.ts speakFor/speakSlowFor/ttsLangFor` — German plays de-DE, core stays en-GB; ASR lang + `normWords` keep äöüß |
| Path | `PathScreen` label “Deutsch (extra)”; same zigzag path, unlock, adaptive `buildCatalog('german')` works unchanged |
| Economy | Shared XP/gems/league/chest (one economy, like English); `lessonProgress` keys are `g*` so no collisions |
| Sync | `lessonProgress` (incl. `g*` ids) syncs via existing cloudsave union; `germanEnabled` itself stays per-device opt-in (documented) |

## 4. Verify

```bash
cd C:/Users/momo/Documents/momomath-year2
npm run test -- --run tests/german tests/germanRegistry.test.ts
npx tsc -b
npm run build
```

New tests: `tests/german/harness.ts` (allows `^[a-zäöüß]{3,14}$` tiles),
`tests/german/g01…g10.test.ts`, `tests/germanRegistry.test.ts`
(disjoint `g*` ids, boss shape, MFL families).
