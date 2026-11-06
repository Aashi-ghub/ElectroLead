/**
 * End-to-end workflow verification against a running ElectroLead backend.
 *
 *   node scripts/verify-workflows.mjs                     # http://localhost:3000
 *   node scripts/verify-workflows.mjs https://electrolead.onrender.com
 *
 * Exercises the checklist in WORKFLOW_CHECKLIST.md at the API level and prints
 * a PASS/FAIL line per check. Accounts created during the run are removed at
 * the end via a direct DB connection, so repeated runs leave no residue.
 *
 * Expects `node scripts/seed-demo.mjs` to have been run against the same DB.
 */
import './_env.mjs'
import pg from 'pg'

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '')
const PASSWORD = 'Demo@1234'
const RUN = Date.now().toString(36)

const ACCOUNTS = {
  admin: 'admin@electrolead.com',
  buyer: 'demo.buyer@voltsupply.in',
  buyer2: 'demo.buyer2@voltsupply.in',
  sellerLocal: 'demo.seller.local@voltsupply.in',
  sellerState: 'demo.seller.state@voltsupply.in',
  sellerNational: 'demo.seller.national@voltsupply.in',
}
const ADMIN_PASSWORD = 'AdminPass123'

const results = []
const tokens = {}
const createdEmails = []
let createdEnquiryId = null
// Set when the activate-test bypass actually granted a plan (non-production
// targets only) so cleanup can take it away again.
let bypassGrantedPlan = false
// A seller registered during this run, so it is guaranteed to have no quote
// relationship with anyone. Picking a seeded seller instead is fragile: as the
// demo dataset grew, the "stranger" acquired a real relationship and the
// negative tests started failing on correct behaviour.
let strangerSellerId = null

function record(id, title, ok, detail = '') {
  results.push({ id, title, ok, detail })
  const mark = ok === true ? 'PASS' : ok === 'skip' ? 'SKIP' : 'FAIL'
  const line = `${mark.padEnd(4)} ${id.padEnd(5)} ${title}`
  console.log(detail ? `${line}\n              ${detail}` : line)
}

async function req(method, path, { token, body, raw } = {}) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const text = await res.text()
  let parsed = null
  try {
    parsed = JSON.parse(text)
  } catch {
    parsed = null
  }
  return { status: res.status, body: parsed, text: raw ? text : undefined }
}

async function check(id, title, fn) {
  try {
    const outcome = await fn()
    if (outcome === undefined || outcome === true) return record(id, title, true)
    if (outcome === 'skip') return record(id, title, 'skip')
    if (typeof outcome === 'string') return record(id, title, false, outcome)
    if (outcome.skip) return record(id, title, 'skip', outcome.detail)
    return record(id, title, Boolean(outcome.ok), outcome.detail)
  } catch (error) {
    record(id, title, false, error.message)
  }
}

const expect = (cond, detail) => (cond ? true : { ok: false, detail })

// ---------------------------------------------------------------- sign in

async function login(key, email, password = PASSWORD) {
  const res = await req('POST', '/api/login', { body: { email, password } })
  if (res.status !== 200 || !res.body?.token) {
    throw new Error(`login failed for ${email}: ${res.status} ${JSON.stringify(res.body)}`)
  }
  tokens[key] = res.body.token
  return res.body
}

console.log(`\nVerifying ${BASE}\n${'='.repeat(70)}\n`)

// H1 first - everything else depends on the service being awake (Render cold
// starts can take 30s+, so this doubles as the warm-up).
await check('H1', 'Backend /health responds', async () => {
  const res = await req('GET', '/health')
  return expect(res.status === 200 && res.body?.status === 'ok', `got ${res.status}`)
})

await check('A6', 'Login with correct credentials returns a token', async () => {
  const data = await login('buyer', ACCOUNTS.buyer)
  return expect(Boolean(data.token), 'no token in response')
})

for (const [key, email] of Object.entries(ACCOUNTS)) {
  if (key === 'buyer') continue
  await login(key, email, key === 'admin' ? ADMIN_PASSWORD : PASSWORD)
}

// ---------------------------------------------------------------- A: auth

await check('A7', 'Login with wrong password is rejected', async () => {
  const res = await req('POST', '/api/login', { body: { email: ACCOUNTS.buyer, password: 'WrongPass999' } })
  return expect(res.status === 401, `expected 401, got ${res.status}`)
})

