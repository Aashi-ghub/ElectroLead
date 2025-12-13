import { describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import request from 'supertest';
import { truncateAll } from './helpers/db.js';
import { createTestBuyer, createTestSeller, getAuthHeader } from './helpers/auth.js';
import { createTestEnquiry } from './helpers/factories.js';
import { createTestApp } from './helpers/app.js';

let app;
beforeAll(async () => {
  app = await createTestApp();
});

describe('Enquiry API Tests (Buyer)', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  describe('Create Enquiry', () => {
    it('should create enquiry with valid payload', async () => {
      const { user: buyer, token } = await createTestBuyer();

      const response = await request(app)
        .post('/api/enquiries')
        .set(getAuthHeader(token))
        .send({
          title: 'Need Electrical Components',
          description: 'Looking for quality electrical components',
          city: 'Mumbai',
          state: 'Maharashtra',
          budget_min: 10000,
          budget_max: 50000,
        });

      expect(response.status).toBe(201);
      expect(response.body.enquiry).toBeDefined();
      expect(response.body.enquiry.buyer_id).toBe(buyer.id);
      expect(response.body.enquiry.title).toBe('Need Electrical Components');
    });

    it('should reject enquiry with missing required fields', async () => {
      const { token } = await createTestBuyer();

      const response = await request(app)
        .post('/api/enquiries')
        .set(getAuthHeader(token))
        .send({
          description: 'Missing title and city',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject enquiry with invalid city (too long)', async () => {
      const { token } = await createTestBuyer();

      const response = await request(app)
        .post('/api/enquiries')
        .set(getAuthHeader(token))
        .send({
          title: 'Test Enquiry',
          city: 'A'.repeat(101), // Exceeds VARCHAR(100)
        });

      expect(response.status).toBe(400);
    });

    it('should reject enquiry with negative budget', async () => {
      const { token } = await createTestBuyer();

      const response = await request(app)
        .post('/api/enquiries')
        .set(getAuthHeader(token))
        .send({
          title: 'Test Enquiry',
          city: 'Mumbai',
          budget_min: -1000,
        });

      expect(response.status).toBe(400);
    });

    it('should reject enquiry where budget_max < budget_min', async () => {
      const { token } = await createTestBuyer();

      const response = await request(app)
        .post('/api/enquiries')
        .set(getAuthHeader(token))
        .send({
          title: 'Test Enquiry',
          city: 'Mumbai',
          budget_min: 50000,
          budget_max: 10000,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Get My Enquiries', () => {
    it('should return only buyer own enquiries', async () => {
      const { user: buyer1, token: token1 } = await createTestBuyer();
      const { user: buyer2 } = await createTestBuyer();

      await createTestEnquiry(buyer1.id, { title: 'Buyer1 Enquiry' });
      await createTestEnquiry(buyer1.id, { title: 'Buyer1 Enquiry 2' });
      await createTestEnquiry(buyer2.id, { title: 'Buyer2 Enquiry' });

      const response = await request(app)
        .get('/api/enquiries/my-enquiries')
        .set(getAuthHeader(token1));

      expect(response.status).toBe(200);
      expect(response.body.enquiries.length).toBe(2);
      response.body.enquiries.forEach((enquiry) => {
        expect(enquiry.buyer_id || enquiry.title).toBeDefined();
      });
    });

    it('should enforce pagination limits (max 20)', async () => {
      const { user: buyer, token } = await createTestBuyer();

      // Create 25 enquiries
      for (let i = 0; i < 25; i++) {
        await createTestEnquiry(buyer.id, { title: `Enquiry ${i}` });
      }

      const response = await request(app)
        .get('/api/enquiries/my-enquiries?limit=50')
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body.enquiries.length).toBeLessThanOrEqual(20);
      expect(response.body.pagination.limit).toBeLessThanOrEqual(20);
    });

    it('should support pagination', async () => {
      const { user: buyer, token } = await createTestBuyer();

      // Create 15 enquiries
      for (let i = 0; i < 15; i++) {
        await createTestEnquiry(buyer.id, { title: `Enquiry ${i}` });
      }

      const page1 = await request(app)
        .get('/api/enquiries/my-enquiries?page=1&limit=10')
        .set(getAuthHeader(token));

      const page2 = await request(app)
        .get('/api/enquiries/my-enquiries?page=2&limit=10')
        .set(getAuthHeader(token));

      expect(page1.status).toBe(200);
      expect(page2.status).toBe(200);
      expect(page1.body.enquiries.length).toBe(10);
      expect(page2.body.enquiries.length).toBe(5);
    });
  });

  describe('Delete Enquiry', () => {
    it('should allow buyer to delete own enquiry', async () => {
      const { user: buyer, token } = await createTestBuyer();
      const enquiry = await createTestEnquiry(buyer.id);

      const response = await request(app)
        .delete(`/api/enquiries/${enquiry.id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted');
    });

    it('should prevent buyer from deleting other buyers enquiries', async () => {
      const { user: buyer1, token: token1 } = await createTestBuyer();
      const { user: buyer2 } = await createTestBuyer();
      const enquiry = await createTestEnquiry(buyer2.id);

      const response = await request(app)
        .delete(`/api/enquiries/${enquiry.id}`)
        .set(getAuthHeader(token1));

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Access denied');
    });

    it('should return 404 for non-existent enquiry', async () => {
      const { token } = await createTestBuyer();
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .delete(`/api/enquiries/${fakeId}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(404);
    });
  });

  describe('Seller Access Restrictions', () => {
    it('should prevent seller from creating enquiry', async () => {
      const { token } = await createTestSeller();

      const response = await request(app)
        .post('/api/enquiries')
        .set(getAuthHeader(token))
        .send({
          title: 'Test Enquiry',
          city: 'Mumbai',
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('permissions');
    });

    it('should prevent seller from accessing buyer enquiry list', async () => {
      const { token } = await createTestSeller();

      const response = await request(app)
        .get('/api/enquiries/my-enquiries')
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
    });

    it('should prevent seller from deleting enquiries', async () => {
      const { user: buyer } = await createTestBuyer();
      const { token } = await createTestSeller();
      const enquiry = await createTestEnquiry(buyer.id);

      const response = await request(app)
        .delete(`/api/enquiries/${enquiry.id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
    });
  });

  describe('Enquiry Quotations Endpoint', () => {
    it('should allow buyer to view quotations for own enquiry', async () => {
      const { user: buyer, token } = await createTestBuyer();
      const { user: seller1 } = await createTestSeller();
      const { user: seller2 } = await createTestSeller();
      const enquiry = await createTestEnquiry(buyer.id);
      
      const { createTestSubscription } = await import('./helpers/factories.js');
      await createTestSubscription(seller1.id);
      await createTestSubscription(seller2.id);

      const { createTestQuotation } = await import('./helpers/factories.js');
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
      const enquiry = await createTestEnquiry(buyer2.id);

      const response = await request(app)
        .get(`/api/enquiries/${enquiry.id}/quotations`)
        .set(getAuthHeader(token1));

      expect(response.status).toBe(403);
    });
  });
});
