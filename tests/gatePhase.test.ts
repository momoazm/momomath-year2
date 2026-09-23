import { describe, expect, it } from 'vitest'
import { resolveGatePhase, type GatePhaseInput } from '../src/engine/gatePhase'

function base(overrides: Partial<GatePhaseInput> = {}): GatePhaseInput {
  return {
    hasUser: false,
    hasCredential: false,
    syncStatus: 'signed-out',
    remoteExists: false,
    localOnboarded: false,
    qaForcedStep: 0,
    ...overrides,
  }
}

describe('resolveGatePhase', () => {
  it('shows sign-in when there is no user', () => {
    expect(resolveGatePhase(base())).toBe('signin')
    expect(
      resolveGatePhase(base({ syncStatus: 'syncing', hasCredential: true })),
    ).toBe('signin')
  })

  it('waits on loading while the credential pull is in flight', () => {
    expect(
      resolveGatePhase(
        base({ hasUser: true, hasCredential: true, syncStatus: 'syncing' }),
      ),
    ).toBe('loading')
    // user+credential set, subscribe has not flipped status yet
    expect(
      resolveGatePhase(
        base({ hasUser: true, hasCredential: true, syncStatus: 'signed-out' }),
      ),
    ).toBe('loading')
  })

  it('opens straight to the roadmap for a returning user (remote save)', () => {
    expect(
      resolveGatePhase(
        base({
          hasUser: true,
          hasCredential: true,
          syncStatus: 'synced',
          remoteExists: true,
          localOnboarded: false,
        }),
      ),
    ).toBe('open')
  })

  it('routes a brand-new account (synced, no remote) to the picker', () => {
    expect(
      resolveGatePhase(
        base({
          hasUser: true,
          hasCredential: true,
          syncStatus: 'synced',
          remoteExists: false,
          localOnboarded: false,
        }),
      ),
    ).toBe('picker')
  })

  it('opens for synced+no remote when local is already onboarded', () => {
    expect(
      resolveGatePhase(
        base({
          hasUser: true,
          hasCredential: true,
          syncStatus: 'synced',
          remoteExists: false,
          localOnboarded: true,
        }),
      ),
    ).toBe('open')
  })

  it('settles expired/error on local onboarded', () => {
    for (const syncStatus of ['expired', 'error'] as const) {
      expect(
        resolveGatePhase(
          base({ hasUser: true, hasCredential: true, syncStatus, localOnboarded: true }),
        ),
      ).toBe('open')
      expect(
        resolveGatePhase(
          base({ hasUser: true, hasCredential: true, syncStatus, localOnboarded: false }),
        ),
      ).toBe('picker')
    }
  })

  it('settles a QA seed (user, no credential) on local onboarded', () => {
    expect(resolveGatePhase(base({ hasUser: true, localOnboarded: true }))).toBe('open')
    expect(resolveGatePhase(base({ hasUser: true, localOnboarded: false }))).toBe('picker')
  })

  it('forces the picker for ?gate=2|3 regardless of session', () => {
    expect(resolveGatePhase(base({ qaForcedStep: 2 }))).toBe('picker')
    expect(
      resolveGatePhase(
        base({
          qaForcedStep: 3,
          hasUser: true,
          hasCredential: true,
          syncStatus: 'synced',
          remoteExists: true,
          localOnboarded: true,
        }),
      ),
    ).toBe('picker')
  })
})
