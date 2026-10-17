/* Phase 36 — Fish Audio clip generator (build-time only, never shipped).
 *
 * Usage (from the repo root):
 *   npx vite-node scripts/generate-tts.mts --stats              # corpus stats + saturation report
 *   npx vite-node scripts/generate-tts.mts --check-manifest     # completeness gate vs public/tts
 *   npx vite-node scripts/generate-tts.mts --demo               # voice-candidate demo clips -> tmp/tts-demo
 *   npx vite-node scripts/generate-tts.mts [--lang en|ar|de|all] [--profile narrator|sonic|all]
 *                                          [--limit N] [--bitrate 64|128|192] [--dry] [--prune]
 *
 * Clips land in public/tts/<key>.mp3 (key = ttsPremium.premiumKey) and
 * public/tts/manifest.json lists every generated key. Resume-friendly: files
 * that already exist are skipped, so an interrupted run just continues. The
 * API key is read from FISH_AUDIO_API_KEY (env) or .env.local — never logged.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { BASE_SEEDS, HASHED_SEEDS, enumerateSpeakable, type SpeakableItem } from './tts-corpus.mts'
import { PREMIUM_VOICES, TTS_VERSION, premiumKey, type TtsProfile } from '../src/engine/ttsPremium'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const OUT_DIR = join(ROOT, 'public', 'tts')
const MANIFEST_PATH = join(OUT_DIR, 'manifest.json')
const TMP_DIR = join(ROOT, 'tmp')
const FISH_TTS_URL = 'https://api.fish.audio/v1/tts'
const FISH_MODEL = 's2.1-pro-free'
const CONCURRENCY = 5

const argv = process.argv.slice(2)
const flag = (name: string) => argv.includes(name)
const opt = (name: string, dflt: string): string => {
  const i = argv.indexOf(name)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt
}

const mode = flag('--stats')
  ? 'stats'
  : flag('--check-manifest')
    ? 'check'
    : flag('--demo')
      ? 'demo'
      : 'generate'
const BITRATE = Number(opt('--bitrate', '64'))
const LANG_ARG = opt('--lang', 'all')
const PROFILE_ARG = opt('--profile', 'all')
const LIMIT = Number(opt('--limit', '0')) || 0
const DRY = flag('--dry')

const LANG_CODES: Record<string, string> = { en: 'en-GB', ar: 'ar-EG', de: 'de-DE' }

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const fmtMB = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)}MB`

function loadFishKey(): string {
  const fromEnv = process.env.FISH_AUDIO_API_KEY
  if (fromEnv && fromEnv.trim()) return fromEnv.trim()
  try {
    const txt = readFileSync(join(ROOT, '.env.local'), 'utf8')
    for (const line of txt.split(/\r?\n/)) {
      const m = /^\s*FISH_AUDIO_API_KEY\s*=\s*(.+?)\s*$/.exec(line)
      if (m) return m[1]
    }
  } catch {
    /* fall through */
  }
  throw new Error('FISH_AUDIO_API_KEY not found (set env var or repo .env.local)')
}

class FishHttpError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`fish ${status}: ${body.slice(0, 160)}`)
  }
}

async function synth(text: string, voice: string, langCode: string, bitrate: number, key: string): Promise<Buffer> {
  const res = await fetch(FISH_TTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      model: FISH_MODEL,
    },
    body: JSON.stringify({
      text,
      reference_id: voice,
      format: 'mp3',
      mp3_bitrate: bitrate,
      normalize: true,
      language: langCode,
    }),
  })
  if (!res.ok) throw new FishHttpError(res.status, await res.text())
  return Buffer.from(await res.arrayBuffer())
}

/** Retry 429 (5-concurrent free-tier limit) / 5xx / network with backoff.
 *  401/402/403 are fatal: bad key or model has no credit — stop the whole run. */
