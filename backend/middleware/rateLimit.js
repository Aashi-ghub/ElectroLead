import rateLimit from 'express-rate-limit';

// General API rate limiter (100 requests per minute per IP)
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP rate limiter (5 requests per 15 minutes per IP)
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many OTP requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Login rate limiter (per IP). The limit is deliberately higher than the OTP
// one: this counts *every* sign-in from an address, not failures, so a shared
// office IP - or one person switching between buyer, seller and admin accounts
// during a demo - hits it in minutes at a limit of 5. Twenty attempts per
// quarter-hour against bcrypt is still nowhere near brute-forceable.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.LOGIN_RATE_LIMIT || '20', 10),
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only failed sign-ins count toward the limit
});



