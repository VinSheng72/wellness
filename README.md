# Wellness Event Booking System

## Tech Stack

**Backend:** NestJS, MongoDB, JWT auth  
**Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS

## Run Locally

```bash
# 1. Start MongoDB
docker-compose -f docker-compose.dev.yml up -d

# 2. Backend (terminal 1)
cd backend
cp .env.example .env  
npm install
npm run seed            # Optional: seed test data
npm run dev

# 3. Frontend (terminal 2)
cd frontend
cp .env.example .env 
npm install
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- API Docs: http://localhost:3001/api/docs

**Test Credentials:**
- HR Admin: `hr_tech` / `password123`
- Vendor Admin: `vendor_spa` / `password123`

## Documentation

- [DEPLOY.md](DEPLOY.md) - Production deployment guide
- [ERD.md](ERD.md) - Database schema diagram
