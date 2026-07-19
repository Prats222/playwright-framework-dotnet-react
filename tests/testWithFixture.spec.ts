import { expect } from '@playwright/test'
import { test } from '../test-options'

test('uses an automatic page manager fixture', async ({ pageManager, page }) => {
  await pageManager.onFormLayoutPage().submitUsingTheGridFormWithCredentialsAndSelectOption('fixture@test.com', 'passu', 'Option 2')
  await expect(page.getByRole('radio', { name: 'Option 2' })).toBeChecked()
})

