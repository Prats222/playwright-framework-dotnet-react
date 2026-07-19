import type { Page } from '@playwright/test'

export class HelperBase {
  constructor(protected readonly page: Page) {}

  async waitForNumberOfSeconds(timeInSeconds: number) {
    await this.page.waitForTimeout(timeInSeconds * 1000)
  }
}

