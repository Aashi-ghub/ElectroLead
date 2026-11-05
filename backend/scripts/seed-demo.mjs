/**
 * Idempotent demo seed.
 *
 * Builds a marketplace that looks traded-in rather than freshly installed:
 * ~25 suppliers and ~10 buyers across 15 Indian cities, with enquiries and
 * competing quotes already on the board. The cast also makes the geographic
 * paywall demonstrable live:
 *
 *   free tier     -> sees its own city only
 *   state plan    -> sees its whole state
 *   national plan -> sees everything
 *
 * Safe to re-run: every write is an upsert keyed on email/title, and nothing
 * outside the seeded accounts is touched.
 *
 *   node backend/scripts/seed-demo.mjs
 */
import './_env.mjs'
import bcrypt from 'bcrypt'
import pg from 'pg'
import { SELLERS, BUYERS, ENQUIRIES, QUOTES } from './demo-data.mjs'
import { CATEGORY_IMAGES } from './category-images.mjs'

const PASSWORD = 'Demo@1234'
const ADMIN = {
  email: 'admin@electrolead.com',
  password: 'AdminPass123',
  name: 'Platform Admin',
  company: 'VoltSupply',
  phone: '9800000000',
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
})

// Deterministic phone numbers keep the dataset stable across re-runs without
// having to hand-write 35 of them.
const phoneFor = (index) => String(9800000000 + index * 10607 + 11)

async function upsertUser(client, user, passwordHash) {
  const result = await client.query(
    `INSERT INTO users (
       email, password_hash, role, name, phone, city, state, company_name, kyc_status,
       category, about, rating, review_count, years_in_business, response_hours, is_active
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,true)
     ON CONFLICT (email) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       role = EXCLUDED.role,
       name = EXCLUDED.name,
       phone = EXCLUDED.phone,
       city = EXCLUDED.city,
       state = EXCLUDED.state,
       company_name = EXCLUDED.company_name,
       kyc_status = EXCLUDED.kyc_status,
       category = EXCLUDED.category,
       about = EXCLUDED.about,
       rating = EXCLUDED.rating,
       review_count = EXCLUDED.review_count,
       years_in_business = EXCLUDED.years_in_business,
       response_hours = EXCLUDED.response_hours,
       is_active = true
     RETURNING id`,
    [
      user.email,
      passwordHash,
      user.role,
      user.name,
      user.phone,
      user.city,
      user.state,
      user.company,
      user.kyc,
      user.category ?? null,
      user.about ?? null,
      user.rating ?? null,
      user.reviews ?? 0,
      user.years ?? null,
      user.response ?? null,
    ]
  )
  return result.rows[0].id
}

async function upsertSubscription(client, userId, plan) {
  // One active subscription per paid seller, always a year out so a demo never
  // silently drops to free tier because a date rolled past.
  await client.query('DELETE FROM subscriptions WHERE user_id = $1', [userId])
  if (!plan) return
  const amount = { local: 2499, state: 4999, national: 9999 }[plan]
  await client.query(
    `INSERT INTO subscriptions (user_id, plan_type, amount_paid, status, start_date, end_date, razorpay_payment_id)
     VALUES ($1, $2, $3, 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '365 days', $4)`,
    [userId, plan, amount, `demo_seed_${plan}`]
  )
}

async function upsertEnquiry(client, enquiry, buyerId) {
  const image = CATEGORY_IMAGES[enquiry.category] ?? null
  const existing = await client.query(
    'SELECT id FROM enquiries WHERE buyer_id = $1 AND title = $2 LIMIT 1',
    [buyerId, enquiry.title]
  )

  if (existing.rows.length > 0) {
    await client.query(
      `UPDATE enquiries SET
         description = $2, city = $3, state = $4, budget_min = $5, budget_max = $6,
         quote_deadline = CURRENT_DATE + ($7 || ' days')::interval,
         category = $8, image_url = $9, status = 'open'
       WHERE id = $1`,
      [
        existing.rows[0].id,
        enquiry.description,
        enquiry.city,
        enquiry.state,
        enquiry.min,
        enquiry.max,
        String(enquiry.days),
        enquiry.category,
        image,
      ]
    )
    return existing.rows[0].id
  }

  const result = await client.query(
    `INSERT INTO enquiries (
       buyer_id, title, description, city, state, budget_min, budget_max,
       quote_deadline, category, image_url, status
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7, CURRENT_DATE + ($8 || ' days')::interval, $9,$10,'open')
     RETURNING id`,
    [
      buyerId,
      enquiry.title,
      enquiry.description,
      enquiry.city,
      enquiry.state,
      enquiry.min,
      enquiry.max,
      String(enquiry.days),
      enquiry.category,
      image,
    ]
  )
  return result.rows[0].id
}

async function upsertQuote(client, enquiryId, sellerId, [, , price, days, warranty, terms, notes]) {
  await client.query(
    `INSERT INTO quotations (enquiry_id, seller_id, total_price, delivery_days, warranty_period, payment_terms, notes, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'submitted')
     ON CONFLICT (enquiry_id, seller_id) DO UPDATE SET
       total_price = EXCLUDED.total_price,
       delivery_days = EXCLUDED.delivery_days,
       warranty_period = EXCLUDED.warranty_period,
       payment_terms = EXCLUDED.payment_terms,
       notes = EXCLUDED.notes,
       status = 'submitted'`,
    [enquiryId, sellerId, price, days, warranty, terms, notes]
  )
}

