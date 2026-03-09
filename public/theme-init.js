/**
 * Theme initialization — applied synchronously before React mounts to prevent
 * a flash of unstyled content (white background) while the loading screen renders.
 *
 * Reads theme settings from localStorage and writes the critical CSS
 * custom properties to the <html> root element immediately.
 *
 * Key priority:
 *   1. nk-theme-cache  — dedicated theme cache written by ThemeProvider
 *   2. kv:site-config  — full site config written by useKV hook
 */
(function () {
  try {
    var t = null
    // 1. Dedicated theme cache (fastest path)
    var cached = localStorage.getItem('nk-theme-cache')
    if (cached) {
      t = JSON.parse(cached)
    }
    // 2. Fall back to full site-config from KV storage
    if (!t) {
      var raw = localStorage.getItem('kv:site-config')
      if (!raw) return
      var cfg = JSON.parse(raw)
      t = cfg && cfg.themeSettings
    }
    if (!t) return
    var r = document.documentElement
    if (t.background) r.style.setProperty('--background', t.background)
    if (t.foreground) r.style.setProperty('--foreground', t.foreground)
    if (t.primary) r.style.setProperty('--primary', t.primary)
    if (t.accent) r.style.setProperty('--accent', t.accent)
    if (t.card) r.style.setProperty('--card', t.card)
    if (t.mutedForeground) r.style.setProperty('--muted-foreground', t.mutedForeground)
    if (t.border) r.style.setProperty('--border', t.border)
    if (t.secondary) r.style.setProperty('--secondary', t.secondary)
    if (t.fontBody) r.style.setProperty('--font-sans', t.fontBody)
    if (t.fontMono) r.style.setProperty('--font-mono', t.fontMono)
    if (t.fontHeading) r.style.setProperty('--font-heading', t.fontHeading)
    if (typeof t.borderRadius === 'number') {
      r.style.setProperty('--radius', t.borderRadius + 'rem')
      r.style.setProperty('--radius-factor', String(t.borderRadius / 0.125))
    }
    if (t.activePreset) r.dataset.theme = t.activePreset
  } catch (e) {}
})()
