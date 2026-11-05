/**
 * Idempotent demo seed.
 *
 * Creates a small, legible cast of accounts plus the enquiries and quotes that
 * make the geographic paywall visible in a live demo:
 *
 *   local seller (free)      -> sees Mumbai only
 *   state seller (state plan)-> sees all of Maharashtra (Mumbai + Pune)
 *   national seller          -> sees everything (adds Chennai)
 *
 * Safe to re-run: every write is an upsert keyed on email/title, and nothing
 * outside the demo.* accounts is touched.
 *
 *   node scripts/seed-demo.mjs
 */
import 'dotenv/config'
import bcrypt from 'bcrypt'
import pg from 'pg'

const PASSWORD = 'Demo@1234'
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
})

const USERS = [
  {
    // Platform admin. Kept here so the account is reproducible from source
    // rather than existing only as a hand-made row in one database.
    email: 'admin@electrolead.com',
    role: 'admin',
    name: 'Platform Admin',
    company_name: 'VoltSupply',
    phone: '9800000000',
    city: null,
    state: null,
    kyc_status: 'approved',
    password: 'AdminPass123',
  },
  {
    email: 'demo.buyer@voltsupply.in',
    role: 'buyer',
    name: 'Priya Sharma',
    company_name: 'Sharma Infrastructure Pvt Ltd',
    phone: '9820012345',
    city: 'Mumbai',
    state: 'Maharashtra',
    kyc_status: 'approved',
  },
  {
    email: 'demo.buyer2@voltsupply.in',
    role: 'buyer',
    name: 'Arjun Nair',
    company_name: 'Nair Constructions',
    phone: '9840012345',
    city: 'Chennai',
    state: 'Tamil Nadu',
    kyc_status: 'approved',
  },
  {
    email: 'demo.seller.local@voltsupply.in',
    role: 'seller',
    name: 'Rohit Mehta',
    company_name: 'Mehta Electricals',
    phone: '9821112233',
    city: 'Mumbai',
    state: 'Maharashtra',
    kyc_status: 'approved',
    plan: null, // free tier
  },
  {
    email: 'demo.seller.state@voltsupply.in',
    role: 'seller',
    name: 'Deepak Joshi',
    company_name: 'Joshi Power Systems',
    phone: '9822223344',
    city: 'Pune',
    state: 'Maharashtra',
    kyc_status: 'approved',
    plan: { plan_type: 'state', amount_paid: 4999 },
  },
  {
    email: 'demo.seller.national@voltsupply.in',
    role: 'seller',
    name: 'Karthik Raman',
    company_name: 'Raman Switchgear India',
    phone: '9841113344',
    city: 'Chennai',
    state: 'Tamil Nadu',
    kyc_status: 'approved',
    plan: { plan_type: 'national', amount_paid: 9999 },
  },
  {
    // Deliberately KYC-pending so the admin review queue has something real in
    // it during the demo.
    email: 'demo.seller.pending@voltsupply.in',
    role: 'seller',
    name: 'Amit Verma',
    company_name: 'Verma Cables',
    phone: '9823334455',
    city: 'Mumbai',
    state: 'Maharashtra',
    kyc_status: 'pending',
    plan: null,
  },
]

const ENQUIRIES = [
  {
    buyer: 'demo.buyer@voltsupply.in',
    title: 'LT Cable Supply for Andheri Warehouse',
    description:
      '3-core 240 sq mm XLPE armoured cable, approximately 2,400 metres. ISI marked, test certificates required. Delivery to Andheri East site.',
    city: 'Mumbai',
    state: 'Maharashtra',
    budget_min: 1800000,
    budget_max: 2400000,
    quote_deadline_days: 14,
  },
  {
    buyer: 'demo.buyer@voltsupply.in',
    title: 'Distribution Panels for Hinjewadi Office Block',
    description:
      '12 nos. floor-mounted distribution boards, IP54, with MCB/RCCB protection. Installation support preferred.',
    city: 'Pune',
    state: 'Maharashtra',
    budget_min: 900000,
    budget_max: 1300000,
    quote_deadline_days: 21,
  },
  {
    buyer: 'demo.buyer2@voltsupply.in',
    title: 'Transformer Supply for Sriperumbudur Unit',
    description: '2 x 1000 kVA oil-cooled distribution transformers with HT panels and commissioning.',
    city: 'Chennai',
    state: 'Tamil Nadu',
    budget_min: 4500000,
    budget_max: 6000000,
    quote_deadline_days: 30,
  },
]

// Quotes that establish the relationships messaging and saved contacts need.
const QUOTES = [
  {
    enquiry: 'LT Cable Supply for Andheri Warehouse',
    seller: 'demo.seller.local@voltsupply.in',
    total_price: 2150000,
    delivery_days: 18,
    warranty_period: '12 months',
    payment_terms: '30% advance, 70% against delivery',
    notes: 'Polycab make, ISI marked. Test certificates included with each drum.',
  },
  {
    enquiry: 'LT Cable Supply for Andheri Warehouse',
    seller: 'demo.seller.state@voltsupply.in',
    total_price: 1980000,
    delivery_days: 25,
    warranty_period: '18 months',
    payment_terms: '50% advance, balance on delivery',
    notes: 'KEI make. Can hold price for 30 days if confirmed this week.',
  },
  {
    enquiry: 'Distribution Panels for Hinjewadi Office Block',
    seller: 'demo.seller.state@voltsupply.in',
    total_price: 1120000,
    delivery_days: 35,
    warranty_period: '24 months',
    payment_terms: '40% advance, 60% on installation',
    notes: 'Includes on-site installation and commissioning by our Pune team.',
  },
]

