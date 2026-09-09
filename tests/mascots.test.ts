import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MASCOTS } from '../src/components/mascots/Mascots'
import type { MascotId } from '../src/content/types'

/** Signature gradient/marker per character — proves each is real art,
 *  not a tinted clone of another mascot. */
const SIGNATURES: Record<MascotId, string> = {
  sonic: 'sncB',
  tails: 'tlsB',
  knuckles: 'knxB',
  amy: 'amyB',
  shadow: 'shdB',
  silver: 'slvB',
  metal: 'metalHead',
  cream: 'crmB',
  blaze: 'blzB',
  rouge: 'rgH',
  eggman: 'eggShine',
  charmy: 'chaB',
  big: 'bigB',
  ray: 'rayB',
  vector: 'vecB',
  espio: 'espB',
  omega: 'omH',
  jet: 'jetB',
  super: 'supB',
}

function render(id: MascotId): string {
  const C = MASCOTS[id]
  return renderToStaticMarkup(C({ expression: 'happy' }))
}

describe('mascot roster (real characters, no clones)', () => {
  it('covers every playable character id', () => {
    expect(new Set(Object.keys(MASCOTS))).toEqual(new Set(Object.keys(SIGNATURES)))
  })

  it('every mascot renders non-empty SVG markup', () => {
    for (const id of Object.keys(MASCOTS) as MascotId[]) {
      const html = render(id)
      expect(html.includes('<svg'), id).toBe(true)
      expect(html.length, id).toBeGreaterThan(500)
    }
  })

  it('every mascot carries its own signature gradient/marker', () => {
    for (const [id, sig] of Object.entries(SIGNATURES) as [MascotId, string][]) {
      expect(render(id).includes(sig), `${id} should contain ${sig}`).toBe(true)
    }
  })

  it('no two mascots share identical markup', () => {
    const seen = new Map<string, string>()
    for (const id of Object.keys(MASCOTS) as MascotId[]) {
      const html = render(id)
      expect(seen.has(html), `${id} duplicates ${seen.get(html)}`).toBe(false)
      seen.set(html, id)
    }
  })
})
