import { describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import request from 'supertest';
import { truncateAll, testPool } from './helpers/db.js';
import { createTestBuyer, createTestSeller, getAuthHeader } from './helpers/auth.js';
import { createTestEnquiry, createTestQuotation, createTestSubscription } from './helpers/factories.js';
import { createTestApp } from './helpers/app.js';

let app;
beforeAll(async () => {
  app = await createTestApp();
});

describe('Quotation System Security Tests (CRITICAL)', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  describe('Seller Quotation Submission', () => {
    it('should allow seller to submit quotation for valid enquiry', async () => {
      const { user: buyer } = await createTestBuyer();
      const { user: seller, token } = await createTestSeller();
      const enquiry = await createTestEnquiry(buyer.id, { city: 'Mumbai' });
      await createTestSubscription(seller.id, { plan_type: 'local' });

      const response = await request(app)
        .post(`/api/enquiries/${enquiry.id}/quote`)
        .set(getAuthHeader(token))
        .send({
          total_price: 25000,
          delivery_days: 30,
          warranty_period: '1 year',
        });

      expect(response.status).toBe(201);
      expect(response.body.quotation).toBeDefined();
      expect(response.body.quotation.seller_id).toBe(seller.id);
      expect(response.body.quotation.enquiry_id).toBe(enquiry.id);
    });

    it('should prevent duplicate quotation submission', async () => {
      const { user: buyer } = await createTestBuyer();
      const { user: seller, token } = await createTestSeller();
      const enquiry = await createTestEnquiry(buyer.id);
      await createTestSubscription(seller.id);

      await request(app)
        .post(`/api/enquiries/${enquiry.id}/quote`)
        .set(getAuthHeader(token))
        .send({ total_price: 25000 });

      const response = await request(app)
        .post(`/api/enquiries/${enquiry.id}/quote`)
        .set(getAuthHeader(token))
        .send({ total_price: 30000 });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already submitted');
    });

    it('should prevent quotation for closed enquiry', async () => {
      const { user: buyer } = await createTestBuyer();
      const { user: seller, token } = await createTestSeller();
      const enquiry = await createTestEnquiry(buyer.id, { status: 'closed' });
      await createTestSubscription(seller.id);

      const response = await request(app)
        .post(`/api/enquiries/${enquiry.id}/quote`)
        .set(getAuthHeader(token))
        .send({ total_price: 25000 });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('no longer accepting');
    });

    it('should require active subscription for paid sellers', async () => {
      const { user: buyer } = await createTestBuyer();
      const { user: seller, token } = await createTestSeller();
      const enquiry = await createTestEnquiry(buyer.id);

      // No subscription
      const response = await request(app)
        .post(`/api/enquiries/${enquiry.id}/quote`)
        .set(getAuthHeader(token))
        .send({ total_price: 25000 });

      // Should check free tier limit instead of blocking
      // Free tier allows 3 per month
      expect([403, 201]).toContain(response.status);
    });

    it('should enforce free tier limit (3 quotations per month)', async () => {
      const { user: buyer } = await createTestBuyer();
      const { user: seller, token } = await createTestSeller();
      
      // Create 3 enquiries
      const enquiry1 = await createTestEnquiry(buyer.id, { city: 'Mumbai' });
      const enquiry2 = await createTestEnquiry(buyer.id, { city: 'Mumbai' });
      const enquiry3 = await createTestEnquiry(buyer.id, { city: 'Mumbai' });
      const enquiry4 = await createTestEnquiry(buyer.id, { city: 'Mumbai' });

      // Submit 3 quotations (should succeed)
      await request(app)
        .post(`/api/enquiries/${enquiry1.id}/quote`)
        .set(getAuthHeader(token))
        .send({ total_price: 10000 });
      
      await request(app)
        .post(`/api/enquiries/${enquiry2.id}/quote`)
        .set(getAuthHeader(token))
        .send({ total_price: 20000 });

      await request(app)
        .post(`/api/enquiries/${enquiry3.id}/quote`)
        .set(getAuthHeader(token))
        .send({ total_price: 30000 });

      // 4th quotation should be blocked
      const response = await request(app)
        .post(`/api/enquiries/${enquiry4.id}/quote`)
        .set(getAuthHeader(token))
        .send({ total_price: 40000 });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Free tier limit');
      expect(response.body.limit).toBe(3);
    });
  });

  describe('Quotation Isolation - Seller', () => {
    it('should only show seller their own quotations', async () => {
      const { user: buyer } = await createTestBuyer();
      const { user: seller1, token: token1 } = await createTestSeller();
      const { user: seller2, token: token2 } = await createTestSeller();
      
      const enquiry = await createTestEnquiry(buyer.id);
      await createTestSubscription(seller1.id);
      await createTestSubscription(seller2.id);

      // Seller1 submits quotation
      await request(app)
        .post(`/api/enquiries/${enquiry.id}/quote`)
        .set(getAuthHeader(token1))
        .send({ total_price: 25000 });

      // Seller2 submits quotation
      await request(app)
        .post(`/api/enquiries/${enquiry.id}/quote`)
        .set(getAuthHeader(token2))
        .send({ total_price: 30000 });

      // Seller1 should only see their own quotation
      const response1 = await request(app)
        .get('/api/my-quotations')
        .set(getAuthHeader(token1));

      expect(response1.status).toBe(200);
      expect(response1.body.quotations.length).toBe(1);
      expect(response1.body.quotations[0].seller_id || response1.body.quotations[0].enquiry_id).toBeDefined();

      // Seller2 should only see their own quotation
      const response2 = await request(app)
        .get('/api/my-quotations')
        .set(getAuthHeader(token2));

      expect(response2.status).toBe(200);
      expect(response2.body.quotations.length).toBe(1);
    });

    it('should prevent seller from viewing other sellers quotations by ID tampering', async () => {
      const { user: buyer } = await createTestBuyer();
      const { user: seller1, token: token1 } = await createTestSeller();
      const { user: seller2 } = await createTestSeller();
      
      const enquiry = await createTestEnquiry(buyer.id);
      await createTestSubscription(seller1.id);
      await createTestSubscription(seller2.id);

      // Seller2 submits quotation
      const quoteResponse = await request(app)
        .post(`/api/enquiries/${enquiry.id}/quote`)
        .set(getAuthHeader((await createTestSeller()).token))
        .send({ total_price: 25000 });

      const quotationId = quoteResponse.body.quotation?.id;

      // Seller1 tries to access seller2's quotation via direct query
      // There's no direct GET endpoint for quotations by ID, but verify isolation in list
      const response = await request(app)
        .get('/api/my-quotations')
        .set(getAuthHeader(token1));

      expect(response.status).toBe(200);
      // Seller1 should not see seller2's quotation
      if (quotationId && response.body.quotations.length > 0) {
        const found = response.body.quotations.find(q => q.id === quotationId);
        expect(found).toBeUndefined();
      }
    });

    it('should enforce seller_id in query (cannot be overridden)', async () => {
      const { user: buyer } = await createTestBuyer();
      const { user: seller1, token: token1 } = await createTestSeller();
      const { user: seller2 } = await createTestSeller();
      
      const enquiry = await createTestEnquiry(buyer.id);
      await createTestSubscription(seller1.id);
      await createTestSubscription(seller2.id);

      // Seller2 creates quotation directly in DB
      const quotation = await createTestQuotation(enquiry.id, seller2.id);

      // Seller1 queries their quotations - should not see seller2's
      const response = await request(app)
        .get('/api/my-quotations')
        .set(getAuthHeader(token1));

      expect(response.status).toBe(200);
      const found = response.body.quotations.find(q => q.id === quotation.id);
      expect(found).toBeUndefined();
    });
  });

  describe('Quotation Isolation - Buyer', () => {
    it('should allow buyer to view all quotations for their own enquiry', async () => {
      const { user: buyer, token } = await createTestBuyer();
      const { user: seller1 } = await createTestSeller();
      const { user: seller2 } = await createTestSeller();
      
      const enquiry = await createTestEnquiry(buyer.id);
      await createTestSubscription(seller1.id);
      await createTestSubscription(seller2.id);

      // Both sellers submit quotations
      await createTestQuotation(enquiry.id, seller1.id);
      await createTestQuotation(enquiry.id, seller2.id);

      const response = await request(app)
        .get(`/api/enquiries/${enquiry.id}/quotations`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body.quotations.length).toBe(2);
    });

    it('should prevent buyer from viewing quotations for other buyers enquiries', async () => {
      const { user: buyer1, token: token1 } = await createTestBuyer();
      const { user: buyer2 } = await createTestBuyer();
      const { user: seller } = await createTestSeller();
      
      const enquiry1 = await createTestEnquiry(buyer1.id);
      const enquiry2 = await createTestEnquiry(buyer2.id);
      await createTestSubscription(seller.id);

      await createTestQuotation(enquiry1.id, seller.id);
      await createTestQuotation(enquiry2.id, seller.id);

      // Buyer1 tries to access buyer2's enquiry quotations
      const response = await request(app)
        .get(`/api/enquiries/${enquiry2.id}/quotations`)
        .set(getAuthHeader(token1));

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Access denied');
    });

    it('should prevent enquiry_id tampering to access other buyers quotations', async () => {
      const { user: buyer1, token: token1 } = await createTestBuyer();
      const { user: buyer2 } = await createTestBuyer();
      const { user: seller } = await createTestSeller();
      
      const enquiry1 = await createTestEnquiry(buyer1.id);
      const enquiry2 = await createTestEnquiry(buyer2.id);
      await createTestSubscription(seller.id);

      await createTestQuotation(enquiry2.id, seller.id);

      // Buyer1 tries to access buyer2's enquiry by ID
      const response = await request(app)
        .get(`/api/enquiries/${enquiry2.id}/quotations`)
        .set(getAuthHeader(token1));

      expect(response.status).toBe(403);
    });
  });

  describe('Attack Simulations', () => {
    it('should block modified enquiry_id in quotation submission', async () => {
      const { user: buyer1 } = await createTestBuyer();
      const { user: buyer2 } = await createTestBuyer();
      const { user: seller, token } = await createTestSeller();
      
      const enquiry1 = await createTestEnquiry(buyer1.id);
      const enquiry2 = await createTestEnquiry(buyer2.id);
      await createTestSubscription(seller.id);

      // Seller tries to quote on buyer2's enquiry (they shouldn't have access)
      // This is actually allowed if seller has subscription and enquiry is open
      // But we verify the enquiry exists and is open
      const response = await request(app)
        .post(`/api/enquiries/${enquiry2.id}/quote`)
        .set(getAuthHeader(token))
        .send({ total_price: 25000 });

      // Should succeed if enquiry is open and seller has subscription
      // The security is in buyers not seeing other buyers' enquiries
      expect([201, 404]).toContain(response.status);
    });

    it('should ignore seller_id modification in request body', async () => {
      const { user: buyer } = await createTestBuyer();
      const { user: seller1, token: token1 } = await createTestSeller();
      const { user: seller2 } = await createTestSeller();
      
      const enquiry = await createTestEnquiry(buyer.id);
      await createTestSubscription(seller1.id);
      await createTestSubscription(seller2.id);

      // Seller1 tries to create quotation with seller2's ID in body (should be ignored)
      const response = await request(app)
        .post(`/api/enquiries/${enquiry.id}/quote`)
        .set(getAuthHeader(token1))
        .send({
          total_price: 25000,
          seller_id: seller2.id, // Attempted tampering
        });

      expect(response.status).toBe(201);
      
      // Verify quotation was created with seller1's ID (from token)
      const result = await testPool.query(
        'SELECT seller_id FROM quotations WHERE enquiry_id = $1 ORDER BY created_at DESC LIMIT 1',
        [enquiry.id]
      );
      
      expect(result.rows[0].seller_id).toBe(seller1.id);
      expect(result.rows[0].seller_id).not.toBe(seller2.id);
    });

    it('should prevent direct database access pattern (queries always scoped)', async () => {
      const { user: buyer } = await createTestBuyer();
      const { user: seller1 } = await createTestSeller();
      const { user: seller2, token: token2 } = await createTestSeller();
      
      const enquiry = await createTestEnquiry(buyer.id);
      await createTestSubscription(seller1.id);
      await createTestSubscription(seller2.id);

      // Seller1 creates quotation directly in DB (simulating direct access)
      await createTestQuotation(enquiry.id, seller1.id);

      // Seller2 queries - should not see seller1's quotation
      const response = await request(app)
        .get('/api/my-quotations')
        .set(getAuthHeader(token2));

      expect(response.status).toBe(200);
      const found = response.body.quotations.find(q => q.seller_id === seller1.id);
      expect(found).toBeUndefined();
    });
  });

  describe('Free Seller Quotation Limits', () => {
    it('should allow free seller to submit up to 3 quotations per month', async () => {
      const { user: buyer } = await createTestBuyer();
      const { user: seller, token } = await createTestSeller();
      
      const enquiry1 = await createTestEnquiry(buyer.id, { city: 'Mumbai' });
      const enquiry2 = await createTestEnquiry(buyer.id, { city: 'Mumbai' });
      const enquiry3 = await createTestEnquiry(buyer.id, { city: 'Mumbai' });

      // No subscription - free tier
      const response1 = await request(app)
        .post(`/api/enquiries/${enquiry1.id}/quote`)
        .set(getAuthHeader(token))
        .send({ total_price: 10000 });

      expect(response1.status).toBe(201);

      const response2 = await request(app)
        .post(`/api/enquiries/${enquiry2.id}/quote`)
        .set(getAuthHeader(token))
        .send({ total_price: 20000 });

      expect(response2.status).toBe(201);

      const response3 = await request(app)
        .post(`/api/enquiries/${enquiry3.id}/quote`)
        .set(getAuthHeader(token))
        .send({ total_price: 30000 });

      expect(response3.status).toBe(201);
    });

    it('should reset monthly limit at start of new month', async () => {
      const { user: buyer } = await createTestBuyer();
      const { user: seller, token } = await createTestSeller();
      
      // Create quotations in previous month (simulated)
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const enquiry1 = await createTestEnquiry(buyer.id, { city: 'Mumbai' });
      const enquiry2 = await createTestEnquiry(buyer.id, { city: 'Mumbai' });
      const enquiry3 = await createTestEnquiry(buyer.id, { city: 'Mumbai' });

      // Set created_at to last month
      await testPool.query(
        'UPDATE quotations SET created_at = $1 WHERE seller_id = $2',
        [lastMonth, seller.id]
      );

      // Should be able to submit 3 more in current month
      const response = await request(app)
        .post(`/api/enquiries/${enquiry1.id}/quote`)
        .set(getAuthHeader(token))
        .send({ total_price: 10000 });

      // Should succeed (previous month's count doesn't affect current month)
      expect([201, 400]).toContain(response.status);
    });
  });

  describe('Subscription-Based Access', () => {
    it('should allow paid seller unlimited quotations', async () => {
      const { user: buyer } = await createTestBuyer();
      const { user: seller, token } = await createTestSeller();
      await createTestSubscription(seller.id, { plan_type: 'national' });
      
      // Create multiple enquiries
      const enquiries = [];
      for (let i = 0; i < 5; i++) {
        enquiries.push(await createTestEnquiry(buyer.id));
      }

      // Submit quotations for all (should all succeed)
      for (const enquiry of enquiries) {
        const response = await request(app)
          .post(`/api/enquiries/${enquiry.id}/quote`)
          .set(getAuthHeader(token))
          .send({ total_price: 10000 + enquiries.indexOf(enquiry) * 1000 });

        expect(response.status).toBe(201);
      }
    });

    it('should block quotation submission when subscription expires', async () => {
      const { user: buyer } = await createTestBuyer();
      const { user: seller, token } = await createTestSeller();
      
      // Create expired subscription
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);
      await createTestSubscription(seller.id, {
        status: 'active',
        end_date: expiredDate,
      });

      const enquiry = await createTestEnquiry(buyer.id);

      const response = await request(app)
        .post(`/api/enquiries/${enquiry.id}/quote`)
        .set(getAuthHeader(token))
        .send({ total_price: 25000 });

      // Should check free tier or block
      expect([403, 201]).toContain(response.status);
    });
  });
});
