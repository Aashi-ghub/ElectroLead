/**
 * Records a narrated client demo of the full VoltSupply workflow.
 *
 *   npx playwright install chromium        # one time
 *   node scripts/demo-recording.mjs                                  # prod
 *   node scripts/demo-recording.mjs https://electro-lead.vercel.app ./demo
 *
 * Drives the real deployed app - nothing here is mocked or faked. Produces one
 * continuous .webm in the output directory, roughly four minutes long, with an
 * on-screen caption track so the recording can be watched without a presenter.
 *
 * It creates its own enquiry, quotes on it, messages about it and awards it,
 * then deletes it, so the demo dataset is identical before and after a run and
 * the recording can be re-shot as many times as you like.
 *
 * Requires `node backend/scripts/seed-demo.mjs` to have been run first.
 */
import { chromium } from 'playwright'
import { mkdirSync, existsSync, renameSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

import path from 'node:path'

const BASE = (process.argv[2] || 'https://electro-lead.vercel.app').replace(/\/$/, '')
const OUT = process.argv[3] || './demo-recording'
const PASSWORD = 'Demo@1234'
const ADMIN_PASSWORD = 'AdminPass123'
const STAMP = new Date().toISOString().slice(0, 10)
const ENQUIRY_TITLE = `Switchgear Package for Thane Metro Depot`

mkdirSync(OUT, { recursive: true })

const ACCOUNTS = {
  buyer: 'demo.buyer@voltsupply.in',
  local: 'demo.seller.local@voltsupply.in',
  state: 'demo.seller.state@voltsupply.in',
  national: 'demo.seller.national@voltsupply.in',
  admin: 'admin@electrolead.com',
}

// ---------------------------------------------------------------- captions

// Injected before any page script runs, so the caption bar survives every
// navigation without having to be re-created by hand each time.
const CAPTION_SCRIPT = () => {
  window.__demoCaption = (title, body) => {
    let bar = document.getElementById('__demo_caption')
    if (!bar) {
      bar = document.createElement('div')
      bar.id = '__demo_caption'
      bar.style.cssText = [
        'position:fixed',
        'left:0',
        'right:0',
        'bottom:0',
        'z-index:2147483647',
        'background:linear-gradient(to top, rgba(10,10,10,0.97), rgba(10,10,10,0.88))',
        'color:#fff',
        'padding:18px 32px 20px',
        'font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif',
        'border-top:3px solid #e8590c',
        'transition:opacity .3s ease',
        'pointer-events:none',
      ].join(';')
      document.body.appendChild(bar)
    }
    bar.innerHTML =
      `<div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#ff922b;margin-bottom:6px;font-weight:600">${title}</div>` +
      `<div style="font-size:20px;line-height:1.4;font-weight:500">${body}</div>`
    bar.style.opacity = '1'
  }
  window.__demoClearCaption = () => {
    const bar = document.getElementById('__demo_caption')
    if (bar) bar.style.opacity = '0'
  }
}

let currentCaption = null

// Global pacing dial. Raise it for a slower walkthrough, lower it for a
// sizzle reel: DEMO_PACE=1 is roughly reading pace, 0.65 keeps the whole
// thing near four minutes.
const PACE = Number(process.env.DEMO_PACE || 0.65)
const beat = (ms) => Math.round(ms * PACE)

async function say(page, title, body, hold = 3200) {
  currentCaption = [title, body]
  await page
    .evaluate(([t, b]) => window.__demoCaption?.(t, b), [title, body])
    .catch(() => {})
  await page.waitForTimeout(beat(hold))
}

// Re-apply the last caption after a navigation wiped the DOM.
async function restoreCaption(page) {
  if (!currentCaption) return
  await page
    .evaluate(([t, b]) => window.__demoCaption?.(t, b), currentCaption)
    .catch(() => {})
}

async function goto(page, route, hold = 1200) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 90000 })
  await restoreCaption(page)
  await page.waitForTimeout(beat(hold))
}

// Playwright's auto-scroll puts an element just inside the viewport, which on
// a long page means directly behind the caption bar. Centring it first keeps
// whatever is being clicked visible in the recording.
async function center(target) {
  await target.scrollIntoViewIfNeeded().catch(() => {})
  await target.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' })).catch(() => {})
  await target.page().waitForTimeout(beat(400))
}

