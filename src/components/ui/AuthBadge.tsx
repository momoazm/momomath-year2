import { useEffect, useRef, useState } from 'react'
import { GOOGLE_CLIENT_ID, renderGoogleButton, signInWithGoogle, signOutGoogle, useAuth } from '../../engine/auth'

export function GoogleSignInInline() {
  const btnRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !btnRef.current || failed) return
    let cancelled = false
    renderGoogleButton(btnRef.current, (idToken: string) => {
      if (cancelled) return
      void signInWithGoogle(idToken).then((ok) => {
        if (!ok && !cancelled) setFailed(true)
      })
    }).catch(() => {
      if (!cancelled) setFailed(true)
    })
    return () => {
      cancelled = true
    }
  }, [failed])

  if (!GOOGLE_CLIENT_ID) {
    return (
      <p className="text-center font-body text-sm font-bold text-slate-400">
        Playing as a guest — progress is saved on this device.
      </p>
    )
  }
  if (failed) {
    return (
      <p className="text-center font-body text-sm font-bold text-slate-400">
        Couldn&rsquo;t reach Google sign-in. Check your connection and refresh.
      </p>
    )
  }
  return <div className="flex justify-center" ref={btnRef} />
}

export function AuthBadge() {
  const user = useAuth((s) => s.user)
  const signOut = useAuth((s) => s.signOut)
  const btnRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !btnRef.current || failed) return
    let cancelled = false
    renderGoogleButton(btnRef.current, (idToken: string) => {
      if (cancelled) return
      void signInWithGoogle(idToken).then((ok) => {
        if (!ok && !cancelled) setFailed(true)
      })
    }).catch(() => {
      if (!cancelled) setFailed(true)
    })
    return () => {
      cancelled = true
    }
  }, [failed])

  if (!GOOGLE_CLIENT_ID) return null

  if (user) {
    return (
      <button
        onClick={() => {
          signOutGoogle()
          signOut()
        }}
        className="flex shrink-0 items-center gap-1.5 rounded-full border-2 border-slate-200 bg-white py-0.5 pl-0.5 pr-2 transition-colors hover:bg-slate-50"
        title={`Signed in as ${user.email} — tap to sign out`}
      >
        {user.picture ? (
          <img src={user.picture} alt="" className="h-6 w-6 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-speed-blue font-display text-xs font-extrabold text-white">
            {user.name[0]?.toUpperCase()}
          </span>
        )}
        <span className="max-w-[72px] truncate font-display text-xs font-extrabold text-slate-500">
          {user.name.split(' ')[0]}
        </span>
        <span className="text-[10px] text-slate-300">✕</span>
      </button>
    )
  }

  return (
    <div className="shrink-0 origin-right scale-[0.8]">
      {failed ? (
        <span className="font-display text-xs font-bold text-slate-300">offline</span>
      ) : (
        <div ref={btnRef} />
      )}
    </div>
  )
}
