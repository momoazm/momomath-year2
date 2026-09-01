import type { LessonDef, UnitDef } from '../types'

/**
 * Science (Cambridge Primary Stage 2) — STUB.
 *
 * The real curriculum (plants, animals incl. humans, materials & their uses,
 * seasonal changes, forces & movement) lands in a follow-up commit. For now
 * the path screen shows a friendly "coming soon" empty state instead of
 * crashing, and the type system already treats `science` as a first-class
 * subject so the rollout is additive.
 */
export const SCIENCE_UNITS: UnitDef[] = []

export const SCIENCE_ALL_LESSONS: Record<string, { unit: UnitDef; lesson: LessonDef }> = {}
