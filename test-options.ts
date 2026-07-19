import { test as base } from '@playwright/test'
import { PageManager } from './page-objects/pageManager'

type TestOptions = { pageManager: PageManager }

export const test = base.extend<TestOptions>({
  pageManager: async ({ page, baseURL }, use) => {
    await page.goto(baseURL ?? '/')
    const pageManager = new PageManager(page)
    await pageManager.navigateTo().formLayoutsPage()
    await use(pageManager)
  },
})

