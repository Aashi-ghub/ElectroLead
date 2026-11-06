import pool from '../config/database.js';

/**
 * Geographic scope for a seller, derived from their active subscription.
 *
 * This is the paywall. It previously lived only inside the lead-listing query,
 * so the read side was scoped and the write side was not: a free-tier Mumbai
 * seller who knew an enquiry's UUID could quote on a Chennai lead and reach
 * that buyer, defeating the subscription the business runs on. Both sides now
 * call the same function, so the rule cannot drift apart again.
 *
 * No active subscription = free tier = own city only.
 */
export async function getSellerScope(sellerId) {
  const subscription = await pool.query(
    `SELECT plan_type FROM subscriptions
      WHERE user_id = $1 AND status = 'active' AND end_date >= CURRENT_DATE
      ORDER BY created_at DESC
      LIMIT 1`,
    [sellerId]
  );

  const planType = subscription.rows[0]?.plan_type ?? 'local';

  const profile = await pool.query('SELECT city, state FROM users WHERE id = $1', [sellerId]);

  return {
    planType,
    city: profile.rows[0]?.city ?? null,
    state: profile.rows[0]?.state ?? null,
  };
}

/**
 * Whether this seller's plan covers this enquiry's location.
 *
 * Returns { allowed, reason } - reason is a message safe to show the seller.
 * Deliberately does not reveal where an out-of-scope enquiry actually is.
 */
// City and state are free text on both sides of this comparison, so they are
// normalised before matching: "mumbai", " Mumbai " and "MUMBAI" must all be
// the same place. Without this a supplier silently sees nothing and is never
// told why.
const norm = (v) => (v ?? '').trim().toLowerCase();

export async function canSellerQuoteOn(sellerId, enquiry) {
  const scope = await getSellerScope(sellerId);

  if (scope.planType === 'national') return { allowed: true };

  if (scope.planType === 'state') {
    if (!scope.state) {
      return { allowed: false, reason: 'State not set in profile' };
    }
    return norm(scope.state) === norm(enquiry.state)
      ? { allowed: true }
      : {
          allowed: false,
          reason: 'This enquiry is outside your state. Upgrade to the National plan to quote on it.',
        };
  }

  // local / free tier
  if (!scope.city) {
    return { allowed: false, reason: 'City not set in profile' };
  }
  return norm(scope.city) === norm(enquiry.city)
    ? { allowed: true }
    : {
        allowed: false,
        reason: 'This enquiry is outside your city. Upgrade your plan to quote on it.',
      };
}
