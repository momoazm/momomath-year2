import type { BookDef } from '../../types'
import { BOOK_E1 } from './e01'
import { BOOK_E2 } from './e02'
import { BOOK_E3 } from './e03'
import { BOOK_E4 } from './e04'
import { BOOK_E5 } from './e05'
import { BOOK_E6 } from './e06'
import { BOOK_E7 } from './e07'
import { BOOK_E8 } from './e08'
import { BOOK_E9 } from './e09'
import { BOOK_E10 } from './e10'
import { BOOK_E11 } from './e11'
import { BOOK_E12 } from './e12'
import { BOOK_E13 } from './e13'

/** All English unit storybooks (one per unit, 5-10 pages each). */
export const ENGLISH_BOOKS: BookDef[] = [
  BOOK_E1, BOOK_E2, BOOK_E3, BOOK_E4, BOOK_E5, BOOK_E6, BOOK_E7,
  BOOK_E8, BOOK_E9, BOOK_E10, BOOK_E11, BOOK_E12, BOOK_E13,
]

export const BOOKS_BY_UNIT: Record<string, BookDef> = {}
for (const b of ENGLISH_BOOKS) BOOKS_BY_UNIT[b.unitId] = b

export const BOOKS_BY_ID: Record<string, BookDef> = {}
for (const b of ENGLISH_BOOKS) BOOKS_BY_ID[b.id] = b
