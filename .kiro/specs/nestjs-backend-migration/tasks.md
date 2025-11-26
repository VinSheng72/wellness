# Implementation Plan

- [x] 1. Initialize NestJS backend project
  - Create new NestJS project in `backend/` directory using Nest CLI
  - Configure TypeScript with strict mode
  - Install dependencies: @nestjs/mongoose, mongoose, @nestjs/passport, passport, passport-jwt, bcrypt, class-validator, class-transformer, @nestjs/swagger, swagger-ui-express
  - Install dev dependencies: @nestjs/testing, supertest, fast-check, mongodb-memory-server
  - Set up project structure with modules folders
  - Create .env.example file with all required environment variables
  - _Requirements: 1.1, 1.5, 10.2, 10.4_

- [x] 2. Set up database connection and configuration
  - [x] 2.1 Create database module with Mongoose configuration
    - Implement DatabaseModule using MongooseModule.forRootAsync
    - Configure connection pooling and error handling
    - Add connection lifecycle logging
    - _Requirements: 4.1, 4.2_

  - [x] 2.2 Create configuration module
    - Implement ConfigModule with environment variable validation
    - Create configuration schema with required variables (DATABASE_URL, JWT_SECRET, etc.)
    - Add validation for missing required variables
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 2.3 Write property test for configuration validation
    - **Property: Configuration validation at startup**
    - **Validates: Requirements 10.2, 10.3**

- [x] 3. Implement Mongoose schemas and repositories
  - [x] 3.1 Create User schema and repository
    - Define User schema with @Schema decorator
    - Add password hashing pre-save hook
    - Create UserRepository with findByUsername, findById, create methods
    - _Requirements: 3.1, 4.3_

  - [x] 3.2 Create Company schema and repository
    - Define Company schema
    - Create CompanyRepository with findById method
    - _Requirements: 4.3_

  - [x] 3.3 Create Vendor schema and repository
    - Define Vendor schema
    - Create VendorRepository with findById method
    - _Requirements: 4.3_

  - [x] 3.4 Create EventItem schema and repository
    - Define EventItem schema with vendor reference
    - Add index on vendorId
    - Create EventItemRepository with findAll, findById methods
    - _Requirements: 4.3_

  - [x] 3.5 Create Event schema and repository
    - Define Event schema with all relationships and validation
    - Add custom validator for exactly 3 proposed dates
    - Add compound indexes on companyId+dateCreated and vendorId+dateCreated
    - Create EventRepository with create, findById, findByCompany, findByVendor, update methods
    - _Requirements: 4.3, 6.3_

  - [x] 3.6 Write unit tests for schemas and repositories
    - Test schema validation rules
    - Test repository CRUD operations
    - Test indexes are created correctly
    - _Requirements: 4.3_

- [x] 4. Implement authentication module
  - [x] 4.1 Create Auth module structure
    - Create AuthModule, AuthController, AuthService
    - Set up JWT module with configuration
    - _Requirements: 1.1, 3.1_

  - [x] 4.2 Implement JWT strategy
    - Create JwtStrategy extending PassportStrategy
    - Implement validate method to extract user from token payload
    - Configure JWT options (secret, expiration)
    - _Requirements: 3.2_

  - [x] 4.3 Implement AuthService
    - Implement login method with password validation
    - Implement generateTokens method (access + refresh tokens)
    - Implement refreshToken method
    - Implement logout method (optional token blacklisting)
    - _Requirements: 3.1, 3.5_

  - [x] 4.4 Create authentication DTOs
    - Create LoginDto with validation decorators
    - Create AuthResponseDto
    - Create RefreshTokenDto
    - Add Swagger API decorators
    - _Requirements: 6.1, 11.1_

  - [x] 4.5 Implement AuthController
    - Create POST /auth/login endpoint
    - Create POST /auth/refresh endpoint
    - Create POST /auth/logout endpoint
    - Add Swagger documentation
    - _Requirements: 3.1, 3.5_

  - [x] 4.6 Write unit tests for AuthService
    - Test login with valid credentials
    - Test login with invalid credentials
    - Test token generation
    - Test token refresh
    - _Requirements: 3.1, 3.5_

  - [x] 4.7 Write property test for authentication
    - **Property 4: Valid credentials return tokens**
    - **Property 8: Token refresh round-trip**
    - **Validates: Requirements 3.1, 3.5**

- [x] 5. Implement guards and decorators
  - [x] 5.1 Create JwtAuthGuard
    - Extend AuthGuard('jwt')
    - Implement custom error handling
    - _Requirements: 3.2, 3.3_

  - [x] 5.2 Create RolesGuard
    - Implement CanActivate interface
    - Check user role against required roles from metadata
    - _Requirements: 3.4_

  - [x] 5.3 Create custom decorators
    - Create @Roles decorator for role-based access control
    - Create @CurrentUser decorator to extract user from request
    - _Requirements: 3.4_

  - [x] 5.4 Write unit tests for guards
    - Test JwtAuthGuard with valid/invalid tokens
    - Test RolesGuard with different roles
    - _Requirements: 3.2, 3.3, 3.4_

  - [x] 5.5 Write property test for authorization
    - **Property 5: Token validation on authenticated requests**
    - **Property 6: Invalid token rejection**
    - **Property 7: Role-based access control**
    - **Validates: Requirements 3.2, 3.3, 3.4**

