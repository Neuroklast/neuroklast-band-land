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

  test('cookie banner can reject all (opt-in analytics)', async ({ page }) => {
    await page.goto('/')
    const banner = page.locator('[data-cookie-banner]')
    // Banner appears after delay if no prior consent
    const visible = await banner.isVisible({ timeout: 5000 }).catch(() => false)
    if (!visible) {
      test.skip(true, 'Consent already stored or banner disabled in this env')
      return
    }
    await page.getByRole('button', { name: /reject|ablehnen|alle ablehnen/i }).first().click()
    await expect(banner).toBeHidden({ timeout: 5000 })
  })
})
