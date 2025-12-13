/**
 * Mock utilities for external services
 * Used in tests to avoid actual API calls
 */

/**
 * Mock Cloudinary upload
 */
export const mockCloudinaryUpload = () => {
  return {
    secure_url: 'https://res.cloudinary.com/test/image/upload/v123/test.jpg',
    public_id: 'electrolead/kyc/test123',
    format: 'jpg',
    bytes: 1024,
  };
};

/**
 * Mock Razorpay order creation
 */
export const mockRazorpayOrder = () => {
  return {
    id: 'order_test_' + Date.now(),
    amount: 99900,
    currency: 'INR',
    receipt: 'receipt_test',
    status: 'created',
  };
};

/**
 * Mock Razorpay payment fetch
 */
export const mockRazorpayPayment = (status = 'captured') => {
  return {
    id: 'pay_test_' + Date.now(),
    order_id: 'order_test_123',
    status: status,
    amount: 99900,
    currency: 'INR',
    method: 'card',
    captured: status === 'captured',
  };
};

/**
 * Mock email sending (nodemailer)
 */
export const mockEmailSend = () => {
  return {
    messageId: 'test-message-id',
    accepted: ['test@example.com'],
    rejected: [],
  };
};

/**
 * Setup Cloudinary mock
 */
export const setupCloudinaryMock = () => {
  return {
    uploader: {
      upload_stream: (options, callback) => {
        // Simulate async upload
        setTimeout(() => {
          callback(null, mockCloudinaryUpload());
        }, 10);
        return {
          end: () => {},
          on: () => {},
        };
      },
      destroy: async (publicId) => {
        return { result: 'ok' };
      },
    },
  };
};

/**
 * Setup Razorpay mock
 */
export const setupRazorpayMock = () => {
  return {
    orders: {
      create: async (options) => {
        return mockRazorpayOrder();
      },
    },
    payments: {
      fetch: async (paymentId) => {
        return mockRazorpayPayment('captured');
      },
    },
  };
};

/**
 * Setup Nodemailer mock
 */
export const setupNodemailerMock = () => {
  return {
    createTransport: () => ({
      sendMail: async (options) => {
        return mockEmailSend();
      },
    }),
  };
};