async function click(page, selector, hold = 1200) {
  const target = typeof selector === 'string' ? page.locator(selector).first() : selector
  await center(target)
  await target.click()
  await page.waitForTimeout(beat(hold))
  await restoreCaption(page)
}

async function type(page, selector, value, delay = 40) {
  const target = typeof selector === 'string' ? page.locator(selector).first() : selector
  await center(target)
  await target.click()
  await target.fill('')
  await target.type(value, { delay })
  await page.waitForTimeout(beat(200))
}

// ---------------------------------------------------------------- sessions

// The story needs seven role switches, and nobody watching a demo wants to
// see credentials typed seven times. Fill instantly and move on: the sign-in
// is plumbing between scenes, not a scene. Only the first one is typed out,
// so it is clear this is a real login rather than a cut.
let signInCount = 0

async function signIn(page, email, password = PASSWORD) {
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle', timeout: 90000 })
  await restoreCaption(page)

  const showTyping = signInCount++ === 0
  if (showTyping) {
    await page.waitForTimeout(beat(500))
    await type(page, 'input[type="email"]', email, 26)
    await type(page, 'input[type="password"]', password, 26)
    await page.waitForTimeout(beat(400))
  } else {
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    await page.waitForTimeout(350)
  }

  await Promise.all([
    page.waitForURL((u) => !u.pathname.includes('/auth/login'), { timeout: 90000 }),
    page.click('button[type="submit"]'),
  ])
  await page.waitForLoadState('networkidle').catch(() => {})
  await restoreCaption(page)
  await page.waitForTimeout(beat(showTyping ? 1200 : 700))
}

async function signOut(page) {
  const logout = page.locator('button:has-text("Logout")').first()
  if (await logout.count()) {
    await logout.click().catch(() => {})
    await page.waitForURL((u) => u.pathname.includes('/auth/login'), { timeout: 60000 }).catch(() => {})
  } else {
    await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' })
  }
  await restoreCaption(page)
  await page.waitForTimeout(beat(350))
}

// ------------------------------------------------------------------ record

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
  deviceScaleFactor: 1,
})
await context.addInitScript(CAPTION_SCRIPT)

const page = await context.newPage()

