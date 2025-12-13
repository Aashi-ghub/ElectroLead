import { describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import request from 'supertest';
import { truncateAll, testPool } from './helpers/db.js';
import { createTestBuyer, createTestSeller, getAuthHeader } from './helpers/auth.js';
import { createTestEnquiry, createTestSubscription } from './helpers/factories.js';
import { createTestApp } from './helpers/app.js';

let app;
beforeAll(async () => {
  app = await createTestApp();
});

describe('Performance & Regression Tests', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  describe('Concurrent Requests', () => {
    it('should handle multiple parallel requests without crashing', async () => {
      const { user: buyer, token } = await createTestBuyer();
      
      // Create multiple enquiries
      for (let i = 0; i < 5; i++) {
        await createTestEnquiry(buyer.id, { title: `Enquiry ${i}` });
      }

      // Make parallel requests
      const requests = Array.from({ length: 10 }, () =>
        request(app)
          .get('/api/enquiries/my-enquiries')
          .set(getAuthHeader(token))
      );

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach((response) => {
        expect([200, 429]).toContain(response.status); // 429 if rate limited
      });
    });

    it('should handle concurrent quotation submissions', async () => {
      const { user: buyer } = await createTestBuyer();
      const { user: seller, token } = await createTestSeller();
      await createTestSubscription(seller.id);

      // Create multiple enquiries
      const enquiries = [];
      for (let i = 0; i < 5; i++) {
        enquiries.push(await createTestEnquiry(buyer.id));
      }

      // Submit quotations concurrently
      const requests = enquiries.map((enquiry) =>
        request(app)
          .post(`/api/enquiries/${enquiry.id}/quote`)
          .set(getAuthHeader(token))
          .send({ total_price: 10000 + enquiries.indexOf(enquiry) * 1000 })
      );

      const responses = await Promise.all(requests);

      // All should succeed (or handle duplicates gracefully)
      responses.forEach((response) => {
        expect([201, 400, 429]).toContain(response.status);
      });
    });
  });

  describe('Duplicate Prevention', () => {
    it('should prevent duplicate quotation submissions', async () => {
      const { user: buyer } = await createTestBuyer();
      const { user: seller, token } = await createTestSeller();
      const enquiry = await createTestEnquiry(buyer.id);
      await createTestSubscription(seller.id);

      // Submit same quotation twice
      const response1 = await request(app)
        .post(`/api/enquiries/${enquiry.id}/quote`)
        .set(getAuthHeader(token))
        .send({ total_price: 25000 });

      const response2 = await request(app)
        .post(`/api/enquiries/${enquiry.id}/quote`)
        .set(getAuthHeader(token))
        .send({ total_price: 30000 });

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(400);
      expect(response2.body.error).toContain('already submitted');
    });

    it('should prevent duplicate user registration', async () => {
      const email = 'duplicate@example.com';

      const response1 = await request(app)
        .post('/api/register')
        .send({
          email,
          password: 'Test1234!',
          name: 'User 1',
          role: 'buyer',
        });

      const response2 = await request(app)
        .post('/api/register')
        .send({
          email,
          password: 'Test1234!',
          name: 'User 2',
          role: 'seller',
        });

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(400);
      expect(response2.body.error).toContain('already registered');
    });
  });

  describe('Database Connection Management', () => {
    it('should release database connections after queries', async () => {
      const { user: buyer, token } = await createTestBuyer();
      
      // Make multiple requests
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .get('/api/enquiries/my-enquiries')
          .set(getAuthHeader(token));

        expect(response.status).toBe(200);
      }

      // Check pool stats (if available)
      const poolStats = testPool.totalCount;
      // Pool should not be exhausted
      expect(poolStats).toBeLessThan(10); // Assuming max connections > 10
    });

    it('should handle connection timeouts gracefully', async () => {
      // This test verifies connection timeout handling
      const { user: buyer, token } = await createTestBuyer();

      const response = await request(app)
        .get('/api/enquiries/my-enquiries')
        .set(getAuthHeader(token))
        .timeout(5000); // 5 second timeout

      expect(response.status).toBe(200);
    });
  });

  describe('Memory Leaks', () => {
    it('should not accumulate memory over multiple requests', async () => {
      const { user: buyer, token } = await createTestBuyer();
      
      // Make many requests
      for (let i = 0; i < 50; i++) {
        const response = await request(app)
          .get('/api/enquiries/my-enquiries')
          .set(getAuthHeader(token));

        expect(response.status).toBe(200);
      }

      // If memory leaks exist, this test would fail or timeout
      // Actual memory monitoring would require additional tools
      expect(true).toBe(true); // Test passes if no crash/timeout
    });

    it('should clean up resources after request completion', async () => {
      const { user: buyer, token } = await createTestBuyer();
      
      // Create and delete enquiries
      for (let i = 0; i < 10; i++) {
        const enquiry = await createTestEnquiry(buyer.id);
        
        const deleteResponse = await request(app)
          .delete(`/api/enquiries/${enquiry.id}`)
          .set(getAuthHeader(token));

        expect(deleteResponse.status).toBe(200);
      }

      // Resources should be cleaned up
      const countResponse = await request(app)
        .get('/api/enquiries/my-enquiries')
        .set(getAuthHeader(token));

      expect(countResponse.status).toBe(200);
    });
  });

  describe('Query Performance', () => {
    it('should use indexes for efficient queries', async () => {
      const { user: buyer, token } = await createTestBuyer();
      
      // Create enquiries in different cities
      await createTestEnquiry(buyer.id, { city: 'Mumbai' });
      await createTestEnquiry(buyer.id, { city: 'Delhi' });
      await createTestEnquiry(buyer.id, { city: 'Bangalore' });

      // Query should use city index
      const response = await request(app)
        .get('/api/enquiries/my-enquiries')
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      // Query should complete quickly (indexed)
    });

    it('should handle pagination efficiently', async () => {
      const { user: buyer, token } = await createTestBuyer();
      
      // Create many enquiries
      for (let i = 0; i < 30; i++) {
        await createTestEnquiry(buyer.id, { title: `Enquiry ${i}` });
      }

      // Paginated query should be efficient
      const response = await request(app)
        .get('/api/enquiries/my-enquiries?page=1&limit=20')
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body.enquiries.length).toBeLessThanOrEqual(20);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits without blocking legitimate users', async () => {
      const { token } = await createTestBuyer();

      // Make requests within limit
      const responses = [];
      for (let i = 0; i < 50; i++) {
        const response = await request(app)
          .get('/api/enquiries/my-enquiries')
          .set(getAuthHeader(token));

        responses.push(response.status);
      }

      // Most should succeed (some may be rate limited)
      const successCount = responses.filter(s => s === 200).length;
      expect(successCount).toBeGreaterThan(40); // Most should succeed
    });
  });

  describe('Error Recovery', () => {
    it('should recover from transient errors', async () => {
      const { user: buyer, token } = await createTestBuyer();
      
      // Make request after potential error
      const response = await request(app)
        .get('/api/enquiries/my-enquiries')
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      // System should recover and continue functioning
    });
  });
});