const client = await pool.connect()
try {
  await client.query('BEGIN')

  const defaultHash = await bcrypt.hash(PASSWORD, 12)
  const adminHash = await bcrypt.hash(ADMIN.password, 12)
  const ids = {}

  ids[ADMIN.email] = await upsertUser(
    client,
    { ...ADMIN, role: 'admin', city: null, state: null, kyc: 'approved' },
    adminHash
  )

  let n = 0
  for (const seller of SELLERS) {
    const id = await upsertUser(
      client,
      { ...seller, role: 'seller', phone: seller.phone ?? phoneFor(n++) },
      defaultHash
    )
    ids[seller.email] = id
    await upsertSubscription(client, id, seller.plan)
  }

  for (const buyer of BUYERS) {
    ids[buyer.email] = await upsertUser(
      client,
      { ...buyer, role: 'buyer', phone: buyer.phone ?? phoneFor(n++) },
      defaultHash
    )
  }

  const enquiryIds = {}
  for (const enquiry of ENQUIRIES) {
    enquiryIds[enquiry.title] = await upsertEnquiry(client, enquiry, ids[enquiry.buyer])
  }

  // A seeded quote from a supplier whose plan could never have shown them that
  // lead is a contradiction a client could spot in thirty seconds, so refuse to
  // create one. Seeding bypasses the API, which is exactly why this has to be
  // checked here rather than relied on from the route guards.
  const sellerByEmail = new Map(SELLERS.map((s) => [s.email, s]))
  const enquiryByTitle = new Map(ENQUIRIES.map((e) => [e.title, e]))
  const canSee = (seller, enquiry) => {
    if (!seller.plan) return seller.city === enquiry.city
    if (seller.plan === 'local') return seller.city === enquiry.city
    if (seller.plan === 'state') return seller.state === enquiry.state
    return true
  }

  let quoted = 0
  const outOfScope = []
  const expectedQuotes = new Map()
  for (const quote of QUOTES) {
    const [title, sellerEmail] = quote
    const enquiryId = enquiryIds[title]
    const sellerId = ids[sellerEmail]
    if (!enquiryId || !sellerId) {
      console.warn(`  skipped quote (unknown enquiry or seller): ${sellerEmail} -> ${title}`)
      continue
    }

    const seller = sellerByEmail.get(sellerEmail)
    const enquiry = enquiryByTitle.get(title)
    if (seller && enquiry && !canSee(seller, enquiry)) {
      outOfScope.push(
        `${seller.company} (${seller.plan ?? 'free'}, ${seller.city}) could not see "${title}" in ${enquiry.city}`
      )
      continue
    }

    await upsertQuote(client, enquiryId, sellerId, quote)
    quoted++
    if (!expectedQuotes.has(enquiryId)) expectedQuotes.set(enquiryId, new Set())
    expectedQuotes.get(enquiryId).add(sellerId)
  }

  // Upserting alone is not idempotent: a quote or enquiry removed from the
  // dataset would survive in the database from an earlier run. That is how the
  // free-tier supplier silently ended up over their monthly cap. Prune anything
  // on a seeded enquiry that the dataset no longer describes.
  const seededEnquiryIds = Object.values(enquiryIds)
  let prunedQuotes = 0
  for (const enquiryId of seededEnquiryIds) {
    const keep = [...(expectedQuotes.get(enquiryId) ?? [])]
    const res = keep.length
      ? await client.query(
          'DELETE FROM quotations WHERE enquiry_id = $1 AND seller_id <> ALL($2::uuid[]) RETURNING id',
          [enquiryId, keep]
        )
      : await client.query('DELETE FROM quotations WHERE enquiry_id = $1 RETURNING id', [enquiryId])
    prunedQuotes += res.rowCount
  }

  // Enquiries owned by a seeded buyer but no longer in the dataset - including
  // anything a demo recording created - go too, so a reseed is a clean reset.
  const seededBuyerIds = BUYERS.map((b) => ids[b.email])
  const prunedEnquiries = await client.query(
    `DELETE FROM enquiries
      WHERE buyer_id = ANY($1::uuid[]) AND id <> ALL($2::uuid[])
      RETURNING title`,
    [seededBuyerIds, seededEnquiryIds]
  )

  // The free-tier monthly cap applies to seeded rows too. A demo supplier who
  // starts at their limit cannot quote on camera, which looks like a bug.
  const FREE_TIER_CAP = 3
  const overCap = []
  for (const seller of SELLERS.filter((s) => !s.plan)) {
    const count = QUOTES.filter(([, email]) => email === seller.email).length
    if (count >= FREE_TIER_CAP) {
      overCap.push(`${seller.company} has ${count} seeded quotes; free tier allows ${FREE_TIER_CAP}/month`)
    }
  }

  if (outOfScope.length > 0 || overCap.length > 0) {
    await client.query('ROLLBACK')
    console.error('\nSeed refused - the dataset contradicts the platform rules:\n')
    for (const line of [...outOfScope, ...overCap]) console.error(`  - ${line}`)
    process.exitCode = 1
    throw new Error('inconsistent demo data')
  }

  await client.query('COMMIT')

  const withPlan = SELLERS.filter((s) => s.plan).length
  console.log(`suppliers   ${SELLERS.length} (${withPlan} on paid plans, ${SELLERS.length - withPlan} free tier)`)
  console.log(`buyers      ${BUYERS.length}`)
  console.log(`enquiries   ${ENQUIRIES.length}`)
  console.log(`quotes      ${quoted}`)
  if (prunedQuotes > 0 || prunedEnquiries.rowCount > 0) {
    console.log(`pruned      ${prunedQuotes} stale quote(s), ${prunedEnquiries.rowCount} stale enquiry(ies)`)
  }
  console.log(`\nAll demo accounts use password: ${PASSWORD}`)
  console.log(`Admin: ${ADMIN.email} / ${ADMIN.password}`)
} catch (error) {
  await client.query('ROLLBACK')
  console.error('Seed failed:', error.message)
  process.exitCode = 1
} finally {
  client.release()
  await pool.end()
}
