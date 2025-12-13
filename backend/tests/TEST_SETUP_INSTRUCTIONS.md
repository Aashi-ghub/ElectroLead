# Test Setup Instructions

## Quick Start

1. **Create Test Database**
   ```sql
   CREATE DATABASE electrolead_test;
   ```

2. **Create `.env.test` file**
   ```bash
   cp .env.test.example .env.test
   # Edit .env.test with your test database credentials
   ```

3. **Install Dependencies** (if not already installed)
   ```bash
   npm install
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

## Detailed Setup

### 1. Database Setup

Create a PostgreSQL database specifically for testing:

```sql
CREATE DATABASE electrolead_test;
```

**Important**: Use a separate database from production to avoid data conflicts.

### 2. Environment Configuration

Create `.env.test` in the `backend/` directory:

```env
TEST_DATABASE_URL=postgresql://username:password@localhost:5432/electrolead_test
JWT_SECRET=test-jwt-secret-key-change-in-production
JWT_EXPIRY=7d
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=3
NODE_ENV=test
FRONTEND_URL=http://localhost:5173
```

### 3. Database Migrations

The test suite automatically runs migrations before tests. The schema is loaded from `database/schema.sql`.

### 4. Running Tests

#### Run All Tests
```bash
npm test
```

#### Run Specific Test Suite
```bash
npm test -- quotation.test.js
npm test -- auth.test.js
npm test -- database.test.js
```

#### Run Tests in Watch Mode
```bash
npm run test:watch
```

#### Run Tests with Coverage
```bash
npm run test:coverage
```

### 5. Test Structure

Tests are organized by functionality:

- **database.test.js** - Schema and constraint tests
- **auth.test.js** - Authentication and OTP tests
- **role-authorization.test.js** - Access control tests
- **enquiry.test.js** - Enquiry API tests
- **quotation.test.js** - ⚠️ CRITICAL security tests
- **subscription.test.js** - Subscription and payment tests
- **file-upload.test.js** - File upload validation tests
- **email-notifications.test.js** - Email notification tests
- **error-handling.test.js** - Error response tests
- **performance.test.js** - Performance and regression tests

### 6. Test Helpers

Located in `tests/helpers/`:

- **app.js** - Creates test Express app
- **auth.js** - Authentication helpers (create users, tokens)
- **db.js** - Database helpers (truncate, migrations)
- **factories.js** - Test data factories
- **mocks.js** - External service mocks

### 7. Test Database Cleanup

- Database is **truncated** before each test suite
- Each test should be independent
- No test should rely on data from previous tests

### 8. External Service Mocking

External services are mocked to avoid actual API calls:

- **Cloudinary** - File uploads mocked
- **Razorpay** - Payment processing mocked
- **Email (Nodemailer)** - Email sending mocked

### 9. Troubleshooting

#### Database Connection Issues
```bash
# Verify database exists
psql -U username -l | grep electrolead_test

# Test connection
psql -U username -d electrolead_test -c "SELECT 1;"
```

#### Test Timeouts
If tests timeout, check:
- Database connection pool settings
- Network latency
- Database performance

#### Rate Limiting in Tests
Some tests may hit rate limits. The test app uses the same rate limiters but with relaxed settings for testing.

### 10. Coverage Goals

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

Run coverage report:
```bash
npm run test:coverage
```

### 11. CI/CD Integration

These tests should run:
- On every pull request
- Before merging to main
- Before production deployment

Example GitHub Actions workflow:
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
        env:
          TEST_DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

## Security Test Focus

The test suite places special emphasis on:

1. **Quotation Isolation** - Sellers can only see own quotations
2. **Role-Based Access** - Proper role enforcement
3. **Authentication** - Password hashing, JWT, OTP security
4. **Subscription Enforcement** - Free tier limits, expiry checks

These are **launch-blocking** tests and must pass before production deployment.

## Notes

- Tests use a **separate test database**
- All tests **clean up** after themselves
- External services are **mocked**
- **No production code** is modified
- Tests focus on **security and correctness**
