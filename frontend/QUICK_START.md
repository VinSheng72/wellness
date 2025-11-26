# Quick Start Guide

Get the Wellness Event Booking System up and running in minutes.

## 🚀 Quick Setup (5 minutes)

### Option 1: Automated Setup (Recommended)

```bash
# Run the setup script
./scripts/setup.sh
```

This will:
- Install dependencies
- Create .env file
- Optionally seed the database

### Option 2: Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env

# 3. Generate JWT secret
openssl rand -base64 32
# Copy the output and paste it as JWT_SECRET in .env

# 4. Update MONGODB_URI in .env with your MongoDB connection string

# 5. Seed the database
npm run seed

# 6. Start the development server
npm run dev
```

## 🐳 Docker Quick Start (3 minutes)

```bash
# Start everything with Docker Compose
docker-compose up -d

# Seed the database
docker exec -it wellness-app npm run seed

# Access the app at http://localhost:3000
```

## 🔑 Demo Login

After seeding, use these credentials:

**HR Admin:**
- Username: `hr_tech`
- Password: `password123`

**Vendor Admin:**
- Username: `vendor_healthfirst`
- Password: `password123`

## 📚 Next Steps

- [Full README](./README.md) - Complete documentation
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment
- [Requirements](./.kiro/specs/wellness-event-booking/requirements.md) - Feature specifications

## 🆘 Troubleshooting

### Can't connect to MongoDB?

**Local MongoDB:**
```bash
# Start MongoDB
mongod
```

**Or use MongoDB Atlas:**
1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Update MONGODB_URI in .env

### Build fails?

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Tests fail?

```bash
# Run tests with verbose output
npm test -- --verbose
```

## 📞 Need Help?

Check the [Deployment Guide](./DEPLOYMENT.md) for detailed troubleshooting.
