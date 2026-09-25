/**
 * WS15 — practice calendar + weekly recap.
 *
 * `activityDays` is a capped log of local ISO days ("YYYY-MM-DD") on which the
 * child practised (lesson finish / practice round / arcade XP). It powers the
 * Profile month grid and is union-merged across devices in cloudsave (a day
 * practised anywhere stays lit).
 *
 * Everything here is pure and deterministic — no AI, no randomness: counts,
 * percentages and calendar math only, safe to show a child.
 */
import { todayISO } from './gamification'
import type { Subject } from '../content/types'
import type { AttemptLogEntry } from './adaptive/types'

/** Newest N days kept in the log (old days drop off the grid). */
export const ACTIVITY_DAYS_CAP = 60

export const ISO_DAY_RE = /^\d{4}-\d{2}-\d{2}$/

export function isIsoDay(v: unknown): v is string {
  return typeof v === 'string' && ISO_DAY_RE.test(v)
}

/** Valid ISO days only → deduped → sorted ascending → capped at the newest 60. */
export function normaliseActivityDays(days: readonly string[] | null | undefined): string[] {
  if (!Array.isArray(days)) return []
  const out = [...new Set(days.filter(isIsoDay))].sort()
  return out.length > ACTIVITY_DAYS_CAP ? out.slice(-ACTIVITY_DAYS_CAP) : out
}

/** Cross-device union: a day practised on ANY device survives the sync merge. */
export function mergeActivityDays(a?: readonly string[] | null, b?: readonly string[] | null): string[] {
  return normaliseActivityDays([...(a ?? []), ...(b ?? [])])
}

/** Append `today` (ISO) to the log unless already there; dedupe + cap applied. */
export function addActivityDay(list: readonly string[] | null | undefined, today: string): string[] {
  const base = Array.isArray(list) ? list : []
  return normaliseActivityDays(isIsoDay(today) ? [...base, today] : base)
}

/** Lesson-id prefix → subject (mirrors the store's daily-quest helper). */
export function subjectOfLesson(lessonId: string): Subject | null {
  if (lessonId.startsWith('e')) return 'english'
  if (lessonId.startsWith('s')) return 'science'
  if (lessonId.startsWith('g')) return 'german'
  if (lessonId.startsWith('a')) return 'arabic'
  if (lessonId.startsWith('r')) return 'religion'
  if (lessonId.startsWith('d')) return 'social'
  if (lessonId.startsWith('u')) return 'math'
  return null
}

/** Canonical display order for "subjects touched this week". */
const SUBJECT_ORDER: Subject[] = ['math', 'english', 'science', 'german', 'arabic', 'religion', 'social']

export interface WeeklyRecapInput {
  /** league-week XP (the same number the Leagues tab shows) */
  weeklyXp: number
  /** league week key `weeklyXp` counts against */
  weeklyXpWeek: string
  /** cards won this league week (local counter; lazy-resets with the week) */
  cardsWonWeek: number
  /** week key `cardsWonWeek` counts against — stale key ⇒ show 0 */
  cardsWonWeekKey: string
  activityDays: readonly string[]
  attempts: readonly AttemptLogEntry[]
}

export interface WeeklyRecap {
  xp: number
  /** cards won in the CURRENT league week (0 when the counter key is stale) */
  cardsWon: number
  attemptCount: number
  correctCount: number
  /** rounded % of first attempts inside the window; null when none */
  accuracyPct: number | null
  /** distinct subjects answered in the window (canonical order) */
  subjects: Subject[]
  /** practised days inside the 7-day window (including today) */
  activeDays: number
  /** inclusive window bounds as ISO days */
  windowStart: string
  windowEnd: string
}

/**
 * 7-day recap (today and the 6 days before it, local time).
 * XP comes from the league week (consistent with the Leagues tab); accuracy,
 * subjects and active days are computed strictly inside the window.
 */
export function buildWeeklyRecap(input: WeeklyRecapInput, now: number = Date.now()): WeeklyRecap {
  const nowDate = new Date(now)
  const today = todayISO(nowDate)
  const start = new Date(nowDate)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - 6)
  const startMs = start.getTime()
  const end = new Date(nowDate)
  end.setHours(0, 0, 0, 0)
  end.setDate(end.getDate() + 1) // exclusive: tomorrow midnight
  const endMs = end.getTime()

  let attemptCount = 0
  let correctCount = 0
  const touched = new Set<Subject>()
  for (const e of input.attempts) {
    if (e.ts < startMs || e.ts >= endMs) continue
    attemptCount++
    if (e.correct) correctCount++
    const subj = subjectOfLesson(e.lessonId)
    if (subj) touched.add(subj)
  }

  const windowStartISO = todayISO(start)
  const activeDays = (input.activityDays ?? []).filter((d) => isIsoDay(d) && d >= windowStartISO && d <= today).length

  const cardsWon =
    input.cardsWonWeekKey && input.cardsWonWeekKey === input.weeklyXpWeek
      ? Math.max(0, Math.round(input.cardsWonWeek || 0))
      : 0

  return {
    xp: Math.max(0, Math.round(input.weeklyXp || 0)),
    cardsWon,
    attemptCount,
    correctCount,
    accuracyPct: attemptCount > 0 ? Math.round((correctCount / attemptCount) * 100) : null,
    subjects: SUBJECT_ORDER.filter((x) => touched.has(x)),
    activeDays,
    windowStart: windowStartISO,
    windowEnd: today,
  }
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export interface MonthCell {
  day: number
  iso: string
  /** day is in `activityDays` — the child practised */
  active: boolean
  isToday: boolean
  /** after today (this month not finished yet) */
  future: boolean
}

export interface MonthGrid {
  year: number
  /** 0-11, like Date#getMonth */
  month: number
  monthLabel: string
  /** Monday-first weeks, leading/trailing padding as null; length % 7 === 0 */
  cells: (MonthCell | null)[]
  practisedCount: number
}

/** Monday-first month grid for the Profile practice calendar. */
export function buildMonthGrid(
  year: number,
  month: number,
  activityDays: readonly string[],
  now: number = Date.now(),
): MonthGrid {
  const active = new Set(normaliseActivityDays(activityDays))
  const todayStr = todayISO(new Date(now))
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7 // Monday = 0
  const totalDays = new Date(year, month + 1, 0).getDate()
  const cells: (MonthCell | null)[] = Array.from({ length: offset }, () => null)
  let practisedCount = 0
  for (let day = 1; day <= totalDays; day++) {
    const iso = todayISO(new Date(year, month, day))
    const isActive = active.has(iso)
    if (isActive) practisedCount++
    cells.push({ day, iso, active: isActive, isToday: iso === todayStr, future: iso > todayStr })
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return {
    year,
    month,
    monthLabel: MONTHS[month] ?? '',
    cells,
    practisedCount,
  }
}
