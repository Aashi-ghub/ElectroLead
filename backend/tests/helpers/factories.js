import { testPool } from './db.js';
import { createTestUser } from './auth.js';

/**
 * Create a test enquiry
 */
export const createTestEnquiry = async (buyerId, enquiryData = {}) => {
  // Verify buyer exists
  const buyerCheck = await testPool.query('SELECT id FROM users WHERE id = $1', [buyerId]);
  if (buyerCheck.rows.length === 0) {
    throw new Error(`Buyer with id ${buyerId} does not exist`);
  }

  const {
    title = 'Test Enquiry',
    description = 'Test description',
    city = 'Mumbai',
    state = 'Maharashtra',
    budget_min = 10000,
    budget_max = 50000,
    status = 'open',
  } = enquiryData;

  const result = await testPool.query(
    `INSERT INTO enquiries (buyer_id, title, description, city, state, budget_min, budget_max, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [buyerId, title, description, city, state, budget_min, budget_max, status]
  );

  return result.rows[0];
};

/**
 * Create a test quotation
 */
export const createTestQuotation = async (enquiryId, sellerId, quotationData = {}) => {
  // Verify enquiry and seller exist
  const enquiryCheck = await testPool.query('SELECT id FROM enquiries WHERE id = $1', [enquiryId]);
  if (enquiryCheck.rows.length === 0) {
    throw new Error(`Enquiry with id ${enquiryId} does not exist`);
  }
  
  const sellerCheck = await testPool.query('SELECT id FROM users WHERE id = $1', [sellerId]);
  if (sellerCheck.rows.length === 0) {
    throw new Error(`Seller with id ${sellerId} does not exist`);
  }

  const {
    total_price = 30000,
    delivery_days = 30,
    warranty_period = '1 year',
    payment_terms = '50% advance, 50% on delivery',
    notes = 'Test quotation notes',
    status = 'submitted',
  } = quotationData;

  const result = await testPool.query(
    `INSERT INTO quotations (enquiry_id, seller_id, total_price, delivery_days, warranty_period, payment_terms, notes, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [enquiryId, sellerId, total_price, delivery_days, warranty_period, payment_terms, notes, status]
  );

  return result.rows[0];
};

/**
 * Create a test subscription
 */
export const createTestSubscription = async (userId, subscriptionData = {}) => {
  const {
    plan_type = 'local',
    amount_paid = 999.00,
    status = 'active',
    start_date = new Date(),
    end_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  } = subscriptionData;

  const result = await testPool.query(
    `INSERT INTO subscriptions (user_id, plan_type, amount_paid, status, start_date, end_date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, plan_type, amount_paid, status, start_date, end_date]
  );

  return result.rows[0];
};

/**
 * Create a complete test scenario: buyer + enquiry
 */
export const createBuyerWithEnquiry = async (enquiryData = {}) => {
  const { user: buyer, token } = await createTestUser({ role: 'buyer' });
  const enquiry = await createTestEnquiry(buyer.id, enquiryData);
  return { buyer, token, enquiry };
};

/**
 * Create a complete test scenario: seller + subscription
 */
export const createSellerWithSubscription = async (subscriptionData = {}) => {
  const { user: seller, token } = await createTestUser({ role: 'seller' });
  const subscription = await createTestSubscription(seller.id, subscriptionData);
  return { seller, token, subscription };
};

/**
 * Create a complete test scenario: buyer enquiry + seller quotation
 */
export const createEnquiryWithQuotation = async () => {
  const { buyer, enquiry } = await createBuyerWithEnquiry();
  const { user: seller, token: sellerToken } = await createTestUser({ role: 'seller' });
  const subscription = await createTestSubscription(seller.id);
  const quotation = await createTestQuotation(enquiry.id, seller.id);
  
  return {
    buyer,
    seller,
    enquiry,
    quotation,
    subscription,
    sellerToken,
  };
};
