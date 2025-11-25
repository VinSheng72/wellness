# Design Document

## Overview

The Wellness Event Booking System is a full-stack web application built with Next.js 14+ (using App Router), TypeScript, and MongoDB. Next.js provides both the frontend React components and backend API routes in a unified framework, enabling server-side rendering (SSR), API routes, and optimized performance. The architecture follows a three-tier pattern with clear separation between presentation (React components), business logic (API routes and services), and data layers (MongoDB with Mongoose). The system implements role-based access control (RBAC) to support two distinct user types: HR Admins who create wellness event requests, and Vendor Admins who approve or reject these requests.

The application emphasizes scalability through database-driven configuration, multi-tenancy through data isolation, and maintainability through modular component design. Next.js features like server components, server actions, and middleware enable efficient data fetching and authentication.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Next.js Application                    │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Frontend (React Components)                 │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │ │
│  │  │Login Page│  │HR Dashbrd│  │Vendor Dashbrd│    │ │
│  │  └──────────┘  └──────────┘  └──────────────┘    │ │
│  │  ┌──────────────────────────────────────────┐    │ │
│  │  │      Event Modal Component                │    │ │
│  │  └──────────────────────────────────────────┘    │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
│                          │ Internal API Calls            │
│                          ▼                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Backend (API Routes)                        │ │
│  │  /api/auth  /api/events  /api/event-items         │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Business Logic Layer                        │ │
│  │  AuthService  EventService  LocationService        │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Data Access Layer (Repositories)            │ │
│  │  UserRepo  EventRepo  VendorRepo  CompanyRepo      │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Middleware                                  │ │
│  │  Authentication  Authorization  Error Handling     │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │ Mongoose ODM
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    MongoDB Database                      │
│  users  events  vendors  companies  eventItems          │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Framework**: Next.js 14+ with App Router and TypeScript
- **Frontend**: React 18+ Server and Client Components, Tailwind CSS for styling
- **Backend**: Next.js API Routes, NextAuth.js for authentication, bcrypt for password hashing
- **Database**: MongoDB with Mongoose ODM for schema validation and query building
- **State Management**: React Context API for client-side state, Server Components for server state
- **Deployment**: Vercel (optimized for Next.js) or Docker containers for other platforms

## Components and Interfaces

### Frontend Components (Next.js App Router Structure)

#### App Directory Structure
```
/app
  /login
    page.tsx          # Login page
  /hr-dashboard
    page.tsx          # HR Admin dashboard (protected route)
  /vendor-dashboard
    page.tsx          # Vendor Admin dashboard (protected route)
  /api
    /auth
      /login
        route.ts      # Login API endpoint
    /events
      route.ts        # Create event, list events
      /[id]
        route.ts      # Get, update single event
        /approve
          route.ts    # Approve event
        /reject
          route.ts    # Reject event
    /event-items
      route.ts        # List event items
    /postal-code
      /[code]
        route.ts      # Postal code lookup
  layout.tsx          # Root layout with auth provider
  middleware.ts       # Auth middleware for protected routes
```

#### 1. LoginPage (app/login/page.tsx)
- **Type**: Client Component
- **Purpose**: Authenticate users and route to appropriate dashboard
- **State**: username, password, error message, loading state
- **API Calls**: POST /api/auth/login
- **Navigation**: Uses Next.js router to redirect to /hr-dashboard or /vendor-dashboard based on user role

#### 2. HRDashboard (app/hr-dashboard/page.tsx)
- **Type**: Server Component with Client Components for interactivity
- **Purpose**: Display all events created by the HR Admin's company
- **Data Fetching**: Server-side fetch from database via service layer
- **Child Components**: EventTable (client), EventModal (client), EventForm (client)

#### 3. VendorDashboard (app/vendor-dashboard/page.tsx)
- **Type**: Server Component with Client Components for interactivity
- **Purpose**: Display events assigned to the Vendor Admin's vendor
- **Data Fetching**: Server-side fetch from database via service layer
- **Child Components**: EventTable (client), EventModal (client)

#### 4. EventTable Component
- **Type**: Client Component
- **Purpose**: Render tabular view of events with view buttons
- **Props**: events (array), onViewClick (callback), userRole (string)
- **State**: None (stateless presentation component)

#### 5. EventModal Component
- **Type**: Client Component
- **Purpose**: Display event details and provide action buttons for vendors
- **Props**: event (object), userRole (string), onClose (callback)
- **State**: selectedDate (for approval), rejectionRemarks (for rejection), action mode
- **API Calls**: POST /api/events/[id]/approve, POST /api/events/[id]/reject

