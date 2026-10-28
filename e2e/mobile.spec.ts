import { test, expect } from '@playwright/test'

test.describe('mobile public experience', () => {
  for (const path of ['/', '/plugins', '/releases', '/legal/en/legal-notice']) {
    test(`no horizontal overflow on ${path}`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded' })
      expect(response?.status()).toBeLessThan(400)
      await expect(page.locator('body')).toBeVisible()

      // Give hydration a chance to settle. This tests actual browser layout,
      // not a string match against responsive Tailwind class names.
      await page.waitForTimeout(500)
      const overflow = await page.evaluate(() =>
        Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) -
        document.documentElement.clientWidth,
      )
      expect(overflow).toBeLessThanOrEqual(2)
    })
  }

  test('mobile homepage avoids full MP4 and blocking boot overlay', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('[data-draft-target="bg-video"]')).toHaveCount(0)
    await expect(page.locator('[data-draft-target="bg-mobile-static"]')).toBeVisible()
    await expect(page.locator('[data-public-boot]')).toBeHidden()
  })

  test('decorative background respects reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1400)
    await expect(page.locator('[data-draft-target="bg-animation"]')).toHaveCount(0)
  })
})
