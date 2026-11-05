# ElectroLead / VoltSupply — Workflow Verification

**Prod:** frontend https://electro-lead.vercel.app · backend https://electrolead.onrender.com
Render free tier cold-starts: the first request can take 30s+. Don't call it broken until the second try.

## Running the checks

```bash
# API layer - 51 checks, self-cleaning
cd backend
node scripts/seed-demo.mjs                                  # idempotent demo data
node scripts/verify-workflows.mjs https://electrolead.onrender.com

# Browser layer - 13 checks + screenshots
cd ..
npx playwright install chromium                             # one time
node scripts/ui-check.mjs https://electro-lead.vercel.app ./shots
```

**Last full run against production: 51/51 API · 13/13 UI.**

## Recording a client demo

```bash
npm run demo:seed      # reset the demo cast and enquiries
npm run demo:record    # ~4 min narrated walkthrough -> demo-recording/*.mp4
npm run demo:reset     # undo what the recording created
```

Drives the real deployed app — nothing is mocked. Produces one continuous
H.264 MP4 (~4 MB) with an on-screen caption track, so it can be sent to a
client and watched without a presenter. `DEMO_PACE=1` slows it down for a
live walkthrough; `DEMO_PACE=0.5` tightens it into a sizzle reel.

The recording covers: landing → buyer posts an enquiry → the geographic
paywall across all three seller tiers → pricing → supplier quotes → buyer
compares, messages, saves and awards → admin KYC, users, enquiries, revenue.

> ⚠️ **Never run `npm test` against a database you care about.** The jest suite
> `TRUNCATE`s every table. It now refuses to start unless `TEST_DATABASE_URL` is
> set or the database name ends in `_test` — see `backend/tests/helpers/db.js`.

## Demo accounts

All demo accounts use password **`Demo@1234`**. Admin uses **`AdminPass123`**.

| Role | Email | Scope |
|---|---|---|
| Admin | admin@electrolead.com | — |
| Buyer | demo.buyer@voltsupply.in | Mumbai + Pune enquiries |
| Buyer | demo.buyer2@voltsupply.in | Chennai enquiry |
| Seller — free tier | demo.seller.local@voltsupply.in | Mumbai only |
| Seller — state plan | demo.seller.state@voltsupply.in | all Maharashtra |
| Seller — national plan | demo.seller.national@voltsupply.in | everything |
| Seller — KYC pending | demo.seller.pending@voltsupply.in | fills the admin review queue |

The three seller tiers exist so the geographic paywall is demonstrable live:
log in as each and watch the Available Leads list widen from 1 city → 1 state → all India.

---

## API checks — `backend/scripts/verify-workflows.mjs`, 51 passing

| ID | Check | Result |
|---|---|---|
| H1 | Backend `/health` responds | ✅ |
| H3 | Unknown route returns a clean 404, no stack trace | ✅ |
| A2 | Buyer registration succeeds | ✅ |
| A3 | Seller registration persists city/state | ✅ |
| A4 | Duplicate email rejected | ✅ |
| A5 | Weak password rejected | ✅ |
| A6 | Login with correct credentials returns a token | ✅ |
| A7 | Login with wrong password rejected | ✅ |
| A10 | Unauthenticated request to a protected route → 401 | ✅ |
| A11 | Buyer token refused on seller-only endpoint → 403 | ✅ |
| A12 | Seller token refused on admin endpoint → 403 | ✅ |
| C2 | Buyer can create an enquiry | ✅ |
| C3 | Enquiry missing required fields rejected | ✅ |
| C4 | New enquiry appears in my-enquiries | ✅ |
| C5 | Buyer can open their enquiry by id | ✅ |
| C6 | Buyer sees quotations with seller identity | ✅ |
| C7 | Accepting a quote awards the enquiry | ✅ |
| C8 | Second accept on an awarded enquiry rejected | ✅ |
| C9 | Buyer can delete their own enquiry | ✅ |
| C10 | Buyer cannot read another buyer's enquiry 🔒 | ✅ |
| C11 | Buyer cannot delete another buyer's enquiry 🔒 | ✅ |
| D3 | Free-tier seller sees own city only | ✅ |
| D4 | State-plan seller sees the whole state | ✅ |
| D5 | National-plan seller sees other states | ✅ |
| D6 | Query-param tampering does not widen scope 🔒 | ✅ |
| D9 | Out-of-scope enquiry not readable by id 🔒 | ✅ |
| D10 | Seller can submit a quote | ✅ |
| D11 | Duplicate quote rejected | ✅ |
| D14 | my-quotations is seller-isolated 🔒 | ✅ |
| D15 | Cannot quote on an awarded enquiry | ✅ |
| E7 | No active subscription → free-tier scope | ✅ |
| E8 | Buyer refused on seller-only subscription endpoint 🔒 | ✅ |
| F1 | Admin can list users | ✅ |
| F2/F3 | Admin suspend blocks login; restore re-enables | ✅ |
| F4 | Admin can list all enquiries | ✅ |
| F5 | Admin can list subscriptions | ✅ |
| F7 | Unauthenticated admin API access → 401 🔒 | ✅ |
| B4 | Admin can read a user's KYC documents | ✅ |
| M1 | Buyer conversations derived from quote relationships | ✅ |
| M2 | Seller sees the mirrored conversation | ✅ |
| M3 | Buyer can message a seller who quoted | ✅ |
| M4 | Unread count reflects new message | ✅ |
| M5 | Opening a thread marks it read | ✅ |
| M6 | Messaging a non-counterparty refused 🔒 | ✅ |
| M7 | Admin has no messaging access 🔒 | ✅ |
| S1 | Buyer can save a seller they quoted with | ✅ |
| S2 | Saving twice is idempotent | ✅ |
| S3 | Saved list carries relationship stats | ✅ |
| S4 | Saved contact can be removed | ✅ |
| S5 | Saving a non-counterparty refused 🔒 | ✅ |
| E3 | `activate-test` bypass blocked when `NODE_ENV=production` | ✅ (prod only; open in dev by design) |

