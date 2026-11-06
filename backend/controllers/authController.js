import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import { generateToken } from '../middleware/auth.js';
import { generateOTP, hashOTP, storeOTP, verifyAndClearOTP } from '../utils/otp.js';
import { sendOTPEmail } from '../config/email.js';

// POST /api/register
export const register = async (req, res) => {
  try {
    const { email, password, name, phone, role, city, state, company_name, gst_number, pan_number } = req.body;

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password with bcrypt (12 rounds)
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, phone, role, city, state, company_name, gst_number, pan_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, email, name, role`,
      [email, passwordHash, name, phone, role, city, state, company_name, gst_number, pan_number]
    );

    const user = result.rows[0];

    // Generate and send OTP. The email send is fire-and-forget: an unreachable
    // SMTP server must not block the registration response (it was stalling
    // requests past upstream proxy timeouts and surfacing as 500s in prod).
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    await storeOTP(user.id, otpHash);
    sendOTPEmail(email, otp).catch((err) => {
      console.error('Failed to send OTP email:', err);
    });

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
// POST /api/forgot-password
// The reset flow had no way to START: resetPassword wanted an OTP, but
// nothing ever generated or sent one, and the login page's "Forgot?" link
// pointed at "#". A forgotten password meant a permanently locked-out user.
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query('SELECT id FROM users WHERE email = $1 AND is_active', [email]);

    // Always answer the same way. Telling an anonymous caller whether an
    // address is registered turns this into an account-enumeration oracle.
    if (result.rows.length > 0) {
      const otp = generateOTP();
      await storeOTP(result.rows[0].id, await hashOTP(otp));

      // Fire-and-forget: a slow or unreachable mail provider must not hold
      // the response open or reveal delivery success to the caller.
      sendOTPEmail(
        email,
        otp,
        'VoltSupply - Reset your password',
        `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
           <h2>Reset your password</h2>
           <p>Your code is: <strong style="font-size:24px;letter-spacing:4px">${otp}</strong></p>
           <p>It is valid for 10 minutes. If you did not ask to reset your password, ignore this email.</p>
         </div>`
      ).catch((err) => console.error('Reset email failed:', err.message));
    }

    res.json({ message: 'If that email is registered, we have sent a reset code to it.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Could not start password reset' });
  }
};

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



