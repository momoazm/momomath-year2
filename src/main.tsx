import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'

// Offline shell: register the service worker only for production builds served
// over http(s). The worker lives under Vite's base path (/momomath-year2/ on
// gh-pages) so its scope covers the whole app. Dev servers skip it entirely to
// keep hot-reload honest.
if (import.meta.env.PROD && location.protocol.startsWith('http')) {
  const base = import.meta.env.BASE_URL || '/'
  navigator.serviceWorker
    .register(`${base}sw.js`)
    .catch(() => {
      /* private-mode or unsupported browser — app still works online */
    })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
