# Implementation Plan

- [x] 1. Initialize Next.js project and configure dependencies
  - Create Next.js 14+ project with TypeScript and App Router
  - Install dependencies: mongoose, bcrypt, jsonwebtoken, tailwindcss, fast-check
  - Configure TypeScript with strict mode
  - Set up Tailwind CSS configuration
  - Create environment variables template (.env.example)
  - _Requirements: All_

- [x] 2. Set up MongoDB connection and base configuration
  - Create database connection utility with connection pooling
  - Configure Mongoose connection with error handling
  - Set up database connection lifecycle management
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 3. Implement data models with Mongoose schemas
  - [x] 3.1 Create User model with validation
    - Define User schema with username, password, role, companyId, vendorId fields
    - Add unique index on username
    - Implement password hashing pre-save hook
    - _Requirements: 1.1, 1.2_
  
  - [x] 3.2 Create Company model
    - Define Company schema with name and timestamps
    - _Requirements: 2.1, 3.1_
  
  - [x] 3.3 Create Vendor model
    - Define Vendor schema with name, contactEmail, and timestamps
    - _Requirements: 4.1, 4.2_
  
  - [x] 3.4 Create EventItem model with vendor relationship
    - Define EventItem schema with name, vendorId reference, description
    - Add index on vendorId for query performance
    - _Requirements: 2.4, 2.6, 10.2, 10.3_
  
  - [x] 3.5 Create Event model with all relationships
    - Define Event schema with companyId, eventItemId, vendorId, proposedDates array, location object, status enum, confirmedDate, remarks, timestamps
    - Add compound indexes on companyId+dateCreated and vendorId+dateCreated
    - Add validation for exactly 3 proposed dates
    - _Requirements: 2.2, 2.3, 2.5, 7.1_

- [x] 3.6 Write property test for event model validation
  - **Property 4: Three proposed dates requirement**
  - **Property 5: Location requirement validation**
  - **Property 6: Event item requirement validation**
  - **Validates: Requirements 2.2, 2.3, 2.4**

- [x] 4. Implement repository layer for data access
  - [x] 4.1 Create UserRepository with CRUD operations
    - Implement findByUsername, findById, create methods
    - _Requirements: 1.1, 1.2_
  
  - [x] 4.2 Create EventRepository with query methods
    - Implement create, findById, findByCompany, findByVendor, update methods
    - Ensure queries enforce data isolation
    - _Requirements: 7.1, 7.2, 7.3, 9.1, 9.2_
  
  - [x] 4.3 Create EventItemRepository
    - Implement findAll, findByVendor methods
    - _Requirements: 10.2_
  
  - [x] 4.4 Create CompanyRepository and VendorRepository
    - Implement basic findById methods
    - _Requirements: 2.1, 4.1_

- [x] 4.5 Write property test for data isolation
  - **Property 9: HR Admin data isolation**
  - **Property 12: Vendor Admin data isolation**
  - **Validates: Requirements 3.1, 4.1, 7.5, 9.1, 9.2, 9.4**

- [x] 5. Implement service layer business logic
  - [x] 5.1 Create AuthService
    - Implement login method with password comparison
    - Implement createSessionToken with JWT
    - Implement verifySession for token validation
    - Implement password hashing utilities
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 5.2 Create EventService
    - Implement createEvent with vendor assignment from event item
    - Implement getEventsByCompany and getEventsByVendor
    - Implement approveEvent with status and confirmed date update
    - Implement rejectEvent with status and remarks update
    - Implement validateEventAccess for authorization
    - _Requirements: 2.5, 2.6, 3.1, 4.1, 5.3, 6.2, 7.2_
  
  - [x] 5.3 Create LocationService with postal code lookup
    - Implement lookupPostalCode method (stub or integrate with external API)
    - Handle lookup failures gracefully
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 5.4 Write property tests for authentication
  - **Property 1: Role-based authentication routing**
  - **Property 2: Invalid credentials rejection**
  - **Validates: Requirements 1.1, 1.2**

- [x] 5.5 Write property tests for event operations
  - **Property 7: Initial event state correctness**
  - **Property 8: Vendor assignment from event item**
  - **Property 13: Event approval updates state correctly**
  - **Property 14: Event rejection with remarks**
  - **Property 15: Rejection remarks validation**
  - **Validates: Requirements 2.5, 2.6, 5.3, 5.4, 6.2, 6.3, 6.4**

- [x] 6. Create authentication middleware
  - Implement middleware.ts to protect routes
  - Extract and verify session token from cookies
  - Add user information to request headers for API routes
  - Redirect unauthenticated users to login page
  - Configure matcher for protected routes
  - _Requirements: 1.1, 1.3_

- [x] 7. Implement API routes for authentication
  - [x] 7.1 Create POST /api/auth/login route
    - Validate request body
    - Call AuthService.login
    - Set HTTP-only session cookie
    - Return user information
    - Handle authentication errors
    - _Requirements: 1.1, 1.2_

- [x] 7.2 Write unit tests for login API route
  - Test successful login with valid credentials
  - Test failed login with invalid credentials
  - Test cookie setting
  - _Requirements: 1.1, 1.2_

