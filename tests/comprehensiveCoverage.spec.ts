import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => { await page.goto('/') })

test('shows Prateek Mishra branding and a loaded profile photo', async ({ page }) => {
  const profile = page.getByRole('img', { name: 'Prateek Mishra' })
  await expect(profile).toHaveAttribute('src', '/assets/prateek-mishra.png')
  await expect.poll(() => profile.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  await expect(page.locator('.app-footer')).toContainText('Created by Prateek Mishra 2026')
})

test('supports every theme', async ({ page }) => {
  for (const theme of ['Dark', 'Cosmic', 'Corporate', 'Light']) {
    await page.getByRole('button', { name: 'Theme selector' }).click()
    await page.getByRole('listitem').filter({ hasText: theme }).click()
    await expect(page.locator('.app-shell')).toHaveAttribute('data-theme', theme.toLowerCase())
  }
})

test('sidebar navigation updates URLs and browser history', async ({ page }) => {
  await page.getByTitle('Forms').click()
  await page.getByTitle('Form Layouts').click()
  await expect(page).toHaveURL(/\/pages\/forms\/layouts$/)
  await page.getByTitle('Datepicker').click()
  await expect(page).toHaveURL(/\/pages\/forms\/datepicker$/)
  await page.goBack()
  await expect(page.locator('nb-card', { hasText: 'Using the Grid' })).toBeVisible()
})

const routes = [
  ['/pages/iot-dashboard', 'Room Management'],
  ['/pages/forms/layouts', 'Using the Grid'],
  ['/pages/forms/datepicker', 'Common Datepicker'],
  ['/pages/modal-overlays/dialog', 'Dialog with template'],
  ['/pages/modal-overlays/window', 'Window with template'],
  ['/pages/modal-overlays/popover', 'Popover with template'],
  ['/pages/modal-overlays/toastr', 'Toaster configuration'],
  ['/pages/modal-overlays/tooltip', 'Tooltip Placements'],
  ['/pages/extra-components/calendar', 'July 2026'],
  ['/pages/charts/echarts', 'Line Chart'],
  ['/pages/tables/smart-table', 'Smart Table'],
  ['/pages/tables/tree-grid', 'Tree Grid'],
  ['/auth/login', 'Login'],
  ['/auth/register', 'Register'],
  ['/auth/request-password', 'Request Password'],
  ['/auth/reset-password', 'Reset Password'],
] as const

for (const [path, marker] of routes) {
  test(`deep link renders ${path}`, async ({ page }) => {
    await page.goto(path)
    await expect(page.getByText(marker, { exact: true }).first()).toBeVisible()
  })
}

test('unknown routes safely fall back to the dashboard', async ({ page }) => {
  await page.goto('/not-a-real-page')
  await expect(page.getByText('Room Management', { exact: true })).toBeVisible()
})

test('all smart-home status cards toggle independently', async ({ page }) => {
  for (const name of ['Light', 'Roller Shades', 'Wireless Audio', 'Coffee Maker']) {
    const card = page.locator('.status-card').filter({ hasText: name })
    await card.click()
    await expect(card).toContainText('OFF')
    await card.click()
    await expect(card).toContainText('ON')
  }
})

test('temperature supports keyboard, power, tabs, and modes', async ({ page }) => {
  const card = page.locator('.temperature-card')
  const gauge = card.getByRole('slider', { name: 'Celsius' })
  await gauge.press('ArrowUp')
  await expect(gauge).toHaveAttribute('aria-valuenow', '25')
  await card.getByRole('button', { name: 'Turn Celsius off' }).click()
  await expect(gauge).not.toHaveAttribute('aria-valuenow', /.+/)
  await card.getByRole('button', { name: 'Turn Celsius on' }).click()
  await expect(gauge).toHaveAttribute('aria-valuenow', '25')
  await card.getByRole('button', { name: 'Humidity' }).click()
  await expect(card.getByRole('button', { name: 'Humidity' })).toHaveClass(/active/)
  const modes = card.getByRole('radio')
  await expect(modes).toHaveCount(4)
  await modes.nth(2).check()
  await expect(modes.nth(2)).toBeChecked()
})

test('dashboard selectors and room management respond', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Electricity period' }).selectOption('year')
  await expect(page.getByRole('combobox', { name: 'Electricity period' })).toHaveValue('year')
  await page.getByRole('combobox', { name: 'Traffic period' }).selectOption('week')
  await expect(page.getByRole('combobox', { name: 'Traffic period' })).toHaveValue('week')
  const bedroom = page.getByRole('button', { name: /Bedroom/ })
  await bedroom.click()
  await expect(bedroom).toHaveClass(/active/)
})

