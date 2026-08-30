import { describe, expect, it } from 'vitest'
import { SHOP_ITEMS, getItem, canAfford, formatPrice } from '../src/engine/shop'
import { usePlayer } from '../src/engine/store'

describe('shop configuration', () => {
  it('has all 5 items with correct prices and max stacks', () => {
    expect(SHOP_ITEMS.length).toBe(5)
    const byId = Object.fromEntries(SHOP_ITEMS.map((i) => [i.id, i]))
    expect(byId['streak-saver'].price).toBe(200)
    expect(byId['streak-saver'].maxStack).toBe(5)
    expect(byId['double-xp'].price).toBe(100)
    expect(byId['double-xp'].maxStack).toBe(3)
    expect(byId['chest-boost'].price).toBe(75)
    expect(byId['chest-boost'].maxStack).toBe(5)
    expect(byId['mega-chest'].price).toBe(150)
    expect(byId['mega-chest'].maxStack).toBe(3)
    expect(byId['lucky-ticket'].price).toBe(120)
    expect(byId['lucky-ticket'].maxStack).toBe(5)
  })

  it('getItem returns the right item', () => {
    expect(getItem('streak-saver')?.name).toBe('Streak Saver')
    expect(getItem('nonexistent')).toBeUndefined()
  })

  it('canAfford returns true when gems >= price', () => {
    expect(canAfford(200, 200)).toBe(true)
    expect(canAfford(201, 200)).toBe(true)
    expect(canAfford(199, 200)).toBe(false)
  })

  it('formatPrice renders gem emoji', () => {
    expect(formatPrice(200)).toBe('200 💎')
    expect(formatPrice(75)).toBe('75 💎')
  })
})

/**
 * Regression: every shop item must actually activate its effect. The deployed
 * bundle (before this fix) only handled 4/5 items - buying a Streak Saver
 * debited gems and bumped inventory but never incremented `streakSavers`,
 * silently leaving the engine state unchanged.
 */
describe('buyItem applies every item effect', () => {
  function freshPlayer() {
    // zustand `persist` reads from localStorage; stub it so the test is hermetic.
    ;(globalThis as unknown as { localStorage: Storage }).localStorage =
      (() => {
        const store = new Map<string, string>()
        return {
          getItem: (k: string) => store.get(k) ?? null,
          setItem: (k: string, v: string) => void store.set(k, v),
          removeItem: (k: string) => void store.delete(k),
          clear: () => store.clear(),
          key: (i: number) => Array.from(store.keys())[i] ?? null,
          get length() { return store.size },
        } as Storage
      })()
    usePlayer.setState({
      gems: 10_000,
      shopInventory: {},
      streakSavers: 0,
      doubleXpLessons: 0,
      chestBoost: false,
      megaChest: false,
      luckyTickets: 0,
    })
  }

  it('streak-saver increments streakSavers (was broken on the deployed site)', () => {
    freshPlayer()
    const r = usePlayer.getState().buyItem('streak-saver')
    expect(r.success).toBe(true)
    expect(usePlayer.getState().streakSavers).toBe(1)
    expect(usePlayer.getState().shopInventory['streak-saver']).toBe(1)
  })

  it('chest-boost and mega-chest flip their flags', () => {
    freshPlayer()
    expect(usePlayer.getState().buyItem('chest-boost').success).toBe(true)
    expect(usePlayer.getState().chestBoost).toBe(true)
    expect(usePlayer.getState().buyItem('mega-chest').success).toBe(true)
    expect(usePlayer.getState().megaChest).toBe(true)
  })

  it('double-xp adds exactly 3 lessons per pack', () => {
    freshPlayer()
    usePlayer.getState().buyItem('double-xp')
    usePlayer.getState().buyItem('double-xp')
    expect(usePlayer.getState().doubleXpLessons).toBe(6)
  })

  it('lucky-ticket increments luckyTickets', () => {
    freshPlayer()
    usePlayer.getState().buyItem('lucky-ticket')
    expect(usePlayer.getState().luckyTickets).toBe(1)
  })

  it('rejects purchases when gems are insufficient and never mutates state', () => {
    freshPlayer()
    usePlayer.setState({ gems: 50 })
    const before = usePlayer.getState()
    const r = usePlayer.getState().buyItem('streak-saver') // 200 💎
    expect(r.success).toBe(false)
    expect(r.message).toBe('Not enough gems!')
    const after = usePlayer.getState()
    expect(after.gems).toBe(before.gems)
    expect(after.streakSavers).toBe(0)
    expect(after.shopInventory).toEqual(before.shopInventory)
  })

  it('enforces every maxStack so you can never own more than allowed', () => {
    freshPlayer()
    for (let i = 0; i < 5; i++) usePlayer.getState().buyItem('chest-boost')
    expect(usePlayer.getState().shopInventory['chest-boost']).toBe(5)
    const r = usePlayer.getState().buyItem('chest-boost')
    expect(r.success).toBe(false)
    expect(r.message).toBe('Max 5 per item!')
  })
})