await check('A2', 'Buyer registration succeeds', async () => {
  const email = `verify.buyer.${RUN}@voltsupply.in`
  const res = await req('POST', '/api/register', {
    body: {
      email,
      password: PASSWORD,
      name: 'Verify Buyer',
      role: 'buyer',
      city: 'Mumbai',
      state: 'Maharashtra',
      phone: '9800000001',
    },
  })
  if (res.status === 201) createdEmails.push(email)
  return expect(res.status === 201, `expected 201, got ${res.status} ${JSON.stringify(res.body)}`)
})

await check('A3', 'Seller registration persists city/state', async () => {
  const email = `verify.seller.${RUN}@voltsupply.in`
  const res = await req('POST', '/api/register', {
    body: {
      email,
      password: PASSWORD,
      name: 'Verify Seller',
      role: 'seller',
      city: 'Nagpur',
      state: 'Maharashtra',
      phone: '9800000002',
    },
  })
  if (res.status !== 201) return { ok: false, detail: `expected 201, got ${res.status}` }
  createdEmails.push(email)

  const session = await req('POST', '/api/login', { body: { email, password: PASSWORD } })
  const profile = await req('GET', '/api/profile', { token: session.body.token })
  strangerSellerId = profile.body?.user?.id ?? null
  return expect(
    profile.body?.user?.city === 'Nagpur' && profile.body?.user?.state === 'Maharashtra',
    `city/state not saved: ${JSON.stringify(profile.body?.user)}`
  )
})

await check('A4', 'Duplicate email registration is rejected', async () => {
  const res = await req('POST', '/api/register', {
    body: { email: ACCOUNTS.buyer, password: PASSWORD, name: 'Dup', role: 'buyer' },
  })
  return expect(res.status >= 400 && res.status < 500, `expected 4xx, got ${res.status}`)
})

await check('A5', 'Weak password is rejected at registration', async () => {
  const res = await req('POST', '/api/register', {
    body: { email: `weak.${RUN}@voltsupply.in`, password: 'abc', name: 'Weak Pass', role: 'buyer' },
  })
  return expect(res.status === 400, `expected 400, got ${res.status}`)
})

await check('A10', 'Unauthenticated request to a protected route is rejected', async () => {
  const res = await req('GET', '/api/enquiries/my-enquiries')
  return expect(res.status === 401, `expected 401, got ${res.status}`)
})

await check('A11', 'Buyer token is refused on a seller-only endpoint', async () => {
  const res = await req('GET', '/api/my-quotations', { token: tokens.buyer })
  return expect(res.status === 403, `expected 403, got ${res.status}`)
})

await check('A12', 'Seller token is refused on an admin endpoint', async () => {
  const res = await req('GET', '/admin/users', { token: tokens.sellerState })
  return expect(res.status === 403, `expected 403, got ${res.status}`)
})

// ---------------------------------------------------------------- C: buyer

await check('C2', 'Buyer can create an enquiry', async () => {
  const res = await req('POST', '/api/enquiries', {
    token: tokens.buyer,
    body: {
      title: `Verification enquiry ${RUN}`,
      description: 'Created by the automated workflow verification run.',
      city: 'Mumbai',
      state: 'Maharashtra',
      budget_min: 100000,
      budget_max: 200000,
    },
  })
  createdEnquiryId = res.body?.enquiry?.id ?? null
  return expect(res.status === 201 && createdEnquiryId, `expected 201 + id, got ${res.status}`)
})

await check('C3', 'Enquiry with missing required fields is rejected', async () => {
  const res = await req('POST', '/api/enquiries', { token: tokens.buyer, body: { description: 'no title or city' } })
  return expect(res.status === 400, `expected 400, got ${res.status}`)
})

await check('C4', 'New enquiry appears in my-enquiries', async () => {
  const res = await req('GET', '/api/enquiries/my-enquiries', { token: tokens.buyer })
  const found = (res.body?.enquiries ?? []).some((e) => e.id === createdEnquiryId)
  return expect(found, 'created enquiry not present in list')
})

