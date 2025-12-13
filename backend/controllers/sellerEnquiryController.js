import pool from '../config/database.js';

// GET /api/enquiries (Seller only - city-based with subscription filtering)
export const getAvailableEnquiries = async (req, res) => {
  try {
    // Enforce pagination limits (max 20)
    const { city } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 20);
    const offset = (page - 1) * limit;

    if (!city) {
      return res.status(400).json({ error: 'City parameter required' });
    }

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
    
    // Free sellers can only view enquiries in their city (local scope)
    // Paid sellers have subscription-based scope
    let query = '';
    let params = [];
    let paramCount = 1;

    if (!hasSubscription) {
      // Free tier: Only enquiries in seller's city
      query = `
        SELECT e.id, e.title, e.description, e.city, e.state, e.budget_min, e.budget_max, 
               e.quote_deadline, e.created_at,
               u.name as buyer_name, u.company_name as buyer_company,
               (SELECT COUNT(*) FROM quotations WHERE enquiry_id = e.id) as quote_count,
               (SELECT COUNT(*) FROM quotations WHERE enquiry_id = e.id AND seller_id = $${paramCount}) as my_quote_count
        FROM enquiries e
        JOIN users u ON e.buyer_id = u.id
        WHERE e.status = 'open' AND e.city = $${paramCount + 1}
        ORDER BY e.created_at DESC
        LIMIT $${paramCount + 2} OFFSET $${paramCount + 3}
      `;
      params = [req.user.id, city, limit, offset];
    } else if (subscription.plan_type === 'local') {
      // Local plan: Only enquiries in seller's city
      query = `
        SELECT e.id, e.title, e.description, e.city, e.state, e.budget_min, e.budget_max, 
               e.quote_deadline, e.created_at,
               u.name as buyer_name, u.company_name as buyer_company,
               (SELECT COUNT(*) FROM quotations WHERE enquiry_id = e.id) as quote_count,
               (SELECT COUNT(*) FROM quotations WHERE enquiry_id = e.id AND seller_id = $${paramCount}) as my_quote_count
        FROM enquiries e
        JOIN users u ON e.buyer_id = u.id
        WHERE e.status = 'open' AND e.city = $${paramCount + 1}
        ORDER BY e.created_at DESC
        LIMIT $${paramCount + 2} OFFSET $${paramCount + 3}
      `;
      params = [req.user.id, city, limit, offset];
    } else if (subscription.plan_type === 'state') {
      // State plan: Enquiries in seller's state
      const sellerStateResult = await pool.query('SELECT state FROM users WHERE id = $1', [req.user.id]);
      const sellerState = sellerStateResult.rows[0]?.state;

      if (!sellerState) {
        return res.status(400).json({ error: 'State not set in profile' });
      }

      query = `
        SELECT e.id, e.title, e.description, e.city, e.state, e.budget_min, e.budget_max, 
               e.quote_deadline, e.created_at,
               u.name as buyer_name, u.company_name as buyer_company,
               (SELECT COUNT(*) FROM quotations WHERE enquiry_id = e.id) as quote_count,
               (SELECT COUNT(*) FROM quotations WHERE enquiry_id = e.id AND seller_id = $${paramCount}) as my_quote_count
        FROM enquiries e
        JOIN users u ON e.buyer_id = u.id
        WHERE e.status = 'open' AND e.state = $${paramCount + 1}
        ORDER BY e.created_at DESC
        LIMIT $${paramCount + 2} OFFSET $${paramCount + 3}
      `;
      params = [req.user.id, sellerState, limit, offset];
    } else {
      // National plan: All enquiries (no geographic restriction)
      query = `
        SELECT e.id, e.title, e.description, e.city, e.state, e.budget_min, e.budget_max, 
               e.quote_deadline, e.created_at,
               u.name as buyer_name, u.company_name as buyer_company,
               (SELECT COUNT(*) FROM quotations WHERE enquiry_id = e.id) as quote_count,
               (SELECT COUNT(*) FROM quotations WHERE enquiry_id = e.id AND seller_id = $${paramCount}) as my_quote_count
        FROM enquiries e
        JOIN users u ON e.buyer_id = u.id
        WHERE e.status = 'open'
        ORDER BY e.created_at DESC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;
      params = [req.user.id, limit, offset];
    }

    const result = await pool.query(query, params);

    // Get count for pagination
    let countQuery = '';
    let countParams = [];
    
    if (!hasSubscription) {
      countQuery = 'SELECT COUNT(*) FROM enquiries WHERE status = \'open\' AND city = $1';
      countParams = [city];
    } else if (subscription.plan_type === 'local') {
      countQuery = 'SELECT COUNT(*) FROM enquiries WHERE status = \'open\' AND city = $1';
      countParams = [city];
    } else if (subscription.plan_type === 'state') {
      const sellerStateResult = await pool.query('SELECT state FROM users WHERE id = $1', [req.user.id]);
      const sellerState = sellerStateResult.rows[0]?.state;
      countQuery = 'SELECT COUNT(*) FROM enquiries WHERE status = \'open\' AND state = $1';
      countParams = [sellerState];
    } else {
      countQuery = 'SELECT COUNT(*) FROM enquiries WHERE status = \'open\'';
      countParams = [];
    }

    const countResult = await pool.query(countQuery, countParams);

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

