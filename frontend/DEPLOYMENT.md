# Deployment Guide

This guide covers deploying the Wellness Event Booking System to various environments.

## Table of Contents

- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Seed Data Process](#seed-data-process)
- [Deployment Options](#deployment-options)
  - [Docker Deployment](#docker-deployment)
  - [Vercel Deployment](#vercel-deployment)
  - [Manual Deployment](#manual-deployment)
- [Demo Credentials](#demo-credentials)
- [Post-Deployment Checklist](#post-deployment-checklist)

## Environment Variables

The application requires the following environment variables:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://root:password@localhost:27017/wellness-events?authSource=admin` |
| `JWT_SECRET` | Secret key for JWT token signing | Generate with: `openssl rand -base64 32` |
| `NODE_ENV` | Application environment | `production` or `development` |
| `NEXT_PUBLIC_API_URL` | Public API URL | `https://your-domain.com` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTAL_CODE_API_KEY` | API key for postal code lookup service | `your-api-key` |
| `POSTAL_CODE_API_URL` | URL for postal code lookup service | `https://api.example.com/postal-code` |

### Setting Up Environment Variables

1. **For local development:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

2. **For production:**
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your production values
   ```

3. **Generate a secure JWT secret:**
   ```bash
   openssl rand -base64 32
   ```

## Database Setup

### MongoDB Atlas (Recommended for Production)

1. **Create a MongoDB Atlas account:**
   - Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create a new cluster:**
   - Choose your cloud provider and region
   - Select the free tier (M0) or appropriate tier for your needs

3. **Configure database access:**
   - Create a database user with username and password
   - Note these credentials for your connection string

4. **Configure network access:**
   - Add your application's IP address to the IP whitelist
   - For development, you can allow access from anywhere (0.0.0.0/0)
   - For production, restrict to your application's IP addresses

5. **Get your connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `wellness-events`

   Example:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/wellness-events?retryWrites=true&w=majority
   ```

### Local MongoDB (Development)

1. **Install MongoDB:**
   - macOS: `brew install mongodb-community`
   - Ubuntu: `sudo apt-get install mongodb`
   - Windows: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

2. **Start MongoDB:**
   ```bash
   # macOS/Linux
   mongod --dbpath /path/to/data/directory
   
   # Or use the default path
   mongod
   ```

3. **Connection string:**
   ```
   mongodb://localhost:27017/wellness-events
   ```

### Docker MongoDB

If using Docker Compose (see Docker Deployment section), MongoDB is automatically configured.

## Seed Data Process

The application includes a seed script to populate the database with sample data for testing and demonstration purposes.

### Running the Seed Script

1. **Ensure your database is running and accessible**

2. **Set up environment variables:**
   ```bash
   # Make sure MONGODB_URI is set in your .env file
   ```

3. **Run the seed script:**
   ```bash
   npm run seed
   ```

### What the Seed Script Does

The seed script performs the following operations:

1. **Clears existing data** (⚠️ Warning: This deletes all data in the database)
2. **Creates sample companies:**
   - Tech Innovations Inc
   - Global Health Solutions
   - Wellness Corp

3. **Creates sample vendors:**
   - HealthFirst Wellness
   - Vitality Screening Services
   - MindBody Wellness

4. **Creates event items with vendor associations:**
   - Health Talk - Nutrition → HealthFirst Wellness
   - Health Talk - Mental Wellness → MindBody Wellness
   - Onsite Health Screening → Vitality Screening Services
   - Fitness Assessment → MindBody Wellness
   - Health Talk - Chronic Disease Prevention → HealthFirst Wellness

5. **Creates user accounts** (see Demo Credentials section)

### Seed Script Output

After running the seed script, you'll see a summary like:

```
✅ Database seeded successfully!

📊 Summary:
- Companies: 3
- Vendors: 3
- Event Items: 5
- Users: 6

🔑 Demo Credentials:
[List of usernames and passwords]
```

### Production Considerations

⚠️ **Important:** The seed script is designed for development and testing. For production:

- Do NOT run the seed script on production databases
- Create production users manually with strong passwords
- Use proper user management and authentication flows
- Consider using database migrations for schema changes

## Deployment Options

### Docker Deployment

Docker provides a consistent deployment environment across different platforms.

#### Prerequisites

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (included with Docker Desktop)

#### Quick Start with Docker Compose

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd wellness-event-booking
   ```

2. **Set environment variables:**
   ```bash
   # Create .env file or set JWT_SECRET
   export JWT_SECRET=$(openssl rand -base64 32)
   ```

3. **Start the application:**
   ```bash
   docker-compose up -d
   ```

   This will:
   - Start MongoDB on port 27017
   - Build and start the Next.js application on port 3000
   - Create a Docker network for communication

4. **Seed the database:**
   ```bash
   # Access the app container
   docker exec -it wellness-app sh
   
   # Run the seed script
   npm run seed
   
   # Exit the container
   exit
   ```

5. **Access the application:**
   - Open http://localhost:3000 in your browser

#### Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after code changes
docker-compose up -d --build

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v
```

#### Building Docker Image Manually

```bash
# Build the image
docker build -t wellness-event-booking .

# Run the container
docker run -p 3000:3000 \
  -e MONGODB_URI="your-mongodb-uri" \
  -e JWT_SECRET="your-jwt-secret" \
  -e NODE_ENV="production" \
  wellness-event-booking
```

### Vercel Deployment

Vercel is the recommended platform for deploying Next.js applications.

#### Prerequisites

- Vercel account ([Sign up](https://vercel.com/signup))
- Vercel CLI installed: `npm install -g vercel`

#### Deployment Steps

1. **Prepare your MongoDB database:**
   - Set up MongoDB Atlas (see Database Setup section)
   - Get your connection string

2. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

3. **Login to Vercel:**
   ```bash
   vercel login
   ```

4. **Deploy the application:**
   ```bash
   vercel
   ```

   Follow the prompts:
   - Set up and deploy: Yes
   - Which scope: Select your account
   - Link to existing project: No
   - Project name: wellness-event-booking
   - Directory: ./
   - Override settings: No

5. **Set environment variables:**
   
   Via Vercel CLI:
   ```bash
   vercel env add MONGODB_URI
   # Paste your MongoDB connection string
   
   vercel env add JWT_SECRET
   # Paste your JWT secret
   
   vercel env add NODE_ENV
   # Enter: production
   ```

   Or via Vercel Dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add each required variable

6. **Deploy to production:**
   ```bash
   vercel --prod
   ```

7. **Seed the database:**
   
   You'll need to run the seed script locally pointing to your production database:
   ```bash
   # Temporarily set production MongoDB URI
   export MONGODB_URI="your-production-mongodb-uri"
   
   # Run seed script
   npm run seed
   
   # Unset the variable
   unset MONGODB_URI
   ```

#### Vercel Configuration

The `vercel.json` file is already configured with:
- Build command: `npm run build`
- Framework detection: Next.js
- Environment variable references
- Region: Singapore (sin1) - adjust as needed

#### Continuous Deployment

Vercel automatically deploys:
- **Production:** Commits to the `main` branch
- **Preview:** Pull requests and other branches

### Manual Deployment

For deploying to a VPS or custom server:

#### Prerequisites

- Node.js 18+ installed
- MongoDB instance accessible
- Process manager (PM2 recommended)

#### Deployment Steps

1. **Clone and install:**
   ```bash
   git clone <repository-url>
   cd wellness-event-booking
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your values
   ```

3. **Build the application:**
   ```bash
   npm run build
   ```

4. **Install PM2:**
   ```bash
   npm install -g pm2
   ```

5. **Start the application:**
   ```bash
   pm2 start npm --name "wellness-app" -- start
   ```

6. **Configure PM2 to start on boot:**
   ```bash
   pm2 startup
   pm2 save
   ```

7. **Seed the database:**
   ```bash
   npm run seed
   ```

#### PM2 Commands

```bash
# View logs
pm2 logs wellness-app

# Restart application
pm2 restart wellness-app

# Stop application
pm2 stop wellness-app

# Monitor
pm2 monit
```

#### Nginx Configuration (Optional)

If using Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Demo Credentials

After running the seed script, the following demo accounts are available:

### HR Admin Accounts

HR Admins can create wellness event requests for their companies:

| Username | Password | Company | Role |
|----------|----------|---------|------|
| `hr_tech` | `password123` | Tech Innovations Inc | HR_ADMIN |
| `hr_global` | `password123` | Global Health Solutions | HR_ADMIN |
| `hr_wellness` | `password123` | Wellness Corp | HR_ADMIN |

**Capabilities:**
- Create new wellness event requests
- View all events for their company
- See event status (Pending, Approved, Rejected)
- View vendor responses and confirmed dates

### Vendor Admin Accounts

Vendor Admins can approve or reject event requests:

| Username | Password | Vendor | Role |
|----------|----------|--------|------|
| `vendor_healthfirst` | `password123` | HealthFirst Wellness | VENDOR_ADMIN |
| `vendor_vitality` | `password123` | Vitality Screening Services | VENDOR_ADMIN |
| `vendor_mindbody` | `password123` | MindBody Wellness | VENDOR_ADMIN |

**Capabilities:**
- View events assigned to their vendor
- Approve events by selecting a confirmed date
- Reject events with remarks
- See all event details and company information

### Security Notes

⚠️ **Important for Production:**

1. **Change default passwords immediately**
2. **Use strong, unique passwords** (minimum 12 characters, mix of letters, numbers, symbols)
3. **Implement password reset functionality** for production use
4. **Consider adding two-factor authentication** for enhanced security
5. **Regularly rotate JWT secrets**
6. **Monitor for suspicious login attempts**

## Post-Deployment Checklist

After deploying, verify the following:

### Functionality Checks

- [ ] Application loads successfully
- [ ] Login page is accessible
- [ ] HR Admin can log in and access dashboard
- [ ] Vendor Admin can log in and access dashboard
- [ ] HR Admin can create new events
- [ ] Event items dropdown populates correctly
- [ ] Postal code lookup works (if configured)
- [ ] Vendor Admin can approve events
- [ ] Vendor Admin can reject events with remarks
- [ ] Event status updates correctly
- [ ] Data isolation works (users only see their own data)

### Security Checks

- [ ] HTTPS is enabled (for production)
- [ ] Environment variables are not exposed
- [ ] JWT secret is strong and unique
- [ ] Database credentials are secure
- [ ] Default passwords have been changed
- [ ] CORS is properly configured
- [ ] Rate limiting is in place (if applicable)

### Performance Checks

- [ ] Page load times are acceptable
- [ ] Database queries are optimized
- [ ] Images and assets are optimized
- [ ] Caching is configured
- [ ] CDN is set up (if applicable)

### Monitoring

- [ ] Error logging is configured
- [ ] Application monitoring is set up
- [ ] Database monitoring is active
- [ ] Alerts are configured for critical issues
- [ ] Backup strategy is in place

## Troubleshooting

### Common Issues

#### Database Connection Fails

**Problem:** Application can't connect to MongoDB

**Solutions:**
- Verify `MONGODB_URI` is correct
- Check network access rules (MongoDB Atlas)
- Ensure MongoDB service is running
- Verify credentials are correct
- Check firewall settings

#### Build Fails

**Problem:** `npm run build` fails

**Solutions:**
- Clear `.next` directory: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run lint`
- Verify all environment variables are set

#### Authentication Issues

**Problem:** Users can't log in

**Solutions:**
- Verify JWT_SECRET is set
- Check database has user records (run seed script)
- Verify password hashing is working
- Check browser cookies are enabled
- Clear browser cache and cookies

#### Docker Issues

**Problem:** Docker containers won't start

**Solutions:**
- Check Docker logs: `docker-compose logs`
- Verify ports 3000 and 27017 are available
- Ensure Docker has enough resources
- Try rebuilding: `docker-compose up -d --build`

## Support

For additional help:
- Check the main [README.md](./README.md)
- Review the [requirements document](./.kiro/specs/wellness-event-booking/requirements.md)
- Review the [design document](./.kiro/specs/wellness-event-booking/design.md)

## License

[Your License Here]
