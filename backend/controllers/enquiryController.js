import pool from '../config/database.js';
import { notifySellersNewEnquiry } from '../utils/notifications.js';

// POST /api/enquiries (Buyer only)
export const createEnquiry = async (req, res) => {
  try {
    const {
      title,
      description,
      city,
      state,
      budget_min,
      budget_max,
      quote_deadline,
      project_start_date,
      delivery_date,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO enquiries (buyer_id, title, description, city, state, budget_min, budget_max, quote_deadline, project_start_date, delivery_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [req.user.id, title, description, city, state, budget_min, budget_max, quote_deadline, project_start_date, delivery_date]
    );

    const enquiry = result.rows[0];

    // Notify sellers about new enquiry (synchronous - no queues)
    notifySellersNewEnquiry(enquiry).catch((err) => {
      console.error('Failed to notify sellers:', err);
      // Don't fail the request if notification fails
    });

    res.status(201).json({ message: 'Enquiry created successfully', enquiry });
  } catch (error) {
    console.error('Create enquiry error:', error);
    res.status(500).json({ error: 'Failed to create enquiry' });
  }
};

// GET /api/enquiries/my-enquiries (Buyer only)
export const getMyEnquiries = async (req, res) => {
  try {
    // Enforce pagination limits (max 20)
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 20);
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT id, title, city, state, budget_min, budget_max, status, created_at,
              (SELECT COUNT(*) FROM quotations WHERE enquiry_id = enquiries.id) as quote_count
       FROM enquiries
       WHERE buyer_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM enquiries WHERE buyer_id = $1', [req.user.id]);

    res.json({
      enquiries: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      },
    });
  } catch (error) {
    console.error('Get enquiries error:', error);
    res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
};

// DELETE /api/enquiries/:id (Buyer only)
export const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify enquiry belongs to buyer
    const enquiryResult = await pool.query('SELECT buyer_id, status FROM enquiries WHERE id = $1', [id]);
    if (enquiryResult.rows.length === 0) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    if (enquiryResult.rows[0].buyer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.query('DELETE FROM enquiries WHERE id = $1', [id]);

    res.json({ message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error('Delete enquiry error:', error);
    res.status(500).json({ error: 'Failed to delete enquiry' });
  }
};



