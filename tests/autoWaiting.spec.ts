import { expect, test } from '@playwright/test'

test('auto waits for delayed elements', async ({ page }) => {
  await page.goto('/')
  await page.getByTitle('Modal & Overlays').click()
  await page.getByTitle('Toastr').click()
  await page.getByRole('button', { name: 'SHOW TOAST' }).click()
  await expect(page.locator('.toast')).toContainText("I'm cool toaster!")
})
