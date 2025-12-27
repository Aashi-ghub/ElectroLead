import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import { generateToken } from '../middleware/auth.js';
import { generateOTP, hashOTP, storeOTP, verifyAndClearOTP } from '../utils/otp.js';
import { sendOTPEmail } from '../config/email.js';

// POST /api/register
export const register = async (req, res) => {
  try {
    const { email, password, name, phone, role, city, state, company_name } = req.body;

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password with bcrypt (12 rounds)
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, phone, role, city, state, company_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, name, role`,
      [email, passwordHash, name, phone, role, city, state, company_name]
    );

    const user = result.rows[0];

    // Generate and send OTP
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    await storeOTP(user.id, otpHash);
    await sendOTPEmail(email, otp);

    res.status(201).json({
      message: 'Registration successful. Please verify OTP.',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// POST /api/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT id, email, password_hash, role, name, is_active, kyc_status FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is suspended' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token (7-day expiry)
    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        kyc_status: user.kyc_status,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// POST /api/verify-otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const result = await verifyAndClearOTP(email, otp);

    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }

    // Clear OTP fields (already done in verifyAndClearOTP)
    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'OTP verification failed' });
  }
};

// POST /api/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;

    const result = await verifyAndClearOTP(email, otp);

    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }

    // Update password with bcrypt (12 rounds)
    const passwordHash = await bcrypt.hash(new_password, 12);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, result.userId]);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
};