async function withRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
  let wait = 4000
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn()
    } catch (e) {
      if (e instanceof FishHttpError && [401, 402, 403].includes(e.status)) throw e
      if (attempt >= 8) throw e
      if (attempt === 1) process.stdout.write(`\n  ${label}: retrying (${e instanceof FishHttpError ? e.status : 'net'})...`)
      await sleep(wait + Math.random() * 1500)
      wait = Math.min(wait * 2, 60000)
    }
  }
}

async function pool<T>(items: readonly T[], size: number, fn: (item: T, index: number) => Promise<void>) {
  let next = 0
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    for (;;) {
      const i = next++
      if (i >= items.length) return
      await fn(items[i], i)
    }
  })
  await Promise.all(workers)
}

function langFilterSet(): Set<string> {
  if (LANG_ARG === 'all') return new Set(['en-GB', 'ar-EG', 'de-DE'])
  return new Set(
    LANG_ARG.split(',')
      .map((l) => LANG_CODES[l.trim()])
      .filter(Boolean),
  )
}

function profileFilterSet(): Set<TtsProfile> {
  if (PROFILE_ARG === 'all') return new Set(['narrator', 'sonic'])
  return new Set(PROFILE_ARG.split(',').map((p) => p.trim()).filter(Boolean) as TtsProfile[])
}

/** Items that have a configured voice AND a key. */
function withKeys(items: SpeakableItem[]): { item: SpeakableItem; key: string }[] {
  const out: { item: SpeakableItem; key: string }[] = []
  for (const item of items) {
    const key = premiumKey(item.text, item.lang, item.profile)
    if (key) out.push({ item, key })
  }
  return out
}

function estBytes(chars: number, bitrate: number): number {
  // ~15 chars/sec speech; bitrate is kbit/s
  return Math.round((chars / 15) * ((bitrate * 1000) / 8))
}

// ------------------------------------------------------- corpus cache + load
const CORPUS_CACHE = join(TMP_DIR, '_tts-corpus.json')

function newestMtime(path: string): number {
  const st = statSync(path)
  if (!st.isDirectory()) return st.mtimeMs
  let newest = 0
  for (const f of readdirSync(path, { withFileTypes: true })) {
    newest = Math.max(newest, newestMtime(join(path, f.name)))
  }
  return newest
}

/** Full 900-seed enumeration takes many minutes, so it is cached in
 *  tmp/_tts-corpus.json and reused while every source it depends on is older
 *  than the cache. Touch any content/engine file and it re-enumerates. */
function loadCorpus(): SpeakableItem[] {
  try {
    const cacheMtime = statSync(CORPUS_CACHE).mtimeMs
    const srcMtime = Math.max(
      newestMtime(join(ROOT, 'scripts', 'tts-corpus.mts')),
      newestMtime(join(ROOT, 'src', 'content')),
      newestMtime(join(ROOT, 'src', 'engine', 'ttsPremium.ts')),
      newestMtime(join(ROOT, 'src', 'engine', 'tts.ts')),
      newestMtime(join(ROOT, 'src', 'engine', 'slideshow.ts')),
    )
    if (cacheMtime > srcMtime) {
      const parsed = JSON.parse(readFileSync(CORPUS_CACHE, 'utf8')) as unknown
      const items = Array.isArray(parsed)
        ? (parsed as SpeakableItem[])
        : ((parsed as { items?: SpeakableItem[] }).items ?? null)
      if (items && items.length) {
        console.log(`corpus: ${items.length} items from cache (tmp/_tts-corpus.json)`)
        return items
      }
    }
  } catch {
    /* fall through to enumeration */
  }
  console.log('corpus: enumerating (full 900-seed pass, click away and come back)...')
  const t0 = Date.now()
  const items = enumerateSpeakable()
  mkdirSync(TMP_DIR, { recursive: true })
  writeFileSync(CORPUS_CACHE, JSON.stringify({ v: 1, items }))
  console.log(`corpus: ${items.length} items enumerated in ${((Date.now() - t0) / 1000).toFixed(1)}s + cached`)
  return items
}

