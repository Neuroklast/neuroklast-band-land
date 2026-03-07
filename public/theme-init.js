/**
 * Theme initialization — applied synchronously before React mounts to prevent
 * a flash of unstyled content (white background) while the loading screen renders.
 *
 * Reads the stored site-config from localStorage and writes the critical CSS
 * custom properties to the <html> root element immediately.
 */
(function () {
  try {
    var raw = localStorage.getItem('site-config')
    if (!raw) return
    var cfg = JSON.parse(raw)
    var t = cfg && cfg.themeSettings
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
