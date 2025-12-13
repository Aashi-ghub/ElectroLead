import pool from '../config/database.js';
import razorpay from '../config/razorpay.js';

// POST /api/subscriptions/create-order (Seller only)
export const createSubscriptionOrder = async (req, res) => {
  try {
    const { plan_type } = req.body;

    if (!['local', 'state', 'national'].includes(plan_type)) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    const amount = 99900; // ₹999 in paise

    // Create Razorpay order
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `sub_${req.user.id}_${Date.now()}`,
      notes: {
        user_id: req.user.id,
        plan_type: plan_type,
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// POST /api/subscriptions/verify (Seller only)
export const verifySubscription = async (req, res) => {
  try {
    const { order_id, payment_id, plan_type } = req.body;

    if (!['local', 'state', 'national'].includes(plan_type)) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    // Verify payment with Razorpay
    const payment = await razorpay.payments.fetch(payment_id);

    if (payment.status !== 'captured') {
      return res.status(400).json({ error: 'Payment not captured' });
    }

    // Verify order matches
    if (payment.order_id !== order_id) {
      return res.status(400).json({ error: 'Order mismatch' });
    }

    // Calculate dates (30 days subscription - no auto-renew)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // Create subscription
    const result = await pool.query(
      `INSERT INTO subscriptions (user_id, plan_type, amount_paid, razorpay_payment_id, razorpay_order_id, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, plan_type, 999.00, payment_id, order_id, startDate, endDate]
    );

    res.json({
      message: 'Subscription activated successfully',
      subscription: result.rows[0],
    });
  } catch (error) {
    console.error('Verify subscription error:', error);
    res.status(500).json({ error: 'Failed to verify subscription' });
  }
};
