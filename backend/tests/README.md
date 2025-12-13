# ElectroLead V1 - Test Suite Documentation

## Overview

This test suite provides comprehensive coverage for the ElectroLead V1 backend, focusing on security, correctness, and regression prevention.

## Test Structure

```
tests/
├── setup.js                    # Global test setup
├── teardown.js                 # Global teardown
├── helpers/
│   ├── app.js                  # Test Express app factory
│   ├── auth.js                 # Authentication helpers
│   ├── db.js                   # Database helpers
│   ├── factories.js            # Test data factories
│   └── mocks.js                # External service mocks
├── auth.test.js                # Authentication & OTP tests
├── database.test.js            # Schema & constraint tests
├── enquiry.test.js             # Enquiry API tests
├── error-handling.test.js      # Error handling tests
├── file-upload.test.js         # File upload tests
├── performance.test.js         # Performance & regression tests
├── quotation.test.js           # Quotation security tests (CRITICAL)
├── role-authorization.test.js # Role & authorization tests
├── subscription.test.js        # Subscription & payment tests
└── email-notifications.test.js # Email notification tests
```

## Prerequisites

1. **Test Database**: Create a separate PostgreSQL database for testing
2. **Environment Variables**: Create `.env.test` file with:
   ```
   TEST_DATABASE_URL=postgresql://user:password@localhost:5432/electrolead_test
   JWT_SECRET=test-jwt-secret-key
   JWT_EXPIRY=7d
   OTP_EXPIRY_MINUTES=10
   OTP_MAX_ATTEMPTS=3
   NODE_ENV=test
   ```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm test -- quotation.test.js
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## Test Categories

### 1. Database Tests (`database.test.js`)
- Schema integrity
- Constraint enforcement (NOT NULL, UNIQUE, FOREIGN KEY, CHECK)
- Cascade behavior
- Index validation

### 2. Authentication Tests (`auth.test.js`)
- User registration
- Password hashing (bcrypt, 12 rounds)
- OTP generation, hashing, expiry
- OTP reuse prevention
- Max attempt enforcement
- JWT issuance and expiry
- Rate limiting

### 3. Role & Authorization Tests (`role-authorization.test.js`)
- Buyer access control
- Seller access control
- Admin access control
- Unauthenticated access blocking
- Invalid token handling
- Inactive user blocking

### 4. Enquiry API Tests (`enquiry.test.js`)
- Create enquiry (valid/invalid payloads)
- Get own enquiries (isolation)
- Delete enquiry (ownership verification)
- Seller access restrictions
- Pagination enforcement

### 5. Quotation Security Tests (`quotation.test.js`) ⚠️ CRITICAL
- Seller quotation submission
- Quotation isolation (seller can only see own)
- Buyer quotation access (only own enquiries)
- Attack simulations (ID tampering prevention)
- Free tier limits (3 per month)
- Subscription-based access

### 6. Subscription Tests (`subscription.test.js`)
- Free seller enquiry visibility
- Free seller quote limits
- Subscription activation
- Subscription expiry enforcement
- Plan-based scope (local/state/national)
- Buyer subscription restrictions

### 7. File Upload Tests (`file-upload.test.js`)
- Valid file types (PDF, JPG, PNG)
- File size validation (5MB limit)
- Invalid file type rejection
- Cloudinary integration
- Local file system verification

### 8. Email Notification Tests (`email-notifications.test.js`)
- New enquiry notifications
- New quotation notifications
- KYC status change notifications
- Email failure handling

### 9. Error Handling Tests (`error-handling.test.js`)
- 400 (Validation errors)
- 401 (Authentication errors)
- 403 (Authorization errors)
- 404 (Not found errors)
- 500 (Server errors)
- Production error message sanitization

### 10. Performance Tests (`performance.test.js`)
- Concurrent request handling
- Duplicate prevention
- Database connection management
- Memory leak detection
- Query performance
- Rate limiting
- Error recovery

## Test Helpers

### `createTestUser(options)`
Creates a test user with hashed password and returns user object and token.

### `createTestBuyer(options)`
Creates a test buyer user.

### `createTestSeller(options)`
Creates a test seller user.

### `createTestAdmin(options)`
Creates a test admin user.

### `createTestEnquiry(buyerId, options)`
Creates a test enquiry for a buyer.

### `createTestQuotation(enquiryId, sellerId, options)`
Creates a test quotation.

### `createTestSubscription(userId, options)`
Creates a test subscription.

### `truncateAll()`
Cleans all tables between tests.

### `getAuthHeader(token)`
Returns Authorization header object.

## Security Test Coverage

### Critical Security Tests (Launch-Blocking)

1. **Quotation Isolation**
   - ✅ Seller can only see own quotations
   - ✅ Buyer can only see quotations for own enquiries
   - ✅ ID tampering attempts blocked

2. **Role-Based Access Control**
   - ✅ Buyers cannot access seller routes
   - ✅ Sellers cannot access buyer routes
   - ✅ Non-admins cannot access admin routes

3. **Authentication**
   - ✅ Passwords hashed with bcrypt (12 rounds)
   - ✅ JWT expiry enforced
   - ✅ OTP hashed and time-bound

4. **Subscription Enforcement**
   - ✅ Free tier limits enforced (3/month)
   - ✅ Subscription expiry checked
   - ✅ Plan-based scope enforced

## Test Database Setup

The test suite uses a separate database to avoid affecting production data. The database is:

1. **Migrated** before all tests run
2. **Truncated** before each test suite
3. **Cleaned up** after all tests complete

## Mocking External Services

External services are mocked to avoid actual API calls:

- **Cloudinary**: File uploads mocked
- **Razorpay**: Payment processing mocked
- **Email (Nodemailer)**: Email sending mocked

## Coverage Goals

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Continuous Integration

These tests should run:
- On every pull request
- Before merging to main
- Before production deployment

## Notes

- Tests use a separate test database
- All tests clean up after themselves
- External services are mocked
- No production code is modified
- Tests focus on security and correctness

## Troubleshooting

### Database Connection Issues
- Verify `TEST_DATABASE_URL` in `.env.test`
- Ensure PostgreSQL is running
- Check database permissions

### Test Timeouts
- Increase timeout in `jest.config.js` if needed
- Check database connection pool settings

### Rate Limiting in Tests
- Rate limits are relaxed for tests
- Some tests may still hit limits with many requests

## Contributing

When adding new features:
1. Add corresponding tests
2. Maintain test coverage above 70%
3. Ensure security tests pass
4. Update this README if needed