#### 6. EventForm Component
- **Type**: Client Component
- **Purpose**: Allow HR Admins to create new wellness events
- **Props**: companyName (string), companyId (string)
- **State**: proposedDates (array of 3), location (object), selectedEventItem, postalCode
- **API Calls**: POST /api/events, GET /api/postal-code/[code] (for location lookup)

### Backend API Routes (Next.js API Routes)

#### Authentication Routes
- **POST /api/auth/login** (app/api/auth/login/route.ts)
  - Authenticate user and set HTTP-only session cookie
  - Request: `{ username: string, password: string }`
  - Response: `{ success: true, user: { id, username, role, companyId?, vendorId? } }`
  - Sets session cookie with JWT token

#### Event Routes
- **GET /api/events** (app/api/events/route.ts)
  - Retrieve events based on authenticated user's role and scope
  - Query params: Automatically filtered by middleware based on user session
  - Response: `{ events: Event[] }`

- **POST /api/events** (app/api/events/route.ts)
  - Create a new event request
  - Request: `{ eventItemId: string, proposedDates: string[], location: { postalCode: string, streetName: string } }`
  - Response: `{ event: Event }`
  - CompanyId extracted from authenticated user session

- **GET /api/events/[id]** (app/api/events/[id]/route.ts)
  - Retrieve a single event by ID (with authorization check)
  - Response: `{ event: Event }`

- **POST /api/events/[id]/approve** (app/api/events/[id]/approve/route.ts)
  - Approve an event with confirmed date
  - Request: `{ confirmedDate: string }`
  - Response: `{ event: Event }`
  - Requires Vendor Admin role

- **POST /api/events/[id]/reject** (app/api/events/[id]/reject/route.ts)
  - Reject an event with remarks
  - Request: `{ remarks: string }`
  - Response: `{ event: Event }`
  - Requires Vendor Admin role

#### Supporting Routes
- **GET /api/event-items** (app/api/event-items/route.ts)
  - Retrieve all available event items
  - Response: `{ eventItems: EventItem[] }`

- **GET /api/postal-code/[code]** (app/api/postal-code/[code]/route.ts)
  - Lookup street name by postal code
  - Response: `{ streetName: string | null }`

### Service Layer Interfaces

#### AuthService (lib/services/authService.ts)
```typescript
interface AuthService {
  login(username: string, password: string): Promise<{ user: User }>;
  verifySession(token: string): Promise<User | null>;
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
  createSessionToken(user: User): string;
}
```

#### EventService (lib/services/eventService.ts)
```typescript
interface EventService {
  createEvent(eventData: CreateEventDTO, companyId: string): Promise<Event>;
  getEventsByCompany(companyId: string): Promise<Event[]>;
  getEventsByVendor(vendorId: string): Promise<Event[]>;
  approveEvent(eventId: string, confirmedDate: Date, vendorId: string): Promise<Event>;
  rejectEvent(eventId: string, remarks: string, vendorId: string): Promise<Event>;
  getEventById(eventId: string): Promise<Event>;
  validateEventAccess(eventId: string, userId: string, role: string): Promise<boolean>;
}
```

#### LocationService (lib/services/locationService.ts)
```typescript
interface LocationService {
  lookupPostalCode(postalCode: string): Promise<{ streetName: string } | null>;
}
```

### Middleware

#### Authentication Middleware (middleware.ts)
```typescript
// Protects routes and validates session
export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  
  // Verify token and extract user info
  // Redirect to /login if invalid
  // Add user info to request headers for API routes
}

export const config = {
  matcher: ['/hr-dashboard/:path*', '/vendor-dashboard/:path*', '/api/events/:path*']
};
```

## Data Models

### User Model
```typescript
interface User {
  _id: ObjectId;
  username: string;
  password: string; // hashed
  role: 'HR_ADMIN' | 'VENDOR_ADMIN';
  companyId?: ObjectId; // for HR_ADMIN
  vendorId?: ObjectId; // for VENDOR_ADMIN
  createdAt: Date;
}
```

### Company Model
```typescript
interface Company {
  _id: ObjectId;
  name: string;
  createdAt: Date;
}
```

### Vendor Model
```typescript
interface Vendor {
  _id: ObjectId;
  name: string;
  contactEmail: string;
  createdAt: Date;
}
```

### EventItem Model
```typescript
interface EventItem {
  _id: ObjectId;
  name: string; // e.g., "Health Talk", "Onsite Screening"
  vendorId: ObjectId; // reference to Vendor
  description?: string;
  createdAt: Date;
}
```

