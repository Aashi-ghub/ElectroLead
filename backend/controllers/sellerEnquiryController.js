import pool from '../config/database.js';

const ENQUIRY_COLUMNS = `
  e.id, e.title, e.description, e.city, e.state, e.budget_min, e.budget_max,
  e.quote_deadline, e.created_at,
  u.name as buyer_name, u.company_name as buyer_company,
  (SELECT COUNT(*) FROM quotations WHERE enquiry_id = e.id) as quote_count,
  (SELECT COUNT(*) FROM quotations WHERE enquiry_id = e.id AND seller_id = $1) as my_quote_count
`;

// Builds the scoped list query + a fully independent count query (its own
// $1.. numbering - Postgres can't infer a placeholder's type if it never
// appears in that query's own text, even if a value is supplied for it).
// Optionally narrowed to a single enquiry id - same scope rules apply
// either way, so an out-of-scope id just returns zero rows.
function buildScopedQuery({ field, value, enquiryId, limit, offset }) {
  const listParams = [];
  let listClause = "e.status = 'open'";
  if (field) {
    listParams.push(value);
    listClause += ` AND ${field} = $${listParams.length + 1}`; // +1: $1 is reserved for seller id
  }
  if (enquiryId) {
    listParams.push(enquiryId);
    listClause += ` AND e.id = $${listParams.length + 1}`;
  }
  const limitIndex = listParams.length + 2;
  const offsetIndex = limitIndex + 1;

  const query = `
    SELECT ${ENQUIRY_COLUMNS}
    FROM enquiries e
    JOIN users u ON e.buyer_id = u.id
    WHERE ${listClause}
    ORDER BY e.created_at DESC
    LIMIT $${limitIndex} OFFSET $${offsetIndex}
  `;
  const params = [null, ...listParams, limit, offset]; // params[0] filled by caller with seller id

  const countParams = [];
  let countClause = "e.status = 'open'";
  if (field) {
    countParams.push(value);
    countClause += ` AND ${field} = $${countParams.length}`;
  }
  if (enquiryId) {
    countParams.push(enquiryId);
    countClause += ` AND e.id = $${countParams.length}`;
  }
  const countQuery = `SELECT COUNT(*) FROM enquiries e WHERE ${countClause}`;

  return { query, params, countQuery, countParams };
}

// GET /api/enquiries (Seller only - subscription-scoped, always keyed off the
// seller's own profile city/state, never a client-supplied query param -
// otherwise a seller could read any region's enquiries by editing the URL,
// bypassing the paid geographic-access paywall entirely).
export const getAvailableEnquiries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 20);
    const offset = (page - 1) * limit;
    // Optional single-enquiry lookup (same scope rules as the list).
    const enquiryId = req.query.id || null;

    // Check if seller has active subscription
    const subscriptionResult = await pool.query(
      `SELECT * FROM subscriptions
       WHERE user_id = $1 AND status = 'active' AND end_date >= CURRENT_DATE
       ORDER BY created_at DESC
       LIMIT 1`,
      [req.user.id]
    );

    const hasSubscription = subscriptionResult.rows.length > 0;
    const subscription = hasSubscription ? subscriptionResult.rows[0] : null;
    const planType = hasSubscription ? subscription.plan_type : 'local'; // free tier = local scope

    let scoped;

    if (planType === 'local') {
      const sellerResult = await pool.query('SELECT city FROM users WHERE id = $1', [req.user.id]);
      const sellerCity = sellerResult.rows[0]?.city;
      if (!sellerCity) {
        return res.status(400).json({ error: 'City not set in profile' });
      }
      scoped = buildScopedQuery({ field: 'e.city', value: sellerCity, enquiryId, limit, offset });
    } else if (planType === 'state') {
      const sellerResult = await pool.query('SELECT state FROM users WHERE id = $1', [req.user.id]);
      const sellerState = sellerResult.rows[0]?.state;
      if (!sellerState) {
        return res.status(400).json({ error: 'State not set in profile' });
      }
      scoped = buildScopedQuery({ field: 'e.state', value: sellerState, enquiryId, limit, offset });
    } else {
      scoped = buildScopedQuery({ field: null, value: null, enquiryId, limit, offset });
    }

    scoped.params[0] = req.user.id;
    const result = await pool.query(scoped.query, scoped.params);
    const countResult = await pool.query(scoped.countQuery, scoped.countParams);

    // Get current month's quotation count for free sellers
    let monthlyQuotationCount = 0;
    if (!hasSubscription) {
      const currentMonthStart = new Date();
      currentMonthStart.setDate(1);
      currentMonthStart.setHours(0, 0, 0, 0);
      const quotationCountResult = await pool.query(
        `SELECT COUNT(*) as count FROM quotations
         WHERE seller_id = $1 AND created_at >= $2`,
        [req.user.id, currentMonthStart]
      );
      monthlyQuotationCount = parseInt(quotationCountResult.rows[0].count);
    }

    res.json({
      enquiries: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      },
      subscription: hasSubscription ? {
        plan_type: subscription.plan_type,
        end_date: subscription.end_date,
      } : null,
      free_tier: !hasSubscription ? {
        monthly_quotation_limit: 3,
        monthly_quotations_used: monthlyQuotationCount,
        remaining: Math.max(0, 3 - monthlyQuotationCount),
      } : null,
    });
  } catch (error) {
    console.error('Get available enquiries error:', error);
    res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
};