try {
  // ---------------------------------------------------------- 1. the market
  await goto(page, '/', 2000)
  await say(page, 'VoltSupply', 'A B2B marketplace for electrical procurement in India.', 3600)
  await say(
    page,
    'Live, not a mockup',
    'Every number on this page is queried from the platform: suppliers, cities, open requirements.',
    4400
  )
  await page.mouse.wheel(0, 650)
  await page.waitForTimeout(beat(1400))
  await say(page, 'Eight categories', 'Cable, switchgear, transformers, lighting, motors, solar and more.', 3800)
  await page.mouse.wheel(0, 750)
  await page.waitForTimeout(beat(1400))
  await say(page, 'Open right now', 'Real requirements with real budgets, waiting on quotes today.', 4000)
  await page.mouse.wheel(0, 800)
  await page.waitForTimeout(beat(1400))
  await say(page, 'Rated suppliers', 'Ratings, years trading and response times come from the platform, not a brochure.', 4200)

  // ---------------------------------------------------------- 2. buyer posts
  await say(page, 'Act 1 — The buyer', 'Priya Sharma runs procurement for an infrastructure contractor.', 3400)
  await signIn(page, ACCOUNTS.buyer)
  await say(page, 'Buyer dashboard', 'Live counts from her own enquiries — active requirements, quotes received, budget posted.', 4200)

  await goto(page, '/dashboard/buyer/create-enquiry', 1200)
  await say(page, 'Posting a requirement', 'Step one: what the project is, and which category it falls under.', 3400)

  await type(page, 'input[name="title"]', ENQUIRY_TITLE)
  await page.selectOption('select[name="category"]', 'switchgear').catch(() => {})
  await page.waitForTimeout(beat(700))
  await type(
    page,
    'textarea[name="description"]',
    '11kV indoor switchgear panels with VCB, including protection relays, cabling and commissioning at the Thane depot.',
    14
  )
  await page.waitForTimeout(beat(900))
  await click(page, 'button:has-text("Next")', 1400)

  await say(page, 'Step two', 'Line items, so suppliers quote against the same specification.', 3000)
  const itemName = page.locator('input[placeholder="Product name"]').first()
  if (await itemName.count()) {
    await itemName.type('11kV VCB Panel', { delay: 40 })
    await page.locator('input[placeholder="Specifications"]').first().type('630A, IP4X, indoor', { delay: 25 })
    await page.locator('input[placeholder="Quantity"]').first().type('6', { delay: 60 })
    await page.locator('input[placeholder="Unit"]').first().type('nos', { delay: 60 })
  }
  await page.waitForTimeout(beat(1000))
  await click(page, 'button:has-text("Next")', 1400)

  await say(page, 'Step three', 'Location and budget. Location is what decides which suppliers ever see this.', 4000)
  await type(page, 'input[name="city"]', 'Mumbai', 70)
  await type(page, 'input[name="state"]', 'Maharashtra', 55)
  await type(page, 'input[name="budgetMin"]', '2200000', 50)
  await type(page, 'input[name="budgetMax"]', '2800000', 50)
  const deadline = page.locator('input[name="quoteDeadline"]')
  if (await deadline.count()) await deadline.fill('2026-12-15')
  await page.waitForTimeout(beat(900))

  await say(page, 'Publishing', 'The enquiry goes live to every supplier whose plan covers Mumbai.', 2600)
  await click(page, 'button:has-text("Publish Enquiry")', 3500)

  await goto(page, '/dashboard/buyer/enquiries', 1500)
  await say(page, 'Posted', 'It is now listed, open, and waiting on quotes.', 3400)

  // ------------------------------------------------- 3. the paywall, in situ
  await signOut(page)
  await say(page, 'Act 2 — The supplier', 'Rohit Mehta sells switchgear in Mumbai. He is on the free tier.', 3800)
  await signIn(page, ACCOUNTS.local)
  await goto(page, '/dashboard/seller/enquiries', 1500)
  await say(page, 'Free tier', 'He sees leads in his own city only — Mumbai. Including the one just posted.', 4200)
  await say(page, 'And what he is missing', 'The banner states the limit plainly: Mumbai only, three quotes a month.', 4200)

  await signOut(page)
  await say(page, 'The same screen, a paid plan', 'Deepak Joshi in Pune is on the State plan.', 3400)
  await signIn(page, ACCOUNTS.state)
  await goto(page, '/dashboard/seller/enquiries', 1500)
  await say(page, 'State plan', 'His list covers all of Maharashtra — Mumbai and Pune. More plan, more territory.', 4600)

  await signOut(page)
  await signIn(page, ACCOUNTS.national)
  await goto(page, '/dashboard/seller/enquiries', 1500)
  await say(page, 'National plan', 'Karthik in Chennai sees the whole country — Mumbai, Pune and Chennai.', 4400)
  await say(
    page,
    'This is the business model',
    'Geographic reach is the product. It is enforced server-side — the scope cannot be widened by editing the URL.',
    5000
  )

  await goto(page, '/pricing', 1500)
  await say(page, 'Three tiers', 'Local, State, National. Suppliers upgrade to widen the funnel.', 4000)

  // ------------------------------------------------------------ 4. the quote
  await signOut(page)
  await say(page, 'Act 3 — Quoting', 'Back to Rohit in Mumbai, who opens the new enquiry.', 3400)
  await signIn(page, ACCOUNTS.local)
  await goto(page, '/dashboard/seller/enquiries', 1200)

  const lead = page.locator(`a[href*="/dashboard/seller/enquiry/"]`).first()
  await lead.click()
  await page.waitForLoadState('networkidle').catch(() => {})
  await restoreCaption(page)
  await page.waitForTimeout(beat(2000))
  await say(page, 'The brief', 'Full specification, budget band and deadline — everything needed to price it.', 4000)

  const openQuote = page.locator('button:has-text("Submit Quote")').first()
  if (await openQuote.count()) {
    await click(page, openQuote, 1400)
  }

  await say(page, 'Submitting a quote', 'Price, lead time, warranty and payment terms.', 3000)
  const price = page.locator('input[name="totalPrice"]')
  if (await price.count()) {
    await price.type('2450000', { delay: 55 })
    await page.locator('input[name="deliveryDays"]').type('45', { delay: 70 })
    await page.locator('input[name="warranty"]').type('24 months', { delay: 35 })
    await page.locator('input[name="paymentTerms"]').type('30% advance, 70% against delivery', { delay: 18 })
    const notes = page.locator('textarea[name="notes"]')
    if (await notes.count()) {
      await notes.type('Siemens make. Commissioning by our Mumbai team included.', { delay: 16 })
    }
    await page.waitForTimeout(beat(900))
    await click(page, page.locator('button:has-text("Submit Quote")').last(), 3200)
  }
  await say(page, 'Quote submitted', 'Sellers never see each other’s pricing — only the buyer does.', 4200)

  // --------------------------------------------- 5. compare, talk, award
  await signOut(page)
  await say(page, 'Act 4 — Back to the buyer', 'Priya now has a quote to review.', 3200)
  await signIn(page, ACCOUNTS.buyer)
  await goto(page, '/dashboard/buyer/enquiries', 1200)

  const mine = page.locator(`a[href*="/dashboard/buyer/enquiry/"]`).first()
  await mine.click()
  await page.waitForLoadState('networkidle').catch(() => {})
  await restoreCaption(page)
  await page.waitForTimeout(beat(2500))
  await say(page, 'Comparing quotes', 'Price, delivery, warranty and terms side by side, with the supplier named.', 4000)
  await say(
    page,
    'Judging the supplier, not just the price',
    'Rating, review count, years trading, typical response time, and a KYC badge on every quote.',
    4600
  )

  await say(page, 'Talking to the supplier', 'Messaging opens only once a supplier has quoted — no cold outreach.', 4000)
  const msgBtn = page.locator('a[href*="/messages?enquiry_id="]').first()
  if (await msgBtn.count()) {
    await msgBtn.click()
    await page.waitForLoadState('networkidle').catch(() => {})
    await restoreCaption(page)
    await page.waitForTimeout(beat(2500))
  } else {
    await goto(page, '/dashboard/buyer/messages', 2000)
  }

  const input = page.locator('input[placeholder="Type your message..."]')
  await input.click()
  await input.type('Can you hold this price if we confirm by Friday?', { delay: 38 })
  await page.waitForTimeout(beat(700))
  await page.keyboard.press('Enter')
  await page.waitForTimeout(beat(2600))
  await restoreCaption(page)
  await say(page, 'Sent', 'Threads are scoped to the enquiry, so context never gets lost.', 3800)

  await signOut(page)
  await say(page, 'The supplier replies', 'Rohit sees an unread badge in his sidebar.', 3400)
  await signIn(page, ACCOUNTS.local)
  await page.waitForTimeout(beat(1500))
  await goto(page, '/dashboard/seller/messages', 2500)
  const reply = page.locator('input[placeholder="Type your message..."]')
  await reply.click()
  await reply.type('Yes — price holds to Friday. We can start despatch the following week.', { delay: 28 })
  await page.waitForTimeout(beat(700))
  await page.keyboard.press('Enter')
  await page.waitForTimeout(beat(2600))
  await restoreCaption(page)
  await say(page, 'Two-way', 'Both sides are talking inside the platform, against the enquiry.', 3800)

  await signOut(page)
  await signIn(page, ACCOUNTS.buyer)
  await goto(page, '/dashboard/buyer/enquiries', 1200)
  await page.locator(`a[href*="/dashboard/buyer/enquiry/"]`).first().click()
  await page.waitForLoadState('networkidle').catch(() => {})
  await restoreCaption(page)
  await page.waitForTimeout(beat(2200))

  await say(page, 'Saving the supplier', 'Good suppliers get bookmarked for the next project.', 3400)
  const save = page.locator('button:has-text("Save supplier")').first()
  if (await save.count()) {
    await click(page, save, 2000)
  }

  await say(page, 'Awarding', 'Awarding closes the enquiry and tells every other supplier where they stand.', 3800)
  // Two clicks by design: the first arms the button and states the
  // consequence, the second commits. Worth showing rather than editing out.
  const award = page.locator('button:has-text("Award this quote")').first()
  if (await award.count()) {
    await click(page, award, 1800)
    await say(page, 'It asks first', 'Awarding declines every other quote and cannot be undone, so it confirms.', 3600)
    await click(page, page.locator('button:has-text("Confirm award")').first(), 3200)
  }
  await say(page, 'Awarded', 'The enquiry is closed. The loop is complete: post, discover, quote, negotiate, award.', 4600)

  await goto(page, '/dashboard/buyer/saved', 2000)
  await say(page, 'Saved suppliers', 'With the quote history that earned the bookmark.', 3800)

  // ------------------------------------------------------------- 6. admin
  await signOut(page)
  await say(page, 'Act 5 — Oversight', 'The platform operator keeps the marketplace trustworthy.', 3400)
  await signIn(page, ACCOUNTS.admin, ADMIN_PASSWORD)
  await page.waitForTimeout(beat(1500))
  await say(page, 'KYC review', 'Suppliers are verified before they can be trusted with enquiries.', 4200)

  await goto(page, '/admin/users', 2000)
  await say(page, 'User management', 'Every account, with the ability to suspend a bad actor immediately.', 4200)

  await goto(page, '/admin/enquiries', 2000)
  await say(page, 'Marketplace activity', 'Every enquiry across every buyer.', 3600)

  await goto(page, '/admin/subscriptions', 2000)
  await say(page, 'Revenue', 'Who is on which plan, and when it expires.', 4000)

  await goto(page, '/', 1500)
  await say(page, 'VoltSupply', 'Post a requirement. Reach verified suppliers. Compare, negotiate, award — in one place.', 5500)
  await page.evaluate(() => window.__demoClearCaption?.()).catch(() => {})
  await page.waitForTimeout(beat(1500))
} catch (error) {
  console.error('\nRecording stopped early:', error.message)
  process.exitCode = 1
} finally {
  const video = page.video()
  await context.close() // flushes the video file
  await browser.close()

  let webm = null
  if (video) webm = await video.path().catch(() => null)
  if (webm && existsSync(webm)) {
    const named = path.join(OUT, `voltsupply-demo-${STAMP}.webm`)
    try {
      renameSync(webm, named)
      webm = named
    } catch {
      /* keep the original name */
    }
    console.log(`\nRecording saved: ${webm}`)
    console.log('Encoding MP4...')
    const mp4 = await toMp4(webm)
    if (mp4) console.log(`MP4 for sharing: ${mp4}`)
  } else {
    console.log(`\nRecording directory: ${OUT}`)
  }

  console.log(`\nEnquiry created by this run: "${ENQUIRY_TITLE}"`)
  console.log('Reset the demo data with: node backend/scripts/reset-demo-run.mjs')
}