// ---------------------------------------------------------------- stats mode
function statsMode() {
  const t0 = Date.now()
  const full = loadCorpus()
  const tEnum = Date.now()
  const fresh = full.filter((i) => i.seedIdx !== undefined && i.seedIdx >= BASE_SEEDS.length)
  const baseCount = full.filter((i) => i.seedIdx === undefined || i.seedIdx < BASE_SEEDS.length).length

  const groups = new Map<string, { items: SpeakableItem[]; chars: number }>()
  for (const item of full) {
    const g = groups.get(`${item.profile}/${item.lang}`) ?? { items: [], chars: 0 }
    g.items.push(item)
    g.chars += item.text.length
    groups.set(`${item.profile}/${item.lang}`, g)
  }
  let totalChars = 0
  let totalItems = 0
  for (const name of [...groups.keys()].sort()) {
    const g = groups.get(name)!
    const hasVoice = !!PREMIUM_VOICES[g.items[0].lang]?.[g.items[0].profile as TtsProfile]
    totalChars += g.chars
    totalItems += g.items.length
    console.log(
      `${name.padEnd(18)} ${String(g.items.length).padStart(5)} strings ${String(g.chars).padStart(7)} chars  ` +
        `${fmtMB(estBytes(g.chars, BITRATE)).padStart(9)} @${BITRATE}kbps${hasVoice ? '' : '  [no voice configured - skipped]'}`,
    )
  }
  console.log(`TOTAL              ${String(totalItems).padStart(5)} strings ${String(totalChars).padStart(7)} chars`)
  console.log(
    `Key uniqueness: ${withKeys(full).length}/${full.length} items have keys` +
      (full.length - withKeys(full).length ? ' (missing voice config for the rest)' : ''),
  )
  console.log(
    `Saturation: ${baseCount} strings from the ${BASE_SEEDS.length} consecutive seeds, ` +
      `${fresh.length} extra from the ${HASHED_SEEDS.length} hashed seeds (total ${full.length})`,
  )
  if (fresh.length) {
    console.log('  new samples (first 5):')
    for (const s of fresh.slice(0, 5)) console.log(`   [${s.profile}/${s.lang}] ${JSON.stringify(s.text).slice(0, 100)}`)
  }
  console.log(
    `enumerated in ${((tEnum - t0) / 1000).toFixed(1)}s, total ${((Date.now() - t0) / 1000).toFixed(1)}s`,
  )
}

// ---------------------------------------------------------------- check mode
function checkMode() {
  const has = manifestSet()
  const wanted = withKeys(loadCorpus())
  const missing: string[] = []
  for (const { item, key } of wanted) {
    if (!has.has(key) || !existsSync(join(OUT_DIR, `${key}.mp3`))) missing.push(`[${item.profile}/${item.lang}] ${item.text}`)
  }
  console.log(`coverage: ${wanted.length - missing.length}/${wanted.length} corpus strings have clips`)
  for (const m of missing.slice(0, 20)) console.log(`  MISSING ${m}`)
  if (missing.length > 20) console.log(`  ... and ${missing.length - 20} more`)
  process.exitCode = missing.length ? 1 : 0
}

function manifestSet(): Set<string> {
  try {
    const j = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as { keys?: unknown }
    return new Set(Array.isArray(j.keys) ? (j.keys as string[]) : [])
  } catch {
    return new Set()
  }
}

function writeManifest(): { keys: string[]; files: number; bytes: number } {
  mkdirSync(OUT_DIR, { recursive: true })
  const files = readdirSync(OUT_DIR).filter((f) => f.endsWith('.mp3'))
  let bytes = 0
  for (const f of files) bytes += statSync(join(OUT_DIR, f)).size
  const keys = files.map((f) => f.slice(0, -4)).sort()
  writeFileSync(MANIFEST_PATH, JSON.stringify({ v: TTS_VERSION, count: keys.length, keys }) + '\n')
  return { keys, files: files.length, bytes }
}

