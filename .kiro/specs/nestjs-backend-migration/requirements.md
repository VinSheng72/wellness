# Requirements Document

## Introduction

This document specifies the requirements for migrating the Wellness Event Booking System from a Next.js monolithic architecture to a dedicated NestJS backend with a separate Next.js frontend. The migration will separate concerns, improve scalability, enable independent deployment of frontend and backend services, and provide a more robust API architecture using NestJS's modular structure, dependency injection, and built-in features.

## Glossary

- **System**: The Wellness Event Booking Web Application
- **NestJS Backend**: A standalone Node.js backend service built with NestJS framework handling all business logic, data access, and API endpoints
- **Next.js Frontend**: A standalone Next.js application serving only the user interface and making HTTP requests to the NestJS backend
- **API Gateway**: The NestJS application entry point that handles all HTTP requests from the frontend
- **Module**: A NestJS organizational unit that encapsulates related controllers, services, and providers
- **Controller**: A NestJS class that handles incoming HTTP requests and returns responses
- **Service**: A NestJS class that contains business logic and is injected into controllers
- **Guard**: A NestJS class that determines whether a request should be handled by the route handler (used for authentication/authorization)
- **DTO**: Data Transfer Object - a class that defines the shape of data for API requests and responses
- **Middleware**: Functions that execute before route handlers in the request-response cycle
- **JWT Token**: JSON Web Token used for stateless authentication between frontend and backend
- **CORS**: Cross-Origin Resource Sharing configuration allowing the frontend to communicate with the backend

## Requirements

### Requirement 1: NestJS Backend Architecture

**User Story:** As a developer, I want a well-structured NestJS backend with modular architecture, so that the codebase is maintainable, testable, and scalable.

#### Acceptance Criteria

1. THE System SHALL organize backend code into NestJS modules for Auth, Events, Users, Companies, Vendors, and EventItems
2. WHEN the backend application starts THEN the System SHALL initialize all modules and establish database connections
3. THE System SHALL use dependency injection for all services, repositories, and external dependencies
4. THE System SHALL implement a layered architecture with Controllers, Services, and Repositories
5. THE System SHALL use TypeScript with strict type checking enabled

### Requirement 2: RESTful API Design

**User Story:** As a frontend developer, I want a well-designed RESTful API with clear endpoints and consistent response formats, so that I can easily integrate the frontend with the backend.

#### Acceptance Criteria

1. THE System SHALL expose RESTful API endpoints following REST conventions (GET, POST, PUT, PATCH, DELETE)
2. WHEN API requests are successful THEN the System SHALL return responses with appropriate HTTP status codes (200, 201, 204)
3. WHEN API requests fail THEN the System SHALL return error responses with appropriate HTTP status codes (400, 401, 403, 404, 500) and descriptive error messages
4. THE System SHALL use consistent JSON response format for all endpoints
5. THE System SHALL version the API using URL path versioning (e.g., /api/v1/)

### Requirement 3: Authentication and Authorization

**User Story:** As a user, I want secure authentication using JWT tokens, so that my session is maintained across requests and my data is protected.

#### Acceptance Criteria

1. WHEN a user submits valid credentials to the login endpoint THEN the System SHALL return a JWT access token and refresh token
2. WHEN a user makes authenticated requests THEN the System SHALL validate the JWT token from the Authorization header
3. WHEN a JWT token is invalid or expired THEN the System SHALL return 401 Unauthorized
4. THE System SHALL implement role-based guards to protect endpoints based on user roles (HR_ADMIN, VENDOR_ADMIN)
5. WHEN a user requests a token refresh THEN the System SHALL validate the refresh token and issue a new access token

### Requirement 4: Database Integration

**User Story:** As a developer, I want MongoDB integration using Mongoose with NestJS, so that data persistence is handled efficiently with proper schema validation.

#### Acceptance Criteria

1. THE System SHALL connect to MongoDB using Mongoose ODM through NestJS MongooseModule
2. WHEN the application starts THEN the System SHALL establish database connection with connection pooling
3. THE System SHALL define Mongoose schemas for all data models (User, Company, Vendor, EventItem, Event)
4. THE System SHALL use repository pattern for data access operations
5. WHEN database operations fail THEN the System SHALL handle errors gracefully and return appropriate error responses

### Requirement 5: Event Management API

**User Story:** As a frontend application, I want comprehensive event management endpoints, so that users can create, view, approve, and reject wellness events.

#### Acceptance Criteria

1. WHEN an authenticated HR Admin sends a POST request to create an event THEN the System SHALL validate the request, create the event with Pending status, and return the created event
2. WHEN an authenticated user sends a GET request for events THEN the System SHALL return events filtered by the user's role and organization (company for HR, vendor for Vendor Admin)
3. WHEN an authenticated Vendor Admin sends a POST request to approve an event THEN the System SHALL update the event status to Approved, set the confirmed date, and return the updated event
4. WHEN an authenticated Vendor Admin sends a POST request to reject an event THEN the System SHALL update the event status to Rejected, store the remarks, and return the updated event
5. WHEN a user requests a single event by ID THEN the System SHALL validate access permissions and return the event details

### Requirement 6: Input Validation and DTOs