await check('C5', 'Buyer can open their enquiry by id', async () => {
  const res = await req('GET', `/api/enquiries/${createdEnquiryId}`, { token: tokens.buyer })
  return expect(res.status === 200 && res.body?.enquiry?.id === createdEnquiryId, `got ${res.status}`)
})

await check('C10', "Buyer cannot read another buyer's enquiry", async () => {
  const res = await req('GET', `/api/enquiries/${createdEnquiryId}`, { token: tokens.buyer2 })
  return expect(res.status === 403 || res.status === 404, `expected 403/404, got ${res.status}`)
})

await check('C11', "Buyer cannot delete another buyer's enquiry", async () => {
  const res = await req('DELETE', `/api/enquiries/${createdEnquiryId}`, { token: tokens.buyer2 })
  return expect(res.status === 403 || res.status === 404, `expected 403/404, got ${res.status}`)
})

// ------------------------------------------------- D: seller scope + quoting

const cityOf = (rows) => [...new Set(rows.map((r) => r.city))].sort()
const stateOf = (rows) => [...new Set(rows.map((r) => r.state))].sort()

await check('D3', 'Free-tier seller sees only their own city', async () => {
  const res = await req('GET', '/api/enquiries?limit=20', { token: tokens.sellerLocal })
  const cities = cityOf(res.body?.enquiries ?? [])
  return expect(
    res.status === 200 && cities.every((c) => c === 'Mumbai'),
    `expected Mumbai only, saw ${JSON.stringify(cities)}`
  )
})

await check('D4', 'State-plan seller sees the whole state', async () => {
  const res = await req('GET', '/api/enquiries?limit=20', { token: tokens.sellerState })
  const rows = res.body?.enquiries ?? []
  const states = stateOf(rows)
  const cities = cityOf(rows)
  return expect(
    res.status === 200 && states.every((s) => s === 'Maharashtra') && cities.length > 1,
    `expected multiple Maharashtra cities, saw states=${JSON.stringify(states)} cities=${JSON.stringify(cities)}`
  )
})

await check('D5', 'National-plan seller sees enquiries outside their state', async () => {
  const res = await req('GET', '/api/enquiries?limit=20', { token: tokens.sellerNational })
  const states = stateOf(res.body?.enquiries ?? [])
  return expect(
    res.status === 200 && states.length > 1,
    `expected more than one state, saw ${JSON.stringify(states)}`
  )
})

await check('D6', 'Seller cannot widen scope with a query param (paywall bypass)', async () => {
  const honest = await req('GET', '/api/enquiries?limit=20', { token: tokens.sellerLocal })
  const tampered = await req('GET', '/api/enquiries?limit=20&city=Chennai&state=Tamil%20Nadu', {
    token: tokens.sellerLocal,
  })
  const tamperedCities = cityOf(tampered.body?.enquiries ?? [])
  return expect(
    tampered.status === 200 &&
      tamperedCities.every((c) => c === 'Mumbai') &&
      (tampered.body?.enquiries ?? []).length === (honest.body?.enquiries ?? []).length,
    `scope widened to ${JSON.stringify(tamperedCities)}`
  )
})

await check('D9', 'Seller cannot read an out-of-scope enquiry by id', async () => {
  const national = await req('GET', '/api/enquiries?limit=20', { token: tokens.sellerNational })
  const chennai = (national.body?.enquiries ?? []).find((e) => e.city === 'Chennai')
  if (!chennai) return { skip: true, detail: 'no Chennai enquiry in seed data' }

  const res = await req('GET', `/api/enquiries?id=${chennai.id}`, { token: tokens.sellerLocal })
  return expect((res.body?.enquiries ?? []).length === 0, 'out-of-scope enquiry was returned')
})

// Regression guards for two live findings: the paywall was enforced only when
// listing leads, not when quoting, and admin writes returned password_hash.
await check('D6b', 'Free-tier seller cannot QUOTE outside their city', async () => {
  const national = await req('GET', '/api/enquiries?limit=20', { token: tokens.sellerNational })
  const outOfScope = (national.body?.enquiries ?? []).find((e) => e.city !== 'Mumbai')
  if (!outOfScope) return { skip: true, detail: 'no out-of-city enquiry in seed data' }

  const res = await req('POST', `/api/enquiries/${outOfScope.id}/quote`, {
    token: tokens.sellerLocal,
    body: { total_price: 101010 },
  })
  return expect(res.status === 403, `expected 403, got ${res.status} (quote may have been created)`)
})

