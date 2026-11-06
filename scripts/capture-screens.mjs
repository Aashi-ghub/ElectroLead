/**
 * Captures the full set of screens for design review.
 *
 *   node scripts/capture-screens.mjs [baseUrl] [outDir]
 *
 * Writes desktop and 390px-wide mobile shots of every significant surface,
 * logging in as each role as needed. Intended for handing to a reviewer (human
 * or model) who needs to see the product rather than read about it.
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = (process.argv[2] || 'https://electro-lead.vercel.app').replace(/\/$/, '')
const OUT = process.argv[3] || './screens'
const PASSWORD = 'Demo@1234'

mkdirSync(OUT, { recursive: true })

const DESKTOP = { width: 1440, height: 950 }
const MOBILE = { width: 390, height: 844 }

const browser = await chromium.launch()
const captured = []

async function session(viewport, email, password = PASSWORD) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  if (email) {
    await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle', timeout: 90000 })
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    await Promise.all([
      page.waitForURL((u) => !u.pathname.includes('/auth/login'), { timeout: 90000 }),
      page.click('button[type="submit"]'),
    ])
    await page.waitForLoadState('networkidle').catch(() => {})
  }
  return { context, page }
}

async function shot(page, route, name, { fullPage = true } = {}) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 90000 })
  await page.waitForTimeout(3500)
  const file = `${OUT}/${name}.png`
  await page.screenshot({ path: file, fullPage })
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  )
  captured.push({ name, route, overflow })
  console.log(`${name.padEnd(30)} ${route.padEnd(38)} overflow:${overflow}px`)
}

// --- public, desktop + mobile ------------------------------------------
{
  const { context, page } = await session(DESKTOP, null)
  await shot(page, '/', 'landing-desktop')
  await shot(page, '/pricing', 'pricing-desktop')
  await shot(page, '/auth/login', 'login-desktop')
  await shot(page, '/auth/register', 'register-desktop')
  await shot(page, '/auth/register/buyer', 'register-buyer-desktop')
  await context.close()
}
{
  const { context, page } = await session(MOBILE, null)
  await shot(page, '/', 'landing-mobile')
  await shot(page, '/pricing', 'pricing-mobile')
  await shot(page, '/auth/login', 'login-mobile')
  await context.close()
}

// --- buyer --------------------------------------------------------------
{
  const { context, page } = await session(DESKTOP, 'demo.buyer@voltsupply.in')
  await shot(page, '/dashboard/buyer', 'buyer-dashboard')
  await shot(page, '/dashboard/buyer/enquiries', 'buyer-enquiries')
  await shot(page, '/dashboard/buyer/create-enquiry', 'buyer-create-enquiry')
  await shot(page, '/dashboard/buyer/messages', 'buyer-messages', { fullPage: false })
  await shot(page, '/dashboard/buyer/saved', 'buyer-saved')
  await shot(page, '/dashboard/settings', 'buyer-settings')

  const list = await page.goto(`${BASE}/dashboard/buyer/enquiries`, { waitUntil: 'networkidle' })
  void list
  await page.waitForTimeout(2500)
  const href = await page
    .locator('a[href*="/dashboard/buyer/enquiry/"]')
    .first()
    .getAttribute('href')
    .catch(() => null)
  if (href) await shot(page, href, 'buyer-enquiry-detail')
  await context.close()
}
{
  const { context, page } = await session(MOBILE, 'demo.buyer@voltsupply.in')
  await shot(page, '/dashboard/buyer', 'buyer-dashboard-mobile')
  await shot(page, '/dashboard/buyer/enquiries', 'buyer-enquiries-mobile')
  await context.close()
}

// --- sellers, one per plan tier ----------------------------------------
for (const [email, label] of [
  ['demo.seller.local@voltsupply.in', 'free'],
  ['demo.seller.national@voltsupply.in', 'national'],
]) {
  const { context, page } = await session(DESKTOP, email)
  await shot(page, '/dashboard/seller', `seller-${label}-dashboard`)
  await shot(page, '/dashboard/seller/enquiries', `seller-${label}-leads`)
  if (label === 'free') {
    await shot(page, '/dashboard/seller/quotes', 'seller-quotes')
    await shot(page, '/dashboard/seller/messages', 'seller-messages', { fullPage: false })
    const href = await page
      .locator('a[href*="/dashboard/seller/enquiry/"]')
      .first()
      .getAttribute('href')
      .catch(() => null)
    if (href) await shot(page, href, 'seller-enquiry-detail')
  }
  await context.close()
}
{
  const { context, page } = await session(MOBILE, 'demo.seller.local@voltsupply.in')
  await shot(page, '/dashboard/seller/enquiries', 'seller-leads-mobile')
  await context.close()
}

// --- admin --------------------------------------------------------------
{
  const { context, page } = await session(DESKTOP, 'admin@electrolead.com', 'AdminPass123')
  await shot(page, '/admin/kyc', 'admin-kyc')
  await shot(page, '/admin/users', 'admin-users')
  await shot(page, '/admin/enquiries', 'admin-enquiries')
  await shot(page, '/admin/subscriptions', 'admin-subscriptions')
  await context.close()
}

await browser.close()

const overflowing = captured.filter((c) => c.overflow > 1)
console.log(`\n${captured.length} screens captured into ${OUT}`)
if (overflowing.length) {
  console.log('\nHorizontal overflow (layout breaks):')
  for (const o of overflowing) console.log(`  ${o.name} — ${o.overflow}px`)
}