// ---------------------------------------------------------------- demo mode
interface DemoVoice {
  label: string
  id: string
  note?: string
}
const DEMO_SENTENCES: Record<string, { narrator: string; sonic: string }> = {
  'en-GB': {
    narrator: '"Come and play!" called Mia.',
    sonic: '"Hello!" said Tails.',
  },
  'ar-EG': {
    narrator: 'اختر الإجابة الصحيحة',
    sonic: 'مرحباً! أنا سونيك!',
  },
  'de-DE': {
    narrator: 'Das ist ein Apfel.',
    sonic: 'Hallo! Ich bin Sonic!',
  },
}
/** Round 2 (user: "use sonic character sounds instead") — actual Sonic
 *  character-voice models per language, each reading a narrator line AND a
 *  Sonic line so one listen covers both narrative and character delivery. */
const DEMO_VOICES: Record<string, DemoVoice[]> = {
  'en-GB': [
    { label: 'sonic-roger-craig-smith', id: '48484faae07e4cfdb8064da770ee461e', note: 'Roger Craig Smith — OFFICIAL modern Sonic (Twitter Takeover) — top pick 🦔' },
    { label: 'sonic-classic', id: 'e1ccd2d156104873a651bd3916951e8a', note: 'Classic high-pitched Sonic — most used on Fish (143k runs, 396 likes)' },
    { label: 'sonic-jason-griffith', id: '00269ec592514981af298501487acc87', note: 'Jason Griffith — Sonic X era voice' },
    { label: 'sonic-ben-schwartz', id: '2f7286dbb3c649608aaed7a5e10b0ac5', note: 'Ben Schwartz — 2020 movie Sonic' },
    { label: 'sonic-ryan-drummond', id: '819bef35f241425291167f5ee794151c', note: 'Ryan Drummond — Dreamcast era voice' },
  ],
  'ar-EG': [
    { label: 'tails-movie-ar', id: '2c72e0fbea364f41bc09f4f41b6b875f', note: "🦊 Tails (MOVIE voice — Colleen O'Shaughnessey) reading ARABIC — cross-lingual test (user idea)" },
    { label: 'sonic-movie-ar', id: '2f7286dbb3c649608aaed7a5e10b0ac5', note: '🦔 Sonic (MOVIE — Ben Schwartz) reading ARABIC — cross-lingual test' },
    { label: 'sonic-ar', id: 'd88949c5b7b2447a94d39f88ace5933c', note: 'سونيك بالعربية — الأكثر استخداماً (2.2k runs) — native Arabic Sonic 🦔' },
    { label: 'sonic-ar-2', id: '2cfa0471792b480ba5791fa9d4b2594f', note: 'SONIC — صوت عربي آخر (native)' },
    { label: 'sonic-ar-chameleon', id: '801d816df31c41c29bd36e3fdb937847', note: 'Chameleon (Sonic Boom) — عربي فصيح، مرح (native)' },
  ],
  'de-DE': [
    { label: 'knuckles-movie-de', id: '967a7dc361d84a75a233183aa592cac0', note: '🟥 Knuckles (MOVIE voice — Idris Elba style) reading GERMAN — cross-lingual test (user idea)' },
    { label: 'sonic-movie-de', id: '2f7286dbb3c649608aaed7a5e10b0ac5', note: '🦔 Sonic (MOVIE — Ben Schwartz) reading GERMAN — cross-lingual test' },
    { label: 'sonic-de-ryan-drummond', id: '9a70b90797cd475dade5304809c77dc1', note: 'Sonic (Ryan Drummond) — spricht DEUTSCH + Englisch — native' },
    { label: 'metal-sonic-de', id: '13533a60000342348698dda798564e72', note: 'Metal Sonic — Roboterstimme (982 Likes), de/en/es — native' },
  ],
}

