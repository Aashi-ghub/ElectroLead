import { describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import request from 'supertest';
import { truncateAll } from './helpers/db.js';
import { createTestBuyer, createTestSeller, createTestAdmin, getAuthHeader } from './helpers/auth.js';
import { createTestEnquiry } from './helpers/factories.js';
import { createTestApp } from './helpers/app.js';

let app;
beforeAll(async () => {
  app = await createTestApp();
});

describe('Role & Authorization Tests', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  describe('Buyer Access Control', () => {
    it('should allow buyer to access buyer routes', async () => {
      const { user: buyer, token } = await createTestBuyer();

      const response = await request(app)
        .get('/api/enquiries/my-enquiries')
        .set(getAuthHeader(token));

      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });

    it('should block buyer from accessing seller routes', async () => {
      const { token } = await createTestBuyer();

      const response = await request(app)
        .get('/api/enquiries?city=Mumbai')
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('permissions');
    });

    it('should block buyer from accessing admin routes', async () => {
      const { token } = await createTestBuyer();

      const response = await request(app)
        .get('/admin/users')
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
    });

    it('should block buyer from creating quotations', async () => {
      const { user: buyer, token } = await createTestBuyer();
      const { user: seller } = await createTestSeller();
      const enquiry = await createTestEnquiry(buyer.id);

      const response = await request(app)
        .post(`/api/enquiries/${enquiry.id}/quote`)
        .set(getAuthHeader(token))
        .send({
          total_price: 10000,
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Seller Access Control', () => {
    it('should allow seller to access seller routes', async () => {
      const { token } = await createTestSeller();
      const { createTestSubscription } = await import('./helpers/factories.js');
      const { user: seller } = await createTestSeller();
      await createTestSubscription(seller.id);

      const response = await request(app)
        .get('/api/enquiries?city=Mumbai')
        .set(getAuthHeader(token));

      // May require subscription, but should not be 403 for role
      expect(response.status).not.toBe(403);
    });

    it('should block seller from accessing buyer routes', async () => {
      const { token } = await createTestSeller();

      const response = await request(app)
        .get('/api/enquiries/my-enquiries')
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('permissions');
    });

    it('should block seller from creating enquiries', async () => {
      const { token } = await createTestSeller();

      const response = await request(app)
        .post('/api/enquiries')
        .set(getAuthHeader(token))
        .send({
          title: 'Test Enquiry',
          city: 'Mumbai',
        });

      expect(response.status).toBe(403);
    });

    it('should block seller from accessing admin routes', async () => {
      const { token } = await createTestSeller();

      const response = await request(app)
        .get('/admin/users')
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
    });
  });

  describe('Admin Access Control', () => {
    it('should allow admin to access admin routes', async () => {
      const { token } = await createTestAdmin();

      const response = await request(app)
        .get('/admin/users')
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
    });

    it('should allow admin to access all user data', async () => {
      const { token } = await createTestAdmin();
      await createTestBuyer();
      await createTestSeller();

      const response = await request(app)
        .get('/admin/users')
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body.users.length).toBeGreaterThan(0);
    });

    it('should block admin from creating enquiries (buyer only)', async () => {
      const { token } = await createTestAdmin();

      const response = await request(app)
        .post('/api/enquiries')
        .set(getAuthHeader(token))
        .send({
          title: 'Test Enquiry',
          city: 'Mumbai',
        });

      expect(response.status).toBe(403);
    });

    it('should block admin from creating quotations (seller only)', async () => {
      const { token } = await createTestAdmin();
      const { user: buyer } = await createTestBuyer();
      const enquiry = await createTestEnquiry(buyer.id);

      const response = await request(app)
        .post(`/api/enquiries/${enquiry.id}/quote`)
        .set(getAuthHeader(token))
        .send({
          total_price: 10000,
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Unauthenticated Access', () => {
    it('should block unauthenticated access to protected buyer routes', async () => {
      const response = await request(app)
        .get('/api/enquiries/my-enquiries');

      expect(response.status).toBe(401);
    });

    it('should block unauthenticated access to protected seller routes', async () => {
      const response = await request(app)
        .get('/api/enquiries?city=Mumbai');

      expect(response.status).toBe(401);
    });

    it('should block unauthenticated access to admin routes', async () => {
      const response = await request(app)
        .get('/admin/users');

      expect(response.status).toBe(401);
    });

    it('should block unauthenticated access to profile routes', async () => {
      const response = await request(app)
        .get('/api/profile');

      expect(response.status).toBe(401);
    });
  });

  describe('Invalid Token', () => {
    it('should reject invalid JWT token', async () => {
      const response = await request(app)
        .get('/api/enquiries/my-enquiries')
        .set({ Authorization: 'Bearer invalid-token' });

      expect(response.status).toBe(401);
    });

    it('should reject expired JWT token', async () => {
      const jwt = await import('jsonwebtoken');
      const expiredToken = jwt.default.sign(
        { userId: 'test-id' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/api/enquiries/my-enquiries')
        .set({ Authorization: `Bearer ${expiredToken}` });

      expect(response.status).toBe(401);
    });

    it('should reject token without Bearer prefix', async () => {
      const { token } = await createTestBuyer();

      const response = await request(app)
        .get('/api/enquiries/my-enquiries')
        .set({ Authorization: token });

      expect(response.status).toBe(401);
    });
  });

  describe('Inactive User', () => {
    it('should block inactive user from accessing routes', async () => {
      const { user, token } = await createTestBuyer({ is_active: false });

      const { testPool } = await import('./helpers/db.js');
      await testPool.query('UPDATE users SET is_active = false WHERE id = $1', [user.id]);

      const response = await request(app)
        .get('/api/enquiries/my-enquiries')
        .set(getAuthHeader(token));

      expect(response.status).toBe(401);
    });
  });
});
