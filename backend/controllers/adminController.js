import pool from '../config/database.js';
import { notifyKycStatusChange } from '../utils/notifications.js';

// GET /admin/users
export const getUsers = async (req, res) => {
  try {
    // Enforce pagination limits (max 20)
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 20);
    const offset = (page - 1) * limit;
    const role = req.query.role;

    let query = `
      SELECT id, email, name, role, city, state, company_name, kyc_status, is_active, created_at
      FROM users
      WHERE role != 'admin'
    `;
    const params = [];
    let paramCount = 1;

    if (role) {
      query += ` AND role = $${paramCount++}`;
      params.push(role);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    const countQuery = `SELECT COUNT(*) FROM users WHERE role != 'admin'${role ? ` AND role = $1` : ''}`;
    const countResult = await pool.query(countQuery, role ? [role] : []);

    res.json({
      users: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// POST /admin/users/:id/approve-kyc
export const approveKyc = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const kycStatus = action === 'approve' ? 'approved' : 'rejected';

    const result = await pool.query(
      'UPDATE users SET kyc_status = $1 WHERE id = $2 RETURNING *',
      [kycStatus, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Send email notification (synchronous - no queues)
    notifyKycStatusChange(user.id, kycStatus).catch((err) => {
      console.error('Failed to send KYC notification:', err);
      // Don't fail the request if notification fails
    });

    res.json({
      message: `KYC ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Approve KYC error:', error);
    res.status(500).json({ error: 'Failed to update KYC status' });
  }
};

// GET /admin/enquiries
export const getAdminEnquiries = async (req, res) => {
  try {
    // Enforce pagination limits (max 20)
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 20);
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT e.id, e.title, e.city, e.state, e.status, e.created_at,
              u.name as buyer_name, u.email as buyer_email,
              (SELECT COUNT(*) FROM quotations WHERE enquiry_id = e.id) as quote_count
       FROM enquiries e
       JOIN users u ON e.buyer_id = u.id
       ORDER BY e.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM enquiries');

    res.json({
      enquiries: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit),
      },
    });
  } catch (error) {
    console.error('Get admin enquiries error:', error);
    res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
};

// POST /admin/users/:id/suspend
export const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'suspend' or 'activate'

    const isActive = action === 'activate';

    const result = await pool.query(
      'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING *',
      [isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: `User ${action === 'suspend' ? 'suspended' : 'activated'} successfully`,
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// GET /admin/subscriptions
export const getSubscriptions = async (req, res) => {
  try {
    // Enforce pagination limits (max 20)
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 20);
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT s.id, s.plan_type, s.amount_paid, s.status, s.start_date, s.end_date, s.created_at,
              u.id as user_id, u.name as user_name, u.email, u.role
       FROM subscriptions s
       JOIN users u ON s.user_id = u.id
       ORDER BY s.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM subscriptions');

    res.json({
      subscriptions: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      },
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
};
