# Security & Performance Features

## Rate Limiting

### Global Rate Limiting
- **100 requests per minute per IP** for all `/api` and `/admin` routes
- Prevents abuse and DDoS attacks
- Returns 429 status code when exceeded

### Specific Rate Limiters
- **OTP endpoints**: 5 requests per 15 minutes per IP
- **Login endpoint**: 5 attempts per 15 minutes per IP

## Compression

- **Gzip compression** enabled for all responses
- Reduces bandwidth usage
- Improves response times

## Security Headers (Helmet)

- **Content Security Policy**: Restricts resource loading
- **XSS Protection**: Prevents cross-site scripting
- **Frame Options**: Prevents clickjacking
- **Strict Transport Security**: Enforces HTTPS (in production)
- **Content Type Sniffing**: Disabled

## Error Handling

- **Production-safe**: No stack traces in production
- **Development-friendly**: Full error details in development
- **Specific error types**: Validation, authentication, etc.
- **Error logging**: All errors logged with context

## Pagination Limits

- **Maximum limit**: 20 items per page (enforced)
- **Default limit**: 20 items
- **Applied to**: All list endpoints
  - User lists
  - Enquiry lists
  - Quotation lists
  - Subscription lists

## Graceful Shutdown

- **Signal handling**: SIGTERM, SIGINT
- **Database cleanup**: Closes connection pool
- **Timeout protection**: 10-second forced shutdown
- **Uncaught exceptions**: Handled gracefully
- **Unhandled rejections**: Logged and handled

## CORS Configuration

- **Origin restriction**: Only frontend URL allowed
- **Credentials**: Enabled for authenticated requests
- **Methods**: GET, POST, PUT, DELETE only
- **Headers**: Content-Type, Authorization only

## Request Limits

- **JSON body**: 10MB maximum
- **URL encoded**: 10MB maximum
- Prevents memory exhaustion attacks



