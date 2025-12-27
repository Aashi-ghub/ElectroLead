# VoltSupply V1.0 - Quick Setup Guide

## Prerequisites
- Node.js 18+ (LTS)
- PostgreSQL 12+
- npm or yarn

## Step-by-Step Setup

### 1. Database
```bash
# Create database
createdb electrolead

# Run schema
psql -d electrolead -f database/schema.sql
```

### 2. Backend
```bash
cd backend
npm install

# Create .env file (copy from .env.example)
# Fill in all required values:
# - DATABASE_URL
# - JWT_SECRET
# - CLOUDINARY credentials
# - RAZORPAY credentials
# - EMAIL credentials

npm start
```

### 3. Frontend
```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3000/api" > .env
echo "VITE_RAZORPAY_KEY_ID=your-razorpay-key" >> .env

npm run dev
```

### 4. Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## First Admin User

Create admin user directly in database:
```sql
INSERT INTO users (email, password_hash, name, role, kyc_status)
VALUES (
  'admin@electrolead.com',
  '$2b$12$...', -- Use bcrypt to hash your password
  'Admin User',
  'admin',
  'approved'
);
```

## Testing

1. Register as buyer
2. Register as seller
3. Create enquiry (buyer)
4. Subscribe (seller) - ₹999/month
5. View enquiries (seller)
6. Submit quotation (seller)
7. View quotations (buyer)

## Production Checklist

- [ ] Set NODE_ENV=production
- [ ] Use strong JWT_SECRET
- [ ] Configure production database
- [ ] Set up Cloudinary account
- [ ] Set up Razorpay account
- [ ] Configure email service (Resend/Gmail)
- [ ] Set FRONTEND_URL to production domain
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure server monitoring

## API Testing

Use Postman or curl:
```bash
# Register
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","role":"buyer"}'

# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Troubleshooting

### Database Connection Error
- Check DATABASE_URL format
- Ensure PostgreSQL is running
- Verify database exists

### OTP Not Sending
- Check email credentials
- Verify SMTP settings
- Check email provider limits

### File Upload Fails
- Verify Cloudinary credentials
- Check file size (max 5MB)
- Verify file type (PDF, JPG, PNG)

### Payment Not Working
- Verify Razorpay credentials
- Check Razorpay webhook (if needed)
- Verify frontend Razorpay key