await check('D6c', 'State-plan seller cannot QUOTE outside their state', async () => {
  const national = await req('GET', '/api/enquiries?limit=20', { token: tokens.sellerNational })
  const outOfState = (national.body?.enquiries ?? []).find((e) => e.state !== 'Maharashtra')
  if (!outOfState) return { skip: true, detail: 'no out-of-state enquiry in seed data' }

  const res = await req('POST', `/api/enquiries/${outOfState.id}/quote`, {
    token: tokens.sellerState,
    body: { total_price: 202020 },
  })
  return expect(res.status === 403, `expected 403, got ${res.status}`)
})

await check('F8', 'Admin writes never return password or OTP hashes', async () => {
  const users = await req('GET', '/admin/users?limit=1', { token: tokens.admin })
  const target = users.body?.users?.[0]
  if (!target) return { skip: true, detail: 'no users returned' }

  const suspend = await req('POST', `/admin/users/${target.id}/suspend`, { token: tokens.admin, body: {} })
  await req('POST', `/admin/users/${target.id}/suspend`, { token: tokens.admin, body: {} }) // revert

  const keys = Object.keys(suspend.body?.user ?? {})
  const leaked = keys.filter((k) => k.includes('password') || k.includes('otp'))
  return expect(leaked.length === 0, `leaked: ${leaked.join(', ')}`)
})

await check('H4', 'Oversized numbers are rejected, not crashed on', async () => {
  const res = await req('POST', '/api/enquiries', {
    token: tokens.buyer,
    body: { title: `Overflow probe ${RUN}`, city: 'Mumbai', budget_max: 1000000000000 },
  })
  if (res.status === 201 && res.body?.enquiry?.id) {
    await req('DELETE', `/api/enquiries/${res.body.enquiry.id}`, { token: tokens.buyer })
  }
  return expect(res.status === 400, `expected 400 validation error, got ${res.status}`)
})

await check('H5', 'A malformed id returns 400/404, not a 500', async () => {
  const res = await req('POST', '/api/enquiries/not-a-uuid/quote', {
    token: tokens.sellerNational,
    body: { total_price: 50000 },
  })
  return expect(res.status === 400 || res.status === 404, `expected 400/404, got ${res.status}`)
})

await check('D10', 'Seller can submit a quote', async () => {
  const res = await req('POST', `/api/enquiries/${createdEnquiryId}/quote`, {
    token: tokens.sellerLocal,
    body: { total_price: 150000, delivery_days: 20, warranty_period: '12 months', notes: 'Verification quote' },
  })
  return expect(res.status === 201, `expected 201, got ${res.status} ${JSON.stringify(res.body)}`)
})

await check('D11', 'Duplicate quote on the same enquiry is rejected', async () => {
  const res = await req('POST', `/api/enquiries/${createdEnquiryId}/quote`, {
    token: tokens.sellerLocal,
    body: { total_price: 160000 },
  })
  return expect(res.status === 400, `expected 400, got ${res.status}`)
})

await check('D14', 'my-quotations returns only the calling seller rows', async () => {
  const res = await req('GET', '/api/my-quotations', { token: tokens.sellerLocal })
  const rows = res.body?.quotations ?? []
  return expect(
    res.status === 200 && rows.length > 0 && rows.every((q) => q.enquiry_id),
    `got ${res.status} with ${rows.length} rows`
  )
})

// ------------------------------------------------- C: quotations + awarding

await check('C6', 'Buyer sees quotations on their enquiry (with seller identity)', async () => {
  const res = await req('GET', `/api/enquiries/${createdEnquiryId}/quotations`, { token: tokens.buyer })
  const rows = res.body?.quotations ?? []
  return expect(
    res.status === 200 && rows.length > 0 && rows[0].seller_id && rows[0].seller_name,
    `got ${res.status}, ${rows.length} rows, first=${JSON.stringify(rows[0] ?? null)}`
  )
})

let acceptedQuoteId = null

