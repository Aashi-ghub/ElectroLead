import pool from '../config/database.js';

// Everything here is served unauthenticated to the marketing pages, so the
// column lists are deliberately narrow: company, location and reputation only.
// Never add email, phone or GST/PAN here - that information is the thing
// suppliers pay a subscription to reach, and it would be scrapeable.

// GET /api/public/summary
export const getMarketplaceSummary = async (req, res) => {
  try {
    const [counts, categories, featured] = await Promise.all([
      pool.query(
        `SELECT
           (SELECT COUNT(*)::int FROM users WHERE role = 'seller' AND is_active) AS suppliers,
           (SELECT COUNT(*)::int FROM users WHERE role = 'buyer' AND is_active) AS buyers,
           (SELECT COUNT(DISTINCT city)::int FROM users WHERE role = 'seller' AND city IS NOT NULL) AS supplier_cities,
           (SELECT COUNT(*)::int FROM enquiries WHERE status = 'open') AS open_enquiries,
           (SELECT COUNT(*)::int FROM quotations) AS quotes,
           (SELECT COALESCE(SUM(budget_max), 0)::bigint FROM enquiries WHERE status = 'open') AS open_value`
      ),
      pool.query(
        `SELECT category,
                COUNT(*) FILTER (WHERE role = 'seller')::int AS supplier_count
           FROM users
          WHERE category IS NOT NULL AND role = 'seller' AND is_active
          GROUP BY category`
      ),
      pool.query(
        `SELECT company_name, city, state, category, rating, review_count,
                years_in_business, response_hours, kyc_status
           FROM users
          WHERE role = 'seller' AND is_active AND rating IS NOT NULL
          ORDER BY rating DESC, review_count DESC
          LIMIT 6`
      ),
    ]);

    const openEnquiries = await pool.query(
      `SELECT e.title, e.city, e.state, e.category, e.budget_min, e.budget_max, e.quote_deadline,
              (SELECT COUNT(*) FROM quotations q WHERE q.enquiry_id = e.id)::int AS quote_count
         FROM enquiries e
        WHERE e.status = 'open'
        ORDER BY e.created_at DESC
        LIMIT 6`
    );

    res.json({
      stats: counts.rows[0],
      categories: categories.rows,
      featured_suppliers: featured.rows,
      recent_enquiries: openEnquiries.rows,
    });
  } catch (error) {
    console.error('getMarketplaceSummary error:', error);
    res.status(500).json({ error: 'Failed to load marketplace summary' });
  }
};
