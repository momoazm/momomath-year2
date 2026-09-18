import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { usePlayer } from './store'

export interface AuthUser {
  sub: string
  name: string
  email: string
  picture?: string
}

interface AuthState {
  user: AuthUser | null
  /** First-party session from POST /api/year2/session (HMAC, ~90 days).
   *  Sent as `Bearer` on every cloud-save call — the `sub` inside is what
   *  keys your save, so the same Google account loads the same progress on
   *  every device. Google itself is only contacted once, at sign-in. */
  session: string | null
  /** Epoch ms when `session` expires (server-issued). Past it, the app asks
   *  you to tap sign-in again instead of failing syncs silently. */
  sessionExp: number | null
  signIn: (u: AuthUser, session?: string | null, sessionExp?: number | null) => void
  signOut: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      sessionExp: null,
      signIn: (user, session = null, sessionExp = null) => set({ user, session, sessionExp }),
      signOut: () => set({ user: null, session: null, sessionExp: null }),
    }),
    { name: 'momomath-year2-auth' },
  ),
)

// One-time upgrade: the pre-session build persisted the raw 1h Google ID
// token as `credential`. That token is dead by now and must never be sent
// again — drop it, and with it any user row that has no session, so the
// account section offers one clean re-sign-in (player progress is untouched;
// it lives in the player store, not here).
{
  const s = useAuth.getState() as unknown as Record<string, unknown>
  if ('credential' in s || (s.user && !s.session)) {
    useAuth.setState({ user: null, session: null, sessionExp: null })
    try {
      const raw = localStorage.getItem('momomath-year2-auth')
      if (raw && raw.includes('credential')) localStorage.removeItem('momomath-year2-auth')
    } catch {
      /* private mode etc. — in-memory state above is already clean */
    }
  }
}

/** OAuth Client ID for the "Sign in with Google" button.
 *  Set VITE_GOOGLE_CLIENT_ID in .env.local (see .env.example). Without it the
 *  app stays in fully-playable guest mode and hides Google sign-in. */
export const GOOGLE_CLIENT_ID: string | undefined =
  import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (r: { credential: string }) => void }) => void
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void
          prompt: () => void
          disableAutoSelect: () => void
        }
      }
    }
  }
}

let gsiPromise: Promise<void> | null = null

function loadGsi(): Promise<void> {
  if (gsiPromise) return gsiPromise
  gsiPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve()
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(s)
  })
  return gsiPromise
}

/** Session exchange — same backend that serves the cloud save. */
export const SESSION_API = 'https://momolearn-ai.vercel.app/api/year2/session'

export interface SessionResult {
  user: AuthUser
  session: string
  expiresAt: number
}

/** Trade a one-time Google ID token for a long-lived first-party session.
 *  The Google token is used once here and never stored. Throws on failure
 *  (bad token, sign-in unavailable) so callers can show a retry state. */
export async function exchangeSession(idToken: string): Promise<SessionResult> {
  const res = await fetch(SESSION_API, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  })
  if (!res.ok) throw new Error(`session-http-${res.status}`)
  const data = (await res.json()) as {
    ok?: boolean
    session?: string
    expiresAt?: number
    user?: AuthUser
  }
  if (!data?.ok || !data.session || !data.user?.sub) throw new Error('session-rejected')
  return { user: data.user, session: data.session, expiresAt: Number(data.expiresAt) || 0 }
}

/** The stored session, or null when signed out / expired. Central check so a
 *  stale session surfaces "sign in again" instead of failing syncs silently. */
export function getSession(): string | null {
  const { session, sessionExp } = useAuth.getState()
  if (!session) return null
  if (typeof sessionExp === 'number' && sessionExp <= Date.now()) return null
  return session
}

/** Renders the official Google button into `el`; resolves after it is drawn.
 *  The callback receives the one-time Google ID token — exchange it with
 *  `exchangeSession()` (never store it) and `signIn()` the result. */
export async function renderGoogleButton(
  el: HTMLElement,
  onSignedIn: (idToken: string) => void,
): Promise<void> {
  await loadGsi()
  const g = window.google
  if (!g || !GOOGLE_CLIENT_ID) throw new Error('Google sign-in unavailable')
  g.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (resp) => {
      onSignedIn(resp.credential)
    },
  })
  el.innerHTML = ''
  g.accounts.id.renderButton(el, {
    type: 'standard',
    theme: 'filled_blue',
    size: 'large',
    shape: 'pill',
    text: 'signin_with',
    logo_alignment: 'left',
    width: 260,
  })
}

/** Exchange a GIS credential and sign in (one clean re-tap covers ~90 days).
 *  Player profile niceties (first-name default, onboarding) included.
 *  Returns false when the exchange failed so callers can show a retry. */
export async function signInWithGoogle(idToken: string): Promise<boolean> {
  try {
    const { user, session, expiresAt } = await exchangeSession(idToken)
    useAuth.getState().signIn(user, session, expiresAt)
    const p = usePlayer.getState()
    if (p.name === 'Champion' && user.name) p.setName(user.name.split(' ')[0])
    p.setOnboarded()
    return true
  } catch {
    return false
  }
}

export function signOutGoogle() {
  try {
    window.google?.accounts.id.disableAutoSelect()
  } catch {
    /* best effort */
  }
}