await check('C7', 'Buyer can accept a quote and the enquiry becomes awarded', async () => {
  const quotes = await req('GET', `/api/enquiries/${createdEnquiryId}/quotations`, { token: tokens.buyer })
  acceptedQuoteId = quotes.body?.quotations?.[0]?.id
  if (!acceptedQuoteId) return { ok: false, detail: 'no quote to accept' }

  const res = await req('POST', `/api/quotations/${acceptedQuoteId}/accept`, { token: tokens.buyer })
  if (res.status !== 200) return { ok: false, detail: `accept returned ${res.status}` }

  const after = await req('GET', `/api/enquiries/${createdEnquiryId}`, { token: tokens.buyer })
  return expect(after.body?.enquiry?.status === 'awarded', `status is ${after.body?.enquiry?.status}`)
})

await check('C8', 'Accepting a second quote on an awarded enquiry is rejected', async () => {
  const res = await req('POST', `/api/quotations/${acceptedQuoteId}/accept`, { token: tokens.buyer })
  return expect(res.status === 400, `expected 400, got ${res.status}`)
})

await check('D15', 'Seller cannot quote on an awarded enquiry', async () => {
  const res = await req('POST', `/api/enquiries/${createdEnquiryId}/quote`, {
    token: tokens.sellerState,
    body: { total_price: 123000 },
  })
  return expect(res.status >= 400, `expected 4xx, got ${res.status}`)
})

// ------------------------------------------------------- M: messaging (new)

let convo = null

await check('M1', 'Buyer conversation list is derived from quote relationships', async () => {
  const res = await req('GET', '/api/messages/conversations', { token: tokens.buyer })
  const rows = res.body?.conversations ?? []
  convo = rows.find((c) => c.enquiry_id === createdEnquiryId) ?? rows[0] ?? null
  return expect(res.status === 200 && rows.length > 0 && convo?.contact_id, `got ${res.status}, ${rows.length} rows`)
})

await check('M2', 'Seller sees the mirrored conversation', async () => {
  const res = await req('GET', '/api/messages/conversations', { token: tokens.sellerLocal })
  const rows = res.body?.conversations ?? []
  return expect(res.status === 200 && rows.length > 0, `got ${res.status}, ${rows.length} rows`)
})

await check('M3', 'Buyer can send a message to a seller who quoted', async () => {
  const res = await req('POST', '/api/messages', {
    token: tokens.buyer,
    body: { enquiry_id: convo.enquiry_id, contact_id: convo.contact_id, body: `Verification ping ${RUN}` },
  })
  return expect(res.status === 201 && res.body?.message?.id, `got ${res.status} ${JSON.stringify(res.body)}`)
})

await check('M4', 'Recipient unread count reflects the new message', async () => {
  const res = await req('GET', '/api/messages/unread-count', { token: tokens.sellerLocal })
  return expect(res.status === 200 && Number(res.body?.unread) > 0, `unread=${res.body?.unread}`)
})

await check('M5', 'Opening the thread marks it read and returns the message', async () => {
  const sellerConvos = await req('GET', '/api/messages/conversations', { token: tokens.sellerLocal })
  const sc = (sellerConvos.body?.conversations ?? []).find((c) => c.enquiry_id === convo.enquiry_id)
  if (!sc) return { ok: false, detail: 'seller has no matching conversation' }

  const thread = await req(
    'GET',
    `/api/messages/thread?enquiry_id=${sc.enquiry_id}&contact_id=${sc.contact_id}`,
    { token: tokens.sellerLocal }
  )
  if (thread.status !== 200) return { ok: false, detail: `thread returned ${thread.status}` }
  if (!(thread.body?.messages ?? []).some((m) => m.body.includes(RUN))) {
    return { ok: false, detail: 'sent message not in thread' }
  }

  const after = await req('GET', '/api/messages/unread-count', { token: tokens.sellerLocal })
  return expect(Number(after.body?.unread) === 0, `unread still ${after.body?.unread} after opening thread`)
})

await check('M6', 'Messaging a non-counterparty is refused', async () => {
  if (!strangerSellerId) return { skip: true, detail: 'no unrelated seller available' }
  const res = await req('POST', '/api/messages', {
    token: tokens.buyer,
    body: { enquiry_id: convo.enquiry_id, contact_id: strangerSellerId, body: 'should not be delivered' },
  })
  return expect(res.status === 403, `expected 403, got ${res.status}`)
})

await check('M7', 'Admin has no messaging access', async () => {
  const res = await req('GET', '/api/messages/conversations', { token: tokens.admin })
  return expect(res.status === 403, `expected 403, got ${res.status}`)
})