- [x] 8. Implement API routes for events
  - [x] 8.1 Create GET /api/events route
    - Extract user info from middleware headers
    - Route to appropriate service method based on role
    - Return filtered events list
    - _Requirements: 3.1, 4.1, 7.3_
  
  - [x] 8.2 Create POST /api/events route
    - Validate request body (3 dates, location, event item)
    - Extract companyId from authenticated user
    - Call EventService.createEvent
    - Return created event
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [x] 8.3 Create GET /api/events/[id] route
    - Validate event access for authenticated user
    - Return event details
    - _Requirements: 3.5, 4.5_
  
  - [x] 8.4 Create POST /api/events/[id]/approve route
    - Validate user is Vendor Admin
    - Validate event belongs to vendor
    - Validate confirmed date is one of proposed dates
    - Call EventService.approveEvent
    - Return updated event
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [x] 8.5 Create POST /api/events/[id]/reject route
    - Validate user is Vendor Admin
    - Validate event belongs to vendor
    - Validate remarks are not empty
    - Call EventService.rejectEvent
    - Return updated event
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 8.6 Write property tests for event API routes
  - **Property 16: Event persistence round-trip**
  - **Property 17: Status change persistence**
  - **Property 18: Dashboard data freshness**
  - **Validates: Requirements 7.1, 7.2, 7.3**

- [x] 9. Implement supporting API routes
  - [x] 9.1 Create GET /api/event-items route
    - Fetch all event items from database
    - Return event items with vendor information
    - _Requirements: 10.2, 10.3_
  
  - [x] 9.2 Create GET /api/postal-code/[code] route
    - Call LocationService.lookupPostalCode
    - Return street name or null
    - Handle external API errors gracefully
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 9.3 Write property test for postal code lookup
  - **Property 19: Postal code lookup integration**
  - **Validates: Requirements 8.1, 8.3**

- [x] 9.4 Write property test for event item dropdown
  - **Property 20: Event item dropdown population**
  - **Validates: Requirements 10.2**

- [x] 10. Create login page component
  - Create app/login/page.tsx as client component
  - Implement login form with username and password fields
  - Handle form submission and call /api/auth/login
  - Display error messages for failed authentication
  - Redirect to appropriate dashboard on success based on user role
  - Style with Tailwind CSS
  - _Requirements: 1.1, 1.2_

- [x] 10.1 Write unit tests for login page
  - Test form rendering
  - Test form submission
  - Test error display
  - Test successful redirect
  - _Requirements: 1.1, 1.2_

- [x] 11. Create HR Admin dashboard
  - [x] 11.1 Create app/hr-dashboard/page.tsx as server component
    - Fetch events for authenticated user's company
    - Pass events to client components
    - _Requirements: 3.1, 3.2_
  
  - [x] 11.2 Create EventTable client component
    - Display events in table format with all required columns
    - Show confirmed date if available, otherwise proposed dates
    - Include view button for each event
    - Style with Tailwind CSS
    - _Requirements: 3.2, 3.3, 3.4_
  
  - [x] 11.3 Create EventForm client component for HR
    - Auto-populate company name from user session
    - Implement three date pickers for proposed dates
    - Implement location input with postal code lookup
    - Implement event item dropdown
    - Validate all required fields
    - Submit to POST /api/events
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 8.1_
  
  - [x] 11.4 Create EventModal client component for HR view
    - Display all event information
    - Show status, dates, location, vendor, remarks if rejected
    - No action buttons for HR role
    - _Requirements: 3.5_

- [x] 11.5 Write property tests for HR dashboard rendering
  - **Property 3: Company name auto-population**
  - **Property 10: Event table rendering completeness**
  - **Property 11: Event modal display**
  - **Validates: Requirements 2.1, 3.2, 3.5, 4.2, 4.5**

- [x] 12. Create Vendor Admin dashboard
  - [x] 12.1 Create app/vendor-dashboard/page.tsx as server component
    - Fetch events for authenticated user's vendor
    - Pass events to client components
    - _Requirements: 4.1, 4.2_
  
  - [x] 12.2 Reuse EventTable component with vendor-specific data
    - Pass vendor events to EventTable
    - _Requirements: 4.2, 4.3, 4.4_
  
  - [x] 12.3 Create EventModal client component for Vendor actions
    - Display all event information
    - Show Approve and Reject buttons for Pending events
    - Implement date selection for approval
    - Implement remarks input for rejection
    - Call appropriate API endpoints
    - Disable buttons for non-Pending events
    - _Requirements: 4.5, 5.1, 5.2, 5.3, 6.1, 6.2_

- [x] 12.4 Write unit tests for vendor dashboard interactions
  - Test approve button click and date selection
  - Test reject button click and remarks input
  - Test button visibility based on event status
  - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.2_

- [x] 13. Create root layout and navigation
  - Create app/layout.tsx with authentication provider
  - Add navigation header with logout functionality
  - Configure metadata and fonts
  - _Requirements: 1.3_

- [x] 14. Create database seed script
  - Create script to populate initial users (HR and Vendor admins)
  - Create sample companies and vendors
  - Create sample event items with vendor associations
  - Document credentials in README
  - _Requirements: All (for testing)_

- [x] 15. Add error handling and loading states
  - Implement error boundaries for React components
  - Add loading skeletons for async operations
  - Implement toast notifications for user feedback
  - Add form validation error messages
  - _Requirements: All_

- [ ] 16. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise

- [ ] 17. Create deployment configuration
  - Create Dockerfile for containerization
  - Configure environment variables for production
  - Create deployment documentation
  - Set up Vercel configuration (vercel.json) for easy deployment
  - _Requirements: All_

- [ ] 17.1 Write deployment documentation
  - Document environment variables
  - Document database setup
  - Document seed data process
  - Include demo credentials