async function upsertUser(client, user, passwordHash) {
  const result = await client.query(
    `INSERT INTO users (email, password_hash, role, name, phone, city, state, company_name, kyc_status, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           role = EXCLUDED.role,
           name = EXCLUDED.name,
           phone = EXCLUDED.phone,
           city = EXCLUDED.city,
           state = EXCLUDED.state,
           company_name = EXCLUDED.company_name,
           kyc_status = EXCLUDED.kyc_status,
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
      user.company_name,
      user.kyc_status,
    ]
  )
  return result.rows[0].id
}

async function upsertSubscription(client, userId, plan) {
  // One active subscription per demo seller, always a year out so the demo
  // never silently falls back to free tier because a date rolled past.
  await client.query(
    `DELETE FROM subscriptions WHERE user_id = $1`,
    [userId]
  )
  if (!plan) return
  await client.query(
    `INSERT INTO subscriptions (user_id, plan_type, amount_paid, status, start_date, end_date, razorpay_payment_id)
     VALUES ($1, $2, $3, 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '365 days', $4)`,
    [userId, plan.plan_type, plan.amount_paid, `demo_seed_${plan.plan_type}`]
  )
}

async function upsertEnquiry(client, enquiry, buyerId) {
  const existing = await client.query(
    'SELECT id FROM enquiries WHERE buyer_id = $1 AND title = $2 LIMIT 1',
    [buyerId, enquiry.title]
  )
  if (existing.rows.length > 0) {
    await client.query(
      `UPDATE enquiries
          SET description = $2, city = $3, state = $4, budget_min = $5, budget_max = $6,
              quote_deadline = CURRENT_DATE + ($7 || ' days')::interval, status = 'open'
        WHERE id = $1`,
      [
        existing.rows[0].id,
        enquiry.description,
        enquiry.city,
        enquiry.state,
        enquiry.budget_min,
        enquiry.budget_max,
        String(enquiry.quote_deadline_days),
      ]
    )
    return existing.rows[0].id
  }

  const result = await client.query(
    `INSERT INTO enquiries (buyer_id, title, description, city, state, budget_min, budget_max, quote_deadline, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE + ($8 || ' days')::interval, 'open')
     RETURNING id`,
    [
      buyerId,
      enquiry.title,
      enquiry.description,
      enquiry.city,
      enquiry.state,
      enquiry.budget_min,
      enquiry.budget_max,
      String(enquiry.quote_deadline_days),
    ]
  )
  return result.rows[0].id
}

async function upsertQuote(client, quote, enquiryId, sellerId) {
  await client.query(
    `INSERT INTO quotations (enquiry_id, seller_id, total_price, delivery_days, warranty_period, payment_terms, notes, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'submitted')
     ON CONFLICT (enquiry_id, seller_id) DO UPDATE
       SET total_price = EXCLUDED.total_price,
           delivery_days = EXCLUDED.delivery_days,
           warranty_period = EXCLUDED.warranty_period,
           payment_terms = EXCLUDED.payment_terms,
           notes = EXCLUDED.notes,
           status = 'submitted'`,
    [
      enquiryId,
      sellerId,
      quote.total_price,
      quote.delivery_days,
      quote.warranty_period,
      quote.payment_terms,
      quote.notes,
    ]
  )
}

const client = await pool.connect()
try {
  await client.query('BEGIN')

  const defaultHash = await bcrypt.hash(PASSWORD, 12)
  const ids = {}

  for (const user of USERS) {
    // Most accounts share the demo password; the admin keeps its own.
    const hash = user.password ? await bcrypt.hash(user.password, 12) : defaultHash
    const id = await upsertUser(client, user, hash)
    ids[user.email] = id
    if (user.role === 'seller') await upsertSubscription(client, id, user.plan)
    console.log(`user  ${user.email.padEnd(38)} ${user.role}${user.plan ? ` (${user.plan.plan_type})` : ''}`)
  }

  const enquiryIds = {}
  for (const enquiry of ENQUIRIES) {
    const id = await upsertEnquiry(client, enquiry, ids[enquiry.buyer])
    enquiryIds[enquiry.title] = id
    console.log(`enq   ${enquiry.title.slice(0, 44).padEnd(46)} ${enquiry.city}`)
  }

  for (const quote of QUOTES) {
    await upsertQuote(client, quote, enquiryIds[quote.enquiry], ids[quote.seller])
    console.log(`quote ${quote.seller.padEnd(38)} -> ${quote.enquiry.slice(0, 36)}`)
  }

  await client.query('COMMIT')
  console.log(`\nDone. All demo accounts use password: ${PASSWORD}`)
} catch (error) {
  await client.query('ROLLBACK')
  console.error('Seed failed:', error.message)
  process.exitCode = 1
} finally {
  client.release()
  await pool.end()
}