**User Story:** As a developer, I want automatic request validation using DTOs and class-validator, so that invalid data is rejected before reaching business logic.

#### Acceptance Criteria

1. THE System SHALL define DTOs for all API request bodies using class-validator decorators
2. WHEN a request contains invalid data THEN the System SHALL return 400 Bad Request with detailed validation error messages
3. WHEN creating an event THEN the System SHALL validate that exactly three proposed dates are provided
4. WHEN rejecting an event THEN the System SHALL validate that remarks are not empty
5. THE System SHALL use ValidationPipe globally to automatically validate all incoming requests

### Requirement 7: CORS Configuration

**User Story:** As a frontend application running on a different origin, I want CORS properly configured, so that I can make API requests to the backend without browser restrictions.

#### Acceptance Criteria

1. THE System SHALL enable CORS for the frontend application origin
2. WHEN the frontend makes preflight OPTIONS requests THEN the System SHALL respond with appropriate CORS headers
3. THE System SHALL allow credentials (cookies, authorization headers) in cross-origin requests
4. THE System SHALL configure allowed HTTP methods (GET, POST, PUT, PATCH, DELETE, OPTIONS)
5. THE System SHALL be configurable via environment variables for different deployment environments

### Requirement 8: Error Handling and Logging

**User Story:** As a developer, I want centralized error handling and logging, so that errors are consistently formatted and system behavior can be monitored.

#### Acceptance Criteria

1. THE System SHALL implement a global exception filter to catch and format all errors
2. WHEN an unhandled exception occurs THEN the System SHALL log the error details and return a generic 500 error response to the client
3. WHEN validation errors occur THEN the System SHALL return structured error messages indicating which fields failed validation
4. THE System SHALL log all incoming requests with method, path, and timestamp
5. THE System SHALL use NestJS Logger for consistent logging across the application

### Requirement 9: Frontend Migration

**User Story:** As a user, I want the frontend to continue working seamlessly, so that the migration to a separate backend is transparent to me.

#### Acceptance Criteria

1. THE System SHALL update the Next.js frontend to make HTTP requests to the NestJS backend API
2. WHEN a user logs in THEN the frontend SHALL store the JWT token and include it in subsequent API requests
3. WHEN API requests fail THEN the frontend SHALL display appropriate error messages to the user
4. THE System SHALL remove all API route handlers from the Next.js application
5. THE System SHALL maintain all existing frontend functionality (dashboards, forms, modals, navigation)

### Requirement 10: Environment Configuration

**User Story:** As a DevOps engineer, I want environment-based configuration, so that the application can be deployed to different environments without code changes.

#### Acceptance Criteria

1. THE System SHALL use NestJS ConfigModule to load environment variables
2. THE System SHALL require configuration for database connection string, JWT secrets, CORS origins, and port number
3. WHEN required environment variables are missing THEN the System SHALL fail to start and log descriptive error messages
4. THE System SHALL provide example environment files for development and production
5. THE System SHALL validate environment variables at application startup

### Requirement 11: API Documentation

**User Story:** As a frontend developer, I want automatically generated API documentation, so that I can understand available endpoints, request formats, and response structures.

#### Acceptance Criteria

1. THE System SHALL integrate Swagger/OpenAPI documentation using NestJS Swagger module
2. WHEN the backend is running THEN the System SHALL serve interactive API documentation at /api/docs endpoint
3. THE System SHALL automatically generate documentation from DTOs, controllers, and decorators
4. THE System SHALL document all endpoints with descriptions, request bodies, response types, and authentication requirements
5. THE System SHALL include example requests and responses in the documentation

### Requirement 12: Testing Infrastructure

**User Story:** As a developer, I want comprehensive testing infrastructure for the NestJS backend, so that I can ensure code quality and catch bugs early.

#### Acceptance Criteria

1. THE System SHALL support unit testing for services using Jest
2. THE System SHALL support integration testing for controllers and API endpoints
3. THE System SHALL support property-based testing using fast-check for critical business logic
4. THE System SHALL use in-memory MongoDB for testing to avoid external dependencies
5. WHEN tests run THEN the System SHALL provide code coverage reports

### Requirement 13: Health Check and Monitoring

**User Story:** As a DevOps engineer, I want health check endpoints, so that I can monitor the application status and database connectivity.

#### Acceptance Criteria

1. THE System SHALL expose a GET /health endpoint that returns application health status
2. WHEN the health endpoint is called THEN the System SHALL check database connectivity
3. WHEN the application is healthy THEN the System SHALL return 200 OK with status details
4. WHEN the database is unreachable THEN the System SHALL return 503 Service Unavailable
5. THE System SHALL include memory usage and uptime in health check response

### Requirement 14: Deployment and Containerization

**User Story:** As a DevOps engineer, I want Docker support for the NestJS backend, so that it can be deployed consistently across environments.

#### Acceptance Criteria

1. THE System SHALL provide a Dockerfile for building the NestJS backend container
2. THE System SHALL provide docker-compose configuration for running backend with MongoDB
3. WHEN the container starts THEN the System SHALL run database migrations if needed
4. THE System SHALL use multi-stage Docker builds to optimize image size
5. THE System SHALL document deployment procedures for cloud platforms (AWS, GCP, Azure)