## Browser checks — `scripts/ui-check.mjs`, 13 passing

| ID | Check | Result |
|---|---|---|
| U1a | Free-tier seller sees Mumbai only | ✅ |
| U1b | State-plan seller sees Mumbai + Pune | ✅ |
| U1c | National-plan seller also sees Chennai | ✅ |
| U2a | Buyer sidebar shows Messages + Saved Suppliers | ✅ |
| U2b | Seller sidebar shows Messages + Saved Buyers | ✅ |
| U3a | Buyer Messages renders real counterparties, no mock data | ✅ |
| U3b | Buyer Saved renders real data / empty state, no mock suppliers | ✅ |
| U3c | Enquiry detail exposes Save + Message per quote | ✅ |
| U4 | Seller My Quotes exposes Save + Message | ✅ |
| U5 | Message sends and appears in the thread | ✅ |
| U6 | Admin login lands on a working `/admin/kyc` | ✅ |
| U7 | `/dashboard` redirects to the role's dashboard | ✅ |
| U8 | No horizontal overflow at 375px on Messages | ✅ |

Still worth a human eye before the demo:

- [ ] **U9** Two browsers side by side — confirm a reply lands within ~10s (polling cadence)
- [ ] **U10** `/auth/kyc-status` wording once Cloudinary is configured and a real upload exists
- [ ] **U11** Skim remaining pages at 375px (dashboards, create-enquiry, admin tables)

## Credential-gated — your side

- [ ] **G1** `RESEND_API_KEY` is set on Render ✅ (you added it). Also set **`EMAIL_FROM`** to an
      address on a domain verified in Resend — without it, Resend only delivers to your own
      account address. Then A13 (OTP verify) and A14 (password reset) become testable.
- [ ] **G2** Cloudinary credentials are still placeholders → KYC upload returns 500.
      Blocks B2 and the full KYC submit→review loop (admin-side review works on existing rows).
- [ ] **G3** Razorpay live/test keys → E4/E5 (create order, verify payment). Until then the
      subscription tiers are seeded directly.

---

## Fixed during this pass

| Was | Now |
|---|---|
| `/dashboard` rendered hardcoded US enquiries in dollars | redirects to the role's dashboard |
| Admin login → `/admin` → **404** (no index page existed) | redirects to `/admin/kyc` |
| Messages pages were hardcoded mock chats | real `messages` table, 4 endpoints, polling UI |
| Saved pages were hardcoded mock suppliers | real `saved_contacts` table, 3 endpoints, live UI |
| Messages/Saved unreachable — no nav links | in both sidebars, with an unread badge |
| Login limit 5/15min per IP counting successes | 20/15min, failures only (`LOGIN_RATE_LIMIT`) |
| `npm test` truncated whatever DB it was pointed at | refuses unless the DB is marked disposable |
| Resend only wired over SMTP:465 (blocked on Render) | Resend HTTPS API when `RESEND_API_KEY` is set |
| 9 pre-existing TypeScript errors, hidden by `ignoreBuildErrors` | typecheck is clean |

## Known gaps

- **Messaging is polling-based** (10s inbox, 30s badge), not websockets. Fine for a demo on
  Render's free tier; revisit if real-time matters.
- **Conversations require a quote first.** A buyer cannot cold-message a seller — deliberate,
  so the platform isn't a scrapeable contact directory. Worth stating explicitly in the demo.
- **Leftover test accounts were cleared** when the database was wiped (see git history). The
  demo seed is now the single source of truth for demo data.