async function demoMode() {
  const key = loadFishKey()
  const bitrates = [64, 128]
  const langs = [...langFilterSet()]
  const outDir = join(TMP_DIR, 'tts-demo')
  mkdirSync(outDir, { recursive: true })
  const jobs: { lang: string; voice: DemoVoice; kind: 'narrator' | 'sonic'; bitrate: number; text: string; file: string }[] = []
  for (const lang of langs) {
    for (const voice of DEMO_VOICES[lang] ?? []) {
      if (!voice.id) continue
      for (const kind of ['narrator', 'sonic'] as const) {
        for (const bitrate of bitrates) {
          const file = join(outDir, `${lang}_${voice.label}_${kind}_${bitrate}.mp3`)
          if (existsSync(file)) continue
          jobs.push({ lang, voice, kind, bitrate, text: DEMO_SENTENCES[lang][kind], file })
        }
      }
    }
  }
  console.log(`demo: ${jobs.length} clips to generate`)
  let done = 0
  await pool(jobs, CONCURRENCY, async (job) => {
    const buf = await withRetry(`${job.voice.label}/${job.kind}@${job.bitrate}`, () =>
      synth(job.text, job.voice.id, job.lang.slice(0, 2), job.bitrate, key),
    )
    writeFileSync(job.file, buf)
    done++
    console.log(`[${done}/${jobs.length}] ${job.voice.label} ${job.kind} @${job.bitrate} (${(buf.length / 1024).toFixed(0)}KB)`)
  })
  writeDemoPage(outDir, langs)
  console.log(`demo page: ${join(outDir, 'index.html')}`)
}

