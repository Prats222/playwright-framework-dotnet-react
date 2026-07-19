import { expect, test } from '@playwright/test'

test('form layout remains usable on mobile', { tag: '@inputF' }, async ({ page }) => {
  await page.goto('/')
  await page.getByTitle('Forms').click()
  await page.getByTitle('Form Layouts').click()
  const email = page.locator('nb-card', { hasText: 'Using the Grid' }).getByRole('textbox', { name: 'Email' })
  await email.fill('mobile@test.com')
  await expect(email).toHaveValue('mobile@test.com')
  await expect(page.locator('nb-card', { hasText: 'Using the Grid' })).toBeVisible()
})

test('mobile dashboard navigation collapses and content stays usable', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.sidebar')).not.toHaveClass(/collapsed/)
  await page.getByRole('button', { name: 'Toggle navigation' }).click()
  await expect(page.locator('.sidebar')).toHaveClass(/collapsed/)
  await expect(page.locator('.status-card')).toHaveCount(4)
  await page.locator('.status-card').first().click()
  await expect(page.locator('.status-card').first()).toContainText('OFF')
})

test('mobile profile and footer use Prateek Mishra branding', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('img', { name: 'Prateek Mishra' })).toBeVisible()
  await expect(page.locator('.app-footer')).toContainText('Prateek Mishra 2026')
})
