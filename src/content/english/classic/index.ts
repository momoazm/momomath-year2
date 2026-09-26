import type { BookDef } from '../../types'
import { CLS_PIGS } from './pigs'
import { CLS_REDHOOD } from './redhood'
import { CLS_TORTOISE } from './tortoise'
import { CLS_BILLYGOATS } from './billygoats'
import { CLS_ANTGRASS } from './antgrasshopper'
import { CLS_GOLDILOCKS } from './goldilocks'

/** Public-domain classic storybooks, each retold in original wording for Year 2 readers. */
export const CLASSIC_BOOKS: BookDef[] = [
  CLS_PIGS, CLS_REDHOOD, CLS_TORTOISE, CLS_BILLYGOATS, CLS_ANTGRASS, CLS_GOLDILOCKS,
]

export const CLASSIC_BOOKS_BY_ID: Record<string, BookDef> = {}
for (const b of CLASSIC_BOOKS) CLASSIC_BOOKS_BY_ID[b.id] = b