- [x] 6. Implement Events module
  - [x] 6.1 Create Events module structure
    - Create EventsModule, EventsController, EventsService
    - Import required dependencies (EventItemsModule, UsersModule)
    - _Requirements: 1.1, 5.1_

  - [x] 6.2 Implement EventsService
    - Implement create method with vendor assignment from event item
    - Implement findByCompany and findByVendor for data isolation
    - Implement findById method
    - Implement approve method with validation
    - Implement reject method with validation
    - Implement validateAccess method for authorization
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 6.3 Create event DTOs
    - Create CreateEventDto with validation (3 dates, location, event item)
    - Create ApproveEventDto with date validation
    - Create RejectEventDto with remarks validation
    - Create EventResponseDto
    - Add Swagger API decorators
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 6.4 Implement EventsController
    - Create GET /events endpoint with role-based filtering
    - Create GET /events/:id endpoint with access validation
    - Create POST /events endpoint (HR_ADMIN only)
    - Create POST /events/:id/approve endpoint (VENDOR_ADMIN only)
    - Create POST /events/:id/reject endpoint (VENDOR_ADMIN only)
    - Apply guards (@UseGuards(JwtAuthGuard, RolesGuard))
    - Add Swagger documentation
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 6.5 Write unit tests for EventsService
    - Test event creation with vendor assignment
    - Test data isolation for HR and Vendor
    - Test approval validation
    - Test rejection validation
    - Test access validation
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 6.6 Write property tests for event operations
    - **Property 10: Event creation with correct initial state**
    - **Property 11: Event data isolation by role**
    - **Property 12: Event approval updates state correctly**
    - **Property 13: Event rejection updates state correctly**
    - **Property 14: Event access authorization**
    - **Property 16: Three proposed dates validation**
    - **Property 17: Rejection remarks validation**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 6.3, 6.4**

- [x] 7. Implement supporting modules
  - [x] 7.1 Create EventItems module
    - Create EventItemsModule, EventItemsController, EventItemsService
    - Implement GET /event-items endpoint
    - Add Swagger documentation
    - _Requirements: 5.1_

  - [x] 7.2 Create Users module
    - Create UsersModule, UsersService
    - Implement findByUsername, findById methods
    - _Requirements: 3.1_

  - [x] 7.3 Create Companies module
    - Create CompaniesModule, CompaniesService
    - Implement findById method
    - _Requirements: 5.2_

  - [x] 7.4 Create Vendors module
    - Create VendorsModule, VendorsService
    - Implement findById method
    - _Requirements: 5.2_

  - [x] 7.5 Create Location module (optional)
    - Create LocationModule, LocationService
    - Implement postal code lookup (stub or external API integration)
    - Create GET /postal-code/:code endpoint
    - _Requirements: 8.1 (from original spec)_

  - [x] 7.6 Write unit tests for supporting modules
    - Test EventItemsService
    - Test UsersService
    - _Requirements: Various_

- [x] 8. Implement global filters and interceptors
  - [x] 8.1 Create global exception filter
    - Implement HttpExceptionFilter catching all exceptions
    - Format errors consistently with statusCode, timestamp, path, message
    - Log errors with stack traces
    - Handle validation errors specially
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 8.2 Create logging interceptor
    - Implement LoggingInterceptor to log all requests
    - Log method, path, timestamp, duration
    - _Requirements: 8.4_

  - [x] 8.3 Configure global validation pipe
    - Set up ValidationPipe globally in main.ts
    - Configure whitelist, forbidNonWhitelisted, transform options
    - _Requirements: 6.2, 6.5_

  - [x] 8.4 Write property tests for error handling
    - **Property 1: Successful requests return appropriate status codes**
    - **Property 2: Failed requests return appropriate error codes**
    - **Property 3: Response format consistency**
    - **Property 9: Database error handling**
    - **Property 15: Invalid data validation**
    - **Property 18: Consistent error formatting**
    - **Property 19: Unhandled exception handling**
    - **Property 20: Validation error structure**
    - **Validates: Requirements 2.2, 2.3, 2.4, 4.5, 6.2, 8.1, 8.2, 8.3**

- [x] 9. Implement health check module
  - [x] 9.1 Create Health module
    - Install @nestjs/terminus
    - Create HealthModule, HealthController
    - Implement GET /health endpoint
    - Add database health indicator
    - Include memory and uptime in response
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [x] 9.2 Write integration tests for health endpoint
    - Test health endpoint when database is connected
    - Test health endpoint response format
    - _Requirements: 13.1, 13.2, 13.3, 13.5_