### Event Model
```typescript
interface Event {
  _id: ObjectId;
  companyId: ObjectId; // reference to Company
  eventItemId: ObjectId; // reference to EventItem
  vendorId: ObjectId; // derived from EventItem, denormalized for query performance
  proposedDates: Date[]; // array of exactly 3 dates
  location: {
    postalCode: string;
    streetName: string;
  };
  status: 'Pending' | 'Approved' | 'Rejected';
  confirmedDate?: Date; // set when approved
  remarks?: string; // set when rejected
  dateCreated: Date;
  lastModified: Date;
}
```

### MongoDB Indexes
- **users**: Index on `username` (unique)
- **events**: Compound index on `companyId` and `dateCreated`, compound index on `vendorId` and `dateCreated`
- **eventItems**: Index on `vendorId`


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Role-based authentication routing
*For any* valid user with valid credentials, authenticating should redirect them to the dashboard corresponding to their role (HR Admin → HR dashboard, Vendor Admin → Vendor dashboard)
**Validates: Requirements 1.1**

### Property 2: Invalid credentials rejection
*For any* invalid username or password combination, the authentication attempt should be rejected with an error message and no dashboard access granted
**Validates: Requirements 1.2**

### Property 3: Company name auto-population
*For any* HR Admin user accessing the event creation interface, the company name field should be automatically populated with the company associated with that user's account
**Validates: Requirements 2.1**

### Property 4: Three proposed dates requirement
*For any* event submission, the system should accept it only if exactly three proposed dates are provided, and reject submissions with fewer or more dates
**Validates: Requirements 2.2**

### Property 5: Location requirement validation
*For any* event submission without a location, the system should reject the submission and require location to be provided
**Validates: Requirements 2.3**

### Property 6: Event item requirement validation
*For any* event submission without a selected event item, the system should reject the submission and require an event item to be selected
**Validates: Requirements 2.4**

### Property 7: Initial event state correctness
*For any* successfully created event, the event should have status set to "Pending" and the dateCreated field should be set to the current timestamp
**Validates: Requirements 2.5**

### Property 8: Vendor assignment from event item
*For any* event created with a specific event item, the event should be assigned to the vendor associated with that event item
**Validates: Requirements 2.6**

### Property 9: HR Admin data isolation
*For any* HR Admin user, accessing their dashboard should return only events where the event's companyId matches the user's associated company, and no events from other companies
**Validates: Requirements 3.1, 7.5, 9.1, 9.4**

### Property 10: Event table rendering completeness
*For any* event displayed in a dashboard table, the rendered row should contain the event name, vendor name, date information (confirmed date if approved, otherwise proposed dates), status, date created, and a view button
**Validates: Requirements 3.2, 4.2**

### Property 11: Event modal display
*For any* event, when the view button is clicked, a modal should be displayed containing all event information fields (company name, event item, proposed dates, location, status, date created, and conditional fields like confirmed date or remarks)
**Validates: Requirements 3.5, 4.5**

### Property 12: Vendor Admin data isolation
*For any* Vendor Admin user, accessing their dashboard should return only events where the event's vendorId matches the user's associated vendor, and no events from other vendors
**Validates: Requirements 4.1, 7.5, 9.2, 9.4**

### Property 13: Event approval updates state correctly
*For any* pending event and any one of its three proposed dates, when a Vendor Admin approves the event with that date, the event status should be updated to "Approved" and the confirmedDate should be set to the selected date
**Validates: Requirements 5.3, 5.4**

### Property 14: Event rejection with remarks
*For any* pending event and any non-empty remarks text, when a Vendor Admin rejects the event with those remarks, the event status should be updated to "Rejected" and the remarks should be stored
**Validates: Requirements 6.2, 6.4**

### Property 15: Rejection remarks validation
*For any* rejection attempt with empty or whitespace-only remarks, the system should prevent the rejection and require valid remarks to be entered
**Validates: Requirements 6.3**

### Property 16: Event persistence round-trip
*For any* valid event data, creating an event and then retrieving it by ID should return an event with all the same field values
**Validates: Requirements 7.1**

### Property 17: Status change persistence
*For any* event status transition (Pending → Approved or Pending → Rejected), retrieving the event after the status change should reflect the new status in the database
**Validates: Requirements 7.2**

### Property 18: Dashboard data freshness
*For any* user accessing their dashboard, the events displayed should match the current state of events in the database for that user's scope (company or vendor)
**Validates: Requirements 7.3**

### Property 19: Postal code lookup integration
*For any* valid postal code entered in the location field, if the lookup service returns a street name, both the postal code and street name should be stored in the event's location object
**Validates: Requirements 8.1, 8.3**

### Property 20: Event item dropdown population
*For any* set of event items stored in the database, all event items should appear as options in the event creation dropdown
**Validates: Requirements 10.2**

