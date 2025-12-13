# ElectroLead Backend

Express.js backend server for ElectroLead B2B Platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start server:
```bash
npm start
# Or for development with auto-reload:
npm run dev
```

## Environment Variables

See `.env.example` for required configuration.

## Project Structure

```
backend/
├── config/          # Configuration files (database, etc.)
├── controllers/     # Request handlers (to be added)
├── middleware/      # Custom middleware (to be added)
├── routes/          # API routes (to be added)
├── utils/           # Utility functions (to be added)
├── server.js        # Main server file
└── package.json     # Dependencies
```
