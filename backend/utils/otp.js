import bcrypt from 'bcrypt';
import pool from '../config/database.js';

// Generate 6-digit numeric OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP before storing (using bcrypt with 12 rounds)
export const hashOTP = async (otp) => {
  return await bcrypt.hash(otp, 12);
};

// Verify OTP
export const verifyOTP = async (otp, hash) => {
  return await bcrypt.compare(otp, hash);
};

// Store OTP in database
export const storeOTP = async (userId, otpHash) => {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(process.env.OTP_EXPIRY_MINUTES || '10'));

  await pool.query(
    `UPDATE users 
     SET otp_hash = $1, otp_expires_at = $2, otp_attempts = 0 
     WHERE id = $3`,
    [otpHash, expiresAt, userId]
  );
};

// Verify and clear OTP
export const verifyAndClearOTP = async (email, otp) => {
  const userResult = await pool.query(
    'SELECT id, otp_hash, otp_expires_at, otp_attempts FROM users WHERE email = $1',
    [email]
  );

  if (userResult.rows.length === 0) {
    return { valid: false, error: 'User not found' };
  }

  const user = userResult.rows[0];

  if (!user.otp_hash) {
    return { valid: false, error: 'No OTP found' };
  }

  if (new Date() > new Date(user.otp_expires_at)) {
    return { valid: false, error: 'OTP expired' };
  }

  if (user.otp_attempts >= parseInt(process.env.OTP_MAX_ATTEMPTS || '3')) {
    return { valid: false, error: 'Maximum OTP attempts exceeded' };
  }

  const isValid = await verifyOTP(otp, user.otp_hash);

  if (!isValid) {
    // Increment attempts
    await pool.query(
      'UPDATE users SET otp_attempts = otp_attempts + 1 WHERE id = $1',
      [user.id]
    );
    return { valid: false, error: 'Invalid OTP' };
  }

  // Clear OTP on success
  await pool.query(
    'UPDATE users SET otp_hash = NULL, otp_expires_at = NULL, otp_attempts = 0 WHERE id = $1',
    [user.id]
  );

  return { valid: true, userId: user.id };
};