## Error Handling

### Authentication Errors
- **Invalid Credentials**: Return 401 Unauthorized with message "Invalid username or password"
- **Expired Token**: Return 401 Unauthorized with message "Session expired, please login again"
- **Missing Token**: Return 401 Unauthorized with message "Authentication required"

### Validation Errors
- **Missing Required Fields**: Return 400 Bad Request with specific field names that are missing
- **Invalid Date Format**: Return 400 Bad Request with message "Invalid date format, expected ISO 8601"
- **Incorrect Number of Proposed Dates**: Return 400 Bad Request with message "Exactly 3 proposed dates required"
- **Empty Rejection Remarks**: Return 400 Bad Request with message "Rejection remarks cannot be empty"

### Authorization Errors
- **Unauthorized Event Access**: Return 403 Forbidden when user attempts to access event outside their scope
- **Invalid Role Action**: Return 403 Forbidden when HR Admin attempts vendor actions or vice versa

### Database Errors
- **Connection Failure**: Return 503 Service Unavailable with message "Database connection failed"
- **Document Not Found**: Return 404 Not Found with message "Event not found"
- **Duplicate Key**: Return 409 Conflict with message indicating which field has duplicate value

### External Service Errors
- **Postal Code Lookup Failure**: Log error but allow event creation to proceed with manual location entry
- **Timeout**: Return 504 Gateway Timeout for requests exceeding 30 seconds

### Error Response Format
All error responses follow consistent JSON structure:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional context
  }
}
```

## Testing Strategy

### Unit Testing Approach

Unit tests will verify specific examples, edge cases, and integration points:

**Frontend Unit Tests (Jest + React Testing Library)**:
- Component rendering with various props
- User interaction handlers (button clicks, form submissions)
- Conditional rendering based on user role and event status
- Form validation logic
- API error handling and display

**Backend Unit Tests (Jest + Supertest)**:
- API endpoint request/response handling
- Service layer business logic with mocked repositories
- Input validation and sanitization
- JWT token generation and verification
- Password hashing and comparison

**Key Unit Test Examples**:
- Login with specific valid credentials returns correct token
- Event creation with missing location returns 400 error
- Vendor Admin cannot access HR Admin endpoints
- Event modal displays "Approved" status correctly
- Empty rejection remarks trigger validation error

### Property-Based Testing Approach

Property-based tests will verify universal properties across all inputs using **fast-check** library for JavaScript/TypeScript. Each test will run a minimum of 100 iterations with randomly generated inputs.

**Property Test Configuration**:
```typescript
import fc from 'fast-check';

// Configure to run 100+ iterations per property
fc.assert(
  fc.property(/* arbitraries */, /* predicate */),
  { numRuns: 100 }
);
```

**Property Test Tagging Convention**:
Each property-based test must include a comment tag referencing the design document:
```typescript
// Feature: wellness-event-booking, Property 1: Role-based authentication routing
test('authentication redirects to correct dashboard based on role', () => {
  // test implementation
});
```

**Generators (Arbitraries)**:
- **User Generator**: Creates random users with valid roles, credentials, and associations
- **Event Generator**: Creates random events with 3 proposed dates, valid locations, and status
- **Date Generator**: Creates random valid dates (past, present, future)
- **Company/Vendor Generator**: Creates random organizations with valid IDs
- **Postal Code Generator**: Creates valid postal code formats
- **Remarks Generator**: Creates random text including edge cases (empty, whitespace, very long)

**Property Test Coverage**:
- Authentication and authorization across all user types
- Event creation validation with various input combinations
- Data isolation for both HR and Vendor dashboards
- Event approval/rejection workflows with all possible states
- Database persistence and retrieval consistency
- UI rendering with different event states and user roles

**Integration with CI/CD**:
- Property tests run on every commit
- Failed property tests report the minimal failing example for debugging
- Seed values logged for reproducibility

### Test Organization

```
/tests
  /unit
    /frontend
      /components
        LoginPage.test.tsx
        HRDashboard.test.tsx
        VendorDashboard.test.tsx
        EventModal.test.tsx
    /backend
      /services
        AuthService.test.ts
        EventService.test.ts
      /routes
        auth.test.ts
        events.test.ts
  /property
    auth.property.test.ts
    events.property.test.ts
    dataIsolation.property.test.ts
    validation.property.test.ts
```

### Testing Tools
- **Jest**: Test runner and assertion library
- **React Testing Library**: Frontend component testing
- **Next.js Test Utilities**: Testing API routes and server components
- **fast-check**: Property-based testing library
- **MongoDB Memory Server**: In-memory database for testing
- **Playwright** (optional): End-to-end testing for full user flows
