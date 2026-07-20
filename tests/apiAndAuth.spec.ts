import { expect, test } from '@playwright/test'

test.describe('ASP.NET Core API testing', () => {
  test('products support list, search, create, update, and delete', async ({ request }) => {
    const list = await request.get('/api/products')
    expect(list.status()).toBe(200)
    expect(await list.json()).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'Smart Bulb', category: 'Home Automation' }),
    ]))

    const search = await request.get('/api/products?search=smart')
    expect(search.status()).toBe(200)
    expect(await search.json()).toHaveLength(1)

    const created = await request.post('/api/products', {
      data: { name: 'Pune Test Sensor', category: 'Sensors', price: 2199, inStock: true },
    })
    expect(created.status()).toBe(201)
    expect(created.headers().location).toMatch(/^\/api\/products\/\d+$/)
    const product = await created.json()

    const updated = await request.put(`/api/products/${product.id}`, {
      data: { name: 'Pune Test Sensor Pro', category: 'Sensors', price: 2499, inStock: false },
    })
    expect(updated.status()).toBe(200)
    await expect(updated.json()).resolves.toMatchObject({ name: 'Pune Test Sensor Pro', inStock: false })

    const patched = await request.patch(`/api/products/${product.id}`, { data: { inStock: true } })
    expect(patched.status()).toBe(200)
    await expect(patched.json()).resolves.toMatchObject({ name: 'Pune Test Sensor Pro', price: 2499, inStock: true })

    expect((await request.delete(`/api/products/${product.id}`)).status()).toBe(204)
    expect((await request.get(`/api/products/${product.id}`)).status()).toBe(404)
  })

  test('product validation returns a structured 400 response', async ({ request }) => {
    const response = await request.post('/api/products', {
      data: { name: '', category: 'Sensors', price: -1, inStock: true },
    })
    expect(response.status()).toBe(400)
    await expect(response.json()).resolves.toMatchObject({ errors: { product: expect.any(Array) } })
  })

  test('protected session endpoint rejects anonymous calls', async ({ request }) => {
    expect((await request.get('/api/auth/me')).status()).toBe(401)
  })
})

test.describe('Login and session behavior', () => {
  test('demo user can log in, revisit the protected account, and log out', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByRole('button', { name: 'LOGIN', exact: true }).click()

    await expect(page).toHaveURL(/\/auth\/account$/)
    await expect(page.getByRole('heading', { name: 'Welcome, Prateek Mishra' })).toBeVisible()
    await expect(page.getByText('prateek@automation.pm')).toBeVisible()

    await page.reload()
    await expect(page.getByRole('heading', { name: 'Welcome, Prateek Mishra' })).toBeVisible()

    await page.getByRole('button', { name: 'LOG OUT' }).click()
    await expect(page).toHaveURL(/\/auth\/login$/)
    const session = await page.request.get('/api/auth/me')
    expect(session.status()).toBe(401)
  })

  test('invalid credentials display an API error', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByLabel('Password', { exact: true }).fill('incorrect-password')
    await page.getByRole('button', { name: 'LOGIN', exact: true }).click()
    await expect(page.getByRole('alert')).toContainText('Invalid email or password')
  })

  test('a new Indian demo account can register and receives a session', async ({ page }) => {
    const email = `kavya.desai.${Date.now()}@example.com`
    await page.goto('/auth/register')
    await page.getByLabel('Full name').fill('Kavya Desai')
    await page.getByLabel('Email address').fill(email)
    await page.getByLabel('Password', { exact: true }).fill('SecurePass@2026')
    await page.getByLabel('Confirm password').fill('SecurePass@2026')
    await page.getByRole('button', { name: 'REGISTER', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Welcome, Kavya Desai' })).toBeVisible()
    await expect(page.getByText(email)).toBeVisible()
  })
})

test('API playground sends a live request and renders the response', async ({ page }) => {
  await page.goto('/pages/api-testing')
  await expect(page.locator('.request-library .method-badge')).toHaveText(['GET', 'GET', 'GET', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
  await page.getByRole('button', { name: /List products/ }).click()
  await page.getByRole('button', { name: 'SEND REQUEST' }).click()
  await expect(page.getByText('Status').locator('strong')).toHaveText('200')
  await expect(page.getByLabel('API response')).toContainText('Smart Bulb')

  await page.getByRole('button', { name: /Create product/ }).click()
  await expect(page.getByLabel('JSON request body')).toHaveValue(/Jaipur Smart Plug/)
  await page.getByRole('button', { name: 'SEND REQUEST' }).click()
  await expect(page.getByText('Status').locator('strong')).toHaveText('201')
  await expect(page.getByLabel('API response')).toContainText('Jaipur Smart Plug')
})
