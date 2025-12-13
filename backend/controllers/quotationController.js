import pool from '../config/database.js';
import { notifyBuyerNewQuotation } from '../utils/notifications.js';

// POST /api/enquiries/:id/quote (Seller only)
export const createQuotation = async (req, res) => {
  try {
    const { id: enquiryId } = req.params;
    const { total_price, delivery_days, warranty_period, payment_terms, notes } = req.body;

    // Verify enquiry exists and is open
    const enquiryResult = await pool.query(
      'SELECT id, buyer_id, title, status FROM enquiries WHERE id = $1',
      [enquiryId]
    );

    if (enquiryResult.rows.length === 0) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    const enquiry = enquiryResult.rows[0];

    if (enquiry.status !== 'open') {
      return res.status(400).json({ error: 'Enquiry is no longer accepting quotations' });
    }

    // Check if seller already submitted a quote (prevent duplicates)
    const existingQuote = await pool.query(
      'SELECT id FROM quotations WHERE enquiry_id = $1 AND seller_id = $2',
      [enquiryId, req.user.id]
    );

    if (existingQuote.rows.length > 0) {
      return res.status(400).json({ error: 'Quotation already submitted for this enquiry' });
    }

    // Check active subscription
    const subscriptionResult = await pool.query(
      `SELECT * FROM subscriptions 
       WHERE user_id = $1 AND status = 'active' AND end_date >= CURRENT_DATE
       ORDER BY created_at DESC
       LIMIT 1`,
      [req.user.id]
    );

    // If no subscription, check free tier limit (3 quotations per month)
    if (subscriptionResult.rows.length === 0) {
      // Get current month's quotation count for free sellers
      const currentMonthStart = new Date();
      currentMonthStart.setDate(1);
      currentMonthStart.setHours(0, 0, 0, 0);

      const monthlyQuotationCount = await pool.query(
        `SELECT COUNT(*) as count FROM quotations 
         WHERE seller_id = $1 AND created_at >= $2`,
        [req.user.id, currentMonthStart]
      );

      const count = parseInt(monthlyQuotationCount.rows[0].count);
      const FREE_TIER_LIMIT = 3;

      if (count >= FREE_TIER_LIMIT) {
        return res.status(403).json({ 
          error: `Free tier limit reached. You can submit ${FREE_TIER_LIMIT} quotations per month. Please subscribe for unlimited quotations.`,
          limit: FREE_TIER_LIMIT,
          used: count
        });
      }
    }

    // Create quotation
    const result = await pool.query(
      `INSERT INTO quotations (enquiry_id, seller_id, total_price, delivery_days, warranty_period, payment_terms, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [enquiryId, req.user.id, total_price, delivery_days, warranty_period, payment_terms, notes]
    );

    const quotation = result.rows[0];

    // Notify buyer about new quotation (synchronous - no queues)
    notifyBuyerNewQuotation(enquiry.buyer_id, enquiry.title, quotation).catch((err) => {
      console.error('Failed to notify buyer:', err);
      // Don't fail the request if notification fails
    });

    res.status(201).json({ message: 'Quotation submitted successfully', quotation });
  } catch (error) {
    // Handle unique constraint violation (duplicate quote)
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Quotation already submitted for this enquiry' });
    }
    console.error('Create quotation error:', error);
    res.status(500).json({ error: 'Failed to submit quotation' });
  }
};

// GET /api/my-quotations (Seller only - STRICT ISOLATION)
export const getMyQuotations = async (req, res) => {
  try {
    // Enforce pagination limits (max 20)
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 20);
    const offset = (page - 1) * limit;

    // CRITICAL: Only show seller's own quotations - enforced at query level
    const result = await pool.query(
      `SELECT q.id, q.total_price, q.delivery_days, q.warranty_period, q.payment_terms, q.notes, q.status, q.created_at,
              e.id as enquiry_id, e.title as enquiry_title, e.city, e.state, e.budget_min, e.budget_max,
              u.name as buyer_name, u.company_name as buyer_company
       FROM quotations q
       JOIN enquiries e ON q.enquiry_id = e.id
       JOIN users u ON e.buyer_id = u.id
       WHERE q.seller_id = $1
       ORDER BY q.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM quotations WHERE seller_id = $1',
      [req.user.id]
    );

    res.json({
      quotations: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      },
    });
  } catch (error) {
    console.error('Get quotations error:', error);
    res.status(500).json({ error: 'Failed to fetch quotations' });
  }
};

// GET /api/enquiries/:id/quotations (Buyer only - see all quotes for their enquiry)
export const getEnquiryQuotations = async (req, res) => {
  try {
    const { id: enquiryId } = req.params;

    // Verify enquiry belongs to buyer
    const enquiryResult = await pool.query('SELECT buyer_id FROM enquiries WHERE id = $1', [enquiryId]);
    if (enquiryResult.rows.length === 0) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    if (enquiryResult.rows[0].buyer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all quotations for this enquiry (buyer can see all seller quotes)
    const result = await pool.query(
      `SELECT q.id, q.total_price, q.delivery_days, q.warranty_period, q.payment_terms, q.notes, q.status, q.created_at,
              u.name as seller_name, u.company_name as seller_company, u.city as seller_city
       FROM quotations q
       JOIN users u ON q.seller_id = u.id
       WHERE q.enquiry_id = $1
       ORDER BY q.created_at ASC`,
      [enquiryId]
    );

    res.json({ quotations: result.rows });
  } catch (error) {
    console.error('Get quotations error:', error);
    res.status(500).json({ error: 'Failed to fetch quotations' });
  }
};

