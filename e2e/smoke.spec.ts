import { test, expect } from '@playwright/test'

/**
 * Public smoke — no admin secrets required.
 * Skip gracefully if the server never becomes ready (local without deps).
 */
test.describe('public smoke', () => {
  test('homepage loads', async ({ page }) => {
    const res = await page.goto('/')
    expect(res?.ok() || res?.status() === 304).toBeTruthy()
    await expect(page.locator('body')).toBeVisible()
  })

  test('legal notice and privacy policy routes render', async ({ page }) => {
    for (const path of ['/legal-notice', '/privacy-policy']) {
      const res = await page.goto(path)
      expect(res?.status()).toBeLessThan(500)
      await expect(page.locator('h1')).toBeVisible()
    }
  })

  test('legal notice cites DDG, not TMG', async ({ page }) => {
    const res = await page.goto('/legal-notice')
    expect(res?.status()).toBeLessThan(500)
    const body = await page.locator('body').innerText()
    expect(body).toMatch(/§ 5 DDG/)
    expect(body).not.toMatch(/§ 5 TMG/)
  })

  test('privacy policy cites Art. 6 and TDDDG, not TTDSG', async ({ page }) => {
    const res = await page.goto('/privacy-policy')
    expect(res?.status()).toBeLessThan(500)
    const body = await page.locator('body').innerText()
    expect(body).toMatch(/Art\. 6/)
    expect(body).toMatch(/TDDDG/)
    expect(body).not.toMatch(/TTDSG/)
  })

  test('rejecting analytics leaves no server opt-in cookie', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('zd-cookie-consent'))
    await page.goto('/')
    const banner = page.locator('[data-cookie-banner]')
    await expect(banner).toBeVisible({ timeout: 7000 })
    await page.getByRole('button', { name: /reject|ablehnen|alle ablehnen/i }).first().click()
    await expect(banner).toBeHidden({ timeout: 5000 })
    await expect.poll(async () =>
      (await page.context().cookies()).some(cookie => cookie.name === 'nk_analytics_consent'),
    ).toBe(false)
  })

  test('does not request remote Google Fonts on the public homepage', async ({ page }) => {
    const remoteFonts: string[] = []
    page.on('request', request => {
      const host = new URL(request.url()).hostname
      if (host === 'fonts.googleapis.com' || host === 'fonts.gstatic.com') remoteFonts.push(request.url())
    })
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => undefined)
    expect(remoteFonts).toEqual([])
  })
})
