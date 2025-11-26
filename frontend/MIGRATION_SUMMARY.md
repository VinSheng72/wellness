# Frontend Migration Summary

## Overview
The Next.js frontend has been successfully migrated to use the NestJS backend API. The application now operates as a true client-server architecture with clear separation of concerns.

## Changes Made

### 1. API Client Service (`lib/api/`)
- **Created `lib/api/client.ts`**: Main API client with methods for all backend endpoints
- **Created `lib/api/types.ts`**: TypeScript interfaces matching NestJS DTOs
- **Created `lib/api/index.ts`**: Barrel export for clean imports

**Key Features:**
- Automatic JWT token management (access + refresh tokens)
- Automatic token refresh on 401 responses
- Consistent error handling
- Type-safe API calls

### 2. Authentication Updates
- **Updated `app/login/page.tsx`**: Now uses `apiClient.login()` instead of Next.js API route
- **Created `lib/auth/AuthContext.tsx`**: React context for authentication state
- **Updated `middleware.ts`**: Simplified to basic route protection (JWT validation now on backend)

**Token Storage:**
- Access tokens stored in localStorage
- Refresh tokens stored in localStorage
- Automatic token refresh before expiration

### 3. Dashboard Updates

#### HR Dashboard (`app/hr-dashboard/`)
- **Converted to client component**: Now fetches data from NestJS backend
- **Updated `page.tsx`**: Uses `apiClient.getEvents()` for data fetching
- **Updated `components/EventForm.tsx`**: Uses `apiClient.createEvent()` and `apiClient.getEventItems()`
- **Updated `components/EventModal.tsx`**: Uses `apiClient.approveEvent()` and `apiClient.rejectEvent()`
- **Updated `components/EventTable.tsx`**: Added `onEventUpdate` callback for refresh

#### Vendor Dashboard (`app/vendor-dashboard/`)
- **Converted to client component**: Now fetches data from NestJS backend
- **Updated `page.tsx`**: Uses `apiClient.getEvents()` for data fetching
- Reuses EventTable and EventModal components from HR dashboard

### 4. Removed Files and Cleanup
The following directories were removed as they're no longer needed:
- `app/api/` - All API routes now handled by NestJS backend
  - `app/api/auth/` - Authentication
  - `app/api/events/` - Event operations
  - `app/api/event-items/` - Event items
  - `app/api/postal-code/` - Postal code lookup
  - `app/api/health/` - Health check (backend has its own)
- `lib/services/` - Business logic moved to NestJS backend
- `lib/repositories/` - Data access moved to NestJS backend
- `lib/db/` - Database connection no longer needed in frontend
- `lib/models/` - Mongoose models no longer needed in frontend
- `scripts/` - Seed script moved to backend

### 5. Removed Dependencies
The following npm packages were removed from `package.json`:
- `bcrypt` - Password hashing now on backend
- `jose` - JWT handling now on backend
- `jsonwebtoken` - JWT handling now on backend
- `mongoose` - Database access now on backend
- `@types/bcrypt` - No longer needed
- `@types/jsonwebtoken` - No longer needed
- `mongodb-memory-server` - Testing now on backend
- `fast-check` - Property testing now on backend
- `ts-jest` - No longer needed
- `tsx` - No longer needed
- `dotenv` - Environment variables handled by Next.js

### 6. Environment Configuration
Updated `.env` and `.env.example`:
```bash
# Old (removed):
MONGODB_URI=...
JWT_SECRET=...

# New:
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### 7. Tests
- **Created `lib/api/__tests__/client.test.ts`**: Integration tests for API client
  - Login flow
  - Token refresh
  - Error handling
  - All API operations

- **Created `app/hr-dashboard/__tests__/page.test.tsx`**: Component tests for HR Dashboard
- **Created `app/vendor-dashboard/__tests__/page.test.tsx`**: Component tests for Vendor Dashboard

## Running the Application

### Prerequisites
1. NestJS backend must be running on `http://localhost:3001`
2. MongoDB must be accessible to the backend

### Development
```bash
# Start the frontend
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Environment Variables
Make sure to set `NEXT_PUBLIC_API_URL` in your `.env` file:
- Development: `http://localhost:3001/api/v1`
- Production: `https://your-backend-domain.com/api/v1`

## API Client Usage

### Basic Example
```typescript
import { apiClient } from '@/lib/api';

// Login
const { user, accessToken } = await apiClient.login('username', 'password');

// Get events (automatically filtered by user role on backend)
const events = await apiClient.getEvents();

// Create event
const newEvent = await apiClient.createEvent({
  eventItemId: '123',
  proposedDates: ['2024-01-01', '2024-01-02', '2024-01-03'],
  location: { postalCode: '12345', streetName: 'Main St' }
});

// Approve event
await apiClient.approveEvent('eventId', '2024-01-01');

// Reject event
await apiClient.rejectEvent('eventId', 'Not available');
```

### Error Handling
```typescript
try {
  const events = await apiClient.getEvents();
} catch (error) {
  // Error message from backend
  console.error(error.message);
}
```

## Authentication Flow

1. User submits login form
2. Frontend calls `apiClient.login(username, password)`
3. Backend validates credentials and returns JWT tokens
4. Frontend stores tokens in localStorage
5. All subsequent requests include `Authorization: Bearer <token>` header
6. If token expires (401 response), frontend automatically refreshes using refresh token
7. If refresh fails, user is redirected to login page

## Key Benefits

1. **Separation of Concerns**: Frontend focuses on UI, backend handles business logic
2. **Type Safety**: TypeScript interfaces ensure type-safe API calls
3. **Automatic Token Management**: No manual token handling required
4. **Consistent Error Handling**: All API errors handled uniformly
5. **Scalability**: Frontend and backend can be deployed independently
6. **Security**: JWT tokens with automatic refresh, no session cookies
7. **Testability**: API client can be easily mocked for testing

## Migration Checklist

- [x] Create API client service
- [x] Update authentication flow
- [x] Update HR Dashboard
- [x] Update Vendor Dashboard
- [x] Remove Next.js API routes
- [x] Update environment configuration
- [x] Write integration tests for API client
- [x] Write component tests for dashboards

## Next Steps

1. Start the NestJS backend: `cd backend && npm run start:dev`
2. Start the frontend: `cd frontend && npm run dev`
3. Test the login flow with seeded users
4. Verify all dashboard functionality works
5. Run tests: `npm test`

## Troubleshooting

### "Network error" when logging in
- Ensure NestJS backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in `.env`

### "Session expired" errors
- Check that JWT tokens are being stored in localStorage
- Verify backend JWT configuration matches frontend expectations

### CORS errors
- Ensure backend CORS is configured to allow frontend origin
- Check backend `.env` has correct `FRONTEND_URL`

## Notes

- The frontend no longer needs MongoDB connection (handled by backend)
- JWT secrets are now only needed in the backend
- All data validation happens on the backend
- Role-based access control is enforced by backend guards
