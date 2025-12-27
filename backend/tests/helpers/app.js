/**
 * Create test Express app with all routes
 * This avoids modifying production server.js
 */
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import { apiLimiter } from '../../middleware/rateLimit.js';

export const createTestApp = async () => {
  const app = express();

  // Security Headers (Helmet) - disabled for tests
  app.use(helmet({
    contentSecurityPolicy: false,
  }));

  // Compression middleware
  app.use(compression());

  // CORS configuration
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Global rate limiting (relaxed for tests)
  app.use('/api', apiLimiter);
  app.use('/admin', apiLimiter);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', environment: 'test' });
  });

  // Set default Razorpay keys for tests if not present
  if (!process.env.RAZORPAY_KEY_ID) {
    process.env.RAZORPAY_KEY_ID = 'test_key_id';
  }
  if (!process.env.RAZORPAY_KEY_SECRET) {
    process.env.RAZORPAY_KEY_SECRET = 'test_key_secret';
  }

  // Import and mount routes
  const authRoutes = (await import('../../routes/authRoutes.js')).default;
  const profileRoutes = (await import('../../routes/profileRoutes.js')).default;
  const enquiryRoutes = (await import('../../routes/enquiryRoutes.js')).default;
  const sellerEnquiryRoutes = (await import('../../routes/sellerEnquiryRoutes.js')).default;
  const quotationRoutes = (await import('../../routes/quotationRoutes.js')).default;
  const subscriptionRoutes = (await import('../../routes/subscriptionRoutes.js')).default;
  const adminRoutes = (await import('../../routes/adminRoutes.js')).default;

  app.use('/api', authRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/enquiries', enquiryRoutes);
  app.use('/api/enquiries', sellerEnquiryRoutes);
  app.use('/api', quotationRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/admin', adminRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Test Error:', {
      message: err.message,
      path: req.path,
      method: req.method,
    });

    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorMessage = isDevelopment ? err.message : 'Internal server error';

    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation failed', details: err.message });
    }

    if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    res.status(err.status || 500).json({
      error: errorMessage,
    });
  });

  return app;
};



