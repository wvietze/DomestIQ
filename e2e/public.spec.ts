import { test, expect } from '@playwright/test'

test.describe('public surface', () => {
  test('landing loads and shows no fabricated traction stats', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // These invented pre-launch numbers were removed; they must never come back.
    const body = await page.locator('body').innerText()
    for (const fake of ['500+ Workers', '1,200+', '1200+', '2,000+', '120+', '4.8 Average']) {
      expect(body, `fabricated stat "${fake}" should not be on the landing`).not.toContain(fake)
    }
  })

  test('retired /partners path redirects to home', async ({ page }) => {
    await page.goto('/partners')
    await expect(page).not.toHaveURL(/\/partners/)
  })

  test('login page renders the Worker ID auth tab', async ({ page }) => {
    await page.goto('/login')
    // "Worker ID" is a hardcoded (non-translated) tab label.
    await expect(page.getByRole('button', { name: /Worker ID/i })).toBeVisible()
    await expect(page.getByPlaceholder(/DQ Code/i)).toBeVisible()
  })

  test('legal pages load', async ({ page }) => {
    const privacy = await page.goto('/privacy')
    expect(privacy?.ok()).toBeTruthy()
    await expect(page.locator('body')).toContainText(/POPIA|Privacy/i)

    const terms = await page.goto('/terms')
    expect(terms?.ok()).toBeTruthy()
    await expect(page.locator('body')).toContainText(/Terms/i)
  })
})
