import type { Locator, Page } from '@playwright/test'
import { HelperBase } from './helperBase'

export class NavigationPage extends HelperBase {
  private readonly menuItems: Record<string, Locator>

  constructor(page: Page) {
    super(page)
    this.menuItems = {
      'Form Layouts': page.getByTitle('Form Layouts'),
      Datepicker: page.getByTitle('Datepicker'),
      'Smart Table': page.getByTitle('Smart Table'),
      Toastr: page.getByTitle('Toastr'),
      Tooltip: page.getByTitle('Tooltip'),
    }
  }

  private async select(group: string, item: string) {
    const groupButton = this.page.getByTitle(group)
    if (await groupButton.getAttribute('aria-expanded') === 'false') await groupButton.click()
    await this.menuItems[item].click()
  }

  formLayoutsPage() { return this.select('Forms', 'Form Layouts') }
  datepickerPage() { return this.select('Forms', 'Datepicker') }
  smartTablePage() { return this.select('Tables & Data', 'Smart Table') }
  toastrPage() { return this.select('Modal & Overlays', 'Toastr') }
  tooltipPage() { return this.select('Modal & Overlays', 'Tooltip') }
}

