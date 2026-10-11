import { readFile } from 'node:fs/promises'
import { expect, test, type Page } from '@playwright/test'

/** Fills every intake step, starting from step 1. */
async function fillIntake(page: Page, concern: string) {
  await page.getByText('Test results').click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByLabel('What is your main concern?').fill(concern)
  await page.getByRole('button', { name: 'Add a symptom' }).click()
  await page.getByLabel('Symptom 1', { exact: true }).fill('Tiredness')
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Add a medicine' }).click()
  await page.getByLabel('Medicine 1', { exact: true }).fill('Ferrous sulfate')
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByLabel(/Questions you already want/).fill('How long until my iron levels recover?')
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
}

test('prepare a brief, use visit mode and keep the answers', async ({ page }) => {
  await page.goto('/prepare')
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByText('at least 10 characters').first()).toBeVisible()

  // The unfinished draft survives a reload (kept in this tab only).
  await page.reload()
  await expect(page.getByRole('heading', { name: 'What’s going on' })).toBeVisible()
  await page.getByRole('button', { name: 'Back' }).click()

  await fillIntake(page, 'Fictional: my blood test showed low iron and I feel tired.')
  await expect(page.getByRole('radio', { name: /Write it with AI/ })).toBeDisabled()
  await page.getByRole('button', { name: 'Create my brief' }).click()

  await expect(page.getByRole('heading', { name: 'Your visit brief' })).toBeVisible()
  await expect(page.getByText('I’m coming in to discuss test results.')).toBeVisible()
  await expect(page.getByText('How long until my iron levels recover?')).toBeVisible()

  await page.getByLabel('Add a question').fill('Should I change my diet?')
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await expect(page.getByText('Should I change my diet?')).toBeVisible()

  await page.getByRole('button', { name: 'Start visit mode' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByText('How long until my iron levels recover?', { exact: true }).click()
  await dialog.getByLabel('Answer to: How long until my iron levels recover?').fill('About three months.')
  await expect(dialog.getByText(/1 of \d+ questions asked/)).toBeVisible()
  await dialog.getByRole('button', { name: 'Done' }).click()
  await expect(page.getByText('About three months.')).toBeVisible()

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download with my notes' }).click(),
  ])
  const text = await readFile((await download.path())!, 'utf8')
  expect(text).toContain('[x] 1. How long until my iron levels recover?')
  expect(text).toContain('Answer: About three months.')

  await page.reload()
  await expect(page.getByText('About three months.')).toBeVisible()

  await page.getByRole('button', { name: 'Start over' }).click()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'About your visit' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'About your visit' })).toBeVisible()
})

test('words that can mean an emergency show urgent-care advice', async ({ page }) => {
  await page.goto('/prepare')
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByLabel('What is your main concern?').fill('Fictional: I get chest pain when I walk uphill.')
  await expect(page.getByRole('main').getByRole('alert')).toContainText('call your local emergency number')
})

test('pages ship a strict content security policy', async ({ request }) => {
  const response = await request.get('/prepare')
  expect(response.headers()['content-security-policy']).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/)
})