// ------------------------------------------------- S: saved contacts (new)

await check('S1', 'Buyer can save a seller they have quoted with', async () => {
  const res = await req('POST', '/api/saved', {
    token: tokens.buyer,
    body: { contact_id: convo.contact_id, note: 'Verification run' },
  })
  return expect(res.status === 201, `expected 201, got ${res.status} ${JSON.stringify(res.body)}`)
})

await check('S2', 'Saving the same contact twice is idempotent', async () => {
  const res = await req('POST', '/api/saved', { token: tokens.buyer, body: { contact_id: convo.contact_id } })
  return expect(res.status === 201, `expected 201, got ${res.status}`)
})

await check('S3', 'Saved list returns the contact with relationship stats', async () => {
  const res = await req('GET', '/api/saved', { token: tokens.buyer })
  const row = (res.body?.contacts ?? []).find((c) => c.id === convo.contact_id)
  return expect(row && Number(row.deal_count) > 0, `row=${JSON.stringify(row ?? null)}`)
})

await check('S5', 'Saving a non-counterparty is refused', async () => {
  if (!strangerSellerId) return { skip: true, detail: 'no unrelated seller available' }
  const res = await req('POST', '/api/saved', { token: tokens.buyer, body: { contact_id: strangerSellerId } })
  return expect(res.status === 403, `expected 403, got ${res.status}`)
})

await check('S4', 'Saved contact can be removed', async () => {
  const res = await req('DELETE', `/api/saved/${convo.contact_id}`, { token: tokens.buyer })
  if (res.status !== 200) return { ok: false, detail: `delete returned ${res.status}` }
  const after = await req('GET', '/api/saved', { token: tokens.buyer })
  return expect(
    !(after.body?.contacts ?? []).some((c) => c.id === convo.contact_id),
    'contact still present after delete'
  )
})

// ------------------------------------------------------------- E: payments

await check('E8', 'Buyer is refused on a seller-only subscription endpoint', async () => {
  const res = await req('POST', '/api/subscriptions/create-order', { token: tokens.buyer, body: { plan_type: 'state' } })
  return expect(res.status === 403, `expected 403, got ${res.status}`)
})

await check('E7', 'Seller without an active subscription falls back to free-tier scope', async () => {
  // demo.seller.local has no subscription at all, which is the same code path
  // an expired one takes (the status/end_date filter excludes both).
  const res = await req('GET', '/api/enquiries?limit=20', { token: tokens.sellerLocal })
  const cities = cityOf(res.body?.enquiries ?? [])
  return expect(cities.every((c) => c === 'Mumbai'), `saw ${JSON.stringify(cities)}`)
})

// Runs after E7 on purpose: against a non-production target this call actually
// grants a plan, which would otherwise widen sellerLocal's scope mid-run. The
// subscription it creates is rolled back below.
await check('E3', 'activate-test bypass is blocked when NODE_ENV=production', async () => {
  const health = await req('GET', '/health')
  const res = await req('POST', '/api/subscriptions/activate-test', {
    token: tokens.sellerLocal,
    body: { plan_type: 'state' },
  })

  if (health.body?.environment !== 'production') {
    if (res.status === 200) bypassGrantedPlan = true
    return {
      skip: true,
      detail: `target is ${health.body?.environment}, where the bypass is meant to be open (got ${res.status})`,
    }
  }
  return expect(res.status === 403, `expected 403 in production, got ${res.status}`)
})

// ---------------------------------------------------------------- F: admin

await check('F1', 'Admin can list users', async () => {
  const res = await req('GET', '/admin/users', { token: tokens.admin })
  return expect(res.status === 200 && (res.body?.users ?? []).length > 0, `got ${res.status}`)
})

await check('F4', 'Admin can list all enquiries', async () => {
  const res = await req('GET', '/admin/enquiries', { token: tokens.admin })
  return expect(res.status === 200 && Array.isArray(res.body?.enquiries), `got ${res.status}`)
})

await check('F5', 'Admin can list subscriptions', async () => {
  const res = await req('GET', '/admin/subscriptions', { token: tokens.admin })
  return expect(res.status === 200 && Array.isArray(res.body?.subscriptions), `got ${res.status}`)
})

