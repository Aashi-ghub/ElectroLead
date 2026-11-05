import pool from '../config/database.js';

// Same gate as messaging: you may only save a counterparty you have actually
// transacted with (they quoted on your enquiry, or you quoted on theirs).
// Without it, POST /api/saved would accept any user id and let a seller build
// a buyer list - or a buyer build a supplier list - without ever quoting.
async function hasRelationship(user, contactId) {
  const buyerId = user.role === 'buyer' ? user.id : contactId;
  const sellerId = user.role === 'seller' ? user.id : contactId;

  const result = await pool.query(
    `SELECT 1
       FROM enquiries e
       JOIN quotations q ON q.enquiry_id = e.id
      WHERE e.buyer_id = $1 AND q.seller_id = $2
      LIMIT 1`,
    [buyerId, sellerId]
  );

  return result.rows.length > 0;
}

// GET /api/saved
export const getSavedContacts = async (req, res) => {
  try {
    if (req.user.role !== 'buyer' && req.user.role !== 'seller') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // The stats subquery is keyed from the *owner's* side, so a buyer sees how
    // many of their enquiries this seller quoted on, and a seller sees how many
    // of this buyer's enquiries they quoted on.
    const statsClause =
      req.user.role === 'buyer'
        ? 'WHERE e.buyer_id = $1 AND q.seller_id = u.id'
        : 'WHERE q.seller_id = $1 AND e.buyer_id = u.id';

    const result = await pool.query(
      `SELECT s.contact_id AS id, s.note, s.created_at AS saved_at,
              u.name, u.company_name, u.city, u.state, u.email, u.phone, u.kyc_status,
              COALESCE(stats.deal_count, 0) AS deal_count,
              stats.last_interaction
         FROM saved_contacts s
         JOIN users u ON u.id = s.contact_id
         LEFT JOIN LATERAL (
           SELECT COUNT(*)::int AS deal_count, MAX(q.created_at) AS last_interaction
             FROM quotations q
             JOIN enquiries e ON e.id = q.enquiry_id
             ${statsClause}
         ) stats ON true
        WHERE s.owner_id = $1
        ORDER BY s.created_at DESC`,
      [req.user.id]
    );

    res.json({ contacts: result.rows });
  } catch (error) {
    console.error('getSavedContacts error:', error);
    res.status(500).json({ error: 'Failed to load saved contacts' });
  }
};

// POST /api/saved
export const saveContact = async (req, res) => {
  try {
    const { contact_id: contactId, note } = req.body;

    if (contactId === req.user.id) {
      return res.status(400).json({ error: 'You cannot save yourself' });
    }

    if (!(await hasRelationship(req.user, contactId))) {
      return res.status(403).json({ error: 'You can only save contacts you have quoted with' });
    }

    // Re-saving is idempotent rather than an error - the UI treats the action
    // as a toggle and a duplicate click should not surface a failure.
    const result = await pool.query(
      `INSERT INTO saved_contacts (owner_id, contact_id, note)
       VALUES ($1, $2, $3)
       ON CONFLICT (owner_id, contact_id)
       DO UPDATE SET note = COALESCE(EXCLUDED.note, saved_contacts.note)
       RETURNING contact_id AS id, note, created_at AS saved_at`,
      [req.user.id, contactId, note ?? null]
    );

    res.status(201).json({ contact: result.rows[0] });
  } catch (error) {
    console.error('saveContact error:', error);
    res.status(500).json({ error: 'Failed to save contact' });
  }
};

// DELETE /api/saved/:contactId
export const removeSavedContact = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM saved_contacts WHERE owner_id = $1 AND contact_id = $2 RETURNING contact_id',
      [req.user.id, req.params.contactId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Saved contact not found' });
    }

    res.json({ message: 'Removed from saved contacts' });
  } catch (error) {
    console.error('removeSavedContact error:', error);
    res.status(500).json({ error: 'Failed to remove saved contact' });
  }
};