function writeDemoPage(outDir: string, langs: string[]) {
  const rows: string[] = []
  for (const lang of langs) {
    rows.push(`<h2>${lang}</h2>`)
    for (const voice of DEMO_VOICES[lang] ?? []) {
      if (!voice.id) continue
      const cells: string[] = []
      for (const kind of ['narrator', 'sonic'] as const) {
        for (const bitrate of [64, 128]) {
          const file = `${lang}_${voice.label}_${kind}_${bitrate}.mp3`
          const p = join(outDir, file)
          const kb = existsSync(p) ? `${(statSync(p).size / 1024).toFixed(0)}KB` : 'MISSING'
          cells.push(
            `<div class="cell"><audio controls preload="none" src="${file}"></audio>` +
              `<small>${kind} @${bitrate}kbps · ${kb}</small></div>`,
          )
        }
      }
      rows.push(
        `<section><h3>${voice.label}</h3>` +
          (voice.note ? `<p class="note">${voice.note}</p>` : '') +
          `<div class="grid">${cells.join('')}</div></section>`,
      )
    }
  }
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>momomath voice picks</title>
<style>
body{font-family:system-ui;background:#0f172a;color:#e2e8f0;padding:24px;max-width:900px;margin:0 auto}
h1{font-size:20px}h2{margin-top:32px;color:#7dd3fc;text-transform:uppercase;font-size:14px;letter-spacing:.1em}
section{background:#1e293b;border-radius:12px;padding:12px 16px;margin:12px 0}
h3{margin:4px 0 10px;font-size:15px;color:#fbbf24}
.note{margin:0 0 10px;color:#cbd5e1;font-size:12px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.cell{display:flex;flex-direction:column;gap:2px}
audio{width:100%;height:34px}
small{color:#94a3b8;font-size:11px}
</style></head><body>
<h1>🎧 momomath premium-voice candidates — listen &amp; pick</h1>
<p style="color:#94a3b8">Each voice reads the same narrator line and the same Sonic line at 64 and 128 kbps. Reply with your picks (e.g. "narrator: eimear, sonic: noah").</p>
${rows.join('\n')}
</body></html>`
  writeFileSync(join(outDir, 'index.html'), html)
}

// ---------------------------------------------------------------- generate mode
async function generateMode() {
  const items = withKeys(loadCorpus())
  const langs = langFilterSet()
  const profiles = profileFilterSet()
  const targets = new Map<string, { item: SpeakableItem; key: string }[]>()
  for (const it of items) {
    if (!langs.has(it.item.lang) || !profiles.has(it.item.profile)) continue
    const name = `${it.item.lang}/${it.item.profile}`
    const list = targets.get(name) ?? []
    list.push(it)
    targets.set(name, list)
  }
  let total = 0
  const plan: { item: SpeakableItem; key: string }[] = []
  for (const name of [...targets.keys()].sort()) {
    const list = targets.get(name)!
    const have = list.filter((t) => existsSync(join(OUT_DIR, `${t.key}.mp3`)))
    const todo = list.filter((t) => !existsSync(join(OUT_DIR, `${t.key}.mp3`)))
    const limited = LIMIT ? todo.slice(0, LIMIT) : todo
    const chars = limited.reduce((n, t) => n + t.item.text.length, 0)
    total += limited.length
    plan.push(...limited)
    console.log(
      `${name.padEnd(18)} have ${String(have.length).padStart(5)}  todo ${String(todo.length).padStart(5)}` +
        `${LIMIT ? ` (this run ${limited.length})` : ''}  ~${fmtMB(estBytes(chars, BITRATE))} @${BITRATE}kbps`,
    )
  }
  console.log(`planned: ${total} clips`)
  if (DRY) {
    console.log('dry run - nothing generated')
    return
  }
  if (!total) {
    console.log('nothing to do; refreshing manifest')
    const m = writeManifest()
    console.log(`manifest: ${m.files} files, ${fmtMB(m.bytes)}`)
    return
  }
  const key = loadFishKey()
  console.log('preflight: 1 test call...')
  await withRetry('preflight', () => synth('Ready!', DEMO_VOICES['en-GB'][0].id, 'en', 64, key))
  console.log('preflight OK')

  mkdirSync(OUT_DIR, { recursive: true })
  let done = 0
  let failed = 0
  let bytes = 0
  const failures: string[] = []
  const t0 = Date.now()
  await pool(plan, CONCURRENCY, async ({ item, key: clipKey }) => {
    const file = join(OUT_DIR, `${clipKey}.mp3`)
    try {
      const buf = await withRetry(`${item.lang}/${item.profile}`, () =>
        synth(item.text, PREMIUM_VOICES[item.lang]![item.profile]!, item.lang.slice(0, 2), BITRATE, key),
      )
      writeFileSync(file, buf)
      bytes += buf.length
    } catch (e) {
      failed++
      failures.push(`[${item.lang}/${item.profile}] ${item.text.slice(0, 60)} -> ${(e as Error).message.slice(0, 120)}`)
      if (e instanceof FishHttpError && [401, 402, 403].includes(e.status)) throw e
    }
    done++
    if (done % 25 === 0 || done === plan.length) {
      const rate = done / ((Date.now() - t0) / 1000)
      const eta = Math.round((plan.length - done) / Math.max(rate, 0.01))
      console.log(
        `[${done}/${plan.length}] ok=${done - failed} fail=${failed} ${fmtMB(bytes)}  ${eta}s left`,
      )
    }
  })
  const m = writeManifest()
  console.log(`done: ${done - failed}/${plan.length} generated, ${failed} failed`)
  console.log(`manifest: ${m.files} files total, ${fmtMB(m.bytes)} on disk`)
  if (failures.length) {
    console.log('failures:')
    for (const f of failures.slice(0, 10)) console.log(`  ${f}`)
    process.exitCode = 1
  }
  if (flag('--prune')) {
    const keep = new Set(m.keys)
    let pruned = 0
    for (const f of readdirSync(OUT_DIR).filter((f) => f.endsWith('.mp3'))) {
      if (!keep.has(f.slice(0, -4))) {
        unlinkSync(join(OUT_DIR, f))
        pruned++
      }
    }
    console.log(`pruned ${pruned} orphan clip(s)`)
  }
}

if (mode === 'stats') statsMode()
else if (mode === 'check') checkMode()
else if (mode === 'demo') await demoMode()
else await generateMode()
