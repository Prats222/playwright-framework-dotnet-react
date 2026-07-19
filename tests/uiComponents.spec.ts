import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => { await page.goto('/') })

test.describe('Form Layouts page', () => {
  test.beforeEach(async ({ page }) => {
    await page.getByTitle('Forms').click()
    await page.getByTitle('Form Layouts').click()
  })

  test('input fields', { tag: '@inputF' }, async ({ page }) => {
    const email = page.locator('nb-card', { hasText: 'Using the Grid' }).getByRole('textbox', { name: 'Email' })
    await email.fill('test@test.com')
    await email.clear()
    await email.pressSequentially('test2@test.com')
    await expect(email).toHaveValue('test2@test.com')
  })

  test('radio buttons', async ({ page }) => {
    const form = page.locator('nb-card', { hasText: 'Using the Grid' })
    await form.getByRole('radio', { name: 'Option 1' }).check()
    await expect(form.getByRole('radio', { name: 'Option 1' })).toBeChecked()
    await expect(form.getByRole('radio', { name: 'Option 2' })).not.toBeChecked()
  })
})

test('checkboxes', async ({ page }) => {
  await page.getByTitle('Modal & Overlays').click()
  await page.getByTitle('Toastr').click()
  const boxes = page.getByRole('checkbox')
  for (const box of await boxes.all()) {
    await box.check()
    await expect(box).toBeChecked()
  }
})

test('theme dropdown', async ({ page }) => {
  await page.locator('ngx-header nb-select').click()
  const options = page.getByRole('list').locator('nb-option')
  await expect(options).toHaveText(['Light', 'Dark', 'Cosmic', 'Corporate'])
  await options.filter({ hasText: 'Dark' }).click()
  await expect(page.locator('ngx-header nb-select')).toContainText('Dark')
})

test('tooltip', async ({ page }) => {
  await page.getByTitle('Modal & Overlays').click()
  await page.getByTitle('Tooltip').click()
  await page.locator('nb-card', { hasText: 'Tooltip Placements' }).getByRole('button', { name: 'Top' }).hover()
  await expect(page.locator('nb-tooltip')).toHaveText('This is a tooltip')
})

test('dialog box removes a table row', async ({ page }) => {
  await page.getByTitle('Tables & Data').click()
  await page.getByTitle('Smart Table').click()
  page.once('dialog', async dialog => {
    expect(dialog.message()).toBe('Are you sure you want to delete?')
    await dialog.accept()
  })
  const row = page.getByRole('row', { name: /prateek@example.com/ })
  await row.locator('.nb-trash').click()
  await expect(row).toHaveCount(0)
})

test('web table editing and filtering', { tag: '@table' }, async ({ page }) => {
  await page.getByTitle('Tables & Data').click()
  await page.getByTitle('Smart Table').click()

  const ananyaRow = page.getByRole('row', { name: /ananya@example.com/ })
  await ananyaRow.locator('.nb-edit').click()
  await ananyaRow.getByPlaceholder('Age').fill('35')
  await ananyaRow.locator('.nb-checkmark').click()
  await expect(ananyaRow.locator('td').last()).toHaveText('35')

  await page.locator('.ng2-smart-pagination-nav').getByRole('button', { name: '2', exact: true }).click()
  const idElevenRow = page.getByRole('row').filter({ has: page.locator('td').nth(1).getByText('11', { exact: true }) })
  await idElevenRow.locator('.nb-edit').click()
  await idElevenRow.getByPlaceholder('E-mail').fill('test@test.com')
  await idElevenRow.locator('.nb-checkmark').click()
  await expect(idElevenRow.locator('td').nth(5)).toHaveText('test@test.com')

  for (const age of ['20', '30', '40', '48']) {
    await page.locator('input-filter').getByPlaceholder('Age').fill(age)
    const rows = page.locator('tbody tr')
    await expect(rows).toHaveCount(1)
    await expect(rows.locator('td').last()).toHaveText(age)
  }
})

test('temperature slider', async ({ page }) => {
  const gauge = page.locator('[tabtitle="Temperature"] ngx-temperature-dragger')
  await gauge.scrollIntoViewIfNeeded()
  await expect(gauge).toHaveAttribute('aria-valuenow', '24')
  const box = await gauge.boundingBox()
  expect(box).not.toBeNull()
  await page.mouse.move(box!.x + box!.width * 0.86, box!.y + box!.height * 0.68)
  await page.mouse.down()
  await page.mouse.move(box!.x + box!.width * 0.5, box!.y + box!.height * 0.1, { steps: 8 })
  await page.mouse.up()
  await expect(gauge).not.toHaveAttribute('aria-valuenow', '24')
})

test('dashboard matches the original widget composition', async ({ page }) => {
  await expect(page.locator('.status-card')).toHaveCount(4)
  await expect(page.getByText('Room Management')).toBeVisible()
  await expect(page.getByText('Solar Energy Consumption')).toBeVisible()
  await expect(page.getByText('Traffic Consumption')).toBeVisible()
  await expect(page.getByText('Security Cameras')).toBeVisible()
})

test('dashboard controls and themes are functional', async ({ page }) => {
  const lightCard = page.locator('.status-card').filter({ hasText: 'Light' })
  await lightCard.click()
  await expect(lightCard).toContainText('OFF')

  await page.locator('ngx-header nb-select').click()
  await page.getByRole('listitem').filter({ hasText: 'Dark' }).click()
  await expect(page.locator('.app-shell')).toHaveAttribute('data-theme', 'dark')
})

test('music player plays and changes tracks', async ({ page }) => {
  const player = page.locator('.player')
  await player.scrollIntoViewIfNeeded()
  await expect(player).toContainText('Monsoon Drive')
  await player.getByRole('button', { name: 'Play music' }).click()
  await expect(player.getByRole('button', { name: 'Pause music' })).toBeVisible()
  await expect.poll(async () => Number(await player.getByRole('slider', { name: 'Track progress' }).inputValue())).toBeGreaterThan(0)
  await player.getByRole('button', { name: 'Next track' }).click()
  await expect(player).toContainText('Mumbai Lights')
  await player.getByRole('button', { name: 'Pause music' }).click()
})
