import { expect, test } from '@playwright/test'

test('form layout remains usable on mobile', { tag: '@inputF' }, async ({ page }) => {
  await page.goto('/')
  await page.getByTitle('Forms').click()
  await page.getByTitle('Form Layouts').click()
  const email = page.locator('nb-card', { hasText: 'Using the Grid' }).getByRole('textbox', { name: 'Email' })
  await email.fill('mobile@test.com')
  await expect(email).toHaveValue('mobile@test.com')
  await expect(page.getByRole('heading', { name: 'Form Layouts' })).toBeVisible()
})

