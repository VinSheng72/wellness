# Wellness Event Booking System

A full-stack web application for managing wellness event bookings between HR Administrators and Vendor Administrators.

## Tech Stack

- **Framework**: Next.js 14+ with App Router and TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt for password hashing
- **Styling**: Tailwind CSS
- **Testing**: Jest and fast-check for property-based testing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB instance (local or cloud)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Update the `.env` file with your MongoDB URI and JWT secret

5. Seed the database with sample data:

```bash
npm run seed
```

This will populate the database with sample companies, vendors, event items, and user accounts.

### Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Demo Credentials

After running the seed script (`npm run seed`), you can log in with the following test accounts:

### HR Admin Accounts

These accounts can create wellness event requests for their respective companies:

| Username | Password | Company |
|----------|----------|---------|
| `hr_tech` | `password123` | Tech Innovations Inc |
| `hr_global` | `password123` | Global Health Solutions |
| `hr_wellness` | `password123` | Wellness Corp |

### Vendor Admin Accounts

These accounts can approve or reject event requests for their respective vendors:

| Username | Password | Vendor |
|----------|----------|--------|
| `vendor_healthfirst` | `password123` | HealthFirst Wellness |
| `vendor_vitality` | `password123` | Vitality Screening Services |
| `vendor_mindbody` | `password123` | MindBody Wellness |

### Sample Event Items

The seed script creates the following event items with vendor associations:

- **Health Talk - Nutrition** → HealthFirst Wellness
- **Health Talk - Mental Wellness** → MindBody Wellness
- **Onsite Health Screening** → Vitality Screening Services
- **Fitness Assessment** → MindBody Wellness
- **Health Talk - Chronic Disease Prevention** → HealthFirst Wellness

## Database Management

### Seeding the Database

To populate the database with sample data for testing:

```bash
npm run seed
```

This script will:
1. Clear all existing data from the database
2. Create sample companies, vendors, and event items
3. Create HR Admin and Vendor Admin user accounts
4. Display a summary of created data and login credentials

**Note**: The seed script will delete all existing data before inserting new data. Use with caution in production environments.

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

The project includes:
- **Unit tests** for components, services, and API routes
- **Property-based tests** using fast-check for comprehensive validation

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

Quick deployment options:

### Docker
```bash
docker-compose up -d
```

### Vercel
```bash
vercel --prod
```

See the [deployment guide](./DEPLOYMENT.md) for complete instructions on:
- Environment variable configuration
- Database setup (MongoDB Atlas)
- Seed data process
- Docker deployment
- Vercel deployment
- Manual deployment to VPS

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