test('playlist supports seek, volume, previous, next, play and pause', async ({ page }) => {
  const player = page.locator('.player')
  const progress = player.getByRole('slider', { name: 'Track progress' })
  const volume = player.getByRole('slider', { name: 'Volume' })
  await progress.fill('75')
  await expect(progress).toHaveValue('75')
  await volume.fill('35')
  await expect(volume).toHaveValue('35')
  await player.getByRole('button', { name: 'Next track' }).click()
  await expect(player).toContainText('Mumbai Lights')
  await player.getByRole('button', { name: 'Previous track' }).click()
  await expect(player).toContainText('Monsoon Drive')
  await player.getByRole('button', { name: 'Play music' }).click()
  await expect(player.getByRole('button', { name: 'Pause music' })).toBeVisible()
  await player.getByRole('button', { name: 'Pause music' }).click()
  await expect(player.getByRole('button', { name: 'Play music' })).toBeVisible()
})

test('contacts, weather, solar, and personalized content render', async ({ page }) => {
  await expect(page.locator('.contact')).toHaveCount(6)
  await expect(page.getByRole('button', { name: /^Call / })).toHaveCount(6)
  await expect(page.getByText('Aarav Sharma')).toBeVisible()
  await expect(page.getByText('Mumbai', { exact: true })).toBeVisible()
  await expect(page.getByText('Solar Energy Consumption')).toBeVisible()
})

test('theme changes the UI Kitten artwork', async ({ page }) => {
  const artwork = page.getByRole('img', { name: 'UI Kitten' })
  await expect(artwork).toHaveAttribute('src', '/assets/kitten-light.png')
  await page.getByRole('button', { name: 'Theme selector' }).click()
  await page.getByRole('listitem').filter({ hasText: 'Cosmic' }).click()
  await expect(artwork).toHaveAttribute('src', '/assets/kitten-cosmic.png')
})

test('security camera selection and pause controls work', async ({ page }) => {
  const cameras = page.locator('.cameras-card')
  await cameras.getByRole('button', { name: 'Select camera 3' }).click()
  await expect(cameras.getByRole('img', { name: 'Camera 3', exact: true })).toBeVisible()
  await cameras.getByRole('button', { name: 'Pause cameras' }).click()
  await expect(cameras.getByRole('img', { name: 'Camera 3', exact: true })).toHaveClass(/paused/)
  await cameras.getByRole('button', { name: 'Play cameras' }).click()
  await expect(cameras.getByRole('img', { name: 'Camera 3', exact: true })).not.toHaveClass(/paused/)
})

test('all form layout cards accept values and expose expected states', async ({ page }) => {
  await page.goto('/pages/forms/layouts')
  await expect(page.locator('nb-card')).toHaveCount(6)
  await page.getByPlaceholder('Prateek Mishra').fill('Prateek Mishra')
  await page.getByRole('textbox', { name: 'Recipients' }).fill('Aarav Sharma')
  await page.getByRole('textbox', { name: 'Subject' }).fill('Automation update')
  await page.getByRole('textbox', { name: 'Message' }).fill('All checks passed')
  await page.getByRole('radio', { name: 'Option 2' }).check()
  await expect(page.getByRole('radio', { name: 'Disabled Option' })).toBeDisabled()
})

test('date controls accept a date', async ({ page }) => {
  await page.goto('/pages/forms/datepicker')
  const dateInputs = page.locator('input[type="date"]')
  await expect(dateInputs).toHaveCount(2)
  await dateInputs.first().fill('2026-07-19')
  await expect(dateInputs.first()).toHaveValue('2026-07-19')
})

