import { describe, expect, it } from 'vitest'
import {
  CARDS,
  DUST_PER_CARD,
  MAX_STAR,
  STAR_THRESHOLDS,
  copiesToNextStar,
  starLevel,
  toStar,
} from '../src/engine/cards'

describe('star curve [3,6,10,15,21]', () => {
  it('thresholds are exactly the planned curve', () => {
    expect(STAR_THRESHOLDS).toEqual([3, 6, 10, 15, 21])
    expect(MAX_STAR).toBe(5)
  })

  it('starLevel maps copy counts to 0-5 stars', () => {
    expect(starLevel(0)).toBe(0)
    expect(starLevel(1)).toBe(0)
    expect(starLevel(2)).toBe(0)
    expect(starLevel(3)).toBe(1)
    expect(starLevel(5)).toBe(1)
    expect(starLevel(6)).toBe(2)
    expect(starLevel(9)).toBe(2)
    expect(starLevel(10)).toBe(3)
    expect(starLevel(14)).toBe(3)
    expect(starLevel(15)).toBe(4)
    expect(starLevel(20)).toBe(4)
    expect(starLevel(21)).toBe(5)
    expect(starLevel(100)).toBe(5)
    expect(toStar(21)).toBe(5)
  })

  it('copiesToNextStar counts down to each threshold, 0 at max', () => {
    expect(copiesToNextStar(0)).toBe(3)
    expect(copiesToNextStar(2)).toBe(1)
    expect(copiesToNextStar(3)).toBe(3)
    expect(copiesToNextStar(5)).toBe(1)
    expect(copiesToNextStar(20)).toBe(1)
    expect(copiesToNextStar(21)).toBe(0)
    expect(copiesToNextStar(50)).toBe(0)
  })

  it('every chest tier has a maxed-duplicate gem value', () => {
    for (const c of CARDS) {
      expect(DUST_PER_CARD[c.tier]).toBeGreaterThan(0)
    }
  })
})

describe('library card art contract (real images, no blanks)', () => {
  it('all 100 shipped cards point at an existing art file', () => {
    expect(CARDS).toHaveLength(100)
    const expected: Record<string, string> = {
      tails: 'cards/tails.webp',
      amy: 'cards/amy.webp',
      cream: 'cards/cream.webp',
      charmy: 'cards/charmy.webp',
      big: 'cards/big.webp',
      'movie-tails': 'cards/movie-tails.webp',
      cheese: 'cards/cheese.webp',
      vanilla: 'cards/vanilla.webp',
      froggy: 'cards/froggy.webp',
      omochao: 'cards/omochao.webp',
      marine: 'cards/marine.webp',
      sticks: 'cards/sticks.webp',
      tangle: 'cards/tangle.webp',
      jewel: 'cards/jewel.webp',
      bean: 'cards/bean.webp',
      bark: 'cards/bark.webp',
      trip: 'cards/trip.webp',
      'movie-stone': 'cards/movie-stone.webp',
      'classic-tails': 'cards/classic-tails.webp',
      'classic-knuckles': 'cards/classic-knuckles.webp',
      'classic-amy': 'cards/classic-amy.webp',
      'classic-eggman': 'cards/classic-eggman.webp',
      'boom-sonic': 'cards/boom-sonic.webp',
      'boom-tails': 'cards/boom-tails.webp',
      'boom-knuckles': 'cards/boom-knuckles.webp',
      'boom-amy': 'cards/boom-amy.webp',
      'boom-eggman': 'cards/boom-eggman.webp',
      orbot: 'cards/orbot.webp',
      cubot: 'cards/cubot.webp',
      'egg-robo': 'cards/egg-robo.webp',
      motobug: 'cards/motobug.webp',
      crabmeat: 'cards/crabmeat.webp',
      'buzz-bomber': 'cards/buzz-bomber.webp',
      chopper: 'cards/chopper.webp',
      'egg-pawn': 'cards/egg-pawn.webp',
      zazz: 'cards/zazz.webp',
      zomom: 'cards/zomom.webp',
      zor: 'cards/zor.webp',
      zeena: 'cards/zeena.webp',
      'master-zik': 'cards/master-zik.webp',
      maria: 'cards/maria.webp',
      knuckles: 'cards/knuckles.webp',
      blaze: 'cards/blaze.webp',
      rouge: 'cards/rouge.webp',
      ray: 'cards/ray.webp',
      vector: 'cards/vector.webp',
      'classic-sonic': 'cards/classic-sonic.webp',
      'werehog-sonic': 'cards/werehog-sonic.webp',
      'movie-knuckles': 'cards/movie-knuckles.webp',
      wave: 'cards/wave.webp',
      storm: 'cards/storm.webp',
      fang: 'cards/fang.webp',
      mighty: 'cards/mighty.webp',
      faker: 'cards/faker.webp',
      'metal-knuckles': 'cards/metal-knuckles.webp',
      'tails-doll': 'cards/tails-doll.webp',
      tikal: 'cards/tikal.webp',
      whisper: 'cards/whisper.webp',
      surge: 'cards/surge.webp',
      kit: 'cards/kit.webp',
      sally: 'cards/sally.webp',
      'movie-amy': 'cards/movie-amy.webp',
      'movie-eggman': 'cards/movie-eggman.webp',
      gamma: 'cards/gamma.webp',
      'heavy-king': 'cards/heavy-king.webp',
      'heavy-magician': 'cards/heavy-magician.webp',
      chao: 'cards/chao.webp',
      shadow: 'cards/shadow.webp',
      silver: 'cards/silver.webp',
      metal: 'cards/metal.webp',
      espio: 'cards/espio.webp',
      omega: 'cards/omega.webp',
      'movie-sonic': 'cards/movie-sonic.webp',
      'movie-shadow': 'cards/movie-shadow.webp',
      'neo-metal': 'cards/neo-metal.webp',
      'dark-sonic': 'cards/dark-sonic.webp',
      mephiles: 'cards/mephiles.webp',
      infinite: 'cards/infinite.webp',
      zavok: 'cards/zavok.webp',
      sage: 'cards/sage.webp',
      chaos: 'cards/chaos.webp',
      'eggman-nega': 'cards/eggman-nega.webp',
      'black-doom': 'cards/black-doom.webp',
      'erazor-djinn': 'cards/erazor-djinn.webp',
      'king-arthur': 'cards/king-arthur.webp',
      sonic: 'cards/sonic.webp',
      jet: 'cards/jet.webp',
      'super-shadow': 'cards/super-shadow.webp',
      'hyper-sonic': 'cards/hyper-sonic.webp',
      'hyper-shadow': 'cards/hyper-shadow.webp',
      'excalibur-sonic': 'cards/excalibur-sonic.webp',
      'super-knuckles': 'cards/super-knuckles.webp',
      'super-blaze': 'cards/super-blaze.webp',
      'devil-doom': 'cards/devil-doom.webp',
      'time-eater': 'cards/time-eater.webp',
      eggman: 'cards/eggman.webp',
      super: 'cards/super-sonic.webp',
      'metal-overlord': 'cards/metal-overlord.webp',
      'perfect-chaos': 'cards/perfect-chaos.webp',
      'dark-gaia': 'cards/dark-gaia.webp',
    }
    expect(Object.keys(expected)).toHaveLength(100)
    for (const card of CARDS) {
      expect(card.image, card.id).toBe(expected[card.id])
    }
  })

  it('every card points at painted .webp art (SVG drawings retired)', () => {
    for (const card of CARDS) expect(card.image.endsWith('.webp')).toBe(true)
  })
})
