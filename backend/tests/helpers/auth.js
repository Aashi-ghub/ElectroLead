import jwt from 'jsonwebtoken';
import { testPool } from './db.js';

/**
 * Generate a test JWT token
 */
export const generateTestToken = (userId, role = 'buyer') => {
  const secret = process.env.JWT_SECRET || 'test-jwt-secret-key-change-in-production';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

/**
 * Create a test user and return token
 */
export const createTestUser = async (userData = {}) => {
  const {
    email = `test-${Date.now()}@example.com`,
    password = 'Test1234!',
    name = 'Test User',
    role = 'buyer',
    city = 'Mumbai',
    state = 'Maharashtra',
    is_active = true,
  } = userData;

  const bcrypt = await import('bcrypt');
  const passwordHash = await bcrypt.default.hash(password, 12);

  const result = await testPool.query(
    `INSERT INTO users (email, password_hash, name, role, city, state, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, email, role`,
    [email, passwordHash, name, role, city, state, is_active]
  );

  const user = result.rows[0];
  const token = generateTestToken(user.id, user.role);

  return { user, token, password };
};

/**
 * Create a test buyer
 */
export const createTestBuyer = async (overrides = {}) => {
  return await createTestUser({ role: 'buyer', ...overrides });
};

/**
 * Create a test seller
 */
export const createTestSeller = async (overrides = {}) => {
  return await createTestUser({ role: 'seller', ...overrides });
};

/**
 * Create a test admin
 */
export const createTestAdmin = async (overrides = {}) => {
  return await createTestUser({ role: 'admin', ...overrides });
};

/**
 * Get auth header for request
 */
export const getAuthHeader = (token) => {
  return { Authorization: `Bearer ${token}` };
};
