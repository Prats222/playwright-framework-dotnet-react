import type { Page } from '@playwright/test'

export class FormLayoutsPage {
  constructor(private readonly page: Page) {}

  async submitUsingTheGridFormWithCredentialsAndSelectOption(email: string, password: string, optionText: string) {
    const form = this.page.locator('nb-card', { hasText: 'Using the Grid' })
    await form.getByRole('textbox', { name: 'Email' }).fill(email)
    await form.getByLabel('Password').fill(password)
    await form.getByRole('radio', { name: optionText }).check()
    await form.getByRole('button', { name: 'SIGN IN' }).click()
  }
}

