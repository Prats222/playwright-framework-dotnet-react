import type { Page } from '@playwright/test'
import { FormLayoutsPage } from './formLayoutsPage'
import { NavigationPage } from './navigationPage'

export class PageManager {
  private readonly navigationPage: NavigationPage
  private readonly formLayoutsPage: FormLayoutsPage

  constructor(page: Page) {
    this.navigationPage = new NavigationPage(page)
    this.formLayoutsPage = new FormLayoutsPage(page)
  }

  navigateTo() { return this.navigationPage }
  onFormLayoutPage() { return this.formLayoutsPage }
}

