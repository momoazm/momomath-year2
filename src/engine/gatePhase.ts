import type { SyncStatus } from './cloudsave'

export type GatePhase = 'signin' | 'loading' | 'picker' | 'open'

export interface GatePhaseInput {
  hasUser: boolean
  hasCredential: boolean
  syncStatus: SyncStatus
  /** True once a pull for the current session returned a remote save. */
  remoteExists: boolean
  localOnboarded: boolean
  /** `?gate=2` / `?gate=3` forces the picker for QA; 0 = no force. */
  qaForcedStep: 0 | 2 | 3
}

/**
 * Pure gate state machine — no React/zustand.
 *
 * - `signin`  → show step 1 (Google sign-in)
 * - `loading` → signed in with a credential; wait for the initial pull
 * - `picker`  → new user (or QA force): steps 2 name + 3 character
 * - `open`    → close the gate; roadmap is safe to show
 *
 * Settled non-success paths (`expired`/`error`) and credential-less QA
 * seeds resolve on local `onboarded` so users are never stranded.
 */
export function resolveGatePhase(input: GatePhaseInput): GatePhase {
  if (input.qaForcedStep === 2 || input.qaForcedStep === 3) return 'picker'
  if (!input.hasUser) return 'signin'

  if (input.hasCredential) {
    if (input.syncStatus === 'signed-out' || input.syncStatus === 'syncing') return 'loading'
    if (input.syncStatus === 'synced' && input.remoteExists) return 'open'
    // synced+no remote = new account; expired/error = no remote data arrived.
    return input.localOnboarded ? 'open' : 'picker'
  }

  // QA seed: user without credential — settle on local onboarded.
  return input.localOnboarded ? 'open' : 'picker'
}
