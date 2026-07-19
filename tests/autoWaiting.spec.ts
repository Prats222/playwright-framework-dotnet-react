import { expect, test } from '@playwright/test'

test('auto waits for delayed elements', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Load delayed result' }).click()
  await expect(page.locator('.result-message')).toHaveText('Data loaded successfully')
})

