import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  sub: string
  name: string
  email: string
  picture?: string
}

interface AuthState {
  user: AuthUser | null
  signIn: (u: AuthUser) => void
  signOut: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
    }),
    { name: 'momomath-year2-auth' },
  ),
)

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

function decodeJwtPayload(jwt: string): Record<string, unknown> {
  const b64 = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  const json = decodeURIComponent(
    atob(b64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  )
  return JSON.parse(json)
}

/** Renders the official Google button into `el`; resolves after it is drawn. */
export async function renderGoogleButton(
  el: HTMLElement,
  onSignedIn: (user: AuthUser) => void,
): Promise<void> {
  await loadGsi()
  const g = window.google
  if (!g || !GOOGLE_CLIENT_ID) throw new Error('Google sign-in unavailable')
  g.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (resp) => {
      const p = decodeJwtPayload(resp.credential)
      onSignedIn({
        sub: String(p.sub),
        name: String(p.name ?? p.email ?? 'Player'),
        email: String(p.email ?? ''),
        picture: typeof p.picture === 'string' ? p.picture : undefined,
      })
    },
  })
  el.innerHTML = ''
  g.accounts.id.renderButton(el, {
    type: 'standard',
    theme: 'outline',
    size: 'medium',
    shape: 'pill',
    text: 'signin_with',
    logo_alignment: 'left',
    width: 168,
  })
}

export function signOutGoogle() {
  try {
    window.google?.accounts.id.disableAutoSelect()
  } catch {
    /* best effort */
  }
}
