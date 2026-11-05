/**
 * Browser-level checks for the workflows that an API test cannot prove:
 * navigation, the geographic paywall as a seller actually sees it, the
 * messaging round trip, and mobile layout.
 *
 *   npx playwright install chromium          # one time
 *   node scripts/ui-check.mjs                                     # prod
 *   node scripts/ui-check.mjs http://localhost:3001 ./shots        # local
 *
 * Requires `node backend/scripts/seed-demo.mjs` to have been run first.
 * Screenshots are written to the second argument (default: cwd).
 *
 * Note: assertions read innerText, never textContent - textContent on <body>
 * includes Next.js's inline RSC payload, which contains strings like
 * "notFound" and will produce false failures.
 */
import { chromium } from 'playwright'

const BASE = process.argv[2] || 'https://electro-lead.vercel.app'
const SHOT = process.argv[3] || '.'
const results = []
const ok = (id, title, pass, detail = '') => {
  results.push({ id, pass, title, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id.padEnd(4)} ${title}${detail ? `\n          ${detail}` : ''}`)
}

const browser = await chromium.launch()

async function session(email, password) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await Promise.all([
    page.waitForURL((u) => !u.pathname.includes('/auth/login'), { timeout: 60000 }),
    page.click('button[type="submit"]'),
  ])
  return { ctx, page }
}

// ---- U6: admin lands on a real page, not a 404
{
  const { ctx, page } = await session('admin@electrolead.com', 'AdminPass123')
  await page.waitForLoadState('networkidle').catch(() => {})
  const url = page.url()
  const body = await page.locator('body').innerText()
  ok('U6', 'Admin login lands on a working admin page', url.includes('/admin') && !/404|not found/i.test(body), `url=${url}`)
  await page.screenshot({ path: `${SHOT}/admin.png`, fullPage: false })
  await ctx.close()
}

// ---- U1 + U2 + U3: buyer
{
  const { ctx, page } = await session('demo.buyer@voltsupply.in', 'Demo@1234')
  await page.waitForLoadState('networkidle').catch(() => {})
  ok('U7', '/dashboard redirects to the role dashboard', page.url().includes('/dashboard/buyer'), `url=${page.url()}`)

  const nav = await page.locator('nav').first().innerText()
  ok('U2a', 'Buyer sidebar shows Messages and Saved Suppliers', /Messages/.test(nav) && /Saved Suppliers/.test(nav))

  await page.goto(`${BASE}/dashboard/buyer/messages`, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(2500)
  const msgBody = await page.locator('body').innerText()
  const hasRealConvo = /Mehta Electricals|Joshi Power Systems/.test(msgBody)
  const hasMock = /Raj Electronics|bulk pricing|Power Solutions/.test(msgBody)
  ok('U3a', 'Buyer Messages shows real counterparties (no mock data)', hasRealConvo && !hasMock,
     `realConvo=${hasRealConvo} mockPresent=${hasMock}`)
  await page.screenshot({ path: `${SHOT}/buyer-messages.png` })

  // send a live message
  const stamp = `UI check ${Date.now().toString(36)}`
  await page.fill('input[placeholder="Type your message..."]', stamp)
  await page.click('button:has(svg.lucide-send), button:right-of(input[placeholder="Type your message..."])').catch(async () => {
    await page.keyboard.press('Enter')
  })
  await page.waitForTimeout(3000)
  const afterSend = await page.locator('body').innerText()
  ok('U5', 'Message sends and appears in the thread', afterSend.includes(stamp), `looking for "${stamp}"`)

  await page.goto(`${BASE}/dashboard/buyer/saved`, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(2000)
  const savedBody = await page.locator('body').innerText()
  const mockSaved = /Elektra Components|Power Distributors|Local Electro Mart/.test(savedBody)
  ok('U3b', 'Buyer Saved page is real (no mock suppliers)', !mockSaved,
     mockSaved ? 'mock supplier names still rendering' : 'empty-state or real data')
  await page.screenshot({ path: `${SHOT}/buyer-saved.png` })

  // U3c: Save + Message buttons on a quote
  await page.goto(`${BASE}/dashboard/buyer/enquiries`, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(2000)
  const link = page.locator('a[href*="/dashboard/buyer/enquiry/"]').first()
  if (await link.count()) {
    await link.click()
    await page.waitForTimeout(3000)
    const detail = await page.locator('body').innerText()
    ok('U3c', 'Enquiry detail exposes Save + Message on quotes',
       /Save supplier|Saved/.test(detail) && /Message/.test(detail))
    await page.screenshot({ path: `${SHOT}/buyer-enquiry-detail.png`, fullPage: true })
  } else {
    ok('U3c', 'Enquiry detail exposes Save + Message on quotes', false, 'no enquiry link found')
  }
  await ctx.close()
}

// ---- U1: the paywall, seen through the UI
async function leadCities(email) {
  const { ctx, page } = await session(email, 'Demo@1234')
  await page.goto(`${BASE}/dashboard/seller/enquiries`, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(3000)
  const body = await page.locator('body').innerText()
  const cities = ['Mumbai', 'Pune', 'Chennai'].filter((c) => body.includes(c))
  await page.screenshot({ path: `${SHOT}/leads-${email.split('@')[0].split('.').pop()}.png` })
  await ctx.close()
  return cities
}

const localCities = await leadCities('demo.seller.local@voltsupply.in')
const stateCities = await leadCities('demo.seller.state@voltsupply.in')
const natCities = await leadCities('demo.seller.national@voltsupply.in')

ok('U1a', 'Free-tier seller sees Mumbai only', localCities.join() === 'Mumbai', `saw ${JSON.stringify(localCities)}`)
ok('U1b', 'State-plan seller sees Mumbai + Pune', stateCities.includes('Mumbai') && stateCities.includes('Pune') && !stateCities.includes('Chennai'), `saw ${JSON.stringify(stateCities)}`)
ok('U1c', 'National-plan seller sees Chennai too', natCities.includes('Chennai'), `saw ${JSON.stringify(natCities)}`)

// ---- U2b + seller messages
{
  const { ctx, page } = await session('demo.seller.state@voltsupply.in', 'Demo@1234')
  await page.waitForLoadState('networkidle').catch(() => {})
  const nav = await page.locator('nav').first().innerText()
  ok('U2b', 'Seller sidebar shows Messages and Saved Buyers', /Messages/.test(nav) && /Saved Buyers/.test(nav))

  await page.goto(`${BASE}/dashboard/seller/quotes`, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(2500)
  const quotes = await page.locator('body').innerText()
  ok('U4', 'Seller My Quotes exposes Save + Message', /Save buyer|Saved/.test(quotes) && /Message/.test(quotes))
  await page.screenshot({ path: `${SHOT}/seller-quotes.png`, fullPage: true })
  await ctx.close()
}

// ---- U8: mobile
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.fill('input[type="email"]', 'demo.buyer@voltsupply.in')
  await page.fill('input[type="password"]', 'Demo@1234')
  await Promise.all([
    page.waitForURL((u) => !u.pathname.includes('/auth/login'), { timeout: 60000 }),
    page.click('button[type="submit"]'),
  ])
  await page.goto(`${BASE}/dashboard/buyer/messages`, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(2000)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  )
  ok('U8', 'No horizontal overflow at 375px on Messages', overflow <= 1, `overflow=${overflow}px`)
  await page.screenshot({ path: `${SHOT}/mobile-messages.png`, fullPage: true })
  await ctx.close()
}

await browser.close()

const failed = results.filter((r) => !r.pass)
console.log(`\n${'='.repeat(64)}\n${results.length - failed.length} passed · ${failed.length} failed`)
process.exitCode = failed.length ? 1 : 0
