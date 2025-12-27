import { describe, it, expect, beforeEach } from '@jest/globals';
import { testPool, truncateAll, runMigrations } from './helpers/db.js';

describe('Database Schema Integrity Tests', () => {
  beforeEach(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
    await truncateAll();
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  describe('Schema Creation', () => {
    it('should create all required tables', async () => {
      const client = await testPool.connect();
      try {
        const result = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
      `);

        const tables = result.rows.map((r) => r.table_name);
        
        expect(tables).toContain('users');
        expect(tables).toContain('enquiries');
        expect(tables).toContain('quotations');
        expect(tables).toContain('subscriptions');
        expect(tables).toContain('user_documents');
        expect(tables).toContain('audit_logs');
      } finally {
        client.release();
      }
    });

    it('should have UUID extension enabled', async () => {
      const client = await testPool.connect();
      try {
        const result = await client.query(`
          SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';
      `);
        expect(result.rows.length).toBeGreaterThan(0);
      } finally {
        client.release();
      }
    });
  });

  describe('Users Table Constraints', () => {
    it('should enforce NOT NULL on email', async () => {
      const client = await testPool.connect();
      try {
        await expect(
          client.query(`
            INSERT INTO users (password_hash, name, role)
            VALUES ('hash', 'Test', 'buyer');
          `)
        ).rejects.toThrow();
      } finally {
        client.release();
      }
    });

    it('should enforce NOT NULL on password_hash', async () => {
      const client = await testPool.connect();
      try {
        await expect(
          client.query(`
            INSERT INTO users (email, name, role)
            VALUES ('test@example.com', 'Test', 'buyer');
          `)
        ).rejects.toThrow();
      } finally {
        client.release();
      }
    });

    it('should enforce NOT NULL on name', async () => {
      const client = await testPool.connect();
      try {
        await expect(
          client.query(`
            INSERT INTO users (email, password_hash, role)
            VALUES ('test@example.com', 'hash', 'buyer');
          `)
        ).rejects.toThrow();
      } finally {
        client.release();
      }
    });

    it('should enforce NOT NULL on role', async () => {
      const client = await testPool.connect();
      try {
        await expect(
          client.query(`
            INSERT INTO users (email, password_hash, name)
            VALUES ('test@example.com', 'hash', 'Test');
          `)
        ).rejects.toThrow();
      } finally {
        client.release();
      }
    });

    it('should enforce UNIQUE constraint on email', async () => {
      const client = await testPool.connect();
      try {
        await client.query(`
          INSERT INTO users (email, password_hash, name, role)
          VALUES ('duplicate@example.com', 'hash1', 'Test1', 'buyer');
        `);

        await expect(
          client.query(`
            INSERT INTO users (email, password_hash, name, role)
            VALUES ('duplicate@example.com', 'hash2', 'Test2', 'seller');
          `)
        ).rejects.toThrow();
      } finally {
        client.release();
      }
    });

    it('should enforce role CHECK constraint', async () => {
      const client = await testPool.connect();
      try {
        await expect(
          client.query(`
            INSERT INTO users (email, password_hash, name, role)
            VALUES ('test@example.com', 'hash', 'Test', 'invalid_role');
          `)
        ).rejects.toThrow();
      } finally {
        client.release();
      }
    });

    it('should enforce kyc_status CHECK constraint', async () => {
      const client = await testPool.connect();
      try {
        await expect(
          client.query(`
            INSERT INTO users (email, password_hash, name, role, kyc_status)
            VALUES ('test@example.com', 'hash', 'Test', 'buyer', 'invalid_status');
          `)
        ).rejects.toThrow();
      } finally {
        client.release();
      }
    });
  });

  describe('Enquiries Table Constraints', () => {
    it('should enforce NOT NULL on buyer_id', async () => {
      const client = await testPool.connect();
      try {
      await expect(
          client.query(`
            INSERT INTO enquiries (title, city)
            VALUES ('Test Enquiry', 'Mumbai');
          `)
      ).rejects.toThrow();
      } finally {
        client.release();
      }
    });

    it('should enforce NOT NULL on title', async () => {
      const client = await testPool.connect();
      try {
        const userResult = await client.query(`
          INSERT INTO users (email, password_hash, name, role)
          VALUES ('buyer@example.com', 'hash', 'Buyer', 'buyer')
          RETURNING id;
        `);
        const buyerId = userResult.rows[0].id;

      await expect(
          client.query(`
            INSERT INTO enquiries (buyer_id, city)
            VALUES ($1, 'Mumbai');
          `, [buyerId])
      ).rejects.toThrow();
      } finally {
        client.release();
      }
    });

    it('should enforce NOT NULL on city', async () => {
      const client = await testPool.connect();
      try {
        const userResult = await client.query(`
          INSERT INTO users (email, password_hash, name, role)
          VALUES ('buyer@example.com', 'hash', 'Buyer', 'buyer')
          RETURNING id;
        `);
        const buyerId = userResult.rows[0].id;

      await expect(
          client.query(`
            INSERT INTO enquiries (buyer_id, title)
            VALUES ($1, 'Test Enquiry');
          `, [buyerId])
      ).rejects.toThrow();
      } finally {
        client.release();
      }
    });

    it('should enforce status CHECK constraint', async () => {
      const client = await testPool.connect();
      try {
        const userResult = await client.query(`
          INSERT INTO users (email, password_hash, name, role)
          VALUES ('buyer@example.com', 'hash', 'Buyer', 'buyer')
          RETURNING id;
        `);
        const buyerId = userResult.rows[0].id;
      
      await expect(
          client.query(`
            INSERT INTO enquiries (buyer_id, title, city, status)
            VALUES ($1, 'Test', 'Mumbai', 'invalid_status');
          `, [buyerId])
        ).rejects.toThrow();
      } finally {
        client.release();
      }
    });

    it('should enforce FOREIGN KEY on buyer_id', async () => {
      const client = await testPool.connect();
      try {
        const fakeUserId = '00000000-0000-0000-0000-000000000000';
        await expect(
          client.query(`
            INSERT INTO enquiries (buyer_id, title, city)
            VALUES ($1, 'Test', 'Mumbai');
          `, [fakeUserId])
      ).rejects.toThrow();
      } finally {
        client.release();
      }
    });
  });

  describe('Quotations Table Constraints', () => {
    it('should enforce NOT NULL on enquiry_id', async () => {
      const client = await testPool.connect();
      try {
        const userResult = await client.query(`
          INSERT INTO users (email, password_hash, name, role)
          VALUES ('seller@example.com', 'hash', 'Seller', 'seller')
          RETURNING id;
        `);
        const sellerId = userResult.rows[0].id;

      await expect(
          client.query(`
            INSERT INTO quotations (seller_id, total_price)
            VALUES ($1, 10000);
          `, [sellerId])
      ).rejects.toThrow();
      } finally {
        client.release();
      }
    });

    it('should enforce NOT NULL on seller_id', async () => {
      const client = await testPool.connect();
      try {
        const buyerResult = await client.query(`
          INSERT INTO users (email, password_hash, name, role)
          VALUES ('buyer@example.com', 'hash', 'Buyer', 'buyer')
          RETURNING id;
        `);
        const buyerId = buyerResult.rows[0].id;

        const enquiryResult = await client.query(`
          INSERT INTO enquiries (buyer_id, title, city)
          VALUES ($1, 'Test', 'Mumbai')
          RETURNING id;
        `, [buyerId]);
        const enquiryId = enquiryResult.rows[0].id;
      
      await expect(
          client.query(`
            INSERT INTO quotations (enquiry_id, total_price)
            VALUES ($1, 10000);
          `, [enquiryId])
      ).rejects.toThrow();
      } finally {
        client.release();
      }
    });

    it('should enforce NOT NULL on total_price', async () => {
      const client = await testPool.connect();
      try {
        const buyerResult = await client.query(`
          INSERT INTO users (email, password_hash, name, role)
          VALUES ('buyer@example.com', 'hash', 'Buyer', 'buyer')
          RETURNING id;
        `);
        const buyerId = buyerResult.rows[0].id;

        const sellerResult = await client.query(`
          INSERT INTO users (email, password_hash, name, role)
          VALUES ('seller@example.com', 'hash', 'Seller', 'seller')
          RETURNING id;
        `);
        const sellerId = sellerResult.rows[0].id;

        const enquiryResult = await client.query(`
          INSERT INTO enquiries (buyer_id, title, city)
          VALUES ($1, 'Test', 'Mumbai')
          RETURNING id;
        `, [buyerId]);
        const enquiryId = enquiryResult.rows[0].id;

        await expect(
          client.query(`
            INSERT INTO quotations (enquiry_id, seller_id)
            VALUES ($1, $2);
          `, [enquiryId, sellerId])
        ).rejects.toThrow();
      } finally {
        client.release();
      }
    });

    it('should enforce UNIQUE constraint on (enquiry_id, seller_id)', async () => {
      const client = await testPool.connect();
      try {
        const buyerResult = await client.query(`
          INSERT INTO users (email, password_hash, name, role)
          VALUES ('buyer@example.com', 'hash', 'Buyer', 'buyer')
          RETURNING id;
        `);
        const buyerId = buyerResult.rows[0].id;

        const sellerResult = await client.query(`
          INSERT INTO users (email, password_hash, name, role)
          VALUES ('seller@example.com', 'hash', 'Seller', 'seller')
          RETURNING id;
        `);
        const sellerId = sellerResult.rows[0].id;

        const enquiryResult = await client.query(`
          INSERT INTO enquiries (buyer_id, title, city)
          VALUES ($1, 'Test', 'Mumbai')
          RETURNING id;
        `, [buyerId]);
        const enquiryId = enquiryResult.rows[0].id;

        await client.query(`
          INSERT INTO quotations (enquiry_id, seller_id, total_price)
          VALUES ($1, $2, 10000);
        `, [enquiryId, sellerId]);

        await expect(
          client.query(`
            INSERT INTO quotations (enquiry_id, seller_id, total_price)
            VALUES ($1, $2, 20000);
          `, [enquiryId, sellerId])
        ).rejects.toThrow();
      } finally {
        client.release();
      }
    });

    it('should enforce FOREIGN KEY on enquiry_id', async () => {
      const client = await testPool.connect();
      try {
        const sellerResult = await client.query(`
          INSERT INTO users (email, password_hash, name, role)
          VALUES ('seller@example.com', 'hash', 'Seller', 'seller')
          RETURNING id;
        `);
        const sellerId = sellerResult.rows[0].id;

        const fakeEnquiryId = '00000000-0000-0000-0000-000000000000';
        await expect(
          client.query(`
            INSERT INTO quotations (enquiry_id, seller_id, total_price)
            VALUES ($1, $2, 10000);
          `, [fakeEnquiryId, sellerId])
        ).rejects.toThrow();
      } finally {
        client.release();
      }
    });

    it('should enforce FOREIGN KEY on seller_id', async () => {
      const client = await testPool.connect();
      try {
        const buyerResult = await client.query(`
          INSERT INTO users (email, password_hash, name, role)
          VALUES ('buyer@example.com', 'hash', 'Buyer', 'buyer')
          RETURNING id;
        `);
        const buyerId = buyerResult.rows[0].id;

        const enquiryResult = await client.query(`
          INSERT INTO enquiries (buyer_id, title, city)
          VALUES ($1, 'Test', 'Mumbai')
          RETURNING id;
        `, [buyerId]);
        const enquiryId = enquiryResult.rows[0].id;

        const fakeSellerId = '00000000-0000-0000-0000-000000000000';
      await expect(
          client.query(`
            INSERT INTO quotations (enquiry_id, seller_id, total_price)
            VALUES ($1, $2, 10000);
          `, [enquiryId, fakeSellerId])
      ).rejects.toThrow();
      } finally {
        client.release();
      }
    });

    it('should enforce status CHECK constraint', async () => {
      const client = await testPool.connect();
      try {
        const buyerResult = await client.query(`
          INSERT INTO users (email, password_hash, name, role)
          VALUES ('buyer@example.com', 'hash', 'Buyer', 'buyer')
          RETURNING id;
        `);
        const buyerId = buyerResult.rows[0].id;

        const sellerResult = await client.query(`
          INSERT INTO users (email, password_hash, name, role)
          VALUES ('seller@example.com', 'hash', 'Seller', 'seller')
          RETURNING id;
        `);
        const sellerId = sellerResult.rows[0].id;

        const enquiryResult = await client.query(`
          INSERT INTO enquiries (buyer_id, title, city)
          VALUES ($1, 'Test', 'Mumbai')
          RETURNING id;
        `, [buyerId]);
        const enquiryId = enquiryResult.rows[0].id;

      await expect(
          client.query(`
            INSERT INTO quotations (enquiry_id, seller_id, total_price, status)
            VALUES ($1, $2, 10000, 'invalid_status');
          `, [enquiryId, sellerId])
      ).rejects.toThrow();
      } finally {
        client.release();
      }
    });
  });

  describe('Cascade Behavior', () => {
    it('should CASCADE delete enquiries when user is deleted', async () => {
      const client = await testPool.connect();
      try {
        const buyerResult = await client.query(`
          INSERT INTO users (email, password_hash, name, role)
          VALUES ('buyer@example.com', 'hash', 'Buyer', 'buyer')
          RETURNING id;
        `);
        const buyerId = buyerResult.rows[0].id;

        await client.query(`
          INSERT INTO enquiries (buyer_id, title, city)
          VALUES ($1, 'Test', 'Mumbai');
        `, [buyerId]);

        await client.query(`DELETE FROM users WHERE id = $1`, [buyerId]);

        const enquiryCount = await client.query(`SELECT COUNT(*) FROM enquiries WHERE buyer_id = $1`, [buyerId]);
        expect(parseInt(enquiryCount.rows[0].count)).toBe(0);
      } finally {
        client.release();
      }
    });

    it('should CASCADE delete quotations when enquiry is deleted', async () => {
      const client = await testPool.connect();
      try {
        const buyerResult = await client.query(`
          INSERT INTO users (email, password_hash, name, role)
          VALUES ('buyer@example.com', 'hash', 'Buyer', 'buyer')
          RETURNING id;
        `);
        const buyerId = buyerResult.rows[0].id;

        const sellerResult = await client.query(`
          INSERT INTO users (email, password_hash, name, role)
          VALUES ('seller@example.com', 'hash', 'Seller', 'seller')
          RETURNING id;
        `);
        const sellerId = sellerResult.rows[0].id;

        const enquiryResult = await client.query(`
          INSERT INTO enquiries (buyer_id, title, city)
          VALUES ($1, 'Test', 'Mumbai')
          RETURNING id;
        `, [buyerId]);
        const enquiryId = enquiryResult.rows[0].id;

        await client.query(`
          INSERT INTO quotations (enquiry_id, seller_id, total_price)
          VALUES ($1, $2, 10000);
        `, [enquiryId, sellerId]);

        await client.query(`DELETE FROM enquiries WHERE id = $1`, [enquiryId]);

        const quotationCount = await client.query(`SELECT COUNT(*) FROM quotations WHERE enquiry_id = $1`, [enquiryId]);
        expect(parseInt(quotationCount.rows[0].count)).toBe(0);
      } finally {
        client.release();
      }
    });

    it('should CASCADE delete quotations when seller is deleted', async () => {
      const client = await testPool.connect();
      try {
        const buyerResult = await client.query(`
          INSERT INTO users (email, password_hash, name, role)
          VALUES ('buyer@example.com', 'hash', 'Buyer', 'buyer')
          RETURNING id;
        `);
        const buyerId = buyerResult.rows[0].id;

        const sellerResult = await client.query(`
          INSERT INTO users (email, password_hash, name, role)
          VALUES ('seller@example.com', 'hash', 'Seller', 'seller')
          RETURNING id;
        `);
        const sellerId = sellerResult.rows[0].id;

        const enquiryResult = await client.query(`
          INSERT INTO enquiries (buyer_id, title, city)
          VALUES ($1, 'Test', 'Mumbai')
          RETURNING id;
        `, [buyerId]);
        const enquiryId = enquiryResult.rows[0].id;

        await client.query(`
          INSERT INTO quotations (enquiry_id, seller_id, total_price)
          VALUES ($1, $2, 10000);
        `, [enquiryId, sellerId]);

        await client.query(`DELETE FROM users WHERE id = $1`, [sellerId]);

        const quotationCount = await client.query(`SELECT COUNT(*) FROM quotations WHERE seller_id = $1`, [sellerId]);
        expect(parseInt(quotationCount.rows[0].count)).toBe(0);
      } finally {
        client.release();
      }
    });

    it('should CASCADE delete user_documents when user is deleted', async () => {
      const client = await testPool.connect();
      try {
        const userResult = await client.query(`
          INSERT INTO users (email, password_hash, name, role)
          VALUES ('user@example.com', 'hash', 'User', 'buyer')
          RETURNING id;
        `);
        const userId = userResult.rows[0].id;

        await client.query(`
          INSERT INTO user_documents (user_id, document_type, file_url)
          VALUES ($1, 'aadhar', 'https://example.com/doc.pdf');
        `, [userId]);

        await client.query(`DELETE FROM users WHERE id = $1`, [userId]);

        const docCount = await client.query(`SELECT COUNT(*) FROM user_documents WHERE user_id = $1`, [userId]);
        expect(parseInt(docCount.rows[0].count)).toBe(0);
      } finally {
        client.release();
      }
    });
  });

  describe('Index Validation', () => {
    it('should have index on enquiries.city', async () => {
      const client = await testPool.connect();
      try {
        const result = await client.query(`
          SELECT indexname 
          FROM pg_indexes 
          WHERE tablename = 'enquiries' AND indexname = 'idx_enquiries_city';
      `);
        expect(result.rows.length).toBe(1);
      } finally {
        client.release();
      }
    });

    it('should have index on enquiries.buyer_id', async () => {
      const client = await testPool.connect();
      try {
        const result = await client.query(`
          SELECT indexname 
          FROM pg_indexes 
          WHERE tablename = 'enquiries' AND indexname = 'idx_enquiries_buyer_id';
      `);
        expect(result.rows.length).toBe(1);
      } finally {
        client.release();
      }
    });

    it('should have index on quotations.enquiry_id', async () => {
      const client = await testPool.connect();
      try {
        const result = await client.query(`
          SELECT indexname 
          FROM pg_indexes 
          WHERE tablename = 'quotations' AND indexname = 'idx_quotations_enquiry_id';
      `);
        expect(result.rows.length).toBe(1);
      } finally {
        client.release();
      }
    });

    it('should have index on quotations.seller_id', async () => {
      const client = await testPool.connect();
      try {
        const result = await client.query(`
          SELECT indexname 
          FROM pg_indexes 
          WHERE tablename = 'quotations' AND indexname = 'idx_quotations_seller_id';
      `);
        expect(result.rows.length).toBe(1);
      } finally {
        client.release();
      }
    });

    it('should have index on subscriptions.user_id', async () => {
      const client = await testPool.connect();
      try {
        const result = await client.query(`
          SELECT indexname 
          FROM pg_indexes 
          WHERE tablename = 'subscriptions' AND indexname = 'idx_subscriptions_user_id';
      `);
        expect(result.rows.length).toBe(1);
      } finally {
        client.release();
      }
    });

    it('should have index on users.email', async () => {
      const client = await testPool.connect();
      try {
        const result = await client.query(`
          SELECT indexname 
          FROM pg_indexes 
          WHERE tablename = 'users' AND indexname = 'idx_users_email';
        `);
        expect(result.rows.length).toBe(1);
      } finally {
        client.release();
      }
    });
  });
});
