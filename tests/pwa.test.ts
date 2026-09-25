import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

describe('PWA manifest', () => {
  const raw = readFileSync(join(ROOT, 'public', 'manifest.webmanifest'), 'utf8')
  const manifest = JSON.parse(raw) as {
    name?: string
    short_name?: string
    start_url?: string
    scope?: string
    display?: string
    theme_color?: string
    icons?: { src: string; sizes: string; type: string }[]
  }

  it('declares name, standalone display and a relative start_url', () => {
    expect(manifest.name).toContain('Momo Year 2 Cambridge')
    expect(manifest.short_name).toBeTruthy()
    expect(manifest.display).toBe('standalone')
    expect(manifest.start_url).toBe('./')
    expect(manifest.scope).toBe('./')
    expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('ships 192px and 512px PNG icons that exist on disk', () => {
    const icons = manifest.icons ?? []
    const sizes = icons.map((i) => i.sizes)
    expect(sizes).toContain('192x192')
    expect(sizes).toContain('512x512')
    for (const icon of icons) {
      expect(icon.type).toBe('image/png')
      const file = join(ROOT, 'public', icon.src)
      expect(existsSync(file), `${icon.src} missing`).toBe(true)
      expect(statSync(file).size).toBeGreaterThan(1000)
    }
  })
})

describe('service worker', () => {
  const sw = readFileSync(join(ROOT, 'public', 'sw.js'), 'utf8')

  it('never caches API traffic (keys, cloudsave, leaderboard)', () => {
    expect(sw).toContain("url.pathname.includes('/api/')")
    // The api bypass must happen before any respondWith for those requests.
    expect(sw.indexOf("'/api/'")).toBeLessThan(sw.indexOf('event.respondWith'))
  })

  it('caches the offline shell and falls back on navigations', () => {
    expect(sw).toContain('momo-shell-')
    expect(sw).toContain('manifest.webmanifest')
    expect(sw).toContain("req.mode === 'navigate'")
    expect(sw).toContain("caches.match('./')")
  })

  it('has an install/activate lifecycle that prunes old versions', () => {
    expect(sw).toContain("'install'")
    expect(sw).toContain("'activate'")
    expect(sw).toContain('caches.delete')
    expect(sw).toContain('skipWaiting')
  })
})

describe('index.html wiring', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8')

  it('links manifest, theme-color and apple touch icon', () => {
    expect(html).toContain('<link rel="manifest" href="manifest.webmanifest" />')
    expect(html).toContain('name="theme-color"')
    expect(html).toContain('apple-touch-icon.png')
    expect(existsSync(join(ROOT, 'public', 'apple-touch-icon.png'))).toBe(true)
  })

  it('metadata covers all 7 subjects (not the old maths-only pitch)', () => {
    expect(html).toContain('Learning Adventure')
    expect(html).not.toContain('Maths Adventure')
    expect(html).toContain('science')
    expect(html).toContain('German')
    expect(html).toContain('Arabic')
  })

  it('still contains the deploy needle', () => {
    // scripts/deploy.mjs MUST_CONTAIN includes this exact string.
    expect(html).toContain('Momo Year 2 Cambridge')
  })
})

describe('service worker registration', () => {
  const main = readFileSync(join(ROOT, 'src', 'main.tsx'), 'utf8')

  it('registers sw.js only in production over http(s)', () => {
    expect(main).toContain('import.meta.env.PROD')
    expect(main).toContain("location.protocol.startsWith('http')")
    expect(main).toContain('sw.js')
  })
})