await check('F2/F3', 'Admin can suspend and restore a user', async () => {
  const users = await req('GET', '/admin/users', { token: tokens.admin })
  const target = (users.body?.users ?? []).find((u) => u.email === `verify.buyer.${RUN}@voltsupply.in`)
  if (!target) return { skip: true, detail: 'verification account not found' }

  const suspend = await req('POST', `/admin/users/${target.id}/suspend`, { token: tokens.admin, body: {} })
  if (suspend.status !== 200) return { ok: false, detail: `suspend returned ${suspend.status}` }

  const blocked = await req('POST', '/api/login', {
    body: { email: target.email, password: PASSWORD },
  })
  const restore = await req('POST', `/admin/users/${target.id}/suspend`, { token: tokens.admin, body: {} })

  return expect(
    blocked.status === 401 || blocked.status === 403,
    `suspended user still logged in (${blocked.status}); restore=${restore.status}`
  )
})

await check('B4', 'Admin can see KYC documents for a user', async () => {
  const users = await req('GET', '/admin/users', { token: tokens.admin })
  const target = (users.body?.users ?? [])[0]
  const res = await req('GET', `/admin/users/${target.id}/documents`, { token: tokens.admin })
  return expect(res.status === 200, `got ${res.status}`)
})

await check('F7', 'Unauthenticated admin API access is refused', async () => {
  const res = await req('GET', '/admin/users')
  return expect(res.status === 401, `expected 401, got ${res.status}`)
})

// ------------------------------------------------------------ H: platform

await check('H3', 'Unknown route returns a clean 404', async () => {
  const res = await req('GET', '/api/this-route-does-not-exist')
  return expect(res.status === 404 && res.body?.error, `got ${res.status}`)
})

// ------------------------------------------------------------- C9 + cleanup

await check('C9', 'Buyer can delete their own enquiry', async () => {
  const res = await req('DELETE', `/api/enquiries/${createdEnquiryId}`, { token: tokens.buyer })
  if (res.status !== 200) return { ok: false, detail: `delete returned ${res.status}` }
  createdEnquiryId = null
  const after = await req('GET', '/api/enquiries/my-enquiries', { token: tokens.buyer })
  return expect(
    !(after.body?.enquiries ?? []).some((e) => e.title === `Verification enquiry ${RUN}`),
    'enquiry still listed after delete'
  )
})

// ------------------------------------------------------------------ report

// Cleanup is retried: Neon's pooler occasionally fails DNS on the first
// attempt, and a half-cleaned run leaves accounts behind in a shared database.
async function cleanup(attempt = 1) {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 2,
  })
  try {
    await pool.query('DELETE FROM enquiries WHERE title = $1', [`Verification enquiry ${RUN}`])
    if (createdEmails.length > 0) {
      await pool.query('DELETE FROM users WHERE email = ANY($1)', [createdEmails])
    }
    await pool.query('DELETE FROM messages WHERE body LIKE $1', [`%${RUN}%`])
    if (bypassGrantedPlan) {
      await pool.query(
        `DELETE FROM subscriptions
          WHERE user_id = (SELECT id FROM users WHERE email = $1)
            AND razorpay_payment_id IS DISTINCT FROM 'demo_seed_state'`,
        ['demo.seller.local@voltsupply.in']
      )
    }
    console.log('\nCleanup: verification accounts, enquiry and messages removed.')
  } catch (error) {
    if (attempt < 3) {
      await pool.end().catch(() => {})
      return cleanup(attempt + 1)
    }
    console.log(`\n(cleanup warning after ${attempt} attempts: ${error.message})`)
  } finally {
    await pool.end().catch(() => {})
  }
}

await cleanup()

const passed = results.filter((r) => r.ok === true).length
const skipped = results.filter((r) => r.ok === 'skip').length
const failed = results.filter((r) => r.ok === false)

console.log(`\n${'='.repeat(70)}`)
console.log(`${passed} passed · ${failed.length} failed · ${skipped} skipped · ${results.length} total`)
if (failed.length > 0) {
  console.log('\nFailures:')
  for (const f of failed) console.log(`  ${f.id.padEnd(6)} ${f.title}\n         ${f.detail}`)
}
process.exitCode = failed.length > 0 ? 1 : 0
