import { expect, test } from '@playwright/test'
import { PageManager } from '../page-objects/pageManager'

test('navigates through pages with page objects', async ({ page }) => {
  await page.goto('/')
  const manager = new PageManager(page)
  await manager.navigateTo().formLayoutsPage()
  await manager.navigateTo().datepickerPage()
  await manager.navigateTo().smartTablePage()
  await manager.navigateTo().toastrPage()
  await manager.navigateTo().tooltipPage()
  await expect(page.locator('nb-card', { hasText: 'Tooltip Placements' })).toBeVisible()
})

test('submits a parameterized form with page objects', async ({ page }) => {
  await page.goto('/')
  const manager = new PageManager(page)
  await manager.navigateTo().formLayoutsPage()
  await manager.onFormLayoutPage().submitUsingTheGridFormWithCredentialsAndSelectOption('test@test.com', 'passu', 'Option 2')
  await expect(page.getByRole('radio', { name: 'Option 2' })).toBeChecked()
})