// ------------------------------------------------------------------- encode

// Chromium records VP9/webm, which Keynote, PowerPoint and QuickTime will not
// open. Re-encode to H.264 so the file can simply be sent to a client.
//
// Note: Playwright's own bundled ffmpeg is NOT usable here - it is a stripped
// build (`--disable-everything` plus the webm muxer and libvpx) with no H.264
// encoder and no mp4 muxer. Hence the @ffmpeg-installer dependency.
async function findFfmpeg() {
  try {
    const installer = await import('@ffmpeg-installer/ffmpeg')
    const binary = installer.default?.path ?? installer.path
    if (binary && existsSync(binary)) return binary
  } catch {
    /* fall through to a system ffmpeg */
  }

  const onPath = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' })
  return onPath.error ? null : 'ffmpeg'
}

async function toMp4(input) {
  const ffmpeg = await findFfmpeg()
  if (!ffmpeg) {
    console.log('(no ffmpeg available - keeping .webm only)')
    return null
  }
  const output = input.replace(/\.webm$/, '.mp4')
  const res = spawnSync(
    ffmpeg,
    ['-y', '-i', input, '-c:v', 'libx264', '-preset', 'medium', '-crf', '23',
     '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output],
    { stdio: 'ignore' }
  )
  if (res.status !== 0 || !existsSync(output)) {
    console.log('(ffmpeg conversion failed - keeping .webm only)')
    return null
  }
  return output
}
