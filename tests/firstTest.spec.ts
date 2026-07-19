import { expect, test } from '@playwright/test'

test.describe('Form page navigation and locator practice', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByTitle('Forms').click()
    await page.getByTitle('Form Layouts').click()
  })

  test('navigates between form pages', { tag: '@first' }, async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Form Layouts' })).toBeVisible()
    await page.getByTitle('Datepicker').click()
    await expect(page.getByRole('heading', { name: 'Datepicker', exact: true })).toBeVisible()
  })

  test('supports CSS and user-facing locators', { tag: '@syntax' }, async ({ page }) => {
    await page.locator('#inputEmail1').fill('locator@example.com')
    await page.getByRole('textbox', { name: 'Email' }).first().click()
    await page.getByLabel('Email').first().click()
    await page.getByPlaceholder('Jane Doe').fill('Jane Doe')
    await expect(page.getByTestId('SignIn')).toBeVisible()
  })

  test('locates child and parent elements', async ({ page }) => {
    const gridCard = page.locator('nb-card', { hasText: 'Using the Grid' })
    await gridCard.getByRole('radio', { name: 'Option 1' }).check()
    await expect(gridCard.getByRole('radio', { name: 'Option 1' })).toBeChecked()

    const basicCard = page.locator('nb-card').filter({ hasText: 'Basic Form' })
    await basicCard.getByRole('textbox', { name: 'Email' }).fill('basic@example.com')
    await expect(basicCard).toContainText('Required fields')
  })

  test('reuses locators and extracts values', async ({ page }) => {
    const basicForm = page.locator('nb-card').filter({ hasText: 'Basic Form' })
    const email = basicForm.getByRole('textbox', { name: 'Email' })
    await email.fill('test@test.com')
    await basicForm.getByRole('textbox', { name: 'Password' }).fill('Password')
    await expect(email).toHaveValue('test@test.com')
    await expect(basicForm.locator('button')).toHaveText('Submit')
    await expect(page.locator('nb-radio')).toHaveText([' Option 1', ' Option 2'])
  })

  test('clicks the success action', async ({ page }) => {
    await page.locator('.bg-success').click()
  })
})