test('standard and random toasts appear and dismiss', async ({ page }) => {
  await page.goto('/pages/modal-overlays/toastr')
  await page.getByRole('button', { name: 'SHOW TOAST' }).click()
  await expect(page.locator('.toast')).toContainText("I'm cool toaster!")
  await page.locator('.toast').click()
  await expect(page.locator('.toast')).toHaveCount(0)
  await page.getByRole('button', { name: 'RANDOM TOAST' }).click()
  await expect(page.locator('.toast')).toContainText('Random toast says hello!')
})

for (const overlay of ['Dialog', 'Window', 'Popover'] as const) {
  test(`${overlay.toLowerCase()} opens, accepts input, and closes`, async ({ page }) => {
    await page.goto(`/pages/modal-overlays/${overlay.toLowerCase()}`)
    await page.getByRole('button', { name: `OPEN ${overlay.toUpperCase()}`, exact: true }).click()
    const modal = page.locator(`.modal.${overlay.toLowerCase()}`)
    await expect(modal).toBeVisible()
    await modal.getByRole('textbox', { name: 'Name' }).fill('Prateek Mishra')
    await modal.getByRole('button', { name: 'SUBMIT' }).click()
    await expect(modal).toHaveCount(0)
  })
}

test('tooltip appears and disappears on hover', async ({ page }) => {
  await page.goto('/pages/modal-overlays/tooltip')
  const top = page.locator('nb-card', { hasText: 'Tooltip Placements' }).getByRole('button', { name: 'Top' })
  await top.hover()
  await expect(page.getByRole('tooltip')).toHaveText('This is a tooltip')
  await page.getByText('Tooltip Placements').hover()
  await expect(page.getByRole('tooltip')).toHaveCount(0)
})

test('calendar, charts, and tree grid render their data', async ({ page }) => {
  await page.goto('/pages/extra-components/calendar')
  await expect(page.locator('.calendar-days button')).toHaveCount(35)
  await expect(page.locator('.calendar-days .selected')).toHaveText('19')
  await page.goto('/pages/charts/echarts')
  await expect(page.locator('.demo-chart')).toHaveCount(2)
  await expect(page.locator('.demo-chart.bars i')).toHaveCount(7)
  await page.goto('/pages/tables/tree-grid')
  await expect(page.locator('.tree-grid > div')).toHaveCount(5)
  await expect(page.locator('.tree-grid').getByText('Dashboard', { exact: false })).toBeVisible()
})

test('smart table paginates and retains Indian test data', async ({ page }) => {
  await page.goto('/pages/tables/smart-table')
  await expect(page.locator('tbody tr')).toHaveCount(10)
  await expect(page.getByText('Prateek', { exact: true })).toBeVisible()
  await page.getByRole('navigation', { name: 'Pagination' }).getByRole('button', { name: '2', exact: true }).click()
  await expect(page.locator('tbody tr')).toHaveCount(3)
  await expect(page.getByText('Kavya', { exact: true })).toBeVisible()
})

for (const [path, heading, passwordCount] of [
  ['/auth/login', 'Login', 1],
  ['/auth/register', 'Register', 2],
  ['/auth/request-password', 'Request Password', 0],
  ['/auth/reset-password', 'Reset Password', 1],
] as const) {
  test(`${heading} form has the correct fields`, async ({ page }) => {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
    await page.getByRole('textbox', { name: 'Email address' }).fill('prateek@example.com')
    await expect(page.locator('input[type="password"]')).toHaveCount(passwordCount)
    await expect(page.getByRole('button', { name: heading.toUpperCase(), exact: true })).toBeVisible()
  })
}

test('ASP.NET Core health endpoint reports the application stack', async ({ request }) => {
  const endpoint = process.env.URL ? '/api/health' : 'http://127.0.0.1:5000/api/health'
  const response = await request.get(endpoint)
  expect(response.ok()).toBeTruthy()
  await expect(response.json()).resolves.toMatchObject({
    status: 'healthy',
    application: 'Playwright Practice App',
    framework: '.NET 10 + React',
  })
})
