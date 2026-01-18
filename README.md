# VoltSupply V1.0

B2B Electrical Marketplace Platform - Production Ready

## Project Structure

```
VoltSupply/
├── backend/          # Express.js API server
├── frontend/         # React + Vite SPA
├── database/         # PostgreSQL schema (to be added)
└── README.md
```

## Quick Start

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## Technology Stack

### Backend
- Node.js (LTS)
- Express.js
- PostgreSQL (pg-pool, max 10 connections)
- dotenv (environment configuration)

### Frontend
- React.js
- Vite
- Bootstrap 5
- React Router DOM
- Axios

## Development

- Backend runs on: http://localhost:3000
- Frontend runs on: http://localhost:5173

## Status

✅ Folder structure created
✅ Basic Express.js setup
✅ PostgreSQL connection configured
✅ React + Vite setup with Bootstrap 5
⏳ Business logic implementation (pending)



