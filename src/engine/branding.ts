/**
 * Year-aware browser branding (PLAN 160; step 166 extends this to the gate
 * heading, roadmap footer, meta description / apple-mobile-web-app-title /
 * manifest which all go year-neutral: "Momo Cambridge").
 *
 * `documentTitleFor(2)` must stay byte-identical to the static
 * <title> in index.html so existing users and verify markers see no change.
 */
import type { YearLevel } from './store'

/** Dynamic document title for the active year: "Momo Year N Cambridge – Learning Adventure". */
export function documentTitleFor(year: YearLevel): string {
  return `Momo Year ${year} Cambridge – Learning Adventure`
}

/** Write the active year's title onto document.title (no-op without a DOM). */
export function applyDocumentTitle(year: YearLevel): void {
  if (typeof document !== 'undefined') document.title = documentTitleFor(year)
}

/** Welcome-gate heading for the active year (Year 2 = the shipped string,
 *  byte-identical so verify-live / vgam markers stay green). */
export function welcomeHeadingFor(year: YearLevel): string {
  return `Welcome to Momo Year ${year} Cambridge!`
}

/** Roadmap footer for the active year (Year 2 = the shipped string). */
export function roadmapFooterFor(year: YearLevel, subjectLabel: string, lessonCount: number): string {
  return `Momo Year ${year} Cambridge · ${subjectLabel} · ${lessonCount} lessons`
}
