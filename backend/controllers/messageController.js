import pool from '../config/database.js';

// A buyer and a seller may only exchange messages about an enquiry once that
// seller has quoted on it - the quotation is what establishes the relationship.
// Without this check the endpoint would let either side address any user id,
// turning the marketplace into a contact directory anyone can spam.
// Returns { buyerId, sellerId } when the pairing is legitimate, else null.
async function resolveCounterparty(enquiryId, user, contactId) {
  const buyerId = user.role === 'buyer' ? user.id : contactId;
  const sellerId = user.role === 'seller' ? user.id : contactId;

  const result = await pool.query(
    `SELECT 1
       FROM enquiries e
       JOIN quotations q ON q.enquiry_id = e.id
      WHERE e.id = $1 AND e.buyer_id = $2 AND q.seller_id = $3`,
    [enquiryId, buyerId, sellerId]
  );

  return result.rows.length > 0 ? { buyerId, sellerId } : null;
}

// Conversations are derived from quote relationships rather than from the
// messages table, so a thread exists (and is openable) the moment a quote
// lands - before either side has said anything.
const CONVERSATION_COLUMNS = `
  e.id AS enquiry_id, e.title AS enquiry_title, e.status AS enquiry_status,
  u.id AS contact_id, u.name AS contact_name, u.company_name AS contact_company,
  u.city AS contact_city, u.state AS contact_state,
  lm.body AS last_message, lm.created_at AS last_message_at, lm.sender_id AS last_message_sender_id,
  COALESCE(un.cnt, 0) AS unread_count
`;

// GET /api/messages/conversations
export const getConversations = async (req, res) => {
  try {
    if (req.user.role !== 'buyer' && req.user.role !== 'seller') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const query =
      req.user.role === 'buyer'
        ? `SELECT ${CONVERSATION_COLUMNS}
             FROM enquiries e
             JOIN quotations q ON q.enquiry_id = e.id
             JOIN users u ON u.id = q.seller_id
             LEFT JOIN LATERAL (
               SELECT m.body, m.created_at, m.sender_id
                 FROM messages m
                WHERE m.enquiry_id = e.id
                  AND (m.sender_id, m.recipient_id) IN ((e.buyer_id, u.id), (u.id, e.buyer_id))
                ORDER BY m.created_at DESC
                LIMIT 1
             ) lm ON true
             LEFT JOIN LATERAL (
               SELECT COUNT(*)::int AS cnt
                 FROM messages m
                WHERE m.enquiry_id = e.id
                  AND m.sender_id = u.id AND m.recipient_id = e.buyer_id
                  AND m.read_at IS NULL
             ) un ON true
            WHERE e.buyer_id = $1
            ORDER BY COALESCE(lm.created_at, q.created_at) DESC`
        : `SELECT ${CONVERSATION_COLUMNS}
             FROM quotations q
             JOIN enquiries e ON e.id = q.enquiry_id
             JOIN users u ON u.id = e.buyer_id
             LEFT JOIN LATERAL (
               SELECT m.body, m.created_at, m.sender_id
                 FROM messages m
                WHERE m.enquiry_id = e.id
                  AND (m.sender_id, m.recipient_id) IN ((q.seller_id, u.id), (u.id, q.seller_id))
                ORDER BY m.created_at DESC
                LIMIT 1
             ) lm ON true
             LEFT JOIN LATERAL (
               SELECT COUNT(*)::int AS cnt
                 FROM messages m
                WHERE m.enquiry_id = e.id
                  AND m.sender_id = u.id AND m.recipient_id = q.seller_id
                  AND m.read_at IS NULL
             ) un ON true
            WHERE q.seller_id = $1
            ORDER BY COALESCE(lm.created_at, q.created_at) DESC`;

    const result = await pool.query(query, [req.user.id]);
    res.json({ conversations: result.rows });
  } catch (error) {
    console.error('getConversations error:', error);
    res.status(500).json({ error: 'Failed to load conversations' });
  }
};

// GET /api/messages/thread?enquiry_id=...&contact_id=...
export const getThread = async (req, res) => {
  try {
    const { enquiry_id: enquiryId, contact_id: contactId } = req.query;

    if (!enquiryId || !contactId) {
      return res.status(400).json({ error: 'enquiry_id and contact_id are required' });
    }

    const pairing = await resolveCounterparty(enquiryId, req.user, contactId);
    if (!pairing) {
      return res.status(403).json({ error: 'No conversation exists for this enquiry' });
    }

    // Opening the thread is what marks it read - do it before the select so the
    // returned rows already carry the new state.
    await pool.query(
      `UPDATE messages
          SET read_at = CURRENT_TIMESTAMP
        WHERE enquiry_id = $1 AND sender_id = $2 AND recipient_id = $3 AND read_at IS NULL`,
      [enquiryId, contactId, req.user.id]
    );

    const messages = await pool.query(
      `SELECT id, sender_id, recipient_id, body, read_at, created_at
         FROM messages
        WHERE enquiry_id = $1
          AND (sender_id, recipient_id) IN (($2, $3), ($3, $2))
        ORDER BY created_at ASC`,
      [enquiryId, req.user.id, contactId]
    );

    const context = await pool.query(
      `SELECT e.title AS enquiry_title, e.status AS enquiry_status,
              u.name AS contact_name, u.company_name AS contact_company
         FROM enquiries e, users u
        WHERE e.id = $1 AND u.id = $2`,
      [enquiryId, contactId]
    );

    res.json({
      messages: messages.rows,
      ...(context.rows[0] ?? {}),
    });
  } catch (error) {
    console.error('getThread error:', error);
    res.status(500).json({ error: 'Failed to load conversation' });
  }
};

// POST /api/messages
export const sendMessage = async (req, res) => {
  try {
    const { enquiry_id: enquiryId, contact_id: contactId, body } = req.body;

    const pairing = await resolveCounterparty(enquiryId, req.user, contactId);
    if (!pairing) {
      return res.status(403).json({ error: 'No conversation exists for this enquiry' });
    }

    const result = await pool.query(
      `INSERT INTO messages (enquiry_id, sender_id, recipient_id, body)
       VALUES ($1, $2, $3, $4)
       RETURNING id, sender_id, recipient_id, body, read_at, created_at`,
      [enquiryId, req.user.id, contactId, body]
    );

    res.status(201).json({ message: result.rows[0] });
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// GET /api/messages/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*)::int AS cnt FROM messages WHERE recipient_id = $1 AND read_at IS NULL',
      [req.user.id]
    );
    res.json({ unread: result.rows[0].cnt });
  } catch (error) {
    console.error('getUnreadCount error:', error);
    res.status(500).json({ error: 'Failed to load unread count' });
  }
};
