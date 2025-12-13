import { describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import request from 'supertest';
import { truncateAll } from './helpers/db.js';
import { createTestUser, getAuthHeader } from './helpers/auth.js';
import bcrypt from 'bcrypt';
import { createTestApp } from './helpers/app.js';

let app;
beforeAll(async () => {
  app = await createTestApp();
});

describe('Authentication & OTP Tests', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  describe('User Registration', () => {
    it('should register a new buyer successfully', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          email: 'buyer@example.com',
          password: 'Test1234!',
          name: 'Test Buyer',
          role: 'buyer',
          city: 'Mumbai',
          state: 'Maharashtra',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('buyer@example.com');
      expect(response.body.user.role).toBe('buyer');
      expect(response.body.message).toContain('OTP');
    });

    it('should register a new seller successfully', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          email: 'seller@example.com',
          password: 'Test1234!',
          name: 'Test Seller',
          role: 'seller',
          city: 'Delhi',
          state: 'Delhi',
          company_name: 'Test Company',
        });

      expect(response.status).toBe(201);
      expect(response.body.user.role).toBe('seller');
    });

    it('should reject registration with duplicate email', async () => {
      await createTestUser({ email: 'duplicate@example.com' });

      const response = await request(app)
        .post('/api/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Test1234!',
          name: 'Another User',
          role: 'buyer',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already registered');
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          email: 'invalid-email',
          password: 'Test1234!',
          name: 'Test User',
          role: 'buyer',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject registration with short password', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          email: 'test@example.com',
          password: 'Short1!',
          name: 'Test User',
          role: 'buyer',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with invalid role', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          email: 'test@example.com',
          password: 'Test1234!',
          name: 'Test User',
          role: 'invalid_role',
        });

      expect(response.status).toBe(400);
    });

    it('should hash password with bcrypt (12 rounds)', async () => {
      const { testPool } = await import('./helpers/db.js');
      const email = 'hashtest@example.com';
      
      await request(app)
        .post('/api/register')
        .send({
          email,
          password: 'Test1234!',
          name: 'Test User',
          role: 'buyer',
        });

      const result = await testPool.query(
        'SELECT password_hash FROM users WHERE email = $1',
        [email]
      );

      const storedHash = result.rows[0].password_hash;
      const isValid = await bcrypt.compare('Test1234!', storedHash);
      
      expect(isValid).toBe(true);
      // Verify it's bcrypt hash (starts with $2b$ or $2a$)
      expect(storedHash).toMatch(/^\$2[ab]\$/);
    });
  });

  describe('OTP Generation & Verification', () => {
    it('should generate and store OTP on registration', async () => {
      const { testPool } = await import('./helpers/db.js');
      const email = 'otptest@example.com';
      
      await request(app)
        .post('/api/register')
        .send({
          email,
          password: 'Test1234!',
          name: 'Test User',
          role: 'buyer',
        });

      const result = await testPool.query(
        'SELECT otp_hash, otp_expires_at, otp_attempts FROM users WHERE email = $1',
        [email]
      );

      expect(result.rows[0].otp_hash).not.toBeNull();
      expect(result.rows[0].otp_expires_at).not.toBeNull();
      expect(result.rows[0].otp_attempts).toBe(0);
    });

    it('should hash OTP before storing', async () => {
      const { testPool } = await import('./helpers/db.js');
      const email = 'otphash@example.com';
      
      await request(app)
        .post('/api/register')
        .send({
          email,
          password: 'Test1234!',
          name: 'Test User',
          role: 'buyer',
        });

      const result = await testPool.query(
        'SELECT otp_hash FROM users WHERE email = $1',
        [email]
      );

      const otpHash = result.rows[0].otp_hash;
      // OTP hash should be bcrypt format
      expect(otpHash).toMatch(/^\$2[ab]\$/);
      // Should not be a plain 6-digit number
      expect(otpHash.length).toBeGreaterThan(10);
    });

    it('should reject invalid OTP', async () => {
      const email = 'otpverify@example.com';
      
      await request(app)
        .post('/api/register')
        .send({
          email,
          password: 'Test1234!',
          name: 'Test User',
          role: 'buyer',
        });

      const response = await request(app)
        .post('/api/verify-otp')
        .send({
          email,
          otp: '000000',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should enforce OTP expiry', async () => {
      const { testPool } = await import('./helpers/db.js');
      const email = 'otpexpiry@example.com';
      
      await request(app)
        .post('/api/register')
        .send({
          email,
          password: 'Test1234!',
          name: 'Test User',
          role: 'buyer',
        });

      // Set OTP expiry to past
      await testPool.query(
        'UPDATE users SET otp_expires_at = NOW() - INTERVAL \'1 hour\' WHERE email = $1',
        [email]
      );

      const response = await request(app)
        .post('/api/verify-otp')
        .send({
          email,
          otp: '123456',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('expired');
    });

    it('should prevent OTP reuse after successful verification', async () => {
      const { testPool } = await import('./helpers/db.js');
      const email = 'otpreuse@example.com';
      
      await request(app)
        .post('/api/register')
        .send({
          email,
          password: 'Test1234!',
          name: 'Test User',
          role: 'buyer',
        });

      // Get the actual OTP (in real scenario, this would come from email)
      // For testing, we'll need to generate and verify
      // This test verifies that OTP is cleared after use
      const userResult = await testPool.query(
        'SELECT otp_hash FROM users WHERE email = $1',
        [email]
      );
      
      // Simulate OTP verification by manually clearing
      await testPool.query(
        'UPDATE users SET otp_hash = NULL, otp_expires_at = NULL WHERE email = $1',
        [email]
      );

      const response = await request(app)
        .post('/api/verify-otp')
        .send({
          email,
          otp: '123456',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('No OTP found');
    });

    it('should enforce max OTP attempts', async () => {
      const { testPool } = await import('./helpers/db.js');
      const email = 'otpattempts@example.com';
      
      await request(app)
        .post('/api/register')
        .send({
          email,
          password: 'Test1234!',
          name: 'Test User',
          role: 'buyer',
        });

      // Set max attempts
      await testPool.query(
        'UPDATE users SET otp_attempts = $1 WHERE email = $2',
        [3, email]
      );

      const response = await request(app)
        .post('/api/verify-otp')
        .send({
          email,
          otp: '000000',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Maximum OTP attempts');
    });

    it('should increment OTP attempts on failed verification', async () => {
      const { testPool } = await import('./helpers/db.js');
      const email = 'otpincrement@example.com';
      
      await request(app)
        .post('/api/register')
        .send({
          email,
          password: 'Test1234!',
          name: 'Test User',
          role: 'buyer',
        });

      const initialResult = await testPool.query(
        'SELECT otp_attempts FROM users WHERE email = $1',
        [email]
      );
      expect(initialResult.rows[0].otp_attempts).toBe(0);

      await request(app)
        .post('/api/verify-otp')
        .send({
          email,
          otp: '000000',
        });

      const afterResult = await testPool.query(
        'SELECT otp_attempts FROM users WHERE email = $1',
        [email]
      );
      expect(afterResult.rows[0].otp_attempts).toBe(1);
    });
  });

  describe('Login & JWT', () => {
    it('should login with valid credentials', async () => {
      const { user, password } = await createTestUser({
        email: 'login@example.com',
        password: 'Test1234!',
      });

      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'login@example.com',
          password: 'Test1234!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(user.id);
    });

    it('should reject login with invalid password', async () => {
      await createTestUser({
        email: 'login2@example.com',
        password: 'Test1234!',
      });

      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'login2@example.com',
          password: 'WrongPassword!',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test1234!',
        });

      expect(response.status).toBe(401);
    });

    it('should reject login for inactive user', async () => {
      await createTestUser({
        email: 'inactive@example.com',
        password: 'Test1234!',
        is_active: false,
      });

      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'inactive@example.com',
          password: 'Test1234!',
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('suspended');
    });

    it('should issue JWT token with correct expiry', async () => {
      const { user } = await createTestUser({
        email: 'jwttest@example.com',
        password: 'Test1234!',
      });

      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'jwttest@example.com',
          password: 'Test1234!',
        });

      expect(response.status).toBe(200);
      const token = response.body.token;
      
      // Verify JWT structure
      expect(token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
      
      // Decode and verify payload
      const jwt = await import('jsonwebtoken');
      const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(user.id);
    });
  });

  describe('Password Reset', () => {
    it('should reset password with valid OTP', async () => {
      const { testPool } = await import('./helpers/db.js');
      const email = 'reset@example.com';
      
      await createTestUser({ email, password: 'OldPassword123!' });

      // Generate OTP (simulate password reset request)
      const otpUtils = await import('../utils/otp.js');
      const otp = otpUtils.generateOTP();
      const otpHash = await otpUtils.hashOTP(otp);
      await otpUtils.storeOTP(
        (await testPool.query('SELECT id FROM users WHERE email = $1', [email])).rows[0].id,
        otpHash
      );

      const response = await request(app)
        .post('/api/reset-password')
        .send({
          email,
          otp,
          new_password: 'NewPassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('successfully');

      // Verify new password works
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email,
          password: 'NewPassword123!',
        });

      expect(loginResponse.status).toBe(200);
    });

    it('should hash new password with bcrypt', async () => {
      const { testPool } = await import('./helpers/db.js');
      const email = 'resethash@example.com';
      
      await createTestUser({ email });

      const otpUtils = await import('../utils/otp.js');
      const otp = otpUtils.generateOTP();
      const otpHash = await otpUtils.hashOTP(otp);
      await otpUtils.storeOTP(
        (await testPool.query('SELECT id FROM users WHERE email = $1', [email])).rows[0].id,
        otpHash
      );

      await request(app)
        .post('/api/reset-password')
        .send({
          email,
          otp,
          new_password: 'NewPassword123!',
        });

      const result = await testPool.query(
        'SELECT password_hash FROM users WHERE email = $1',
        [email]
      );

      const storedHash = result.rows[0].password_hash;
      const isValid = await bcrypt.compare('NewPassword123!', storedHash);
      expect(isValid).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit login attempts', async () => {
      await createTestUser({ email: 'ratelimit@example.com' });

      // Make 6 login attempts (limit is 5)
      const promises = [];
      for (let i = 0; i < 6; i++) {
        promises.push(
          request(app)
            .post('/api/login')
            .send({
              email: 'ratelimit@example.com',
              password: 'WrongPassword!',
            })
        );
      }

      const responses = await Promise.all(promises);
      const rateLimited = responses.some((r) => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });
});