- [x] 10. Configure CORS and Swagger
  - [x] 10.1 Configure CORS in main.ts
    - Enable CORS with frontend origin from environment
    - Allow credentials
    - Configure allowed methods
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 10.2 Set up Swagger documentation
    - Configure Swagger in main.ts
    - Set up /api/docs endpoint
    - Add bearer auth configuration
    - Ensure all DTOs and endpoints are documented
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 10.3 Write integration tests for CORS
    - Test CORS headers are present
    - Test OPTIONS preflight requests
    - _Requirements: 7.1, 7.2_

- [x] 11. Create database seed script
  - Create seed script for development data
  - Seed users (HR Admin and Vendor Admin)
  - Seed companies and vendors
  - Seed event items with vendor associations
  - Seed sample events
  - Document credentials in README
  - _Requirements: All (for testing)_

- [x] 12. Checkpoint - Ensure all backend tests pass
  - Run all unit tests
  - Run all integration tests
  - Run all property-based tests
  - Ensure all tests pass, ask the user if questions arise

- [x] 13. Migrate Next.js frontend to use NestJS backend
  - [x] 13.1 Create API client service
    - Create lib/api/client.ts with ApiClient class
    - Implement request method with token management
    - Implement automatic token refresh on 401
    - Implement all API methods (login, getEvents, createEvent, approveEvent, rejectEvent, getEventItems)
    - _Requirements: 9.1, 9.2_

  - [x] 13.2 Update authentication flow
    - Update login page to use apiClient.login
    - Store JWT tokens in localStorage
    - Update middleware to check for JWT token instead of session cookie
    - Implement token refresh logic
    - _Requirements: 9.2_

  - [x] 13.3 Update HR Dashboard
    - Replace server-side data fetching with apiClient.getEvents
    - Update EventForm to use apiClient.createEvent
    - Update EventModal to use apiClient for event details
    - Handle API errors and display error messages
    - _Requirements: 9.1, 9.3_

  - [x] 13.4 Update Vendor Dashboard
    - Replace server-side data fetching with apiClient.getEvents
    - Update EventModal to use apiClient.approveEvent and apiClient.rejectEvent
    - Handle API errors and display error messages
    - _Requirements: 9.1, 9.3_

  - [x] 13.5 Remove Next.js API routes
    - Delete app/api/auth directory
    - Delete app/api/events directory
    - Delete app/api/event-items directory
    - Delete app/api/postal-code directory
    - Remove lib/services directory (AuthService, EventService, LocationService)
    - Remove lib/repositories directory
    - _Requirements: 9.4_

  - [x] 13.6 Update environment configuration
    - Add NEXT_PUBLIC_API_URL to .env
    - Update .env.example
    - _Requirements: 10.2_

  - [x] 13.7 Write integration tests for API client
    - Test login flow
    - Test token refresh
    - Test API error handling
    - _Requirements: 9.2, 9.3_

  - [x] 13.8 Write component tests for updated dashboards
    - Test HR Dashboard with mocked API
    - Test Vendor Dashboard with mocked API
    - Test error display
    - _Requirements: 9.3, 9.5_

- [ ] 14. Create Docker configuration
  - [ ] 14.1 Create backend Dockerfile
    - Create multi-stage Dockerfile for NestJS backend
    - Optimize for production (minimal image size)
    - _Requirements: 14.1, 14.4_

  - [ ] 14.2 Create frontend Dockerfile
    - Create Dockerfile for Next.js frontend
    - Configure for production build
    - _Requirements: 14.1_

  - [ ] 14.3 Create docker-compose.yml
    - Configure services: mongodb, backend, frontend
    - Set up networking between services
    - Configure environment variables
    - Set up volumes for MongoDB data persistence
    - _Requirements: 14.2_

  - [ ] 14.4 Create docker-compose.dev.yml for development
    - Configure hot-reload for backend and frontend
    - Mount source code as volumes
    - _Requirements: 14.2_

- [ ] 15. Create deployment documentation
  - [ ] 15.1 Write backend deployment guide
    - Document environment variables
    - Document database setup
    - Document deployment to cloud platforms (AWS, GCP, Azure)
    - Include health check configuration
    - _Requirements: 14.5_

  - [ ] 15.2 Write frontend deployment guide
    - Document Vercel deployment
    - Document environment configuration
    - Document API URL configuration
    - _Requirements: 14.5_

  - [ ] 15.3 Create migration guide
    - Document step-by-step migration process
    - Document rollback strategy
    - Document testing procedures
    - _Requirements: All_

  - [ ] 15.4 Update main README
    - Document new architecture
    - Update setup instructions
    - Update development workflow
    - Document API documentation URL
    - _Requirements: All_

- [ ] 16. Final checkpoint - End-to-end testing
  - Start backend and frontend with docker-compose
  - Test complete user flows (login, create event, approve/reject)
  - Verify all functionality works end-to-end
  - Check Swagger documentation is accessible
  - Verify health check endpoint
  - Ensure all tests pass, ask the user if questions arise
