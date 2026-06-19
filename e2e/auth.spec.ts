import { test, expect } from '@playwright/test'
import { readTestClient } from './helpers/state'

const client = readTestClient()

test.describe('authenticated client', () => {
  // Regression guard for the C1 bug: an async onAuthStateChange handler that
  // awaited a Supabase call deadlocked GoTrue's lock, so getUser() never
  // resolved and EVERY authenticated page hung on skeleton loaders forever.
  // This test fails if that (or anything that leaves the dashboard stuck on its
  // loading state) ever comes back.
  test('login leads to a dashboard that renders content, not endless skeletons', async ({
    page,
  }) => {
    await page.goto('/login')

    // Switch to the Email tab (its accessible name contains the "mail" icon
    // ligature, so this is language-independent), then sign in.
    await page.getByRole('button', { name: /mail/i }).click()
    await page.locator('input[type="email"]').fill(client.email)
    await page.locator('input[type="password"]').fill(client.password)
    await page.getByRole('button', { name: /^Sign In$/i }).click()

    await page.waitForURL(/\/dashboard/, { timeout: 25_000 })

    // The greeting heading only renders once the auth + data load resolves.
    await expect(
      page.getByRole('heading', { name: /Good (morning|afternoon|evening)/i })
    ).toBeVisible({ timeout: 25_000 })

    // And the page must not be stuck on skeleton placeholders.
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 25_000 })
  })
})
