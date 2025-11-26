# Wellness Event Booking - NestJS Backend

A standalone NestJS backend API for the Wellness Event Booking System.

## Features

- **Modular Architecture**: Organized into feature modules (Auth, Events, Users, etc.)
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Role-Based Access Control**: Guards for HR_ADMIN and VENDOR_ADMIN roles
- **MongoDB Integration**: Using Mongoose ODM for data persistence
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Validation**: Request validation using class-validator
- **Error Handling**: Global exception filter for consistent error responses
- **Testing**: Unit tests, integration tests, and property-based tests

## Prerequisites

- Node.js 20+
- MongoDB 6+
- npm or yarn

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
```

## Environment Variables

See `.env.example` for all required environment variables:

- `NODE_ENV`: Application environment (development, production)
- `PORT`: Server port (default: 3001)
- `DATABASE_URL`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `JWT_ACCESS_TOKEN_EXPIRATION`: Access token expiration time
- `JWT_REFRESH_TOKEN_EXPIRATION`: Refresh token expiration time
- `FRONTEND_URL`: Frontend application URL for CORS
- `API_PREFIX`: API route prefix (default: api/v1)
- `SWAGGER_ENABLED`: Enable/disable Swagger documentation
- `SWAGGER_PATH`: Swagger documentation path

## Database Setup

### Seeding the Database

To populate the database with sample data for development and testing:

```bash
# Run the seed script
npm run seed
```

This will create:
- 3 companies
- 4 vendors
- 12 event items (wellness services)
- 7 users (3 HR Admins, 4 Vendor Admins)
- 6 sample events (pending, approved, and rejected)

### Test Credentials

After seeding, you can use these credentials to test the application:

**HR Admin Accounts:**
- Username: `hr_tech` | Password: `password123` | Company: Tech Innovations Inc
- Username: `hr_global` | Password: `password123` | Company: Global Solutions Pte Ltd
- Username: `hr_creative` | Password: `password123` | Company: Creative Minds Co

**Vendor Admin Accounts:**
- Username: `vendor_spa` | Password: `password123` | Vendor: Wellness Spa & Massage
- Username: `vendor_fitness` | Password: `password123` | Vendor: Fitness First Corporate
- Username: `vendor_yoga` | Password: `password123` | Vendor: Mindful Yoga Studio
- Username: `vendor_catering` | Password: `password123` | Vendor: Healthy Eats Catering

### Seed Data Details

The seed script creates the following data:

**Companies (3):**
- Tech Innovations Inc
- Global Solutions Pte Ltd
- Creative Minds Co

**Vendors (4):**
- Wellness Spa & Massage (spa and massage services)
- Fitness First Corporate (fitness programs)
- Mindful Yoga Studio (yoga and mindfulness)
- Healthy Eats Catering (nutrition and catering)

**Event Items (12):**
- 3 items from Wellness Spa (massage, chair massage, aromatherapy)
- 3 items from Fitness First (group fitness, personal training, gym membership)
- 3 items from Mindful Yoga (office yoga, meditation, stress management)
- 3 items from Healthy Eats (lunch catering, nutrition workshop, smoothie bar)

**Sample Events (6):**
- 3 Pending events (awaiting vendor approval)
- 1 Approved event (with confirmed date)
- 2 Rejected events (with rejection remarks)

All events include realistic data with proposed dates, locations, and proper relationships between companies, vendors, and event items.

## Running the Application

```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## API Documentation

When the application is running, access the Swagger documentation at:

```
http://localhost:3001/api/docs
```

## Project Structure

```
src/
├── main.ts                          # Application entry point
├── app.module.ts                    # Root module
├── config/                          # Configuration module
├── common/                          # Shared utilities
│   ├── filters/                     # Exception filters
│   ├── interceptors/                # Interceptors
│   ├── guards/                      # Auth guards
│   ├── decorators/                  # Custom decorators
│   └── pipes/                       # Validation pipes
├── database/                        # Database configuration
├── auth/                            # Authentication module
├── users/                           # Users module
├── events/                          # Events module
├── event-items/                     # Event Items module
├── companies/                       # Companies module
├── vendors/                         # Vendors module
├── location/                        # Location service module
└── health/                          # Health check module
```

## Module Structure

Each feature module follows this structure:

```
module-name/
├── module-name.module.ts            # Module definition
├── module-name.controller.ts        # HTTP endpoints
├── module-name.service.ts           # Business logic
├── module-name.repository.ts        # Data access
├── schemas/                         # Mongoose schemas
│   └── model.schema.ts
└── dto/                             # Data Transfer Objects
    ├── create-model.dto.ts
    └── update-model.dto.ts
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout

### Events
- `GET /api/v1/events` - Get events (filtered by role)
- `GET /api/v1/events/:id` - Get event by ID
- `POST /api/v1/events` - Create event (HR_ADMIN only)
- `POST /api/v1/events/:id/approve` - Approve event (VENDOR_ADMIN only)
- `POST /api/v1/events/:id/reject` - Reject event (VENDOR_ADMIN only)

### Event Items
- `GET /api/v1/event-items` - Get all event items

### Health
- `GET /api/v1/health` - Health check endpoint

## Development Guidelines

### TypeScript Configuration

The project uses strict TypeScript mode with the following settings:
- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `strictBindCallApply: true`

### Code Style

- Use ESLint and Prettier for code formatting
- Run `npm run lint` to check for linting errors
- Run `npm run format` to format code

### Testing Strategy

1. **Unit Tests**: Test individual services and components
2. **Integration Tests**: Test API endpoints with supertest
3. **Property-Based Tests**: Test correctness properties with fast-check

## License

UNLICENSED
